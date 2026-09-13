import {
  resetCards,
  setManyKnown,
  setManySuspended,
} from "@/data/study-commands";

describe("bulk study commands", () => {
  it("marks every selected card as known and clears suspension", async () => {
    const where = jest.fn();
    const set = jest.fn(() => ({ where }));
    const database = { update: jest.fn(() => ({ set })) };

    await setManyKnown(database as never, [2, 5]);

    expect(set).toHaveBeenCalledWith({ known: true, suspended: "none" });
    expect(where).toHaveBeenCalledTimes(1);
  });

  it("suspends every selected card", async () => {
    const where = jest.fn();
    const set = jest.fn(() => ({ where }));
    const database = { update: jest.fn(() => ({ set })) };

    await setManySuspended(database as never, [2, 5]);

    expect(set).toHaveBeenCalledWith({ suspended: "manual" });
    expect(where).toHaveBeenCalledTimes(1);
  });

  it("deletes review history and resets cards in one transaction", async () => {
    const deleteRun = jest.fn();
    const updateRun = jest.fn();
    const set = jest.fn(() => ({
      where: jest.fn(() => ({ run: updateRun })),
    }));
    const tx = {
      delete: jest.fn(() => ({
        where: jest.fn(() => ({ run: deleteRun })),
      })),
      update: jest.fn(() => ({ set })),
    };
    const transaction = jest.fn((callback: (value: typeof tx) => void) =>
      callback(tx),
    );

    await resetCards({ transaction } as never, [2, 5]);

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(deleteRun).toHaveBeenCalledTimes(1);
    expect(updateRun).toHaveBeenCalledTimes(1);
    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({
        known: false,
        suspended: "none",
        reps: 0,
        lapses: 0,
      }),
    );
  });

  it("does not issue a query for an empty selection", async () => {
    const database = {
      update: jest.fn(),
      transaction: jest.fn(),
    };

    await setManyKnown(database as never, []);
    await setManySuspended(database as never, []);
    await resetCards(database as never, []);

    expect(database.update).not.toHaveBeenCalled();
    expect(database.transaction).not.toHaveBeenCalled();
  });
});
