# Replitでの実行

このプロジェクトは React + Vite のフロントエンドです。追加のSecret、外部API、データベースは必要ありません。

## Preview

Run ボタンまたは次のコマンドで起動できます。

```bash
npm run dev -- --host 0.0.0.0 --port 5000
```

Vite は `0.0.0.0:5000` で待ち受け、Replit のPreviewから表示できます。

## 本番公開の起動設定

既存のAutoscale（`deploymentTarget = "cloudrun"`）を維持します。`.replit` の `[deployment]` に本番用のbuild・runを指定しています。

```toml
[deployment]
deploymentTarget = "cloudrun"
build = ["npm", "run", "build"]
run = ["npm", "run", "start"]
```

ビルドした `dist` をNode標準の静的サーバーで配信します。`PORT` を使用し、未指定時は `0.0.0.0:5000` で待ち受けます。マシンサイズ・インスタンス上限は既存の設定のままです。本番用にVite開発サーバーを起動する必要はありません。

Replit側に既存の `[deployment]` がある場合は、その表にbuild・runを反映し、表を重複させないでください。起動前に `npm run build` が成功している必要があります。

## 開発・検証

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

ブラウザが利用できる環境では、PlaywrightのE2Eテストを次で実行できます。

```bash
npm run test:e2e
```
