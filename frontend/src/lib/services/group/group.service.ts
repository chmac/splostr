import type { Event } from "nostr-tools";
import { writable } from "svelte/store";
import { z } from "zod";
import { GROUP_KIND, METADATA_KIND } from "../../../constants";
import {
  getEventTags,
  getEventTagValue,
  getProfileFromEvent,
  getPublicKeyOfEvent,
} from "../nostr.service";
import { pool, publish, type PublishEvent } from "../relays.service";
import { dateSchema } from "./areTagsValidForExpenseEvent";
import { calculateBalances } from "./calculateBalances";
import { calculateSettlementPlan } from "./calculateSettlementPlan";
import { expenseEventSchema } from "./events.utils";

const baseExpenseSchema = z.object({
  payerId: z.string(),
  date: dateSchema,
  amount: z.string(),
  subject: z.string().min(3),
});

const shareExpenseSchema = baseExpenseSchema.extend({
  type: z.literal("share"),
});

const splitExpenseSchema = baseExpenseSchema.extend({
  type: z.literal("split"),
  splits: z.record(z.string()),
});

const expenseWithoutEventSchema = shareExpenseSchema.or(splitExpenseSchema);

const expenseSchema = expenseWithoutEventSchema.and(
  z.object({
    event: expenseEventSchema,
  })
);

const expenseWithOptionalEventSchema = expenseWithoutEventSchema.and(
  z.object({
    event: expenseEventSchema.optional(),
  })
);

export type Expense = z.infer<typeof expenseSchema>;

export type ExpenseWithOptionalEvent = z.infer<
  typeof expenseWithOptionalEventSchema
>;

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

function isExpense(expense: Expense | unknown): expense is Expense {
  if (typeof expense !== "object") {
    return false;
  }
  const { payerId, type, amount, subject, date } = expense as Expense;
  if (
    typeof payerId === "undefined" ||
    (type !== "share" && type !== "split") ||
    typeof amount === "undefined" ||
    typeof subject === "undefined" ||
    typeof date === "undefined"
  ) {
    return false;
  }
  return true;
}

function eventToExpenseOrUndefined(event: Event): Expense | undefined {
  const payerId = getEventTagValue(event, "payerId");
  const date = getEventTagValue(event, "date");
  const subject = getEventTagValue(event, "subject");
  const amount = getEventTagValue(event, "amount");
  const type = getEventTagValue(event, "type");
  const expense = { payerId, type, amount, subject, date, event };

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
}

function membersFromMetadataEvent(event: Event): {
  [memberId: string]: Member;
} {
  const memberTags = getEventTags(event, "member");
  const members = memberTags
    .map((tag) => {
      const [, id, name, sharesString] = tag;
      const shares = parseFloat(sharesString);
      return { id, name, shares };
    })
    .reduce((members, member) => ({ ...members, [member.id]: member }), {});
  return members;
}

function filterOutUndefined<T>(input: T): input is NonNullable<T> {
  return typeof input !== "undefined";
}

export async function loadGroupById(relayUrls: string[], groupId: string) {
  const startTime = Math.floor(Date.now() / 1000);

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
}

function generateId() {
  return Math.random().toString().slice(2, 8);
}

export async function updateMemberData(
  groupData: GroupData,
  member: Member
): Promise<{ success: true } | { success: false; message: string }> {
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
}

function getSplitTags(expense: ExpenseWithOptionalEvent): string[][] {
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
}

export async function saveGroupExpense(
  groupData: GroupData,
  expense: ExpenseWithOptionalEvent
): Promise<{ success: true } | { success: false; message: string }> {
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
}

export function getSettlementPlan(groupData: GroupData) {
  const balances = calculateBalances(groupData);
  const paymentPlan = calculateSettlementPlan(balances);
  return paymentPlan;
}

export function getMemberNameFromGroupData(groupData: GroupData, id: string) {
  const name = groupData.members?.[id]?.name;
  if (typeof name !== "string") {
    const message = "#OVwu11 Failed to find name for member";
    console.error(message, id, groupData);
    throw new Error(message);
  }
  return name;
}
