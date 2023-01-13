import { Button, Paper, Typography } from "@mui/material";
import { useNostr, useNostrEvents } from "nostr-react";
import {
  GROUP_METADATA_EVENT_KIND,
  PRIVATE_KEY,
} from "../../../../app/constants";
import { EventFromRelay } from "../../../../app/types";
import {
  createGroupInviteAcceptEvent,
  getGroupIdFromInviteEvent,
} from "../../../../services/nostr/nostr.service";

export const Invite = ({ event }: { event: EventFromRelay }) => {
  const nostr = useNostr();

  const groupId = getGroupIdFromInviteEvent(event);

  const metadataResult = useNostrEvents({
    filter: {
      kinds: [GROUP_METADATA_EVENT_KIND],
      "#d": [groupId],
    },
  });

  const groupMetadata =
    typeof metadataResult.events?.[0]?.content === "string"
      ? JSON.parse(metadataResult.events[0].content)
      : {};

  return (
    <div>
      <Paper>
        <Typography>Group ID: {groupId}</Typography>
        <Typography>Name: {groupMetadata.name}</Typography>
        <Typography>About: {groupMetadata.about}</Typography>
        <Typography>Picture: {groupMetadata.picture}</Typography>
        <Button
          onClick={() => {
            const acceptEvent = createGroupInviteAcceptEvent(
              PRIVATE_KEY,
              groupId,
              event
            );
            nostr.publish(acceptEvent);
          }}
        >
          Accept invite
        </Button>
      </Paper>
    </div>
  );
};
