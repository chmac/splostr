import { first, groupBy, sortBy } from "remeda";

type PaymentPlanPayment = { from: string; to: string; amount: number };

export function calculateSettlementPlan(balances: Record<string, number>) {
  const { toBePaid, toPay } = groupBy(
    Object.entries(balances),
    ([, balance]) => {
      if (balance < 0) {
        return "toPay";
      } else if (balance > 0) {
        return "toBePaid";
      }
      return "zero";
    }
  );

  if (toBePaid.length === 0 || toPay.length === 0) {
    return [];
  }

  // We sort these in order to try and make the output of this deterministic
  const paymentSenders = sortBy(toPay, first);
  const paymentRecipients = sortBy(toBePaid, first);

  const outerResult = paymentSenders.reduce(
    // Outer level destructuring
    (outerAccumulator, [senderId, senderAmountToPay]) => {
      const { paymentPlan, paymentRecipients } = outerAccumulator;
      // Inner reduce over the MODIFIED paymentRecipients
      const innerResult = paymentRecipients.reduce(
        (innerAccumulator, [recipientId, recipientAmountToBePaid]) => {
          const {
            paymentPlan,
            paymentRecipients,
            senderId,
            senderAmountToPay,
          } = innerAccumulator;

          const senderAmountToPayPositive = senderAmountToPay * -1;

          const amount = Math.min(
            senderAmountToPayPositive,
            recipientAmountToBePaid
          );

          // No amount means no payments, return now
          if (amount === 0) {
            return {
              paymentPlan,
              paymentRecipients,
              senderId,
              senderAmountToPay,
            };
          }

          const payment = {
            from: senderId,
            to: recipientId,
            amount,
          };

          const newPaymentPlan = paymentPlan.concat(payment);

          const newSenderAmountToPay = senderAmountToPay + amount;

          const newRecipientAmountToBePaid = recipientAmountToBePaid - amount;

          const newPaymentRecipients = paymentRecipients.map(
            // NOTE: It's necessary to specify the output type here otherwise
            // typescript will infer the type as `(string | number)[]` which is
            // incompatible with the `.reduce()` type.
            ([id, amount]): [string, number] => {
              if (id === recipientId) {
                return [id, newRecipientAmountToBePaid];
              }
              return [id, amount];
            }
          );

          return {
            paymentPlan: newPaymentPlan,
            paymentRecipients: newPaymentRecipients,
            senderId,
            senderAmountToPay: newSenderAmountToPay,
          };
        },
        // Input to the inner reduce
        {
          paymentPlan,
          // We pass the `paymentRecipients` array into the inner loop so that
          // it can be modified when a payment is created. Thus for each payment
          // sender (the outer reduce) we see an updated set of payment
          // recipients including updates from all the payments we calculated in
          // previous steps.
          paymentRecipients,
          senderId,
          senderAmountToPay,
        }
      );

      return {
        paymentPlan: innerResult.paymentPlan,
        paymentRecipients: innerResult.paymentRecipients,
      };
    },
    // Input to the outer reduce
    { paymentPlan: [] as PaymentPlanPayment[], paymentRecipients }
  );

  const { paymentPlan } = outerResult;

  return paymentPlan;
}
