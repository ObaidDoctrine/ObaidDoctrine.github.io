package com.obaiddoctrine.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.PersonOutline
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import kotlinx.coroutines.launch
import com.obaiddoctrine.app.content.BookmarkRepository
import com.obaiddoctrine.app.auth.NhostAuthRepository
import com.obaiddoctrine.app.auth.MfaRequiredException
import com.obaiddoctrine.app.content.ArticleBookmark
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

internal val DoctrineOrange = Color(0xFFF47721)
internal val DoctrineCream = Color(0xFFFFF3E8)
internal val DoctrineInk = Color(0xFF171717)
internal val MutedText = Color(0xFFB8B2AC)

class NativeMainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { DoctrineApp(
            initialAuthCode = intent?.data?.getQueryParameter("code"),
            initialAuthFlow = intent?.data?.getQueryParameter("flow")
        ) }
    }

    override fun onNewIntent(intent: android.content.Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        recreate()
    }
}

private data class AppSection(
    val title: String,
    val subtitle: String,
    val symbol: String,
    val tint: Color
)

private val sections = listOf(
    AppSection("Psychology", "Understand the mind and how it works", "Ψ", Color(0xFFB79AE8)),
    AppSection("Human Behaviour", "Explore the patterns behind behaviour", "◉", Color(0xFF73B9C7)),
    AppSection("Relationships", "Build healthier human connections", "♡", Color(0xFFE58D9A)),
    AppSection("Marriage & Family", "Knowledge for stronger family life", "⌂", Color(0xFF80B99A)),
    AppSection("Women", "Research-led knowledge and perspectives", "✳", Color(0xFFD6A45E)),
    AppSection("Self Improvement", "Develop awareness and character", "↗", Color(0xFF8DA9E8)),
    AppSection("Mind Tests", "Reflect on your thinking and behaviour", "◇", DoctrineOrange),
    AppSection("Research Insights", "Explore evidence and new findings", "⌕", Color(0xFF75B8A7)),
    AppSection("Learning Lab", "Learn through guided knowledge", "▤", Color(0xFFB39AD6))
)

