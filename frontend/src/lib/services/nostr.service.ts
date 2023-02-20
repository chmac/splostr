import { nip26, type Event } from "nostr-tools";

export function getPublicKeyOfEvent(event: Event) {
  const maybeDelegator = nip26.getDelegator(event);
  return maybeDelegator || event.pubkey;
}

export function getProfileFromEvent(event?: Event) {
  const empty = {
    name: "",
    about: "",
    picture: "",
  };
  if (typeof event === "undefined") {
    return empty;
  }
  const profileJson = event.content;
  try {
    const profile = JSON.parse(profileJson);
    return profile;
  } catch {
    return empty;
  }
}

export function filterForTagFactory(key: string) {
  return (tags: string[]) => tags[0] === key;
}

export function getDTag(event: Event) {
  const tag = event.tags.find(filterForTagFactory("d"));
  return typeof tag === "undefined" ? tag : tag[1];
}

export function getEventTags(event: Event, tagName: string) {
  const tags = event.tags.filter(filterForTagFactory(tagName));
  return tags;
}

export function getEventTagValue(event: Event, tagName: string) {
  const tag = event.tags.find(filterForTagFactory(tagName));
  if (typeof tag === "undefined") {
    return;
  }
  return tag[1];
}
