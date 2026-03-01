# Vue3 最佳实践重构方案 — closureStudio

## 背景

这是一个 Vue3 + TypeScript + Pinia + TailwindCSS/DaisyUI 的前端项目（明日方舟托管平台），由新手时期编写，存在以下核心问题：

- **架构未落地**：`src/features/` 和 `src/shared/` 骨架已规划（各有 composables/stores/types/views 子目录），但**全部为空**，说明重构已启动但中断
- **两套状态管理**：`user.ts` 用 Pinia，`store/games/` 四个文件用手工 `reactive(new MyState())`
- **无任何 composable**：副作用逻辑（轮询、SSE、主题、验证码）全部堆在组件和模块函数中
- **超大组件**：`Dashboard.vue`（393行，10个职责）、`Login.vue`（358行，4种表单）
- **无 ESLint**：零代码规范约束
- **高危 Bug**：`__VUE_PROD_DEVTOOLS__: true` 生产环境暴露 DevTools

---

## 重构目标架构

```
src/
├── features/               ← 功能模块（已有骨架，填充代码）
│   ├── auth/               ← 登录/注册/找回密码
│   ├── games/              ← 游戏托管核心功能
│   ├── profile/            ← 个人设置
│   └── system/             ← 系统状态/公告
├── shared/                 ← 跨功能共享
│   ├── components/         ← 纯 UI 组件（Layout、Toast、通用 UI）
│   ├── composables/        ← 可复用逻辑钩子
│   ├── constants/          ← 常量
│   ├── services/           ← API 服务层
│   ├── types/              ← 全局类型定义
│   └── utils/              ← 工具函数
├── router/                 ← 路由（保持位置，优化内容）
├── stores/                 ← 全局 Pinia stores（rename from store/）
├── views/                  ← 页面入口（仅路由映射，逻辑下沉到 features）
└── App.vue / main.ts
```

---

## 分阶段实施计划

### Phase 1：工程基础（无破坏性）

**目标**：修复高危 Bug，建立代码规范工具链

#### 1.1 修复 vite.config.ts
- **文件**：`vite.config.ts`
- 修复 `__VUE_PROD_DEVTOOLS__: true` → `process.env.NODE_ENV !== 'production'`
- 添加路径别名：`resolve.alias: { '@': path.resolve(__dirname, 'src') }`
- `basicSsl()` 仅开发环境加载
- `visualizer()` 改为 `ANALYZE=true` 时加载
- `sourcemap` 改为 `process.env.NODE_ENV !== 'production'`

#### 1.2 修复 tsconfig.json
- **文件**：`tsconfig.json`
- `moduleResolution: "Node"` → `"Bundler"`（现代 Vite 项目标准）
- 添加 `paths` 配置与 vite alias 对应：`"@/*": ["./src/*"]`

#### 1.3 添加 ESLint + Prettier
- **新文件**：`eslint.config.js`（flat config 格式，Vue3 项目标准）
- 安装依赖：`eslint`、`@vue/eslint-config-typescript`、`eslint-plugin-vue`
- **新文件**：`.prettierrc.json`
- **更新**：`package.json` scripts 添加 `"lint": "eslint src/"` 和 `"format": "prettier --write src/"`

#### 1.4 修复类型错误
- **文件**：`src/typings/api.d.ts`
- `ApiGame.LogEvent.content: number` → `content: string`
- 为 `window.idaks`、`window.skadi` 添加全局 Window 类型扩展

---

### Phase 2：共享基础设施（Shared Layer）

**目标**：将散落的工具、类型、服务迁移到 `shared/`

#### 2.1 类型定义迁移
- **目标**：`src/shared/types/`
- `src/typings/api.d.ts` → `src/shared/types/api.ts`（`declare namespace` → `export interface`）
- `src/typings/system.d.ts` → `src/shared/types/service.ts` + `src/shared/types/gamedata.ts`

#### 2.2 常量提取
- **目标**：`src/shared/constants/`
- `src/plugins/config.ts` → `src/shared/constants/config.ts`
- 路由名称提取：`src/shared/constants/routes.ts`（替代中文字符串路由名 `"首页"` 等）

#### 2.3 工具函数整合
- **目标**：`src/shared/utils/`
- 合并 `src/plugins/common.ts` + `src/utils/account.ts` + `src/utils/regex.ts`
- 按功能拆分：`format.ts`（时间/字符串格式化）、`account.ts`（账号处理）、`theme.ts`（主题）
- 统一 `processGameAccount` / `getRealGameAccount` / `buildGameAccount` 为单一函数（当前三处重复定义）

#### 2.4 API 服务层迁移
- **目标**：`src/shared/services/`（整体从 `src/plugins/axios/` 迁移）
- 修复 `server.ts`：
  - 删除模块顶层 `localStorage` 读取，改为懒加载 `get token()`
  - `del()` 返回类型从 `Promise<unknown>` 改为 `Promise<T>`
  - `Send_SMS` → `sendSms`（统一 camelCase）
- 将 `axiosHelper.ts` 的错误处理整合到拦截器（当前三种错误处理模式并存）
- 统一响应检查：全部使用 `res.code === 1`（当前混用 `== 1`、`=== 1`、`res.data` 三种）

#### 2.5 通用 Composables
- **目标**：`src/shared/composables/`
- `useLoading.ts`：封装 `isLoading` ref + 防重复点击（当前 10+ 组件各自定义）
- `useCaptcha.ts`：封装验证码包装工厂（当前 Dashboard.vue + CreateGame.vue 各自重复定义 3 份）
- `useCountdown.ts`：封装短信验证码倒计时
- `useTheme.ts`：从 `App.vue` 提取主题加载逻辑

