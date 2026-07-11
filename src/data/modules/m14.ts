// Module 14 — Hacking Web Applications (Day 6)
// Enterprise mission: GFS Corporate Banking web app (transfers, approvals, reports).
// Concepts: (1) Authentication & Session Attacks, (2) Business Logic Abuse with AI-Guided Fuzzing.

export const M14_SCENARIO = {
  client: "Global Financial Services — Corporate Banking Portal",
  assessment: "Grey-box Application Security Assessment",
  scope: "Authenticated + unauthenticated testing of corporate.gfs-bank.example · low-privilege test accounts provided · no data exfil beyond proof · no destructive writes",
  available: [
    "2 test accounts: analyst (view-only) and approver (dual-control)",
    "Swagger/OpenAPI spec of the internal API (via bug-bounty scope)",
    "Change-window: Sat 22:00–02:00, weekly",
  ],
  outcome: "Web Application Security Report — auth flaws, session weaknesses, IDOR/business-logic findings, and prioritised remediation with dev-team owners",
  why: "Corporate banking is where dual-control, transfer limits, and beneficiary approvals live. A single business-logic gap here — approving your own transfer, replaying a token, bypassing a limit — is a direct fraud channel, not just a compliance finding.",
};

export const M14_WORKFLOW = [
  { tool: "Auth flow mapping (Burp/ZAP)", finding: "Every login/step-up/password-reset endpoint + tokens issued", exposure: "Weak MFA (SMS-only), predictable reset tokens, no rate limit", opportunity: "Credential stuffing, SIM-swap takeover, token brute force", risk: "Account takeover of approvers → full transfer authority", recommendation: "Enforce phishing-resistant MFA (FIDO2); rate-limit reset; use single-use signed reset tokens" },
  { tool: "Session cookie audit", finding: "Cookie flags (HttpOnly, Secure, SameSite), scope, lifetime, rotation", exposure: "Missing SameSite=Lax/Strict, long-lived tokens, no rotation on privilege change", opportunity: "CSRF, session fixation, replay after logout", risk: "Silent takeover of active corporate sessions", recommendation: "SameSite=Lax minimum; rotate on login/step-up; short access-token TTL + refresh; server-side revocation list" },
  { tool: "IDOR sweep (Burp Autorize)", finding: "Object references (userId, accountId, transferId) in URLs & bodies", exposure: "Approver 'A' can read/modify approver 'B' pending transfers", opportunity: "Cross-tenant data access; unauthorised approval", risk: "Fraudulent transfer approval; regulatory breach", recommendation: "Server-side authorisation on every object (never trust client-supplied IDs); use unguessable ULIDs; add per-tenant scope checks" },
  { tool: "AI-guided input fuzzing", finding: "Fields that accept unexpected types/lengths/encodings", exposure: "Integer overflow on transfer amount; unicode normalisation on beneficiary name", opportunity: "Bypass client-side limit; identity-collision attacks", risk: "Fraudulent value transfer; sanctioned-name evasion", recommendation: "Server-side validation with strict schemas; unicode normalisation at ingest; monetary values as decimal, not float" },
  { tool: "Business-logic flow modelling", finding: "State transitions in transfer/approval/beneficiary lifecycle", exposure: "Self-approval possible if approver == initiator; race on limit check + submit", opportunity: "Bypass dual-control; TOCTOU limit bypass", risk: "Direct fraud with no anomalous credential event", recommendation: "Enforce SoD server-side; use DB-level constraints; make limit-check and commit atomic (row lock / transaction)" },
];

export const M14_ANALYST_FRAMEWORK = [
  {
    observation: "POST /api/transfer accepts `initiator_id` in the body and does not cross-check against the authenticated session.",
    finding: "Any authenticated user can submit a transfer as any other user.",
    exposure: "Full transfer initiation on behalf of arbitrary accounts.",
    opportunity: "Attacker submits transfer as initiator, then approves it from their own account — dual-control defeated.",
    risk: "Direct fraud pathway with no credential compromise required.",
    recommendation: "Ignore client-supplied `initiator_id`; derive from session; enforce initiator≠approver at DB level.",
  },
  {
    observation: "Reset tokens are 6-digit numeric with 15-minute TTL and no lockout after failed attempts.",
    finding: "Reset codes brute-forceable in under 5 minutes at 200 req/s.",
    exposure: "Any account with known email is a 5-minute takeover.",
    opportunity: "Mass-takeover of approver population using leaked email lists.",
    risk: "Wholesale account compromise; regulatory disclosure event.",
    recommendation: "Move to signed, single-use, 128-bit URL tokens; 5-attempt lockout; alert on ≥3 failed resets.",
  },
];

