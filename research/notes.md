# Research notes

These are background notes, not recommendations. They were compiled from community discussion and public reporting in October–November 2026, with the help of an AI agent, and have not been checked by a professional. The estimates are judgment calls, not forecasts; read them as a rough ranking, not precise numbers.

## How a hostile internet hits money

Four different failure modes, each needing a different defense. Deposit insurance and gold each protect against the wrong one.

| Failure mode | What breaks | What protects |
| --- | --- | --- |
| Someone takes over your accounts | Money moved out through your login (phishing, SIM swap, breached data, stolen session, or a support call impersonating you) | Unique passwords, non-SMS two-factor, credit freezes, alerts; legal refund rules (Reg E) and broker guarantees |
| Your institution is down or frozen | Money is safe but unreachable for days to weeks | A second and third institution on different systems, plus cash |
| Regional or payment-network outage | Cards and ATMs stop working | Physical cash and supplies |
| An institution's records are damaged, or it fails | Proof of what you own | FDIC/NCUA/SIPC, the institution's offline backups, your own statements |

Gold only helps in a fifth case, a collapse of the dollar system, which is far less likely than any of these.

**Why mass events change the picture.** Insurance pools losses that don't happen at the same time. SIPC's fund targets $5 billion plus a $2.5 billion Treasury credit line, against trillions in brokerage assets. In a mass event, the real backstop is political, so being a typical victim at a large institution holding plain assets is safer than being an unusual one ("defense by normality"). SVB's deposits were guaranteed within a weekend in 2023; customers of finance apps built on Synapse were locked out for months, and some never got all their money back.

