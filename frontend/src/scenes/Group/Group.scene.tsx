import { Button, Paper, Typography } from "@mui/material";
import { useNostr, useNostrEvents } from "nostr-react";
import { getPublicKey } from "nostr-tools";
import { useParams } from "react-router-dom";
import {
  GROUP_CREATE_EVENT_KIND,
  GROUP_METADATA_EVENT_KIND,
  PRIVATE_KEY,
} from "../../app/constants";
import {
  createGroupInviteEvent,
  getPubkeyOfEvent,
} from "../../services/nostr/nostr.service";
import { Expenses } from "./scenes/Expenses/Expenses.scene";
import { Members } from "./scenes/Members/Members.scene";

type Params = {
  groupId: string;
};

export const Group = () => {
  const params = useParams<Params>() as Params;
  const id = params.groupId;
  const nostr = useNostr();

  const groupResult = useNostrEvents({
    filter: {
      kinds: [GROUP_CREATE_EVENT_KIND],
      ids: [id],
    },
  });

  const groupAuthorId =
    groupResult.events.length > 0
      ? getPubkeyOfEvent(groupResult.events[0])
      : "";

  const groupMetadataResult = useNostrEvents({
    filter: {
      kinds: [GROUP_METADATA_EVENT_KIND],
      authors: [groupAuthorId],
      "#d": [id],
    },
  });

  const groupMetadata =
    typeof groupMetadataResult.events?.[0]?.content === "string"
      ? JSON.parse(groupMetadataResult.events[0].content)
      : {};

  return (
    <Paper>
      <Typography>{id}</Typography>
      <Typography variant="h2">{groupMetadata.name}</Typography>
      <Typography>About: {groupMetadata.about}</Typography>
      <Typography>Picture: {groupMetadata.picture}</Typography>
      <Members id={id} ownerPublicKey={groupAuthorId} />
      <Expenses groupId={id} />
      {groupAuthorId === getPublicKey(PRIVATE_KEY) ? (
        <Button
          onClick={() => {
            const key = globalThis.prompt(
              "Enter a public key of someone to invite"
            );
            if (key === null || key.length !== 64) {
              globalThis.alert(
                "ERROR #vMWG0z - You must enter a valid public key"
              );
              return;
            }
            const event = createGroupInviteEvent(PRIVATE_KEY, id, key);
            nostr.publish(event);
          }}
        >
          Invite member
        </Button>
      ) : null}
    </Paper>
  );
};
