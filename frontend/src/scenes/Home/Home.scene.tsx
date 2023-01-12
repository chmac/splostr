import { Button, CircularProgress, Paper, Typography } from "@mui/material";
import { dateToUnix, useNostr, useNostrEvents } from "nostr-react";
import {
  Event,
  generatePrivateKey,
  getPublicKey,
  relayInit,
} from "nostr-tools";
import { useRef } from "react";
import { GROUP_EVENT_KIND, PRIVATE_KEY } from "../../app/constants";
import {
  createExpenseEvent,
  createGroupEvent,
} from "../../services/nostr/nostr.service";
import { Expenses } from "../Expenses/Expenses.scene";

const relay = relayInit("");
const sub = relay.sub([]);
sub.on("event", (e: Required<Event>) => {
  // do something
});

const Home = () => {
  const now = useRef(new Date());
  const nostr = useNostr();
  const result = useNostrEvents({
    filter: {
      // since: dateToUnix(now.current),
      kinds: [GROUP_EVENT_KIND],
      // until: dateToUnix(now.current),
      // limit: 5,
      // authors: [getPublicKey(PRIVATE_KEY)],
    },
  });

  return (
    <div>
      <Typography variant="h2">Home</Typography>
      <div>
        {result.isLoading ? (
          <CircularProgress />
        ) : (
          (result.events as Required<Event>[]).map((event) => (
            <Paper key={event.id}>
              {event.id}
              <br />
              {event.kind} by {event.pubkey}
              <br />
              {event.content}
              <br />
              {JSON.stringify(event.tags)}
              <br />
              <Button
                onClick={() => {
                  const dTag = event.tags.find(([tag]) => tag === "d");
                  if (typeof dTag === "undefined") {
                    globalThis.alert(
                      "ERROR #slICE8 - This event does not have a d tag"
                    );
                    return;
                  }
                  const [, hash] = dTag;
                  const name = globalThis.prompt("Enter new name");
                  if (name === null || name.length === 0) {
                    return;
                  }
                  const newEvent = createGroupEvent(name, PRIVATE_KEY, hash);
                  nostr.publish(newEvent);
                }}
              >
                Update event
              </Button>
              <Button
                onClick={() => {
                  const dTag = event.tags.find(([tag]) => tag === "d");
                  if (typeof dTag === "undefined") {
                    globalThis.alert(
                      "ERROR #slICE8 - This event does not have a d tag"
                    );
                    return;
                  }
                  const [, hash] = dTag;
                  const pubKeys = event.tags
                    .filter(([tag]) => tag === "p")
                    .map(([, key]) => key);
                  const newKey = globalThis.prompt(
                    "Enter a new public key to add them to the group"
                  );
                  if (newKey === null || newKey.length !== 64) {
                    globalThis.alert("ERROR #L1iWW7 - Invalid public key.");
                    return;
                  }
                  const newEvent = createGroupEvent(
                    event.content,
                    PRIVATE_KEY,
                    hash,
                    pubKeys.concat(newKey)
                  );
                  nostr.publish(newEvent);
                }}
              >
                Add person to group
              </Button>
              <Button
                onClick={() => {
                  const amount = globalThis.prompt("How much did you spend?");
                  if (amount === null) {
                    globalThis.alert(
                      "ERROR #yufoSR - You must enter an amount."
                    );
                    return;
                  }
                  const expenseEvent = createExpenseEvent(
                    event,
                    amount,
                    PRIVATE_KEY
                  );
                  nostr.publish(expenseEvent);
                }}
              >
                Add an expense
              </Button>
              <Expenses groupId={event.id} />
            </Paper>
          ))
        )}
      </div>
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
