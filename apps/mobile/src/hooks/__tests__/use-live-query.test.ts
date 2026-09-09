import { createTableChangeBatcher } from "@/hooks/use-live-query";

describe("createTableChangeBatcher", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("coalesces row changes into one table notification", () => {
    const notify = jest.fn();
    const batcher = createTableChangeBatcher(notify);

    for (let index = 0; index < 1_500; index += 1) {
      batcher.push("cards");
    }
    batcher.push("review_log");
    jest.runAllTimers();

    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify.mock.calls[0][0]).toEqual(new Set(["cards", "review_log"]));
  });

  it("cancels a pending notification", () => {
    const notify = jest.fn();
    const batcher = createTableChangeBatcher(notify);

    batcher.push("cards");
    batcher.cancel();
    jest.runAllTimers();

    expect(notify).not.toHaveBeenCalled();
  });
});