@Composable
private fun DoctrineApp(initialAuthCode: String? = null, initialAuthFlow: String? = null) {
    var selectedTab by remember { mutableIntStateOf(0) }
    var selectedSection by remember { mutableIntStateOf(-1) }
    var session by remember { mutableStateOf<NhostAuthRepository.Session?>(null) }
    var authLoading by remember { mutableStateOf(true) }
    var authMessage by remember { mutableStateOf<String?>(null) }
    var authMessageIsError by remember { mutableStateOf(false) }
    var passwordResetMode by remember { mutableStateOf(false) }
    var mfaRequired by remember { mutableStateOf(false) }
    var selectedArticlePath by remember { mutableStateOf<String?>(null) }
    var selectedTestSlug by remember { mutableStateOf<String?>(null) }
    val context = LocalContext.current
    val authRepository = remember { NhostAuthRepository(context) }
    val bookmarkRepository = remember { BookmarkRepository(context) }
    var bookmarks by remember { mutableStateOf(bookmarkRepository.getAll()) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(initialAuthCode, initialAuthFlow) {
        if (!initialAuthCode.isNullOrBlank()) {
            authLoading = true
            try {
                session = authRepository.exchangeAuthorizationCode(initialAuthCode)
                passwordResetMode = initialAuthFlow == "reset"
                authMessage = "Your email is verified. Your account is ready."
                authMessageIsError = false
                selectedTab = 1
            } catch (error: Exception) {
                authMessage = error.message ?: "Unable to complete email verification."
                authMessageIsError = true
            } finally {
                authLoading = false
            }
        } else {
            session = authRepository.restoreSession()
            authLoading = false
        }
    }

    val isAuthenticated = session != null
    val isUrdu = java.util.Locale.getDefault().language == "ur"
    val tabs = listOf("Home", "Explore", "Articles", "Library", "Profile")
    val icons = listOf(Icons.Filled.Home, Icons.Filled.Explore, Icons.Filled.MenuBook, Icons.Filled.BookmarkBorder, Icons.Filled.PersonOutline)

    MaterialTheme(colorScheme = darkColorScheme(
        primary = DoctrineOrange,
        onPrimary = DoctrineInk,
        background = DoctrineInk,
        surface = Color(0xFF222222),
        onSurface = DoctrineCream,
        secondary = Color(0xFFFF9B45)
    )) {
        Scaffold(
            containerColor = DoctrineInk,
            bottomBar = {
                NavigationBar(containerColor = Color(0xFF202020), contentColor = DoctrineCream) {
                    tabs.forEachIndexed { index, label ->
                        NavigationBarItem(
                            selected = selectedTab == index,
                            onClick = { selectedTab = index; selectedSection = -1; selectedArticlePath = null; selectedTestSlug = null },
                            icon = { androidx.compose.material3.Icon(icons[index], contentDescription = label) },
                            label = { Text(label) }
                        )
                    }
                }
            }
        ) { padding ->
            when {
                selectedTab == 0 && selectedSection < 0 && selectedArticlePath == null -> HomeScreen(padding, onSection = { selectedSection = it })
                authLoading -> SimpleStateScreen("Secure account check", "Restoring your OBAID DOCTRINE account session…", padding)
                mfaRequired -> MfaScreen(
                    padding = padding,
                    statusMessage = authMessage,
                    statusIsError = authMessageIsError,
                    onVerify = { otp ->
                        authMessage = null
                        scope.launch {
                            authLoading = true
                            try {
                                session = authRepository.verifyMfaTotp(otp)
                                mfaRequired = false
                            } catch (error: Exception) {
                                authMessage = error.message ?: "Unable to verify the authenticator code."
                                authMessageIsError = true
                            } finally {
                                authLoading = false
                            }
                        }
                    }
                )
                passwordResetMode -> PasswordResetScreen(
                    padding = padding,
                    statusMessage = authMessage,
                    statusIsError = authMessageIsError,
                    onSubmit = { newPassword ->
                        authMessage = null
                        scope.launch {
                            authLoading = true
                            try {
                                authRepository.changePassword(newPassword)
                                session = null
                                passwordResetMode = false
                                authMessage = "Password updated. Please sign in with your new password."
                                authMessageIsError = false
                                selectedTab = 1
                            } catch (error: Exception) {
                                authMessage = error.message ?: "Unable to update your password."
                                authMessageIsError = true
                            } finally {
                                authLoading = false
                            }
                        }
                    }
                )
                !isAuthenticated -> AuthScreen(
                    padding = padding,
                    statusMessage = authMessage,
                    statusIsError = authMessageIsError,
                    onSignIn = { email, password ->
                        authMessage = null
                        scope.launch {
                            authLoading = true
                            try {
                                session = authRepository.signIn(email, password)
                            } catch (_: MfaRequiredException) {
                                mfaRequired = true
                                authMessage = "Two-factor authentication is enabled for this account."
                                authMessageIsError = false
                            } catch (error: Exception) {
                                authMessage = error.message ?: "Unable to sign in. Please try again."
                                authMessageIsError = true
                            } finally {
                                authLoading = false
                            }
                        }
                    },
                    onPasswordReset = { email ->
                        authMessage = null
                        scope.launch {
                            authLoading = true
                            try {
                                authRepository.requestPasswordReset(email)
                                authMessage = "If this email belongs to an account, a password reset link will be sent."
                                authMessageIsError = false
                            } catch (error: Exception) {
                                authMessage = error.message ?: "Unable to request a password reset."
                                authMessageIsError = true
                            } finally {
                                authLoading = false
                            }
                        }
                    },
                    onSignUp = { email, password, displayName ->
                        authMessage = null
                        scope.launch {
                            authLoading = true
                            try {
                                session = authRepository.signUp(email, password, displayName)
                                if (session == null) {
                                    authMessage = "Account created. Open the verification email on this device to finish setup."
                                    authMessageIsError = false
                                }
                            } catch (error: Exception) {
                                authMessage = error.message ?: "Unable to create your account. Please try again."
                                authMessageIsError = true
                            } finally {
                                authLoading = false
                            }
                        }
                    }
                )
                selectedArticlePath != null -> ArticleReaderScreen(
                    padding = padding,
                    path = selectedArticlePath.orEmpty(),
                    isUrdu = isUrdu,
                    isBookmarked = bookmarks.any { it.path == selectedArticlePath },
                    onToggleBookmark = { bookmark -> bookmarkRepository.toggle(bookmark); bookmarks = bookmarkRepository.getAll() },
                    onBack = { selectedArticlePath = null }
                )
                selectedTestSlug != null -> MindTestRunnerScreen(
                    padding = padding,
                    slug = selectedTestSlug.orEmpty(),
                    isUrdu = isUrdu,
                    onBack = { selectedTestSlug = null }
                )
                selectedSection == 6 -> MindTestsLibraryScreen(
                    padding = padding,
                    isUrdu = isUrdu,
                    onOpenTest = { selectedTestSlug = it }
                )
                selectedSection >= 0 -> SectionDetail(sections[selectedSection], padding) { selectedSection = -1 }
                selectedTab == 1 -> ExploreScreen(padding, onSection = { selectedSection = it })
                selectedTab == 2 -> ArticleLibraryScreen(
                    padding = padding,
                    isUrdu = isUrdu,
                    onOpenArticle = { selectedArticlePath = it }
                )
                selectedTab == 3 -> SavedArticlesScreen(
                    padding = padding,
                    bookmarks = bookmarks,
                    isUrdu = isUrdu,
                    onOpenArticle = { selectedArticlePath = it },
                    onRemoveBookmark = { path -> bookmarkRepository.remove(path); bookmarks = bookmarkRepository.getAll() }
                )
                else -> AuthenticatedProfileScreen(
                    padding = padding,
                    email = session?.user?.email.orEmpty(),
                    errorMessage = authMessage,
                    onSignOut = {
                        authMessage = null
                        scope.launch {
                            authLoading = true
                            try {
                                authRepository.signOut()
                                session = null
                                selectedSection = -1
                            } catch (error: Exception) {
                                authMessage = error.message ?: "Unable to sign out. Please try again."
                            } finally {
                                authLoading = false
                            }
                        }
                    }
                )
            }
        }
    }
}

@Composable
private fun HomeScreen(padding: PaddingValues, onSection: (Int) -> Unit) {
    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(padding),
        contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 24.dp, bottom = 28.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(42.dp).background(DoctrineOrange, RoundedCornerShape(14.dp)), contentAlignment = Alignment.Center) {
                    Text("OD", color = DoctrineInk, fontWeight = FontWeight.Black, fontSize = 16.sp)
                }
                Column(Modifier.padding(start = 12.dp)) {
                    Text("OBAID DOCTRINE", color = DoctrineCream, fontWeight = FontWeight.Bold, letterSpacing = 1.4.sp)
                    Text("Psychology • Knowledge • Growth", color = MutedText, fontSize = 11.sp)
                }
            }
        }
        item {
            Column(
                Modifier.fillMaxWidth().background(
                    brush = androidx.compose.ui.graphics.Brush.linearGradient(listOf(Color(0xFF33251C), Color(0xFF1F1D1B))),
                    shape = RoundedCornerShape(26.dp)
                ).padding(22.dp)
            ) {
                Text("BETTER MIND.", color = DoctrineOrange, fontSize = 13.sp, fontWeight = FontWeight.Bold, letterSpacing = 2.sp)
                Text("BETTER CHARACTER.\nBETTER LIFE.", color = DoctrineCream, fontSize = 29.sp, lineHeight = 35.sp, fontWeight = FontWeight.ExtraBold)
                Spacer(Modifier.height(10.dp))
                Text("Explore the science of the mind, human behaviour and meaningful living.", color = MutedText, fontSize = 14.sp, lineHeight = 21.sp)
                Spacer(Modifier.height(18.dp))
                Text("EXPLORE KNOWLEDGE  →", color = DoctrineOrange, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
        }
        item {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Text("Explore your mind", color = DoctrineCream, fontSize = 21.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.weight(1f))
                Text("ALL TOPICS", color = DoctrineOrange, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            }
        }
        items(sections.take(4).withIndex().toList()) { (index, section) ->
            SectionCard(section) { onSection(index) }
        }
        item {
            Text("Discover more", color = DoctrineCream, fontSize = 21.sp, fontWeight = FontWeight.Bold)
        }
        items(sections.drop(4).withIndex().toList()) { (offset, section) ->
            SectionCard(section) { onSection(offset + 4) }
        }
    }
}

