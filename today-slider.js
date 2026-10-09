(() => {
  "use strict";
  const CONTENT = {"en":[{"category":"PSYCHOLOGY","title":"A feeling deserves attention, but it does not always tell the whole story.","body":"Name the feeling, then check the facts and context before deciding what it means.","tone":"ivory"},{"category":"HUMAN BEHAVIOUR","title":"People can respond differently to the same situation.","body":"Experience, expectations and circumstances can all shape a reaction.","tone":"sage"},{"category":"EMOTIONAL AWARENESS","title":"A short pause can help you choose a response instead of reacting automatically.","body":"Take one slow breath and identify what you need before you answer.","tone":"botanical"},{"category":"COMMUNICATION","title":"Listening to understand can change the direction of a conversation.","body":"Ask one honest question before preparing your reply.","tone":"lime"},{"category":"RELATIONSHIPS","title":"Healthy boundaries begin with clarity about your own actions.","body":"State what you can accept and what you will do respectfully.","tone":"cream"},{"category":"SELF-AWARENESS","title":"Separate what happened from what you assumed it meant.","body":"This small distinction can make reflection and decisions more balanced.","tone":"olive"},{"category":"THINKING","title":"Confidence is not the same as evidence.","body":"Ask what you observed, what you inferred and what might change your mind.","tone":"natural"},{"category":"HABITS","title":"Small actions repeated consistently can support meaningful change.","body":"Choose a next step that is specific, realistic and easy to review.","tone":"mist"},{"category":"MOTIVATION","title":"You do not need to feel ready to begin with one small step.","body":"Make the first action manageable; motivation may grow as you make progress.","tone":"warm"},{"category":"LIFE REFLECTION","title":"You cannot control every outcome, but you can choose your next response.","body":"Focus on the part of the situation that is within your influence.","tone":"stone"}],"ur":[{"category":"نفسیات","title":"احساس اہم ہے، لیکن وہ ہمیشہ پوری حقیقت نہیں بتاتا۔","body":"پہلے احساس کو پہچانیں، پھر نتیجہ نکالنے سے پہلے حقائق اور حالات دیکھیں۔","tone":"ivory"},{"category":"انسانی رویّے","title":"ایک ہی صورتحال پر لوگ مختلف ردِعمل دے سکتے ہیں۔","body":"تجربات، توقعات اور حالات کسی کے ردِعمل کو متاثر کر سکتے ہیں۔","tone":"sage"},{"category":"جذباتی آگاہی","title":"مختصر وقفہ فوری ردِعمل کے بجائے سوچ سمجھ کر جواب دینے میں مدد دے سکتا ہے۔","body":"ایک گہری سانس لیں اور جواب دینے سے پہلے اپنی ضرورت پہچانیں۔","tone":"botanical"},{"category":"گفتگو","title":"سمجھنے کے لیے سننا گفتگو کا رخ بدل سکتا ہے۔","body":"اپنا جواب تیار کرنے سے پہلے ایک مخلصانہ سوال پوچھیں۔","tone":"lime"},{"category":"تعلقات","title":"صحت مند حدود اپنے عمل کے بارے میں وضاحت سے شروع ہوتی ہیں۔","body":"احترام کے ساتھ بتائیں کہ آپ کے لیے کیا قابلِ قبول ہے اور آپ کیا کریں گے۔","tone":"cream"},{"category":"خود آگاہی","title":"جو ہوا اور جو مطلب آپ نے اخذ کیا، دونوں کو الگ رکھیں۔","body":"یہ چھوٹا سا فرق غور و فکر اور فیصلوں کو زیادہ متوازن بنا سکتا ہے۔","tone":"olive"},{"category":"سوچ","title":"یقین اور ثبوت ایک ہی چیز نہیں ہیں۔","body":"پوچھیں کہ آپ نے کیا دیکھا، کیا نتیجہ نکالا اور کون سی بات رائے بدل سکتی ہے۔","tone":"natural"},{"category":"عادات","title":"چھوٹے کاموں کی مستقل تکرار بامعنی تبدیلی میں مدد دے سکتی ہے۔","body":"اگلا قدم واضح، حقیقت پسندانہ اور جانچنے میں آسان رکھیں۔","tone":"mist"},{"category":"حوصلہ","title":"آغاز کرنے کے لیے ہر بار مکمل تیار محسوس کرنا ضروری نہیں۔","body":"پہلا قدم چھوٹا اور قابلِ عمل رکھیں؛ پیش رفت کے ساتھ حوصلہ بڑھ سکتا ہے۔","tone":"warm"},{"category":"زندگی کا شعور","title":"ہر نتیجہ آپ کے اختیار میں نہیں، مگر اگلا ردِعمل آپ چن سکتے ہیں۔","body":"صورتحال کے اس حصے پر توجہ دیں جس پر آپ کچھ اثر ڈال سکتے ہیں۔","tone":"stone"}]};
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
  const section = document.querySelector("[data-od-today]");
  const lang = document.documentElement.lang.toLowerCase().startsWith("ur") ? "ur" : "en";
  const direction = lang === "ur" ? "rtl" : "ltr";
  const items = CONTENT[lang] || CONTENT.en;
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (section) {
    const slidesRoot = section.querySelector("[data-od-today-slides]");
    const count = section.querySelector("[data-od-today-count]");
    const live = section.querySelector("[data-od-today-live]");
    const prev = section.querySelector("[data-od-today-prev]");
    const next = section.querySelector("[data-od-today-next]");
    const dots = section.querySelector("[data-od-today-dots]");
    if (slidesRoot && count && live && dots) {
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
        article.setAttribute("aria-roledescription", lang === "ur" ? "سلائیڈ" : "slide");
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
      const interval = 6500;
      function stop() {
        if (timer !== null) {
          window.clearInterval(timer);
          timer = null;
        }
      }
      function show(index, userAction) {
        current = (index + slides.length) % slides.length;
        slideElements.forEach((slide, i) => {
          slide.hidden = i !== current;
          slide.setAttribute("aria-hidden", i === current ? "false" : "true");
        });
        Array.from(dots.children).forEach((dot, i) => dot.setAttribute("aria-pressed", i === current ? "true" : "false"));
        count.textContent = String(current + 1).padStart(2, "0") + " / " + String(slides.length).padStart(2, "0");
        live.textContent = lang === "ur" ? "آج کی بصیرت، سلائیڈ " + (current + 1) : "Today's insight, slide " + (current + 1);
        if (userAction) startAutoplay();
      }
      function startAutoplay() {
        stop();
        if (reduceMotion || document.hidden || section.matches(":hover") || section.contains(document.activeElement)) return;
        timer = window.setInterval(() => show(current + 1, false), interval);
      }
      if (prev) prev.addEventListener("click", () => show(current - 1, true));
      if (next) next.addEventListener("click", () => show(current + 1, true));
      section.addEventListener("mouseenter", stop);
      section.addEventListener("mouseleave", startAutoplay);
      section.addEventListener("focusin", stop);
      section.addEventListener("focusout", () => window.setTimeout(startAutoplay, 0));
      document.addEventListener("visibilitychange", () => document.hidden ? stop() : startAutoplay());
      count.textContent = "01 / " + String(slides.length).padStart(2, "0");
      live.textContent = lang === "ur" ? "آج کی بصیرت، سلائیڈ 1" : "Today's insight, slide 1";
      startAutoplay();
    }
  }

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