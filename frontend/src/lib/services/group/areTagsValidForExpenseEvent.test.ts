import { describe, expect, it } from "vitest";
import { exampleExpenseEvent } from "../../../fixtures/events.fixtures";
import { areTagsValidForExpenseEvent } from "./areTagsValidForExpenseEvent";

describe("#YkUj3W areTagsValidForExpenseEvent()", () => {
  it("#wytyL0 Returns true for a valid expense event", () => {
    expect(areTagsValidForExpenseEvent(exampleExpenseEvent.tags)).toEqual(true);
  });
});