**The authorized/unauthorized line.** Under Regulation E, a transfer someone else makes with your stolen or phished credentials is unauthorized. If a thief used your card or another access device, report within 2 business days of finding out and you owe at most $50; wait longer and it can rise to $500. If no access device was used, you owe nothing as long as you report within 60 days of the statement. After 60 days, later losses may not be refunded at all. (Whether a stolen login counts as an access device was not checked against the regulation's definitions, so report at once either way.) The bank must investigate within 10 business days or provisionally credit you, and the bank carries the burden of proof. A payment you initiate yourself, even because of a scam, stays authorized. Activity by someone you gave access to (including an agent or budgeting app) generally counts as authorized; Fidelity's guarantee says so explicitly.

## How long outages last

| Started | Event | Duration |
| --- | --- | --- |
| Jun 2024 | Patelco Credit Union ransomware | About two weeks without online banking, app, transfers or call center |
| Jun 2024 | CDK Global (software for ~15,000 car dealers) | About two weeks, restored in phases |
| Nov 2023 | Trellance / Ongoing Operations vendor ransomware | About 60 credit unions out for days to weeks |
| Apr 2024 | Synapse collapse (not a hack) | Months frozen; some customers never got all their money back |

**What sets the length.** Patching takes days. Most of the outage is the institution proving its systems are clean before reconnecting, and it's largely self-imposed: institutions shut services down to contain the damage. Length depends on what attackers did inside:

- **Data stolen or systems locked, balances intact:** about two weeks.
- **Balances altered or backups corrupted:** nightly offline backups (the Sheltered Harbor standard) restore the previous night's balances, then weeks to reconcile.
- **No trustworthy record left:** months, as with Synapse.

**When many institutions are hit at once** (a flaw in software they share), restoration becomes a queue, and cleanup specialists are spread across every victim. Institutions late in the queue could plausibly be out three to six weeks. That's an extrapolation, not a precedent. Small banks and credit unions mostly rent core systems from a few vendors, so they're more exposed to a shared flaw than large banks running their own systems.

**What mass-event support looks like.** Rent, loans, utilities and late fees tend to get deferred within days. Food, gas and medicine can't be deferred, so cash only needs to cover those until payment systems come back.

## Scenario estimates (as of late Oct 2026)

These are rough guesses, not forecasts. The Manifold figures are from small markets that use play money, read in late October 2026; they move, and each market defines its event differently.

| # | Scenario | Window | Estimate | Anchor |
| --- | --- | --- | --- | --- |
| 1 | Your data shows up in a new breach | 12 months | 90%+ | Record 3,322 US data compromises in 2025 |
| 2 | Someone takes over one of your financial accounts | 12 months | 1–2% with good hygiene | ~6 million US victims in 2025, up 18%; ~70% of victims in one survey had reused passwords |
| 3 | One of your institutions is down a day or more from an attack | 18 months | 5–10% | 588 credit union cyber incidents reported May 2025–Apr 2026 |
| 4 | That outage lasts two weeks or more | 18 months | 2–3% | Patelco precedent |
| 5 | US banking disruption lasting days across many institutions | 18 months | 7–12% | Manifold: 37% a $100B+ bank is hacked using AI in 2026; 17–23% AI knocks a national payment system offline 2+ hours by end of 2027 |
| 6 | All of a person's separately-held accounts down at once for 2+ weeks | 18 months | 1–3% | Judgment |
| 7 | Global internet disruption of 2+ hours | Before 2028 | About 45% | Manifold, play money, about 35 participants (44% on 14 Nov 2026); counts accidental outages and an outage confined to China |
| 8 | Months of added friction: holds, in-person checks, restricted online features | 18 months | 30–50% | Banks restricting outside AI assistants |
| 9 | Online finance broadly unusable for months | 18 months | 1–3% | Judgment; no market prices this |

**Swing factor.** Open-weight models catching up on cyber offense. Metaculus pro forecasters put about 95% on an open-weight model matching Mythos on a cyber benchmark before July 2027; hadad puts 85% on open-weights Mythos-level cyber capability within 24 months. If that happens, rows 5, 6, 8 and 9 move up.

**Prediction markets.** Polymarket and Kalshi had no relevant markets as of late October 2026; real-money platforms favor events with clean resolution criteria. Manifold uses play money, its markets are thin (the bank-hack market had 18 traders), and each defines its event differently.

## Tripwires

These are the maintainer's own planning notes, not instructions. None of them is a reason to withdraw money because of a news headline. Stolen or leaked records, and the events on this site's news page, do not meet any of these signals. "Your bank has been hacked, move your money" is also the script of a common scam: no bank, agency or this site will ever tell you to move or withdraw money to keep it safe.

A signal only counts if the banks themselves or regulators confirm it.

| Signal | What the maintainer would consider |
| --- | --- |
| Banks you use, or several banks in your own country, have actually stopped card payments or withdrawals for more than a day, confirmed by the banks or regulators | Check that the emergency cash and supplies you already planned for are in place; if they are, do nothing. Pay bills due soon; download your latest statements; treat every "your bank was affected, verify your account" message as a scam |
| An attack freezes a major bank or broker for more than a few days | Review whether your day-to-day spending money sits at more than one institution |
| An ATM or card network is down for a day or more in your own area, confirmed by the operator | Use the emergency cash you already hold; top up to your planned amount, and no more, once machines work again |
| Fraud guarantees start getting denied or stalled at scale | Keep near-term money in bank accounts and on cards, where protections are legal rights rather than company discretion |
| A custodian or clearinghouse reports corrupted account records | Refresh offline statements |

**Capital controls precedent.** In June 2015 Greece closed its banks for three weeks and capped cash withdrawals at €60 a day from the first day. Limits on withdrawals, gradually loosened, lasted more than three years; limits on cash withdrawals inside Greece ended in October 2018. The driver was a debt crisis and fear of leaving the euro, not a cyberattack, and the Fed can supply dollars in a way Greece couldn't supply euros. It is not a guide to what a cyberattack would do.

## Expert and institutional views

- **IMF (Oct 2026):** names a major cyberattack as one of three plausible near-term triggers for market turmoil, alongside an AI-related correction and rising bond yields.
- **Financial Stability Board:** told G20 finance ministers to prepare for attacks causing simultaneous disruption across multiple firms or shared technology.
- **Bank of America** put about 4,000 people on fixing flaws found by frontier AI models.
- **Dario Amodei (Sep 2026)** warned an AI-agent swarm might be able to take over the internet with a persistent botnet within 6–12 months; security professionals quoted by Axios called that far-fetched.
- **Vulnerability volume:** newly published flaw records (CVE records) nearly tripled from January to August 2026 and nearly quadrupled by October (4,302 in January, 12,257 in August, 17,050 in October, counted from the CVE Program's public list on 13 Nov 2026). Counts differ by source: Google's threat team counted 5,045 in January and about a doubling by August. About half of AI-found vulnerabilities allow remote code execution; yet only about 0.23% of 2026's disclosed vulnerabilities had been seen exploited (Google's figure, as of October 2026).

## Considered and rejected

| Idea | Why not |
| --- | --- |
| Physical gold | Only helps if the dollar system fails; useless for groceries in an outage; home insurance typically covers very little of it (about $200 is a common limit) |
| Choosing banks for deposit insurance | Insurance covers failure, not hacked accounts |
| Crypto or self-custody | Irreversible theft; individuals are weaker defenders than large custodians |
| A large cash pile | Uninsured above ~$200; earns nothing; only covers a ~1–3% tail |
| A real-time news monitor | Events needing same-day action are headline news; slow-moving changes don't need speed |

## Sources

- [The Hackening](https://www.lesswrong.com/posts/iqgZaJMnmyDCYfnuC/the-hackening-1), Zvi
- [On Open-Weights Mythos Capabilities](https://www.lesswrong.com/posts/wJunGnpY3qACWSvnh/on-open-weights-mythos-capabilities), hadad
- [Regulation E training](https://www.mcun.coop/wp-content/uploads/2025/07/Regulation-E_Session_2.pdf), Michigan Credit Union League
- [Error Resolution Under Regulation E](https://www.consumercomplianceoutlook.org/articles/2025/third-issue-2025/error-resolution-under-regulation-e-examiner-insights-and-common-violations), Consumer Compliance Outlook
- [Fidelity Customer Protection Guarantee](https://www.fidelity.com/security/customer-protection-guarantee)
- [SIPC insurance](https://www.nerdwallet.com/investing/learn/sipc-insurance-what-it-does-and-does-not-protect), NerdWallet; [The SIPC Fund](https://www.sipc.org/about-sipc/the-sipc-fund)
- [Patelco restores most banking services](https://www.kqed.org/news/11994012/patelco-restores-most-banking-services-weeks-after-massive-ransomware-attack), KQED
- [CDK says substantially all dealerships restored](https://www.bloomberg.com/news/articles/2024-07-02/cdk-says-substantially-all-car-dealership-systems-back-online-after-hack), Bloomberg
- [60 credit unions facing outages](https://www.cybersecuritydive.com/news/credit-unions-outages-ransomware/701442/), Cybersecurity Dive
- [Synapse savings vanish](https://www.nbcnews.com/business/consumer/-no-money-thousands-americans-see-savings-vanish-synapse-fintech-crisi-rcna181419), NBC News
- [Sheltered Harbor announces planned wind-down](https://www.fsisac.com/who-we-are/sheltered-harbor), FS-ISAC
- [2026 Cybersecurity and Credit Union System Resilience Report](https://ncua.gov/news/publication-search/cybersecurity/2026-cybersecurity-and-credit-union-system-resilience-report), NCUA
- [Identity Theft Statistics for 2026](https://www.swif.ai/blog/identity-theft-statistics), Swif
- [Account takeover: 6 million victims in 2025](https://allaboutcookies.org/account-takeover-costliest-fraud-type), All About Cookies
- [The vulnerabilities AI finds are the ones attackers want](https://www.helpnetsecurity.com/2026/10/01/google-ai-discovered-vulnerabilities-remote-code-execution/), Help Net Security
- [CVE 2026 guide](https://www.dexpose.io/cve-2026/), Dexpose; [CVE List](https://github.com/CVEProject/cvelistV5), CVE Program (monthly counts)
- [GFSR press briefing, October 2026](https://imf.org/en/news/articles/2026/10/13/tr-101326-press-briefing-transcript-global-financial-stability-report-annual-meetings-2026), IMF
- [FSB warning on AI cyberattacks](https://www.nakedcapitalism.com/2026/09/ai-cyber-attacks-are-now-the-biggest-threat-to-the-financial-system-warns-bank-of-england-governor.html), via Naked Capitalism
- [G7 to war-game AI cyberattacks on banks](https://www.insurancebusinessmag.com/us/news/industry-news/g7-to-wargame-ai-cyberattacks-on-banks-as-regulators-sound-systemic-alarm-593896.aspx), Insurance Business
- [After 3 years, Greece ends limits on bank cash withdrawals](https://www.foxbusiness.com/markets/after-3-years-greece-ends-limits-on-bank-cash-withdrawals), Fox Business/AP
- [Anthropic CEO warns agent swarms could take over the internet](https://forkast.news/anthropic-ceo-warns-agent-swarms-could-take-over-the-internet-within-12-months/), Forkast; [The agents that could take over the internet — or not](https://www.axios.com/2026/09/15/anthropic-dario-ai-agents-safety-botnet), Axios
- [Forecasting the fallout from the Hugging Face incident](https://metaculus.substack.com/p/forecast-hugging-face-incident-openai-breach-cyberattack), Metaculus
- Manifold: [major bank hacked by AI in 2026](https://manifold.markets/Leopoldsleverageconsultan/will-a-major-bank-get-hacked-by-ai), [AI takes down a payment system by 2027](https://manifold.markets/brod/ai-takes-down-a-major-payment-syste), [massive internet outage before 2028](https://manifold.markets/Plant/will-there-be-a-massive-internet-ou)
