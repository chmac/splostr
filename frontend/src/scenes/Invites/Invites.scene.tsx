import { Button, Paper, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { PRIVATE_KEY, PUBLIC_KEY } from "../../app/constants";
import { useNostrData } from "../../nostr-redux/useNostrData";
import { createGroupInviteAcceptEvent } from "../../services/nostr/nostr.service";
import { invitedGroupMetadataFilters, invitesFilter } from "./Invites.filters";
import {
  makeSelectInvites,
  makeSelectInvitesWithData,
} from "./Invites.selectors";

export const Invites = () => {
  // useInvitesData(PUBLIC_KEY);
  useNostrData([
    () => [invitesFilter(PUBLIC_KEY)],
    (state) => {
      const inviteEvents = makeSelectInvites(PUBLIC_KEY)(state);

      return invitedGroupMetadataFilters(inviteEvents);
    },
  ]);

  const invites = useSelector(makeSelectInvitesWithData(PUBLIC_KEY));

  return (
    <div>
      {invites.map((invite) => (
        <Paper key={invite.inviteEvent.id}>
          <Typography>Group ID: {invite.groupId}</Typography>
          <Typography>Name: {invite.profile.name}</Typography>
          <Typography>About: {invite.profile.about}</Typography>
          <Typography>Picture: {invite.profile.picture}</Typography>
          <Button
            onClick={() => {
              const acceptEvent = createGroupInviteAcceptEvent(
                PRIVATE_KEY,
                invite.groupId,
                invite.inviteEvent
              );
              // TODO - Add the publish function
              console.log("#qgnBmi Invites/accept", acceptEvent);
              // nostr.publish(acceptEvent);
            }}
          >
            Accept invite
          </Button>
        </Paper>
      ))}
    </div>
  );
};
