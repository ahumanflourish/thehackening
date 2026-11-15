# Open tasks

What still needs doing on thehackening.ai. If you want to help, pick something here and open an issue or pull request on [GitHub](https://github.com/ahumanflourish/thehackening) saying you're taking it. See [Help wanted](CONTRIBUTING.md) for how contributions work.

Last updated: 15 November 2026.

## Most wanted: professional review

Every guide says "Checked by: Nobody yet". A review from someone who works in the field is the single most useful contribution.

- [ ] **Security review** of the account and device guides. Start with: locking your phone number and moving off text-message codes; password manager; backups; "hang up and call back".
- [ ] **Banking, fraud or compliance review** of the money guides. Start with: which losses a US bank must refund (Regulation E); payment apps and what can be pulled back; deposit insurance; splitting money across banks; cash at home.
- [ ] **Second look at the guides rewritten on 14 November.** An automated audit found errors in several guides and they were rewritten the same day. Each replacement fact was checked against an official source, but nobody has independently re-checked the rewritten text.

## Content

- [ ] **Redraw the "Instant payments" diagram.** The current one (a forked line: slow transfers can be stopped, instant ones are gone) is still hard to read. A four-stage alternate exists in `src/diagrams.mjs`.
- [ ] **A deeper treatment of each threat model.** The home page gives each threat a short paragraph and a diagram. Wanted: for each, how it would actually happen, who would do it and why, what has already happened that resembles it, how likely and how bad (with whose estimate), what to watch for, and where people who know the field disagree.
- [ ] **"What won't help" section.** Things people commonly reach for that don't protect against these threats, with the reason for each. Gold is the first example; its page exists but nothing links to it.
- [ ] **"When to act" page.** Signals in the news and what to do when you see them. Draft material is in `research/notes.md`. Must not tell readers to withdraw cash on a headline.
- [ ] **Evidence on the home page.** The home page no longer shows examples or the chart of Chrome security fixes (data in `data/charts.yaml`). Decide whether a short "what has happened so far" belongs there or the chart moves to the Incidents page.
- [ ] **Explain the name.** "The Hackening" is no longer explained on the home page, only on About.
- [ ] **"Good to know" facts for the Power and internet threat.** The other three threats have them; this one has none.
- [ ] **Have incidents really increased?** Go through the news from the past year or two and count, so the claim rests on a record and not an impression. Say how incidents were found and counted, since more reporting is not the same as more incidents.
- [ ] **A shopping list for preparing,** possibly one per climate (heat, cold, storms).
- [ ] **Keep Incidents current.** Add new events, and update the ones marked "Still developing" (the FAA ground stop, the Microsoft 365 outage, the Binance theft) when causes are published.
- [ ] **Keep Open questions current** as new discussion and evidence appear.
- [ ] **Remaining audit findings.** The audit's lower-priority items were only partly applied: style polish, and topics it said are missing (backup power, a battery radio, closing unused accounts).
- [ ] **Check six links by hand.** They refuse automated checks: TransUnion's freeze page, two Axios articles, one Reuters article, the Identity Theft Resource Center report, and one statistics page cited in the research notes.
- [ ] **Readers outside the United States.** Most refund and deposit-protection rules described are US rules. Say what differs elsewhere, or link to equivalents.
- [ ] **Shorten the text you see before opening a guide.** A few titles and cost badges are long ("Possible interest" wraps onto two lines).

## Guides for contributors and for AI assistants

- [ ] **A better guide for people who want to contribute.** The current Help wanted page explains the rules but not the workflow. Wanted: a short walk-through of one real change from start to finish (fix a fact, add a source, add an incident), with screenshots of the GitHub steps for people who have never used it.
- [ ] **A contributing guide an AI agent can follow.** A file in the repository (for example `AGENTS.md`) that a contributor can hand to their own AI coding assistant: how the data files are laid out, the copy rules, the rating definitions, how to run the checks, and what must never be done (invent a figure, change a step link to an unapproved site, credit a reviewer who has not asked).
- [ ] **The guides in a form an AI assistant can walk a reader through.** A plain-text version of the steps and guides that someone can give to an assistant such as Claude, so it can take them through the checklist one step at a time, answer questions and keep track of what is done. It must be written so the assistant coaches and never operates: it should not ask for passwords, codes or account numbers, and should not be connected to money accounts, in line with the site's own advice on AI tools.

## Editorial

- [ ] **A person reviews all the copy and signs off on accuracy.** The text was drafted with an AI assistant and checked by automated audits. A careful human read of every page, against its sources, has not been done.
- [ ] **Test alternative wording for the home page opening** (later). Comparing versions properly needs visitor measurement, which the site deliberately does not have; any approach must not add tracking.

## Design and testing

- [ ] **Test on different screen sizes.** Phones, tablets and very wide monitors, in light and dark, with tabs, expanders and pop-ups open; plus keyboard use and printing. A first attempt was abandoned because the design changed underneath it.
- [ ] **Link preview.** No preview image or description appears when the link is pasted into a chat or forum.
- [ ] **Pictures on the Incidents page.** Fourteen symbols exist; there is none for a state-backed campaign, and the "flaw in widely used software" symbol reads a little like a loading spinner.
- [ ] **Reviewer badge wording.** When the first review is recorded, the badge should read "Reviewed by a security professional" (or banking, or compliance) with the reviewer's name.

## Site features (not built)

- [ ] **A checklist readers can work through.** Tick off steps, come back later, see progress, get notified when a step changes. Sign-in conflicts with the current design (no accounts, no scripts, no database), and a record of which protections someone has *not* set up is sensitive. Options: ticks saved only in the reader's own browser; email or RSS notifications with no login; or full accounts through a hosted sign-in provider on a separate subdomain.
- [ ] **Automated incident updates.** A scheduled AI agent (for example a Claude scheduled task) that checks the news on a regular schedule for new hacks and outages and for updates to entries marked "Still developing", then drafts the changes to `data/incidents.yaml` with sources. It must open a pull request for a person to review and never publish on its own: every change to the main branch goes live, and the AI-involvement ratings need a human check against the site's definitions.
- [ ] **A page for each incident.** Its own address, a description and its sources. A catalogue entry, not a news article.
- [ ] **A severity badge on each incident page.** Needs a written definition of each level, like the AI-involvement ratings have.
- [ ] **Filter the incidents, and download them as a table.** Filtering has to fit the no-scripts design or the design has to change; the download could be a CSV file built from `data/incidents.yaml`.
- [ ] **A data page.** Key figures on events and risk in one place: Chrome security fixes, published software flaws (CVEs) and similar series. Some of this was collected before (`data/charts.yaml`, `research/charts`) but is no longer shown anywhere.
- [ ] **Incident data in like terms.** Record each incident in `data/incidents.yaml` with the same structured fields (date, kind, severity, scale of impact) so they can be added up: the impact or severity of cyber events per month, or per week. Depends on the severity definitions above, and feeds the "have incidents really increased?" question.
- [ ] **A form for submitting a question or correction,** for people who don't use GitHub.
- [ ] **Search-engine basics:** a sitemap, and step-by-step markup on the guides so the steps can appear in search results.
- [ ] **Affiliate links, proceeds donated** (deferred). Only for the few steps that involve buying something; needs a plain disclosure, a non-affiliate link alongside, and a rule that it never affects what is recommended.

## Project

- [ ] **Point thehackening.ai at the site.** Until then the address is thehackening.vercel.app.
- [ ] **A better way for professional reviewers to get in touch.** There is now a contact email (ahumanflourish@gmail.com) alongside GitHub. Still wanted: the submission form listed above, so nobody has to write an email from scratch.
- [ ] **Reach out to reviewers directly** if none come forward: a short email to a few people with the right background, linking the guides in their area and saying exactly what is being asked.
- [ ] **Choose a licence.** The repository has none, so it is unclear whether others may reuse the text or the code, or on what terms contributions are accepted.
- [ ] **Protect the publishing route.** Every change to the main branch goes live automatically. Require a review before merging, and protect the maintainer accounts on GitHub and the hosting service with a security key.
- [ ] **A public change log.** A dated list of what changed on the site and why, so returning readers and reviewers can see corrections.
- [ ] **Co-maintainers.** People willing to merge changes and keep Incidents and Open questions current.

## Questions to decide

Not tasks yet. Noted on 15 November so they are not lost.

- **Blogs.** Do blog posts belong on this site, or should the maintainer write them separately?
- **If nobody answers the request for professional review, what does that mean?** This is the main question. What does it say about whether there is demand for security-focused projects like this one?
- **Security consultations for individuals.** Is there a need? Hardening your own accounts and devices is a chore even for someone motivated, and it is hard to trust the job to an AI.
