// CEH v13 module challenges — 3 per module (60 total).
// Each challenge poses a scenario and expects a concrete answer.
// Accepted answers are matched case-insensitively; multiple aliases allowed.

export interface Challenge {
  id: string;
  moduleId: string;
  title: string;
  scenario: string;
  hint: string;
  answers: string[]; // any match (case-insensitive) counts as solved
  points: number;
  difficulty: "beginner" | "intermediate" | "advanced";
}

const c = (
  moduleId: string,
  n: number,
  title: string,
  scenario: string,
  hint: string,
  answers: string[],
  points = 100,
  difficulty: Challenge["difficulty"] = "intermediate",
): Challenge => ({
  id: `${moduleId}-ch${n}`,
  moduleId,
  title,
  scenario,
  hint,
  answers,
  points,
  difficulty,
});

export const CHALLENGES: Challenge[] = [
  // M01
  c("m01", 1, "Kill-chain phase: PowerShell downloader beacon", "A phishing macro downloads a PowerShell stager that opens a reverse shell to attacker.tld. Which single kill-chain phase does the reverse-shell traffic represent?", "Think of long-lived attacker channel.", ["c2", "command and control", "command & control"]),
  c("m01", 2, "ATT&CK ID for scheduled task persistence", "An operator drops a schtasks /create call to run malware.exe hourly. Provide the ATT&CK sub-technique ID.", "T1053.###", ["T1053.005"]),
  c("m01", 3, "CIA property broken by web defacement", "Attackers replace the homepage HTML. Which CIA property is primarily violated?", "Not availability.", ["integrity"]),

  // M02
  c("m02", 1, "Subdomain hunt", "Given only the domain 'example.com', which single DNS-adjacent public data source lets you list every historical hostname without touching the target?", "TLS certificate logs.", ["crt.sh", "certificate transparency", "ct", "ct logs"]),
  c("m02", 2, "Registrar redaction bypass", "WHOIS returns 'REDACTED FOR PRIVACY'. Which JSON-based lookup protocol may still expose registration events (creation, expiry, status)?", "The modern replacement.", ["rdap"]),
  c("m02", 3, "AXFR classification", "Is a successful DNS zone transfer against ns1.target.com classed as passive or active recon?", "You are talking to the target's nameserver.", ["active"]),

  // M03
  c("m03", 1, "Nmap flag for stealth SYN", "Which single Nmap flag performs a half-open SYN scan?", "Two chars.", ["-sS", "-ss"]),
  c("m03", 2, "Missing header", "curl -I returns no 'Strict-Transport-Security' line. Which security header is missing?", "It forces HTTPS.", ["hsts", "strict-transport-security"]),
  c("m03", 3, "OS fingerprint from TTL 64", "A default TTL of 64 in the reply most commonly indicates which OS family?", "Not Windows (128) or Cisco (255).", ["linux", "unix", "linux/unix"]),

  // M04
  c("m04", 1, "SNMP read community", "You enumerate a legacy switch. Which default community string grants read-only access?", "Six letters.", ["public"]),
  c("m04", 2, "SMB null session port", "Which TCP port do you connect to for a modern SMB null session enumeration?", "Not 139.", ["445"]),
  c("m04", 3, "DMARC hard-reject policy", "Which p= value in a DMARC record instructs receivers to discard unauthenticated mail?", "One word.", ["reject", "p=reject"]),

  // M05
  c("m05", 1, "CVSS remote unauth RCE score", "Give the numeric CVSS 3.1 base score of a network-attack, no-privs, no-UI RCE with C:H/I:H/A:H.", "Nine point something.", ["9.8"]),
  c("m05", 2, "Log4Shell CVE ID", "Provide the CVE identifier for Log4Shell.", "2021.", ["CVE-2021-44228"]),
  c("m05", 3, "KEV catalog owner", "Which US federal agency publishes the Known Exploited Vulnerabilities catalog?", "Four letters.", ["cisa"]),

  // M06
  c("m06", 1, "Windows credential-material attack name", "You extract NTLM hashes from lsass and reuse them directly against SMB. Name this attack.", "Two words with dashes.", ["pass-the-hash", "pth", "pass the hash"]),
  c("m06", 2, "Linux SUID enumeration one-liner tool", "Which single word describes the classic 'find / -perm -4000' output — the special bit set?", "Three letters.", ["suid"]),
  c("m06", 3, "Kerberos service-ticket cracking name", "Requesting TGS for SPN-enabled accounts and cracking offline is called…", "Ends in -ing.", ["kerberoasting"]),

  // M07
  c("m07", 1, "Fileless malware storage location", "Name one common Windows registry hive/subkey used by fileless persistence to store payloads.", "HK\\...\\Run or WMI.", ["run", "hklm\\software\\microsoft\\windows\\currentversion\\run", "wmi", "hkcu\\software\\microsoft\\windows\\currentversion\\run"]),
  c("m07", 2, "IoC hash algorithm preferred by MISP", "Which cryptographic hash is the modern default for malware IoC sharing?", "256 bits.", ["sha256", "sha-256"]),
  c("m07", 3, "Domain-generation defence", "What defensive technique replaces static blocklists to counter DGA-based C2?", "Two words.", ["sinkholing", "dns sinkhole", "sinkhole"]),

  // M08
  c("m08", 1, "Layer-2 MITM attack", "You poison the switch's ARP cache to intercept traffic between two hosts. Name the attack.", "Two words.", ["arp spoofing", "arp poisoning", "arp cache poisoning"]),
  c("m08", 2, "VLAN hopping via trunk exploit", "Which switch-port protocol should be disabled to prevent DTP-based VLAN hopping?", "Three-letter ACL? No — three-letter Cisco protocol.", ["dtp", "dynamic trunking protocol"]),
  c("m08", 3, "Auth protocol that blocks rogue NICs", "Which IEEE standard provides port-based network access control?", "802.1?", ["802.1x"]),

  // M09
  c("m09", 1, "Phishing URL that mimics 'paypal.com' via lookalike TLD", "Give one plausible IDN homoglyph or lookalike domain you would flag for paypal.com.", "Cyrillic 'a'/'o' or wrong TLD.", ["paypa1.com", "paypal.co", "paypal-secure.com", "paypa1-login.com", "paypal.com.login.tld", "рaypal.com"]),
  c("m09", 2, "MFA bypass technique via repeated push spam", "Two-word name for the attack where users approve a push to make prompts stop.", "Fatigue.", ["mfa fatigue", "mfa-fatigue", "push fatigue", "prompt bombing"]),
  c("m09", 3, "SPF hard-fail qualifier", "Which SPF qualifier means 'reject any sender not listed'?", "Single char.", ["-all", "-"]),

  // M10
  c("m10", 1, "Highest amplification protocol", "Which UDP service produced the record ~51000× amplification (GitHub 2018)?", "Caching layer.", ["memcached"]),
  c("m10", 2, "Ingress-filtering BCP number", "Which BCP number describes source-address ingress filtering?", "BCP##.", ["bcp38", "38"]),
  c("m10", 3, "TCP flood exhausting backlog", "Name the classic connection-table exhaustion flood.", "Uses one TCP flag.", ["syn flood", "syn-flood", "tcp syn flood"]),

  // M11
  c("m11", 1, "JWT alg to reject", "Which 'alg' value should servers explicitly reject in JWTs?", "Four letters.", ["none"]),
  c("m11", 2, "Cookie flag blocking JS access", "Which cookie flag prevents document.cookie readability?", "One word.", ["httponly", "http-only"]),
  c("m11", 3, "Session-fixation fix", "What must the server do to the session ID at successful login?", "R__________.", ["rotate", "regenerate", "regenerate session id", "rotate session id"]),

  // M12
  c("m12", 1, "Nmap fragmentation flag", "Single flag to fragment packets during scan.", "Two chars.", ["-f"]),
  c("m12", 2, "Cowrie category", "Cowrie SSH honeypot is a ______-interaction honeypot.", "Not high.", ["low", "low-interaction", "low interaction"]),
  c("m12", 3, "IDS blind spot", "Signature-based IDS is fundamentally blind to which class of threats?", "Not yet indexed.", ["zero-day", "0day", "zero day", "novel", "unknown"]),

  // M13
  c("m13", 1, "HSTS preload minimum max-age", "What is the minimum max-age (seconds) required to submit to the HSTS preload list?", "One year.", ["31536000"]),
  c("m13", 2, "IIS ~ vulnerability", "The IIS tilde enumeration attack leaks which naming convention?", "8.3.", ["8.3", "short filename", "8.3 short name", "short file name", "8.3 filenames"]),
  c("m13", 3, "Anti-clickjacking header (modern)", "Which CSP directive replaces X-Frame-Options for framing control?", "frame-________", ["frame-ancestors"]),

  // M14
  c("m14", 1, "OWASP #1 (2021)", "Which OWASP Top-10 2021 category is A01?", "Access.", ["broken access control", "a01", "a01:2021"]),
  c("m14", 2, "Cloud metadata IP", "Which IPv4 address hosts the AWS instance metadata service?", "169.254.___.___", ["169.254.169.254"]),
  c("m14", 3, "Stored-XSS output-encoding context", "Encoding the string '<img onerror=alert(1)>' inside an HTML attribute requires which encoding?", "HTML entity vs JS vs URL.", ["html attribute", "html-attribute", "attribute encoding", "html entity"]),

  // M15
  c("m15", 1, "Boolean SQLi probe payload", "Provide a minimal always-true tautology payload appended to a WHERE clause.", "OR 1=1.", ["' or 1=1--", "or 1=1", "' or '1'='1", "or '1'='1'--", "or 1=1--"]),
  c("m15", 2, "Time-based DB function on MySQL", "Which MySQL function is used for time-based blind SQLi?", "Five letters.", ["sleep", "sleep()"]),
  c("m15", 3, "Best structural SQLi defence", "Two-word primary defence that makes SQLi structurally impossible.", "Prepared…", ["parameterized queries", "parameterised queries", "prepared statements", "parameterized query", "prepared statement"]),

  // M16
  c("m16", 1, "WPA2 offline crackable capture", "Which 4-way-handshake artefact is captured for offline WPA2 cracking?", "P__.", ["pmkid", "eapol", "4-way handshake", "handshake"]),
  c("m16", 2, "WPS PIN max attempts", "Because the WPS PIN is validated in halves, the maximum offline attempts is roughly:", "About 11 000.", ["11000", "11,000", "~11000"]),
  c("m16", 3, "WPA3 handshake name", "Which handshake replaces WPA2's PSK 4-way in WPA3-Personal?", "Three letters or 'Dragonfly'.", ["sae", "dragonfly", "simultaneous authentication of equals"]),

  // M17
  c("m17", 1, "APK decompiler", "Name a widely-used tool that decompiles DEX bytecode to readable Java.", "3-4 letters.", ["jadx"]),
  c("m17", 2, "iOS defence against MITM after root-CA install", "Which per-app defence rejects unexpected TLS chains?", "Two words.", ["certificate pinning", "cert pinning", "ssl pinning", "tls pinning", "pinning"]),
  c("m17", 3, "Android permission tier prompting user at runtime", "What Google term categorises perms like CAMERA and LOCATION that require runtime prompts?", "One word.", ["dangerous"]),

  // M18
  c("m18", 1, "OT protocol on port 502", "Name the industrial protocol commonly exposed on TCP/502 with no authentication.", "M_____.", ["modbus", "modbus tcp"]),
  c("m18", 2, "Search engine for exposed devices", "Which search engine indexes internet-facing services and banners for IoT recon?", "Six letters.", ["shodan"]),
  c("m18", 3, "MQTT default TCP port", "Give the default plaintext port for the MQTT broker.", "Four digits.", ["1883"]),

  // M19
  c("m19", 1, "AWS metadata service hardening version", "Which IMDS version requires a session token, mitigating SSRF-based credential theft?", "V__.", ["imdsv2", "v2"]),
  c("m19", 2, "S3 misconfig granting anon list/read", "Which single ACL value most commonly indicates a publicly readable S3 bucket?", "P_____-r___.", ["public-read", "publicread", "public read"]),
  c("m19", 3, "Least-priv GCP role for reading objects", "Provide the predefined GCP IAM role for read-only object access to a bucket.", "roles/storage.__________", ["storage.objectviewer", "roles/storage.objectviewer", "objectviewer"]),

  // M20
  c("m20", 1, "Broken hash for signatures", "Which widely-deployed hash produced practical collisions in the SHAttered attack?", "Four chars.", ["sha1", "sha-1"]),
  c("m20", 2, "PFS-providing key exchange", "Which key-exchange family enables Perfect Forward Secrecy in TLS?", "E___(EC)DH.", ["ecdhe", "dhe", "ephemeral diffie-hellman", "diffie-hellman ephemeral"]),
  c("m20", 3, "Symmetric cipher standard since 2001", "Name the NIST-standard symmetric block cipher that replaced 3DES.", "Three letters.", ["aes"]),
];

export function getModuleChallenges(moduleId: string): Challenge[] {
  return CHALLENGES.filter((x) => x.moduleId === moduleId);
}

// -------- solve tracking (client-only, per-user localStorage) --------
const KEY = "shadowxlab-challenges-v1";
type SolveMap = Record<string, { solvedAt: number; attempts: number }>;

function read(): SolveMap {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { return {}; }
}
function write(m: SolveMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(m));
}

export function getSolves(): SolveMap { return read(); }
export function isSolved(id: string): boolean { return !!read()[id]?.solvedAt; }
export function recordAttempt(id: string, solved: boolean) {
  const m = read();
  const prev = m[id] ?? { solvedAt: 0, attempts: 0 };
  m[id] = { solvedAt: solved ? Date.now() : prev.solvedAt, attempts: prev.attempts + 1 };
  write(m);
}
export function checkAnswer(ch: Challenge, input: string): boolean {
  const norm = input.trim().toLowerCase();
  if (!norm) return false;
  return ch.answers.some((a) => a.trim().toLowerCase() === norm);
}