export const M14_GUIDED = [
  {
    topic: "Authentication attacks (stuffing, spraying, MFA fatigue)",
    look: "Login endpoint rate limits, MFA enrolment defaults, push-notification approval UX, response timing differences on valid vs invalid usernames.",
    expected: "Regulated banking should default to phishing-resistant MFA (FIDO2/passkey) with number-matching for push; response times constant regardless of username validity.",
    mistakes: "Relying on CAPTCHA alone. SMS-only MFA. Enabling push-approval without number-matching.",
    attackers: "Spray common passwords across the tenant; fatigue-bomb approvers at 3 AM; enumerate valid usernames via timing.",
    defenders: "Behavioural rate limiting per IP+username+ASN; passkey rollout; alert on push-approval bursts.",
  },
  {
    topic: "Session management (fixation, rotation, revocation)",
    look: "Session ID before/after login, before/after privilege change, cookie attributes, revocation behaviour on logout and password change.",
    expected: "New session ID issued on login and step-up; server-side revocation on logout; refresh-token rotation with reuse detection.",
    mistakes: "Rotating access token but not session cookie. Logout that only deletes the client cookie.",
    attackers: "Steal cookie via XSS or MITM → replay after user 'logs out' because server never invalidated.",
    defenders: "Server-side session store with explicit revocation; refresh-token reuse detection triggers full family revoke.",
  },
  {
    topic: "IDOR / broken object-level authorisation",
    look: "Any request containing an ID (query, path, body, header). Compare responses across two accounts with the same object reference.",
    expected: "Server always re-checks: does the authenticated principal have permission on this object in this tenant, for this action?",
    mistakes: "Checking ownership only in the list endpoint but not the detail endpoint. Trusting a JWT claim that the client can influence.",
    attackers: "IDOR is the #1 real-world web app finding — cheap, quiet, high-impact.",
    defenders: "Centralise authorisation in a policy layer; add automated Autorize-style regression tests to CI.",
  },
  {
    topic: "Business-logic abuse (race conditions, SoD bypass, limit evasion)",
    look: "Transfer amounts, approval workflows, limit-check timing, retry semantics, idempotency keys.",
    expected: "Limit check + commit inside a single DB transaction with row lock; idempotency keys enforced; SoD constraints at DB level.",
    mistakes: "Client-side limit checks. Approval endpoint that trusts a 'status=approved' field from the request body.",
    attackers: "Fire N concurrent 'transfer 1000' requests when limit is 5000 — TOCTOU wins → 10,000 leaves the account.",
    defenders: "Row-level locking; monetary decimals; anomaly detection on rapid-fire small transfers.",
  },
];

export const M14_INCIDENTS = [
  { org: "US financial services firm (2019, ATO wave)", method: "Credential stuffing + SMS-MFA bypass via SIM swap", recon: "Enumeration of the login endpoint; identification of SMS as sole 2FA", impact: "Millions in fraudulent transfers; class-action settlement", lesson: "SMS-only MFA on a money-moving app is a foreseeable failure mode." },
  { org: "First American Financial (2019)", method: "IDOR on document viewer — sequential numeric IDs, no auth check", recon: "One authenticated request revealed the numbering scheme", impact: "885M sensitive mortgage records exposed", lesson: "Any object reference must be authorised server-side, on every request, for every action." },
  { org: "Robinhood (2021)", method: "Business-logic + social engineering against support staff", recon: "Enumeration of the support-tool workflow via LinkedIn", impact: "7M customer records; regulatory scrutiny", lesson: "Application security includes the internal support tool — attackers will follow the path of least resistance." },
];

export const M14_DELIVERABLES = [
  { id: "scope", label: "Scope + test accounts + change window confirmed" },
  { id: "authmap", label: "Authentication & session flow map" },
  { id: "cookies", label: "Cookie / token attribute audit table" },
  { id: "idor", label: "IDOR sweep results (endpoint × role matrix)" },
  { id: "fuzz", label: "AI-guided input fuzzing findings" },
  { id: "logic", label: "Business-logic abuse cases (numbered, reproducible)" },
  { id: "chain", label: "Exploit-path narrative → fraud outcome" },
  { id: "owners", label: "Findings mapped to dev-team owners + Jira IDs" },
  { id: "plan", label: "Remediation plan with SLAs by severity" },
  { id: "exec", label: "Executive summary framing fraud risk in £" },
];

export const M14_AI_ACTIONS = [
  { id: "analyze", label: "Analyze Findings", output: "23 endpoints tested; 6 IDOR (2 critical — approver-scoped), 1 self-approval bypass on /api/transfer, 1 brute-forceable reset flow, 3 missing SameSite. Two findings each cross a threshold that under the bank's own risk matrix mandates same-day notification to the CRO." },
  { id: "correlate", label: "Correlate Evidence", output: "The self-approval bypass and the IDOR on /api/pending-approvals compose into a full dual-control defeat: attacker submits a transfer as User A (IDOR), then approves it as themselves. No credential compromise, no anomalous login — pure logic flaw." },
  { id: "assess", label: "Generate Assessment", output: "Application security posture: BELOW REGULATORY EXPECTATION for a corporate banking product. Auth surface adequate; authorisation and workflow surface materially weak. Risk is concentrated in silent-fraud paths, not credential compromise." },
  { id: "recommend", label: "Generate Recommendations", output: "Priority 1 (≤72h — hotfix): Ignore client-supplied initiator_id; DB constraint initiator≠approver. Priority 2 (≤14d): Centralise authorisation in a policy layer; add Autorize regression to CI. Priority 3 (≤60d): FIDO2 rollout for approvers; refresh-token reuse detection; monetary anomaly detection on rapid small transfers." },
  { id: "exec", label: "Executive Summary", output: "GFS Corporate Banking currently allows a single authenticated user to defeat dual-control on transfers with no exceptional privileges. This is a direct fraud channel that would not appear in credential-based anomaly monitoring. The primary fix is a two-line server-side change plus a database constraint — hours of work, not weeks. The wider authorisation model needs one sprint of consolidation." },
];

export const M14_SLUG = "hacking-web-applications";
