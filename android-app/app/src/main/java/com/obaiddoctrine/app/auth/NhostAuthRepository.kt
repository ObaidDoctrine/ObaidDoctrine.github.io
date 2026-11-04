package com.obaiddoctrine.app.auth

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.security.KeyStore
import java.security.MessageDigest
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Native Nhost email/password client.
 * Session tokens and pending PKCE verifier are encrypted with an Android Keystore AES-GCM key.
 * Passwords are never persisted.
 */
class NhostAuthRepository(context: Context) {
    private val tokenStore = SecureSessionStore(context.applicationContext)

    data class User(val id: String, val email: String, val displayName: String)
    data class Session(val accessToken: String, val refreshToken: String, val refreshTokenId: String, val user: User)

    suspend fun signIn(email: String, password: String): Session = withContext(Dispatchers.IO) {
        require(email.isNotBlank() && password.isNotBlank()) { "Enter your email and password." }
        val response = post("/signin/email-password", JSONObject().put("email", email.trim()).put("password", password))
        val mfa = response.optJSONObject("mfa")
        if (mfa != null) {
            val ticket = mfa.optString("ticket")
            if (ticket.isBlank()) throw AuthException("Nhost returned an incomplete MFA challenge.")
            tokenStore.saveMfaTicket(ticket)
            throw MfaRequiredException()
        }
        val sessionJson = response.optJSONObject("session")
            ?: throw AuthException("Nhost did not return a sign-in session.")
        val session = parseSession(sessionJson)
        tokenStore.save(session)
        session
    }

    suspend fun verifyMfaTotp(otp: String): Session = withContext(Dispatchers.IO) {
        require(otp.matches(Regex("\\d{6,8}"))) { "Enter the current 6–8 digit authenticator code." }
        val ticket = tokenStore.readMfaTicket() ?: throw AuthException("The MFA challenge expired. Please sign in again.")
        val response = post("/signin/mfa/totp", JSONObject().put("ticket", ticket).put("otp", otp))
        val sessionJson = response.optJSONObject("session")
            ?: throw AuthException("MFA verification did not return a session.")
        val session = parseSession(sessionJson)
        tokenStore.clearMfaTicket()
        tokenStore.save(session)
        session
    }

    suspend fun signUp(email: String, password: String, displayName: String): Session? = withContext(Dispatchers.IO) {
        require(email.isNotBlank() && password.length >= 3) { "Enter a valid email and password." }
        require(displayName.isNotBlank() && displayName.length <= 32) { "Enter your name (up to 32 characters)." }
        val verifier = newCodeVerifier()
        val challenge = Base64.encodeToString(
            MessageDigest.getInstance("SHA-256").digest(verifier.toByteArray(Charsets.US_ASCII)),
            Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING
        )
        tokenStore.savePkceVerifier(verifier)
        try {
            val options = JSONObject()
                .put("displayName", displayName.trim())
                .put("locale", "en")
                .put("redirectTo", "https://www.obaiddoctrine.com/auth/verify/?app=1&native=1")
            val response = post(
                "/signup/email-password",
                JSONObject()
                    .put("email", email.trim())
                    .put("password", password)
                    .put("options", options)
                    .put("codeChallenge", challenge)
            )
            val sessionJson = response.optJSONObject("session")
            if (sessionJson == null) {
                null // Email verification is required; the verifier remains encrypted until callback.
            } else {
                val session = parseSession(sessionJson)
                tokenStore.clearPkceVerifier()
                tokenStore.save(session)
                session
            }
        } catch (error: Exception) {
            tokenStore.clearPkceVerifier()
            throw error
        }
    }

