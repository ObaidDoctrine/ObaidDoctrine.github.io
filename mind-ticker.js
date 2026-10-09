(() => {
  "use strict";
  const TICKER = {
    en: [
      "Pause before you react.",
      "A thought is not always a fact.",
      "Ask before assuming intent.",
      "Small habits build through repetition.",
      "Listen to understand, not just to reply.",
      "Progress matters more than perfect timing.",
      "Name the feeling; check the facts.",
      "A boundary explains your own limits.",
      "Curiosity can soften quick judgment.",
      "Choose one useful next step."
    ],
    ur: [
      "ردِعمل سے پہلے ایک لمحہ رکیں۔",
      "ہر خیال حقیقت نہیں ہوتا۔",
      "نیت فرض کرنے سے پہلے پوچھیں۔",
      "چھوٹی عادتیں تکرار سے مضبوط ہوتی ہیں۔",
      "صرف جواب دینے کے لیے نہیں، سمجھنے کے لیے سنیں۔",
      "کامل وقت کے انتظار سے بہتر ہے پیش رفت۔",
      "احساس پہچانیں، حقائق بھی دیکھیں۔",
      "حدود اپنے دائرۂ اختیار کو واضح کرتی ہیں۔",
      "تجسس فوری فیصلے کو نرم کر سکتا ہے۔",
      "اگلا ایک مفید قدم چنیں۔"
    ]
  };
  const lang = document.documentElement.lang.toLowerCase().startsWith("ur") ? "ur" : "en";
  const direction = lang === "ur" ? "rtl" : "ltr";
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ticker = document.querySelector("[data-od-ticker-track]");
  const accessibleList = document.querySelector("[data-od-ticker-accessible]");
  if (ticker && accessibleList) {
    const messages = TICKER[lang] || TICKER.en;
    function makeGroup() {
      const group = document.createElement("div");
      group.className = "od-ticker-group";
      group.dir = direction;
      messages.forEach((message) => {
        const item = document.createElement("span");
        item.className = "od-ticker-item";
        item.textContent = message;
        const separator = document.createElement("span");
        separator.className = "od-ticker-separator";
        separator.setAttribute("aria-hidden", "true");
        separator.textContent = "✦";
        group.append(item, separator);
      });
      return group;
    }
    ticker.replaceChildren(makeGroup(), makeGroup());
    ticker.setAttribute("aria-hidden", "true");
    accessibleList.replaceChildren();
    messages.forEach((message) => {
      const item = document.createElement("li");
      item.textContent = message;
      accessibleList.appendChild(item);
    });
    const windowElement = document.querySelector("[data-od-ticker-window]");
    if (windowElement && reduceMotion) windowElement.setAttribute("tabindex", "0");
  }
})();
