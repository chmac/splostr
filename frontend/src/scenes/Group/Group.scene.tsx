import { Button, Paper, Typography } from "@mui/material";
import { getPublicKey } from "nostr-tools";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { PRIVATE_KEY } from "../../app/constants";
import { publish } from "../../nostr-redux/relays";
import { createGroupInviteEvent } from "../../services/nostr/nostr.service";
import {
  makeSelectGroupAdminPublicKey,
  makeSelectGroupMetadata,
} from "./Group.selectors";
import { Expenses } from "./scenes/Expenses/Expenses.scene";
import { Members } from "./scenes/Members/Members.scene";
import { useGroupData } from "./useGroupData";

type Params = {
  groupId: string;
};

export const Group = () => {
  const params = useParams<Params>() as Params;
  const id = params.groupId;
  useGroupData({ id });

  const groupAuthorId = useSelector(makeSelectGroupAdminPublicKey(id));
  const groupMetadata = useSelector(makeSelectGroupMetadata(id));

  return (
    <Paper>
      <Typography style={{ wordBreak: "break-all" }}>{id}</Typography>
      <Typography variant="h2">{groupMetadata.name}</Typography>
      <Typography>About: {groupMetadata.about}</Typography>
      <Typography>Picture: {groupMetadata.picture}</Typography>
      <Members id={id} />
      <Expenses groupId={id} />
      {groupAuthorId === getPublicKey(PRIVATE_KEY) ? (
        <Button
          onClick={() => {
            const key = globalThis.prompt(
              "Enter a public key of someone to invite"
            );
            if (key === null || key.length !== 64) {
              globalThis.alert(
                "ERROR #vMWG0z - You must enter a valid public key"
              );
              return;
            }
            const event = createGroupInviteEvent(PRIVATE_KEY, id, key);
            publish(event);
          }}
        >
          Invite member
        </Button>
      ) : null}
    </Paper>
  );
};
