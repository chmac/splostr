import { describe, expect, it } from "vitest";
import { calculateSettlementPlan } from "./calculateSettlementPlan";

describe("#ExJ2j2 calculateSettlmentPlan()", () => {
  it("#2rL7Mb Calculates a payment plan for easy balances", () => {
    expect(
      calculateSettlementPlan({
        a: -10,
        b: 10,
      })
    ).toEqual([{ from: "a", to: "b", amount: 10 }]);
  });

  it("#llkwGj Calculates a payment plan for more balances", () => {
    expect(
      calculateSettlementPlan({
        a: -15,
        b: 10,
        c: -5,
        d: 10,
      })
    ).toEqual([
      { from: "a", to: "b", amount: 10 },
      { from: "a", to: "d", amount: 5 },
      { from: "c", to: "d", amount: 5 },
    ]);
  });

  it("#cefPrH Calculates a payment plan for one sender and many recipients", () => {
    expect(
      calculateSettlementPlan({
        a: -15,
        b: 6,
        c: 4,
        d: 5,
      })
    ).toEqual([
      { from: "a", to: "b", amount: 6 },
      { from: "a", to: "c", amount: 4 },
      { from: "a", to: "d", amount: 5 },
    ]);
  });

  it("#4fIKwR Calculates a payment plan for one recipient and many senders", () => {
    expect(
      calculateSettlementPlan({
        a: 15,
        b: -6,
        c: -4,
        d: -5,
      })
    ).toEqual([
      { from: "b", to: "a", amount: 6 },
      { from: "c", to: "a", amount: 4 },
      { from: "d", to: "a", amount: 5 },
    ]);
  });

  it.skip("#zzTr6v Calculates a payment plan with the minimal number of payments", () => {
    expect(
      calculateSettlementPlan({
        a: -20,
        b: -30,
        c: 30,
        d: 20,
      })
    ).toEqual([
      { from: "a", to: "d", amount: 20 },
      { from: "b", to: "c", amount: 30 },
    ]);
  });
});
