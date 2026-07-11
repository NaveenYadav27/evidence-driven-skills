// Module 20 — Cryptography (Day 7)
// Enterprise mission: GFS cryptographic estate review — data-at-rest, data-in-transit,
// key management, code-signing, and post-quantum readiness.
// Concepts: (1) Cryptography Fundamentals & Attacks, (2) AI-Assisted Cryptanalysis & PQ Awareness.

export const M20_SCENARIO = {
  client: "Global Financial Services — Enterprise Cryptography Programme",
  assessment: "Cryptographic Estate Review + Post-Quantum Readiness",
  scope: "Documentation + configuration + KMS inventory review across banking, payments, and internal apps · no live cryptanalysis · no key material handled",
  available: [
    "KMS inventory export (AWS KMS + Azure Key Vault + HSM cluster)",
    "TLS scan output from external monitoring (last 30 days)",
    "Code-signing pipeline documentation from AppSec",
  ],
  outcome: "Cryptographic Posture Report — algorithm inventory, weak-cipher register, KMS/HSM hygiene, code-signing chain review, and post-quantum migration roadmap",
  why: "Cryptography failures rarely announce themselves. A weak cipher, a re-used IV, a leaked signing key, or an unpatched TLS stack can silently invalidate years of compliance evidence. Post-quantum readiness is a decade-scale programme that starts with today's inventory.",
};

export const M20_WORKFLOW = [
  { tool: "Algorithm inventory", finding: "Which algorithms/modes/lengths are in use for which purpose across which services", exposure: "Legacy MD5/SHA-1/DES/3DES/RC4 lingering; RSA-1024; ECB mode", opportunity: "Trivial collisions/forgery; downgrade attacks", risk: "Signature forgery, encryption bypass", recommendation: "Ban legacy primitives at policy level; enforce SHA-256+/AES-GCM/RSA-2048+/ECDSA P-256+ minimums" },
  { tool: "TLS surface audit", finding: "Protocol versions, cipher suites, cert chain, HSTS, OCSP stapling, session resumption", exposure: "TLS 1.0/1.1 still enabled; CBC ciphers; short-lived RSA-only chains", opportunity: "Downgrade + padding-oracle attacks", risk: "Session compromise; PFS-less recording of traffic", recommendation: "TLS 1.2+ only; AEAD ciphers; ECDHE key exchange; HSTS preload; automated cert rotation" },
  { tool: "Key management hygiene (KMS/HSM)", finding: "Key ownership, rotation policy, access audit, key origin (imported vs generated), envelope-encryption depth", exposure: "Long-lived keys with no rotation; shared keys across environments; broad key-user policies", opportunity: "Key compromise → wholesale data decryption", risk: "'Encryption at rest' becomes a paperwork claim, not a control", recommendation: "Per-service keys; scheduled rotation; scoped grants; HSM-backed root keys; usage alerting" },
  { tool: "Code-signing chain review", finding: "Which private keys sign what artefacts; where those keys live; who has access", exposure: "Signing key on a build-agent disk; shared signing account; no verifiable build provenance", opportunity: "Malicious artefact signed with legitimate key → passes every downstream check", risk: "SolarWinds-class supply-chain compromise", recommendation: "HSM-backed signing; ephemeral per-build signing (Sigstore/Notary); SLSA-aligned build provenance" },
  { tool: "Randomness & IV/nonce audit", finding: "PRNG sources, IV/nonce generation, replay protection", exposure: "Static IVs, low-entropy PRNGs in older services, nonce reuse in AES-GCM", opportunity: "Plaintext recovery on GCM nonce reuse", risk: "Silent decryption of protected fields", recommendation: "OS CSPRNG only; unique IVs per encryption; migrate to AEAD misuse-resistant modes where possible" },
  { tool: "Post-quantum readiness", finding: "Where quantum-vulnerable algorithms are used with long-lived confidentiality/integrity requirements", exposure: "RSA/ECC across signing + long-term encrypted archives", opportunity: "'Harvest now, decrypt later' by well-resourced adversaries", risk: "Confidentiality of today's traffic invalidated in ~10-15 years", recommendation: "Crypto-agility programme; pilot NIST PQC (ML-KEM, ML-DSA, SLH-DSA); prioritise long-lifetime data first" },
];

