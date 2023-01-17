import { Button, Paper, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { PRIVATE_KEY, PUBLIC_KEY } from "../../app/constants";
import { createGroupInviteAcceptEvent } from "../../services/nostr/nostr.service";
import { makeSelectInvitesWithData } from "./Invites.selectors";
import { useInvitesData } from "./useInvitesData";

export const Invites = () => {
  useInvitesData(PUBLIC_KEY);

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
