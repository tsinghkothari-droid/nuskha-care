CREATE TABLE IF NOT EXISTS families (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  language TEXT NOT NULL DEFAULT 'hi',
  child_language TEXT NOT NULL DEFAULT 'en',
  consent BOOLEAN NOT NULL DEFAULT false,
  active_medicines JSONB NOT NULL DEFAULT '[]'::jsonb,
  lab_trends JSONB NOT NULL DEFAULT '[]'::jsonb,
  allergies JSONB NOT NULL DEFAULT '[]'::jsonb,
  doctors JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inbound_messages (
  message_id TEXT PRIMARY KEY,
  family_id TEXT REFERENCES families(id),
  source TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consents (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES families(id),
  message_id TEXT,
  language TEXT NOT NULL,
  template_version TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES families(id),
  message_id TEXT NOT NULL,
  doc_type TEXT NOT NULL,
  object_key TEXT,
  content_type TEXT,
  checksum TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS extractions (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES families(id),
  document_id TEXT REFERENCES documents(id),
  provider TEXT NOT NULL,
  payload JSONB NOT NULL,
  confidence NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS risk_decisions (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES families(id),
  message_id TEXT NOT NULL,
  path TEXT NOT NULL,
  rule_version TEXT NOT NULL,
  reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS review_tasks (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES families(id),
  message_id TEXT NOT NULL,
  queue TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  payload JSONB NOT NULL,
  locked_by TEXT,
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pharmacist_corrections (
  id TEXT PRIMARY KEY,
  review_task_id TEXT NOT NULL REFERENCES review_tasks(id),
  reviewer_id TEXT,
  before_payload JSONB NOT NULL,
  after_payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS voice_notes (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES families(id),
  review_task_id TEXT REFERENCES review_tasks(id),
  provider TEXT NOT NULL,
  language TEXT NOT NULL,
  script TEXT NOT NULL,
  object_key TEXT,
  media_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deliveries (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES families(id),
  review_task_id TEXT REFERENCES review_tasks(id),
  provider TEXT NOT NULL,
  status TEXT NOT NULL,
  provider_message_id TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  failure_reason TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  family_id TEXT,
  type TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'unknown',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_review_tasks_queue_status ON review_tasks(queue, status);
CREATE INDEX IF NOT EXISTS idx_audit_events_family_at ON audit_events(family_id, at DESC);
