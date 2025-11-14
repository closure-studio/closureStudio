import { Store } from "../components/toast/store";
import { ref } from "vue";
export const { setMsg } = Store();
export const isLarge = ref(false);
import { format } from "date-fns";

export const formatTime = (timestamp: number, formatString: string): string => {
  return format(new Date(timestamp * 1000), formatString);
};

export function loadTheme() {
  const theme = localStorage.getItem("theme") || "halloween";
  document.documentElement.setAttribute("data-theme", theme);
}
export function SetTheme(name: string) {
  localStorage.setItem("theme", name);
  document.documentElement.setAttribute("data-theme", name);
}
export function getTheme() {
  return localStorage.getItem("theme");
}
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const isNight =
  new Date().getHours() >= 22 || new Date().getHours() <= 6;

export const YouMayKnowArray = [
  `恭喜 mrbear 累计出货4次！！！分别是凛御银灰，凛御银灰，凛御银灰和圣聆初雪。希望各位用户好好检讨，多多向 Mr.Bear 学习。`,
  // "可露希尔可是支持全自动搓玉的哦~",
  // "周日快过期的理智药，可露希尔都会帮你用掉的呢！",
  // "每日每周的日常任务，都交给可露希尔，可露希尔会全自动帮你完成的~",
  // "可露希尔工作室其实是一个公益免费开源项目哦，大家可以安心使用。",
  // "如果目标作战关卡关闭了，可露希尔就没法帮你代理目标关卡啦！",
  // "每个账号都有24小时的试用时间哦，尽情享用吧！",
  // "可露希尔也是需要休息的！UTC+8 5:00-8:00是可露希尔的休息时间~",
  // "有好的建议的话，记得在工单系统上告诉可露希尔哦，可露希尔会很开心的！",
  // "为什么不会自动赠送线索？因为开发者也送不明白啦。",
  // "可露希尔是个好孩子，可露希尔不允许进行任何违法行为哦。",
  // "不要滥用可露希尔哦~",
  // "如果有网络问题，可露希尔是帮不上忙的呢。",
  // "别以为注册多个账号就可以滥用哦，小可露希尔可是会检测到的，连隐私模式也不行呢。",
  // "作战失败的原因，游戏日志已经告诉你啦，不要再问可露希尔啦。",
  // "为什么会作战失败，但是手机或者模拟器能正常作战？这个问题，可露希尔也不知道呢。",
  // "请向开发团队致以崇高的敬意，他们真的很棒呢！",
  // "想要成为可露希尔们的一员吗？可露希尔工作室正在招募运维和开发工程师！别错过这个机会，快来投递简历吧！",
];

export function selectRandomElement<T>(arr: T[]): T | undefined {
  if (arr.length === 0) {
    return undefined;
  }
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

// gameAccount format is "G1234556789"
// return 123456789
export function getRealGameAccount(gameAccount: string | undefined) {
  if (!gameAccount) {
    return "";
  }
  if (gameAccount.startsWith("G") || gameAccount.startsWith("B")) {
    return gameAccount.substring(1);
  }
  return gameAccount;
}

export function maskPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) {
    return "";
  }
  // 确保手机号至少有两个字符
  if (phoneNumber.length < 2) {
    return phoneNumber;
  }

  // 计算马赛克（星号）的长度：约为总长度的1/3
  const numStars = Math.max(Math.floor(phoneNumber.length / 3), 1);

  // 计算开始和结束的索引
  const startIdx = Math.floor((phoneNumber.length - numStars) / 2);
  const endIdx = startIdx + numStars;

  // 构建马赛克字符串
  return (
    phoneNumber.substring(0, startIdx) +
    "*".repeat(numStars) +
    phoneNumber.substring(endIdx)
  );
}

export const defaultAuthor = (): TicketSystem.Author => {
  return {
    uuid: "",
    title: "",
    nickname: "匿名玩家",
    avatar: {
      type: "DEFAULT",
      id: "avatar_activity_GK",
    },
  };
};

export const defaultTags = [
  { name: "错误报告", description: "各类游戏错误、异常", color: "bg-red-500" },
  { name: "不会实现", description: "这片大地并不需要", color: "bg-yellow-500" },
  { name: "功能增强", description: "提出你的伟大想法", color: "bg-green-500" },
  {
    name: "等待确认",
    description: "未知的事物总是新鲜而奇特的",
    color: "bg-purple-500",
  },
  {
    name: "等待整合",
    description: "部分已完成的内容还需要更多测试才能推送并启用",
    color: "bg-pink-500",
  },
  {
    name: "文案修改",
    description: "平台内描述性内容问题",
    color: "bg-indigo-500",
  },
  {
    name: "模范提问",
    description: "这值得我们每个人所学习",
    color: "bg-gray-500",
  },
  { name: "鉴定为重", description: "提议重复或类似", color: "bg-gray-500" },
  {
    name: "需要帮助",
    description: "这片大地之下还有许多我们不为所知的事物",
    color: "bg-gray-500",
  },
  {
    name: "需要补充",
    description: "还需要更多有用的有效信息",
    color: "bg-gray-500",
  },
];
