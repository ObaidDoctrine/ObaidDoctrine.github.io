import { test, expect, devices } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_TEST_BASE_URL || "https://www.obaiddoctrine.com";

const englishTests = [
  "emotional-intelligence",
  "communication-style",
  "self-awareness",
  "conflict-style",
  "motivation-goals",
  "decision-making-style",
  "relationship-communication",
  "resilience-adaptability",
  "stress-response",
  "personality-traits",
];

const authRoutes = [
  "/account/",
  "/account/login/",
  "/account/signup/",
  "/account/register/",
  "/account/forgot-password/",
  "/account/reset-password/",
  "/account/logout/",
  "/account/profile/",
  "/member/",
  "/member/dashboard/",
  "/ur/account/",
  "/ur/account/login/",
  "/ur/account/signup/",
  "/ur/account/register/",
  "/ur/account/forgot-password/",
  "/ur/account/reset-password/",
  "/ur/account/logout/",
  "/ur/account/profile/",
  "/ur/member/",
  "/ur/member/dashboard/",
];

async function assertPublicPage(page, path) {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  expect(response, `No response for ${path}`).not.toBeNull();
  expect(response.status(), `HTTP status for ${path}`).toBe(200);

  const forbiddenLinks = await page.locator('a[href*="/account/"], a[href*="/member/"]').evaluateAll(
    els => els.map(e => e.getAttribute("href"))
  );
  expect(forbiddenLinks, `Auth/member links on ${path}`).toEqual([]);

  const forbiddenScripts = await page.locator("script[src]").evaluateAll(els =>
    els.map(e => e.getAttribute("src")).filter(src =>
      /(^|\/)(account|member)\/|firebase/i.test(src || "")
    )
  );
  expect(forbiddenScripts, `Auth scripts on ${path}`).toEqual([]);

  expect(errors, `Uncaught page errors on ${path}`).toEqual([]);
}

