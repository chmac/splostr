import { Typography } from "@mui/material";
import { useNostrEvents } from "nostr-react";

export const Expenses = ({ groupId }: { groupId: string }) => {
  const result = useNostrEvents({
    filter: {
      "#e": [groupId],
    },
  });

  return (
    <div>
      <Typography>Expenses</Typography>
      <ul>
        {result.events.map((event) => (
          <li key={event.id}>{event.content}</li>
        ))}
      </ul>
    </div>
  );
};
