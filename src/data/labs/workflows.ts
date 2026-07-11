// Assessment Workflow Engine — enterprise assessment lifecycle data.
// Each lab in modules 13–16 maps to a standardized workflow rendered by
// <AssessmentWorkflow /> in the lab sidebar. Reused fields = consistent UX.

export interface LabWorkflow {
  mission: string;             // e.g. "GFS-WS-001"
  businessUnit: string;        // e.g. "Digital Banking"
  context: string;             // 1-2 line enterprise context
  objective: string;           // what the assessor is trying to prove
  assets: string[];            // what's in scope for THIS lab
  workflow: string[];          // ordered assessment steps
  findings: string[];          // typical findings to look for
  exposure: string;            // what's exposed if finding is true
  attackOpportunity: string;   // what the attacker can do next
  businessRisk: string;        // impact in business language
  detection: string[];         // detection opportunities
  recommendations: string[];   // remediation actions
  validation: string;          // how to prove the fix works
  frameworks: {
    mitre: { id: string; name: string }[];
    killChain: string;         // Lockheed Martin phase
    nistCsf: string[];         // subcategories e.g. "PR.DS-2"
  };
  reports: {
    executive: string;         // 1-line executive summary
    technical: string;         // 1-line technical summary
  };
  lessons: string[];
}

const HARDENING_MITRE = [
  { id: "T1595.002", name: "Active Scanning: Vulnerability Scanning" },
  { id: "T1190", name: "Exploit Public-Facing Application" },
];

