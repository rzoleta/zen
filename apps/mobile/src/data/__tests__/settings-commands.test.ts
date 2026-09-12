import { getDatabase } from "@/db/client";
import { resetSettings } from "@/data/settings-commands";

jest.mock("@/db/client", () => ({
  getDatabase: jest.fn(),
}));

describe("resetSettings", () => {
  it("executes both writes inside the synchronous Drizzle transaction", async () => {
    const deleteRun = jest.fn();
    const insertRun = jest.fn();
    const tx = {
      delete: jest.fn(() => ({ run: deleteRun })),
      insert: jest.fn(() => ({
        values: jest.fn(() => ({ run: insertRun })),
      })),
    };
    const transaction = jest.fn((callback: (value: typeof tx) => void) =>
      callback(tx),
    );
    jest.mocked(getDatabase).mockReturnValue({ transaction } as never);

    await resetSettings();

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(deleteRun).toHaveBeenCalledTimes(1);
    expect(insertRun).toHaveBeenCalledTimes(1);
  });
});
