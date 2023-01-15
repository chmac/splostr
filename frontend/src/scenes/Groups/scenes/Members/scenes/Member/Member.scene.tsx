import { Typography } from "@mui/material";
import { useNostrEvents, useProfile } from "nostr-react";
import { useState } from "react";
import * as R from "remeda";
import {
  getProfileFromEvent,
  NostrProfile,
} from "../../../../../../services/nostr/nostr.service";

export const Member = ({ id }: { id: string }) => {
  const [profile, setProfile] = useState<NostrProfile>({});
  // const useProfileResult = useProfile({ pubkey: id });
  const profileResult = useNostrEvents({
    filter: {
      kinds: [0],
      authors: [id],
    },
  });

  const maybeProfile = getProfileFromEvent(profileResult.events[0]);
  if (!R.equals(profile, maybeProfile)) {
    setProfile(maybeProfile);
  }
  // console.log("#VbsSsI Member profile", id, profile);

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
