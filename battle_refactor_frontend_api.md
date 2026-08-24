# 作战任务重构前后端对接文档

本文档只说明当前前端需要对接的作战任务与游戏配置变更。未列出的接口和字段保持原有行为。

JSON 字段名以 HTTP 实际序列化结果为准，区分大小写。

## 1. 变更摘要

| 接口 | 变更类型 | 说明 |
|---|---|---|
| `POST /game/config/:account` | 请求体变更 | 配置 patch 必须放在外层 `config` 字段中；作战地图使用 `battle_tasks` 整体替换 |
| `GET /game/:account` | 响应变更 | `data.config` 使用 `current_map` 和 `battle_tasks`；`data.building.rooms` 按房间类型和槽位返回 |

## 2. 通用约定

- 所有 `/game` 接口都需要 JWT 认证：`Authorization: Bearer <token>`。
- 返回体统一包含 `code`、`data` 和 `message`。
- `code = 1` 表示成功，`code = 0` 表示失败。

```json
{
  "code": 1,
  "data": null,
  "message": "大成功!"
}
```

## 3. POST /game/config/:account

### 3.1 请求结构

```http
POST /game/config/:account
Authorization: Bearer <token>
Content-Type: application/json
```

请求体不是顶层配置 patch。游戏配置必须放在 `config` 字段中：

```json
{
  "config": {
    "battle_tasks": [
      {
        "stage_id": "main_01-07",
        "mode": "LOOP"
      }
    ],
    "keeping_ap": 0,
    "recruit_reserve": 0,
    "recruit_ignore_robot": false,
    "enable_building_arrange": true,
    "is_auto_battle": true,
    "accelerate_slot_cn": "中层左"
  }
}
```

外层请求支持以下两种更新内容，至少需要提供一种：

| 字段 | 类型 | 说明 |
|---|---|---|
| `config` | GameConfig | 游戏配置 patch |
| `captcha_info` | CaptchaInfo | 验证码信息 |

如果把 `battle_tasks`、`keeping_ap` 等配置字段直接放在请求体顶层，服务端无法解析出 `config`，会返回 `缺少更新内容`。

### 3.2 config 字段

`config` 是 patch，只需要传本次修改的字段。数值 `0`、布尔值 `false` 和空数组都是有效更新值。

| 字段 | 类型 | 说明 |
|---|---|---|
| `battle_tasks` | BattleTask[] | 作战任务列表，传入后整体替换现有列表 |
| `specialization_tasks` | SpecializationTask[] | 专精任务列表 |
| `is_auto_battle` | boolean | 是否自动战斗 |
| `keeping_ap` | number | 保留理智 |
| `recruit_reserve` | number | 招募券保留数量 |
| `recruit_ignore_robot` | boolean | 招募是否忽略机器人 |
| `enable_building_arrange` | boolean | 是否启用基建排班 |
| `accelerate_slot_cn` | string | 加速位中文名，服务端据此更新加速位 |
| `is_stopped` | boolean | 是否停止游戏 |

### 3.3 battle_tasks 前端约定

当前前端保持原有地图配置 UI，不增加任务模式选择。用户在 UI 中添加的每个地图 ID 都转换为一个 `LOOP` 任务：

```json
{
  "stage_id": "main_01-07",
  "mode": "LOOP"
}
```

前端展示地图时只读取 `LOOP` 任务的 `stage_id`。保存时提交完整的 `battle_tasks` 列表，并移除 `LOOP` 任务上可能存在的空 `uuid` 字段。

`battle_tasks` 使用整体替换语义。清空所有地图时应提交空数组：

```json
{
  "config": {
    "battle_tasks": []
  }
}
```

### 3.4 响应

成功时 `data` 为 `null`：

```json
{
  "code": 1,
  "data": null,
  "message": "大成功!"
}
```

## 4. GET /game/:account

### 4.1 config 字段

响应 `data.config` 中：

- `current_map` 表示当前正在执行的地图。
- `battle_tasks` 表示配置的作战任务列表。
- 前端地图 UI 只显示 `battle_tasks` 中 `mode = "LOOP"` 的 `stage_id`。

### 4.2 building.rooms 字段

`data.building.rooms` 按房间类型返回以槽位 ID 为 key 的 map：

```json
{
  "building": {
    "rooms": {
      "TRAINING": {
        "slot_14": {
          "trainee": {
            "charId": "char_1001_amiya2",
            "skillId": "skill_1001"
          },
          "completeWorkTime": "2026-08-23T12:00:00+08:00"
        }
      },
      "MANUFACTURE": {
        "slot_14": {
          "formulaId": "formula_1"
        }
      },
      "TRADING": {
        "slot_14": {
          "strategy": "O"
        }
      }
    }
  }
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `rooms.TRAINING` | map\<string, object\> | 训练室信息，key 为槽位 ID |
| `rooms.MANUFACTURE` | map\<string, object\> | 制造站信息，key 为槽位 ID |
| `rooms.TRADING` | map\<string, object\> | 贸易站信息，key 为槽位 ID |

## 5. 前端实现要求

1. 保持现有托管配置和地图配置 UI 不变。
2. UI 添加的地图使用 `LOOP` 模式，UI 也只展示 `LOOP` 地图。
3. `ApiGameConfig` 表示内层配置 patch；HTTP adapter 负责包装为 `{ "config": patch }`，调用方不需要了解传输层结构。
4. 暂停游戏同样通过 `config.is_stopped = true` 提交。
5. 保存配置后，通过 `GET /game/:account` 返回的 `data.config` 刷新当前配置。
