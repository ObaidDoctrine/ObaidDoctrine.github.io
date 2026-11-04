package com.obaiddoctrine.app.content

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import kotlin.math.roundToInt

data class MindTestDimension(val label: String, val description: String)

data class MindTestQuestion(
    val prompt: String,
    val options: List<String>,
    val scores: List<Int>?,
    val values: List<Int>?
)

data class MindTestDefinition(
    val slug: String,
    val title: String,
    val intro: String,
    val dimensions: List<MindTestDimension>,
    val questions: List<MindTestQuestion>
)

data class MindTestDimensionResult(
    val label: String,
    val description: String,
    val score: Int,
    val maximum: Int,
    val percentage: Int
)

class MindTestRepository(context: Context) {
    private val assets = context.applicationContext.assets

    fun loadCatalog(isUrdu: Boolean): List<MindTestDefinition> {
        val fileName = if (isUrdu) "mind_tests_ur.json" else "mind_tests_en.json"
        val source = assets.open(fileName).bufferedReader(Charsets.UTF_8).use { it.readText() }
        val root = JSONObject(source)
        val tests = root.getJSONArray("tests")
        return (0 until tests.length()).map { index -> parseDefinition(tests.getJSONObject(index)) }
    }

    fun loadTest(slug: String, isUrdu: Boolean): MindTestDefinition? =
        loadCatalog(isUrdu).firstOrNull { it.slug == slug }

    fun score(test: MindTestDefinition, answers: List<Int>): List<MindTestDimensionResult> {
        val dimensionCount = test.dimensions.size
        val scores = IntArray(dimensionCount)
        val maxima = IntArray(dimensionCount)

        test.questions.forEach { question ->
            val questionMaxima = IntArray(dimensionCount)
            question.options.indices.forEach { optionIndex ->
                val dimension = question.scores?.getOrNull(optionIndex) ?: optionIndex
                val value = question.values?.getOrNull(optionIndex) ?: 1
                if (dimension in 0 until dimensionCount) {
                    questionMaxima[dimension] = maxOf(questionMaxima[dimension], value)
                }
            }
            questionMaxima.indices.forEach { maxima[it] += questionMaxima[it] }
        }

        answers.forEachIndexed { questionIndex, answerIndex ->
            val question = test.questions.getOrNull(questionIndex) ?: return@forEachIndexed
            if (answerIndex !in question.options.indices) return@forEachIndexed
            val dimension = question.scores?.getOrNull(answerIndex) ?: answerIndex
            val value = question.values?.getOrNull(answerIndex) ?: 1
            if (dimension in 0 until dimensionCount) scores[dimension] += value
        }

        return test.dimensions.mapIndexed { index, dimension ->
            val maximum = maxima[index]
            val percentage = if (maximum > 0) ((scores[index] * 100.0) / maximum).roundToInt().coerceIn(0, 100) else 0
            MindTestDimensionResult(dimension.label, dimension.description, scores[index], maximum, percentage)
        }
    }

    private fun parseDefinition(json: JSONObject): MindTestDefinition {
        val dimensionArray = json.getJSONArray("dimensions")
        val dimensions = (0 until dimensionArray.length()).map { index ->
            val item = dimensionArray.getJSONObject(index)
            MindTestDimension(item.optString("label"), item.optString("description"))
        }
        val questionArray = json.getJSONArray("questions")
        val questions = (0 until questionArray.length()).map { index ->
            val item = questionArray.getJSONObject(index)
            MindTestQuestion(
                prompt = item.getString("prompt"),
                options = item.getJSONArray("options").toStringList(),
                scores = item.optJSONArray("scores")?.toIntList(),
                values = item.optJSONArray("values")?.toIntList()
            )
        }
        return MindTestDefinition(
            slug = json.getString("slug"),
            title = json.getString("title"),
            intro = json.optString("intro"),
            dimensions = dimensions,
            questions = questions
        )
    }

    private fun JSONArray.toStringList(): List<String> =
        (0 until length()).map { getString(it) }

    private fun JSONArray.toIntList(): List<Int> =
        (0 until length()).map { getInt(it) }
}