export const M20_ANALYST_FRAMEWORK = [
  {
    observation: "Legacy internal message queue still uses 3DES-CBC with a static IV, per config repo.",
    finding: "Broken algorithm + IV misuse on a queue that carries reconciliation messages.",
    exposure: "Ciphertexts distinguishable and partially recoverable; long-term confidentiality invalid.",
    opportunity: "An attacker with prior traffic capture can recover message content offline.",
    risk: "Retrospective breach of reconciliation data; regulatory issue on historical periods.",
    recommendation: "Move to AES-GCM with per-message random IV; rotate keys; treat any historical capture as compromised and re-assess data-classification impact.",
  },
  {
    observation: "Code-signing key for the mobile app lives on the build-agent disk under a shared service account.",
    finding: "Signing key exposed to CI/CD compromise; no build provenance chain.",
    exposure: "Any CI compromise = ability to sign malicious app updates as the bank.",
    opportunity: "Push malicious update through the vendor pipeline with legitimate signature.",
    risk: "SolarWinds-class impact — signed updates bypass most detection.",
    recommendation: "Move signing to HSM-backed key; ephemeral per-build signing with attestation; publish and verify SLSA provenance; log every signing event to SIEM.",
  },
];

export const M20_GUIDED = [
  {
    topic: "Symmetric ciphers, modes, and AEAD",
    look: "Algorithm, mode, key length, IV/nonce handling, integrity mechanism (HMAC vs AEAD).",
    expected: "AES-128/256 in AEAD modes (GCM, GCM-SIV, ChaCha20-Poly1305); per-message unique nonce; integrity built-in.",
    mistakes: "ECB mode. CBC without HMAC. Static IV. GCM nonce reuse.",
    attackers: "Padding-oracle on CBC, nonce reuse on GCM = plaintext recovery.",
    defenders: "Enforce AEAD at policy level; static analysis of crypto call sites.",
  },
  {
    topic: "Asymmetric crypto, signatures, and PKI",
    look: "Key length, curve, hash pairing, cert chain, revocation.",
    expected: "RSA-2048+/ECDSA P-256+/Ed25519; SHA-256+ paired hashes; short-lived certs where possible; OCSP or CRL working.",
    mistakes: "RSA-1024 leftovers. SHA-1 pinned somewhere. Broken revocation.",
    attackers: "Weak-key or weak-hash forgeries, downgrade of chains, expired revocation infrastructure.",
    defenders: "Cert-lifecycle automation; algorithm floor enforced by policy.",
  },
  {
    topic: "Key management (KMS, HSM, envelope encryption)",
    look: "Where root keys live, who can use them, how rotation happens, how usage is audited.",
    expected: "HSM-backed root keys; per-service data keys; automated rotation; usage-based alerting.",
    mistakes: "'One KMS key for the whole account.' No rotation because 'nothing broke.'",
    attackers: "Key compromise turns encryption into paperwork.",
    defenders: "Blast-radius thinking per key; alert on unusual decrypt volumes.",
  },
  {
    topic: "Post-quantum readiness & crypto-agility",
    look: "Which primitives are quantum-vulnerable, which data has long-lived confidentiality/integrity requirements, and where algorithm choice is hard-coded.",
    expected: "Crypto-agility layer that isolates algorithm choice; PQC pilots (ML-KEM, ML-DSA, SLH-DSA) on suitable services; migration plan prioritised by data lifetime.",
    mistakes: "Ignoring PQ because 'quantum is decades away'. Hard-coding algorithms across the codebase.",
    attackers: "'Harvest now, decrypt later' is already a documented state-actor strategy.",
    defenders: "Build the agility layer now; pilot PQC on non-critical services this year.",
  },
];

