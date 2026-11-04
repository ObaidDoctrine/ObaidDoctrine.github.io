package com.obaiddoctrine.app.content

import kotlin.math.roundToInt

/** Pure scoring logic shared by the app and JVM unit tests. */
internal object MindTestScorer {
    fun score(test: MindTestDefinition, answers: List<Int>): List<MindTestDimensionResult> {
        val dimensionCount = test.dimensions.size
        val scores = IntArray(dimensionCount)
        val maxima = IntArray(dimensionCount)
        test.questions.forEach { question ->
            val questionMaxima = IntArray(dimensionCount)
            question.options.indices.forEach { optionIndex ->
                val dimension = question.scores?.getOrNull(optionIndex) ?: optionIndex
                val value = question.values?.getOrNull(optionIndex) ?: 1
                if (dimension in 0 until dimensionCount) questionMaxima[dimension] = maxOf(questionMaxima[dimension], value)
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
}