    suspend fun requestPasswordReset(email: String) = withContext(Dispatchers.IO) {
        require(email.isNotBlank()) { "Enter your account email address." }
        val verifier = newCodeVerifier()
        val challenge = Base64.encodeToString(
            MessageDigest.getInstance("SHA-256").digest(verifier.toByteArray(Charsets.US_ASCII)),
            Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING
        )
        tokenStore.savePkceVerifier(verifier)
        try {
            post(
                "/user/password/reset",
                JSONObject()
                    .put("email", email.trim())
                    .put("options", JSONObject().put("redirectTo", "https://www.obaiddoctrine.com/auth/verify/?app=1&native=1&flow=reset"))
                    .put("codeChallenge", challenge)
            )
        } catch (error: Exception) {
            tokenStore.clearPkceVerifier()
            throw error
        }
    }

    suspend fun changePassword(newPassword: String) = withContext(Dispatchers.IO) {
        require(newPassword.length in 3..50) { "Password must contain between 3 and 50 characters." }
        val session = tokenStore.read() ?: throw AuthException("Your password reset session has expired. Please request a new link.")
        post("/user/password", JSONObject().put("newPassword", newPassword), session.accessToken)
        tokenStore.clear()
    }

    suspend fun exchangeAuthorizationCode(code: String): Session = withContext(Dispatchers.IO) {
        require(code.isNotBlank()) { "The email verification link is incomplete." }
        val verifier = tokenStore.readPkceVerifier()
            ?: throw AuthException("The secure verification request expired. Please register again or sign in.")
        val response = post(
            "/token/exchange",
            JSONObject().put("code", code).put("codeVerifier", verifier)
        )
        val sessionJson = response.optJSONObject("session")
            ?: throw AuthException("Email verification did not return a session.")
        val session = parseSession(sessionJson)
        tokenStore.clearPkceVerifier()
        tokenStore.save(session)
        session
    }

    suspend fun restoreSession(): Session? = withContext(Dispatchers.IO) {
        val saved = tokenStore.read() ?: return@withContext null
        try {
            val response = post("/token", JSONObject().put("refreshToken", saved.refreshToken))
            val refreshed = parseSession(response)
            tokenStore.save(refreshed)
            refreshed
        } catch (error: AuthException) {
            if (error.errorCode == "invalid-refresh-token" || error.statusCode == 401) {
                tokenStore.clear()
                null
            } else {
                // Keep the encrypted session during temporary server/network failures.
                saved
            }
        } catch (_: Exception) {
            // Offline or transient IO failure must not erase a valid saved session.
            saved
        }
    }

    suspend fun signOut() = withContext(Dispatchers.IO) {
        val saved = tokenStore.read()
        try {
            if (saved != null) post("/signout", JSONObject().put("refreshToken", saved.refreshTokenId))
        } finally {
            tokenStore.clear()
        }
    }

    fun currentSession(): Session? = tokenStore.read()

    private fun parseSession(json: JSONObject): Session {
        val userJson = json.optJSONObject("user") ?: JSONObject()
        val user = User(
            id = userJson.optString("id"),
            email = userJson.optString("email"),
            displayName = userJson.optString("displayName").ifBlank { userJson.optString("email") }
        )
        val access = json.optString("accessToken")
        val refresh = json.optString("refreshToken")
        if (access.isBlank() || refresh.isBlank()) throw AuthException("Nhost did not return a complete session.")
        return Session(access, refresh, json.optString("refreshTokenId").ifBlank { refresh }, user)
    }

    private fun post(path: String, body: JSONObject, accessToken: String? = null): JSONObject {
        val connection = (URL(AUTH_BASE_URL + path).openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            connectTimeout = 15_000
            readTimeout = 15_000
            doOutput = true
            setRequestProperty("Content-Type", "application/json")
            setRequestProperty("Accept", "application/json")
            if (!accessToken.isNullOrBlank()) setRequestProperty("Authorization", "Bearer $accessToken")
        }
        try {
            connection.outputStream.use { it.write(body.toString().toByteArray(Charsets.UTF_8)) }
            val status = connection.responseCode
            val stream = if (status in 200..299) connection.inputStream else connection.errorStream
            val payload = stream?.use { input -> BufferedReader(InputStreamReader(input, Charsets.UTF_8)).readText() }.orEmpty()
            val json = if (payload.trim().startsWith("{")) JSONObject(payload) else JSONObject()
            if (status !in 200..299) {
                throw AuthException(
                    json.optString("message").ifBlank { "Authentication request failed. Please try again." },
                    status,
                    json.optString("error")
                )
            }
            return json
        } finally {
            connection.disconnect()
        }
    }

