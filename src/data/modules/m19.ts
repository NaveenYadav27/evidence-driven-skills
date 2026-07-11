// Module 19 — Cloud Computing (Day 7)
// Enterprise mission: GFS multi-cloud posture — customer-facing AWS estate + Azure
// tenant hosting internal apps + a growing container/serverless footprint for AI workloads.
// Concepts: (1) Cloud Identity, IAM & Misconfiguration, (2) Container, Serverless & AI Workload Security.

export const M19_SCENARIO = {
  client: "Global Financial Services — Multi-Cloud Estate",
  assessment: "Cloud Security Assessment — AWS + Azure + AI/container workloads",
  scope: "Read-only assessment across 3 AWS orgs + 2 Azure tenants · no changes to production · red-team-style path narratives permitted in staging only",
  available: [
    "Read-only SecurityAudit / Reader roles pre-provisioned",
    "IaC repos (Terraform + Bicep) with historical merges",
    "Existing CSPM findings from vendor tool (last 90 days)",
  ],
  outcome: "Cloud Posture Report — identity blast-radius, misconfiguration register, container & serverless supply-chain findings, and AI workload data-flow risk map",
  why: "Cloud identity is the perimeter. A single over-privileged role, an unpinned base image, or an AI training job that reads raw customer data can create a breach path that traditional network scanning will never see.",
};

export const M19_WORKFLOW = [
  { tool: "IAM inventory + blast-radius (AWS IAM Access Analyzer / Azure PIM)", finding: "Roles, groups, privileged assignments, cross-account trust, standing access", exposure: "Standing admin roles, wildcard trust policies, dormant privileged principals", opportunity: "One credential compromise → org-wide access", risk: "Wholesale environment compromise", recommendation: "Just-in-time privileged access; scoped trust; disable dormant principals; alert on new role assumptions" },
  { tool: "Public-exposure sweep (S3/Blob/RDS/SQL/EKS/AKS/API Gateway)", finding: "Public buckets, DBs, K8s API endpoints, functions", exposure: "Public S3 with customer PII; public K8s API endpoint", opportunity: "Direct data theft; cluster takeover", risk: "Regulatory breach; cluster compromise", recommendation: "Enforce SCPs / Azure Policy to deny public creation; continuous exposure monitoring" },
  { tool: "IaC scanning (Checkov / tfsec / KICS)", finding: "Misconfigurations at merge time (encryption, logging, network exposure)", exposure: "Encryption-at-rest disabled; logging off; open security groups", opportunity: "Configuration drift + no forensic evidence post-incident", risk: "Silent long-dwell compromise", recommendation: "Block merges on high-severity IaC findings; enforce mandatory tags for owner + data class" },
  { tool: "Container supply-chain (Trivy / Grype + SBOM)", finding: "Base image freshness, vulnerable packages, secrets in images, image signing", exposure: "Latest tag from Docker Hub with no pinning; secrets baked into images", opportunity: "Poisoned dependency ships to prod on next build", risk: "Supply-chain compromise via CI/CD", recommendation: "Pin by digest; sign images (Cosign) + verify at admission; scan + break-glass policy; scrub secrets" },
  { tool: "Serverless / Function security", finding: "Function IAM roles, event-source config, secrets handling, cold-start behaviour", exposure: "Function role with `s3:*` on 'the account' bucket set", opportunity: "Any code-exec-in-function = full bucket access", risk: "Data exfil via privileged function", recommendation: "Least-privilege per function; per-function KMS keys; secrets via managed store; VPC egress controls" },
  { tool: "AI workload data-flow review", finding: "Training data provenance, feature store access, model artefact storage, inference-endpoint auth", exposure: "Training reads raw PII; model artefacts in public bucket; inference endpoint unauthenticated", opportunity: "Model-inversion / membership-inference attacks; data-exfil via inference", risk: "PII leak via model behaviour; regulatory issue for automated decisions", recommendation: "Feature store with PII policy; model-artefact access via IAM; auth on inference endpoints; monitor prompt/inference logs for exfil patterns" },
];

