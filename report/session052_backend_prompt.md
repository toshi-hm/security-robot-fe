# バッテリーシステムのAPI Schema統合

## 背景
`rl/environments/security_env.py`でバッテリーシステムが実装済みですが、API Schemaにバッテリーフィールドが未定義のため、Frontend UIにデータが渡されていません。

## 修正対象ファイル

### 1. `app/schemas/environment.py`

`EnvironmentStateResponse`クラスに以下のフィールドを追加してください:

```python
# Battery system (追加)
battery_percentage: float | None = None
is_charging: bool = False
distance_to_charging_station: int | None = None
charging_station_position: tuple[int, int] | None = None
```

**配置場所**: `updated_at: datetime`の後、クラス定義の最後尾

**注意点**:
- 全てオプショナルフィールド(`| None`または`= False`)として定義
- 既存セッションとの後方互換性を維持

### 2. `app/core/environment/schemas.py`

`EnvironmentState`クラスに以下のフィールドを追加してください:

```python
# Battery system (追加)
battery_percentage: float | None = None
is_charging: bool = False
distance_to_charging_station: int | None = None
charging_station_position: tuple[int, int] | None = None
```

**配置場所**: `coverage_ratio: float | None = None`の後、クラス定義の最後尾

### 3. DBマイグレーション (必要な場合)

`EnvironmentStateSnapshot`モデル(DBテーブル)にバッテリーフィールドを追加する場合は、Alembicマイグレーションを作成してください:

```bash
alembic revision --autogenerate -m "Add battery system fields to environment state"
alembic upgrade head
```

**追加カラム**:
- `battery_percentage` FLOAT NULL
- `is_charging` BOOLEAN DEFAULT FALSE
- `distance_to_charging_station` INTEGER NULL
- `charging_station_position_x` INTEGER NULL (tupleを分割して保存)
- `charging_station_position_y` INTEGER NULL

### 4. データ保存ロジックの確認

`app/services/playback_service.py`または環境状態保存処理で、`_get_info()`の戻り値がDBに正しく保存されているか確認してください。

**確認箇所**:
- `info`辞書から`battery_percentage`等を取得
- `EnvironmentStateSnapshot`モデルへのマッピング

## テスト手順

1. Backend APIを起動
2. Training セッションを実行し、環境状態をDBに記録
3. Playback API(`GET /api/v1/playback/{session_id}/frames`)でバッテリーフィールドが返されることを確認:
   ```json
   {
     "frames": [
       {
         ...
         "battery_percentage": 98.5,
         "is_charging": false,
         "distance_to_charging_station": 5,
         "charging_station_position": [4, 4]
       }
     ]
   }
   ```

4. Frontend UIで充電ステーション・バッテリー残量が正しく表示されることを確認

## 期待される成果
- Playback再生時に充電ステーション(緑色サークル)がグリッド上に表示される
- バッテリー残量がプログレスバーで表示される(0-100%)
- 充電状態が「充電中」または「良好/警告/危険」で表示される
- 充電ステーションまでの距離が表示される

## 詳細な実装箇所

### 確認済みの実装
- **環境側**: `rl/environments/security_env.py`
  - `_get_info()`メソッドで以下を返却:
    ```python
    {
        "battery_percentage": self.battery_percentage,
        "is_charging": self.is_charging,
        "distance_to_charging_station": distance_to_station,
        "charging_station_position": (
            self.charging_station_x,
            self.charging_station_y,
        ),
    }
    ```

- **Frontend UI**: すでに実装済み
  - `types/api.ts`: `EnvironmentStateResponseDTO`にバッテリーフィールド型定義済み
  - `pages/playback/[sessionId].vue`: BatteryDisplay/EnvironmentVisualization統合済み

### 未実装箇所(要修正)
- `app/schemas/environment.py`: `EnvironmentStateResponse`
- `app/core/environment/schemas.py`: `EnvironmentState`
- DBモデル: `app/models/environment.py`の`EnvironmentStateSnapshot`(必要な場合)
