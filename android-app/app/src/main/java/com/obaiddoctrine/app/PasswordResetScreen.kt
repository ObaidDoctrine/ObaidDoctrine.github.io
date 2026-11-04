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
internal fun PasswordResetScreen(
    padding: PaddingValues,
    isUrdu: Boolean,
    statusMessage: String?,
    statusIsError: Boolean,
    onSubmit: (String) -> Unit
) {
    var password by remember { mutableStateOf("") }
    var confirm by remember { mutableStateOf("") }
    Column(
        Modifier.fillMaxSize().padding(padding).padding(horizontal = 24.dp, vertical = 28.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Text(if (isUrdu) "اکاؤنٹ کی سکیورٹی" else "ACCOUNT SECURITY", color = Color(0xFFF47721), fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.8.sp)
        Spacer(Modifier.height(12.dp))
        Text(if (isUrdu) "نیا پاس ورڈ مقرر کریں۔" else "Set a new password.", color = Color(0xFFFFF3E8), fontSize = 29.sp, fontWeight = FontWeight.ExtraBold)
        Spacer(Modifier.height(10.dp))
        Text(if (isUrdu) "اپنے OBAID DOCTRINE اکاؤنٹ کے لیے نیا پاس ورڈ منتخب کریں۔" else "Choose a new password for your OBAID DOCTRINE account.", color = Color(0xFFB8B2AC), fontSize = 14.sp)
        Spacer(Modifier.height(24.dp))
        OutlinedTextField(
            value = password, onValueChange = { password = it }, modifier = Modifier.fillMaxWidth(),
            singleLine = true, label = { Text(if (isUrdu) "نیا پاس ورڈ" else "New password") },
            visualTransformation = PasswordVisualTransformation(), shape = RoundedCornerShape(14.dp),
            colors = resetFieldColors()
        )
        Spacer(Modifier.height(12.dp))
        OutlinedTextField(
            value = confirm, onValueChange = { confirm = it }, modifier = Modifier.fillMaxWidth(),
            singleLine = true, label = { Text(if (isUrdu) "نئے پاس ورڈ کی تصدیق کریں" else "Confirm new password") },
            visualTransformation = PasswordVisualTransformation(), shape = RoundedCornerShape(14.dp),
            colors = resetFieldColors()
        )
        if (!statusMessage.isNullOrBlank()) {
            Spacer(Modifier.height(12.dp))
            Text(statusMessage, color = if (statusIsError) Color(0xFFFF9B9B) else Color(0xFF9AD7A8), fontSize = 13.sp)
        }
        Spacer(Modifier.height(20.dp))
        Button(
            onClick = { onSubmit(password) },
            enabled = password.length >= 3 && password == confirm,
            modifier = Modifier.fillMaxWidth().height(54.dp),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF47721), contentColor = Color(0xFF171717))
        ) {
            Text(if (isUrdu) "پاس ورڈ اپ ڈیٹ کریں" else "UPDATE PASSWORD", fontWeight = FontWeight.ExtraBold, letterSpacing = 1.sp)
        }
    }
}

@Composable
private fun resetFieldColors() = OutlinedTextFieldDefaults.colors(
    focusedTextColor = Color(0xFFFFF3E8),
    unfocusedTextColor = Color(0xFFFFF3E8),
    focusedBorderColor = Color(0xFFF47721),
    unfocusedBorderColor = Color(0xFF5B554F),
    focusedLabelColor = Color(0xFFF47721),
    unfocusedLabelColor = Color(0xFFB8B2AC)
)
