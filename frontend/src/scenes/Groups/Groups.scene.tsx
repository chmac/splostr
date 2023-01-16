import { Button, CircularProgress, Typography } from "@mui/material";
import { useNostr, useNostrEvents } from "nostr-react";
import { getPublicKey } from "nostr-tools";
import { Link } from "react-router-dom";
import {
  GROUP_CREATE_EVENT_KIND,
  GROUP_INVITE_RESPONSE_EVENT_KIND,
  PRIVATE_KEY,
} from "../../app/constants";
import {
  createGroupCreateEvent,
  createGroupMetadataEvent,
  getGroupIdFromInviteEvent,
} from "../../services/nostr/nostr.service";

export const Groups = () => {
  const nostr = useNostr();

  const myOwnedGroupsResult = useNostrEvents({
    filter: {
      kinds: [GROUP_CREATE_EVENT_KIND],
      authors: [getPublicKey(PRIVATE_KEY)],
    },
  });
  const myOwnedGroupIds = myOwnedGroupsResult.events.map((event) => event.id);

  const myMemberGroupsResult = useNostrEvents({
    filter: {
      kinds: [GROUP_INVITE_RESPONSE_EVENT_KIND],
      authors: [getPublicKey(PRIVATE_KEY)],
    },
  });
  const myMemberGroupIds = myMemberGroupsResult.events.map(
    getGroupIdFromInviteEvent
  );

  const groupIds = myOwnedGroupIds.concat(myMemberGroupIds);

  return (
    <div>
      <Typography variant="h2">Existing groups</Typography>

      {myOwnedGroupsResult.isLoading ? <CircularProgress /> : null}
      {groupIds.length === 0 ? (
        <Typography>No existing groups found</Typography>
      ) : null}
      {groupIds.map((id) => (
        <p>
          <Typography component={Link} key={id} to={`/groups/${id}`}>
            Group link
          </Typography>
        </p>
      ))}

      <Typography variant="h2">Create a new group</Typography>
      <div>
        <Button
          onClick={() => {
            const name = globalThis.prompt("Choose a name for the group");
            if (name === null) {
              globalThis.alert("ERROR #DgTmpm - You must choose a name.");
              return;
            }
            const createEvent = createGroupCreateEvent(PRIVATE_KEY);
            const metadataEvent = createGroupMetadataEvent(
              PRIVATE_KEY,
              createEvent.id,
              { name }
            );
            nostr.publish(createEvent);
            nostr.publish(metadataEvent);
          }}
        >
          Create group
        </Button>
      </div>
    </div>
  );
};
