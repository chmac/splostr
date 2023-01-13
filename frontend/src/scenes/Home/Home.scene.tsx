import { Paper, Typography } from "@mui/material";
import { getPublicKey } from "nostr-tools";
import { PRIVATE_KEY } from "../../app/constants";

export const Home = () => (
  <div>
    <Typography variant="h2">Home</Typography>
    <div style={{ marginTop: 20, marginBottom: 20 }}>
      <Paper>
        <Typography>{getPublicKey(PRIVATE_KEY)}</Typography>
      </Paper>
    </div>
  </div>
);
