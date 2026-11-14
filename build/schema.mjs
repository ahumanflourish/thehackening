// Schemas for the data files, and the validator the build runs before rendering.
// A field spec is { type, required?, enum?, of?, fields? }.

const str = (required = false) => ({ type: 'string', required });
const bool = () => ({ type: 'boolean' });
const date = (required = false) => ({ type: 'date', required });
const en = (values, required = true) => ({ type: 'string', required, enum: values });
const list = (of) => ({ type: 'list', of });
const obj = (fields) => ({ type: 'object', fields });

const link = obj({ title: str(true), url: { type: 'url', required: true } });
const ids = list({ type: 'string' });

export const ENUMS = {
  threat_model: ['personal', 'institutional', 'crypto', 'infrastructure'],
  advice_kind: ['action', 'know', 'skip'],
  confidence: ['established', 'reasoned', 'speculative'],
  review_status: ['unreviewed', 'expert_reviewed'],
  incident_kind: ['current', 'precedent'],
  incident_type: ['outage', 'overload', 'lockout', 'heist', 'crypto-theft', 'devices', 'software-flaw', 'supplier', 'one-to-many', 'agents', 'breakout', 'data-theft', 'records-lost', 'advisory'],
  ai_stage: ['discovery', 'attack', 'agent_behavior'],
  ai_level: ['confirmed', 'suspected', 'unlikely', 'unknown'],
  question_status: ['open', 'partly_answered', 'answered'],
};

export const SCHEMAS = {
  advice: {
    id: str(true),
    threat_model: en(ENUMS.threat_model),
    title: str(true),
    kind: en(ENUMS.advice_kind),
    tier: { type: 'tier' },
    rank: { type: 'count' },
    time: str(),
    money: str(),
    covers: { ...list({ type: 'string', enum: ENUMS.threat_model }), required: true },
    short: str(true),
    advice: str(true),
    steps: list(obj({ do: str(true), detail: str(), url: { type: 'url' }, link: str() })),
    why: str(true),
    protects_against: str(true),
    cost: str(),
    confidence: en(ENUMS.confidence),
    confidence_note: str(),
    review_status: en(ENUMS.review_status),
    reviews: list(obj({ name: str(true), background: str(true), profile: { type: 'url' }, date: date(true), scope: str(true) })),
    sides: obj({ for: str(true), against: str(true), synthesis: str(true) }),
    sources: list(link),
    thread_refs: list(obj({ author: str(true), url: { type: 'url', required: true }, note: str() })),
    needs_source: bool(),
    checklist: bool(),
    checklist_text: str(),
    updated: date(true),
  },
  incidents: {
    id: str(true),
    date: date(true),
    title: str(true),
    kind: en(ENUMS.incident_kind),
    type: en(ENUMS.incident_type, false),
    count: obj({ total: { type: 'count', required: true }, hit: { type: 'count', required: true }, spread: en(['scatter', 'run']), caption: str(true) }),
    summary: str(true),
    impact: str(),
    ai_involvement: {
      ...list(obj({ stage: en(ENUMS.ai_stage), level: en(ENUMS.ai_level), note: str() })),
      required: true,
    },
    related_advice: ids,
    sources: list(link),
    needs_research: bool(),
    updated: date(),
  },
  questions: {
    id: str(true),
    question: str(true),
    asked_by: list(obj({ author: str(true), url: { type: 'url', required: true } })),
    status: en(ENUMS.question_status),
    current_best_answer: str(),
    sources: list(link),
    related_advice: ids,
  },
  basics: {
    id: str(true),
    title: str(true),
    url: { type: 'url', required: true },
    what_it_covers: str(true),
    commentary: str(true),
  },
};

function checkValue(value, spec, path, errors) {
  switch (spec.type) {
    case 'string':
      if (typeof value !== 'string' || !value.trim()) return errors.push(`${path}: expected non-empty text`);
      if (spec.enum && !spec.enum.includes(value))
        errors.push(`${path}: "${value}" is not one of ${spec.enum.join(' | ')}`);
      return;
    case 'url':
      if (typeof value !== 'string' || !/^https?:\/\/\S+$/.test(value))
        errors.push(`${path}: expected an http(s) URL`);
      return;
    case 'date':
      if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || isNaN(Date.parse(value)))
        errors.push(`${path}: expected a date as YYYY-MM-DD`);
      return;
    case 'count':
      if (!Number.isInteger(value) || value < 0 || value > 5000) errors.push(`${path}: expected a whole number from 0 to 5000`);
      return;
    case 'tier':
      if (![1, 2, 3].includes(value)) errors.push(`${path}: expected 1, 2 or 3`);
      return;
    case 'boolean':
      if (typeof value !== 'boolean') errors.push(`${path}: expected true or false`);
      return;
    case 'list':
      if (!Array.isArray(value)) return errors.push(`${path}: expected a list`);
      value.forEach((v, i) => checkValue(v, spec.of, `${path}[${i}]`, errors));
      return;
    case 'object':
      return checkObject(value, spec.fields, path, errors);
  }
}

