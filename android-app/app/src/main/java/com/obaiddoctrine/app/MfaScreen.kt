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
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
internal fun MfaScreen(
    padding: PaddingValues,
    isUrdu: Boolean,
    statusMessage: String?,
    statusIsError: Boolean,
    onVerify: (String) -> Unit
) {
    var otp by remember { mutableStateOf("") }
    Column(
        Modifier.fillMaxSize().padding(padding).padding(horizontal = 24.dp, vertical = 28.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Text(if (isUrdu) "اکاؤنٹ کی سکیورٹی" else "ACCOUNT SECURITY", color = Color(0xFFF47721), fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.8.sp)
        Spacer(Modifier.height(12.dp))
        Text(if (isUrdu) "اپنی شناخت کی تصدیق کریں۔" else "Verify it’s you.", color = Color(0xFFFFF3E8), fontSize = 29.sp, fontWeight = FontWeight.ExtraBold)
        Spacer(Modifier.height(10.dp))
        Text(if (isUrdu) "سائن اِن مکمل کرنے کے لیے اپنی Authenticator ایپ کا موجودہ کوڈ درج کریں۔" else "Enter the current code from your authenticator app to complete sign in.", color = Color(0xFFB8B2AC), fontSize = 14.sp, lineHeight = 21.sp)
        Spacer(Modifier.height(24.dp))
        OutlinedTextField(
            value = otp,
            onValueChange = { value -> otp = value.filter(Char::isDigit).take(8) },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            label = { Text(if (isUrdu) "Authenticator کوڈ" else "Authenticator code") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
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
        if (!statusMessage.isNullOrBlank()) {
            Spacer(Modifier.height(12.dp))
            Text(statusMessage, color = if (statusIsError) Color(0xFFFF9B9B) else Color(0xFF9AD7A8), fontSize = 13.sp)
        }
        Spacer(Modifier.height(20.dp))
        Button(
            onClick = { onVerify(otp) },
            enabled = otp.length in 6..8,
            modifier = Modifier.fillMaxWidth().height(54.dp),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF47721), contentColor = Color(0xFF171717))
        ) {
            Text(if (isUrdu) "تصدیق کرکے سائن اِن کریں" else "VERIFY & SIGN IN", fontWeight = FontWeight.ExtraBold, letterSpacing = 1.sp)
        }
    }
}
