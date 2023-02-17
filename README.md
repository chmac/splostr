# splostr

Split bills, track expenses via nostr

## Nostr Events

Check the [nostr protocol](https://github.com/nostr-protocol/nips).

### Create group

Inspired by [nip28](https://github.com/nostr-protocol/nips/blob/master/28.md), groups are created by a single event. That event should never change so that its ID remains constant.

```jsonc
{
  "kind": 1535,
  // The content field should be empty
  "content": "",
}
```

Unlike nip28, the content field should be empty. That way if a client wants the metadata, they must query for the metadata event and cannot use outdated metadata.

### Group metadata

Building upon [nip33](https://github.com/nostr-protocol/nips/blob/master/33.md) setting group metadata is a parameterized replaceable event.

This event should be signed by the same key as the create group (kind 1535) event. Clients should ignore any events which are not signed by this key.

```jsonc
{
  "kind": 31535,
  // The content should contain a JSON string with the fields `name`, `about`, and `picture` as per nip01
  "content": "{\"name\": \"Demo Group\", \"about\": \"A test group.\", ... }",
  "tags": [
    // The d tag is used to reference the event ID of the create event
    ["d", "ID_OF_KIND_1535_EVENT"]
  ]
}
```

This allows clients to fetch group metadata by querying for events by `author` and `d` tag.

### Group invite

The creator of a group can invite others to join the group with an event kind `1536` like so:

```jsonc
{
  "kind": 1536,
  // TODO - Does it make sense to include an invite message here?
  "content": "",
  "tags": [
    ["e", "ID_OF_KIND_1535_EVENT", "", "root"],
    ["p", "PUBLIC_KEY_OF_INVITED_USER"],
  ]
}
```

This event should be signed by the same key as the create group (kind 1535) event. Clients should ignore any events which are not signed by this key.

An invite can include multiple `p` tags to invite multiple people. The content should be empty.

### Accept Invite

When a user wants to accept an invite, they can reply with a kind `1537` like so:

```jsonc
{
  "kind": 1537,
  // TODO - Does it make sense to use the same content format as reactions (nip25) where a `+` would mean accept and a `-` would mean reject?
  // TODO - Does it make sense to use a different kind here?
  "content": "",
  "tags": [
    ["e", "ID_OF_KIND_1535_EVENT", "", "root"],
    ["e", "ID_OF_KIND_1536_EVENT", "", "reply"],
  ]
}
```

This type of event must not have any `p` tags.

### Expense

Any member of a group can post expenses. They are events of kind `1538` like so:

```jsonc
{
  "kind": 1538,
  // The content contains the amount as a string
  "content": "100.00",
  "tags": [
    ["e", "ID_OF_KIND_1535_EVENT", "", "root"],
    // The user adds a p tag for every member of the group who this expense is shared with, optionally including their own public key
    ["p", "PUBLIC_KEY_OF_USER_SHARING_THIS_EXPENSE"],
    // The description of the expense should be less than 80 characters
    ["subject", "Description of the expense"],
    // The date of the expense may not be the same as the `created_at` field on the event and so it is added explicitly
    ["date", "2023-01-11"]
  ]
}
```

### Flow

- A user wants to check for invites
  - Query for events with kind `1536` with a `#p` filter for your public key
  - Find the linked create event ID and retrieve that event
  - Check that both create event and invite were signed by the same public key
- A user wants to retrieve the groups they have joined
  - Query for events with kind `1536` that they authored
- A user wants to retrieve the group metadata given its ID
  - Query for events with kind `1535` and `id` of the group ID
    - The author of this event is the `group_creator`
  - Query for the kind `31535`, `#d` group ID, and author `group_creator`
- A user wants to get the members of a group given its ID
  - Query for the kind `1535` event by ID
    - The author of this event is the `group_creator`
  - Query for events with kind `1536`, `#e` the group ID, and author `group_creator`
    - Extract all the `p` tags, these are all the `invitees`
  - Query for events with kind `1536` and author `invitees`
    - Extract the authors of each of these events
    - The authors plus `group_creator` are the members of the group
- A user wants to post an expense to the group
  - Get the group members
  - Choose which members to share the expense with
  - Post an event kind `1537` with the relevant parameters

## Frontend architecture

Currently we're using the `nostr-react` package. Components specify a filter query, and get back an array of events. This creates challenges when trying to retrieve a single event. For example trying to get the group metadata.

When displaying members, currently we're just showing IDs. Ideally we'd retrieve profile (kind `0`) events. There is a `useProfile()` hook in `nostr-react` that would help with this.
