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
  await user.selectOptions(screen.getByLabelText(/対象局面/), "start");
  await user.selectOptions(screen.getByLabelText(/現在起きていること/), "合図後の初動が遅い");
  await user.click(screen.getByRole("button", { name: /^導入/ }));
}

describe("Swim Constraints Lab SPA flow", () => {
  it("競泳版で必須条件を確認し、3方向の課題と根拠を表示する", async () => {
    const user = userEvent.setup();
    render(<App />);

    await chooseCompetitiveBasics(user);
    expect(screen.getByRole("button", { name: /条件を確認する/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /条件を確認する/ }));
    expect(screen.getByRole("heading", { name: "選択条件の確認" })).toBeInTheDocument();
    expect(screen.getByText("スタート", { selector: "dd" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /ヒントを表示/ }));
    expect(screen.getByRole("heading", { name: "今日試せる3つの方向" })).toBeInTheDocument();
    expect(screen.getAllByText("監修前ドラフト")).toHaveLength(3);
    expect(screen.getByText("まず成立")).toBeInTheDocument();
    expect(screen.getByText("比べて探索")).toBeInTheDocument();
    expect(screen.getByText("実場面へつなぐ")).toBeInTheDocument();

    const evidenceSummaries = screen.getAllByText("根拠と参考資料");
    await user.click(evidenceSummaries[0]);
    expect(screen.getAllByText(/監修前ドラフト。根拠は課題設計/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Coordination Pattern Variability Provides Functional Adaptations to Constraints in Swimming Performance")).toHaveLength(3);

    await user.click(screen.getByRole("button", { name: /最初からやり直す/ }));
    expect(screen.getByRole("heading", { name: /動きを決めつけず/ })).toBeInTheDocument();
  });

  it("必須条件不足ではエラーを示し、最初の必須入力へフォーカスする", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /競泳版/ }));
    await user.click(screen.getByRole("button", { name: /条件を確認する/ }));

    expect(screen.getByRole("alert")).toHaveTextContent("今日の狙いを選んでください。");
    expect(screen.getByLabelText(/今日の狙い/)).toHaveFocus();
    expect(screen.queryByRole("heading", { name: "選択条件の確認" })).not.toBeInTheDocument();
  });

  it("確認画面から戻っても選択を保持し、リセットで最初の画面に戻る", async () => {
    const user = userEvent.setup();
    render(<App />);
    await chooseCompetitiveBasics(user);
    await user.click(screen.getByRole("button", { name: /条件を確認する/ }));
    await user.click(screen.getByRole("button", { name: /条件を編集/ }));

    expect(screen.getByLabelText(/今日の狙い/)).toHaveValue("firstSuccess");
    expect(screen.getByLabelText(/対象局面/)).toHaveValue("start");
    expect(screen.getByLabelText(/現在起きていること/)).toHaveValue("合図後の初動が遅い");
    expect(screen.getByRole("button", { name: /^導入/ })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: /モードを選び直す/ }));
    expect(screen.getByRole("heading", { name: /動きを決めつけず/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /競泳版/ })).toBeInTheDocument();
  });

  it("習い事水泳版では技能領域と初級レベルを選択できる", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /習い事水泳版/ }));
    await user.selectOptions(screen.getByLabelText(/今日の狙い/), "confidence");
    await user.selectOptions(screen.getByLabelText(/技能領域/), "水慣れ");
    await user.selectOptions(screen.getByLabelText(/現在起きていること/), "水に入ることを嫌がる");
    await user.click(screen.getByRole("button", { name: /^初級/ }));
    await user.click(screen.getByRole("button", { name: /条件を確認する/ }));

    expect(screen.getByRole("heading", { name: "選択条件の確認" })).toBeInTheDocument();
    expect(screen.getByText("習い事水泳版", { selector: "dd" })).toBeInTheDocument();
    expect(screen.getByText("水慣れ", { selector: "dd" })).toBeInTheDocument();
  });

  it("結果画面の同じ条件で別案ボタンを操作できる", async () => {
    const user = userEvent.setup();
    render(<App />);
    await chooseCompetitiveBasics(user);
    await user.click(screen.getByRole("button", { name: /条件を確認する/ }));
    await user.click(screen.getByRole("button", { name: /ヒントを表示/ }));

    const before = within(screen.getByRole("main")).getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent);
    await user.click(screen.getByRole("button", { name: /同じ条件で別案/ }));
    const after = within(screen.getByRole("main")).getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent);
    expect(after).toHaveLength(4);
    expect(before).toHaveLength(4);
  });
});