@Composable
private fun ExploreScreen(padding: PaddingValues, onSection: (Int) -> Unit) {
    LazyColumn(
        Modifier.fillMaxSize().padding(padding),
        contentPadding = PaddingValues(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text("Explore", color = DoctrineCream, fontSize = 30.sp, fontWeight = FontWeight.Bold)
            Text("Choose a knowledge space to begin.", color = MutedText)
            Spacer(Modifier.height(10.dp))
        }
        items(sections.withIndex().toList()) { (index, section) -> SectionCard(section) { onSection(index) } }
    }
}

@Composable
private fun SectionCard(section: AppSection, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF252525))
    ) {
        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(48.dp).background(section.tint.copy(alpha = 0.16f), CircleShape), contentAlignment = Alignment.Center) {
                Text(section.symbol, color = section.tint, fontSize = 24.sp, fontWeight = FontWeight.Bold)
            }
            Column(Modifier.weight(1f).padding(start = 14.dp)) {
                Text(section.title, color = DoctrineCream, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Spacer(Modifier.height(4.dp))
                Text(section.subtitle, color = MutedText, fontSize = 12.sp, lineHeight = 17.sp)
            }
            Text("›", color = DoctrineOrange, fontSize = 28.sp)
        }
    }
}

@Composable
private fun SectionDetail(section: AppSection, padding: PaddingValues, onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().padding(padding).padding(22.dp)) {
        Text("‹  BACK", color = DoctrineOrange, fontWeight = FontWeight.Bold, modifier = Modifier.clickable(onClick = onBack))
        Spacer(Modifier.height(32.dp))
        Box(Modifier.size(64.dp).background(section.tint.copy(alpha = 0.16f), CircleShape), contentAlignment = Alignment.Center) {
            Text(section.symbol, color = section.tint, fontSize = 32.sp)
        }
        Spacer(Modifier.height(20.dp))
        Text(section.title, color = DoctrineCream, fontSize = 28.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(8.dp))
        Text(section.subtitle, color = MutedText, fontSize = 15.sp)
        Spacer(Modifier.height(24.dp))
        Surface(color = Color(0xFF252525), shape = RoundedCornerShape(18.dp)) {
            Text(
                "This native section is being connected to the verified English and Urdu website content. Articles, tests and account-protected resources will be added without changing their original educational meaning.",
                Modifier.padding(18.dp),
                color = DoctrineCream,
                lineHeight = 23.sp
            )
        }
    }
}

@Composable
private fun SimpleStateScreen(title: String, message: String, padding: PaddingValues) {
    Column(Modifier.fillMaxSize().padding(padding).padding(24.dp), verticalArrangement = Arrangement.Center) {
        Text(title, color = DoctrineCream, fontSize = 28.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(12.dp))
        Text(message, color = MutedText, fontSize = 15.sp, lineHeight = 23.sp)
    }
}
