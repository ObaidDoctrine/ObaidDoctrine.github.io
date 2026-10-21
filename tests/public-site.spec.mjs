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

  test("featured homepage Mind Test cards have readable contrast", async ({ page }) => {
    await assertPublicPage(page, "/");
    const cards = page.locator(".home-page .mind-feature .test-card");
    await expect(cards).toHaveCount(5);
    for (const card of await cards.all()) {
      const colors = await card.evaluate(el => {
        const cardStyle = getComputedStyle(el);
        const strong = el.querySelector("strong");
        return {
          background: cardStyle.backgroundColor,
          text: cardStyle.color,
          title: strong ? getComputedStyle(strong).color : null,
        };
      });
      expect(colors.background).toBe("rgb(37, 75, 53)");
      expect(colors.text).toBe("rgb(255, 255, 255)");
      expect(colors.title).toBe("rgb(255, 255, 255)");
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

  test("individual Mind Test hero spacing is compact on desktop", async ({ page }) => {
    await assertPublicPage(page, "/mind-tests/self-awareness/");
    const hero = page.locator("body:has(#test) .page-hero");
    await expect(hero).toBeVisible();
    const padding = await hero.evaluate(el => ({
      top: getComputedStyle(el).paddingTop,
      bottom: getComputedStyle(el).paddingBottom,
    }));
    expect(padding).toEqual({ top: "42px", bottom: "30px" });
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
  test("individual Mind Test hero spacing is compact on mobile", async ({ browser }) => {
    const context = await browser.newContext({ ...devices["Pixel 5"] });
    try {
      const page = await context.newPage();
      await assertPublicPage(page, "/mind-tests/self-awareness/");
      const hero = page.locator("body:has(#test) .page-hero");
      await expect(hero).toBeVisible();
      const padding = await hero.evaluate(el => ({
        top: getComputedStyle(el).paddingTop,
        bottom: getComputedStyle(el).paddingBottom,
      }));
      expect(padding).toEqual({ top: "28px", bottom: "22px" });
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