export const M19_ANALYST_FRAMEWORK = [
  {
    observation: "AWS role `DataScienceAdmin` has `s3:*` on `*`, is assumable from a public SaaS notebook SSO, and was assumed 3 times in the last 30 days by 2 distinct principals.",
    finding: "A wildcard-privileged role with a public-SaaS trust and standing access.",
    exposure: "A phish or SaaS-side compromise yields full S3 access across all accounts under the trust.",
    opportunity: "Bulk exfil of any data lake bucket including the customer PII data zone.",
    risk: "Reportable regulatory breach with a clear paper trail of the trust misconfiguration.",
    recommendation: "Replace with scoped, JIT roles per project; remove public-SaaS trust or gate via SSO with device posture; alert on any assumption outside working hours.",
  },
  {
    observation: "AKS cluster in Azure exposes the Kubernetes API endpoint publicly with only Azure AD auth (no IP allow-list).",
    finding: "Public K8s API endpoint on a production cluster.",
    exposure: "Public control-plane surface; any token compromise = cluster takeover.",
    opportunity: "kubectl exec into any pod, including those holding secrets/tokens for downstream systems.",
    risk: "Cluster-wide compromise from anywhere on the internet.",
    recommendation: "Enable private cluster or restrict API access with authorised IP ranges; enforce Just-in-Time cluster admin via PIM; monitor API audit logs.",
  },
];

export const M19_GUIDED = [
  {
    topic: "IAM blast-radius thinking",
    look: "For each identity: what can it do, where, and under what conditions? Cross-account trust, resource-based policies, condition keys.",
    expected: "Least privilege by default; JIT for elevated access; no wildcard resource on data-plane services.",
    mistakes: "'Admin for now, we'll scope it later.' Trusting `*` in trust policies.",
    attackers: "Enumerate roles first; find the one role whose compromise = game over; go for it.",
    defenders: "Blast-radius reporting per identity; automatic revocation of dormant privileged access.",
  },
  {
    topic: "Public exposure & guardrails",
    look: "SCPs (AWS) / Management Group Policy (Azure) that deny public creation of buckets/DBs; continuous exposure telemetry.",
    expected: "Public creation is denied by policy, not by hope. Exceptions are documented and reviewed.",
    mistakes: "Relying on developer checklists. Trusting a one-time audit.",
    attackers: "Continuous internet-wide scanning finds newly-exposed resources within hours.",
    defenders: "Preventative SCPs + detective CSPM + auto-remediation for the highest-severity classes.",
  },
  {
    topic: "Container supply chain (Sigstore, SLSA, SBOM)",
    look: "Base image provenance, dependency freshness, image signing, admission control.",
    expected: "Signed images verified at admission; SBOM produced per build; base images pinned by digest.",
    mistakes: "'latest' tag in production. Unsigned images admitted. SBOM generated but never consumed.",
    attackers: "One poisoned dependency in the build graph reaches every downstream service silently.",
    defenders: "Cosign + admission verification; SBOM-driven CVE alerting; base-image reproducibility.",
  },
  {
    topic: "Serverless & AI-workload security",
    look: "Function IAM, event sources, secret handling, training-data provenance, model artefact storage, inference-endpoint auth.",
    expected: "Least-privilege per function; managed secret store; PII policy on training data; auth+rate-limit on inference endpoints; audit of prompt/response for exfil patterns.",
    mistakes: "Reusing one broad role across all functions. Training on raw PII 'because it's convenient'. Public inference endpoints without auth.",
    attackers: "AI workloads combine sensitive data with public-ish endpoints — a growing target class.",
    defenders: "Treat AI pipelines as production data pipelines: same IAM discipline, same encryption, same audit.",
  },
];

