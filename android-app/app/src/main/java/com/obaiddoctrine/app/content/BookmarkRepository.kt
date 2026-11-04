package com.obaiddoctrine.app.content

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

data class ArticleBookmark(val path: String, val title: String)

/** Small local-only bookmark store; article content itself remains on the publisher's website. */
class BookmarkRepository(context: Context) {
    private val preferences = context.applicationContext.getSharedPreferences("od_article_bookmarks", Context.MODE_PRIVATE)

    @Synchronized
    fun getAll(): List<ArticleBookmark> = runCatching {
        val array = JSONArray(preferences.getString(KEY_ITEMS, "[]") ?: "[]")
        (0 until array.length()).mapNotNull { index ->
            val item = array.optJSONObject(index) ?: return@mapNotNull null
            val path = item.optString("path")
            val title = item.optString("title")
            if (!isSafePath(path) || title.isBlank()) null else ArticleBookmark(path, title)
        }.distinctBy { it.path }
    }.getOrDefault(emptyList())

    @Synchronized
    fun isSaved(path: String): Boolean = getAll().any { it.path == path }

    @Synchronized
    fun toggle(bookmark: ArticleBookmark): Boolean {
        if (!isSafePath(bookmark.path) || bookmark.title.isBlank()) return false
        val current = getAll().toMutableList()
        val existing = current.indexOfFirst { it.path == bookmark.path }
        val saved = if (existing >= 0) {
            current.removeAt(existing)
            false
        } else {
            current.add(0, bookmark)
            true
        }
        persist(current)
        return saved
    }

    @Synchronized
    fun remove(path: String) {
        persist(getAll().filterNot { it.path == path })
    }

    private fun persist(items: List<ArticleBookmark>) {
        val array = JSONArray()
        items.forEach { item ->
            array.put(JSONObject().put("path", item.path).put("title", item.title))
        }
        preferences.edit().putString(KEY_ITEMS, array.toString()).apply()
    }

    private fun isSafePath(path: String): Boolean =
        path.startsWith("/") && !path.startsWith("//") && !path.contains("..") &&
            !path.contains("\\") && !path.contains("://")

    private companion object {
        const val KEY_ITEMS = "saved_articles_v1"
    }
}