    private fun newCodeVerifier(): String {
        val bytes = ByteArray(32)
        SecureRandom().nextBytes(bytes)
        return Base64.encodeToString(bytes, Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING)
    }

    companion object {
        private const val AUTH_BASE_URL = "https://ctwtjtbtbujomdskcktc.auth.eu-central-1.nhost.run/v1"
    }
}

class MfaRequiredException : Exception("Two-factor authentication is required.")

class AuthException(
    message: String,
    val statusCode: Int? = null,
    val errorCode: String? = null
) : Exception(message)

private class SecureSessionStore(context: Context) {
    private val prefs = context.getSharedPreferences("od_secure_session", Context.MODE_PRIVATE)
    private val alias = "obaid_doctrine_session_key"

    fun save(session: NhostAuthRepository.Session) {
        val json = JSONObject()
            .put("accessToken", session.accessToken)
            .put("refreshToken", session.refreshToken)
            .put("refreshTokenId", session.refreshTokenId)
            .put("id", session.user.id)
            .put("email", session.user.email)
            .put("displayName", session.user.displayName)
            .toString()
        saveEncrypted("session", json)
    }

    fun read(): NhostAuthRepository.Session? {
        val plain = readEncrypted("session") ?: return null
        return try {
            val json = JSONObject(plain)
            NhostAuthRepository.Session(
                json.getString("accessToken"),
                json.getString("refreshToken"),
                json.optString("refreshTokenId").ifBlank { json.getString("refreshToken") },
                NhostAuthRepository.User(json.optString("id"), json.optString("email"), json.optString("displayName"))
            )
        } catch (_: Exception) {
            clear()
            null
        }
    }

    fun saveMfaTicket(ticket: String) = saveEncrypted("mfa", ticket)
    fun readMfaTicket(): String? = readEncrypted("mfa")
    fun clearMfaTicket() {
        prefs.edit().remove("mfa_iv").remove("mfa_data").commit()
    }

    fun savePkceVerifier(verifier: String) = saveEncrypted("pkce", verifier)
    fun readPkceVerifier(): String? = readEncrypted("pkce")
    fun clearPkceVerifier() {
        prefs.edit().remove("pkce_iv").remove("pkce_data").commit()
    }

    private fun saveEncrypted(prefix: String, value: String) {
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey())
        val encrypted = cipher.doFinal(value.toByteArray(Charsets.UTF_8))
        val iv = Base64.encodeToString(cipher.iv, Base64.NO_WRAP)
        val data = Base64.encodeToString(encrypted, Base64.NO_WRAP)
        check(prefs.edit().putString("${prefix}_iv", iv).putString("${prefix}_data", data).commit()) {
            "Could not securely save authentication data."
        }
    }

    private fun readEncrypted(prefix: String): String? {
        val ivValue = prefs.getString("${prefix}_iv", null) ?: return null
        val dataValue = prefs.getString("${prefix}_data", null) ?: return null
        return try {
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.DECRYPT_MODE, getOrCreateKey(), GCMParameterSpec(128, Base64.decode(ivValue, Base64.NO_WRAP)))
            String(cipher.doFinal(Base64.decode(dataValue, Base64.NO_WRAP)), Charsets.UTF_8)
        } catch (_: Exception) {
            if (prefix == "session") clear() else clearPkceVerifier()
            null
        }
    }

    fun clear() {
        prefs.edit().remove("session_iv").remove("session_data").commit()
    }

    private fun getOrCreateKey(): SecretKey {
        val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        (keyStore.getKey(alias, null) as? SecretKey)?.let { return it }
        val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
        generator.init(
            KeyGenParameterSpec.Builder(alias, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setRandomizedEncryptionRequired(true)
                .build()
        )
        return generator.generateKey()
    }
}
