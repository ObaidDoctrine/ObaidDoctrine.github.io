package com.obaiddoctrine.app

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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.platform.LocalContext
import com.obaiddoctrine.app.content.MindTestDefinition
import com.obaiddoctrine.app.content.MindTestRepository

@Composable
internal fun MindTestsLibraryScreen(
    padding: PaddingValues,
    isUrdu: Boolean,
    onOpenTest: (String) -> Unit
) {
    val context = LocalContext.current
    val repository = remember { MindTestRepository(context) }
    var tests by remember { mutableStateOf<List<MindTestDefinition>>(emptyList()) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(isUrdu) {
        try {
            tests = repository.loadCatalog(isUrdu)
            error = null
        } catch (failure: Exception) {
            error = failure.message ?: if (isUrdu) "ذہنی ٹیسٹ لوڈ نہیں ہو سکے۔" else "Mind Tests could not be loaded."
        }
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(padding),
        contentPadding = PaddingValues(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text(if (isUrdu) "Mind Tests" else "Mind Tests", color = DoctrineCream, fontSize = 30.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))
            Text(
                if (isUrdu) "اپنی سوچ، جذبات اور روزمرہ ردِعمل پر غور کرنے کے لیے 10 تعلیمی خود آگاہی ٹیسٹ۔"
                else "Explore 10 educational self-reflection tests about thinking, emotions and everyday responses.",
                color = MutedText, fontSize = 14.sp, lineHeight = 21.sp
            )
            Spacer(Modifier.height(12.dp))
            Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF33251C)), shape = RoundedCornerShape(14.dp)) {
                Text(
                    if (isUrdu) "اہم وضاحت: یہ اصل تعلیمی سوالنامے ہیں، طبی تشخیص یا آزادانہ طور پر validated نفسیاتی پیمانے نہیں۔ نتائج کو صرف خود غور و فکر کے لیے استعمال کریں۔"
                    else "Important: These are original educational questionnaires, not clinical diagnoses or independently validated psychometric instruments. Use results for reflection only.",
                    color = DoctrineCream, fontSize = 12.sp, lineHeight = 19.sp, modifier = Modifier.padding(15.dp)
                )
            }
        }
        if (error != null) item { Text(error.orEmpty(), color = Color(0xFFFF9B9B)) }
        items(tests, key = { it.slug }) { test ->
            Card(
                modifier = Modifier.fillMaxWidth().clickable { onOpenTest(test.slug) },
                colors = CardDefaults.cardColors(containerColor = Color(0xFF252525)),
                shape = RoundedCornerShape(18.dp)
            ) {
                Column(Modifier.padding(17.dp)) {
                    Text(if (isUrdu) "خود آگاہی • 10 سوالات" else "SELF-REFLECTION • 10 QUESTIONS", color = DoctrineOrange, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                    Spacer(Modifier.height(7.dp))
                    Text(test.title, color = DoctrineCream, fontSize = 18.sp, fontWeight = FontWeight.Bold, lineHeight = 25.sp)
                    if (test.intro.isNotBlank()) {
                        Spacer(Modifier.height(6.dp))
                        Text(test.intro, color = MutedText, fontSize = 13.sp, lineHeight = 19.sp, maxLines = 3)
                    }
                    Spacer(Modifier.height(10.dp))
                    Text(if (isUrdu) "ٹیسٹ شروع کریں  ←" else "START TEST  →", color = Color(0xFFFF9B45), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
internal fun MindTestRunnerScreen(
    padding: PaddingValues,
    slug: String,
    isUrdu: Boolean,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val repository = remember { MindTestRepository(context) }
    var test by remember(slug, isUrdu) { mutableStateOf<MindTestDefinition?>(null) }
    var loadError by remember(slug, isUrdu) { mutableStateOf<String?>(null) }
    var answers by remember(slug, isUrdu) { mutableStateOf(List(10) { -1 }) }
    var index by remember(slug, isUrdu) { mutableStateOf(0) }
    var selected by remember(slug, isUrdu) { mutableStateOf(-1) }
    var completed by remember(slug, isUrdu) { mutableStateOf(false) }

    LaunchedEffect(slug, isUrdu) {
        try {
            test = repository.loadTest(slug, isUrdu)
            if (test == null) loadError = if (isUrdu) "یہ ٹیسٹ دستیاب نہیں۔" else "This test is unavailable."
        } catch (failure: Exception) {
            loadError = failure.message ?: if (isUrdu) "ٹیسٹ لوڈ نہیں ہو سکا۔" else "The test could not be loaded."
        }
    }

    val currentTest = test
    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(padding),
        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 22.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Text(
                if (isUrdu) "← ٹیسٹ فہرست پر واپس" else "‹  BACK TO MIND TESTS",
                color = DoctrineOrange, fontSize = 12.sp, fontWeight = FontWeight.Bold,
                modifier = Modifier.clickable(onClick = onBack)
            )
            Spacer(Modifier.height(8.dp))
        }
        if (loadError != null) {
            item { Text(loadError.orEmpty(), color = Color(0xFFFF9B9B)) }
        } else if (currentTest == null) {
            item { Text(if (isUrdu) "ٹیسٹ لوڈ ہو رہا ہے…" else "Loading test…", color = MutedText) }
        } else if (!completed) {
            val question = currentTest.questions[index]
            item {
                Text(currentTest.title, color = DoctrineCream, fontSize = 23.sp, fontWeight = FontWeight.ExtraBold, lineHeight = 30.sp)
                Spacer(Modifier.height(8.dp))
                Text(
                    if (isUrdu) "سوال ${index + 1} / ${currentTest.questions.size}"
                    else "QUESTION ${index + 1} OF ${currentTest.questions.size}",
                    color = DoctrineOrange, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp
                )
                Spacer(Modifier.height(8.dp))
                Box(Modifier.fillMaxWidth().height(7.dp).background(Color(0xFF3A3A3A), RoundedCornerShape(99.dp))) {
                    Box(Modifier.fillMaxWidth((index + 1).toFloat() / currentTest.questions.size).height(7.dp).background(DoctrineOrange, RoundedCornerShape(99.dp)))
                }
                Spacer(Modifier.height(12.dp))
                Text(question.prompt, color = DoctrineCream, fontSize = 19.sp, fontWeight = FontWeight.Bold, lineHeight = 27.sp)
            }
            items(question.options.size) { optionIndex ->
                val isSelected = selected == optionIndex
                Card(
                    modifier = Modifier.fillMaxWidth().clickable {
                        selected = optionIndex
                        answers = answers.toMutableList().also { it[index] = optionIndex }
                    },
                    colors = CardDefaults.cardColors(containerColor = if (isSelected) Color(0xFF3A2A20) else Color(0xFF252525)),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(horizontal = 10.dp, vertical = 7.dp)) {
                        RadioButton(selected = isSelected, onClick = {
                            selected = optionIndex
                            answers = answers.toMutableList().also { it[index] = optionIndex }
                        })
                        Text(question.options[optionIndex], color = DoctrineCream, fontSize = 14.sp, lineHeight = 21.sp, modifier = Modifier.padding(start = 5.dp, end = 8.dp))
                    }
                }
            }
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
                    if (index > 0) {
                        Button(
                            onClick = {
                                index -= 1
                                selected = answers[index]
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF333333), contentColor = DoctrineCream)
                        ) { Text(if (isUrdu) "پچھلا" else "PREVIOUS") }
                    }
                    Button(
                        onClick = {
                            answers = answers.toMutableList().also { it[index] = selected }
                            if (index == currentTest.questions.lastIndex) completed = true
                            else {
                                index += 1
                                selected = answers[index]
                            }
                        },
                        enabled = selected in question.options.indices,
                        colors = ButtonDefaults.buttonColors(containerColor = DoctrineOrange, contentColor = DoctrineInk)
                    ) { Text(if (index == currentTest.questions.lastIndex) (if (isUrdu) "نتیجہ دیکھیں" else "VIEW RESULTS") else (if (isUrdu) "اگلا سوال" else "NEXT QUESTION"), fontWeight = FontWeight.Bold) }
                }
            }
        } else {
            val results = repository.score(currentTest, answers)
            item {
                Text(if (isUrdu) "آپ کے جوابات کا خلاصہ" else "Your response patterns", color = DoctrineCream, fontSize = 26.sp, fontWeight = FontWeight.ExtraBold)
                Spacer(Modifier.height(8.dp))
                Text(
                    if (isUrdu) "یہ تناسب صرف آپ کے منتخب کردہ جوابات کی تقسیم دکھاتے ہیں؛ انہیں diagnosis، clinical score یا مستقل شخصیت کا فیصلہ نہ سمجھیں۔"
                    else "These percentages show how your selected answers map to the questionnaire dimensions. They are not a diagnosis, clinical score or fixed personality label.",
                    color = MutedText, fontSize = 13.sp, lineHeight = 20.sp
                )
            }
            items(results, key = { it.label }) { result ->
                Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF252525)), shape = RoundedCornerShape(16.dp)) {
                    Column(Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(result.label, color = DoctrineCream, fontSize = 16.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                            Text("${result.percentage}%", color = DoctrineOrange, fontSize = 16.sp, fontWeight = FontWeight.ExtraBold)
                        }
                        Spacer(Modifier.height(9.dp))
                        Box(Modifier.fillMaxWidth().height(7.dp).background(Color(0xFF3A3A3A), RoundedCornerShape(99.dp))) {
                            Box(Modifier.fillMaxWidth(result.percentage / 100f).height(7.dp).background(DoctrineOrange, RoundedCornerShape(99.dp)))
                        }
                        Spacer(Modifier.height(10.dp))
                        Text(result.description, color = MutedText, fontSize = 13.sp, lineHeight = 20.sp)
                    }
                }
            }
            item {
                Button(
                    onClick = {
                        answers = List(10) { -1 }
                        index = 0
                        selected = -1
                        completed = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = DoctrineOrange, contentColor = DoctrineInk),
                    modifier = Modifier.fillMaxWidth()
                ) { Text(if (isUrdu) "دوبارہ ٹیسٹ دیں" else "RETAKE TEST", fontWeight = FontWeight.Bold) }
                Spacer(Modifier.height(6.dp))
                Text(
                    if (isUrdu) "یہ خود غور و فکر کی سرگرمی ہے۔ کسی نفسیاتی یا طبی مسئلے کی تشخیص کے لیے ماہر سے رجوع کریں۔"
                    else "This is a self-reflection exercise. Consult a qualified professional for assessment of psychological or medical concerns.",
                    color = MutedText, fontSize = 12.sp, lineHeight = 19.sp
                )
            }
        }
    }
}
