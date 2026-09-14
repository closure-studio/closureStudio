import { handleLinuxDoOAuthCallback } from "./linuxDoOAuthCallback";

const codeVerifier = "0123456789abcdef".repeat(4);

function dependencies() {
  return {
    discardCodeVerifier: jest.fn(),
    exchange: jest.fn().mockResolvedValue({
      code: 1,
      data: { token: "closure-jwt" },
      message: "登录成功",
    }),
    login: jest.fn(),
    replaceDashboard: jest.fn().mockResolvedValue(undefined),
    takeCodeVerifier: jest.fn().mockReturnValue(codeVerifier),
  };
}

test("exchanges a valid callback, enters the user store, and replaces history", async () => {
  const workflow = dependencies();

  await expect(
    handleLinuxDoOAuthCallback({ code: "authorization-code" }, workflow),
  ).resolves.toEqual({ kind: "success" });

  expect(workflow.exchange).toHaveBeenCalledWith({
    code: "authorization-code",
    code_verifier: codeVerifier,
  });
  expect(workflow.login).toHaveBeenCalledWith("closure-jwt");
  expect(workflow.replaceDashboard).toHaveBeenCalledTimes(1);
});

test("consumes the verifier on access_denied without calling exchange", async () => {
  const workflow = dependencies();

  await expect(
    handleLinuxDoOAuthCallback({ error: "access_denied" }, workflow),
  ).resolves.toEqual({ kind: "cancelled" });

  expect(workflow.takeCodeVerifier).toHaveBeenCalledTimes(1);
  expect(workflow.exchange).not.toHaveBeenCalled();
  expect(workflow.login).not.toHaveBeenCalled();
  expect(workflow.replaceDashboard).not.toHaveBeenCalled();
});

test("discards the verifier when the callback shape is malformed", async () => {
  const workflow = dependencies();

  await expect(
    handleLinuxDoOAuthCallback({ code: ["one", "two"] }, workflow),
  ).resolves.toEqual({ kind: "invalid-params" });

  expect(workflow.discardCodeVerifier).toHaveBeenCalledTimes(1);
  expect(workflow.takeCodeVerifier).not.toHaveBeenCalled();
  expect(workflow.exchange).not.toHaveBeenCalled();
});

test("does not exchange a code when the verifier is missing", async () => {
  const workflow = dependencies();
  workflow.takeCodeVerifier.mockReturnValue(null);

  await expect(
    handleLinuxDoOAuthCallback({ code: "authorization-code" }, workflow),
  ).resolves.toEqual({ kind: "missing-verifier" });

  expect(workflow.exchange).not.toHaveBeenCalled();
});
