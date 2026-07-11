// Module 17 — Hacking Mobile Platforms (Day 7)
// Enterprise mission: GFS Retail Banking mobile apps (Android + iOS) — pre-release
// security review of the customer app.
// Concepts: (1) Android Application Security Testing, (2) iOS Runtime Analysis with AI Copilots.

export const M17_SCENARIO = {
  client: "Global Financial Services — Retail Mobile Banking",
  assessment: "Pre-release Mobile App Security Assessment (Android + iOS)",
  scope: "Static + dynamic testing of release-candidate builds · jailbroken/rooted lab devices only · no interaction with production users · test tenant only",
  available: [
    "APK + IPA release candidates from mobile CI",
    "Symbolicated crash dumps + Proguard mappings",
    "Backend API spec (shared with M14 corporate banking review)",
  ],
  outcome: "Mobile App Security Report — permission surface, storage & IPC exposure, runtime tamper resistance, transport security, and store-submission blockers",
  why: "The mobile app is the primary customer channel and holds session tokens on a device the bank does not control. Everything that leaks off-device — a log line, an insecure preference, an IPC callback — is a step towards account takeover.",
};

export const M17_WORKFLOW = [
  { tool: "Static analysis (MobSF / apktool / jadx / class-dump)", finding: "Dangerous permissions, exported components, hardcoded endpoints/keys, insecure APIs", exposure: "Exported activities without permission gates; secrets in strings.xml", opportunity: "3rd-party app invokes exported activity to trigger transfer intent", risk: "Malicious app on same device performs actions as the bank app", recommendation: "Explicit `android:exported=false`; per-intent signature-level permissions; move secrets to secure storage or backend" },
  { tool: "Insecure storage audit", finding: "SharedPreferences / plist / SQLite files with tokens, PII, transaction cache", exposure: "Session token / recent-payees list in cleartext on-device", opportunity: "Backup extraction, forensic recovery, malware on rooted device", risk: "Persistent post-uninstall data leak", recommendation: "Android Keystore / iOS Keychain for secrets; encrypt SQLite via SQLCipher; disable `allowBackup`" },
  { tool: "Transport security (TLS + pinning)", finding: "TLS version, cipher suites, hostname validation, cert pinning presence & bypass difficulty", exposure: "No pinning → Frida/Objection bypass to intercept API", opportunity: "Full API replay on a hostile network", risk: "Session hijack; PII interception", recommendation: "Implement network-security-config pinning (Android) / ATS pinning (iOS); pin to internal CA; monitor pinning-bypass telemetry" },
  { tool: "Runtime analysis (Frida / Objection / iOS lldb)", finding: "Root/jailbreak detection, anti-hooking, WebView/JS bridges, deep-link handling", exposure: "Weak jailbreak checks bypassed with 1-line Frida script; JS bridge exposes native to WebView", opportunity: "Runtime tampering to disable biometrics; XSS-to-native pivot", risk: "Auth bypass and privilege escalation on-device", recommendation: "Layered attestation (Play Integrity / App Attest); JS bridge allow-list; harden deep-link intent filters" },
  { tool: "Deep link / URL scheme abuse", finding: "Custom schemes registered; unauthenticated intents that trigger actions", exposure: "gfsbank://transfer?to=X&amount=Y opens pre-filled transfer", opportunity: "1-click phishing landing pages trigger flows", risk: "User-approved but attacker-authored transactions", recommendation: "Require re-authentication for any sensitive deep-link action; validate origin; prefer App Links / Universal Links with digital asset links" },
  { tool: "Log & crash hygiene", finding: "PII/tokens in logcat, Sentry breadcrumbs, network debug builds", exposure: "Release build ships with verbose network logging", opportunity: "Any app with READ_LOGS or side-loaded debugger reads tokens", risk: "Silent bulk credential leak via debug remnants", recommendation: "Strip debug logs in release; scrub PII in crash reporters; CI gate on debuggable=false and NSAllowsArbitraryLoads=false" },
];

export const M17_ANALYST_FRAMEWORK = [
  {
    observation: "Android manifest exports `TransferActivity` with an intent-filter and no permission requirement.",
    finding: "Any app on the device can start a pre-filled transfer.",
    exposure: "1-click transfer via arbitrary app-invocation.",
    opportunity: "Malicious app on device drives the bank app; user sees a transfer screen they didn't initiate.",
    risk: "User-approved fraud with plausible deniability for the bank's fraud engine.",
    recommendation: "Set `android:exported=false`; require signature-level permission for internal intents; force re-auth on transfer confirmation.",
  },
  {
    observation: "Session JWT stored in SharedPreferences unencrypted; `android:allowBackup=true`.",
    finding: "Session token persisted in the world's most-backed-up location.",
    exposure: "adb backup on a debuggable device or Google-cloud backup replay yields live tokens.",
    opportunity: "Bulk account takeover via any device-compromise pathway.",
    risk: "Persistent session compromise even after uninstall.",
    recommendation: "Store tokens in Android Keystore (or EncryptedSharedPreferences); disable backup or add per-file exclusion rules; short access-token TTL with server-side revocation.",
  },
];

