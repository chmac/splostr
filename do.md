# Do

## Actions

- [ ] Decide how to handle relays
  - Just hard code one would be the easiest
  - Or make the configurable
  - Similar questions for private keys
  - Do we push subscriptions to all relays?
  - Do we log which events were seen on which relays?
- [ ] Refactor `useNostr()` calls
- [ ] Ignore accepted invites in the invite list
- [ ] Calculate balances
- [ ] Add UI to select who shares an expense
- [ ] Support negative expenses (repayments)

## Ideas

- Support multiple relays in nostr-redux
- Encrypted content
- Filter for relay compatibility
- Add an expiration date to the group, and therefore all its messages
- Better merging logic, only update if the new record has a newer created_at
