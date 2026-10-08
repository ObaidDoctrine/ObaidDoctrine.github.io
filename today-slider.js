(() => {
  "use strict";

  const DAILY_CONTENT = {
    "2026-10-08": {
      en: [
        { category: "PSYCHOLOGY", title: "An emotion can be real without making the interpretation attached to it automatically correct.", body: "Notice the feeling first; then examine the meaning you gave the situation.", tone: "ivory" },
        { category: "HUMAN BEHAVIOUR", title: "The same behaviour can carry different meanings in different contexts.", body: "Before judging an action, look at the situation, expectations and circumstances around it.", tone: "sage" },
        { category: "EMOTIONAL AWARENESS", title: "Naming what you feel can create a useful pause before you respond.", body: "Try describing the emotion plainly instead of immediately turning it into a conclusion.", tone: "botanical" },
        { category: "COMMUNICATION", title: "Listening to understand is different from listening only to prepare a reply.", body: "A useful conversation leaves room for the other person's meaning, not just your next sentence.", tone: "lime" },
        { category: "RELATIONSHIPS", title: "A boundary describes what you will do; it does not control another person's choice.", body: "Clear boundaries are about your actions, limits and communication—not forcing an outcome.", tone: "cream" },
        { category: "SELF-AWARENESS", title: "Separate what happened, what you assumed and what you felt.", body: "Keeping these layers distinct can make everyday reflection more precise.", tone: "olive" },
        { category: "THINKING", title: "A confident thought is not automatically a well-supported conclusion.", body: "Ask what you observed, what you inferred and what evidence could change your view.", tone: "natural" },
        { category: "SOCIAL BEHAVIOUR", title: "Expectations can influence how we interpret another person's behaviour.", body: "When possible, check the actual evidence before turning an impression into a judgment.", tone: "mist" },
        { category: "PERSONAL GROWTH", title: "A broad goal becomes easier to review when it becomes a small observable action.", body: "Define the next action clearly enough that you can tell whether you actually did it.", tone: "warm" },
        { category: "LIFE OBSERVATION", title: "Silence can have many meanings; a question is often safer than a motive.", body: "When the context is unclear, ask before deciding what another person intended.", tone: "stone" }
      ],
      ur: [
        { category: "نفسیات", title: "جذبات حقیقی ہو سکتے ہیں، لیکن ان سے جڑی ہماری تشریح لازماً درست نہیں ہوتی۔", body: "پہلے احساس کو پہچانیں، پھر اس معنی پر غور کریں جو آپ نے صورتحال کو دیا ہے۔", tone: "ivory" },
        { category: "انسانی رویّے", title: "ایک ہی رویّے کا مطلب مختلف حالات میں مختلف ہو سکتا ہے۔", body: "کسی عمل پر فیصلہ دینے سے پہلے اس کے حالات، توقعات اور سیاق کو دیکھیں۔", tone: "sage" },
        { category: "جذباتی آگاہی", title: "اپنے احساس کا نام لینا ردِعمل سے پہلے ایک مفید وقفہ پیدا کر سکتا ہے۔", body: "فوراً نتیجہ نکالنے کے بجائے پہلے احساس کو سادہ الفاظ میں بیان کرنے کی کوشش کریں۔", tone: "botanical" },
        { category: "ابلاغ", title: "سمجھنے کے لیے سننا، صرف جواب تیار کرنے کے لیے سننے سے مختلف ہے۔", body: "اچھی گفتگو میں دوسرے شخص کے مطلب کے لیے بھی جگہ ہوتی ہے، صرف آپ کے اگلے جملے کے لیے نہیں۔", tone: "lime" },
        { category: "تعلقات", title: "حد اس بات کو واضح کرتی ہے کہ آپ کیا کریں گے؛ یہ دوسرے کے انتخاب کو قابو نہیں کرتی۔", body: "واضح حدود آپ کے عمل، حد اور گفتگو سے متعلق ہوتی ہیں، کسی نتیجے کو زبردستی حاصل کرنے سے نہیں۔", tone: "cream" },
        { category: "خود آگاہی", title: "جو ہوا، آپ نے کیا سمجھا، اور آپ نے کیا محسوس کیا—ان تینوں کو الگ رکھیں۔", body: "یہ فرق روزمرہ خود احتسابی کو زیادہ واضح اور محتاط بنا سکتا ہے۔", tone: "olive" },
        { category: "سوچ", title: "کسی خیال پر پختہ یقین اسے خود بخود مضبوط نتیجہ نہیں بنا دیتا۔", body: "پوچھیں: میں نے کیا دیکھا، کیا نتیجہ اخذ کیا، اور کون سا ثبوت میری رائے بدل سکتا ہے؟", tone: "natural" },
        { category: "سماجی رویّے", title: "توقعات اس بات پر اثر ڈال سکتی ہیں کہ ہم دوسرے کے رویّے کو کیسے سمجھتے ہیں۔", body: "ممکن ہو تو تاثر کو فیصلہ بنانے سے پہلے اصل شواہد دیکھیں۔", tone: "mist" },
        { category: "ذاتی ترقی", title: "ایک وسیع مقصد اس وقت زیادہ قابلِ جائزہ بن جاتا ہے جب اسے ایک چھوٹے قابلِ مشاہدہ عمل میں بدلا جائے۔", body: "اگلا قدم اتنا واضح رکھیں کہ آپ جان سکیں: کیا میں نے واقعی یہ کیا؟", tone: "warm" },
        { category: "زندگی کا مشاہدہ", title: "خاموشی کے کئی مطلب ہو سکتے ہیں؛ نیت فرض کرنے سے بہتر ہے سوال کرنا۔", body: "جب سیاق واضح نہ ہو تو دوسرے شخص کی نیت طے کرنے سے پہلے پوچھیں۔", tone: "stone" }
      ]
    }
  };

  const FALLBACK_KEY = "2026-10-08";
  const section = document.querySelector("[data-od-today]");
  if (!section) return;

  const slidesRoot = section.querySelector("[data-od-today-slides]");
  const count = section.querySelector("[data-od-today-count]");
  const live = section.querySelector("[data-od-today-live]");
  const prev = section.querySelector("[data-od-today-prev]");
  const next = section.querySelector("[data-od-today-next]");
  const dots = section.querySelector("[data-od-today-dots]");
  const lang = document.documentElement.lang.toLowerCase().startsWith("ur") ? "ur" : "en";
  const direction = lang === "ur" ? "rtl" : "ltr";

  function localDateKey() {
    const now = new Date();
    return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
  }

  const key = localDateKey();
  const set = DAILY_CONTENT[key] || DAILY_CONTENT[FALLBACK_KEY];
  const items = set[lang] || set.en;
  if (!Array.isArray(items) || items.length === 0) return;

  const slides = items.slice(0, 10);
  const slideElements = [];
  slidesRoot.replaceChildren();
  dots.replaceChildren();

  slides.forEach((item, index) => {
    const article = document.createElement("article");
    article.className = "od-today-slide od-today-tone-" + item.tone;
    article.id = "od-today-slide-" + (index + 1);
    article.dir = direction;
    article.setAttribute("role", "group");
    article.setAttribute("aria-roledescription", "slide");
    article.setAttribute("aria-label", (index + 1) + " / " + slides.length);
    article.hidden = index !== 0;

    const top = document.createElement("div");
    top.className = "od-today-slide-top";
    const category = document.createElement("span");
    category.className = "od-today-category";
    category.textContent = item.category;
    const slideIndex = document.createElement("span");
    slideIndex.className = "od-today-index";
    slideIndex.textContent = String(index + 1).padStart(2, "0") + " / " + String(slides.length).padStart(2, "0");
    top.append(category, slideIndex);

    const title = document.createElement("h3");
    title.className = "od-today-title";
    title.textContent = item.title;

    const body = document.createElement("p");
    body.className = "od-today-body";
    body.textContent = item.body;

    article.append(top, title, body);
    slidesRoot.appendChild(article);
    slideElements.push(article);

    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "od-today-dot";
    dot.setAttribute("aria-label", (lang === "ur" ? "سلائیڈ " : "Slide ") + (index + 1));
    dot.setAttribute("aria-controls", article.id);
    dot.setAttribute("aria-pressed", index === 0 ? "true" : "false");
    dot.addEventListener("click", () => show(index, true));
    dots.appendChild(dot);
  });

  let current = 0;
  let timer = null;
  let paused = false;
  const interval = 6000;

  function show(index, userAction) {
    current = (index + slides.length) % slides.length;
    slideElements.forEach((slide, i) => {
      slide.hidden = i !== current;
      slide.setAttribute("aria-hidden", i === current ? "false" : "true");
    });
    [...dots.children].forEach((dot, i) => dot.setAttribute("aria-pressed", i === current ? "true" : "false"));
    count.textContent = String(current + 1).padStart(2, "0") + " / " + String(slides.length).padStart(2, "0");
    live.textContent = lang === "ur" ? "آج کی بصیرت، سلائیڈ " + (current + 1) : "Today's insight, slide " + (current + 1);
    if (userAction) startAutoplay();
  }

  function stop() {
    if (timer) {
      window.clearTimeout(timer);
      timer = null;
    }
  }

  function startAutoplay() {
    stop();
    if (!paused && !document.hidden) {
      timer = window.setTimeout(() => {
        show(current + 1, false);
        startAutoplay();
      }, interval);
    }
  }

  function pauseAutoplay() {
    paused = true;
    stop();
  }

  function resumeAutoplay() {
    paused = false;
    startAutoplay();
  }

  prev.addEventListener("click", () => show(current - 1, true));
  next.addEventListener("click", () => show(current + 1, true));
  section.addEventListener("mouseenter", pauseAutoplay);
  section.addEventListener("mouseleave", resumeAutoplay);
  section.addEventListener("focusin", pauseAutoplay);
  section.addEventListener("focusout", event => {
    if (!section.contains(event.relatedTarget)) resumeAutoplay();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (!paused) startAutoplay();
  });

  count.textContent = "01 / " + String(slides.length).padStart(2, "0");
  live.textContent = lang === "ur" ? "آج کی بصیرت، سلائیڈ 1" : "Today's insight, slide 1";
  startAutoplay();
})();