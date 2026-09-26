/* OBAID DOCTRINE — production test engine
 * Shared by all 20 Mind Tests. No backend, counters, or fabricated ratings are used here.
 * Version: 2026-09-27
 */
(function () {
  "use strict";

  var source = typeof questions !== "undefined" ? questions :
               (typeof Q !== "undefined" ? Q : null);
  if (!Array.isArray(source) || !source.length) {
    console.error("OBAID DOCTRINE test engine: no supported question set found.");
    return;
  }

  var dimensionData = typeof dimensions !== "undefined" ? dimensions :
                   (typeof D !== "undefined" ? D : null);
  var labelData = typeof labels !== "undefined" ? labels : null;
  var descriptionData = typeof desc !== "undefined" ? desc : null;

  var items = source.slice(0, 10);
  var isRTL = document.documentElement.dir === "rtl";
  var pathKey = location.pathname.replace(/\/+$/, "") || "/";
  var storageKey = "od-test-state:" + pathKey;
  var state = { index: 0, answers: [], locked: false, completed: false };

  try {
    var saved = JSON.parse(sessionStorage.getItem(storageKey) || "null");
    if (saved && Array.isArray(saved.answers) && Number.isInteger(saved.index) &&
        saved.index >= 0 && saved.index <= items.length) {
      state.index = saved.index;
      state.answers = saved.answers.slice(0, items.length);
      state.completed = state.index >= items.length;
    }
  } catch (_) {}

  function save() {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({
        index: state.index,
        answers: state.answers
      }));
    } catch (_) {}
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getQuestion(q) {
    return {
      text: q[0],
      options: Array.isArray(q[1]) ? q[1] : [],
      scores: Array.isArray(q[2]) ? q[2] : null
    };
  }

  function scoreAnswers() {
    var count = dimensionData && dimensionData.length ? dimensionData.length :
                labelData && labelData.length ? labelData.length : 5;
    var scores = Array(count).fill(0);
    state.answers.forEach(function (answer, index) {
      var q = getQuestion(items[index]);
      var score = q.scores ? q.scores[answer] : answer;
      if (Number.isInteger(score) && score >= 0 && score < scores.length) {
        scores[score] += 1;
      }
    });
    return scores;
  }

  function labelAt(index) {
    if (dimensionData && dimensionData[index]) return dimensionData[index][0];
    if (labelData && labelData[index]) return labelData[index];
    return isRTL ? "نمایاں رجحان" : "Strongest tendency";
  }

  function descAt(index) {
    if (dimensionData && dimensionData[index]) return dimensionData[index][1];
    if (descriptionData && descriptionData[index]) return descriptionData[index];
    return isRTL
      ? "یہ نتیجہ اس مختصر تعلیمی خود شناسی ٹول میں آپ کے جوابات کے ایک نمایاں رجحان کو بیان کرتا ہے۔"
      : "This result describes a response tendency within this short educational self-reflection tool.";
  }

  function testName() {
    var h1 = document.querySelector("main h1, h1");
    return h1 ? h1.textContent.trim() : document.title.replace(/\s*\|.*$/, "").trim();
  }

  function injectStyles() {
    if (document.getElementById("od-test-engine-styles")) return;
    var style = document.createElement("style");
    style.id = "od-test-engine-styles";
    style.textContent = [
      ".od-test-progress{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:18px;font-weight:800;color:#31543A;font-size:13px}",
      ".od-test-progress-bar{height:7px;background:#DCE8B5;border-radius:999px;overflow:hidden;margin:0 0 26px}",
      ".od-test-progress-bar>span{display:block;height:100%;background:#B7D84B;border-radius:inherit;transition:width .2s ease}",
      ".od-test-option{position:relative;display:block;width:100%;text-align:start;cursor:pointer}",
      ".od-test-option.od-selected{background:#C62828!important;border-color:#C62828!important;color:#fff!important;box-shadow:0 8px 22px rgba(198,40,40,.18)!important}",
      ".od-test-option.od-locked{cursor:not-allowed;opacity:.92}",
      ".od-test-share{display:flex;flex-wrap:wrap;gap:9px;margin-top:22px}",
      ".od-test-share button,.od-test-share a{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:9px 13px;border:1px solid rgba(49,84,58,.16);border-radius:999px;background:#fff;color:#31543A;text-decoration:none;font:700 12px/1 Inter,Arial,sans-serif;cursor:pointer}",
      ".od-test-share button:hover,.od-test-share a:hover{border-color:#31543A}",
      ".od-test-note{margin-top:18px;padding:14px 16px;border-left:4px solid #B7D84B;background:#F8FAF0;border-radius:0 12px 12px 0;color:#59655c;line-height:1.7}",
      "html[dir=rtl] .od-test-share{justify-content:flex-start}",
      "@media(max-width:600px){.od-test-share{display:grid;grid-template-columns:1fr 1fr}.od-test-share button,.od-test-share a{width:100%}}"
    ].join("");
    document.head.appendChild(style);
  }

  function render() {
    var host = document.getElementById("test");
    if (!host) return;
    if (state.index >= items.length) {
      showResult();
      return;
    }

    var q = getQuestion(items[state.index]);
    state.locked = false;

    host.hidden = false;
    host.innerHTML =
      '<div class="od-test-progress">' +
        '<span>' + (isRTL ? "سوال " : "Question ") + (state.index + 1) +
        (isRTL ? " از " : " of ") + items.length + '</span>' +
        '<span>' + Math.round(((state.index) / items.length) * 100) + '%</span>' +
      '</div>' +
      '<div class="od-test-progress-bar" aria-hidden="true"><span style="width:' +
        Math.round((state.index / items.length) * 100) + '%"></span></div>' +
      '<div class="test-question">' +
        '<h2>' + esc(q.text) + '</h2>' +
        q.options.map(function (option, j) {
          return '<button type="button" class="test-option od-test-option" data-answer="' + j +
            '" aria-label="' + esc(option) + '">' + esc(option) + '</button>';
        }).join("") +
      '</div>';

    host.querySelectorAll(".od-test-option").forEach(function (button) {
      button.addEventListener("click", function () { choose(Number(button.dataset.answer), button); });
    });
  }

  function choose(answerIndex, selectedButton) {
    if (state.locked || state.index >= items.length) return;
    var q = getQuestion(items[state.index]);
    if (!q.options[answerIndex]) return;

    state.locked = true;
    state.answers[state.index] = answerIndex;
    save();

    var buttons = document.querySelectorAll(".od-test-option");
    buttons.forEach(function (button) {
      button.disabled = true;
      button.classList.add("od-locked");
    });
    selectedButton.classList.add("od-selected");
    selectedButton.setAttribute("aria-pressed", "true");

    window.setTimeout(function () {
      state.index += 1;
      save();
      render();
      var target = document.getElementById("test");
      if (target) window.scrollTo({ top: Math.max(0, target.offsetTop - 24), behavior: "smooth" });
    }, 220);
  }

  function shareButtons(resultLabel, score) {
    var title = testName();
    var shareText = isRTL
      ? "میں نے عبید ڈاکٹرائن کا خود شناسی ٹیسٹ مکمل کیا۔ نتیجہ: " + resultLabel + " (" + score + "/" + items.length + ")"
      : "I completed an OBAID DOCTRINE self-reflection test. Result: " + resultLabel + " (" + score + "/" + items.length + ").";
    var url = location.href;
    var encodedUrl = encodeURIComponent(url);
    var encodedText = encodeURIComponent(shareText);

    var wrap = document.createElement("div");
    wrap.className = "od-test-share";
    wrap.setAttribute("aria-label", isRTL ? "نتیجہ شیئر کریں" : "Share result");

    var native = document.createElement("button");
    native.type = "button";
    native.textContent = isRTL ? "Native Share" : "Share";
    if (navigator.share) {
      native.addEventListener("click", function () {
        navigator.share({ title: title, text: shareText, url: url }).catch(function (err) {
          if (err && err.name !== "AbortError") console.warn("Native share failed:", err);
        });
      });
    } else {
      native.textContent = isRTL ? "لنک کاپی کریں" : "Copy Link";
      native.addEventListener("click", copyLink);
    }
    wrap.appendChild(native);

    [
      ["Facebook", "https://www.facebook.com/sharer/sharer.php?u=" + encodedUrl],
      ["WhatsApp", "https://wa.me/?text=" + encodedText + "%20" + encodedUrl],
      ["LinkedIn", "https://www.linkedin.com/sharing/share-offsite/?url=" + encodedUrl],
      ["X", "https://twitter.com/intent/tweet?text=" + encodedText + "&url=" + encodedUrl]
    ].forEach(function (item) {
      var a = document.createElement("a");
      a.href = item[1];
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = item[0];
      wrap.appendChild(a);
    });

    var copy = document.createElement("button");
    copy.type = "button";
    copy.textContent = isRTL ? "لنک کاپی کریں" : "Copy Link";
    copy.addEventListener("click", copyLink);
    wrap.appendChild(copy);

    function copyLink() {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url).then(function () {
          copy.textContent = isRTL ? "کاپی ہوگیا" : "Copied";
          window.setTimeout(function () { copy.textContent = isRTL ? "لنک کاپی کریں" : "Copy Link"; }, 1500);
        }).catch(function () { window.prompt(isRTL ? "لنک کاپی کریں:" : "Copy this link:", url); });
      } else {
        window.prompt(isRTL ? "لنک کاپی کریں:" : "Copy this link:", url);
      }
    }

    return wrap;
  }

  function showResult() {
    var host = document.getElementById("test");
    var result = document.getElementById("result");
    if (!host || !result) return;

    state.completed = true;
    state.locked = true;
    save();

    var scores = scoreAnswers();
    var max = Math.max.apply(null, scores);
    var winner = scores.indexOf(max);
    var label = labelAt(winner);

    host.hidden = true;
    result.hidden = false;
    result.innerHTML =
      '<p class="eyebrow">' + (isRTL ? "آپ کا خود شناسی نتیجہ" : "YOUR REFLECTION RESULT") + '</p>' +
      '<h2>' + esc(label) + '</h2>' +
      '<p>' + esc(descAt(winner)) + '</p>' +
      '<p><strong>' + (isRTL ? "رجحانی اسکور:" : "Pattern score:") + '</strong> ' +
        max + '/' + items.length + ' ' + (isRTL ? "جوابات" : "responses") + '</p>' +
      '<div class="od-test-note"><strong>' + (isRTL ? "اہم نوٹ:" : "Important note:") + '</strong> ' +
        (isRTL
          ? "یہ ایک اصل تعلیمی self-reflection tool ہے، validated clinical scale یا diagnosis نہیں۔ نتیجہ آپ کی موجودہ جوابی ترجیحات کا ایک عمومی رجحان بیان کرتا ہے اور حالات کے ساتھ بدل سکتا ہے۔"
          : "This is an original educational self-reflection tool, not a validated clinical scale or diagnosis. The result describes a broad response tendency within this test and may vary with context and circumstances.") +
      '</div>';

    var actions = document.createElement("div");
    actions.className = "mind-test-actions";
    var retry = document.createElement("button");
    retry.type = "button";
    retry.className = "btn primary";
    retry.textContent = isRTL ? "دوبارہ ٹیسٹ دیں" : "Take Again";
    retry.addEventListener("click", function () {
      sessionStorage.removeItem(storageKey);
      state = { index: 0, answers: [], locked: false, completed: false };
      result.hidden = true;
      render();
      var target = document.getElementById("test");
      if (target) window.scrollTo({ top: Math.max(0, target.offsetTop - 24), behavior: "smooth" });
    });
    actions.appendChild(retry);
    result.appendChild(actions);
    result.appendChild(shareButtons(label, max));
  }

  injectStyles();
  render();
})();