# Swim Constraints Lab

競泳コーチ・水泳指導者向けの、制約主導で練習課題を探す日本語Webアプリです。入力されたモード、技能領域、観察事実、レベル、用具などをもとに、成立・探索・実場面接続の3方向から課題を提示します。

## 方針

- AI、外部API、データベース、ログイン、履歴保存を使用しません。
- 課題選択は静的データと決定論的なロジックで行い、同じ条件には同じ結果を返します。
- 競泳36件、習い事水泳36件の合計72件を収録しています。
- すべての課題は「監修前ドラフト」です。診断や唯一の正解、安全判断をアプリに委ねるものではありません。
- 実施前に、指導者が泳力・体調・水深・人数・施設ルールを確認してください。

## マッチングロジック

モードと局面・技能領域を必須一致にし、狙い30点、局面・技能領域25点、観察事実20点、レベル10点、実施環境5点、用具5点、声かけ・変動設定5点で採点します。方向ごとに候補を分け、主制約の多様性、合計点、ID順で「成立・探索・実場面」を1件ずつ決定します。

候補が揃わない場合は、声かけ、フィードバック、変動設定、用具の希望、その他の詳細条件の順に任意条件だけを緩和します。モードと局面・技能領域、必須用具の有無は緩和しません。別案と難易度等の変更も、乱数や文章生成ではなく静的な変更部品を適用します。

## ディレクトリ構成

```text
src/components/  画面コンポーネント
src/data/        72課題・選択肢・根拠・変更部品
src/engine/      決定論的な選択・変更ロジック
src/types/       データモデル
src/tests/       単体・データ・画面フローテスト
e2e/             Playwright実ブラウザテスト
docs/            コンテンツと根拠の運用方針
```

## 開発と検証

```bash
npm ci
npm run dev
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

開発サーバーは `http://localhost:5173` で起動します。PlaywrightのE2E確認は環境にブラウザがある場合に `npm run test:e2e` で実行できます。

## Replit

Previewは次で起動します。

```bash
npm run dev -- --host 0.0.0.0
```

Static Publishingの設定は、ビルドコマンドを `npm run build`、公開ディレクトリを `dist` としてください。

## 資料と課題の追加

課題は `src/data/competitiveTasks.ts` または `src/data/learnToSwimTasks.ts` に、既存の `TaskTemplate` 型と選択肢の文言に合わせて追加します。IDを一意にし、成功条件・観察点・易化/難化・用具なし・大人数・実場面接続を具体的に記載してください。資料を追加するときは `src/data/evidenceSources.ts` に、タイトル、著者・組織、URL、支持する範囲、支持しない範囲、確認日を登録し、課題の `evidenceIds` から参照します。記載内容は資料が実際に支持する範囲を超えないようにします。

## OSS参考

[Zoned](https://github.com/alarboulletmarin/zoned)、[swiML](https://github.com/bartneck/swiML)、[Swim Workout App](https://github.com/matthias-grgic/Swim-Workout-App) を設計上の参考にしました。コード、文章、データは流用していません。

## ライセンス

MIT License。Copyright (c) 2026 Takuma Maruyama。
