import { createDisplayLease } from "./displayLease";

const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
test("两类任务串行，取消排队任务不执行，异常后释放", async () => {
  const lease = createDisplayLease();
  let release!: () => void;
  const first = lease.run(() => new Promise<void>((resolve) => { release = resolve; }));
  const controller = new AbortController(); const skip = jest.fn();
  const cancelled = lease.run(skip, controller.signal).catch((error) => error);
  const next = jest.fn(async () => "next"); const last = lease.run(next);
  await flush(); expect(next).not.toHaveBeenCalled();
  controller.abort(); await expect(cancelled).resolves.toMatchObject({ kind: "cancelled" });
  release(); await first; await expect(last).resolves.toBe("next"); expect(skip).not.toHaveBeenCalled();
  await expect(lease.run(async () => { throw new Error("failure"); })).rejects.toThrow("failure");
  await expect(lease.run(async () => "free")).resolves.toBe("free");
});