function checkObject(value, fields, path, errors) {
  if (value === null || typeof value !== 'object' || Array.isArray(value))
    return errors.push(`${path}: expected a set of fields`);
  for (const [key, spec] of Object.entries(fields)) {
    const present = value[key] !== undefined && value[key] !== null;
    if (!present) {
      if (spec.required) errors.push(`${path}: missing required field "${key}"`);
      continue;
    }
    checkValue(value[key], spec, `${path}.${key}`, errors);
  }
  for (const key of Object.keys(value))
    if (!(key in fields)) errors.push(`${path}: unknown field "${key}"`);
}

/** Validate all data files. Returns a list of error strings (empty when valid). */
export function validate(data) {
  const errors = [];
  for (const [file, fields] of Object.entries(SCHEMAS)) {
    const rows = data[file];
    if (!Array.isArray(rows)) {
      errors.push(`${file}.yaml: expected a list of items`);
      continue;
    }
    const seen = new Set();
    rows.forEach((row, i) => {
      const path = `${file}.yaml › ${row?.id ?? `item ${i + 1}`}`;
      checkObject(row, fields, path, errors);
      if (row?.id) {
        if (!/^[a-z0-9-]+$/.test(row.id)) errors.push(`${path}: id must be lowercase letters, digits and hyphens`);
        if (seen.has(row.id)) errors.push(`${path}: duplicate id`);
        seen.add(row.id);
      }
    });
  }
  if (errors.length) return errors;

  // Rules that span fields or files.
  const adviceIds = new Set(data.advice.map((a) => a.id));
  for (const a of data.advice) {
    const path = `advice.yaml › ${a.id}`;
    if (a.kind === 'action' && !(a.tier && a.time && a.money))
      errors.push(`${path}: action items need tier, time and money`);
    if (a.kind === 'action' && !a.rank) errors.push(`${path}: action items need a rank`);
    for (const st of a.steps ?? []) {
      if (!st.url) continue;
      const h = new URL(st.url).hostname;
      const ok = (data.site?.step_link_domains ?? []).some((d) => h === d || h.endsWith(`.${d}`));
      if (!ok) errors.push(`${path}: step link host "${h}" is not on step_link_domains in site.yaml`);
      if (!st.url.startsWith('https://')) errors.push(`${path}: step links must use https`);
    }
    if (a.checklist && !a.checklist_text) errors.push(`${path}: checklist: true needs checklist_text`);
    if (a.review_status === 'expert_reviewed' && !a.reviews?.length)
      errors.push(`${path}: expert_reviewed needs at least one entry under reviews`);
    if (a.confidence === 'established' && !a.sources?.length && !a.needs_source)
      errors.push(`${path}: established items need a source, or needs_source: true`);
  }
  for (const file of ['incidents', 'questions'])
    for (const row of data[file])
      for (const ref of row.related_advice ?? [])
        if (!adviceIds.has(ref)) errors.push(`${file}.yaml › ${row.id}: related_advice "${ref}" is not an advice id`);

  for (const c of data.charts ?? []) {
    const path = `charts.yaml › ${c?.id ?? '?'}`;
    for (const k of ['id', 'title', 'takeaway', 'unit', 'as_of']) if (!c?.[k]) errors.push(`${path}: missing required field "${k}"`);
    if (!c?.source?.title || !c?.source?.url) errors.push(`${path}: source needs title and url`);
    if (!Array.isArray(c?.points) || !c.points.length) errors.push(`${path}: points must be a non-empty list`);
    else for (const pt of c.points)
      if (!/^\d{4}-\d{2}$/.test(String(pt.month)) || typeof pt.value !== 'number') errors.push(`${path}: each point needs month (YYYY-MM) and a numeric value`);
  }
  const incidentIds = new Set(data.incidents.map((i) => i.id));
  for (const ex of data.site?.home?.examples ?? [])
    if (!incidentIds.has(ex.incident)) errors.push(`site.yaml: home example "${ex.incident}" is not an incident id`);
  // The home page shows only examples of the threat itself: AI involvement must be confirmed or suspected.
  for (const ex of data.site?.home?.examples ?? []) {
    const inc = data.incidents.find((i) => i.id === ex.incident);
    const levels = (inc?.ai_involvement ?? []).filter((r) => r.stage !== 'discovery').map((r) => r.level);
    if (inc && !levels.some((l) => l === 'confirmed' || l === 'suspected'))
      errors.push(`site.yaml: home example "${ex.incident}" has no confirmed or suspected AI involvement, so it does not belong on the home page`);
  }

  const models = new Set((data.site?.threat_models ?? []).map((m) => m.id));
  for (const m of ENUMS.threat_model)
    if (!models.has(m)) errors.push(`site.yaml: threat_models is missing "${m}"`);
  return errors;
}
