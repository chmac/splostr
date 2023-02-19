import type { Event } from "nostr-tools";
import { describe, expect, it } from "vitest";
import { calculateBalances } from "./calculateBalances";
import type { Expense, GroupData } from "./group.service";

const exampleCreateEvent = {
  id: "4af4422b36a9cc752c91dff06fcbfae1c25c7721589fece6b25cbc6cf4e42d04",
  kind: 1989,
  pubkey: "0b5648735f7537f48252c5c210f4b6125bd334c842e6895fff4f8734813e1841",
  created_at: 1676637955,
  content: "",
  tags: [],
  sig: "526110f30e7575f08ceb2ab040271690b47f1939d312e9ef36b1cd3390408b54b85911d0088c03d124544b9071240de9c9af13f70c67ebc2622c381f9a6872e0",
};

const exampleMetadataEvent: Event = {
  id: "a6aa7311222df2363288202cc4229c44f056966945e3c5107ded35c15e9e1ff9",
  kind: 31989,
  pubkey: "0b5648735f7537f48252c5c210f4b6125bd334c842e6895fff4f8734813e1841",
  created_at: 1676661447,
  content:
    '{"name":"Test group","about":"Testing splostr on nostr","picture":""}',
  tags: [
    ["d", "4af4422b36a9cc752c91dff06fcbfae1c25c7721589fece6b25cbc6cf4e42d04"],
    ["p", "1bdd00f9fd5c4aca54a0b1e8b17bffee90c0573640421affc31e802a3a5be4b5"],
    ["member", "a", "Alice", "1"],
    ["member", "b", "Bob", "2"],
    ["member", "c", "Charli", "3"],
    ["member", "623897", "Diana", "7"],
  ],
  sig: "fd0451e7ff158f43ad614aa824dd2c135bc4049cb336ee4cfbe89015b2fec3bbe5b4eec8d58ecbbd1066c1db20fb6d550b4b87cfc0c2e9d7c1a1c97977279585",
};

const exampleExpenseEvent: Event = {
  id: "f13c748030c2f362e5788a2e2998d72e3efe3fca46c62efceb46c10e7d66e98f",
  kind: 1989,
  pubkey: "0b5648735f7537f48252c5c210f4b6125bd334c842e6895fff4f8734813e1841",
  created_at: 1676638726,
  content: "",
  tags: [
    [
      "e",
      "4af4422b36a9cc752c91dff06fcbfae1c25c7721589fece6b25cbc6cf4e42d04",
      "root",
    ],
    ["payerId", "a"],
    ["subject", "Spending"],
    ["date", "2023-02-19"],
    ["type", "share"],
    ["amount", "10.00"],
  ],
  sig: "f8d7197dc154a6ab0f2d2f55bf353e4a891091236e4875b98aeda31611cee37a397c9574801ca919771507662b5b3e736dc343f66dc28f5d1e2434b456777337",
};

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
