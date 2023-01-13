import { useNostrEvents } from "nostr-react";
import { getPublicKey } from "nostr-tools";
import { GROUP_INVITE_EVENT_KIND, PRIVATE_KEY } from "../../app/constants";
import { Invite } from "./Scenes/Invite/Invite.scene";

export const Invites = () => {
  const inviteResult = useNostrEvents({
    filter: {
      kinds: [GROUP_INVITE_EVENT_KIND],
      "#p": [getPublicKey(PRIVATE_KEY)],
    },
  });

  return (
    <div>
      {inviteResult.events.map((event) => (
        <Invite key={event.id} event={event} />
      ))}
    </div>
  );
};
