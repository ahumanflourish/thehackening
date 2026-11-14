# Contributing

Everything on the site is generated from the files in [`data/`](https://github.com/ahumanflourish/thehackening/tree/main/data). To change the site, change a data file. You never need to touch a template.

There are two ways to contribute:

- **Pull request** against the data files in the [GitHub repository](https://github.com/ahumanflourish/thehackening).
- **Comment in the [LessWrong thread](https://www.lesswrong.com/posts/YA2r4rg6SpBtwRqtq/the-hackening-justified-practical-advice-and-open-questions).** A maintainer folds thread comments into the data files and links back to yours.

## Volunteer as a reviewer

This is the most useful thing you can do. Every item currently says **Unreviewed**, and that label only changes when someone with relevant professional background checks the item.

Reviewers wanted:

- **Security practitioner**, for the personal-attack and institutional items.
- **Finance or compliance professional**, for the refund-rule and deposit-insurance items (Regulation E, broker guarantees, FDIC, NCUA, SIPC).
- **Open-questions maintainer**, to fold new thread comments into `data/questions.yaml` and keep the answers current.

To review an item, open a pull request (or an issue, or a thread comment) that says what you checked and what you'd change. A maintainer then sets the item to `expert_reviewed` and records your review on it:

```yaml
review_status: expert_reviewed
reviews:
  - name: Your name or handle
    background: One line on why you're qualified, e.g. "10 years in bank fraud operations"
    date: 2026-11-20
    scope: What you checked, e.g. "Reg E timelines and the authorized/unauthorized distinction"
```

A review says what was checked, not that the item is guaranteed correct. Reviews older than six months are shown as due for re-review.

## Add an advice item

Add an entry to `data/advice.yaml`. Copy an existing item as a starting point.

Required fields: `id`, `threat_model`, `title`, `advice`, `why`, `protects_against`, `confidence`, `review_status`, `updated`.

Rules for every item:

1. **Say why it works and what failure it protects against.** `why` is the mechanism. An item without a mechanism is not ready.
2. **Pick the confidence honestly.**
   - `established`: rests on law, regulation, official terms, or documented precedent. Needs at least one entry under `sources`. If you don't have one yet, set `needs_source: true`; the site shows a "Needs source" tag.
   - `reasoned`: follows from a clear model of the mechanism, but not directly tested.
   - `speculative`: plausible, with weak or contested evidence.
   - Use `confidence_note` when parts of an item differ, such as an established rule applied to a new situation.
3. **New items start as `review_status: unreviewed`.**
4. **Paraphrase thread comments and link to them** under `thread_refs`. Don't quote at length.
5. **Check for duplicates first.** If the advice already exists, add your source or comment link to the existing item.
6. **If it's genuinely uncertain, it's a question, not advice.** Put it in `data/questions.yaml`.
7. **No personal financial details** about yourself or anyone else.
8. Set `updated` to today's date. Date any number that will go stale ("as of Nov 2026").

To put an item on the printable checklist, set `checklist: true` and write a one-sentence `checklist_text` that someone could act on without reading the guide.

## Dispute an item

Don't delete or silently rewrite advice you disagree with. Add or edit the item's `sides`:

```yaml
sides:
  for: Who argues for it and why, in a sentence or two.
  against: Who argues against it and why.
  synthesis: What a reader should do given both.
```

Link the comments or sources for each side under `thread_refs` or `sources`. The site shows both sides and the synthesis, and tags the item "Disputed". If you think the confidence level is wrong, say so in the pull request with the evidence.

## Add or update an incident

Add an entry to `data/incidents.yaml`. The log is a small set of real, dated events that inform the advice, not a news feed.

- `kind` is `current` for a Hackening-era event, or `precedent` for an older event used for calibration.
- Rate `ai_involvement` separately for each stage you have information on (`discovery`, `attack`, `agent_behavior`), using `confirmed`, `suspected`, `unlikely` or `unknown`. Rate from what the victim, vendor or officials have actually said, and put who said it in `note`.
- List the advice it informs under `related_advice`.
- Set `needs_research: true` if details are still missing or the cause is still under investigation.

### Picture on the news feed

`type` picks the drawing shown with the story. Choose the one that matches what happened, not who did it. If the story has a real count (so many hit, out of so many), add `count` as well and the feed draws counted dots instead.

- `outage`: a service stopped working and the cause is a failure, or not yet known.
- `overload`: a service failed because it was overwhelmed or a change went wrong; not an attack.
- `lockout`: attackers locked an organization's own systems until it pays (ransomware).
- `heist`: money stolen from a bank or other institution, often by way of a supplier.
- `crypto-theft`: crypto taken from wallets or an exchange.
- `devices`: many internet-connected machines of the same kind taken over.
- `software-flaw`: a flaw found in software that very many systems run.
- `supplier`: one supplier was attacked and the customers that depend on it went down with it.
- `one-to-many`: one attacker or one tool hitting many separate targets.
- `agents`: AI programs doing things inside accounts they were given access to.
- `breakout`: AI programs leaving the limits they were meant to stay inside.
- `data-theft`: personal or company records copied out.
- `records-lost`: the record of who owns what was lost or cannot be matched up.
- `advisory`: an official warning covering many possible targets, with no single event behind it.

## Add a basics link

`data/basics.yaml` links out to existing security guides. Don't rewrite them. The `commentary` field says what matters more or less under the new threat model.

## Check your change

```sh
npm install
npm run build        # validates every data file, then builds the site into dist/
npm run check-links  # checks that every URL resolves
```

The build fails, and says where, on a missing required field, an unknown field name, an unknown value for a rating, or a reference to an advice id that doesn't exist.
