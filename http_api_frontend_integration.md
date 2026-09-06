# HTTP API 前后端对接变更

本文档记录当前版本相对 `7c175dd1b702955d07834ce7ffffd5cc0a5798d8` 的前端可见变化。

## 通用约定

- `/game` 接口使用 `Authorization: Bearer <token>`。
- 创建和登录接口还需要请求头 `token: <recaptcha-token>`（管理员或调试模式可能跳过校验）。
- 接口统一返回 HTTP JSON；业务是否成功以 `code` 为准：

```json
{
  "code": 1,
  "data": null,
  "message": "大成功!"
}
```

`code = 1` 表示成功，`code = 0` 表示失败，失败原因在 `message`。

## 路由变化

| 方法和路径 | 变化 | 前端处理 |
| --- | --- | --- |
| `POST /game/` | 恢复启用 | 创建账号（每个用户最多 3 个）；Body 为 `{ "account": "...", "platform": 0, "password": "..." }`；平台为 `0` iOS、`1` Android、`2` B 服 |
| `POST /game/login/:account` | 保留，职责改为登录/恢复运行 | 无 Body；成功仅表示登录任务已提交 |
| `POST /game/pause/:account` | 新增 | 无 Body；用于暂停游戏 |
| `DELETE /game/:account` | 保留 | 删除游戏必须在 path 中提供账号 |
| `DELETE /game/` | 删除 | 改用 `DELETE /game/:account` |
| `GET /game/chars/:account` | 废弃 | 改用 `GET /game/:account` 的 `data.troop.chars` |
| `POST /game/replays/:uuid` | 删除 | 不再支持修改录像标题、描述或隐藏状态 |
| `POST /game/replays/review/:uuid` | 删除 | 不再提供录像审核接口 |

暂停时不要再通过配置接口设置状态：

```http
POST /game/pause/:account
Authorization: Bearer <token>
```

`POST /game/config/:account` 中的 `is_stopped` 暂时兼容，但已废弃；登录会把停止状态恢复为 `false`。

## 游戏配置

配置更新仍使用 `POST /game/config/:account`，请求体必须包含 `config` 外层：

```json
{
  "config": {
    "is_auto_battle": true,
    "keeping_ap": 120,
    "recruit_reserve": 10,
    "recruit_ignore_robot": false,
    "enable_building_arrange": true,
    "accelerate_slot": "slot_14",
    "battle_tasks": [
      { "stage_id": "main_01-07", "mode": "LOOP" }
    ],
    "operator_development_tasks": [
      {
        "char_id": "char_103_angel",
        "target": {
          "evolve_phase": 2,
          "level": 80,
          "skill_level": 7,
          "masteries": [
            { "skill_id": "skchr_angel_1", "target_level": 3 }
          ]
        }
      }
    ]
  }
}
```

只传需要修改的字段。数组采用整体替换语义：省略字段表示保持原值，传 `[]` 表示清空。

请求必须至少提供 `config` 或 `captcha_info` 之一；提交验证码时 `captcha_info.challenge` 不能为空，重复提交会失败。

### 字段迁移

| 旧字段 | 当前字段 | 说明 |
| --- | --- | --- |
| `map_id` | 不可写；响应中为 `current_map` | 当前关卡由后端维护 |
| `battle_maps` | `battle_tasks` | 合并为统一作战任务数组 |
| `battle_replay_actions` | `battle_tasks` | `action_type` 改为 `mode` |
| `accelerate_slot_cn` | `accelerate_slot` | 只传槽位 ID，中文名称由前端映射 |
| `require_ocr` | 删除 | 不再支持触发背包 OCR |
| `specialization_tasks`（中间版本） | `operator_development_tasks` | 专精并入统一干员培养任务 |

加速槽位只接受：`slot_5`、`slot_6`、`slot_7`、`slot_14`、`slot_15`、`slot_16`、`slot_24`、`slot_25`、`slot_26`；默认值为 `slot_14`。

### 作战任务

`battle_tasks` 的每项结构为 `{ stage_id, mode, uuid? }`：

| `mode` | 行为 | `uuid` |
| --- | --- | --- |
| `LOOP` | 使用自己的自动部署循环作战，不消费任务 | 禁止提供 |
| `SHARE` | 使用自己的录像执行一次并发布记录 | 必填，最长 64 字符 |
| `ADOPT` | 使用指定公共录像执行一次 | 必填，最长 64 字符 |

旧模式迁移：`DEFAULT_ACTION -> LOOP`、`AUTO_BATTLE -> ADOPT`、`SHARE -> SHARE`。

### 干员培养任务

`operator_development_tasks` 是 FIFO 目标列表。每个任务必须提供：

- `char_id`
- `target.evolve_phase`：目标精英阶段
- `target.level`：目标阶段内等级
- `target.skill_level`：`1..7`
- `target.masteries`：必须为数组；不专精时传 `[]`，不能传 `null`
- `masteries[].skill_id` 和 `masteries[].target_level`（`1..3`）

同一干员或同一任务内重复技能会使整个配置更新失败；配置中的任意任务非法时，不会保存部分结果。

## 查询响应变化

### `GET /game/:account`

- `data.config.map_id` 改为 `current_map`。
- `battle_maps`、`battle_replay_actions` 改为 `battle_tasks`。
- 新增 `operator_development_tasks`。
- 删除 `accelerate_slot_cn`，保留 `accelerate_slot`。
- `data.troop` 现在只保留 `chars`；`chars` 是以实例 ID 为 key 的对象。
- 干员只返回 `charId`、`level`、`evolvePhase`、`potentialRank`、可选的 `currentTmpl` 和 `skills`；技能包含 `skillId`、`unlock`、`specializeLevel`。
- `data.inventory` 由后端直接返回白名单内的材料，不再通过 `require_ocr` 触发。
- 新增 `data.building.rooms.TRAINING`、`MANUFACTURE`、`TRADING`。

### 录像列表

`GET /game/replays` 现在只查询当前认证用户的指定账号，不再作为公共录像库查询；`account` 必填，且不再支持 `stage_id` 和 `mine`：

```http
GET /game/replays?account=<account>&page=1&limit=20
```

每项只返回 `uuid`、`stage_id`、`task_mode`、`avatar`、`created_at`、`updated_at`、`battle_id`。

`GET /game/replays/autoResults/:account` 路径不变，每项改为返回：`id`、`uuid`、`task_mode`、`stage_id`、`replay_hash`、`battle_id`、`fixed_play_time`、`created_at`。

分页参数为 `page`（默认 `1`）和 `limit`（默认 `20`，最大 `100`）。

## 系统配置

`GET /system/config` 和管理员 `POST /system/config` 路径不变，但 `shutdownTasks` 已删除。前端必须移除定时退出任务 UI 和请求字段；继续提交该字段会返回未知配置字段错误。

旧的 `docs/swagger.json` 和 `docs/swagger.yaml` 已删除，前端不要再依赖这两个静态文件。
