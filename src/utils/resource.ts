import { GameResourceType } from "@/constants/game";
import { ARK_RESOURCE_DOMAIN } from "@/constants/api";

/**
 * 获取明日方舟资源的完整URL
 * @param path 资源路径（如 'avatar/DEFAULT/avatar_def_mc'）
 * @param extension 文件扩展名，默认为 'webp'
 * @returns 完整的资源URL
 */
export function getArkResourceUrl(path: string, extension: string = "webp"): string {
  // 移除路径开头的斜杠（如果有）
  const cleanPath = path.replace(/^\/+/, "");

  // 移除路径中已有的扩展名（如果有）
  const pathWithoutExt = cleanPath.replace(/\.(png|jpg|jpeg|webp)$/i, "");

  return `${ARK_RESOURCE_DOMAIN}/assets/${pathWithoutExt}.${extension}`;
}

/**
 * 获取明日方舟数据表的完整URL
 * @param fileName 数据表文件名（如 'item_table.json'）
 * @returns 完整的数据表URL
 */
export function getArkDataUrl(fileName: string): string {
  const cleanPath = fileName.replace(/^\/+/, "");

  return `${ARK_RESOURCE_DOMAIN}/data/${cleanPath}`;
}

/**
 * 获取游戏资源图标 URL
 * @param type 资源类型
 * @returns 完整的资源 URL
 */
export function getGameResourceIconUrl(type: GameResourceType): string {
  return getArkResourceUrl(`items/${type}`);
}

/**
 * 获取干员立绘 URL (桌面端)
 */
export function getCharPortraitUrl(charId: string, phase: number): string {
  return getArkResourceUrl(`charpor/${charId}_${phase}`);
}

/**
 * 获取干员头像 URL (移动端)
 */
export function getCharAvatarUrl(charId: string): string {
  return getArkResourceUrl(`avatar/ASSISTANT/${charId}`);
}

/**
 * 格式化干员名称
 * char_204_platn -> PLATN
 */
export function formatCharName(charId: string): string {
  return charId.replace(/^char_\d+_/, '').toUpperCase();
}

/**
 * 格式化大数字（超过100万时简写）
 * 1234567 -> 123万
 * 123456 -> 123,456
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return Math.floor(num / 10000) + '万';
  }
  return num.toLocaleString();
}
