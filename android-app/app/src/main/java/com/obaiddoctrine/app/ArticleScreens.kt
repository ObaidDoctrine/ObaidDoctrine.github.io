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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.obaiddoctrine.app.content.ArticleBlockType
import com.obaiddoctrine.app.content.ArticleContent
import com.obaiddoctrine.app.content.ArticleContentRepository
import com.obaiddoctrine.app.content.ArticleSummary

@Composable
internal fun ArticleLibraryScreen(
    padding: PaddingValues,
    isUrdu: Boolean,
    onOpenArticle: (String) -> Unit
) {
    val repository = remember { ArticleContentRepository() }
    var articles by remember { mutableStateOf<List<ArticleSummary>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var query by remember { mutableStateOf("") }

    LaunchedEffect(isUrdu) {
        loading = true
        error = null
        try {
            articles = repository.fetchArticles(isUrdu)
        } catch (failure: Exception) {
            error = failure.message ?: if (isUrdu) "مضامین لوڈ نہیں ہو سکے۔" else "Articles could not be loaded."
        } finally {
            loading = false
        }
    }

    val filtered = articles.filter {
        query.isBlank() || it.title.contains(query, ignoreCase = true) ||
            it.category.contains(query, ignoreCase = true) || it.excerpt.contains(query, ignoreCase = true)
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(padding),
        contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 24.dp, bottom = 32.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text(if (isUrdu) "مضامین" else "Articles", color = DoctrineCream, fontSize = 30.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(6.dp))
            Text(
                if (isUrdu) "نفسیات، انسانی رویّوں اور تعلقات پر تحقیق پر مبنی مضامین۔"
                else "Research-informed knowledge on psychology, human behaviour and relationships.",
                color = MutedText, fontSize = 14.sp, lineHeight = 21.sp
            )
            Spacer(Modifier.height(16.dp))
            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                label = { Text(if (isUrdu) "مضمون تلاش کریں" else "Search articles") },
                shape = RoundedCornerShape(14.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = DoctrineCream,
                    unfocusedTextColor = DoctrineCream,
                    focusedBorderColor = DoctrineOrange,
                    unfocusedBorderColor = Color(0xFF5B554F),
                    focusedLabelColor = DoctrineOrange,
                    unfocusedLabelColor = MutedText
                )
            )
        }
        if (loading) {
            item { Text(if (isUrdu) "مضامین لوڈ ہو رہے ہیں…" else "Loading articles…", color = MutedText) }
        } else if (error != null) {
            item { Text(error.orEmpty(), color = Color(0xFFFF9B9B), lineHeight = 22.sp) }
        } else if (filtered.isEmpty()) {
            item { Text(if (isUrdu) "کوئی مضمون نہیں ملا۔" else "No matching articles found.", color = MutedText) }
        } else {
            items(filtered, key = { it.path }) { article ->
                Card(
                    modifier = Modifier.fillMaxWidth().clickable { onOpenArticle(article.path) },
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF252525))
                ) {
                    Column(Modifier.padding(17.dp)) {
                        Text(article.category.uppercase(), color = DoctrineOrange, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.1.sp)
                        Spacer(Modifier.height(7.dp))
                        Text(article.title, color = DoctrineCream, fontSize = 17.sp, fontWeight = FontWeight.Bold, lineHeight = 23.sp)
                        if (article.excerpt.isNotBlank()) {
                            Spacer(Modifier.height(6.dp))
                            Text(article.excerpt, color = MutedText, fontSize = 13.sp, lineHeight = 19.sp, maxLines = 3)
                        }
                        Spacer(Modifier.height(10.dp))
                        Text(if (isUrdu) "مضمون پڑھیں  ←" else "READ ARTICLE  →", color = Color(0xFFFF9B45), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
internal fun ArticleReaderScreen(
    padding: PaddingValues,
    path: String,
    isUrdu: Boolean,
    onBack: () -> Unit
) {
    val repository = remember { ArticleContentRepository() }
    var article by remember(path) { mutableStateOf<ArticleContent?>(null) }
    var loading by remember(path) { mutableStateOf(true) }
    var error by remember(path) { mutableStateOf<String?>(null) }

    LaunchedEffect(path) {
        loading = true
        error = null
        try {
            article = repository.fetchArticle(path)
        } catch (failure: Exception) {
            error = failure.message ?: if (isUrdu) "مضمون دستیاب نہیں۔" else "Article is unavailable."
        } finally {
            loading = false
        }
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(padding),
        contentPadding = PaddingValues(start = 22.dp, end = 22.dp, top = 22.dp, bottom = 40.dp),
        verticalArrangement = Arrangement.spacedBy(13.dp)
    ) {
        item {
            Text(
                if (isUrdu) "← واپس مضامین پر" else "‹  BACK TO ARTICLES",
                color = DoctrineOrange,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.clickable(onClick = onBack)
            )
            Spacer(Modifier.height(18.dp))
        }
        if (loading) {
            item { Text(if (isUrdu) "مضمون لوڈ ہو رہا ہے…" else "Loading article…", color = MutedText) }
        } else if (error != null) {
            item { Text(error.orEmpty(), color = Color(0xFFFF9B9B)) }
        } else {
            item {
                Text(article?.title.orEmpty(), color = DoctrineCream, fontSize = 27.sp, fontWeight = FontWeight.ExtraBold, lineHeight = 34.sp)
                Spacer(Modifier.height(8.dp))
                Text("OBAID DOCTRINE  •  " + (if (isUrdu) "تعلیمی مضمون" else "EDUCATIONAL ARTICLE"), color = DoctrineOrange, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
            }
            items(article?.blocks.orEmpty().size) { index ->
                val block = article!!.blocks[index]
                when (block.type) {
                    ArticleBlockType.TITLE -> Text(block.text, color = DoctrineCream, fontSize = 23.sp, fontWeight = FontWeight.Bold, lineHeight = 30.sp)
                    ArticleBlockType.HEADING -> Text(block.text, color = Color(0xFFFF9B45), fontSize = 19.sp, fontWeight = FontWeight.Bold, lineHeight = 26.sp, modifier = Modifier.padding(top = 8.dp))
                    ArticleBlockType.CALLOUT -> Card(
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF33251C)),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Text(block.text, color = DoctrineCream, fontSize = 14.sp, lineHeight = 23.sp, modifier = Modifier.padding(16.dp))
                    }
                    ArticleBlockType.BULLET -> Text("•  " + block.text, color = DoctrineCream, fontSize = 14.sp, lineHeight = 23.sp, modifier = Modifier.padding(start = 8.dp))
                    ArticleBlockType.NUMBERED -> Text((index + 1).toString() + ".  " + block.text, color = DoctrineCream, fontSize = 14.sp, lineHeight = 23.sp, modifier = Modifier.padding(start = 8.dp))
                    ArticleBlockType.PARAGRAPH -> Text(block.text, color = Color(0xFFE2DCD5), fontSize = 14.sp, lineHeight = 24.sp)
                }
            }
            item {
                Spacer(Modifier.height(12.dp))
                Text(
                    if (isUrdu) "یہ مواد تعلیمی آگاہی کے لیے ہے، انفرادی تشخیص یا علاج کا متبادل نہیں۔"
                    else "This content is educational and is not a substitute for individual diagnosis or treatment.",
                    color = MutedText, fontSize = 12.sp, lineHeight = 19.sp
                )
            }
        }
    }
}
