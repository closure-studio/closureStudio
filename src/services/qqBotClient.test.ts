const mockPost = jest.fn();

jest.mock("./server", () => ({
  __esModule: true,
  AxiosServer: class {
    post = mockPost;
  },
}));

import qqBotClient from "./qqBotClient";
import { API_QQBOT_SPECIAL_NOTIFY_STATUS } from "@/shared/types/api";

describe("qqBotClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("specialNotify 调用特殊通知接口", async () => {
    const response = {
      status: API_QQBOT_SPECIAL_NOTIFY_STATUS.OK,
      results: [
        {
          group: "1345795",
          ok: true,
          message_id: 123,
          error: null,
        },
      ],
    };
    mockPost.mockResolvedValue(response);

    await expect(
      qqBotClient.specialNotify({
        message: "通知内容",
        groups: ["1345795"],
      })
    ).resolves.toEqual(response);

    expect(mockPost).toHaveBeenCalledWith("/api/special_notify", {
      message: "通知内容",
      groups: ["1345795"],
    });
  });
});
