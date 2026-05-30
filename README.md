# Subsco — サブスク管理 PWA

満足度 × 使用頻度でサブスクを「見える化」し、解約候補を見つけるためのモバイル向け PWA です。データは端末内（IndexedDB / localForage）に保存され、サーバーには送信されません。

🔗 https://subsco-six.vercel.app

## 主な機能

- **一覧 / ダッシュボード** — 月額・年額の合計、カテゴリ／満足度の内訳円グラフ、検索・絞り込み・並び替え
- **マトリクス分析** — 満足度 × 頻度のマトリクスで「右下＝見直し優先度が高い」サービスを可視化
- **グラフ分析** — カテゴリ／満足度／支払方法別の内訳、月別トレンド（前月比つき）、家計負担率チェック
- **解約レコメンド** — 満足度と頻度から解約候補を判定し、解約時の年間節約額を表示
- **請求リマインド** — 今週請求予定をバナー表示。通知を許可すると端末通知も配信（1日1回）
- **ダークモード** — ライト / ダーク / システム連動の切り替え
- **多言語** — 日本語 / English
- **バックアップ** — JSON でのエクスポート／インポート

## 技術スタック

React 19 · TypeScript · Vite · Tailwind CSS v4 · Recharts · Framer Motion · localForage · vite-plugin-pwa

## 開発

```bash
npm install
npm run dev      # 開発サーバー
npm run build    # 本番ビルド
npm run preview  # ビルド結果のプレビュー
npm run lint     # ESLint
```

デプロイは Vercel（`main` ブランチへのマージで自動デプロイ）。
