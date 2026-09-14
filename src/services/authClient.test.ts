const mockPost = jest.fn();

jest.mock("./server", () => ({
  __esModule: true,
  AxiosServer: class {
    post = mockPost;
  },
}));

import { AuthClient } from "./authClient";

describe("AuthClient Linux DO exchange", () => {
  test("posts only the code and verifier to the exchange endpoint", async () => {
    const response = { code: 1, data: { token: "token" }, message: "ok" };
    mockPost.mockResolvedValue(response);
    const input = { code: "authorization-code", code_verifier: verifier };
    const client = new AuthClient({
      label: "Auth",
      description: "Auth Server",
      baseURL: "https://passport.ltsc.vip/api/v1",
    });

    await expect(client.loginWithLinuxDo(input)).resolves.toEqual(response);
    expect(mockPost).toHaveBeenCalledWith("/oauth/linuxdo/exchange", input);
    expect(mockPost.mock.calls[0]?.[1]).not.toHaveProperty("redirect_uri");
  });
});

const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
