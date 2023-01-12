import { Button, CircularProgress, Typography } from "@mui/material";
import { dateToUnix, useNostr, useNostrEvents } from "nostr-react";
import { Event, generatePrivateKey, getPublicKey } from "nostr-tools";
import { useRef } from "react";
import { PRIVATE_KEY } from "../../app/constants";
import { createGroupEvent } from "../../services/nostr/nostr.service";

const Home = () => {
  const now = useRef(new Date());
  const nostr = useNostr();
  const result = useNostrEvents({
    filter: {
      // since: dateToUnix(now.current),
      // kinds: [0],
      // until: dateToUnix(now.current),
      // limit: 5,
      authors: [getPublicKey(PRIVATE_KEY)],
    },
  });

  return (
    <div>
      <Typography variant="h2">Home</Typography>
      <ul>
        {result.isLoading ? (
          <CircularProgress />
        ) : (
          result.events.map((event) => (
            <li key={event.id}>
              {event.kind} by {event.pubkey}
              <br />
              {event.content}
              <br />
              {JSON.stringify(event.tags)}
            </li>
          ))
        )}
      </ul>
      <Button
        variant="contained"
        onClick={() => {
          const name = globalThis.prompt("Choose a name for the group");
          if (name === null) {
            globalThis.alert("ERROR #DgTmpm - You must choose a name.");
            return;
          }
          const event = createGroupEvent(name, PRIVATE_KEY);
          nostr.publish(event);
        }}
      >
        Create group
      </Button>
      <Button
        variant="contained"
        onClick={() => {
          const key = generatePrivateKey();
          globalThis.alert(key);
        }}
      >
        Generate a private key
      </Button>
    </div>
  );
};
export default Home;