#### 2.6 共享组件迁移
- `src/components/layout/` → `src/shared/components/layout/`
- `src/components/toast/` → `src/shared/components/toast/`
- `src/components/Alert.vue` → `src/shared/components/ui/Alert.vue`
- `src/components/Loading.vue` → `src/shared/components/ui/Loading.vue`

---

### Phase 3：统一状态管理（Pinia）

**目标**：消除两套状态管理，全面迁移到 Pinia Setup Store

#### 3.1 规范 user store
- **目标文件**：`src/stores/useUserStore.ts`
- `userStore` → `useUserStore`（Pinia `use` 前缀约定）
- Options Store → Setup Store 风格：
  ```ts
  export const useUserStore = defineStore('user', () => {
    const user = ref<UserState>({ isLogin: false, Token: '', Info: ... })
    const isLogin = computed(() => user.value.isLogin)
    function login(token: string) { ... }
    function logout() { user.value = { isLogin: false, ... } }
    return { user, isLogin, login, logout }
  }, { persist: true })
  ```
- 提取 `b64decode` 工具函数到 `shared/utils/`

#### 3.2 重构 games store
- **目标**：`src/stores/useGamesStore.ts`（合并 `store/games/` 4个文件）
- `myState` reactive 类 → Pinia store state（支持 devtools 调试 + `$reset()`）
- 游戏列表轮询逻辑（`games.ts`）→ store action
- SSE 连接管理（`sse.ts`）→ store action 或 `features/games/composables/useGameSSE.ts`
- `quota.ts` 纯函数 → `features/games/composables/useGameQuota.ts`
- 解决 `myGames.ts` ↔ `games.ts` 循环依赖

---

### Phase 4：功能模块化（Features）

**目标**：将组件迁移到对应 feature 目录，拆分超大组件

#### 4.1 auth feature（`src/features/auth/`）
- `components/card/Login.vue`（358行，4种表单）→ 拆分：
  - `features/auth/components/LoginForm.vue`
  - `features/auth/components/RegisterForm.vue`
  - `features/auth/components/ForgotPasswordForm.vue`
  - `features/auth/components/ForgotAccountForm.vue`
  - `features/auth/composables/useAuthForm.ts`（表单状态）
  - `features/auth/composables/useAuthActions.ts`（登录/注册 action）

#### 4.2 games feature（`src/features/games/`）
- `views/user/Dashboard.vue`（393行，10个职责）→ 拆分：
  - `views/Dashboard.vue` 保留，精简为纯布局组合（目标 ~50行）
  - `features/games/composables/useGameActions.ts`（登录/暂停/删除/创建操作）
  - `features/games/composables/useGameTransitions.ts`（页面过渡动画）
  - `features/games/components/GameList.vue`（游戏列表渲染）
- 迁移：`components/card/GameAccount.vue`、`GamePanel.vue`、`GameAddCard.vue`
- 迁移：`components/dialog/CreateGame.vue`、`GameConfig.vue`、`UpdateGamePasswd.vue`

#### 4.3 profile feature（`src/features/profile/`）
- `views/user/Profile.vue` 顶层 API 调用移入 `onMounted`
- `features/profile/composables/useProfileData.ts`
- 迁移：`components/dialog/RealName.vue`、`QQBind.vue`

#### 4.4 system feature（`src/features/system/`）
- `components/APIStatus/` → `features/system/components/`
- `components/card/Status.vue` → `features/system/components/VersionStatus.vue`

---

### Phase 5：代码规范清理

**目标**：统一命名、修复错别字、清理遗留问题

1. **拼写修复**：全项目 `arknigths` → `arknights`（函数名、字体名、注释多处）
2. **路由名称**：`name: "首页"` → `name: ROUTE_NAMES.HOME`（引用 `shared/constants/routes.ts`）
3. **import 路径**：相对路径 `../../plugins/axios/` → `@/shared/services/`
4. **错误处理统一**：全部改为 `try/catch + finally`（移除无 `.catch()` 的裸 `.then().finally()`）
5. **`@ts-ignore` 清理**：用正确类型声明替代（主要在 `Login.vue`、`server.ts`）

---

## 关键文件迁移对照表

| 当前位置 | 迁移目标 |
|---------|---------|
| `src/plugins/axios/` | `src/shared/services/` |
| `src/typings/api.d.ts` | `src/shared/types/api.ts` |
| `src/typings/system.d.ts` | `src/shared/types/service.ts` + `gamedata.ts` |
| `src/plugins/common.ts` | `src/shared/utils/`（按功能拆分） |
| `src/plugins/config.ts` | `src/shared/constants/config.ts` |
| `src/components/layout/` | `src/shared/components/layout/` |
| `src/components/toast/` | `src/shared/components/toast/` |
| `src/store/user.ts` | `src/stores/useUserStore.ts` |
| `src/store/games/*.ts` | `src/stores/useGamesStore.ts` |
| `src/components/card/Login.vue` | `src/features/auth/components/`（拆分为 4 个） |
| `src/views/user/Dashboard.vue` | 保留但精简 + `src/features/games/composables/` |

---

## 验证方式

每个 Phase 完成后执行：
1. `npm run typeCheck` — 无 TypeScript 错误
2. `npm run lint` — 无 ESLint 错误（Phase 1 后可用）
3. `npm run dev` — 开发服务器正常启动，页面功能正常
4. 手动测试：登录流程、游戏托管操作、个人设置页面

---

## 实施原则

- **各 Phase 独立可交付**：每个阶段结束时代码可正常运行，不留半成品
- **Phase 1 优先**：修复生产 Bug + 建立 ESLint 是后续工作的前提
- **Phase 2-3 可并行**：共享层和状态管理改造相互独立
- **Phase 4 最耗时**：建议按 feature 逐个完成（先 auth，再 games）
- **Phase 5 最后**：规范清理依赖前面的结构稳定后进行
