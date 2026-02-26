export function b64decodeUtf8(str: string): string {
  const base64Decoded = atob(str);
  const chars: number[] = [];
  for (let index = 0; index < base64Decoded.length; index++) {
    chars.push(base64Decoded.charCodeAt(index));
  }
  const utf8Bytes = new Uint8Array(chars);
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(utf8Bytes);
}

export function decodeJwtPayload<T>(token: string): T {
  const payload = token.split(".")[1] || "";
  return JSON.parse(b64decodeUtf8(payload)) as T;
}
