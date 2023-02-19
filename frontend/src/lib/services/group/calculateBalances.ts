import { mapValues } from "remeda";
import type { GroupData } from "./group.service";

export function calculateBalances(
  groupData: Pick<GroupData, "members" | "expenses">
) {
  const { members, expenses } = groupData;

  const shareCount = Object.entries(members).reduce(
    (sum, [, member]) => sum + member.shares,
    0
  );

  const emptyBalances: Record<string, number> = mapValues(members, () => 0);
  const balances = expenses.reduce((balances, expense) => {
    const amount = parseFloat(expense.amount);

    if (expense.type === "share") {
      const amountPerShare = amount / shareCount;
      const newBalances = mapValues(balances, (balance, id) => {
        const memberShare = amountPerShare * members[id].shares;
        if (id === expense.payerId) {
          return balance - memberShare + amount;
        }
        return balance - memberShare;
      });
      return newBalances;
    }

    if (expense.type === "split") {
      const newBalances = mapValues(balances, (balance, id) => {
        const splitString = expense.splits[id];
        if (splitString === "" || typeof splitString === "undefined") {
          return balance;
        }
        const split = parseFloat(splitString);

        if (id === expense.payerId) {
          return balance - split + amount;
        }
        return balance - split;
      });
      return newBalances;
    }

    throw new Error("#fG62ps Expense not of type share or split");
  }, emptyBalances);

  return balances;
}
