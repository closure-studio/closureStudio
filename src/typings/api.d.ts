declare namespace ApiSystem {
  interface Config {
    isUnderMaintenance: boolean;
    isDebugMode: boolean;
    announcement: string;
    allowGameLogin: boolean;
    allowGameCreate: boolean;
    allowGameUpdate: boolean;
    allowGameDelete: boolean;
  }
  interface Hall {
    Account: string;
    nickName: string;
    totalAPCosts: number;
    level: number;
    avatar: {
      type: string;
      id: string;
    };
  }
}

declare namespace TicketSystem {
  interface Ticket {
    createdAt: number;
    updatedAt: number;
    id: string;
    replyTo: string;
    status: number;
    tags: string[];
    attachments: string[];
    isHidden: boolean;
    isPinned: boolean;
    authorUUID: string;
    author: Author;
    content: content;
    votes: number;
    isAnonymous: boolean;
    gameAccount: string;
  }

  interface Author {
    uuid: string;
    title: string;
    nickname: string;
    avatar: ApiGame.Avatar;
  }
  interface content {
    id: string;
    title: string;
    content: string;
  }
  interface updateTicket {
    status?: 0 | 1;
    tags?: string[];
    attachments?: string[];
    isHidden?: boolean;
    isPinned?: boolean;
    content?: content;
    IsAnonymous?: boolean;
  }

  interface createTicket {
    replyTo: string;
    tags: string[];
    attachments: string[];
    isPinned: boolean;
    author: Author | null;
    content: content;
    isAnonymous: boolean;
    gameAccount: string;
  }
}

declare namespace ApiUser {
  interface Auth {
    token: string;
  }
  interface Info {
    uuid: string;
    email: string;
    permission: number;
    status: number; // 0封禁 -1未验证手机 1正常  2人工验证
    isAdmin: boolean;
    exp: number;
    slot: number;
    createdAt: number;
  }
  interface User {
    ID: number;
    UserEmail: string;
    Password: string;
    UUID: string;
    Status: number;
    IP: string;
    Slot: number;
    QQ: string;
    Phone: string;
    Permission: number;
    CreatedTs: number;
    UpdateTs: number;
  }

  interface WXPusher {
    uuid: string;
    wxUID: string;
    createdAt: number;
    isDeleted: boolean;
    deletedAt: number;
    userHeadImg: string;
    userName: string;
  }

  interface WXPusherQRCode {
    expires: number;
    code: string;
    shortUrl: string;
    url: string;
    extra: string;
  }
}
declare namespace ApiGame {
  interface Config {
    accelerate_slot?: string;
    accelerate_slot_cn?: string;
    account?: string;
    allow_login_assist?: boolean;
    battle_maps?: string[] | string;
    enable_building_arrange?: boolean;
    is_auto_battle?: boolean;
    is_stopped?: boolean;
    keeping_ap?: number;
    map_id?: string;
    recruit_ignore_robot?: boolean;
    recruit_reserve?: number;
  }
  interface Screenshot {
    uTCTime: number;
    fileName: string[];
    host: string;
    type: number;
    url: string;
  }
  interface Avatar {
    id: string;
    type: string;
  }
  interface Status {
    androidDiamond: number;
    ap: number;
    avatar: Avatar;
    avatarId: string;
    diamondShard: number;
    gachaTicket: number;
    gold: number;
    lastApAddTime: number;
    level: number;
    maxAp: number;
    nickName: string;
    recruitLicense: number;
    secretary: string;
    secretarySkinId: string;
    socialPoint: number;
    tenGachaTicket: number;
  }
  interface Detail {
    config: Config;
    consumable?: any;
    inventory?: any;
    lastFreshTs: number;
    screenshot: Screenshot[];
    status: Status;
    troop?: any;
  }
  interface GameLogs {
    logs: GameLogEntry[];
    hasMore: boolean;
  }
  interface GameLogEntry {
    id: number;
    ts: number;
    name: string;
    logLevel: number;
    content: string;
  }
  interface GameStatus {
    account: string;
    password: string | null;
    platform: number;
    uuid: string;
    code: number; // 当前用户状态，-1=登陆失败 0=未开启/未初始化/正在初始化但未登录 1=登录中 2=登陆完成/运行中 3=游戏错误
    text: string;
    nick_name: string;
    level: number;
    avatar: {
      type: string;
      id: string;
    };
    created_at: number;
    is_verify: boolean;
    ap: number;
  }
  interface 入CaptchaInfo {
    // GT3 字段
    challenge?: string;
    gt?: string;
    // GT4 字段
    geetestId?: string;
    riskType?: string;
    // 通用字段
    created: number;
    captcha_type: string;
  }
  interface GameConfig {
    account: string;
    accelerate_slot: string;
    accelerate_slot_cn: string;
    battle_maps: string[];
    enable_building_arrange: boolean;
    is_auto_battle: boolean;
    is_stopped: boolean;
    keeping_ap: number;
    recruit_ignore_robot: boolean;
    recruit_reserve: number;
    map_id: string;
    allow_login_assist: boolean;
  }
  interface Game {
    status: GameStatus;
    captcha_info: CaptchaInfo;
    game_config: GameConfig;
  }
  interface SSR {
    account: string;
    nickName: string;
    avatar: ApiGame.Avatar;
    gachaInfo: string;
    charId: string;
    createdAt: number;
  }
  interface LogEvent extends MessageEvent {
    name: string;
    content: number;
  }
}
declare namespace Registry {
  interface AddGameForm {
    account: string;
    password: string;
    platform: number;
  }

  interface AccountFound {
    account: string;
  }

  interface UserInfo {
    createdAt: number;
    idServerPermission: number;
    idServerPhone: string;
    idServerQQ: string;
    idServerStatus: number;
    ruleFlags: [];
    rules: [];
    slots: Slot[];
    updatedAt: number;
    uuid: string;
  }
  interface Slot {
    createdAt: number;
    gameAccount: string | null;
    ruleFlags: string[];
    updatedAt: number;
    useFlagDefaults: boolean;
    uuid: string;
  }
}

declare namespace HealthMonitor {
  export type HealthRecord = Record<string, string>;
}
