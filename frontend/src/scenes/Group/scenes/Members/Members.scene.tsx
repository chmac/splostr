import { Button, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { PRIVATE_KEY } from "../../../../app/constants";
import { publish } from "../../../../nostr-redux/relays";
import { createExpenseEvent } from "../../../../services/nostr/nostr.service";
import { makeSelectGroupMembers } from "../../Group.selectors";
import { Member } from "./scenes/Member/Member.scene";

export const Members = ({ id }: { id: string }) => {
  const members = useSelector(makeSelectGroupMembers(id));

  const memberIds = members.map((member) => member.id);

  return (
    <div>
      <Typography variant="h3">Members</Typography>
      {members.map((member) => (
        <Member key={member.id} id={member.id} profile={member.profile} />
      ))}
      <Button
        onClick={() => {
          const amount = globalThis.prompt("Enter the amount of this expense");
          if (typeof amount !== "string" || amount.length === 0) {
            globalThis.alert("ERROR #WQFEaR - You must enter an amount");
            return;
          }
          const subject = globalThis.prompt(
            "Enter the subject of this expense"
          );
          if (typeof subject !== "string" || subject.length === 0) {
            globalThis.alert("ERROR #Ci0uXf - You must enter a subject");
            return;
          }
          const date = new Date().toISOString().substring(0, 10);
          const event = createExpenseEvent(
            PRIVATE_KEY,
            id,
            amount,
            memberIds,
            date,
            subject
          );
          publish(event);
        }}
      >
        Add expense
      </Button>
    </div>
  );
};
