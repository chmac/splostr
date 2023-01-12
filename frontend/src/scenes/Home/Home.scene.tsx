import { Button, CircularProgress, Typography } from "@mui/material";
import { dateToUnix, useNostrEvents } from "nostr-react";
import { useRef } from "react";

const Home = () => {
  const now = useRef(new Date());
  const result = useNostrEvents({
    filter: {
      // since: dateToUnix(now.current),
      kinds: [0],
      until: dateToUnix(now.current),
      limit: 5,
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
      <Button variant="contained">Create event</Button>
    </div>
  );
};
export default Home;
