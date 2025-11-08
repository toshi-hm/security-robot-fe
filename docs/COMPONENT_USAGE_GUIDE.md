# 共通コンポーネント活用ガイド

このドキュメントは、プロジェクト内の共通コンポーネントの使い方と活用方針をまとめたものです。

## 目次

- [共通コンポーネント一覧](#共通コンポーネント一覧)
- [活用方針](#活用方針)
- [個別コンポーネントガイド](#個別コンポーネントガイド)

---

## 共通コンポーネント一覧

### 高再利用性コンポーネント (Phase 1)

Phase 43で整備された、複数ページで利用可能なコンポーネント群:

| コンポーネント名 | パス | 用途 | 使用ページ |
|---|---|---|---|
| **StatisticsCard** | `components/common/StatisticsCard.vue` | 統計情報カード表示 | Dashboard, Playback一覧 |
| **SearchFilter** | `components/common/SearchFilter.vue` | 検索フィルタリング | Training一覧, Playback一覧, Models一覧 |
| **SessionStatusTag** | `components/common/SessionStatusTag.vue` | セッションステータス表示 | Training一覧, Playback一覧 |

### 既存の共通コンポーネント

| コンポーネント名 | パス | 用途 |
|---|---|---|
| **AppHeader** | `components/common/AppHeader.vue` | アプリケーションヘッダー |
| **AppSidebar** | `components/common/AppSidebar.vue` | サイドバーナビゲーション |
| **LoadingSpinner** | `components/common/LoadingSpinner.vue` | ローディング表示 |
| **ErrorAlert** | `components/common/ErrorAlert.vue` | エラーアラート表示 |

---

## 活用方針

### 1. 新規ページ作成時の原則

新しいページを作成する際は、以下の順序でコンポーネント選定を行う:

1. **既存の共通コンポーネントで実現可能か検討**
   - StatisticsCard, SearchFilter, SessionStatusTag などを優先的に検討
   - 既存コンポーネントの Props/Slots で要件を満たせるか確認

2. **既存コンポーネントのカスタマイズで対応可能か検討**
   - Props やスロットを追加することで汎用性を高められるか
   - 他のページでも利用価値があるかを判断

3. **ページ固有の要件がある場合**
   - ページ内に直接実装
   - 将来的に再利用の可能性があれば、抽出を検討

### 2. コンポーネント抽出の基準

以下の条件を満たす場合、コンポーネント化を検討:

- **再利用性**: 2つ以上のページで類似の UI が存在する
- **複雑性**: 50行以上のテンプレート、または複雑なロジックを含む
- **保守性**: 独立してテスト可能な単位として切り出せる

### 3. テスト方針

- 全ての共通コンポーネントは **ユニットテスト必須** (カバレッジ 85% 以上)
- Props, Events, Slots の全パターンをテスト
- ページテストでは共通コンポーネントを適切にスタブ

---

## 個別コンポーネントガイド

### StatisticsCard

**用途:** 数値統計とラベルを視覚的に表示するカード

**Props:**

```typescript
interface Props {
  title: string          // カードタイトル
  value: number | string // 統計値 (大きく表示)
  label: string          // 値のラベル
  icon?: Component       // Element Plus アイコンコンポーネント
  colorTheme?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  tagText?: string       // オプショナルなタグテキスト
  tagType?: 'success' | 'warning' | 'info' | 'danger'
}
```

**使用例:**

```vue
<template>
  <StatisticsCard
    title="学習セッション"
    :value="trainingSessions.length"
    label="アクティブセッション"
    :icon="TrendCharts"
    color-theme="primary"
    tag-text="3 実行中"
    tag-type="success"
  />
</template>

<script setup lang="ts">
import { TrendCharts } from '@element-plus/icons-vue'
import StatisticsCard from '~/components/common/StatisticsCard.vue'
</script>
```

**スタイル:**
- MD3カラーシステムに基づいたグラデーション背景
- ホバー時のリフトエフェクト (`translateY(-5px)`)
- レスポンシブ対応 (モバイルでは縦並び)

---

### SearchFilter

**用途:** リストページでの検索・フィルタリング機能

**Props:**

```typescript
interface Props {
  modelValue: string    // v-model バインディング用
  placeholder?: string  // プレースホルダーテキスト (デフォルト: "Search...")
}
```

**Events:**

```typescript
interface Emits {
  (e: 'update:modelValue', value: string): void  // v-model 更新
  (e: 'search', value: string): void             // Enter キー押下時
}
```

**使用例:**

```vue
<template>
  <SearchFilter
    v-model="searchQuery"
    placeholder="ファイル名またはIDで検索..."
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SearchFilter from '~/components/common/SearchFilter.vue'

const searchQuery = ref('')

const handleSearch = (value: string) => {
  console.log('Search:', value)
}
</script>
```

**フィルタリングロジックの実装パターン:**

```typescript
const filteredItems = computed(() => {
  if (!searchQuery.value) {
    return items.value
  }

  const query = searchQuery.value.toLowerCase()
  return items.value.filter(item => {
    return (
      item.id?.toString().includes(query) ||
      item.name?.toLowerCase().includes(query)
      // 必要に応じて検索対象フィールドを追加
    )
  })
})
```

---

### SessionStatusTag

**用途:** セッション状態を色分けして表示

**Props:**

```typescript
interface Props {
  status: string  // セッションステータス ('running', 'paused', 'completed', 'failed', 'created')
}
```

**自動マッピング:**

| Status | 表示テキスト | タグ色 |
|---|---|---|
| `running` | 実行中 | `success` (緑) |
| `paused` | 一時停止 | `warning` (黄) |
| `completed` | 完了 | `info` (青) |
| `failed` | 失敗 | `danger` (赤) |
| `created` | 作成済み | `info` (青) |
| その他 | そのまま表示 | `info` (青) |

**使用例:**

```vue
<template>
  <SessionStatusTag :status="session.status" />
</template>

<script setup lang="ts">
import SessionStatusTag from '~/components/common/SessionStatusTag.vue'
</script>
```

---

## テスト記述例

### StatisticsCard のテスト

```typescript
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import StatisticsCard from '~/components/common/StatisticsCard.vue'

describe('StatisticsCard', () => {
  it('renders title and value', () => {
    const wrapper = mount(StatisticsCard, {
      props: {
        title: 'Test Title',
        value: 42,
        label: 'Test Label',
      },
    })

    expect(wrapper.find('.statistics-card__title').text()).toBe('Test Title')
    expect(wrapper.find('.statistics-card__value').text()).toBe('42')
  })

  it('applies color theme class', () => {
    const wrapper = mount(StatisticsCard, {
      props: {
        title: 'Test',
        value: 100,
        label: 'Label',
        colorTheme: 'primary',
      },
    })

    expect(wrapper.find('.statistics-card--primary').exists()).toBe(true)
  })
})
```

### SearchFilter のテスト

```typescript
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import SearchFilter from '~/components/common/SearchFilter.vue'

describe('SearchFilter', () => {
  it('emits update:modelValue on input', async () => {
    const wrapper = mount(SearchFilter, {
      props: { modelValue: '' },
    })

    await wrapper.find('input').setValue('test query')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test query'])
  })

  it('emits search event on Enter key', async () => {
    const wrapper = mount(SearchFilter, {
      props: { modelValue: 'search term' },
    })

    await wrapper.find('input').trigger('keyup.enter')

    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')?.[0]).toEqual(['search term'])
  })
})
```

---

## 実装履歴

### Phase 43: 共通コンポーネント整備 (Session 043-046)

**実装内容:**

1. **Session 043**: 方針策定
   - 全ページの UI 要素を調査
   - 再利用可能なコンポーネントを特定
   - Phase 1-4 の実装計画を策定

2. **Session 044**: Phase 1 実装
   - StatisticsCard, SearchFilter, SessionStatusTag を作成
   - Dashboard, Playback一覧 ページへの適用
   - 合計 15 テスト追加

3. **Session 045**: Training一覧への適用
   - SearchFilter, SessionStatusTag の統合
   - フィルタリングロジック実装
   - テスト更新

4. **Session 046**: Models一覧への適用 (本セッション)
   - SearchFilter の統合
   - ファイル名・ID でのフィルタリング実装
   - 6 テスト追加

**成果:**
- **テスト総数**: 478 → 502 (+24)
- **カバレッジ**: 98.14% statements, 87.09% functions (目標 85% 達成)
- **共通コンポーネント**: 3 個追加 (合計 7 個)

---

## 今後の展開

### 候補コンポーネント (Phase 2-4)

**Phase 2 (中再利用性):**
- TrainingSessionTable
- ModelUploadDialog
- ConnectionStatusBadge

**Phase 3 (ページ固有):**
- PlaybackSessionTable
- ModelTable
- QuickActionButtons

**Phase 4 (ヘルパー関数):**
- utils/mappers.ts (ステータス・ラベル変換)
- utils/formatters.ts 拡張 (日付・ファイルサイズ)

---

## 関連ドキュメント

- [設計書: フロントエンド詳細設計](../instructions/03_frontend_design_standalone.md)
- [設計書: テスト設計](../instructions/04_test_design_standalone.md)
- [プロジェクト進捗](../report/PROGRESS.md)
- [開発日記 (DIARY04)](../report/DIARY04.md)

---

**最終更新**: 2025-11-07 (Session 046)
**作成者**: AI実装アシスタント
