import { expect, test, type Page } from "@playwright/test";

function monitorRuntime(page: Page) {
  const errors: string[] = [];
  const externalRequests: string[] = [];

  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin !== "http://127.0.0.1:4173") externalRequests.push(request.url());
  });

  return { errors, externalRequests };
}

async function chooseCompetitiveBasics(page: Page) {
  await page.getByRole("button", { name: /競泳版/ }).click();
  await page.getByLabel(/今日の狙い/).selectOption("firstSuccess");
  await page.getByLabel(/対象局面/).selectOption("start");
  await page.getByLabel(/現在起きていること/).selectOption("合図後の初動が遅い");
  await page.getByRole("button", { name: /^導入/ }).click();
}

test("競泳版で入力から3方向・根拠・静的変更まで操作できる", async ({ page }) => {
  const runtime = monitorRuntime(page);
  await page.goto("/");

  await expect(page.getByText("AIは使用しません。")).toBeVisible();
  await chooseCompetitiveBasics(page);
  await page.getByRole("button", { name: /条件を確認する/ }).click();
  await expect(page.getByRole("heading", { name: "選択条件の確認" })).toBeVisible();
  await page.getByRole("button", { name: /ヒントを表示/ }).click();

  await expect(page.locator("article.task-card")).toHaveCount(3);
  await expect(page.getByText("まず成立")).toBeVisible();
  await expect(page.getByText("比べて探索")).toBeVisible();
  await expect(page.getByText("実場面へつなぐ")).toBeVisible();

  await page.locator("article.task-card").first().getByText("課題の詳細を見る").click();
  await expect(page.locator("article.task-card").first().getByText("用具が変える情報")).toBeVisible();
  await page.locator("article.task-card").first().getByText("根拠と参考資料").click();
  await expect(page.locator("article.task-card").first().getByText("この資料だけでは言えないこと").first()).toBeVisible();

  await page.getByRole("button", { name: "易しくする" }).click();
  await expect(page.getByText("易しく調整")).toHaveCount(3);
  await page.getByRole("button", { name: "声かけを変える" }).click();
  await expect(page.getByText("声かけを問いへ変更")).toHaveCount(3);

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
  expect(runtime.errors).toEqual([]);
  expect(runtime.externalRequests).toEqual([]);
});

test("習い事水泳版でも用具なしで3方向を表示し、戻ると入力を保持する", async ({ page }) => {
  const runtime = monitorRuntime(page);
  await page.goto("/");

  await page.getByRole("button", { name: /習い事水泳版/ }).click();
  await page.getByLabel(/今日の狙い/).selectOption("confidence");
  await page.getByLabel(/技能領域/).selectOption("水慣れ");
  await page.getByLabel(/現在起きていること/).selectOption("水に入ることを嫌がる");
  await page.getByRole("button", { name: /^初級/ }).click();
  await page.getByRole("button", { name: /条件を確認する/ }).click();
  await page.getByRole("button", { name: /ヒントを表示/ }).click();

  await expect(page.locator("article.task-card")).toHaveCount(3);
  await page.getByRole("button", { name: /条件入力へ戻る/ }).click();
  await expect(page.getByLabel(/技能領域/)).toHaveValue("水慣れ");
  await expect(page.getByRole("button", { name: /^初級/ })).toHaveAttribute("aria-pressed", "true");
  expect(runtime.errors).toEqual([]);
  expect(runtime.externalRequests).toEqual([]);
});

test("必須エラーと主要操作をキーボードで利用できる", async ({ page }) => {
  const runtime = monitorRuntime(page);
  await page.goto("/");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "本文へ移動" })).toBeFocused();
  await page.getByRole("button", { name: /競泳版/ }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: /条件を確認する/ }).click();

  await expect(page.getByRole("alert")).toContainText("今日の狙いを選んでください。");
  await expect(page.getByLabel(/今日の狙い/)).toBeFocused();
  expect(runtime.errors).toEqual([]);
  expect(runtime.externalRequests).toEqual([]);
});
