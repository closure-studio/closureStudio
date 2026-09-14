import { LINUXDO_OAUTH_CONFIG } from "@/constants/auth";
import { STORAGE_KEYS } from "@/constants/app";

const PKCE_VERIFIER_PATTERN = /^[a-f0-9]{64}$/;
const CODE_VERIFIER_BYTE_LENGTH = 32;

const TARGET_BY_ORIGIN = {
  "https://closure.ltsc.vip": "web",
  "http://localhost:5173": "web-local-vue",
} as const;

export type LinuxDoTarget = (typeof TARGET_BY_ORIGIN)[keyof typeof TARGET_BY_ORIGIN];
export type LinuxDoCallback = { code: string } | { error: string };

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function randomHex(byteLength: number): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(byteLength)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function pkceChallenge(codeVerifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(codeVerifier),
  );
  return bytesToBase64Url(new Uint8Array(digest));
}

export function linuxDoTargetForOrigin(origin: string): LinuxDoTarget | null {
  return TARGET_BY_ORIGIN[origin as keyof typeof TARGET_BY_ORIGIN] ?? null;
}

export function buildLinuxDoAuthorizeURL(
  clientId: string,
  target: LinuxDoTarget,
  challenge: string,
): string {
  const authorizationURL = new URL(LINUXDO_OAUTH_CONFIG.authorizationEndpoint);
  authorizationURL.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: LINUXDO_OAUTH_CONFIG.providerCallbackUri,
    response_type: LINUXDO_OAUTH_CONFIG.responseType,
    scope: LINUXDO_OAUTH_CONFIG.scopes.join(" "),
    state: target,
    code_challenge: challenge,
    code_challenge_method: "S256",
  }).toString();
  return authorizationURL.href;
}

export function parseLinuxDoCallbackQuery(
  query: Record<string, unknown>,
): LinuxDoCallback | null {
  if (Object.keys(query).some((key) => !["code", "error"].includes(key))) {
    return null;
  }
  const code = singleQueryValue(query.code);
  const error = singleQueryValue(query.error);
  if (Boolean(code) === Boolean(error)) return null;
  return code ? { code } : { error: error ?? "" };
}

function singleQueryValue(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export class OAuthClient {
  takeCodeVerifier(): string | null {
    const verifier = sessionStorage.getItem(STORAGE_KEYS.LINUXDO_CODE_VERIFIER);
    sessionStorage.removeItem(STORAGE_KEYS.LINUXDO_CODE_VERIFIER);
    return verifier && PKCE_VERIFIER_PATTERN.test(verifier) ? verifier : null;
  }

  discardCodeVerifier(): void {
    sessionStorage.removeItem(STORAGE_KEYS.LINUXDO_CODE_VERIFIER);
  }

  async initiateLinuxDoLogin(configuredClientId: string | undefined): Promise<void> {
    const clientId = configuredClientId?.trim();
    const target = linuxDoTargetForOrigin(window.location.origin);
    if (!clientId || !target || !window.isSecureContext || !crypto.subtle) {
      throw new Error("Linux DO OAuth is unavailable");
    }

    const codeVerifier = randomHex(CODE_VERIFIER_BYTE_LENGTH);
    const challenge = await pkceChallenge(codeVerifier);
    sessionStorage.setItem(STORAGE_KEYS.LINUXDO_CODE_VERIFIER, codeVerifier);
    try {
      window.location.assign(buildLinuxDoAuthorizeURL(clientId, target, challenge));
    } catch (error) {
      this.discardCodeVerifier();
      throw error;
    }
  }
}

const oauthClient = new OAuthClient();
export default oauthClient;
