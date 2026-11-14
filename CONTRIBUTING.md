# Help wanted

This site gathers advice from public community discussions, put together by a volunteer with the help of an AI agent. Nothing on it has been checked by a professional yet. The most useful help is a review from someone who works in security, banking, fraud or compliance.

## How to contribute

Contributions go through the site's page on GitHub.

- **To report a mistake or suggest something,** [open an issue](https://github.com/ahumanflourish/thehackening/issues). No code needed: say which page, what is wrong or missing, and a source if you have one.
- **To make a change yourself,** [open a pull request](https://github.com/ahumanflourish/thehackening/pulls). The second half of this page explains how each kind of change is made.
- **To volunteer as a reviewer,** open an issue saying which guides you can review and what your background is. See the next section for how reviews are credited.

## Volunteer as a reviewer

This is the most useful thing you can do. Every item currently says **Checked by: Nobody yet**, and that label only changes when someone with relevant professional background checks the item.

Reviewers wanted:

- **Security practitioner**, for the personal-attack and institutional items.
- **Finance or compliance professional**, for the refund-rule and deposit-insurance items (Regulation E, broker guarantees, FDIC, NCUA, SIPC).
- **Someone to keep the open questions current**, as new discussion and evidence appear.

### What a "Checked by" credit requires

A "Checked by" credit tells readers that a professional looked at an item, so it is not given on someone's word alone. All three of these are required:

1. **Something checkable about you.** A public professional profile or an employer page that names you, which a maintainer can confirm belongs to you. It is linked on the item, so readers can check it too. Describing your own background is not enough, however plausible.
2. **Your own explicit request to be credited.** You have to ask, in your own words, to be named as the reviewer of that item. Nobody is credited because they made a helpful comment.
3. **A statement of exactly what you checked.** For example "the Regulation E deadlines in the 'why' section", not "the item".

A helpful comment alone cannot grant a credit. The label stays "Nobody yet" until all three requirements are met and a maintainer has confirmed the first one.

Once they are met, a maintainer sets the item to `expert_reviewed` and records the review on it:

```yaml
review_status: expert_reviewed
reviews:
  - name: Your name, as it appears on your public profile
    background: Your role, plus the address of the profile or employer page the maintainer confirmed
    date: 2026-11-20
    scope: Exactly what you checked, e.g. "Reg E timelines and the authorized/unauthorized distinction"
```

A review says what was checked, not that the item is guaranteed correct. Reviews older than six months are shown as due for re-review. A reviewer can ask at any time for the credit to be removed.

### Links and phone numbers in steps

Readers act on the links and phone numbers in the steps, so these get extra care:

- **Any change to a link or a phone number in a step must be checked by a maintainer against the institution's own website before it is merged**, whoever proposes it and whatever else the change contains. A review credit does not exempt a change from this.
- **Step links must stay on the approved list of official domains.** The build enforces the list and fails on a step link to any other site. Adding a domain to the list is a separate change that a maintainer makes after checking that the domain really belongs to the institution.
- Do not bundle a link or phone-number change with other edits. Send it on its own so it can be checked on its own.

## Making changes yourself

The rest of this page is for people editing the site's files. All the content lives in a handful of plain text files in the [`data/` folder](https://github.com/ahumanflourish/thehackening/tree/main/data): one for the steps and guides, one for incidents, one for open questions. Edit the relevant file and open a pull request. An automatic check runs on every pull request and says what is wrong if an entry is malformed.

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
7. **No personal financial details** about yourself or anyone else, including what a named commenter says they keep or hold.
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
- Rate `ai_involvement` separately for each stage you have information on (`discovery`, `attack`, `agent_behavior`), using `confirmed`, `suspected`, `unlikely` or `unknown`. Use `confirmed` only when the victim, the supplier or an official investigator says AI was used in that stage of that event. A report from unnamed sources, a private researcher or a security company is `suspected`. Put who said it in `note`.
- Open the source before you write a figure, and put a date on any figure that can change ("as of 5 Nov 2026"). Do not rely on a summary of a source, and do not cite an AI-generated summary.
- Do not credit an AI-generated comment as a contributor or as support for an estimate. If one has to be mentioned, call it "an AI-generated comment in the thread".
- List the advice it informs under `related_advice`.
- Set `needs_research: true` if details are still missing or the cause is still under investigation.

### Picture on the Incidents page

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
- `agents`: AI agents doing things inside accounts they were given access to.
- `breakout`: AI agents leaving the limits they were meant to stay inside.
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
