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
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
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
    onSignOut: () -> Unit,
    onOpenAccountDeletion: () -> Unit
) {
    // External deletion request is user-initiated and never deletes an account in-app.
    var showDeletionConfirmation by remember { mutableStateOf(false) }

    if (showDeletionConfirmation) {
        AlertDialog(
            onDismissRequest = { showDeletionConfirmation = false },
            title = {
                Text(if (isUrdu) "اکاؤنٹ حذف کرنے کی درخواست" else "Request account deletion")
            },
            text = {
                Text(
                    if (isUrdu) {
                        "آپ کو OBAID DOCTRINE کی محفوظ ویب سائٹ پر بھیجا جائے گا، جہاں آپ اکاؤنٹ حذف کرنے کی درخواست جمع کر سکتے ہیں۔ یہ عمل فوری یا خودکار نہیں؛ درخواست کی تصدیق اور حذف کرنے کا عمل ویب سائٹ پر دی گئی ہدایات کے مطابق ہوگا۔"
                    } else {
                        "You will be taken to the OBAID DOCTRINE account-deletion page to submit a request. This does not delete your account immediately or automatically; the request will be reviewed and processed according to the instructions on that page."
                    }
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    showDeletionConfirmation = false
                    onOpenAccountDeletion()
                }) {
                    Text(if (isUrdu) "آگے بڑھیں" else "CONTINUE", color = Color(0xFFF47721))
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeletionConfirmation = false }) {
                    Text(if (isUrdu) "منسوخ کریں" else "CANCEL", color = Color(0xFFB8B2AC))
                }
            },
            containerColor = Color(0xFF252525),
            titleContentColor = Color(0xFFFFF3E8),
            textContentColor = Color(0xFFB8B2AC)
        )
    }

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
        Spacer(Modifier.height(14.dp))
        TextButton(
            onClick = { showDeletionConfirmation = true },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                if (isUrdu) "اکاؤنٹ حذف کرنے کی درخواست" else "REQUEST ACCOUNT DELETION",
                color = Color(0xFFFF9B9B),
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.5.sp
            )
        }
    }
}
