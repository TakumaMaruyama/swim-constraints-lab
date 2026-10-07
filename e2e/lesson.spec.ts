import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "レッスンを組み立てる", exact: true }).click();
});

test("50分の案を連続編集し、順序・時間・削除を元に戻して印刷する", async ({ page }, testInfo) => {
  const errors: string[] = [];
  const externalRequests: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== "http://127.0.0.1:4173") externalRequests.push(request.url());
  });
  await page.getByRole("button", { name: "レッスン案を作る", exact: true }).click();
  const blocks = page.locator(".lesson-block");
  await expect(blocks).toHaveCount(6);
  await expect(page.getByLabel("配分合計", { exact: true })).toHaveText("50");
  await expect(page.getByRole("heading", { name: "今日のレッスン案", exact: true })).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath("lesson-overview.png") });
  const reviewed = page.getByLabel("この案の内容と実施条件をスタッフが確認した");
  const print = page.getByRole("button", { name: "レッスン案を印刷 / PDF" });
  await expect(print).toBeDisabled();

  await blocks.nth(1).getByLabel("活動名", { exact: true }).fill("スタッフが編集した練習");
  await blocks.nth(1).getByLabel("指導ポイント・声かけ").fill("できた動きを1つ見て、本人の言葉を待つ。");
  await page.getByRole("button", { name: "活動2を下へ", exact: true }).click();
  await expect(blocks.nth(2).getByLabel("活動名", { exact: true })).toHaveValue("スタッフが編集した練習");
  await page.getByRole("button", { name: "元に戻す", exact: true }).click();
  await expect(blocks.nth(1).getByLabel("指導ポイント・声かけ")).toHaveValue("できた動きを1つ見て、本人の言葉を待つ。");
  await page.getByRole("button", { name: "やり直す", exact: true }).click();
  await expect(blocks.nth(2).getByLabel("活動名", { exact: true })).toHaveValue("スタッフが編集した練習");

  await blocks.first().getByLabel("配分時間（分）").fill("");
  await expect(page.getByLabel("配分合計", { exact: true })).toHaveText("未確定");
  await expect(reviewed).toBeDisabled();
  await blocks.first().getByLabel("配分時間（分）").fill("9");
  await expect(page.getByText("2分超過", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "合計を50分に合わせる" }).click();
  await expect(page.getByLabel("配分合計", { exact: true })).toHaveText("50");

  await page.getByRole("button", { name: "活動3を削除", exact: true }).click();
  await expect(blocks).toHaveCount(5);
  await page.getByRole("button", { name: "元に戻す", exact: true }).click();
  await expect(blocks).toHaveCount(6);
  await expect(blocks.nth(2).getByLabel("活動名", { exact: true })).toHaveValue("スタッフが編集した練習");
  await reviewed.check();
  await expect(print).toBeEnabled();
  await blocks.first().getByLabel("活動名", { exact: true }).fill("体調確認と準備");
  await expect(reviewed).not.toBeChecked();
  await expect(print).toBeDisabled();
  await reviewed.check();

  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath("lesson-editor.png"), fullPage: true });
  await page.evaluate(() => { window.print = () => { document.body.dataset.printRequested = "yes"; }; });
  await print.click();
  await expect(page.locator("body")).toHaveAttribute("data-print-requested", "yes");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".lesson-conditions")).toBeHidden();
  await expect(page.locator(".app-header")).toBeHidden();
  await expect(page.locator(".lesson-block input").first()).toBeHidden();
  await expect(page.getByRole("heading", { name: /スタッフが編集した練習/ })).toBeVisible();
  await expect(page.locator(".lesson-print-only").getByText("できた動きを1つ見て、本人の言葉を待つ。", { exact: true })).toBeVisible();
  if (testInfo.project.name === "desktop-chromium") {
    await page.pdf({ path: testInfo.outputPath("lesson-print.pdf"), format: "A4", printBackground: true });
    await page.emulateMedia({ media: "screen" });
    await blocks.nth(2).getByRole("textbox", { name: "活動内容", exact: true }).fill("長文の編集内容も印刷で確認する。".repeat(120) + "長文の末尾確認マーカー");
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".lesson-print-only").getByText("スタッフ未確認・実施前に確認してください", { exact: true })).toBeVisible();
    await page.pdf({ path: testInfo.outputPath("lesson-long-text-print.pdf"), format: "A4", printBackground: true });
  }
  expect(errors).toEqual([]);
  expect(externalRequests).toEqual([]);
});

