import { Typography } from "@mui/material";
import { useNostrEvents } from "nostr-react";
import { EXPENSE_EVENT_KIND } from "../../../../app/constants";
import { getEventTagValue } from "../../../../services/nostr/nostr.service";

export const Expenses = ({ groupId }: { groupId: string }) => {
  const expensesResult = useNostrEvents({
    filter: {
      kinds: [EXPENSE_EVENT_KIND],
      "#e": [groupId],
      // TODO Get the list of approved members here
      // authors: []
    },
  });

  return (
    <div>
      <Typography variant="h3">Expenses</Typography>
      {expensesResult.events.length === 0 ? (
        <Typography>No expenses so far</Typography>
      ) : (
        <ul>
          {expensesResult.events.map((event) => (
            <li key={event.id}>
              Amount: {event.content}
              <br />
              Subject: {getEventTagValue(event, "subject")}
              <br />
              Date: {getEventTagValue(event, "date")}
              <br />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
