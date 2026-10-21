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


async function clickMindTestOption(page, option) {
  // Position the option below the sticky header without recursive retries.
  // A previous implementation repeatedly centered the option and then
  // scrolled it back to the same position until the test timed out.
  const target = await option.evaluate(el => {
    el.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });

    const getGeometry = () => {
      const rect = el.getBoundingClientRect();
      const header = document.querySelector(".site-header");
      const headerBottom = header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
      return { rect, headerBottom };
    };

    let { rect, headerBottom } = getGeometry();
    let top = Math.max(rect.top + 2, headerBottom + 8);
    let bottom = Math.min(rect.bottom - 2, window.innerHeight - 8);

    // If the header leaves no clickable vertical area, move the option
    // below it. Do not re-center it afterward.
    if (bottom <= top) {
      const desiredTop = Math.min(
        headerBottom + 12,
        window.innerHeight - 12 - Math.min(rect.height, 80)
      );
      window.scrollBy({ top: rect.top - desiredTop, behavior: "instant" });
      ({ rect, headerBottom } = getGeometry());
      top = Math.max(rect.top + 2, headerBottom + 8);
      bottom = Math.min(rect.bottom - 2, window.innerHeight - 8);
    }

    const x = Math.max(rect.left + 2, Math.min(rect.right - 2, rect.left + rect.width / 2));
    if (bottom <= top || rect.right <= rect.left) {
      return {
        error: "No clickable area remains after one bounded scroll correction",
        rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right },
        headerBottom,
        viewportHeight: window.innerHeight
      };
    }

    const y = (top + bottom) / 2;
    const hit = document.elementFromPoint(x, y);
    if (!hit || (hit !== el && !el.contains(hit))) {
      return {
        error: "Computed click point is not inside the answer option",
        rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right },
        headerBottom,
        viewportHeight: window.innerHeight,
        hit: hit ? (hit.tagName + (hit.className && typeof hit.className === "string" ? "." + hit.className.trim().replace(/\s+/g, ".") : "")) : null,
        x,
        y
      };
    }
    return { x, y };
  });

  if (target.error) {
    throw new Error("Mind Test option click geometry failed: " + JSON.stringify(target));
  }
  await page.mouse.click(target.x, target.y);
}

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

  for (const item of cases) {
    test(`${item.lang} Mind Test works without an account: ${item.path}`, async ({ page }) => {
      await assertPublicPage(page, item.path);
      const options = page.locator(".od-test-option:not(.od-locked)");
      await expect(options.first()).toBeVisible();

      for (let i = 0; i < 10; i++) {
        await expect(options.first()).toBeVisible();
        await expect(options.first()).toBeEnabled({ timeout: 3000 });
        await clickMindTestOption(page, options.first());

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
        await clickMindTestOption(page, option);

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
        await clickMindTestOption(page, option);

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
