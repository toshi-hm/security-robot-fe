# コードスタイル・規約

## TypeScript規約

### 型定義
- **strict mode有効**: tsconfig.jsonで`strict: true`
- **型推論活用**: 明示的な型は必要最小限に
- **any禁止**: `@typescript-eslint/no-explicit-any: warn`
- **type imports**: `import type { Foo } from '...'`を使用

### 命名規則
- **変数・関数**: camelCase (`fetchSessions`, `isLoading`)
- **型・インターフェース**: PascalCase (`TrainingSession`, `ApiResponse`)
- **定数**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)
- **プライベート**: アンダースコア接頭辞 (`_validateData`)

## Vue規約

### ファイル構造（必須順序）
```vue
<script setup lang="ts">
// 1. Imports
// 2. Props/Emits定義
// 3. Composables使用
// 4. Reactive state
// 5. Computed
// 6. Methods
// 7. Lifecycle hooks
</script>

<template>
<!-- UI -->
</template>

<style lang="scss" scoped>
/* スタイル */
</style>
```

### Composition API
- **Script Setup必須**: `<script setup lang="ts">`
- **Composables**: `use`接頭辞 (`useTraining`, `useWebSocket`)
- **Reactivity**: `ref`/`reactive`/`computed`を適切に使い分け

### コンポーネント命名
- **ファイル名**: PascalCase (`TrainingControl.vue`)
- **マルチワード**: 単一単語コンポーネント名禁止（ただし`index.vue`は例外）

## CSS規約（BEM記法）

### BEM形式
```scss
.block__element--modifier
```

例:
```scss
.training-control              // Block
.training-control__header      // Element
.training-control__button--primary  // Modifier
```

### SCSS使用
- **ネスト**: 3階層まで
- **変数**: `$primary-color`, `$spacing-unit`
- **Mixin**: 再利用可能なスタイルパターン

## Import順序（ESLint enforced）

```typescript
// 1. Builtin (Node.js)
import path from 'node:path'

// 2. External (npm packages)
import { ref, computed } from 'vue'

// 3. #app (Nuxt特殊)
import { useNuxtApp } from '#app'

// 4. Internal (~/, @/)
import { useTraining } from '~/composables/useTraining'
import type { TrainingSession } from '~/libs/domains/training/TrainingSession'

// 5. Sibling (同階層)
import { helper } from './helper'
```

## DDD レイヤー責務

### configs/
- APIエンドポイントURL定義
- 定数定義
- 環境変数設定

### libs/domains/
- ビジネスロジック
- ドメインモデル
- 外部依存なし（純粋関数）

### libs/repositories/
- データアクセス抽象化
- インターフェース + 実装
- API通信処理

### composables/
- Repositoryを使用
- ビジネスロジック調整
- 直接$fetch禁止

### components/
- 表示のみ
- ロジックはcomposables/storesに委譲
- 薄いコンポーネント

### stores/
- グローバル状態管理
- Composables経由でRepositoryアクセス

## コメント規約

### TSDoc/JSDoc
```typescript
/**
 * 学習セッションを作成
 * 
 * @param config - 学習設定
 * @returns 作成されたセッション
 * @throws {Error} バリデーションエラー時
 */
async function createSession(config: TrainingConfig): Promise<TrainingSession>
```

### インライン
```typescript
// FIXME: パフォーマンス改善が必要
// TODO: エラーハンドリング追加
// NOTE: この処理は仕様により必須
```

## Git Commit規約

### Conventional Commits形式
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: コードスタイル（機能変更なし）
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルド・ツール設定

### 例
```
feat: Implement Phase 17 WebSocket integration

- Refactor useWebSocket to Native WebSocket
- Add training page real-time integration
- Update tests for new implementation

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```
