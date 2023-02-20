import { z } from "zod";
import { idSchema } from "./events.utils";

const REQUIRED_TAG_NAMES = [
  "e",
  "payerId",
  "subject",
  "date",
  "type",
  "amount",
] as const;
const OPTIONAL_TAG_NAMES = ["member"] as const;
const ALLOWED_TAG_NAMES = [
  ...REQUIRED_TAG_NAMES,
  ...OPTIONAL_TAG_NAMES,
] as const;

export const tagNameSchema = z.enum(ALLOWED_TAG_NAMES);
export const dateSchema = z.string().regex(/[0-9]{4}-[0-9]{2}-[0-9{2}]/);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertNever(_x: never): never {
  throw new Error("#HwVoRC Implementation error");
}

export function areTagsValidForExpenseEvent(tags: string[][]): boolean {
  const tagNames = tags.map((tag) => tag[0]);
  const hasAllRequiredTags = REQUIRED_TAG_NAMES.every((requiredTag) =>
    tagNames.includes(requiredTag)
  );
  if (!hasAllRequiredTags) {
    return false;
  }

  const passedTagContentCheck = tags.every((tag) => {
    const [maybeName, ...values] = tag;

    const tagNameValidationResult = tagNameSchema.safeParse(maybeName);
    if (!tagNameValidationResult.success) {
      return false;
    }
    const name = tagNameValidationResult.data;

    switch (name) {
      case "e":
        if (values.length !== 2 && values[0].length !== 64) {
          return false;
        }
        if (!idSchema.safeParse(values[0]).success) {
          return false;
        }
        break;
      case "date":
        if (values.length !== 1 && values[0].length !== 10) {
          return false;
        }
        if (!dateSchema.safeParse(values[0]).success) {
          return false;
        }
        break;
      case "payerId":
      case "subject":
        if (values.length !== 1) {
          return false;
        }
        break;
      case "type":
        if (values.length !== 1) {
          return false;
        }
        if (values[0] !== "share" && values[0] !== "split") {
          return false;
        }
        break;
      case "amount":
        if (values.length !== 1) {
          return false;
        }
        break;
      case "member":
        if (values.length > 2) {
          return false;
        }
        break;
      default:
        assertNever(name);
        break;
    }

    return true;
  });

  if (!passedTagContentCheck) {
    return false;
  }

  const memberTags = tags.filter((tag) => tag[0] === "member");

  // Ensure all member tags have an amount, or none have an amount
  if (memberTags.length > 1) {
    const memberTagLength = memberTags[0].length;

    const passedMemberCheck = memberTags.every(
      (tag) => tag.length === memberTagLength
    );

    if (!passedMemberCheck) {
      return false;
    }
  }

  return true;
}
