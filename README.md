# thehackening.ai

A static resource site on Hackening threat models: practical advice sorted by what you're defending against, with the reasoning and evidence for each item, an incident log, open questions, and a printable checklist.

It consolidates the LessWrong thread [The Hackening: Justified Practical Advice And Open Questions](https://www.lesswrong.com/posts/YA2r4rg6SpBtwRqtq/the-hackening-justified-practical-advice-and-open-questions).

**Status: prototype.** Every advice item is unreviewed. See [CONTRIBUTING.md](CONTRIBUTING.md) to add, dispute or review an item.

## Who made this, and what to expect

- The site is an unpaid volunteer effort, first put together in November 2026 by volunteers working with AI agents, from public news reporting and public discussion threads. More volunteers are wanted.
- Nothing has been checked by a professional unless the item says so. Until an item is reviewed, treat it as unverified.
- The "Evidence" labels and the order of the steps are the volunteers' own judgment, and the probability estimates are judgment calls.
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

## Open tasks

What still needs doing, including planned features, is in [TASKS.md](TASKS.md).

## Not advice

Not financial, legal or security advice. This is a volunteer summary of public discussion and reporting, drafted with the help of AI agents and not checked by a professional unless an item says so.