export const M17_GUIDED = [
  {
    topic: "Android permissions & exported components",
    look: "AndroidManifest.xml: dangerous permissions, `android:exported`, intent-filters, `permission` attribute on components, `android:allowBackup`.",
    expected: "Minimum permissions; every exported component justified and gated with signature/system permissions; backup disabled or scoped.",
    mistakes: "Marking components exported to 'make deep links work' without permission gates.",
    attackers: "Exported+unprotected components are free authenticated actions from any other app.",
    defenders: "Lint rules in CI; manifest merger audits; Play Store pre-submission scanning.",
  },
  {
    topic: "iOS entitlements, ATS & Keychain",
    look: "Info.plist entitlements, NSAppTransportSecurity, keychain access-groups, Data Protection class on files, URL schemes.",
    expected: "ATS strict; keychain items with `kSecAttrAccessibleWhenUnlockedThisDeviceOnly`; Data Protection Complete for sensitive files.",
    mistakes: "NSAllowsArbitraryLoads=true for a single 3rd-party CDN. Keychain items accessible-always.",
    attackers: "Weak ATS re-opens plaintext HTTP surfaces. Weak Keychain classes survive backup.",
    defenders: "CI check on Info.plist deltas; MDM posture assertions.",
  },
  {
    topic: "Certificate pinning & bypass",
    look: "Pinning implementation (native config vs code), pin-set (leaf/intermediate/CA), presence of anti-Frida/anti-Objection checks.",
    expected: "Pin to internal CA at intermediate level; combine with runtime integrity attestation; telemetry when pinning bypassed.",
    mistakes: "Pinning only in a library that Frida can hook. Pinning the leaf cert (breaks on rotation).",
    attackers: "Objection has one-liners to bypass most pinning; layer defence in depth.",
    defenders: "Detect pinning-bypass via server-side signals (client-attestation + anomalous handshake).",
  },
  {
    topic: "Deep links, IPC, and WebView JS bridges",
    look: "Custom URL schemes, App Links / Universal Links, WKWebView JS bridge methods, exported content providers.",
    expected: "App Links / Universal Links with verified domain association; JS bridge exposes minimum surface with allow-list; sensitive actions re-authenticate.",
    mistakes: "Trusting deep-link params. `evaluateJavascript` on arbitrary content.",
    attackers: "Deep-link phishing chains + XSS-to-native pivots are common bug-bounty findings on banking apps.",
    defenders: "Require step-up auth for any deep-link action that moves money or changes contact details.",
  },
];

export const M17_INCIDENTS = [
  { org: "Klarna mobile app (2021)", method: "Client-side session bug briefly showed other users' account screens on app open", recon: "User reports on social media", impact: "Public trust incident; regulator inquiries", lesson: "Mobile app state must be tied to authenticated identity on every screen — session assumptions fail at rehydration." },
  { org: "Slack Android app (2019)", method: "Password stored in plaintext in some install paths", recon: "Static analysis by researchers", impact: "Forced password rotation for affected users", lesson: "Even mature vendors ship secrets to disk unintentionally — CI-level checks are non-negotiable." },
  { org: "TikTok (2020, Check Point)", method: "SMS-link + deep-link chain led to account takeover", recon: "Static+dynamic analysis", impact: "Coordinated disclosure & fix", lesson: "Deep-link handling is a first-class attack surface in mobile apps; treat every intent as untrusted input." },
];

export const M17_DELIVERABLES = [
  { id: "scope", label: "Build hashes + scope + test-tenant confirmed" },
  { id: "static", label: "Static analysis findings (MobSF + manual review)" },
  { id: "storage", label: "Insecure-storage audit (files, prefs, keychain, keystore)" },
  { id: "transport", label: "TLS + pinning validation with bypass evidence" },
  { id: "runtime", label: "Runtime findings (root/jailbreak, anti-hook, attestation)" },
  { id: "deeplink", label: "Deep-link / IPC surface + abuse cases" },
  { id: "logs", label: "Log & crash-report PII scrub audit" },
  { id: "store", label: "Store-submission blockers (Google Play / App Store)" },
  { id: "plan", label: "Remediation plan aligned to release cycle" },
  { id: "exec", label: "Executive summary for CPO + CISO" },
];

export const M17_AI_ACTIONS = [
  { id: "analyze", label: "Analyze Findings", output: "Android RC: 3 exported activities without permission gates (1 critical — TransferActivity), session JWT in SharedPreferences, `allowBackup=true`, network-security-config missing pinning. iOS RC: ATS strict OK, Keychain classes OK, but URL scheme handler processes `?amount=` without re-auth. Two Play Store blockers, one App Store risk." },
  { id: "correlate", label: "Correlate Evidence", output: "The TransferActivity export + deep-link scheme + no re-auth compose into an end-to-end fraud chain: a phishing link opens the bank app pre-filled with attacker's beneficiary and amount; the user, seeing their bank's real UI, may confirm. No malware required on device." },
  { id: "assess", label: "Generate Assessment", output: "Mobile posture: RELEASE-BLOCKING. The Android build should not ship to Play until export + backup + pinning findings are fixed. iOS build ships with the re-auth requirement on deep-link actions. Runtime integrity (Play Integrity / App Attest) not yet integrated on either platform." },
  { id: "recommend", label: "Generate Recommendations", output: "Priority 0 (this release): `android:exported=false` on TransferActivity + siblings; `allowBackup=false`; move JWT to Keystore; add network-security-config pinning; require re-auth on any deep-link transfer intent. Priority 1 (next release): Integrate Play Integrity + App Attest; server-side attestation checks; anti-Frida telemetry. Priority 2 (backlog): CI gates on manifest/plist changes; scheduled dynamic runtime testing pre-release." },
  { id: "exec", label: "Executive Summary", output: "The current release-candidate mobile builds cannot ship without three Android fixes: unprotected exported components, unencrypted session storage, and missing certificate pinning. iOS is closer to ready but needs a re-auth guard on deep-link transfer intents. All fixes are small code changes that fit into the current sprint. The strategic gap is runtime attestation, which should land in the next quarter and would materially raise the cost of on-device attacks." },
];

export const M17_SLUG = "hacking-mobile-platforms";
