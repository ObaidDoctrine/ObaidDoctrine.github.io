package com.obaiddoctrine.app.content

import org.junit.Assert.assertEquals
import org.junit.Test

class MindTestScorerTest {
    private fun definition() = MindTestDefinition(
        slug = "unit-test", title = "Unit test", intro = "",
        dimensions = listOf(MindTestDimension("A", "A desc"), MindTestDimension("B", "B desc")),
        questions = listOf(
            MindTestQuestion("Q1", listOf("A", "B", "C"), listOf(0, 1, 1), listOf(1, 2, 3)),
            MindTestQuestion("Q2", listOf("A", "B"), null, null)
        ),
        guidance = MindTestGuidance("Evidence", "Limits", emptyList(), emptyList())
    )

    @Test fun usesMappingsAndMaximumAvailableWeights() {
        val result = MindTestScorer.score(definition(), listOf(2, 0))
        assertEquals(1, result[0].score); assertEquals(2, result[0].maximum); assertEquals(50, result[0].percentage)
        assertEquals(3, result[1].score); assertEquals(4, result[1].maximum); assertEquals(75, result[1].percentage)
    }

    @Test fun ignoresMissingAndOutOfRangeAnswers() {
        val result = MindTestScorer.score(definition(), listOf(-1, 99))
        assertEquals(0, result[0].score); assertEquals(0, result[1].score)
        assertEquals(2, result[0].maximum); assertEquals(4, result[1].maximum)
    }

    @Test fun defaultOptionIndexMapsToDimensionIndex() {
        val test = definition().copy(questions = listOf(MindTestQuestion("Q", listOf("A", "B"), null, null)))
        val result = MindTestScorer.score(test, listOf(1))
        assertEquals(0, result[0].score); assertEquals(1, result[1].score); assertEquals(100, result[1].percentage)
    }
}
