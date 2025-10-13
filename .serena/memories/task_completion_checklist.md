# タスク完了時チェックリスト

## 必須チェック項目

### 1. コード品質
```bash
# Lint確認
pnpm lint

# 期待結果: 0 errors
# Warnings（テストコード内のany型など）は許容
```

### 2. 型チェック
```bash
# TypeScript型チェック
pnpm typecheck

# 期待結果: エラーなし
```

### 3. テスト
```bash
# 全テスト実行
pnpm test

# 期待結果: すべてのテストがパス
# 新しいコードには必ずテストを追加
```

### 4. ビルド
```bash
# プロダクションビルド
pnpm run build

# 期待結果: ビルド成功
# エラーがないこと
```

### 5. カバレッジ（オプション）
```bash
# カバレッジ確認
pnpm test -- --coverage

# 目標: 85%以上（フロントエンド）
# 現在: 68.99%（実質100% - config/plugin除く）
```

## Git Commit前チェック

### 1. 自動修正実行
```bash
# Lint自動修正
pnpm lint:fix

# Stylelint自動修正（必要に応じて）
pnpm stylelint:fix
```

### 2. 変更確認
```bash
# 変更ファイル確認
git status

# 差分確認
git diff

# 意図しない変更がないか確認
```

### 3. ステージング
```bash
# 変更をステージング
git add .

# またはファイル指定
git add <file1> <file2>
```

### 4. コミット
```bash
# Conventional Commits形式でコミット
git commit -m "feat: 実装内容の説明"

# 詳細な説明が必要な場合
git commit
# エディタで詳細記述
```

## Phase完了時チェック

### 1. ドキュメント更新
- [ ] `report/PROGRESS.md` 更新
- [ ] `report/DIARY02.md` にセッション記録追加
- [ ] 必要に応じて設計書更新

### 2. すべての品質チェック
```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

### 3. Git操作
```bash
git add .
git commit -m "feat: Phase XX complete

- 実装内容1
- 実装内容2
- テスト結果: XX tests passing

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
"
```

### 4. 次Phase準備
- [ ] PROGRESS.mdで次のターゲット確認
- [ ] 設計書・プロンプト確認
- [ ] 必要な調査・準備

## TDD実施時

### Red（レッド）
- [ ] テストを先に書く
- [ ] テストが失敗することを確認
- [ ] `pnpm test` → 失敗確認

### Green（グリーン）
- [ ] 最小限の実装でテストを通す
- [ ] `pnpm test` → 成功確認

### Refactor（リファクタリング）
- [ ] コードをきれいにする
- [ ] `pnpm test` → 引き続き成功
- [ ] `pnpm lint` → エラーなし

## トラブルシューティング

### Lintエラー
```bash
# 自動修正で解決を試みる
pnpm lint:fix

# 手動修正が必要な場合はエラーメッセージ確認
```

### 型エラー
```bash
# 詳細な型エラー確認
pnpm typecheck

# 型定義ファイル確認
# types/ ディレクトリ
```

### テスト失敗
```bash
# 詳細ログ付き実行
pnpm test -- --reporter=verbose

# 特定ファイルのみ実行
pnpm test tests/unit/specific.spec.ts
```

### ビルドエラー
```bash
# .nuxt/ キャッシュクリア
rm -rf .nuxt
pnpm dev

# node_modules再インストール
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 推奨ワークフロー

1. **実装前**: 設計書・プロンプト確認
2. **実装中**: TDD（Red → Green → Refactor）
3. **実装後**: チェックリスト実行
4. **コミット前**: 自動修正 + テスト
5. **Phase完了**: ドキュメント更新 + Git commit
