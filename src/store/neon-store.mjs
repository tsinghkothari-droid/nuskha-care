import { neon } from "@neondatabase/serverless";
import { config } from "../config.mjs";
import { createId } from "./ids.mjs";

let sqlClient;

export function getNeonSql() {
  if (!config.databaseUrl) {
    throw new Error("DATABASE_URL is required for Neon store");
  }
  if (!sqlClient) {
    sqlClient = neon(config.databaseUrl);
  }
  return sqlClient;
}

export async function getOrCreateFamily(inbound) {
  const sql = getNeonSql();
  const phone = inbound.phone || inbound.remoteJid || "unknown";
  const id = `fam_${phone}`;
  const rows = await sql`
    INSERT INTO families (id, phone, language, child_language)
    VALUES (${id}, ${phone}, ${config.defaultLanguage}, 'en')
    ON CONFLICT (phone) DO UPDATE SET updated_at = now()
    RETURNING *
  `;
  return fromFamilyRow(rows[0]);
}

export async function hasProcessedMessage(messageId) {
  if (!messageId) return false;
  const rows = await getNeonSql()`SELECT message_id FROM inbound_messages WHERE message_id = ${messageId}`;
  return rows.length > 0;
}

export async function markMessageProcessed({ messageId, familyId, source }) {
  if (!messageId) return null;
  await getNeonSql()`
    INSERT INTO inbound_messages (message_id, family_id, source)
    VALUES (${messageId}, ${familyId}, ${source || "unknown"})
    ON CONFLICT (message_id) DO NOTHING
  `;
  return { messageId, familyId };
}

export async function recordConsent(family, consent = {}) {
  const acceptedAt = new Date().toISOString();
  await getNeonSql()`
    UPDATE families SET consent = true, updated_at = now() WHERE id = ${family.id}
  `;
  await getNeonSql()`
    INSERT INTO consents (id, family_id, message_id, language, template_version, accepted_at)
    VALUES (${createId("consent")}, ${family.id}, ${consent.messageId || null}, ${consent.language || family.language}, ${consent.templateVersion || "consent-l1"}, ${acceptedAt})
  `;
  return { ...family, consent: true, consentRecord: { acceptedAt, language: consent.language || family.language, templateVersion: consent.templateVersion || "consent-l1" } };
}

export async function writeAuditEvent(event) {
  const item = {
    id: createId("audit"),
    at: new Date().toISOString(),
    ...event
  };
  const { id, at, familyId, type, source = "unknown", ...payload } = item;
  await getNeonSql()`
    INSERT INTO audit_events (id, family_id, type, source, payload, at)
    VALUES (${id}, ${familyId || null}, ${type}, ${source}, ${JSON.stringify(payload)}, ${at})
  `;
  return item;
}

export async function createReviewTask(task) {
  const item = {
    id: createId("review"),
    status: "open",
    createdAt: new Date().toISOString(),
    ...task
  };
  await getNeonSql()`
    INSERT INTO review_tasks (id, family_id, message_id, queue, status, payload)
    VALUES (${item.id}, ${item.familyId}, ${item.messageId}, ${item.queue}, ${item.status}, ${JSON.stringify(item)})
  `;
  return item;
}

export async function listReviewTasks({ queue, status = "open" } = {}) {
  const sql = getNeonSql();
  const rows = queue
    ? await sql`SELECT * FROM review_tasks WHERE queue = ${queue} AND status = ${status} ORDER BY created_at ASC`
    : await sql`SELECT * FROM review_tasks WHERE status = ${status} ORDER BY created_at ASC`;
  return rows.map(fromReviewRow);
}

export async function getReviewTask(id) {
  const rows = await getNeonSql()`SELECT * FROM review_tasks WHERE id = ${id}`;
  return rows[0] ? fromReviewRow(rows[0]) : null;
}

export async function updateReviewTask(id, updates = {}) {
  const current = await getReviewTask(id);
  if (!current) return null;
  const next = { ...current, ...updates, updatedAt: new Date().toISOString() };
  await getNeonSql()`
    UPDATE review_tasks SET status = ${next.status}, payload = ${JSON.stringify(next)}, updated_at = now()
    WHERE id = ${id}
  `;
  return next;
}

export async function recordCorrection({ taskId, reviewerId, before, after }) {
  const item = { id: createId("correction"), taskId, reviewerId, before, after, createdAt: new Date().toISOString() };
  await getNeonSql()`
    INSERT INTO pharmacist_corrections (id, review_task_id, reviewer_id, before_payload, after_payload)
    VALUES (${item.id}, ${taskId}, ${reviewerId || null}, ${JSON.stringify(before)}, ${JSON.stringify(after)})
  `;
  return item;
}

export async function updateFamilyMemory(family) {
  return family;
}

export async function recordVoiceNote(voice) {
  const item = { id: createId("voice"), createdAt: new Date().toISOString(), ...voice };
  await getNeonSql()`
    INSERT INTO voice_notes (id, family_id, review_task_id, provider, language, script, object_key, media_url)
    VALUES (${item.id}, ${item.familyId}, ${item.reviewTaskId || null}, ${item.provider}, ${item.language}, ${item.script}, ${item.objectKey || null}, ${item.mediaUrl || null})
  `;
  return item;
}

export async function recordDelivery(delivery) {
  const item = { id: createId("delivery"), createdAt: new Date().toISOString(), ...delivery };
  await getNeonSql()`
    INSERT INTO deliveries (id, family_id, review_task_id, provider, status, provider_message_id, retry_count, failure_reason, payload)
    VALUES (${item.id}, ${item.familyId}, ${item.reviewTaskId || null}, ${item.provider}, ${item.status}, ${item.providerMessageId || null}, ${item.retryCount || 0}, ${item.failureReason || null}, ${JSON.stringify(item.payload || {})})
  `;
  return item;
}

export async function getDebugState() {
  return { provider: "neon" };
}

function fromFamilyRow(row) {
  return {
    id: row.id,
    phone: row.phone,
    language: row.language,
    childLanguage: row.child_language,
    consent: row.consent,
    activeMedicines: row.active_medicines || [],
    labTrends: row.lab_trends || [],
    allergies: row.allergies || [],
    doctors: row.doctors || []
  };
}

function fromReviewRow(row) {
  return {
    ...row.payload,
    id: row.id,
    queue: row.queue,
    status: row.status,
    lockedBy: row.locked_by,
    lockedAt: row.locked_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

