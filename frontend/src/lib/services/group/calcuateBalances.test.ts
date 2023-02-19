import { describe, expect, it } from "vitest";
import {
  exampleCreateEvent,
  exampleExpenseEvent,
  exampleMetadataEvent,
} from "../../../fixtures/events.fixtures";
import { calculateBalances } from "./calculateBalances";
import type { Expense, GroupData } from "./group.service";

const exampleShareExpense: Expense = {
  amount: "13",
  date: "2023-02-19",
  payerId: "a",
  subject: "Spending",
  type: "share",
  event: exampleExpenseEvent,
};

const exampleMembers = {
  a: { id: "a", name: "Alice", shares: 1 },
  b: { id: "b", name: "Bob", shares: 2 },
  c: { id: "c", name: "Charli", shares: 3 },
  d: { id: "d", name: "Diana", shares: 7 },
};

const exampleShareGroup: GroupData = {
  events: {
    create: exampleCreateEvent,
    metadata: exampleMetadataEvent,
  },
  members: exampleMembers,
  profile: {
    name: "Test group",
    about: "Testing splostr on nostr",
    picture: "",
  },
  expenses: [exampleShareExpense],
};

const exampleSplitExpense: Expense = {
  amount: "10",
  date: "2023-02-19",
  payerId: "a",
  subject: "Spending",
  type: "split",
  event: exampleExpenseEvent,
  splits: {
    a: "4",
    b: "6",
  },
};

const exampleSplitGroup: GroupData = {
  events: {
    create: exampleCreateEvent,
    metadata: exampleMetadataEvent,
  },
  members: exampleMembers,
  profile: {
    name: "Test group",
    about: "Testing splostr on nostr",
    picture: "",
  },
  expenses: [exampleSplitExpense],
};

describe("#Varlcm calculateBalances()", () => {
  it("#o837fG Calculates a share correctly", () => {
    expect(calculateBalances(exampleShareGroup)).toEqual({
      a: 12,
      b: -2,
      c: -3,
      d: -7,
    });
  });

  it("#i1eimD creates a balance sum of zer for a share", () => {
    const balances = calculateBalances(exampleShareGroup);
    const sum = Object.values(balances).reduce(
      (sum, balance) => sum + balance,
      0
    );
    expect(sum).toEqual(0);
  });

  it("#dfSc0w calculates a split correctly", () => {
    expect(calculateBalances(exampleSplitGroup)).toEqual({
      a: 6,
      b: -6,
      c: 0,
      d: 0,
    });
  });

  it("#dfSc0w creates a balance sum of zero for a split", () => {
    const balances = calculateBalances(exampleSplitGroup);
    const sum = Object.values(balances).reduce(
      (sum, balance) => sum + balance,
      0
    );
    expect(sum).toEqual(0);
  });
});
