import {
  Button,
  List,
  ListItem,
  ListItemButton,
  Typography,
} from "@mui/material";
import { useNostr } from "nostr-react";
import { getPublicKey } from "nostr-tools";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { PRIVATE_KEY } from "../../app/constants";
import {
  createGroupCreateEvent,
  createGroupMetadataEvent,
} from "../../services/nostr/nostr.service";
import { makeGroupsSelector } from "./Groups.selectors";
import { useGroupsData } from "./useGroupsData";

const publicKey = getPublicKey(PRIVATE_KEY);

export const Groups = () => {
  const nostr = useNostr();
  useGroupsData(publicKey);
  const groups = useSelector(makeGroupsSelector(publicKey));

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
