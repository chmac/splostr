import { describe, expect, it } from "vitest";
import { exampleMetadataEvent } from "../../../fixtures/events.fixtures";
import { areTagsValidForMetadataEvent } from "./areTagsValidForMetadataEvent";

describe("#3lsAO1 areTagsValidForMetadataEvent()", () => {
  it("#d7U8xU Returns true for a valid event", () => {
    expect(areTagsValidForMetadataEvent(exampleMetadataEvent.tags)).toEqual(
      true
    );
  });
});
