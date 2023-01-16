import { Typography } from "@mui/material";
import { useNostrQuery } from "../../../../../../nostr-redux";
import { getProfileFromEvent } from "../../../../../../services/nostr/nostr.service";

export const Member = ({ id }: { id: string }) => {
  const { events: profileEvents } = useNostrQuery({
    filter: {
      authors: [id],
      kinds: [0],
    },
  });

  const profile = getProfileFromEvent(profileEvents[0]);

  return (
    <div>
      <Typography>
        {id}
        <br />
        Name: {profile.name}
        <br />
        Data: {JSON.stringify(profile)}
      </Typography>
    </div>
  );
};
