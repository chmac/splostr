import { Button, Paper, Typography } from "@mui/material";
import { useNostr, useNostrEvents } from "nostr-react";
import { getPublicKey } from "nostr-tools";
import {
  GROUP_CREATE_EVENT_KIND,
  GROUP_METADATA_EVENT_KIND,
  PRIVATE_KEY,
} from "../../../../app/constants";
import { EventFromRelay } from "../../../../app/types";
import {
  createGroupInviteEvent,
  getGroupIdFromInviteEvent,
  getPubkeyOfEvent,
} from "../../../../services/nostr/nostr.service";
import { Members } from "../Members/Members.scene";

export const Group = (
  props: { groupId: string } | { inviteEvent: EventFromRelay }
) => {
  const id =
    "groupId" in props
      ? props.groupId
      : getGroupIdFromInviteEvent(props.inviteEvent);

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
    },
  });

  const groupMetadata =
    typeof groupMetadataResult.events?.[0]?.content === "string"
      ? JSON.parse(groupMetadataResult.events[0].content)
      : {};

  return (
    <Paper>
      <Typography>Name: {groupMetadata.name}</Typography>
      <Typography>About: {groupMetadata.about}</Typography>
      <Typography>Picture: {groupMetadata.picture}</Typography>
      <Members id={id} ownerPublicKey={groupAuthorId} />
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
