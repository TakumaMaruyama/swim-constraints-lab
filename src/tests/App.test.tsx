import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function chooseCompetitiveBasics(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /競泳版/ }));
  await user.selectOptions(screen.getByLabelText(/今日の狙い/), "firstSuccess");
  await user.selectOptions(screen.getByLabelText(/どの場面を練習しますか/), "start");
  await user.selectOptions(screen.getByLabelText(/今、どんな泳ぎになっていますか/), "合図後の初動が遅い");
  await user.click(screen.getByRole("button", { name: /^導入/ }));
}

describe("Swim Constraints Lab SPA flow", () => {
  it("競泳版で必須条件を確認し、3方向の課題と根拠を表示する", async () => {
    const user = userEvent.setup();
    render(<App />);

    await chooseCompetitiveBasics(user);
    expect(screen.getByRole("button", { name: /入力内容を確認する/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /入力内容を確認する/ }));
    expect(screen.getByRole("heading", { name: "選んだ内容を確認" })).toBeInTheDocument();
    expect(screen.getByText("スタート", { selector: "dd" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /3つの練習を見る/ }));
    expect(screen.getByRole("heading", { name: "今日試す3つの練習" })).toBeInTheDocument();
    expect(screen.getAllByText("監修前の案")).toHaveLength(3);
    expect(screen.getByText("まずできるようにする")).toBeInTheDocument();
    expect(screen.getByText("やり方を比べる")).toBeInTheDocument();
    expect(screen.getByText("レース・普段の泳ぎで試す")).toBeInTheDocument();

    const evidenceSummaries = screen.getAllByText("この練習の考え方・参考資料");
    await user.click(evidenceSummaries[0]);
    expect(screen.getAllByText(/この練習の効果を保証するものではありません/)).toHaveLength(3);
    expect(screen.getAllByText("Coordination Pattern Variability Provides Functional Adaptations to Constraints in Swimming Performance").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /最初からやり直す/ }));
    expect(screen.getByRole("heading", { name: /いまの泳ぎを見て/ })).toBeInTheDocument();
  });

  it("必須条件不足ではエラーを示し、最初の必須入力へフォーカスする", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /競泳版/ }));
    await user.click(screen.getByRole("button", { name: /入力内容を確認する/ }));

    expect(screen.getByRole("alert")).toHaveTextContent("今日の狙いを選んでください。");
    expect(screen.getByLabelText(/今日の狙い/)).toHaveFocus();
    expect(screen.queryByRole("heading", { name: "選んだ内容を確認" })).not.toBeInTheDocument();
  });

  it("確認画面から戻っても選択を保持し、リセットで最初の画面に戻る", async () => {
    const user = userEvent.setup();
    render(<App />);
    await chooseCompetitiveBasics(user);
    await user.click(screen.getByRole("button", { name: /入力内容を確認する/ }));
    await user.click(screen.getByRole("button", { name: /入力を編集/ }));

    expect(screen.getByLabelText(/今日の狙い/)).toHaveValue("firstSuccess");
    expect(screen.getByLabelText(/どの場面を練習しますか/)).toHaveValue("start");
    expect(screen.getByLabelText(/今、どんな泳ぎになっていますか/)).toHaveValue("合図後の初動が遅い");
    expect(screen.getByRole("button", { name: /^導入/ })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: /モードを選び直す/ }));
    expect(screen.getByRole("heading", { name: /いまの泳ぎを見て/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /競泳版/ })).toBeInTheDocument();
  });

  it("習い事水泳版では練習内容と初級レベルを選択できる", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /習い事水泳版/ }));
    await user.selectOptions(screen.getByLabelText(/今日の狙い/), "confidence");
    await user.selectOptions(screen.getByLabelText(/何を練習しますか/), "水慣れ");
    await user.selectOptions(screen.getByLabelText(/今、どんな泳ぎになっていますか/), "水に入ることを嫌がる");
    await user.click(screen.getByRole("button", { name: /^初級/ }));
    await user.click(screen.getByRole("button", { name: /入力内容を確認する/ }));

    expect(screen.getByRole("heading", { name: "選んだ内容を確認" })).toBeInTheDocument();
    expect(screen.getByText("習い事水泳版", { selector: "dd" })).toBeInTheDocument();
    expect(screen.getByText("水慣れ", { selector: "dd" })).toBeInTheDocument();
  });

  it("競泳の観察事実は局面を選ぶまで無効で、局面を変えると選択肢を入れ替える", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /競泳版/ }));

    const observed = screen.getByLabelText(/今、どんな泳ぎになっていますか/);
    expect(observed).toBeDisabled();

    await user.selectOptions(screen.getByLabelText(/どの場面を練習しますか/), "start");
    expect(observed).not.toBeDisabled();
    expect(within(observed).getByRole("option", { name: "合図から動き出すまでが遅い" })).toBeInTheDocument();
    expect(within(observed).queryByRole("option", { name: "壁の直前で小さいかきが増える" })).not.toBeInTheDocument();

    await user.selectOptions(observed, "合図後の初動が遅い");
    await user.selectOptions(screen.getByLabelText(/どの場面を練習しますか/), "turn");
    expect(observed).toHaveValue("");
    expect(within(observed).queryByRole("option", { name: "合図から動き出すまでが遅い" })).not.toBeInTheDocument();
    expect(within(observed).getByRole("option", { name: "壁の直前で小さいかきが増える" })).toBeInTheDocument();
  });

  it("結果画面で今の入力に合う違う練習を表示できる", async () => {
    const user = userEvent.setup();
    render(<App />);
    await chooseCompetitiveBasics(user);
    await user.click(screen.getByRole("button", { name: /入力内容を確認する/ }));
    await user.click(screen.getByRole("button", { name: /3つの練習を見る/ }));

    const before = within(screen.getByRole("main")).getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent);
    await user.click(screen.getByRole("button", { name: /今の入力で違う練習を見る/ }));
    const after = within(screen.getByRole("main")).getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent);
    expect(after).toHaveLength(4);
    expect(before).toHaveLength(4);
  });
});
