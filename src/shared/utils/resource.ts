import { constants } from "@/shared/constants/config";

/**
 * 获取明日方舟资源的完整URL
 * @param path 资源路径（如 'avatar/DEFAULT/avatar_def_mc'）
 * @param extension 文件扩展名，默认为 'webp'
 * @returns 完整的资源URL
 */
export function getArkResourceUrl(path: string, extension: string = "webp"): string {
  // 移除路径开头的斜杠（如果有）
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // 移除路径中已有的扩展名（如果有）
  const pathWithoutExt = cleanPath.replace(/\.(png|jpg|jpeg|webp)$/i, "");

  return `${constants.ArkResourceDomain}/${pathWithoutExt}.${extension}`;
}
