package com.obaiddoctrine.app.content

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.jsoup.Jsoup
import org.jsoup.nodes.Element

data class ArticleSummary(
    val path: String,
    val title: String,
    val category: String,
    val excerpt: String
)

enum class ArticleBlockType { TITLE, HEADING, PARAGRAPH, BULLET, NUMBERED, CALLOUT }

data class ArticleBlock(val type: ArticleBlockType, val text: String)

data class ArticleContent(
    val path: String,
    val title: String,
    val blocks: List<ArticleBlock>
)

/**
 * Reads the published English and Urdu article pages as content data.
 * The app renders the extracted text with native Compose components; it never embeds a WebView.
 */
class ArticleContentRepository {
    suspend fun fetchArticles(isUrdu: Boolean): List<ArticleSummary> = withContext(Dispatchers.IO) {
        val indexPath = if (isUrdu) "/ur/articles/" else "/articles/"
        val document = Jsoup.connect(BASE_URL + indexPath).timeout(TIMEOUT_MS).get()
        val anchors = document.select("a.article-card[href], .article-list a[href]")
        anchors.mapNotNull { anchor ->
            val path = safeLocalPath(anchor.attr("href")) ?: return@mapNotNull null
            val title = anchor.selectFirst("strong, h2, h3")?.text()?.trim().orEmpty()
                .ifBlank { anchor.text().trim() }
            if (title.isBlank()) return@mapNotNull null
            val category = anchor.selectFirst(".category, span")?.text()?.trim().orEmpty()
                .ifBlank { if (isUrdu) "مضامین" else "Articles" }
            val excerpt = anchor.select("p, span").lastOrNull()?.text()?.trim().orEmpty()
            ArticleSummary(path, title, category, excerpt)
        }.distinctBy { it.path }
    }

    suspend fun fetchArticle(path: String): ArticleContent = withContext(Dispatchers.IO) {
        val localPath = safeLocalPath(path) ?: throw IllegalArgumentException("Invalid article address.")
        val document = Jsoup.connect(BASE_URL + localPath).timeout(TIMEOUT_MS).get()
        val article = document.selectFirst("article.article-body") ?: document.selectFirst("main")
            ?: throw IllegalStateException("Article content is not available.")
        val title = document.selectFirst("main h1")?.text()?.trim()
            ?: document.title().substringBefore("|").trim()
        val blocks = mutableListOf<ArticleBlock>()
        article.children().forEach { appendBlocks(it, blocks) }
        ArticleContent(localPath, title, blocks.filter { it.text.isNotBlank() })
    }

    private fun appendBlocks(element: Element, output: MutableList<ArticleBlock>) {
        when (element.tagName().lowercase()) {
            "h1" -> output += ArticleBlock(ArticleBlockType.TITLE, element.text())
            "h2", "h3" -> output += ArticleBlock(ArticleBlockType.HEADING, element.text())
            "p", "blockquote" -> {
                val text = element.text().trim()
                if (text.isNotBlank()) {
                    val isCallout = element.hasClass("notice") || element.hasClass("article-takeaway")
                    output += ArticleBlock(if (isCallout) ArticleBlockType.CALLOUT else ArticleBlockType.PARAGRAPH, text)
                }
            }
            "ul" -> element.select("> li").forEach { output += ArticleBlock(ArticleBlockType.BULLET, it.text()) }
            "ol" -> element.select("> li").forEach { output += ArticleBlock(ArticleBlockType.NUMBERED, it.text()) }
            "li" -> output += ArticleBlock(ArticleBlockType.BULLET, element.text())
            "script", "style", "nav", "footer", "form" -> Unit
            else -> element.children().forEach { appendBlocks(it, output) }
        }
    }

    private fun safeLocalPath(raw: String): String? {
        if (raw.isBlank()) return null
        val path = if (raw.startsWith("http://") || raw.startsWith("https://")) {
            val parsed = java.net.URI(raw)
            if (parsed.host != "www.obaiddoctrine.com" && parsed.host != "obaiddoctrine.com") return null
            parsed.path
        } else raw.substringBefore('#').substringBefore('?')
        if (!path.startsWith("/") || path.startsWith("//") || path.contains("..")) return null
        return path
    }

    companion object {
        private const val BASE_URL = "https://www.obaiddoctrine.com"
        private const val TIMEOUT_MS = 20_000
    }
}
