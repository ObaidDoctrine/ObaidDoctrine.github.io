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

data class MindTestGuidance(
    val evidence: String,
    val limitations: String,
    val recommendations: List<String>,
    val reflections: List<String>
)

data class MindTestDefinition(
    val slug: String,
    val title: String,
    val intro: String,
    val dimensions: List<MindTestDimension>,
    val questions: List<MindTestQuestion>,
    val guidance: MindTestGuidance
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

    fun score(test: MindTestDefinition, answers: List<Int>): List<MindTestDimensionResult> =
        MindTestScorer.score(test, answers)

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
        val guidanceJson = json.optJSONObject("guidance") ?: JSONObject()
        val guidance = MindTestGuidance(
            evidence = guidanceJson.optString("evidence"),
            limitations = guidanceJson.optString("limitations"),
            recommendations = guidanceJson.optJSONArray("recommendations").toStringListOrEmpty(),
            reflections = guidanceJson.optJSONArray("reflections").toStringListOrEmpty()
        )
        return MindTestDefinition(
            slug = json.getString("slug"),
            title = json.getString("title"),
            intro = json.optString("intro"),
            dimensions = dimensions,
            questions = questions,
            guidance = guidance
        )
    }

    private fun JSONArray.toStringList(): List<String> =
        (0 until length()).map { getString(it) }

    private fun JSONArray.toIntList(): List<Int> =
        (0 until length()).map { getInt(it) }

    private fun JSONArray?.toStringListOrEmpty(): List<String> =
        this?.let { array -> (0 until array.length()).map { index -> array.getString(index) } } ?: emptyList()
}
