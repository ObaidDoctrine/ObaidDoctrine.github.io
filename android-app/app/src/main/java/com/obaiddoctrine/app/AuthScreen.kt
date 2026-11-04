package com.obaiddoctrine.app

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
internal fun AuthScreen(
    padding: PaddingValues,
    isUrdu: Boolean,
    statusMessage: String?,
    statusIsError: Boolean,
    onSignIn: (String, String) -> Unit,
    onSignUp: (String, String, String) -> Unit,
    onPasswordReset: (String) -> Unit
) {
    var isSignUp by remember { mutableStateOf(false) }
    var displayName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    Column(
        modifier = Modifier.fillMaxSize().padding(padding).padding(horizontal = 24.dp, vertical = 28.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Text(if (isUrdu) "آپ کے علم کا سفر" else "YOUR KNOWLEDGE JOURNEY", color = Color(0xFFF47721), fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.8.sp)
        Spacer(Modifier.height(12.dp))
        Text(if (isUrdu) { if (isSignUp) "اپنا اکاؤنٹ بنائیں۔" else "خوش آمدید۔" } else { if (isSignUp) "Create your account." else "Welcome back." }, color = Color(0xFFFFF3E8), fontSize = 30.sp, fontWeight = FontWeight.ExtraBold)
        Spacer(Modifier.height(8.dp))
        Text(
            if (isUrdu) { if (isSignUp) "OBAID DOCTRINE میں شامل ہوں۔ محفوظ حصوں تک رسائی سے پہلے ای میل کی تصدیق ضروری ہے۔" else "ایپ کے محفوظ حصوں تک رسائی کے لیے اپنے OBAID DOCTRINE اکاؤنٹ میں سائن اِن کریں۔" }
            else if (isSignUp) "Join OBAID DOCTRINE. Your email must be verified before protected areas unlock."
            else "Sign in with your existing OBAID DOCTRINE account to unlock the app.",
            color = Color(0xFFB8B2AC), fontSize = 14.sp, lineHeight = 21.sp
        )
        Spacer(Modifier.height(24.dp))
        if (isSignUp) {
            OutlinedTextField(
                value = displayName, onValueChange = { displayName = it }, modifier = Modifier.fillMaxWidth(),
                singleLine = true, label = { Text(if (isUrdu) "آپ کا نام" else "Your name") }, shape = RoundedCornerShape(14.dp),
                colors = fieldColors()
            )
            Spacer(Modifier.height(12.dp))
        }
        OutlinedTextField(
            value = email, onValueChange = { email = it }, modifier = Modifier.fillMaxWidth(),
            singleLine = true, label = { Text(if (isUrdu) "ای میل ایڈریس" else "Email address") }, shape = RoundedCornerShape(14.dp),
            colors = fieldColors()
        )
        Spacer(Modifier.height(12.dp))
        OutlinedTextField(
            value = password, onValueChange = { password = it }, modifier = Modifier.fillMaxWidth(),
            singleLine = true, label = { Text(if (isUrdu) { if (isSignUp) "پاس ورڈ بنائیں" else "پاس ورڈ" } else { if (isSignUp) "Create password" else "Password" }) },
            visualTransformation = PasswordVisualTransformation(), shape = RoundedCornerShape(14.dp),
            colors = fieldColors()
        )
        if (!statusMessage.isNullOrBlank()) {
            Spacer(Modifier.height(12.dp))
            Text(statusMessage, color = if (statusIsError) Color(0xFFFF9B9B) else Color(0xFF9AD7A8), fontSize = 13.sp, lineHeight = 19.sp)
        }
        Spacer(Modifier.height(20.dp))
        Button(
            onClick = {
                if (isSignUp) onSignUp(email.trim(), password, displayName.trim())
                else onSignIn(email.trim(), password)
            },
            enabled = email.isNotBlank() && password.length in 3..50 && (!isSignUp || displayName.isNotBlank()),
            modifier = Modifier.fillMaxWidth().height(54.dp),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF47721), contentColor = Color(0xFF171717))
        ) {
            Text(if (isUrdu) { if (isSignUp) "اکاؤنٹ بنائیں" else "سائن اِن" } else { if (isSignUp) "CREATE ACCOUNT" else "SIGN IN" }, fontWeight = FontWeight.ExtraBold, letterSpacing = 1.sp)
        }
        Spacer(Modifier.height(16.dp))
        if (!isSignUp) {
            Text(
                if (isUrdu) "پاس ورڈ بھول گئے؟ ری سیٹ لنک بھیجیں" else "Forgot password? Send reset link",
                color = Color(0xFFFF9B45), fontSize = 13.sp, fontWeight = FontWeight.Bold,
                modifier = Modifier.clickable { onPasswordReset(email.trim()) }
            )
            Spacer(Modifier.height(12.dp))
        }
        Text(
            if (isUrdu) { if (isSignUp) "پہلے سے اکاؤنٹ ہے؟ سائن اِن کریں" else "OBAID DOCTRINE پر نئے ہیں؟ اکاؤنٹ بنائیں" }
            else if (isSignUp) "Already have an account? Sign in"
            else "New to OBAID DOCTRINE? Create an account",
            color = Color(0xFFFF9B45), fontSize = 13.sp, fontWeight = FontWeight.Bold,
            modifier = Modifier.clickable { isSignUp = !isSignUp }
        )
        Spacer(Modifier.height(16.dp))
        Text(if (isUrdu) "ہوم بغیر سائن اِن کے دستیاب ہے۔ ایپ کے دیگر حصوں کے لیے اکاؤنٹ ضروری ہے۔" else "Your Home remains open without signing in. Other app sections require an account.", color = Color(0xFFB8B2AC), fontSize = 12.sp, lineHeight = 18.sp)
    }
}

@Composable
private fun fieldColors() = OutlinedTextFieldDefaults.colors(
    focusedTextColor = Color(0xFFFFF3E8),
    unfocusedTextColor = Color(0xFFFFF3E8),
    focusedBorderColor = Color(0xFFF47721),
    unfocusedBorderColor = Color(0xFF5B554F),
    focusedLabelColor = Color(0xFFF47721),
    unfocusedLabelColor = Color(0xFFB8B2AC)
)
