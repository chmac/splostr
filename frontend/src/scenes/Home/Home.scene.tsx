import { Button, Paper, Typography } from "@mui/material";
import { getPublicKey } from "nostr-tools";
import { useState } from "react";
import { PRIVATE_KEY } from "../../app/constants";
import { useAppSelector } from "../../app/hooks";
import { publish } from "../../nostr-redux/relays";
import { createProfileUpdateEvent } from "../../services/nostr/nostr.service";
import { Groups } from "../Groups/Groups.scene";

export const Home = () => {
  const [publishedId, setPublishedId] = useState("");
  const publishResult = useAppSelector((state) => {
    if (publishedId === "") {
      return [];
    }
    const relays = state.nostr.relays.relays;
    const results = Object.entries(relays).map(([, relay]) => {
      return relay.published[publishedId];
    });
    return results;
  });

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

            setPublishedId(event.id);

            publish(event);
          }}
        >
          Set profile data
        </Button>
        <Typography>
          {publishResult.map((result) => result.status).join(", ")}
        </Typography>
      </div>
    </div>
  );
};
