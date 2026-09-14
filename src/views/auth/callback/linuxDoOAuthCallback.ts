import {
  parseLinuxDoCallbackQuery,
  type LinuxDoCallback,
} from "@/services/oauthClient";

type LinuxDoExchangeResponse = {
  data?: { token?: string };
  message?: string;
};

type LinuxDoCallbackDependencies = {
  discardCodeVerifier(): void;
  exchange(input: { code: string; code_verifier: string }): Promise<LinuxDoExchangeResponse>;
  login(token: string): void;
  replaceDashboard(): Promise<void>;
  takeCodeVerifier(): string | null;
};

export type LinuxDoCallbackOutcome =
  | { kind: "success" }
  | { kind: "invalid-params" }
  | { kind: "missing-verifier" }
  | { kind: "cancelled" }
  | { kind: "provider-failed" }
  | { kind: "exchange-failed"; message: string | null };

export async function handleLinuxDoOAuthCallback(
  query: Record<string, unknown>,
  dependencies: LinuxDoCallbackDependencies,
): Promise<LinuxDoCallbackOutcome> {
  const callback = parseLinuxDoCallbackQuery(query);
  if (!callback) {
    dependencies.discardCodeVerifier();
    return { kind: "invalid-params" };
  }

  const codeVerifier = dependencies.takeCodeVerifier();
  if ("error" in callback) {
    return {
      kind: callback.error === "access_denied" ? "cancelled" : "provider-failed",
    };
  }
  if (!codeVerifier) return { kind: "missing-verifier" };

  return exchangeCode(callback, codeVerifier, dependencies);
}

async function exchangeCode(
  callback: Extract<LinuxDoCallback, { code: string }>,
  codeVerifier: string,
  dependencies: LinuxDoCallbackDependencies,
): Promise<LinuxDoCallbackOutcome> {
  const response = await dependencies.exchange({
    code: callback.code,
    code_verifier: codeVerifier,
  });
  const token = response.data?.token;
  if (!token) {
    return { kind: "exchange-failed", message: response.message ?? null };
  }

  dependencies.login(token);
  await dependencies.replaceDashboard();
  return { kind: "success" };
}
