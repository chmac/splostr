import { Typography } from "@mui/material";
import { NostrProfile } from "../../../../../../services/nostr/nostr.service";

export const Member = ({
  id,
  profile,
}: {
  id: string;
  profile: NostrProfile;
}) => {
  return (
    <div>
      <Typography>
        <span style={{ wordBreak: "break-all" }}>{id}</span>
        <br />
        Name: {profile.name}
        <br />
        Data: {JSON.stringify(profile)}
      </Typography>
    </div>
  );
};
