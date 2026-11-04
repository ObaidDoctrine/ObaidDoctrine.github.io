package com.obaiddoctrine.app

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
import androidx.compose.material3.CircularProgressIndicator
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
    errorMessage: String?,
    onSignIn: (String, String) -> Unit
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var submitting by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier.fillMaxSize().padding(padding).padding(horizontal = 24.dp, vertical = 28.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Text("YOUR KNOWLEDGE JOURNEY", color = Color(0xFFF47721), fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.8.sp)
        Spacer(Modifier.height(12.dp))
        Text("Welcome back.", color = Color(0xFFFFF3E8), fontSize = 30.sp, fontWeight = FontWeight.ExtraBold)
        Spacer(Modifier.height(8.dp))
        Text("Sign in with your existing OBAID DOCTRINE account to unlock the app.", color = Color(0xFFB8B2AC), fontSize = 14.sp, lineHeight = 21.sp)
        Spacer(Modifier.height(28.dp))
        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            label = { Text("Email address") },
            shape = RoundedCornerShape(14.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = Color(0xFFFFF3E8),
                unfocusedTextColor = Color(0xFFFFF3E8),
                focusedBorderColor = Color(0xFFF47721),
                unfocusedBorderColor = Color(0xFF5B554F),
                focusedLabelColor = Color(0xFFF47721),
                unfocusedLabelColor = Color(0xFFB8B2AC)
            )
        )
        Spacer(Modifier.height(14.dp))
        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            label = { Text("Password") },
            visualTransformation = PasswordVisualTransformation(),
            shape = RoundedCornerShape(14.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = Color(0xFFFFF3E8),
                unfocusedTextColor = Color(0xFFFFF3E8),
                focusedBorderColor = Color(0xFFF47721),
                unfocusedBorderColor = Color(0xFF5B554F),
                focusedLabelColor = Color(0xFFF47721),
                unfocusedLabelColor = Color(0xFFB8B2AC)
            )
        )
        if (!errorMessage.isNullOrBlank()) {
            Spacer(Modifier.height(12.dp))
            Text(errorMessage, color = Color(0xFFFF9B9B), fontSize = 13.sp)
        }
        Spacer(Modifier.height(22.dp))
        Button(
            onClick = { onSignIn(email.trim(), password) },
            enabled = email.isNotBlank() && password.isNotBlank() && !submitting,
            modifier = Modifier.fillMaxWidth().height(54.dp),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF47721), contentColor = Color(0xFF171717))
        ) {
            Text("SIGN IN", fontWeight = FontWeight.ExtraBold, letterSpacing = 1.sp)
        }
        Spacer(Modifier.height(16.dp))
        Text("Your Home remains open without signing in. Other app sections require an account.", color = Color(0xFFB8B2AC), fontSize = 12.sp, lineHeight = 18.sp)
    }
}
