import { Typography } from "@mui/material";
import { useNostrEvents } from "nostr-react";

export const Expenses = ({
  groupId,
  members,
}: {
  groupId: string;
  members: string[];
}) => {
  const result = useNostrEvents({
    filter: {
      authors: members,
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