export const M19_INCIDENTS = [
  { org: "Capital One (2019)", method: "SSRF against a WAF host → IMDS → assumed role → S3 exfil", recon: "External enumeration of the WAF instance", impact: "100M+ records; $190M settlement", lesson: "Cloud identity + metadata service exposure is the modern equivalent of a firewall gap." },
  { org: "SolarWinds Orion (2020)", method: "Supply-chain compromise; then Golden SAML → cloud tenant access", recon: "Dwell inside build system", impact: "Multiple US federal + Fortune 500 tenants compromised", lesson: "Cloud tenant compromise starts anywhere in the software supply chain, not at the cloud perimeter." },
  { org: "Codecov (2021)", method: "CI script tampered with; secrets exfiltrated across many customers' pipelines", recon: "Docker image customisation via a shell script", impact: "Downstream customer breaches across many companies", lesson: "Container/CI supply chain is the highest-blast-radius environment most orgs run." },
];

export const M19_DELIVERABLES = [
  { id: "scope", label: "Scope + read-only role provisioning confirmed" },
  { id: "iam", label: "IAM inventory with blast-radius per privileged identity" },
  { id: "exposure", label: "Public-exposure register across all in-scope services" },
  { id: "iac", label: "IaC misconfiguration findings + block-on-merge recommendations" },
  { id: "container", label: "Container supply-chain findings (SBOM, signing, base-image)" },
  { id: "serverless", label: "Serverless / function IAM audit" },
  { id: "ai", label: "AI workload data-flow risk map (training → model → inference)" },
  { id: "detect", label: "Cloud detection gap list vs MITRE ATT&CK Cloud matrix" },
  { id: "roadmap", label: "Cloud posture roadmap prioritised by blast radius" },
  { id: "exec", label: "Executive summary for CISO + Cloud CTO" },
];

export const M19_AI_ACTIONS = [
  { id: "analyze", label: "Analyze Findings", output: "Across 3 AWS orgs + 2 Azure tenants: 47 privileged identities with standing access, 12 public S3 buckets (2 hold PII), 1 public AKS API endpoint, 8 container images running `latest`, 6 functions with wildcard IAM, 3 inference endpoints without auth. IaC repo shows 22 high-severity findings merged in the last 90 days." },
  { id: "correlate", label: "Correlate Evidence", output: "The `DataScienceAdmin` AWS role, the public AKS API endpoint, and the unauthenticated inference endpoint all share a single AAD group `ai-platform-admins`. Compromise of any member's laptop yields three independent org-scale blast paths simultaneously." },
  { id: "assess", label: "Generate Assessment", output: "Cloud posture: BELOW REGULATORY EXPECTATION on identity blast-radius and AI workload isolation; ADEQUATE on network exposure guardrails; DEVELOPING on container supply chain. Detection coverage vs MITRE ATT&CK Cloud sits around 45% — significant gaps in credential-access and defence-evasion tactics." },
  { id: "recommend", label: "Generate Recommendations", output: "Priority 0 (≤14d): Remove public AKS API; auth on inference endpoints; revoke standing admin on `ai-platform-admins`; make S3 public denies a preventative SCP. Priority 1 (≤60d): JIT elevation via PIM; Cosign + admission verification for all clusters; pin base images by digest; per-function IAM. Priority 2 (≤180d): Feature store with PII policy; AI-pipeline audit-log ingestion; MITRE ATT&CK Cloud detection coverage to 80%." },
  { id: "exec", label: "Executive Summary", output: "GFS's cloud environments are competently networked but under-managed at the identity and supply-chain layers. A small number of over-privileged roles and unsigned container images create disproportionately large blast radii; the growing AI workloads add a new class of data-flow risk that the current CSPM tool does not measure. Four preventative controls, deployable within two weeks, remove the largest single failures. The strategic work is a JIT identity model and container supply-chain discipline over the next quarter." },
];

export const M19_SLUG = "cloud-computing";