export const LAB_WORKFLOWS: Record<string, LabWorkflow> = {
  /* ═════════════ Module 13 — Web Server Assessment ═════════════ */
  "lab-m13-discovery": {
    mission: "GFS-WS-001",
    businessUnit: "Digital Banking",
    context:
      "A new Digital Banking web server has been deployed behind the retail CDN. Before production cut-over, verify what an unauthenticated attacker sees.",
    objective:
      "Fingerprint the exposed web stack (server software, banners, version) and confirm no version disclosure reaches the internet.",
    assets: [
      "portal.gfs-bank.example (public HTTPS)",
      "Reverse-proxy edge node",
      "Origin web server (Apache / Nginx / IIS)",
    ],
    workflow: [
      "Enumerate DNS + virtual hosts",
      "Pull HTTP response headers",
      "Inspect Server / X-Powered-By banners",
      "Probe risky methods (TRACE, OPTIONS)",
      "Confirm behavioural fingerprint matches banner",
    ],
    findings: [
      "Server header discloses exact software + version",
      "X-Powered-By reveals runtime (PHP/ASP.NET) version",
      "TRACE method accepted on production origin",
    ],
    exposure:
      "Full stack + patch surface is public. CVE lookup on the exact version returns weaponised exploits within minutes.",
    attackOpportunity:
      "Version → CVE feed → PoC → RCE on the host that terminates customer banking sessions.",
    businessRisk:
      "Direct compromise of a regulated banking front-door; regulatory notification (FCA/PRA) and material reputational damage.",
    detection: [
      "WAF signature on scanner user-agents",
      "Rate-based rules on /server-status, /server-info, /phpinfo",
      "SIEM alert on TRACE / OPTIONS from non-monitoring sources",
    ],
    recommendations: [
      "Strip Server + X-Powered-By at the reverse proxy",
      "Restrict HTTP methods to GET / POST / HEAD at the edge",
      "Move version-specific paths behind authenticated bastion",
    ],
    validation:
      "Re-run header capture — Server value must be generic or absent, X-Powered-By absent, TRACE returns 405.",
    frameworks: {
      mitre: [
        { id: "T1595.002", name: "Active Scanning: Vulnerability Scanning" },
        { id: "T1592.004", name: "Gather Victim Host Info: Client Configurations" },
      ],
      killChain: "reconnaissance",
      nistCsf: ["ID.AM-1", "ID.RA-1", "PR.IP-1"],
    },
    reports: {
      executive:
        "Public banking portal discloses exact stack + version; a single upstream CVE becomes an immediate exploitation path. Fixable in one sprint.",
      technical:
        "portal.gfs-bank.example returns Server + X-Powered-By with unhardened defaults; TRACE enabled. Strip at proxy, restrict verbs, re-test.",
    },
    lessons: [
      "Banners cost nothing to strip and remove a class of triage from every attacker.",
      "Behavioural fingerprints leak stack even after banners are removed — harden both.",
    ],
  },

  "lab-m13-headers": {
    mission: "GFS-WS-002",
    businessUnit: "Online Banking Portal",
    context:
      "Regulators expect the banking portal to ship a defined security-header baseline on every response. Verify the live baseline.",
    objective:
      "Confirm HSTS, CSP, X-Frame-Options, X-Content-Type-Options and Referrer-Policy are present and correctly configured.",
    assets: ["portal.gfs-bank.example", "api.gfs-bank.example", "Reverse-proxy header policy"],
    workflow: [
      "Capture headers on the login page",
      "Capture headers on an API JSON endpoint",
      "Assert each baseline header present",
      "Check HSTS max-age ≥ 15552000 with includeSubDomains",
      "Confirm CSP has no unsafe-inline / unsafe-eval",
    ],
    findings: [
      "HSTS missing or max-age too short",
      "CSP absent or overly permissive",
      "X-Frame-Options missing → clickjacking on transfer form",
    ],
    exposure:
      "Missing headers let attackers deliver payloads (XSS, clickjacking, MIME-sniff) that a hardened baseline would block for free.",
    attackOpportunity:
      "Stored XSS → session theft; clickjacking overlay → unauthorised transfer; MIME-sniff → drive-by upload execution.",
    businessRisk:
      "Fraudulent transfers executed inside authenticated sessions; loss + chargeback + regulator attention.",
    detection: [
      "CSP report-uri collecting policy violations",
      "SIEM rule on missing-header deploys via config-drift alerting",
    ],
    recommendations: [
      "Enforce baseline headers at the reverse proxy (single source of truth)",
      "HSTS: max-age=63072000; includeSubDomains; preload",
      "CSP: default-src 'self'; object-src 'none'; frame-ancestors 'none'",
      "Block deploys that regress the header baseline",
    ],
    validation:
      "All five headers present on every response, HSTS max-age ≥ 63072000, CSP violation count trending to zero.",
    frameworks: {
      mitre: [
        { id: "T1189", name: "Drive-by Compromise" },
        { id: "T1185", name: "Browser Session Hijacking" },
      ],
      killChain: "delivery",
      nistCsf: ["PR.DS-2", "PR.IP-1", "DE.CM-4"],
    },
    reports: {
      executive:
        "The banking portal is missing controls that browsers already ship for free. Fixing at the proxy closes several exploit classes at no cost.",
      technical:
        "Add HSTS, CSP, XFO, XCTO, Referrer-Policy at edge; enforce baseline via CI gate; monitor CSP reports.",
    },
    lessons: [
      "A header baseline is the cheapest exploit-class blocker available.",
      "Enforce at the edge, not per-app — one policy, one auditable place.",
    ],
  },

  "lab-m13-directory": {
    mission: "GFS-WS-003",
    businessUnit: "Digital Banking",
    context:
      "Legacy directories, backup files and metadata endpoints frequently outlive the projects that created them and re-appear on hardened hosts.",
    objective:
      "Enumerate robots.txt, security.txt, common hidden directories, backup files and default pages on the banking portal.",
    assets: ["Public HTTP tree of portal.gfs-bank.example", "/.well-known/*", "/robots.txt"],
    workflow: [
      "Fetch /robots.txt and parse Disallow lines",
      "Fetch /.well-known/security.txt",
      "Probe /admin, /backup, /server-status, /actuator",
      "Diff against expected-public path list",
      "Report every non-authenticated hit",
    ],
    findings: [
      "robots.txt discloses hidden admin paths",
      "Backup archive (.zip, .bak, .old) reachable without auth",
      "Spring Boot /actuator exposed with no authentication",
    ],
    exposure:
      "Every leaked path is a free lead: source disclosure, config exfiltration, credential harvest.",
    attackOpportunity:
      "Read /actuator/env → DB credentials; download /backup.zip → source + secrets; hit /admin → default creds.",
    businessRisk:
      "Full application compromise via a URL that was never intended to be public — audit finding + potential data-breach notification.",
    detection: [
      "WAF deny rules on /actuator, /server-status, /server-info",
      "Alert on requests for *.zip / *.bak / *.old under document root",
    ],
    recommendations: [
      "Remove disclosures from robots.txt (it's not a security control)",
      "Authenticate all admin surfaces; move dev tools off production",
      "Block metadata endpoints at the edge, not just in the app",
    ],
    validation:
      "Re-scan finds no unauthenticated /actuator, no backup archives, robots.txt lists only truly public routes.",
    frameworks: {
      mitre: [
        { id: "T1083", name: "File and Directory Discovery" },
        { id: "T1213", name: "Data from Information Repositories" },
      ],
      killChain: "reconnaissance",
      nistCsf: ["ID.RA-1", "PR.AC-4", "DE.CM-1"],
    },
    reports: {
      executive:
        "Forgotten URLs still work. A short scan surfaced administrative and backup paths that bypass the login form entirely.",
      technical:
        "Sanitise robots.txt, deny /actuator + backup extensions at edge, migrate dev tooling to bastion.",
    },
    lessons: [
      "robots.txt is a menu of hidden paths for attackers — treat it as documentation, not defence.",
      "Old backups outlive the projects that made them; scan for them explicitly.",
    ],
  },

  "lab-m13-tls": {
    mission: "GFS-WS-004",
    businessUnit: "Digital Banking",
    context:
      "The banking TLS surface is the customer's only visible trust signal. Weak crypto or leaky certificates undermine every control behind them.",
    objective:
      "Enumerate TLS versions, cipher suites, certificate issuer and SANs; flag weak crypto and internal-name disclosure.",
    assets: ["portal.gfs-bank.example:443", "api.gfs-bank.example:443", "Shared wildcard certificate"],
    workflow: [
      "Inspect the certificate (issuer, SANs, expiry, key type)",
      "Enumerate accepted TLS versions (must be 1.2+)",
      "List cipher suites (AEAD only)",
      "Check HSTS preload status",
      "Cross-reference SANs against internal-hostname policy",
    ],
    findings: [
      "TLS 1.0 / 1.1 still accepted",
      "Internal hostnames (corp-nginx01) present in public SAN",
      "Same cert deployed to portal + api + m + status (blast radius)",
    ],
    exposure:
      "Downgrade attacks against legacy clients, free internal-hostname map, and one key-compromise → whole fleet.",
    attackOpportunity:
      "MITM on legacy clients; internal recon from SAN list; single stolen key pivots to every customer-facing host.",
    businessRisk:
      "Customer session interception; internal network map handed to attackers; catastrophic key-rotation event if one host is compromised.",
    detection: [
      "CT-log monitoring for unexpected issuances of *.gfs-bank.example",
      "TLS version alert at edge (block <1.2)",
    ],
    recommendations: [
      "Enforce TLS 1.2+ only, AEAD ciphers only",
      "Issue per-service certificates; retire shared wildcard",
      "Remove internal hostnames from public SANs",
      "Enable HSTS preload once traffic is stable",
    ],
    validation:
      "Re-scan: no TLS<1.2, no internal names in SAN, per-service certs live, HSTS preload accepted.",
    frameworks: {
      mitre: [
        { id: "T1040", name: "Network Sniffing" },
        { id: "T1557", name: "Adversary-in-the-Middle" },
      ],
      killChain: "reconnaissance",
      nistCsf: ["PR.DS-2", "PR.AC-5", "DE.CM-4"],
    },
    reports: {
      executive:
        "One shared certificate protects the entire customer fleet and quietly publishes internal hostnames. Splitting the cert removes a single point of catastrophic failure.",
      technical:
        "Per-service certs, TLS 1.2+ enforced, SANs sanitised, HSTS preload requested.",
    },
    lessons: [
      "Certificates are recon assets — treat SAN lists as a public disclosure decision.",
      "Shared wildcards trade convenience for blast radius.",
    ],
  },

  "lab-m13-hardening": {
    mission: "GFS-WS-005",
    businessUnit: "Digital Banking",
    context:
      "Consolidate the four prior assessments into a single hardening report that the CISO can sign off on.",
    objective:
      "Prove that server banner, header baseline, exposed paths and TLS posture are all within regulated tolerance.",
    assets: ["All prior M13 assets"],
    workflow: [
      "Re-run headers + robots against the hardened target",
      "Confirm Server + X-Powered-By no longer disclose version",
      "Confirm HSTS + CSP + XFO all present",
      "Confirm no unauthenticated admin/backup surfaces",
      "Attach evidence to hardening report",
    ],
    findings: [
      "Baseline headers present on 100% of responses",
      "Version banners stripped",
      "Admin paths authenticated or denied at edge",
    ],
    exposure:
      "Residual exposure limited to fingerprintable behaviours (error pages, response timing) — accepted risk.",
    attackOpportunity:
      "Attacker must now spend real effort — automation-driven exploitation is no longer viable.",
    businessRisk:
      "Reduced to acceptable regulated-industry baseline; documented residual risk owned by CTO.",
    detection: [
      "Continuous config-drift alerting on the baseline",
      "Weekly external re-scan with diff to previous run",
    ],
    recommendations: [
      "Freeze baseline in CI — block deploys that regress",
      "Quarterly external re-assessment by an independent tester",
      "Annual TLS + cert rotation review",
    ],
    validation:
      "Independent re-test produces zero critical / high findings on the web tier.",
    frameworks: {
      mitre: HARDENING_MITRE,
      killChain: "reconnaissance",
      nistCsf: ["ID.GV-1", "PR.IP-1", "DE.CM-8", "RS.IM-1"],
    },
    reports: {
      executive:
        "The banking web tier now meets the internal hardening baseline. Continuous config-drift alerting keeps it there.",
      technical:
        "All four assessment areas closed to green; baseline enforced in CI; quarterly external re-test scheduled.",
    },
    lessons: [
      "Hardening is a state, not an event — enforce it in CI.",
      "Executive sign-off requires a single consolidated evidence pack, not four disconnected reports.",
    ],
  },

  /* ═════════════ Module 14 — Web Application Assessment ═════════════ */
  "lab-m14-authflow": {
    mission: "GFS-WEBAPP-001",
    businessUnit: "Retail Banking Web App",
    context:
      "The login journey is the app's single most-attacked surface. Weak MFA turns credential stuffing into account takeover.",
    objective:
      "Map the auth flow (login → MFA → session issuance → password reset) and identify the weakest link.",
    assets: ["/login", "/mfa/challenge", "/reset-password", "OTP delivery channel"],
    workflow: [
      "Trace the request/response chain end-to-end",
      "Identify MFA factor (SMS OTP vs TOTP vs FIDO2)",
      "Test password-reset for account-enumeration oracle",
      "Test OTP for brute-force / replay protections",
      "Map each step to a MITRE ATT&CK technique",
    ],
    findings: [
      "SMS OTP is the only 2nd factor — phishable + SIM-swap",
      "Password reset differs based on account existence",
      "OTP endpoint has no rate limit → brute-forceable",
    ],
    exposure:
      "Credential-stuffing bots harvest reused passwords; SIM-swap defeats SMS OTP; account-enumeration builds target list.",
    attackOpportunity:
      "Account takeover at scale; fraudulent transfers using legitimate credentials + defeated MFA.",
    businessRisk:
      "Direct customer loss + Section 75 chargebacks + regulator scrutiny of MFA choice.",
    detection: [
      "Velocity rules on login endpoint (per-IP + per-user)",
      "Alert on SIM-swap indicators from telco feed",
      "Impossible-travel detection on session issuance",
    ],
    recommendations: [
      "Move primary factor to FIDO2 / passkey; SMS as fallback only for degraded devices",
      "Constant-response password-reset (no enumeration oracle)",
      "Per-user OTP rate limit + step-up on anomalous context",
    ],
    validation:
      "Re-test: credential-stuffing tool fails at MFA; password-reset returns identical response for existing/non-existing accounts.",
    frameworks: {
      mitre: [
        { id: "T1110.004", name: "Brute Force: Credential Stuffing" },
        { id: "T1621", name: "Multi-Factor Authentication Request Generation" },
      ],
      killChain: "actions-on-objectives",
      nistCsf: ["PR.AC-1", "PR.AC-7", "DE.CM-1"],
    },
    reports: {
      executive:
        "SMS OTP is not sufficient MFA for a banking front-door in 2026. FIDO2 removes the entire phishing + SIM-swap class.",
      technical:
        "Deploy passkeys as primary, constant-response reset, per-user OTP throttle.",
    },
    lessons: [
      "MFA quality > MFA presence.",
      "Password-reset is an auth surface — apply the same rigor as /login.",
    ],
  },

  "lab-m14-session": {
    mission: "GFS-WEBAPP-002",
    businessUnit: "Retail Banking Web App",
    context:
      "Session cookies are the bank-note of the web app. Weak cookie flags make theft trivial via XSS or MITM.",
    objective:
      "Assess cookie flags (HttpOnly, Secure, SameSite), rotation on privilege change, and idle-timeout.",
    assets: ["Session cookie", "CSRF cookie", "Load balancer session-affinity cookie"],
    workflow: [
      "Capture Set-Cookie on login response",
      "Assert HttpOnly + Secure + SameSite=Lax|Strict",
      "Confirm session ID rotates on privilege change (login, MFA pass)",
      "Confirm idle-timeout ≤ 15 minutes for banking session",
      "Confirm logout invalidates server-side",
    ],
    findings: [
      "HttpOnly missing → session stealable via XSS",
      "Secure missing → session leaks over plaintext",
      "Session ID not rotated after MFA → fixation risk",
    ],
    exposure:
      "One XSS turns into full session hijack; one downgrade turns into session theft on café Wi-Fi.",
    attackOpportunity:
      "Session hijack → transfers executed as the customer without re-auth.",
    businessRisk:
      "Unauthorised transactions with no repudiation defence — the bank pays.",
    detection: [
      "Concurrent-session anomaly detection",
      "Geo/device fingerprint change without re-auth alert",
    ],
    recommendations: [
      "Set HttpOnly + Secure + SameSite=Lax on every session cookie",
      "Rotate session ID on login, MFA pass, and privilege change",
      "Enforce 15-minute idle timeout; hard 12-hour absolute",
    ],
    validation:
      "Re-capture Set-Cookie — all three flags present; session ID observably rotates on MFA pass.",
    frameworks: {
      mitre: [
        { id: "T1539", name: "Steal Web Session Cookie" },
        { id: "T1550.004", name: "Use Alternate Authentication Material: Web Session Cookie" },
      ],
      killChain: "credential-access",
      nistCsf: ["PR.AC-1", "PR.DS-2", "DE.CM-1"],
    },
    reports: {
      executive:
        "Session cookies without modern flags are the equivalent of leaving bank-notes on the counter. Two config lines fix it.",
      technical:
        "HttpOnly + Secure + SameSite on all session cookies; rotate on privilege change; enforced idle-timeout.",
    },
    lessons: [
      "Cookie flags are free defence — never ship without them.",
      "Rotation on privilege change kills session-fixation as a class.",
    ],
  },

  "lab-m14-idor": {
    mission: "GFS-WEBAPP-003",
    businessUnit: "Corporate Banking",
    context:
      "Object references in URLs and JSON bodies are trusted by developers and mutable by attackers. In corporate banking, that mismatch moves money.",
    objective:
      "Identify authorization boundaries around transfer IDs, account IDs and beneficiary IDs; prove server-side ownership checks exist.",
    assets: ["/api/transfers/{transferId}", "/api/accounts/{accountId}", "/api/beneficiaries/{beneficiaryId}"],
    workflow: [
      "Enumerate object-reference parameters in the app",
      "For each, swap value with another tenant's object",
      "Observe: 403 forbidden (good) vs 200 with data (IDOR)",
      "Test both read and write verbs",
      "Map to MITRE ATT&CK T1190 (Exploit Public-Facing App)",
    ],
    findings: [
      "GET /api/transfers/{id} returns another tenant's transfer",
      "POST /api/transfers/{id}/approve allows cross-tenant approval",
    ],
    exposure:
      "Any authenticated user can approve or view any other tenant's transfer — worst-case authorisation failure.",
    attackOpportunity:
      "Unauthorised transfer approval, cross-tenant data theft, fraud at scale using legitimate credentials.",
    businessRisk:
      "Direct fraud losses + immediate regulator notification (operational-resilience failure).",
    detection: [
      "Alert on cross-tenant object access in application logs",
      "Anomaly detection on approval velocity per user",
    ],
    recommendations: [
      "Enforce owner-check middleware on every object-reference route",
      "Use tenant-scoped IDs (UUID + tenant prefix)",
      "Add authorisation unit tests as CI gate",
    ],
    validation:
      "Re-test: cross-tenant access returns 403 on every reference route; CI blocks any route missing the owner-check middleware.",
    frameworks: {
      mitre: [
        { id: "T1190", name: "Exploit Public-Facing Application" },
        { id: "T1078", name: "Valid Accounts" },
      ],
      killChain: "exploitation",
      nistCsf: ["PR.AC-4", "PR.AC-6", "DE.CM-1"],
    },
    reports: {
      executive:
        "The corporate banking API trusts client-supplied IDs. That trust lets any authenticated user approve any transfer. Fix is architectural, not cosmetic.",
      technical:
        "Add ownership middleware, tenant-scoped IDs, CI authorisation tests.",
    },
    lessons: [
      "Authentication ≠ Authorization — validate every object reference on the server.",
      "IDOR is the OWASP #1 for a reason — it hides in plain sight.",
    ],
  },

  "lab-m14-input": {
    mission: "GFS-WEBAPP-004",
    businessUnit: "Retail Banking Web App",
    context:
      "Input flowing from the browser to the DB is the primary attack path for XSS, SQLi and business-logic bypass.",
    objective:
      "Assess input validation, normalization, encoding and business-rule enforcement across the transfer form.",
    assets: ["Amount field", "Beneficiary name", "Reference field", "Currency selector"],
    workflow: [
      "Send unexpected inputs (unicode, overflow, encoded)",
      "Observe: rejected (good) vs accepted (finding)",
      "Test canonicalisation (Unicode normalisation)",
      "Test length + type validation",
      "Craft an XSS payload against the reference field",
    ],
    findings: [
      "Reference field reflects unencoded HTML → stored XSS",
      "Amount accepts negative values → business-logic bypass",
      "Unicode homograph accepted in beneficiary name",
    ],
    exposure:
      "Stored XSS delivers session-stealing script to every user viewing the transaction list; negative amounts credit the attacker's account.",
    attackOpportunity:
      "Mass session hijack; direct fraud via negative-amount transfer.",
    businessRisk:
      "Widespread account takeover + direct financial loss + regulatory reporting.",
    detection: [
      "WAF signatures on <script>, onerror=, javascript:",
      "Business-rule alert on negative-amount transfer attempts",
    ],
    recommendations: [
      "Server-side validation as the source of truth (client validation is UX only)",
      "Context-aware output encoding (HTML, JS, URL)",
      "Numeric validation with explicit min/max + type",
      "Unicode NFC normalisation before comparison",
    ],
    validation:
      "Re-test: reference field escapes HTML; amount rejects negatives; homograph beneficiaries flagged for review.",
    frameworks: {
      mitre: [
        { id: "T1059.007", name: "Command and Scripting Interpreter: JavaScript" },
        { id: "T1190", name: "Exploit Public-Facing Application" },
      ],
      killChain: "exploitation",
      nistCsf: ["PR.DS-6", "PR.IP-2", "DE.CM-4"],
    },
    reports: {
      executive:
        "The transfer form trusts the browser. That trust is the door to both cross-site scripting and negative-amount fraud.",
      technical:
        "Server-side validation, context-aware encoding, numeric bounds, Unicode NFC.",
    },
    lessons: [
      "Client-side validation is a UX affordance, never a control.",
      "Business-rule violations (negative amount) hide inside 'valid' input types.",
    ],
  },

  "lab-m14-buslogic": {
    mission: "GFS-WEBAPP-005",
    businessUnit: "Corporate Banking",
    context:
      "Business-logic flaws pass every scanner because the payload is legal — the workflow is the vulnerability.",
    objective:
      "Assess transfer, approval, beneficiary, limit and fraud workflows for logic bypasses (self-approval, split payments, race conditions).",
    assets: [
      "Transfer submission workflow",
      "Dual-approval workflow",
      "Beneficiary allow-list",
      "Daily transfer limit engine",
    ],
    workflow: [
      "Map the intended workflow (whiteboard)",
      "For each state transition, ask 'who is allowed?'",
      "Test: can the initiator also approve?",
      "Test: can the daily limit be bypassed by splitting?",
      "Test: race condition on concurrent transfer submissions",
    ],
    findings: [
      "Initiator can also approve → dual-control defeated",
      "Two transfers of £500 succeed under a £600 daily limit → limit racy",
      "Beneficiary added and immediately used → cooling-off period bypassed",
    ],
    exposure:
      "Every fraud control that exists on paper is bypassable in the actual application.",
    attackOpportunity:
      "Insider fraud at scale; external fraud using compromised session survives every 'control'.",
    businessRisk:
      "Direct fraud loss + operational-resilience finding + reputational damage in a regulated market.",
    detection: [
      "Real-time transaction monitoring on velocity + counterparty",
      "Alert on initiator=approver on any high-value transfer",
    ],
    recommendations: [
      "Enforce initiator ≠ approver at the DB constraint level",
      "Serialise limit checks (single-row lock or optimistic-concurrency version)",
      "Enforce beneficiary cooling-off in the workflow engine, not the UI",
    ],
    validation:
      "Red-team re-test: no successful self-approval, no split-payment limit bypass, cooling-off enforced.",
    frameworks: {
      mitre: [
        { id: "T1531", name: "Account Access Removal / Business Process Abuse" },
        { id: "T1078", name: "Valid Accounts" },
      ],
      killChain: "actions-on-objectives",
      nistCsf: ["PR.AC-4", "DE.CM-3", "DE.AE-2"],
    },
    reports: {
      executive:
        "The controls exist on paper. The application does not enforce them. Every control we tested had a legal-looking bypass.",
      technical:
        "DB-level dual-control constraint, serialised limit checks, workflow-level cooling-off.",
    },
    lessons: [
      "Business-logic flaws pass every scanner — they need adversarial thinking.",
      "Controls must live in the code path, not in the process document.",
    ],
  },

  /* ═════════════ Module 15 — Enterprise Database Security Assessment ═════════════ */
  "lab-m15-authquery": {
    mission: "GFS-DB-001",
    businessUnit: "Core Banking",
    context:
      "The login query is the highest-value single query in the bank. An unsafe login query is a full authentication bypass.",
    objective:
      "Identify string-concatenated auth queries and prove exploitability with a tautology payload.",
    assets: ["/login endpoint", "AuthDAO.checkLogin() query"],
    workflow: [
      "Enumerate login endpoint",
      "Inject a tautology (' OR 1=1 --)",
      "Observe authentication bypass",
      "Extract underlying query pattern from response timing",
      "Confirm remediation path (parameterisation)",
    ],
    findings: [
      "Login endpoint accepts tautology payload as valid credentials",
      "Response reveals concatenated query pattern",
    ],
    exposure:
      "Any attacker without credentials can log in as any user, including administrative accounts.",
    attackOpportunity:
      "Full authentication bypass → account takeover for arbitrary users → mass transfer fraud.",
    businessRisk:
      "Catastrophic — every customer account is trivially accessible without credentials.",
    detection: [
      "WAF signatures on tautology patterns (OR 1=1)",
      "Alert on login success with anomalous credential patterns (comments, quotes)",
    ],
    recommendations: [
      "Replace string-concatenation with prepared statements",
      "Add WAF rule as compensating control while code is fixed",
      "Add authentication log alert on anomalous login payloads",
    ],
    validation:
      "Re-test with the same payload — response is a normal 401 with no query pattern leakage.",
    frameworks: {
      mitre: [
        { id: "T1190", name: "Exploit Public-Facing Application" },
        { id: "T1078", name: "Valid Accounts" },
      ],
      killChain: "exploitation",
      nistCsf: ["PR.AC-1", "PR.DS-6", "DE.CM-1"],
    },
    reports: {
      executive:
        "The bank's front door does not require a key. Any attacker can log in as any customer. Highest-severity finding on the assessment.",
      technical:
        "Migrate AuthDAO to prepared statements; deploy WAF rule as immediate compensating control.",
    },
    lessons: [
      "String concatenation + SQL = one payload from total compromise.",
      "Prepared statements are the answer — not input sanitisation.",
    ],
  },

  "lab-m15-customerdb": {
    mission: "GFS-DB-002",
    businessUnit: "Customer Data Platform",
    context:
      "Once a query surface accepts injection, the attacker enumerates the DB and reaches PII tables — customer names, DOBs, account numbers.",
    objective:
      "Prove that a UNION-based enumeration can identify and read sensitive tables from the reachable database.",
    assets: ["products.php?id= (MySQL backend)", "customer, account, transaction tables"],
    workflow: [
      "Identify injectable parameter",
      "Discover column count with UNION SELECT NULL,NULL,…",
      "Enumerate information_schema.tables",
      "Identify PII-bearing tables (customer, account)",
      "Extract a sample row (redacted for the report)",
    ],
    findings: [
      "UNION-based extraction succeeds against products.php",
      "customer table reachable from an unauthenticated endpoint",
    ],
    exposure:
      "Full customer database is readable through an unauthenticated product-catalogue page.",
    attackOpportunity:
      "Mass PII exfiltration → sale on dark markets, targeted phishing, synthetic identity fraud.",
    businessRisk:
      "GDPR-scale breach (72-hour regulator notification), material fines, customer notification cost.",
    detection: [
      "Query-volume anomaly detection on the DB user account",
      "Alert on cross-schema access from application accounts",
    ],
    recommendations: [
      "Fix the injection at source (prepared statements)",
      "Apply least-privilege at the DB — app account cannot read customer.*",
      "Segment PII into its own schema with an approval-gated access path",
    ],
    validation:
      "Re-test: injection returns application error, DB grants prevent app account from reading customer.*",
    frameworks: {
      mitre: [
        { id: "T1213", name: "Data from Information Repositories" },
        { id: "T1005", name: "Data from Local System" },
      ],
      killChain: "actions-on-objectives",
      nistCsf: ["PR.AC-4", "PR.DS-1", "DE.CM-3"],
    },
    reports: {
      executive:
        "An unauthenticated product page reads the customer database. This is a GDPR-scale event waiting to happen.",
      technical:
        "Prepared statements + least-privilege DB grants + PII schema segmentation.",
    },
    lessons: [
      "SQLi + over-privileged DB user = the whole database.",
      "Least-privilege at the DB is the last line before mass exfiltration.",
    ],
  },

  "lab-m15-blind": {
    mission: "GFS-DB-003",
    businessUnit: "Core Banking",
    context:
      "Blind SQLi returns no data in the response — the attacker infers content bit-by-bit via boolean or time signals.",
    objective:
      "Craft a boolean-based blind payload and confirm the app is exploitable even without visible output.",
    assets: ["/api/orders?id= (no output, but query executes)"],
    workflow: [
      "Confirm baseline response for legitimate ID",
      "Inject ' AND 1=1 --  → same response",
      "Inject ' AND 1=2 --  → different response",
      "Elevate to time-based (SLEEP(5)) to bypass response-shape filters",
      "Consider detection cost of time-based vs boolean",
    ],
    findings: [
      "Boolean-based blind SQLi confirmed on /api/orders",
      "Time-based SLEEP(5) confirmed — no rate limit on endpoint",
    ],
    exposure:
      "Slow but reliable data extraction with no visible response — hardest form to detect from logs alone.",
    attackOpportunity:
      "Full DB extraction over time; low-and-slow blends with normal traffic.",
    businessRisk:
      "Silent PII exfiltration that only surfaces via anomaly detection on DB CPU or query volume.",
    detection: [
      "Alert on statements containing SLEEP / BENCHMARK / pg_sleep",
      "Anomaly detection on response-time variance per endpoint",
    ],
    recommendations: [
      "Prepared statements (root fix)",
      "DB query timeout at the connection pool",
      "Alert on any query containing sleep primitives from the app account",
    ],
    validation:
      "Re-test: both boolean and time-based payloads return identical baseline response; no query timeout observed.",
    frameworks: {
      mitre: [
        { id: "T1190", name: "Exploit Public-Facing Application" },
        { id: "T1071.001", name: "Application Layer Protocol: Web Protocols" },
      ],
      killChain: "actions-on-objectives",
      nistCsf: ["PR.DS-6", "DE.AE-2", "DE.CM-3"],
    },
    reports: {
      executive:
        "Even without visible output, the API leaks data on a boolean signal. Detection has to move to query patterns, not response bodies.",
      technical:
        "Parameterise queries, cap query timeout, alert on sleep primitives.",
    },
    lessons: [
      "'No visible output' is not defence — blind SQLi extracts too.",
      "Detection for blind SQLi lives at the DB, not the app.",
    ],
  },

  "lab-m15-secure": {
    mission: "GFS-DB-004",
    businessUnit: "Core Banking",
    context:
      "Prove that the remediation actually removes the vulnerability class, not just the specific payload.",
    objective:
      "Validate prepared statements + parameterised queries + input validation + WAF are stacked correctly (defence in depth).",
    assets: ["Remediated /api/orders endpoint", "WAF policy"],
    workflow: [
      "Confirm prepared-statement usage in code",
      "Confirm input validation on numeric/UUID types",
      "Confirm WAF rule set is deployed and blocking",
      "Attempt all four payload classes (tautology, UNION, boolean, time)",
      "Attempt a WAF-bypass encoding (SQL keyword still catches)",
    ],
    findings: [
      "Prepared statements in place — all payload classes rejected at DB level",
      "WAF blocks 100% of tested classic payloads",
    ],
    exposure:
      "Residual exposure limited to zero-day WAF-bypass encodings — accepted risk.",
    attackOpportunity:
      "Attacker must invest significant effort in bypass research; economic disincentive.",
    businessRisk:
      "Reduced to acceptable regulated-industry baseline.",
    detection: [
      "WAF block alerts feed SIEM",
      "DB-level alert on syntactically anomalous queries from app accounts",
    ],
    recommendations: [
      "Keep prepared statements as the source of truth",
      "Treat WAF as compensating control only, not primary defence",
      "Continuous WAF ruleset updates + regression tests",
    ],
    validation:
      "All four payload classes and one encoded bypass return application-normal error; SIEM shows WAF blocks logged.",
    frameworks: {
      mitre: HARDENING_MITRE,
      killChain: "exploitation",
      nistCsf: ["PR.IP-1", "PR.DS-6", "DE.CM-1", "DE.CM-4"],
    },
    reports: {
      executive:
        "The database-injection class of vulnerability is closed. Detection catches the residual bypass attempts.",
      technical:
        "Prepared statements + WAF + query pattern alerting — layered and validated.",
    },
    lessons: [
      "Defence in depth beats any single control.",
      "WAF is a compensating control — never a substitute for prepared statements.",
    ],
  },

  "lab-m15-incident": {
    mission: "GFS-DB-005",
    businessUnit: "Customer Data Platform",
    context:
      "You are no longer the attacker. A customer-DB breach has been declared and you are the lead responder.",
    objective:
      "Reconstruct the timeline, identify the root cause, preserve evidence, quantify impact and drive recommendations.",
    assets: ["WAF logs", "DB audit logs", "App logs", "Snapshot of DB at t0"],
    workflow: [
      "Timeline: first anomalous query → detection → containment",
      "Root cause: which endpoint, which query, which missing control",
      "Evidence: preserve WAF + DB + app logs with hashes",
      "Impact: count PII rows accessed, identify affected customers",
      "Recommendations: prevent recurrence, improve detection",
    ],
    findings: [
      "SQLi on /api/orders → 240k customer rows read over 6 hours",
      "DB alert existed but was routed to a dormant mailbox",
    ],
    exposure:
      "Confirmed data-breach event; regulator notification within 72 hours.",
    attackOpportunity:
      "N/A — post-incident phase.",
    businessRisk:
      "Confirmed regulatory notification, expected fine, customer credit-monitoring cost, reputational cost.",
    detection: [
      "Route DB alerts to the on-call channel, not a mailbox",
      "Add SIEM correlation between DB alert and app-endpoint spike",
    ],
    recommendations: [
      "Close the SQLi (root cause) — prepared statements",
      "Route DB alerts to on-call, page on critical patterns",
      "Add tabletop for 'DB exfil' scenario quarterly",
    ],
    validation:
      "Tabletop exercise re-runs the scenario end-to-end; time-to-contain measurably lower.",
    frameworks: {
      mitre: [
        { id: "T1213", name: "Data from Information Repositories" },
        { id: "T1041", name: "Exfiltration Over C2 Channel" },
      ],
      killChain: "actions-on-objectives",
      nistCsf: ["DE.AE-3", "RS.AN-1", "RS.MI-2", "RC.IM-1"],
    },
    reports: {
      executive:
        "A database breach was detected and contained. The technical fix is straightforward; the process fix (alert routing) matters more.",
      technical:
        "Root cause: SQLi on /api/orders. Detection existed, routing failed. Fix code + fix routing + tabletop.",
    },
    lessons: [
      "Detection you can't act on is decoration.",
      "Post-incident, the process failures often outweigh the code failures.",
    ],
  },

  /* ═════════════ Module 16 — Wireless Security Assessment ═════════════ */
  "lab-m16-survey": {
    mission: "GFS-WIFI-001",
    businessUnit: "Corporate Offices",
    context:
      "Wireless coverage extends beyond the walls. A wireless survey establishes what the bank actually broadcasts vs what policy allows.",
    objective:
      "Enumerate SSIDs, channels, signal strength, coverage boundary and advertised security suites.",
    assets: ["Corporate SSID (GFS-Corp)", "Guest SSID (GFS-Guest)", "Legacy SSID (GFS-Legacy)"],
    workflow: [
      "Passive scan of 2.4 + 5 GHz + 6 GHz",
      "Record every SSID, BSSID, channel, RSSI",
      "Map coverage — walk the perimeter, log signal leakage",
      "Identify advertised security (Open / WPA2-PSK / WPA2-Enterprise / WPA3)",
      "Flag any legacy or unknown SSIDs",
    ],
    findings: [
      "GFS-Legacy still broadcasting WPA2-PSK — should have been decommissioned",
      "Corporate SSID leaks 40m into public street",
      "One unknown SSID (GFS-Guest-Free) not in inventory",
    ],
    exposure:
      "Legacy PSK network is an authenticated pivot to the corporate network; unknown SSID is a candidate rogue AP.",
    attackOpportunity:
      "Crack the WPA2-PSK → foothold on corporate LAN; MITM users on the rogue guest network.",
    businessRisk:
      "Corporate network compromise from the street; regulator scrutiny of network-segmentation control.",
    detection: [
      "Wireless IDS with authorised-SSID allow-list",
      "Weekly automated survey with diff-to-baseline",
    ],
    recommendations: [
      "Decommission GFS-Legacy; migrate remaining devices to WPA2-Enterprise",
      "Tune AP power to contain signal within the building envelope",
      "Investigate + remove GFS-Guest-Free",
    ],
    validation:
      "Follow-up survey: only sanctioned SSIDs present, signal contained, all networks on WPA2-Enterprise or WPA3.",
    frameworks: {
      mitre: [
        { id: "T1590.004", name: "Gather Victim Network Information: Network Topology" },
        { id: "T1200", name: "Hardware Additions" },
      ],
      killChain: "reconnaissance",
      nistCsf: ["ID.AM-1", "PR.AC-5", "DE.CM-7"],
    },
    reports: {
      executive:
        "The bank broadcasts more networks than it thinks it does, and further than the walls. Neither is safe.",
      technical:
        "Retire GFS-Legacy, tune power, investigate GFS-Guest-Free, formalise the SSID allow-list.",
    },
    lessons: [
      "You can't secure what you don't know is broadcasting.",
      "Wireless coverage is a physical control — measure it on the street, not the floor plan.",
    ],
  },

  "lab-m16-auth": {
    mission: "GFS-WIFI-002",
    businessUnit: "Corporate Offices",
    context:
      "Corporate wireless must authenticate users, not devices. WPA2-PSK on a corporate SSID is a shared-secret waiting to leak.",
    objective:
      "Assess 802.1X / RADIUS / EAP configuration and certificate validation for GFS-Corp; confirm WPA3 migration path.",
    assets: ["GFS-Corp SSID", "RADIUS server", "Client 802.1X supplicant profiles", "CA-issued RADIUS cert"],
    workflow: [
      "Confirm SSID uses WPA2/WPA3-Enterprise (not PSK)",
      "Confirm EAP method (EAP-TLS preferred)",
      "Confirm client validates the RADIUS server certificate",
      "Confirm supplicant profile pins the CA + expected server name",
      "Test rogue RADIUS attack — confirm client refuses",
    ],
    findings: [
      "Corporate SSID uses WPA2-Enterprise EAP-PEAP with password-based inner auth",
      "Client supplicants do NOT validate RADIUS certificate → rogue-AP + evil-twin viable",
      "PBKDF2-based PMK derivation on the fallback PSK network is weak against modern GPUs",
    ],
    exposure:
      "Evil-twin AP harvests corporate credentials; PSK fallback is offline-crackable.",
    attackOpportunity:
      "Rogue RADIUS captures usernames + MSCHAPv2 challenge/response → offline crack → foothold on corporate LAN.",
    businessRisk:
      "Domain-credential compromise via wireless; from wireless to Active Directory to core banking.",
    detection: [
      "Wireless IDS alert on new BSSIDs advertising GFS-Corp SSID",
      "RADIUS server alert on authentication failures from unexpected NAS-IPs",
    ],
    recommendations: [
      "Migrate to EAP-TLS with client certificates (no password on the wire)",
      "Enforce server-cert validation in supplicant profile via MDM",
      "Migrate to WPA3-Enterprise where supported; retire PSK fallback",
    ],
    validation:
      "Rogue-RADIUS test: client refuses; audit shows 100% of managed devices have server-cert validation enforced by MDM.",
    frameworks: {
      mitre: [
        { id: "T1557", name: "Adversary-in-the-Middle" },
        { id: "T1110.002", name: "Brute Force: Password Cracking" },
      ],
      killChain: "credential-access",
      nistCsf: ["PR.AC-1", "PR.AC-5", "PR.DS-2"],
    },
    reports: {
      executive:
        "The corporate SSID uses password-based EAP without server-cert validation. An evil-twin captures corporate credentials in one lunch break.",
      technical:
        "EAP-TLS + MDM-enforced server-cert validation + WPA3-Enterprise migration.",
    },
    lessons: [
      "Enterprise wireless is only as strong as the client's supplicant configuration.",
      "PBKDF2 on WPA2-PSK is not adequate against modern GPU crackers.",
    ],
  },

  "lab-m16-rogue": {
    mission: "GFS-WIFI-003",
    businessUnit: "Corporate Offices",
    context:
      "A rogue AP inside the bank is a covert MITM. The response workflow is: discover → validate → investigate → contain → report.",
    objective:
      "Discover an unauthorised AP broadcasting the corporate SSID and execute the full response workflow.",
    assets: ["Wireless IDS", "Physical location team", "MDM device inventory"],
    workflow: [
      "Discover: wireless IDS flags a new BSSID broadcasting GFS-Corp",
      "Validate: confirm it's not in the AP inventory",
      "Investigate: triangulate location, capture client-association attempts",
      "Contain: physically remove or de-authenticate; notify affected users",
      "Report: root cause, blast radius, control improvements",
    ],
    findings: [
      "Rogue AP at desk 4F-23, broadcasting GFS-Corp for 6 hours",
      "3 corporate clients briefly associated",
    ],
    exposure:
      "Any credential captured during association is compromised; any traffic during association is subject to MITM.",
    attackOpportunity:
      "Adversary-in-the-Middle → credential capture, session cookie theft, downgrade attacks.",
    businessRisk:
      "Confirmed insider-threat scenario; incident-response process on trial.",
    detection: [
      "Wireless IDS with authorised-BSSID allow-list",
      "Association-attempt logging from all corporate APs",
    ],
    recommendations: [
      "Enforce EAP-TLS with server-cert validation — rogue AP can't complete auth",
      "Physical security walkthroughs coupled with wireless survey",
      "Automate MDM ↔ AP-inventory reconciliation daily",
    ],
    validation:
      "Tabletop re-run of the same scenario: time-to-contain reduced; no client associations complete.",
    frameworks: {
      mitre: [
        { id: "T1200", name: "Hardware Additions" },
        { id: "T1557", name: "Adversary-in-the-Middle" },
      ],
      killChain: "delivery",
      nistCsf: ["DE.CM-7", "RS.MI-2", "PR.AC-5"],
    },
    reports: {
      executive:
        "An unauthorised access point was discovered and removed. The response worked. The prevention (server-cert validation) matters more.",
      technical:
        "Rogue AP contained; EAP-TLS migration accelerates prevention; MDM ↔ AP reconciliation automated.",
    },
    lessons: [
      "Rogue APs are a people problem detected by tools.",
      "Contain is the tactical answer; server-cert validation is the strategic answer.",
    ],
  },

  "lab-m16-traffic": {
    mission: "GFS-WIFI-004",
    businessUnit: "Corporate Offices",
    context:
      "Wireless traffic assessment inspects the frame-level exchange — beacon, probe, association, authentication, encryption — for information leaks.",
    objective:
      "Assess beacon/probe hygiene, association behaviour and encryption strength on GFS-Corp.",
    assets: ["GFS-Corp SSID", "Managed client devices", "WPA2/WPA3 4-way handshake"],
    workflow: [
      "Capture beacon frames — inspect for MFP (Management Frame Protection)",
      "Capture probe requests — inspect for leaked SSID history from clients",
      "Capture association frames — inspect for anomalies",
      "Capture the 4-way handshake — confirm number of messages",
      "Inspect encryption suite (AES-CCMP baseline; GCMP-256 with WPA3)",
    ],
    findings: [
      "MFP not enforced on beacon frames → deauth attacks viable",
      "Client probe requests leak home SSIDs → tracking + rogue-AP targeting",
      "4-way handshake capturable within a coffee break — PMK derivation only PBKDF2",
    ],
    exposure:
      "Deauth-driven denial-of-service; targeted rogue AP for named clients; offline PSK crack path.",
    attackOpportunity:
      "Deauth → forced re-association → handshake capture → offline crack.",
    businessRisk:
      "Availability impact + credential-compromise path.",
    detection: [
      "Wireless IDS deauth-flood signature",
      "Alert on burst of association attempts from a single BSSID",
    ],
    recommendations: [
      "Enforce 802.11w (Management Frame Protection) — required for WPA3",
      "MDM policy: disable auto-connect to unknown SSIDs (kills probe leak)",
      "Migrate to WPA3-Enterprise with SAE (removes offline-crack primitive)",
    ],
    validation:
      "Deauth flood no longer disconnects clients; probe capture no longer shows corporate SSIDs from remote sites.",
    frameworks: {
      mitre: [
        { id: "T1040", name: "Network Sniffing" },
        { id: "T1498.001", name: "Network Denial of Service: Direct Network Flood" },
      ],
      killChain: "reconnaissance",
      nistCsf: ["PR.DS-2", "PR.PT-4", "DE.CM-1"],
    },
    reports: {
      executive:
        "The wireless frame exchange leaks device history and is subject to trivial denial-of-service. WPA3 with MFP closes both.",
      technical:
        "Enable 802.11w on all APs; MDM-enforce SSID hygiene; plan WPA3-Enterprise rollout.",
    },
    lessons: [
      "Frame-level leaks are as valuable as payload leaks.",
      "MFP is not optional in 2026.",
    ],
  },

  "lab-m16-review": {
    mission: "GFS-WIFI-005",
    businessUnit: "Corporate Offices",
    context:
      "Consolidate the wireless survey, auth, rogue-AP and traffic assessments into an enterprise wireless audit report.",
    objective:
      "Produce a single audit report with prioritised remediation and evidence of validation.",
    assets: ["All prior M16 assets"],
    workflow: [
      "Consolidate findings from labs 1–4",
      "Prioritise by risk (blast radius × likelihood)",
      "Attach evidence (survey maps, capture files, IDS logs)",
      "Draft executive + technical reports",
      "Define KPIs for continuous assurance",
    ],
    findings: [
      "3 high-severity findings closed (legacy SSID, cert validation, MFP)",
      "1 residual (probe-request leak) mitigated via MDM policy",
    ],
    exposure:
      "Residual exposure limited to legacy device compatibility during WPA3 migration.",
    attackOpportunity:
      "Reduced to zero-day exploit territory.",
    businessRisk:
      "Within tolerance; documented residual owned by CTO.",
    detection: [
      "Weekly automated wireless survey with diff-to-baseline",
      "Continuous rogue-AP detection via wireless IDS",
    ],
    recommendations: [
      "Complete WPA3-Enterprise rollout inside 90 days",
      "Quarterly external wireless audit",
      "Annual physical + wireless combined walkthrough",
    ],
    validation:
      "Independent external audit produces zero critical findings on the wireless estate.",
    frameworks: {
      mitre: [
        { id: "T1200", name: "Hardware Additions" },
        { id: "T1557", name: "Adversary-in-the-Middle" },
        { id: "T1040", name: "Network Sniffing" },
      ],
      killChain: "reconnaissance",
      nistCsf: ["ID.GV-1", "PR.AC-5", "DE.CM-7", "RS.IM-1"],
    },
    reports: {
      executive:
        "The wireless estate is within tolerance. Continuous monitoring keeps it there. WPA3-Enterprise completion in 90 days.",
      technical:
        "Findings closed with evidence; residuals documented; automated survey + rogue-AP detection in place.",
    },
    lessons: [
      "Wireless assurance is continuous, not annual.",
      "The wireless perimeter is a shared responsibility between IT, security and facilities.",
    ],
  },
};

export const getLabWorkflow = (labId: string) => LAB_WORKFLOWS[labId];
