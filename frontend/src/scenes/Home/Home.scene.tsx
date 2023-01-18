import { Button, Paper, Typography } from "@mui/material";
import { getPublicKey } from "nostr-tools";
import { PRIVATE_KEY } from "../../app/constants";
import { useNostrPublish } from "../../nostr-redux";
import { createProfileUpdateEvent } from "../../services/nostr/nostr.service";
import { Groups } from "../Groups/Groups.scene";

export const Home = () => {
  const { publish, result } = useNostrPublish();

  return (
    <div>
      <Typography variant="h2">Home</Typography>
      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <Paper>
          <Typography style={{ wordBreak: "break-all" }}>
            {getPublicKey(PRIVATE_KEY)}
          </Typography>
        </Paper>

        <Groups />

        <Typography variant="h2">Update profile</Typography>
        <Button
          onClick={() => {
            const name = globalThis.prompt("Enter your name");
            if (typeof name !== "string" || name.length === 0) {
              globalThis.alert("ERROR #WQFEaR - You must enter a name");
              return;
            }
            const about =
              globalThis.prompt("Enter some about text (optional)") || "";
            const picture =
              globalThis.prompt("Enter a picture URL (optional)") || "";
            const profile = { name, about, picture };
            const event = createProfileUpdateEvent(profile, PRIVATE_KEY);

            publish(event);
          }}
        >
          Set profile data
        </Button>
        <Typography>{result}</Typography>
      </div>
    </div>
  );
};
