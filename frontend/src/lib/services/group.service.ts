import type { Event } from "nostr-tools";
import { writable } from "svelte/store";
import {
  getEventTags,
  getEventTagValue,
  getProfileFromEvent,
  getPublicKeyOfEvent,
} from "./nostr.service";
import { relaysInit } from "./relays.service";

const GROUP_KIND = 1989;
const METADATA_KIND = 30_000 + GROUP_KIND;

type Expense = {
  date: string;
  amount: string;
  subject: string;
  type: "share" | "split";
  splits?: {
    /**
     * The split of the amount assigned to this user
     * NOTE: Total splits must sum to the original amount
     */
    [memberId: string]: string;
  };
  event: Event;
};

type Member = {
  id: string;
  name: string;
  shares: number;
};

export type GroupData = {
  events: {
    create: Event;
    metadata?: Event;
  };
  profile: {
    name: string;
    about: string;
    picture: string;
  };
  members: {
    [id: string]: Member;
  };
  expenses: Expense[];
};

const isExpense = (expense: Expense | unknown): expense is Expense => {
  if (typeof expense !== "object") {
    return false;
  }
  const { type, amount, subject, date } = expense as Expense;
  if (
    (type !== "share" && type !== "split") ||
    typeof amount === "undefined" ||
    typeof subject === "undefined" ||
    typeof date === "undefined"
  ) {
    return false;
  }
  return true;
};

const eventToExpenseOrUndefined = (event: Event): Expense | undefined => {
  const type = getEventTagValue(event, "type");
  const amount = getEventTagValue(event, "amount");
  const subject = getEventTagValue(event, "subject");
  const date = getEventTagValue(event, "date");
  const expense = { type, amount, subject, date, event };
  if (!isExpense(expense)) {
    console.warn("#Ih8yrD Invalid expense event found", expense);
    return;
  }

  if (type === "share") {
    return expense;
  }

  const memberTags = getEventTags(event, "member");

  const splits = memberTags.reduce<{ [memberId: string]: string }>(
    (members, tag) => {
      const [, id, amount] = tag;
      return { ...members, [id]: amount };
    },
    {}
  );

  return { ...expense, splits };
};

const membersFromMetadataEvent = (
  event: Event
): { [memberId: string]: Member } => {
  const memberTags = getEventTags(event, "member");
  const members = memberTags
    .map((tag) => {
      const [, id, name, sharesString] = tag;
      const shares = parseFloat(sharesString);
      return { id, name, shares };
    })
    .reduce((members, member) => ({ ...members, [member.id]: member }), {});
  return members;
};

const filterOutUndefined = <T>(input: T): input is NonNullable<T> => {
  return typeof input !== "undefined";
};

export const loadGroupById = async (relayUrls: string[], groupId: string) => {
  const startTime = Math.floor(Date.now() / 1_000);

  const pool = await relaysInit(relayUrls);

  const events = await pool.list(relayUrls, [
    {
      ids: [groupId],
    },
    {
      kinds: [METADATA_KIND],
      "#d": [groupId],
    },
    {
      kinds: [GROUP_KIND],
      "#e": [groupId],
    },
  ]);

  const eventsById = events.reduce<{ [id: string]: Event }>(
    (accumulator, event) => {
      return { ...accumulator, [event.id]: event };
    },
    {}
  );

  const createEvent = eventsById[groupId];

  if (typeof createEvent === "undefined") {
    const message = "#3rkHet Failed to find group creation event";
    console.error(message, { groupId });
    throw new Error(message);
  }

  const groupOwner = getPublicKeyOfEvent(createEvent);

  const metadataEvent = events.find((event) => {
    if (event.kind !== METADATA_KIND) {
      return false;
    }
    const eventOwner = getPublicKeyOfEvent(event);
    const hasCorrectOwner = eventOwner === groupOwner;
    if (!hasCorrectOwner) {
      console.warn("#Fw4eKB Found metadata event with wrong owner", {
        createEvent,
        groupOwner,
        eventOwner,
        event,
      });
    }
    return hasCorrectOwner;
  });

  if (typeof metadataEvent === "undefined") {
    const message = "#N3RHGW Failed to find metadata event";
    console.error(message, { groupId, createEvent });
    throw new Error(message);
  }

  const profile = getProfileFromEvent(metadataEvent);

  const members = membersFromMetadataEvent(metadataEvent);

  // TODO - Add a check to ensure expenses are only from allowed pubkeys
  const expenses = events
    .filter((event) => {
      if ((event.kind as number) !== GROUP_KIND) {
        return false;
      }
      const e = getEventTagValue(event, "e");
      return e === groupId;
    })
    .map(eventToExpenseOrUndefined)
    .filter(filterOutUndefined);

  const data: GroupData = {
    events: {
      create: createEvent,
      metadata: metadataEvent,
    },
    profile,
    members,
    expenses,
  };

  const groupStore = writable<GroupData>(data);

  const subscription = pool.sub(relayUrls, [
    {
      kinds: [GROUP_KIND],
      "#e": [groupId],
      since: startTime,
    },
  ]);
  subscription.on("event", (event: Event) => {
    // TODO - Add a check to ensure expenses are only from allowed pubkeys
    groupStore.update((currentValue) => {
      const { expenses } = currentValue;
      const expense = eventToExpenseOrUndefined(event);
      if (typeof expense === "undefined") {
        return currentValue;
      }
      return { ...currentValue, expenses: expenses.concat(expense) };
    });
  });

  return groupStore;
};
