import {
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  Typography,
} from "@mui/material";
import { useNostr, useNostrEvents } from "nostr-react";
import { getPublicKey } from "nostr-tools";
import { Link } from "react-router-dom";
import {
  GROUP_CREATE_EVENT_KIND,
  GROUP_INVITE_RESPONSE_EVENT_KIND,
  GROUP_METADATA_EVENT_KIND,
  PRIVATE_KEY,
} from "../../app/constants";
import { useNostrQuery } from "../../nostr-redux";
import {
  createGroupCreateEvent,
  createGroupMetadataEvent,
  getGroupIdFromInviteEvent,
  getGroupIdFromMetadataEvent,
  getProfileFromEvent,
} from "../../services/nostr/nostr.service";

const useGroups = (publicKey: string) => {
  const { events: myOwnedGroupMetadataEvents } = useNostrQuery({
    filter: {
      kinds: [GROUP_METADATA_EVENT_KIND],
      authors: [getPublicKey(PRIVATE_KEY)],
    },
  });
  const { events: inviteResponseEvents } = useNostrQuery({
    filter: {
      kinds: [GROUP_INVITE_RESPONSE_EVENT_KIND],
      authors: [getPublicKey(PRIVATE_KEY)],
    },
    waitForEose: true,
  });
  const acceptedInviteGroupIds = inviteResponseEvents.map(
    getGroupIdFromInviteEvent
  );
  const { events: joinedGroupMetadataEvents } = useNostrQuery({
    filter: {
      kinds: [GROUP_METADATA_EVENT_KIND],
      ids: acceptedInviteGroupIds,
    },
  });

  const metadataEvents = myOwnedGroupMetadataEvents.concat(
    joinedGroupMetadataEvents
  );

  const groups = metadataEvents.map((event) => {
    const profile = getProfileFromEvent(event);
    const id = getGroupIdFromMetadataEvent(event);
    return { id, profile, event };
  });

  return groups;
};

export const Groups = () => {
  const nostr = useNostr();
  const groups = useGroups(getPublicKey(PRIVATE_KEY));

  return (
    <div>
      <Typography variant="h2">Groups</Typography>
      <Typography variant="h3">My groups</Typography>

      <List>
        {groups.map((group) => (
          <ListItem key={group.id}>
            <ListItemButton component={Link} to={`/groups/${group.id}`}>
              {group.profile.name}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Typography variant="h3">Create a new group</Typography>
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
