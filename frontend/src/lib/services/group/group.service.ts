import type { Event } from "nostr-tools";
import { writable } from "svelte/store";
import { GROUP_KIND, METADATA_KIND } from "../../../constants";
import {
  getEventTags,
  getEventTagValue,
  getProfileFromEvent,
  getPublicKeyOfEvent,
} from "../nostr.service";
import { pool, publish, type PublishEvent } from "../relays.service";
import {
  createEventSchema,
  expenseEventSchema,
  metadataEventSchema,
} from "./events.utils";

type BaseExpense = {
  payerId: string;
  date: string;
  amount: string;
  subject: string;
};

type ShareExpense = BaseExpense & {
  type: "share";
};

type SplitExpense = BaseExpense & {
  type: "split";
  splits: {
    /**
     * The split of the amount assigned to this user
     * NOTE: Total splits must sum to the original amount
     */
    [memberId: string]: string;
  };
};

export type ExpenseWithoutEvent = ShareExpense | SplitExpense;

export type ExpenseEvent = {
  event: Event;
};

export type Expense = ExpenseWithoutEvent & ExpenseEvent;

export type ExpenseWithOptionalEvent = ExpenseWithoutEvent &
  Partial<ExpenseEvent>;

export type Member = {
  id: string;
  name: string;
  shares: number;
};

export type GroupData = {
  events: {
    create: Event;
    metadata: Event;
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

  return { ...expense, splits } as Expense;
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

  const unfilteredEvents = await pool.list(relayUrls, [
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

  const createEvent = unfilteredEvents.find((event) => event.id === groupId);

  if (typeof createEvent === "undefined") {
    const message = "#3rkHet Failed to find group creation event";
    console.error(message, { groupId });
    throw new Error(message);
  }

  const groupOwner = getPublicKeyOfEvent(createEvent);

  const metadataEvent = unfilteredEvents.find((event) => {
    if ((event.kind as number) !== METADATA_KIND) {
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

  const allowedPublicKeys = getEventTags(metadataEvent, "p")
    .map((tag) => tag[1])
    .concat(groupOwner);

  const expenseEvents = unfilteredEvents.filter((event) => {
    if (event.id === createEvent.id || event.id === metadataEvent.id) {
      return false;
    }

    if (!expenseEventSchema.safeParse(event).success) {
      console.warn("#fYJvpe Event failed validation", event);
      return false;
    }

    const eventPublicKey = getPublicKeyOfEvent(event);
    if (!allowedPublicKeys.includes(eventPublicKey)) {
      console.warn("#j0AI0I Event from wrong public key", event);
      return false;
    }

    const eTag = getEventTagValue(event, "e");
    if (eTag !== groupId) {
      console.warn("#y2XTm8 Event with wrong e tag", event);
      return false;
    }

    return true;
  });

  const expenses = expenseEvents
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
    // TODO - Also handle metadata events here
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

const generateId = () => Math.random().toString().slice(2, 8);

export const updateMemberData = async (
  groupData: GroupData,
  member: Member
): Promise<{ success: true } | { success: false; message: string }> => {
  const id = member.id === "" ? generateId() : member.id;
  const newTag = ["member", id, member.name, member.shares.toString()];

  const oldEvent = groupData.events.metadata;

  const tagsMinusExistingMember = oldEvent.tags.filter(
    ([tagName, id]) => tagName !== "member" || id !== member.id
  );

  const newTags = tagsMinusExistingMember.concat([newTag]);

  const { kind, content, pubkey } = oldEvent;

  const newEvent = { kind, content, pubkey, tags: newTags };

  try {
    await publish(newEvent);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "#KaOF6w Unknown error";
    return { success: false, message };
  }
};

const getSplitTags = (expense: ExpenseWithOptionalEvent): string[][] => {
  if (expense.type === "split") {
    if (typeof expense.splits === "undefined") {
      throw new Error("#TiQw7g Split expense without splits");
    }
    const splitTags = Object.entries(expense.splits).map(([id, amount]) =>
      amount === "" ? ["member", id] : ["member", id, amount]
    );
    return splitTags;
  }
  return [];
};

export const saveGroupExpense = async (
  groupData: GroupData,
  expense: ExpenseWithOptionalEvent
): Promise<{ success: true } | { success: false; message: string }> => {
  const isUpdate = typeof expense.event !== "undefined";

  if (isUpdate) {
    // TODO - Implement expense updates
    throw new Error("#BDpCLu Updating expenses is not yet implemented");
  }

  const event: PublishEvent = {
    kind: GROUP_KIND,
    content: "",
    tags: [
      ["e", groupData.events.create.id, "root"],
      ["payerId", expense.payerId],
      ["date", expense.date],
      ["subject", expense.subject],
      ["amount", expense.amount],
      ["type", expense.type],
      ...getSplitTags(expense),
    ],
  };

  try {
    await publish(event);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "#KaOF6w Unknown error";
    return { success: false, message };
  }
};

export const calculateSettlmentPlan = (balances: Record<string, number>) => {
  // TODO - Calculate settlement from balances
};
