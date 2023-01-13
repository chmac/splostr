import { Button, Typography } from "@mui/material";
import { useNostr, useNostrEvents } from "nostr-react";
import * as R from "remeda";
import {
  GROUP_INVITE_RESPONSE_EVENT_KIND,
  PRIVATE_KEY,
} from "../../../../app/constants";
import {
  createExpenseEvent,
  getPubkeyOfEvent,
} from "../../../../services/nostr/nostr.service";

export const Members = ({
  id,
  ownerPublicKey,
}: {
  id: string;
  ownerPublicKey: string;
}) => {
  const nostr = useNostr();

  const membersResult = useNostrEvents({
    filter: {
      kinds: [GROUP_INVITE_RESPONSE_EVENT_KIND],
      "#e": [id],
    },
  });

  const members = R.uniq(
    membersResult.events.map(getPubkeyOfEvent).concat(ownerPublicKey)
  );

  return (
    <div>
      <Typography variant="h3">Members</Typography>
      <ul>
        {members.map((memberId) => (
          <Typography component="li" key={memberId}>
            {memberId}
          </Typography>
        ))}
      </ul>
      <Button
        onClick={() => {
          const amount = globalThis.prompt("Enter the amount of this expense");
          if (typeof amount !== "string" || amount.length === 0) {
            globalThis.alert("ERROR #WQFEaR - You must enter an amount");
            return;
          }
          const subject = globalThis.prompt(
            "Enter the subject of this expense"
          );
          if (typeof subject !== "string" || subject.length === 0) {
            globalThis.alert("ERROR #Ci0uXf - You must enter a subject");
            return;
          }
          const date = new Date().toISOString().substring(0, 10);
          const event = createExpenseEvent(
            PRIVATE_KEY,
            id,
            amount,
            members,
            date,
            subject
          );
          nostr.publish(event);
        }}
      >
        Add expense
      </Button>
    </div>
  );
};