test.describe("Public website smoke coverage", () => {
  test("English homepage is public and account-free", async ({ page }) => {
    await assertPublicPage(page, "/");
    await expect(page.locator("h1")).toContainText("BETTER MIND.");
    await expect(page.locator('a[href="/mind-tests/"]').first()).toBeVisible();
  });

  test("featured homepage Mind Test cards meet WCAG AA contrast in default, hover and focus states", async ({ page }) => {
    await assertPublicPage(page, "/");
    const cards = page.locator(".home-page .mind-feature .test-card");
    await expect(cards).toHaveCount(5);

    const inspect = async card => card.evaluate(el => {
      const rgb = value => {
        const m = value.match(/[\\d.]+/g);
        return m ? m.slice(0, 3).map(Number) : null;
      };
      const luminance = color => {
        const channels = rgb(color);
        if (!channels) return null;
        const linear = channels.map(v => {
          const c = v / 255;
          return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
      };
      const ratio = (foreground, background) => {
        const a = luminance(foreground), b = luminance(background);
        return a === null || b === null ? null : (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      };
      const style = getComputedStyle(el);
      const title = el.querySelector("strong");
      const description = el.querySelector(":scope > span:last-child");
      const badge = el.querySelector(".test-no");
      return {
        background: style.backgroundColor,
        cardText: style.color,
        titleColor: title ? getComputedStyle(title).color : null,
        descriptionColor: description ? getComputedStyle(description).color : null,
        badgeColor: badge ? getComputedStyle(badge).color : null,
        badgeBackground: badge ? getComputedStyle(badge).backgroundColor : null,
        ratios: {
          card: ratio(style.color, style.backgroundColor),
          title: title ? ratio(getComputedStyle(title).color, style.backgroundColor) : null,
          description: description ? ratio(getComputedStyle(description).color, style.backgroundColor) : null,
          badge: badge ? ratio(getComputedStyle(badge).color, getComputedStyle(badge).backgroundColor) : null,
        },
      };
    });

    for (const card of await cards.all()) {
      const colors = await inspect(card);
      expect(colors.background).toBe("rgb(37, 75, 53)");
      expect(colors.cardText).toBe("rgb(255, 255, 255)");
      expect(colors.titleColor).toBe("rgb(255, 255, 255)");
      expect(colors.descriptionColor).toBe("rgb(230, 238, 231)");
      expect(colors.badgeBackground).toBe("rgb(216, 239, 131)");
      for (const [element, contrast] of Object.entries(colors.ratios)) {
        expect(contrast, `${element} contrast ratio: ${contrast}`).not.toBeNull();
        expect(contrast, `${element} must meet WCAG 2.2 AA`).toBeGreaterThanOrEqual(4.5);
      }

      await card.hover();
      const hovered = await inspect(card);
      expect(hovered.background).toBe("rgb(37, 75, 53)");
      expect(hovered.ratios.description).toBeGreaterThanOrEqual(4.5);

      await card.focus();
      const focus = await card.evaluate(el => ({
        visible: getComputedStyle(el).outlineStyle !== "none" && parseFloat(getComputedStyle(el).outlineWidth) >= 3,
        color: getComputedStyle(el).outlineColor,
      }));
      expect(focus.visible, "keyboard focus outline must be visible").toBeTruthy();
    }
  });

  test("featured homepage Mind Test cards remain readable on mobile", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    try {
      const page = await context.newPage();
      await assertPublicPage(page, "/");
      const cards = page.locator(".home-page .mind-feature .test-card");
      await expect(cards).toHaveCount(5);
      for (const card of await cards.all()) {
        await expect(card).toBeVisible();
        const result = await card.evaluate(el => {
          const style = getComputedStyle(el);
          const title = el.querySelector("strong");
          const description = el.querySelector(":scope > span:last-child");
          return {
            background: style.backgroundColor,
            title: title ? getComputedStyle(title).color : null,
            description: description ? getComputedStyle(description).color : null,
            width: el.getBoundingClientRect().width,
          };
        });
        expect(result.background).toBe("rgb(37, 75, 53)");
        expect(result.title).toBe("rgb(255, 255, 255)");
        expect(result.description).toBe("rgb(230, 238, 231)");
        expect(result.width).toBeGreaterThan(0);
      }
    } finally {
      await context.close();
    }
  });

  test("Urdu homepage is public and account-free", async ({ page }) => {
    await assertPublicPage(page, "/ur/");
    await expect(page.locator("html")).toHaveAttribute("lang", "ur");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  test("English and Urdu language switchers work", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.locator('a[href="/ur/"]').first().click();
    await expect(page).toHaveURL(/\/ur\/$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

    await page.goto("/ur/", { waitUntil: "domcontentloaded" });
    await page.locator('a[href="/"]').first().click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("public sitemap and robots are reachable", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).not.toContain("/account/");
    expect(await sitemap.text()).not.toContain("/member/");

    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain("Sitemap:");
  });

  test("manifest and service worker are reachable", async ({ request }) => {
    expect((await request.get("/manifest.json")).status()).toBe(200);
    expect((await request.get("/sw.js")).status()).toBe(200);
  });
});

test.describe("Negative authentication/member routes", () => {
  for (const path of authRoutes) {
    test(`removed route returns 404: ${path}`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.status(), path).toBe(404);
    });
  }
});

test.describe("Mind Tests", () => {
  const cases = [
    ...englishTests.map(slug => ({ lang: "en", path: `/mind-tests/${slug}/` })),
    ...englishTests.map(slug => ({ lang: "ur", path: `/ur/mind-tests/${slug}/` })),
  ];

  test("individual Mind Test title sits close to the sticky header on desktop in English and Urdu", async ({ page }) => {
    for (const path of ["/mind-tests/self-awareness/", "/ur/mind-tests/self-awareness/"]) {
      await assertPublicPage(page, path);
      const measured = await page.evaluate(() => {
        const header = document.querySelector(".site-header");
        const hero = document.querySelector("body:has(#test) .page-hero");
        const title = hero?.querySelector("h1");
        if (!header || !hero || !title) return null;
        const headerRect = header.getBoundingClientRect();
        const heroRect = hero.getBoundingClientRect();
        const titleRect = title.getBoundingClientRect();
        return {
          headerBottom: headerRect.bottom,
          heroTop: heroRect.top,
          titleTop: titleRect.top,
          gapFromHeader: titleRect.top - headerRect.bottom,
          gapInsideHero: titleRect.top - heroRect.top,
          paddingTop: getComputedStyle(hero).paddingTop,
          paddingBottom: getComputedStyle(hero).paddingBottom,
        };
      });
      expect(measured, `header/hero/title geometry missing for ${path}`).not.toBeNull();
      expect(measured.gapFromHeader, `unexpected title gap for ${path}: ${JSON.stringify(measured)}`).toBeGreaterThanOrEqual(0);
      expect(measured.gapFromHeader, `excessive blank space for ${path}: ${JSON.stringify(measured)}`).toBeLessThanOrEqual(60);
      expect(measured.gapInsideHero, `hero top gap does not match compact spacing for ${path}`).toBeLessThanOrEqual(45);
      expect(measured.paddingTop).toBe("42px");
      expect(measured.paddingBottom).toBe("30px");
    }
  });

  for (const item of cases) {
    test(`${item.lang} Mind Test works without an account: ${item.path}`, async ({ page }) => {
      await assertPublicPage(page, item.path);
      const options = page.locator(".od-test-option:not(.od-locked)");
      await expect(options.first()).toBeVisible();

      for (let i = 0; i < 10; i++) {
        await expect(options.first()).toBeVisible();
        await expect(options.first()).toBeEnabled({ timeout: 3000 });
        // Center the target so the sticky site header cannot intercept the click.
        await options.first().evaluate(el => el.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" }));
        await options.first().click();

        if (i < 9) {
          // The test engine advances asynchronously; wait for the next question
          // instead of racing the 180 ms transition.
          await expect(page.locator(".od-test-progress span").first()).toContainText(String(i + 2));
        } else {
          await expect(page.locator("#result")).toBeVisible();
        }
      }

      await expect(page.locator("#result")).toBeVisible();
      await expect(page.locator("#result .btn.primary")).toBeVisible();

      await page.locator("#result .btn.primary").click();
      await expect(page.locator("#test")).toBeVisible();
      await expect(page.locator(".od-test-option").first()).toBeVisible();
    });
  }
});

test.describe("Mind Tests mobile viewport", () => {
  test("individual Mind Test title sits close to the sticky header on mobile in English and Urdu", async ({ browser }) => {
    const context = await browser.newContext({ ...devices["Pixel 5"], viewport: { width: 390, height: 844 } });
    try {
      const page = await context.newPage();
      for (const path of ["/mind-tests/self-awareness/", "/ur/mind-tests/self-awareness/"]) {
        await assertPublicPage(page, path);
        const measured = await page.evaluate(() => {
          const header = document.querySelector(".site-header");
          const hero = document.querySelector("body:has(#test) .page-hero");
          const title = hero?.querySelector("h1");
          if (!header || !hero || !title) return null;
          const headerRect = header.getBoundingClientRect();
          const heroRect = hero.getBoundingClientRect();
          const titleRect = title.getBoundingClientRect();
          return {
            headerBottom: headerRect.bottom,
            heroTop: heroRect.top,
            titleTop: titleRect.top,
            gapFromHeader: titleRect.top - headerRect.bottom,
            gapInsideHero: titleRect.top - heroRect.top,
            paddingTop: getComputedStyle(hero).paddingTop,
            paddingBottom: getComputedStyle(hero).paddingBottom,
          };
        });
        expect(measured, `header/hero/title geometry missing for ${path}`).not.toBeNull();
        expect(measured.gapFromHeader, `unexpected title gap for ${path}: ${JSON.stringify(measured)}`).toBeGreaterThanOrEqual(0);
        expect(measured.gapFromHeader, `excessive mobile blank space for ${path}: ${JSON.stringify(measured)}`).toBeLessThanOrEqual(45);
        expect(measured.gapInsideHero, `hero top gap does not match compact spacing for ${path}`).toBeLessThanOrEqual(32);
        expect(measured.paddingTop).toBe("28px");
        expect(measured.paddingBottom).toBe("22px");
      }
    } finally {
      await context.close();
    }
  });

  test("English Mind Test remains usable on mobile", async ({ browser }) => {
    const context = await browser.newContext({ ...devices["Pixel 5"] });
    try {
      const page = await context.newPage();
      await assertPublicPage(page, "/mind-tests/emotional-intelligence/");
      await expect(page.locator(".od-test-option").first()).toBeVisible();
      for (let i = 0; i < 10; i++) {
        const option = page.locator(".od-test-option:not(.od-locked)").first();
        await expect(option).toBeVisible();
        await expect(option).toBeEnabled({ timeout: 3000 });
        // Center the target so the sticky site header cannot intercept the click.
        await option.evaluate(el => el.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" }));
        await option.click();

        if (i < 9) {
          // Wait for the delayed question transition before selecting again.
          await expect(page.locator(".od-test-progress span").first()).toContainText(String(i + 2));
        } else {
          await expect(page.locator("#result")).toBeVisible();
        }
      }
      await expect(page.locator("#result")).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test("Urdu Mind Test remains usable on mobile", async ({ browser }) => {
    const context = await browser.newContext({ ...devices["Pixel 5"] });
    try {
      const page = await context.newPage();
      await assertPublicPage(page, "/ur/mind-tests/emotional-intelligence/");
      await expect(page.locator(".od-test-option").first()).toBeVisible();
      for (let i = 0; i < 10; i++) {
        const option = page.locator(".od-test-option:not(.od-locked)").first();
        await expect(option).toBeVisible();
        await expect(option).toBeEnabled({ timeout: 3000 });
        // Center the target so the sticky site header cannot intercept the click.
        await option.evaluate(el => el.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" }));
        await option.click();

        if (i < 9) {
          // Wait for the delayed question transition before selecting again.
          await expect(page.locator(".od-test-progress span").first()).toContainText(String(i + 2));
        } else {
          await expect(page.locator("#result")).toBeVisible();
        }
      }
      await expect(page.locator("#result")).toBeVisible();
    } finally {
      await context.close();
    }
  });
});
