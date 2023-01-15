import { Button, Paper, Typography } from "@mui/material";
import { useNostr } from "nostr-react";
import { getPublicKey } from "nostr-tools";
import { PRIVATE_KEY } from "../../app/constants";
import { useNostrQuery } from "../../nostr-redux";
import { createProfileUpdateEvent } from "../../services/nostr/nostr.service";

const Testing = () => {
  const profileEvents = useNostrQuery({
    authors: [
      "b1919f284056c3b2d81b35a8664a5cefa9794f43eb9b5c288865674a88d05664",
      "3e5dc1f1ed0ad1bd24055da9588a69d37d6eb983526c0fb12aff31199ed8f4b0",
    ],
    kinds: [0],
  });

  return (
    <Paper>
      <Typography>Nested Testing</Typography>
      <ul>
        {profileEvents.map((event) => (
          <Typography component="li" key={event.id}>
            {JSON.stringify(event)}
          </Typography>
        ))}
      </ul>
    </Paper>
  );
};

export const Home = () => {
  const nostr = useNostr();
  const profileEvents = useNostrQuery({
    authors: [
      "b1919f284056c3b2d81b35a8664a5cefa9794f43eb9b5c288865674a88d05664",
      "3e5dc1f1ed0ad1bd24055da9588a69d37d6eb983526c0fb12aff31199ed8f4b0",
    ],
    kinds: [0],
  });

  return (
    <div>
      <Typography variant="h2">Home</Typography>
      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <Paper>
          <Typography>{getPublicKey(PRIVATE_KEY)}</Typography>
        </Paper>

        <Paper>
          <Typography>Testing</Typography>
          <ul>
            {profileEvents.map((event) => (
              <Typography component="li" key={event.id}>
                {JSON.stringify(event)}
              </Typography>
            ))}
          </ul>
        </Paper>

        <Testing />

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
            nostr.publish(event);
          }}
        >
          Set profile data
        </Button>
      </div>
    </div>
  );
};
