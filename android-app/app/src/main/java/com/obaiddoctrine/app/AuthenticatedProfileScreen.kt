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
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
internal fun AuthenticatedProfileScreen(
    padding: PaddingValues,
    isUrdu: Boolean,
    email: String,
    errorMessage: String?,
    onSignOut: () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxSize().padding(padding).padding(24.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Text(if (isUrdu) "آپ کا اکاؤنٹ" else "YOUR ACCOUNT", color = Color(0xFFF47721), fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.8.sp)
        Spacer(Modifier.height(12.dp))
        Text(if (isUrdu) "آپ کا پروفائل" else "Your Profile", color = Color(0xFFFFF3E8), fontSize = 29.sp, fontWeight = FontWeight.ExtraBold)
        Spacer(Modifier.height(8.dp))
        Text(email, color = Color(0xFFB8B2AC), fontSize = 15.sp)
        if (!errorMessage.isNullOrBlank()) {
            Spacer(Modifier.height(12.dp))
            Text(errorMessage, color = Color(0xFFFF9B9B), fontSize = 13.sp)
        }
        Spacer(Modifier.height(26.dp))
        Button(
            onClick = onSignOut,
            modifier = Modifier.fillMaxWidth().height(52.dp),
            shape = RoundedCornerShape(15.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF47721), contentColor = Color(0xFF171717))
        ) {
            Text(if (isUrdu) "سائن آؤٹ" else "SIGN OUT", fontWeight = FontWeight.ExtraBold, letterSpacing = 1.sp)
        }
    }
}