test("条件の作り直し・別案・追加・調整・画面移動から復元できる", async ({ page }) => {
  await page.getByRole("combobox", { name: "レベル", exact: true }).selectOption("develop");
  await page.getByRole("combobox", { name: "練習内容", exact: true }).selectOption("swimming");
  await page.getByRole("button", { name: "レッスン案を作る", exact: true }).click();
  const blocks = page.locator(".lesson-block");
  const firstTitles = await blocks.locator("input").evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));
  await page.getByRole("button", { name: "別の課題で作り直す" }).click();
  const alternativeTitles = await blocks.locator("input").evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));
  expect(alternativeTitles).not.toEqual(firstTitles);
  await page.getByRole("button", { name: "元に戻す", exact: true }).click();

  const task = blocks.nth(1);
  await task.getByRole("textbox", { name: "活動内容", exact: true }).fill("スタッフが手で編集した活動。");
  await task.getByText("準備・課題の調整と入れ替え", { exact: true }).click();
  await task.getByRole("button", { name: "易しくする", exact: true }).click();
  await expect(task.getByLabel("距離・回数・休み")).toHaveValue(/2回/);
  await page.getByRole("button", { name: "元に戻す", exact: true }).click();
  await expect(task.getByRole("textbox", { name: "活動内容", exact: true })).toHaveValue("スタッフが手で編集した活動。");
  const previousTitle = await task.getByLabel("活動名", { exact: true }).inputValue();
  const replacement = await task.getByLabel("収録課題を入れ替える").locator("option").last().getAttribute("value");
  await task.getByLabel("収録課題を入れ替える").selectOption(replacement!);
  await expect(task.getByLabel("活動名", { exact: true })).not.toHaveValue(previousTitle);
  await page.getByRole("button", { name: "元に戻す", exact: true }).click();
  await expect(task.getByRole("textbox", { name: "活動内容", exact: true })).toHaveValue("スタッフが手で編集した活動。");

  await page.getByLabel("追加する活動").selectOption("rest");
  await page.getByRole("button", { name: "活動を追加", exact: true }).click();
  await expect(blocks).toHaveCount(7);
  await page.getByRole("button", { name: "元に戻す", exact: true }).click();
  await expect(blocks).toHaveCount(6);

  await page.getByText(/レッスン条件 ·/).click();
  await page.getByLabel("レッスン時間（分）").fill("30");
  await expect(page.getByRole("alert")).toContainText("今の案は変更前の条件");
  await page.getByRole("button", { name: "この条件で案を作り直す" }).click();
  await expect(page.getByLabel("配分合計", { exact: true })).toHaveText("30");
  await page.getByRole("button", { name: "元に戻す", exact: true }).click();
  await expect(page.getByLabel("配分合計", { exact: true })).toHaveText("50");
  await expect(task.getByRole("textbox", { name: "活動内容", exact: true })).toHaveValue("スタッフが手で編集した活動。");

  await page.getByRole("button", { name: "参考資料", exact: true }).click();
  await page.getByRole("button", { name: /戻る/ }).click();
  await expect(task.getByRole("textbox", { name: "活動内容", exact: true })).toHaveValue("スタッフが手で編集した活動。");
  await page.getByRole("button", { name: "練習選びへ戻る", exact: true }).click();
  await page.getByRole("button", { name: "レッスンを組み立てる", exact: true }).click();
  await expect(task.getByRole("textbox", { name: "活動内容", exact: true })).toHaveValue("スタッフが手で編集した活動。");
});

test("人数・時間の入力エラーと自由記入の未完成を確認する", async ({ page }) => {
  await page.getByLabel("人数", { exact: true }).fill("0");
  await page.getByLabel("レッスン時間（分）").fill("");
  await page.getByRole("button", { name: "レッスン案を作る", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("人数は1〜60人");
  await expect(page.getByRole("alert")).toContainText("20〜120分");
  await page.getByLabel("人数", { exact: true }).fill("1");
  await page.getByLabel("レッスン時間（分）").fill("20");
  await page.getByLabel("使用コース数").selectOption("3");
  await page.getByRole("button", { name: "レッスン案を作る", exact: true }).click();
  await expect(page.getByLabel("人数に合わせた進め方")).toHaveValue(/1組（1人）/);
  await page.getByRole("button", { name: "活動を追加", exact: true }).click();
  await page.getByRole("button", { name: "合計を20分に合わせる" }).click();
  await expect(page.getByLabel("この案の内容と実施条件をスタッフが確認した")).toBeDisabled();
  const custom = page.locator(".lesson-block").last();
  await custom.getByRole("textbox", { name: "活動内容", exact: true }).fill("好きな泳ぎ方を選び、安全な短い区間で試す。");
  await custom.getByLabel("指導ポイント・声かけ").fill("試して気づいたことを聞く。");
  await expect(page.getByLabel("この案の内容と実施条件をスタッフが確認した")).toBeEnabled();
});
