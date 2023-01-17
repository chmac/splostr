import { Typography } from "@mui/material";
import { createSelector } from "@reduxjs/toolkit";
import { matchFilter } from "nostr-tools";
import { useSelector } from "react-redux";
import { selectAllEvents } from "../../../../nostr-redux/events";
import { getEventTagValue } from "../../../../services/nostr/nostr.service";
import { groupExpensesFilter } from "../../Group.filters";
import { makeSelectGroupMembers } from "../../Group.selectors";

export const makeSelectGroupExpenses = (id: string) =>
  createSelector(
    selectAllEvents,
    makeSelectGroupMembers(id),
    (events, members) => {
      const membersPublicKeys = members.map((member) => member.id);
      return events.filter((event) =>
        matchFilter(groupExpensesFilter(id, membersPublicKeys), event)
      );
    }
  );

export const Expenses = ({ groupId }: { groupId: string }) => {
  const expenses = useSelector(makeSelectGroupExpenses(groupId));

  return (
    <div>
      <Typography variant="h3">Expenses</Typography>
      {expenses.length === 0 ? (
        <Typography>No expenses so far</Typography>
      ) : (
        <ul>
          {expenses.map((event) => (
            <li key={event.id}>
              Amount: {event.content}
              <br />
              Subject: {getEventTagValue(event, "subject")}
              <br />
              Date: {getEventTagValue(event, "date")}
              <br />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
