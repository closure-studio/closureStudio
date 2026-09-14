import { STORAGE_KEYS } from "@/constants/app";
import {
  OAuthClient,
  buildLinuxDoAuthorizeURL,
  linuxDoTargetForOrigin,
  parseLinuxDoCallbackQuery,
  pkceChallenge,
  randomHex,
} from "./oauthClient";

const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe("Linux DO PKCE", () => {
  test("generates a 64-character lowercase hex verifier", () => {
    expect(randomHex(32)).toMatch(/^[a-f0-9]{64}$/);
  });

  test("matches the RFC 7636 S256 vector", async () => {
    await expect(pkceChallenge(verifier)).resolves.toBe(
      "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    );
  });

  test("maps only fixed Website origins to relay targets", () => {
    expect(linuxDoTargetForOrigin("https://closure.ltsc.vip")).toBe("web");
    expect(linuxDoTargetForOrigin("http://localhost:5173")).toBe("web-local-vue");
    expect(linuxDoTargetForOrigin("http://localhost:5174")).toBeNull();
    expect(linuxDoTargetForOrigin("https://attacker.example")).toBeNull();
  });

  test("builds a direct Linux DO authorize URL with the passport callback", () => {
    const authorizationURL = new URL(
      buildLinuxDoAuthorizeURL(
        "public-client-id",
        "web",
        "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
      ),
    );

    expect(authorizationURL.origin).toBe("https://connect.linux.do");
    expect(authorizationURL.pathname).toBe("/oauth2/authorize");
    expect(Object.fromEntries(authorizationURL.searchParams)).toEqual({
      client_id: "public-client-id",
      redirect_uri: "https://passport.ltsc.vip/api/v1/oauth/linuxdo/callback",
      response_type: "code",
      scope: "openid profile email",
      state: "web",
      code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
      code_challenge_method: "S256",
    });
  });
});

describe("Linux DO verifier storage", () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      value: storage,
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, "sessionStorage");
  });

  test("consumes one valid verifier without storing OAuth state", () => {
    const generated = "0123456789abcdef".repeat(4);
    storage.setItem(STORAGE_KEYS.LINUXDO_CODE_VERIFIER, generated);
    const client = new OAuthClient();

    expect(client.takeCodeVerifier()).toBe(generated);
    expect(client.takeCodeVerifier()).toBeNull();
  });

  test("rejects and consumes a malformed verifier", () => {
    storage.setItem(STORAGE_KEYS.LINUXDO_CODE_VERIFIER, "not-a-verifier");
    const client = new OAuthClient();

    expect(client.takeCodeVerifier()).toBeNull();
    expect(storage.getItem(STORAGE_KEYS.LINUXDO_CODE_VERIFIER)).toBeNull();
  });

  test("stores only the verifier and redirects directly to Linux DO", async () => {
    const assign = jest.fn();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        isSecureContext: true,
        location: { assign, origin: "http://localhost:5173" },
      },
    });

    try {
      await new OAuthClient().initiateLinuxDoLogin("public-client-id");
      const authorizationURL = new URL(assign.mock.calls[0]?.[0] ?? "");
      expect(authorizationURL.origin).toBe("https://connect.linux.do");
      expect(authorizationURL.searchParams.get("state")).toBe("web-local-vue");
      expect(authorizationURL.searchParams.get("redirect_uri")).toBe(
        "https://passport.ltsc.vip/api/v1/oauth/linuxdo/callback",
      );
      expect(authorizationURL.searchParams.get("code_challenge_method")).toBe("S256");
      expect(storage.getItem(STORAGE_KEYS.LINUXDO_CODE_VERIFIER)).toMatch(
        /^[a-f0-9]{64}$/,
      );
      expect(storage.length).toBe(1);
    } finally {
      Reflect.deleteProperty(globalThis, "window");
    }
  });
});

describe("Linux DO callback query", () => {
  test("accepts exactly one success or controlled error result", () => {
    expect(parseLinuxDoCallbackQuery({ code: "code" })).toEqual({ code: "code" });
    expect(parseLinuxDoCallbackQuery({ error: "access_denied" })).toEqual({
      error: "access_denied",
    });
  });

  test.each([
    {},
    { code: "code", error: "access_denied" },
    { code: ["one", "two"] },
    { code: "code", state: "web" },
    { code: "code", error_description: "upstream detail" },
  ])("rejects malformed callback %#", (query) => {
    expect(parseLinuxDoCallbackQuery(query)).toBeNull();
  });
});
