# thehackening.ai

A static resource site on Hackening threat models: practical advice sorted by what you're defending against, with the reasoning and evidence for each item, an incident log, open questions, and a printable checklist.

It consolidates the LessWrong thread [The Hackening: Justified Practical Advice And Open Questions](https://www.lesswrong.com/posts/YA2r4rg6SpBtwRqtq/the-hackening-justified-practical-advice-and-open-questions).

**Status: prototype.** Every advice item is unreviewed. See [CONTRIBUTING.md](CONTRIBUTING.md) to add, dispute or review an item.

## Who made this, and what to expect

- The site was drafted by one maintainer (Alex A on LessWrong) working with an AI coding assistant on 13 to 14 November 2026. There are no other contributors yet. It is an unpaid volunteer effort and more volunteers are wanted.
- Nothing has been checked by a professional. The maintainer has read all of it, but it remains unverified until it is reviewed.
- The "Evidence" labels are the maintainer's own judgment, and the probability estimates are one person's judgment.
- Commenters are paraphrased by name from public comments without having been asked. Anyone named can ask to be corrected or removed.
- The advice is mostly specific to the United States.
- The only address is thehackening.ai (and, until that domain is live, thehackening.vercel.app). The site has no accounts, no app, no helpline and no email list. It will never contact you, ask you to sign in, or ask for money or personal details.

## How it works

All content lives in data files; pages are generated from them.

| File | Becomes |
| --- | --- |
| `data/advice.yaml` | Guide, and the Checklist (items with `checklist: true`) |
| `data/incidents.yaml` | Incident log |
| `data/questions.yaml` | Open questions |
| `data/basics.yaml` | Basics |
| `data/site.yaml` | Sitewide copy, threat models, rating definitions |
| `CONTRIBUTING.md` | Help wanted page |
| `ABOUT.md` | About page |
| `research/notes.md` | Research notes page |

`build/build.mjs` reads the data, validates it against `build/schema.mjs`, and renders the templates in `src/templates.mjs` into `dist/`. The build fails on a missing required field, an unknown field, or an unknown rating value.

The output is plain HTML and one stylesheet: no JavaScript, no third-party requests, no server-side code. Filtering on the Guide page is done in CSS, so everything works with scripts disabled. `vercel.json` sets a Content-Security-Policy that forbids scripts outright.

## Develop

Requires Node 20 or later.

```sh
npm install
npm run build        # validate + build into dist/
npm run validate     # validate the data files only
npm run check-links  # check every URL in the data files
npm run serve        # preview dist/ locally
```

## Deploy

Any static host works: build, then serve `dist/`. For Vercel, `vercel.json` already sets the build command, output directory and security headers.

## Planned, not built

None of the ideas below exists. The About page tells readers about them, and says the site has no accounts and takes no money today; update that page before building any of them.

- **A checklist readers can work through, with sign-in.** Let a reader sign in and run through the actual checklist: tick off each step as they do it, come back later to where they left off, see how much of their own setup is done, and get notified when a step changes or a new one is added. This conflicts with the current design (static site, no server-side code, no database, no JavaScript), which was chosen so that a site about hacking is hard to hack. A record of which protections each person has *not* set up is itself sensitive data. Options to weigh before building: ticks saved only in the reader's own browser with no account (needs a small script, loses progress across devices); email or RSS notifications with no login; or full accounts through a hosted sign-in provider, kept on a separate subdomain from the static content.
- **Affiliate links for the few steps that involve buying something**, with proceeds donated. Deferred until the site has readers; needs a plain disclosure, a non-affiliate link alongside, and a rule that it never affects what is recommended.
- **A "what won't help" section.** Things people commonly reach for that don't protect against these threats, each with the reason, kept separate from the steps. Gold is the first example: its guide page exists (`gold-is-the-wrong-hedge`, kind `skip`) but is not linked from the home page until this section is built.
- **"When to act" page:** signals in the news and what to do when you see them. Draft material is in `research/notes.md`.

## Not advice

Not financial, legal or security advice. This is one volunteer maintainer's summary of public discussion and reporting, drafted with an AI coding assistant and not checked by any professional.