export const M20_INCIDENTS = [
  { org: "Debian OpenSSL PRNG (2008)", method: "PRNG entropy source removed in a patch; predictable keys generated for years", recon: "N/A — bug discovered by a Debian developer", impact: "All keys generated during the affected window had to be regenerated globally", lesson: "One crypto library change can invalidate years of key material; provenance and reproducibility matter." },
  { org: "SolarWinds (2020)", method: "Malicious Orion build signed with legitimate signing key; downstream Golden SAML in cloud", recon: "Long dwell in build environment", impact: "Multiple federal + F500 tenants compromised", lesson: "Code-signing key protection is a top-tier cryptographic control, not a build-team concern." },
  { org: "Zoom E2EE claim (2020)", method: "Marketing claimed E2EE; implementation used a single AES-128-ECB (later CBC) key shared via server", recon: "Independent researcher analysis", impact: "Regulatory attention and product changes", lesson: "Cryptographic claims must match implementation reality; ECB and shared keys aren't E2EE." },
];

export const M20_DELIVERABLES = [
  { id: "scope", label: "Scope + no-key-handling statement logged" },
  { id: "inventory", label: "Full algorithm/mode/key-length inventory by service" },
  { id: "tls", label: "TLS surface audit + weak-cipher register" },
  { id: "kms", label: "KMS/HSM hygiene report (ownership, rotation, blast radius)" },
  { id: "signing", label: "Code-signing chain review + provenance recommendations" },
  { id: "rand", label: "PRNG / IV / nonce audit" },
  { id: "pq", label: "Post-quantum exposure map — algorithms × data lifetime" },
  { id: "agility", label: "Crypto-agility architecture recommendation" },
  { id: "plan", label: "3-year migration roadmap (weak-cipher retirement + PQC pilots)" },
  { id: "exec", label: "Executive summary for CISO + Head of Regulatory" },
];

export const M20_AI_ACTIONS = [
  { id: "analyze", label: "Analyze Findings", output: "Cryptographic estate: 4 services still support TLS 1.0; 1 internal queue uses 3DES-CBC with static IV; 12 KMS keys unrotated >2 years; code-signing key for mobile app on build-agent disk; no PQC pilots in flight. Weak-cipher external surface reduced 60% over the last year — positive trend, incomplete." },
  { id: "correlate", label: "Correlate Evidence", output: "The 3DES queue and one of the unrotated KMS keys both underpin the reconciliation data flow — any compromise of either invalidates the same downstream evidence, doubling regulatory blast radius from a single incident." },
  { id: "assess", label: "Generate Assessment", output: "Cryptographic posture: MIXED. External TLS is trending correctly but with visible legacy remnants. Internal cryptography is materially weaker — legacy modes, unrotated keys, and CI-resident signing keys. Post-quantum readiness has not begun; this is now a boardroom-visible gap given long-lifetime confidentiality obligations." },
  { id: "recommend", label: "Generate Recommendations", output: "Priority 0 (≤30d): Retire TLS 1.0 on remaining 4 services; move mobile signing key to HSM; alert on any use of MD5/SHA-1/DES/3DES in production. Priority 1 (≤90d): Rotate KMS keys >2 years old; migrate the 3DES queue to AES-GCM; publish signing provenance (SLSA). Priority 2 (≤3 years): Crypto-agility layer across banking services; PQC pilots on suitable internal channels; classify data by expected confidentiality lifetime." },
  { id: "exec", label: "Executive Summary", output: "GFS's outward-facing cryptography is largely modern; the internal estate is materially weaker and holds two specific risks that a regulator would care about — a legacy queue using broken algorithms on reconciliation data, and a mobile code-signing key stored where any CI compromise could reach it. Both have concrete 30/90-day fixes. In parallel, the organisation should begin a multi-year crypto-agility and post-quantum programme; today's traffic and archives fall inside the window that 'harvest now, decrypt later' adversaries plan around." },
];

export const M20_SLUG = "cryptography";
