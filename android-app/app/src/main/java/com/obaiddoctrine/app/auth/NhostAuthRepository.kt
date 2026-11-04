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
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Nhost email/password session client.
 * Tokens are encrypted with an Android Keystore AES-GCM key before persistence.
 * Passwords are never stored.
 */
class NhostAuthRepository(context: Context) {
    private val appContext = context.applicationContext
    private val tokenStore = SecureSessionStore(appContext)

    data class User(val id: String, val email: String, val displayName: String)
    data class Session(val accessToken: String, val refreshToken: String, val refreshTokenId: String, val user: User)

    suspend fun signIn(email: String, password: String): Session = withContext(Dispatchers.IO) {
        require(email.isNotBlank() && password.isNotBlank()) { "Enter your email and password." }
        val response = post(
            "/signin/email-password",
            JSONObject().put("email", email.trim()).put("password", password)
        )
        val sessionJson = response.optJSONObject("session")
            ?: throw AuthException("Additional verification may be required. MFA is not yet supported in this app.")
        val session = parseSession(sessionJson)
        if (session.user.email.isBlank()) throw AuthException("The account response was incomplete.")
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
        } catch (_: Exception) {
            tokenStore.clear()
            null
        }
    }

    suspend fun signOut() = withContext(Dispatchers.IO) {
        val saved = tokenStore.read()
        try {
            if (saved != null) {
                post("/signout", JSONObject().put("refreshToken", saved.refreshTokenId))
            }
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

    private fun post(path: String, body: JSONObject): JSONObject {
        val connection = (URL(AUTH_BASE_URL + path).openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            connectTimeout = 15_000
            readTimeout = 15_000
            doOutput = true
            setRequestProperty("Content-Type", "application/json")
            setRequestProperty("Accept", "application/json")
        }
        try {
            connection.outputStream.use { it.write(body.toString().toByteArray(Charsets.UTF_8)) }
            val status = connection.responseCode
            val stream = if (status in 200..299) connection.inputStream else connection.errorStream
            val payload = stream?.use { input ->
                BufferedReader(InputStreamReader(input, Charsets.UTF_8)).readText()
            }.orEmpty()
            val json = if (payload.isBlank()) JSONObject() else JSONObject(payload)
            if (status !in 200..299) {
                throw AuthException(json.optString("message").ifBlank { "Authentication failed. Please try again." })
            }
            return json
        } finally {
            connection.disconnect()
        }
    }

    companion object {
        // Existing OBAID DOCTRINE Nhost project, same project as the website auth client.
        private const val AUTH_BASE_URL = "https://ctwtjtbtbujomdskcktc.auth.eu-central-1.nhost.run/v1"
    }
}

class AuthException(message: String) : Exception(message)

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
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey())
        val encrypted = cipher.doFinal(json.toByteArray(Charsets.UTF_8))
        val iv = Base64.encodeToString(cipher.iv, Base64.NO_WRAP)
        val data = Base64.encodeToString(encrypted, Base64.NO_WRAP)
        check(prefs.edit().putString("iv", iv).putString("data", data).commit()) {
            "Could not securely save the session."
        }
    }

    fun read(): NhostAuthRepository.Session? {
        val ivValue = prefs.getString("iv", null) ?: return null
        val dataValue = prefs.getString("data", null) ?: return null
        return try {
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(
                Cipher.DECRYPT_MODE,
                getOrCreateKey(),
                GCMParameterSpec(128, Base64.decode(ivValue, Base64.NO_WRAP))
            )
            val plain = cipher.doFinal(Base64.decode(dataValue, Base64.NO_WRAP))
            val json = JSONObject(String(plain, Charsets.UTF_8))
            NhostAuthRepository.Session(
                json.getString("accessToken"),
                json.getString("refreshToken"),
                json.optString("refreshTokenId").ifBlank { json.getString("refreshToken") },
                NhostAuthRepository.User(
                    json.optString("id"),
                    json.optString("email"),
                    json.optString("displayName")
                )
            )
        } catch (_: Exception) {
            clear()
            null
        }
    }

    fun clear() {
        prefs.edit().clear().commit()
    }

    private fun getOrCreateKey(): SecretKey {
        val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        (keyStore.getKey(alias, null) as? SecretKey)?.let { return it }
        val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
        generator.init(
            KeyGenParameterSpec.Builder(
                alias,
                KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
            )
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setRandomizedEncryptionRequired(true)
                .build()
        )
        return generator.generateKey()
    }
}
