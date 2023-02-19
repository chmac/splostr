import { idSchema } from "./events.utils";

export function areTagsValidForMetadataEvent(tags: string[][]): boolean {
  const passedFirstTest = tags.every((tag) => {
    const [name, ...values] = tag;
    switch (name) {
      case "d":
      case "p":
        if (values.length !== 1 || !idSchema.safeParse(values[0]).success) {
          return false;
        }
        break;
      case "member":
        if (values.length !== 3) {
          return false;
        }
        break;
      default:
        return false;
    }

    return true;
  });

  if (!passedFirstTest) {
    return false;
  }

  return true;
}
