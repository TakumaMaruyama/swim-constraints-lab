# Replitでの実行

このプロジェクトは React + Vite のフロントエンドです。追加のSecret、外部API、データベースは必要ありません。

## Preview

Run ボタンまたは次のコマンドで起動できます。

```bash
npm run dev -- --host 0.0.0.0 --port 5000
```

Vite は `0.0.0.0:5000` で待ち受け、Replit のPreviewから表示できます。

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