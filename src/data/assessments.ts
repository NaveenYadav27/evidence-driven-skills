// CEH v13 module assessments — 5 MCQs per module (100 total).
// Answers are indices into `options`. Explanations are shown after submission.

export interface MCQ {
  id: string;
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

export const ASSESSMENTS: Record<string, MCQ[]> = {
  m01: [
    { id: "m01-q1", q: "Which Cyber Kill Chain phase does egress filtering primarily disrupt?", options: ["Delivery", "Command & Control", "Exploitation", "Reconnaissance"], answer: 1, explain: "Egress filtering blocks outbound beacons to attacker infrastructure — the C2 phase." },
    { id: "m01-q2", q: "MITRE ATT&CK sub-technique notation for PowerShell is:", options: ["T1059", "T1059.001", "T1086", "T1547.001"], answer: 1, explain: "T1059 is Command & Scripting Interpreter; .001 is PowerShell." },
    { id: "m01-q3", q: "Ransomware double-extortion violates which CIA properties?", options: ["Confidentiality only", "Integrity only", "Availability + Confidentiality", "Availability only"], answer: 2, explain: "Encryption breaks Availability; leak-site publication breaks Confidentiality." },
    { id: "m01-q4", q: "Which document authorises an ethical hacker to test?", options: ["NDA", "ROE + signed authorisation", "MSA", "SOW alone"], answer: 1, explain: "Rules of Engagement + written authorisation are the legal shield." },
    { id: "m01-q5", q: "Grey-box testing means:", options: ["No knowledge", "Full source access", "Partial knowledge/credentials", "Physical testing"], answer: 2, explain: "Grey-box = limited docs or low-priv credentials, simulating an insider." },
  ],
  m02: [
    { id: "m02-q1", q: "DNS zone transfer (AXFR) is:", options: ["Passive recon", "Active recon", "Not recon", "OSINT"], answer: 1, explain: "AXFR sends queries to the target's nameserver — it is active." },
    { id: "m02-q2", q: "Which record exposes the mail infrastructure?", options: ["A", "MX", "NS", "PTR"], answer: 1, explain: "MX records list mail exchanger hosts." },
    { id: "m02-q3", q: "Certificate Transparency logs (crt.sh) are used to:", options: ["Revoke certs", "Enumerate subdomains", "Sign CSRs", "Rotate keys"], answer: 1, explain: "Every issued TLS cert is logged; querying CT reveals subdomain names." },
    { id: "m02-q4", q: "A WHOIS record's 'Registrant' field is often obscured by:", options: ["DNSSEC", "Registry-lock", "Privacy proxy", "CAA"], answer: 2, explain: "Registrar privacy services replace registrant PII with proxy contacts." },
    { id: "m02-q5", q: "Which Google dork finds exposed config files?", options: ["site:", "filetype:env", "inurl:admin", "intitle:index.of"], answer: 1, explain: "filetype:env surfaces .env files leaked to search engines." },
  ],
  m03: [
    { id: "m03-q1", q: "Nmap TCP SYN scan flag:", options: ["-sT", "-sS", "-sU", "-sA"], answer: 1, explain: "-sS = half-open SYN scan, default for privileged users." },
    { id: "m03-q2", q: "OS-fingerprint signal that survives banner spoofing:", options: ["Server header", "TCP/IP stack quirks", "Robots.txt", "TLS SNI"], answer: 1, explain: "TCP window size, TTL, and option order are set by the kernel." },
    { id: "m03-q3", q: "A 405 Method Not Allowed on TRACE indicates:", options: ["Server compromised", "TRACE disabled", "WAF absent", "TLS downgrade"], answer: 1, explain: "The server explicitly rejects the TRACE verb — good hardening." },
    { id: "m03-q4", q: "ASN lookups map IPs to:", options: ["Physical rack", "Owning organisation", "CVE", "MAC vendor"], answer: 1, explain: "Autonomous System Numbers identify the routing organisation." },
    { id: "m03-q5", q: "The HSTS header protects against:", options: ["XSS", "SSL-strip / downgrade", "CSRF", "Clickjacking"], answer: 1, explain: "HSTS forces HTTPS, defeating stripping proxies." },
  ],
  m04: [
    { id: "m04-q1", q: "SNMP default community string 'public' allows:", options: ["Write access", "Read access", "Reboot", "Nothing"], answer: 1, explain: "'public' = read; 'private' = write. Both are legacy weaknesses." },
    { id: "m04-q2", q: "NetBIOS null session on port 445 enumerates:", options: ["Shares & users", "TLS certs", "DNS zones", "Kernel version"], answer: 0, explain: "Anonymous IPC$ connection lists shares, users, and policies." },
    { id: "m04-q3", q: "DMARC 'p=reject' means:", options: ["Warn only", "Quarantine", "Discard unauth mail", "Ignore"], answer: 2, explain: "Reject tells receivers to drop unauthenticated mail outright." },
    { id: "m04-q4", q: "LDAP anonymous bind exposes:", options: ["Directory tree", "TLS certs", "Kerberos tickets", "Nothing"], answer: 0, explain: "Anonymous bind can dump users, groups, and OU structure." },
    { id: "m04-q5", q: "CAA record purpose:", options: ["Cache DNS", "Restrict which CAs may issue", "Encrypt zone", "Rate-limit"], answer: 1, explain: "CAA declares authorised Certificate Authorities for the domain." },
  ],
  m05: [
    { id: "m05-q1", q: "CVSS v3.1 base metric that captures pre-auth exploitation:", options: ["AV:N", "PR:N", "UI:N", "AC:L"], answer: 1, explain: "PR:N = Privileges Required None." },
    { id: "m05-q2", q: "A CVSS 9.8 vector is typically:", options: ["Local privesc", "Remote unauth RCE", "DoS only", "Info leak"], answer: 1, explain: "AV:N/AC:L/PR:N/UI:N with C:H/I:H/A:H yields ~9.8 — classic RCE." },
    { id: "m05-q3", q: "Nessus 'authenticated scan' vs unauthenticated:", options: ["Slower only", "Finds patch-level flaws", "Same coverage", "Only for web apps"], answer: 1, explain: "Credentials reveal missing patches invisible from network." },
    { id: "m05-q4", q: "KEV catalog (CISA) lists:", options: ["All CVEs", "Exploited-in-the-wild", "Windows-only", "Zero-days"], answer: 1, explain: "Known Exploited Vulnerabilities — prioritise these first." },
    { id: "m05-q5", q: "False positive validation requires:", options: ["Re-scan only", "Manual PoC", "Vendor call", "Firewall check"], answer: 1, explain: "Only a manual proof-of-concept confirms exploitability." },
  ],
  m06: [
    { id: "m06-q1", q: "Kerberoasting targets:", options: ["NTLM hash", "TGS service tickets", "Machine account", "DPAPI"], answer: 1, explain: "Requesting TGS for SPN-bound accounts yields crackable tickets." },
    { id: "m06-q2", q: "Pass-the-Hash relies on:", options: ["Cleartext password", "NTLM hash reuse", "Kerberos AS-REP", "SAM export"], answer: 1, explain: "The NTLM hash itself is a credential; no cracking needed." },
    { id: "m06-q3", q: "Linux SUID binary risk:", options: ["Runs as owner", "Runs as caller", "No execute", "Deletes on run"], answer: 0, explain: "SUID executes with the file owner's UID — often root." },
    { id: "m06-q4", q: "GPP cpassword is decrypted with:", options: ["MD5", "AES-256 (known key)", "RSA", "bcrypt"], answer: 1, explain: "Microsoft published the AES key — trivial decrypt of SYSVOL passwords." },
    { id: "m06-q5", q: "Best defence against Mimikatz:", options: ["Disable antivirus", "Credential Guard + LSA protection", "Rename lsass", "Reboot daily"], answer: 1, explain: "Credential Guard isolates LSA secrets in VBS enclave." },
  ],
  m07: [
    { id: "m07-q1", q: "Fileless malware persists via:", options: ["EXE on disk", "Registry + WMI + scheduled tasks", "BIOS only", "It doesn't persist"], answer: 1, explain: "Living-off-the-land stores payloads in registry blobs / WMI subs." },
    { id: "m07-q2", q: "YARA rules match on:", options: ["Network only", "Byte patterns & strings", "Certificates only", "Hashes only"], answer: 1, explain: "YARA scans binaries for signatures — strings, opcodes, entropy." },
    { id: "m07-q3", q: "Domain-generation algorithm (DGA) defeats:", options: ["Sandboxing", "Static blocklists", "TLS inspection", "Sinkholing"], answer: 1, explain: "DGAs create thousands of pseudo-random domains daily." },
    { id: "m07-q4", q: "Ransomware IoC most useful for hunting:", options: ["File hash", "Extension change + ransom-note filename", "Icon", "Screensaver"], answer: 1, explain: "Encrypted-extension + note give high-fidelity behavioural IoC." },
    { id: "m07-q5", q: "Best malware analysis first step:", options: ["Run on prod", "Static triage in sandbox", "Delete", "Reboot"], answer: 1, explain: "Hash → strings → PE headers → detonate only in isolation." },
  ],
  m08: [
    { id: "m08-q1", q: "ARP spoofing enables:", options: ["MITM on LAN", "Cross-VLAN attack", "TLS break", "Password reset"], answer: 0, explain: "Poisoning ARP cache redirects L2 traffic through attacker." },
    { id: "m08-q2", q: "DHCP starvation floods with:", options: ["ICMP", "DISCOVER requests", "SYN", "ARP"], answer: 1, explain: "Exhaust the DHCP pool, then run a rogue DHCP." },
    { id: "m08-q3", q: "Port mirroring is legitimate for:", options: ["Attack", "SPAN/IDS capture", "Bypass firewall", "VLAN hop"], answer: 1, explain: "SPAN ports copy traffic to IDS/analysis hosts." },
    { id: "m08-q4", q: "802.1X mitigates:", options: ["DNS spoofing", "Rogue devices on network", "Ransomware", "SQLi"], answer: 1, explain: "Port-based auth blocks unauthorised NICs from the LAN." },
    { id: "m08-q5", q: "Best sniffer defence:", options: ["Hubs", "End-to-end encryption + switched fabric", "MAC filtering", "Longer passwords"], answer: 1, explain: "TLS/IPSec plus a switched network reduce plaintext exposure." },
  ],
  m09: [
    { id: "m09-q1", q: "SPF 'softfail' qualifier:", options: ["+", "-", "~", "?"], answer: 2, explain: "~all = softfail, accept but flag; -all = hardfail." },
    { id: "m09-q2", q: "Pretexting is:", options: ["Physical break-in", "Fabricated identity to elicit info", "Tailgating", "USB drop"], answer: 1, explain: "The attacker invents a plausible story/role." },
    { id: "m09-q3", q: "BEC typically bypasses:", options: ["MFA", "Email filters via display-name spoofing", "TLS", "Antivirus"], answer: 1, explain: "Display-name lookalikes ('CEO <attacker@gmail>') slip through." },
    { id: "m09-q4", q: "Best defence against MFA-fatigue:", options: ["Push spam", "Number-matching / FIDO2", "SMS OTP", "Longer PIN"], answer: 1, explain: "FIDO2 or number-matching push prevents blind approval." },
    { id: "m09-q5", q: "Vishing = ?", options: ["Video phishing", "Voice phishing", "Visual phishing", "Vendor phishing"], answer: 1, explain: "Phone-call social engineering, often spoofed CLI." },
  ],
  m10: [
    { id: "m10-q1", q: "SYN flood exhausts:", options: ["Bandwidth", "Half-open connection table", "Disk", "CPU cache"], answer: 1, explain: "Kernel backlog fills with half-open conns awaiting ACK." },
    { id: "m10-q2", q: "Highest DNS amplification factor uses:", options: ["A record", "ANY / DNSSEC", "MX", "PTR"], answer: 1, explain: "ANY responses + DNSSEC records give ~50-70× amplification." },
    { id: "m10-q3", q: "Memcached UDP amplification factor peaked around:", options: ["10×", "500×", "51000×", "1.5×"], answer: 2, explain: "GitHub 2018 attack — 51000× amplification observed." },
    { id: "m10-q4", q: "Anycast helps DDoS defence by:", options: ["Encrypting", "Spreading load geographically", "Blocking UDP", "Filtering SYN"], answer: 1, explain: "Traffic hits nearest PoP; volumetric floods are distributed." },
    { id: "m10-q5", q: "BCP38 / uRPF prevents:", options: ["DNS poisoning", "Source IP spoofing", "TLS downgrade", "ARP spoof"], answer: 1, explain: "Ingress filtering by source verifies the return path." },
  ],
  m11: [
    { id: "m11-q1", q: "JWT alg=none accepts:", options: ["HS256 only", "Any signature", "No signature (unsigned)", "RSA only"], answer: 2, explain: "Vulnerable libs treat 'none' as valid — attacker forges any claim." },
    { id: "m11-q2", q: "Cookie flag preventing JS access:", options: ["Secure", "HttpOnly", "SameSite", "Path"], answer: 1, explain: "HttpOnly hides the cookie from document.cookie." },
    { id: "m11-q3", q: "SameSite=Strict impact:", options: ["Blocks cross-site sends", "Allows all", "Encrypts cookie", "Signs cookie"], answer: 0, explain: "Cookie is never sent on cross-origin navigation." },
    { id: "m11-q4", q: "Session fixation fix:", options: ["Reuse ID", "Rotate session ID on login", "Longer ID", "Store in URL"], answer: 1, explain: "Regenerate the session identifier after auth boundary crossings." },
    { id: "m11-q5", q: "TLS 1.3 defeats:", options: ["MITM with valid cert", "Downgrade to SSLv3", "DNS spoof", "Phishing"], answer: 1, explain: "TLS 1.3 removes legacy ciphers and enforces downgrade protection." },
  ],
  m12: [
    { id: "m12-q1", q: "Nmap fragmentation flag:", options: ["-f", "-A", "-O", "-sV"], answer: 0, explain: "-f fragments packets to slip past naïve packet inspection." },
    { id: "m12-q2", q: "Decoy scan uses flag:", options: ["-D", "-e", "-P0", "-T5"], answer: 0, explain: "-D RND:10 spoofs 10 decoy source IPs alongside real one." },
    { id: "m12-q3", q: "Honeypot type that emulates services only:", options: ["High-interaction", "Low-interaction", "Pure", "Production"], answer: 1, explain: "Low-interaction honeypots (e.g. Cowrie) emulate services." },
    { id: "m12-q4", q: "Signature IDS weakness:", options: ["High CPU", "Misses zero-day", "Cannot log", "No GUI"], answer: 1, explain: "No signature = no detection; anomaly IDS complements." },
    { id: "m12-q5", q: "DNS tunneling exfil detected by:", options: ["Query length + entropy", "TLS SNI", "MAC address", "Port 80"], answer: 0, explain: "Unusually long TXT/NULL queries with high entropy = tunnel." },
  ],
  m13: [
    { id: "m13-q1", q: "HSTS max-age minimum for preload list:", options: ["30d", "6mo", "1y", "2y"], answer: 2, explain: "31536000 seconds (1 year) is the preload requirement." },
    { id: "m13-q2", q: "robots.txt is:", options: ["Security control", "Advisory recon file", "Firewall rule", "Cache config"], answer: 1, explain: "Merely advisory — but a goldmine of hidden paths for recon." },
    { id: "m13-q3", q: "IIS short-name (~) attack enables:", options: ["RCE", "8.3 filename enumeration", "Auth bypass", "SQLi"], answer: 1, explain: "Tilde suffix leaks 8.3 short names — reveals hidden files." },
    { id: "m13-q4", q: "Directory listing exposure risk:", options: ["Low always", "Reveals backups & configs", "None", "Only images"], answer: 1, explain: "Autoindex often exposes .bak, .env, .git — critical leaks." },
    { id: "m13-q5", q: "X-Frame-Options: DENY prevents:", options: ["XSS", "Clickjacking", "SQLi", "CSRF"], answer: 1, explain: "Blocks embedding the page in any frame." },
  ],
  m14: [
    { id: "m14-q1", q: "Stored XSS lives in:", options: ["URL", "Server-side storage", "Browser cache", "DNS"], answer: 1, explain: "Payload is persisted (DB, comments) and served to every viewer." },
    { id: "m14-q2", q: "Best XSS defence:", options: ["Blocklist <script>", "Context-aware output encoding + CSP", "Rot13", "Base64"], answer: 1, explain: "Encode at output per context; CSP is defence-in-depth." },
    { id: "m14-q3", q: "CSRF token requirement:", options: ["Predictable", "Per-session, unpredictable, verified", "Reusable forever", "Optional"], answer: 1, explain: "Unpredictable per-session token verified on state-changing requests." },
    { id: "m14-q4", q: "SSRF classically targets:", options: ["Public API", "Internal 169.254.169.254 metadata", "DNS root", "Public CDN"], answer: 1, explain: "Cloud IMDS at 169.254.169.254 leaks IAM creds." },
    { id: "m14-q5", q: "OWASP #1 risk (2021):", options: ["XSS", "Broken Access Control", "SQLi", "SSRF"], answer: 1, explain: "A01:2021 — Broken Access Control." },
  ],
  m15: [
    { id: "m15-q1", q: "UNION-based SQLi requires matching:", options: ["Column count + types", "Rows only", "Table names", "Nothing"], answer: 0, explain: "UNION SELECT needs equal column count and compatible types." },
    { id: "m15-q2", q: "Blind boolean SQLi infers via:", options: ["Error messages", "Page-content difference on true/false", "HTTP codes only", "TLS handshakes"], answer: 1, explain: "Compare responses when injected condition is true vs false." },
    { id: "m15-q3", q: "Time-based blind uses:", options: ["Sleep()/pg_sleep()", "Union", "Error", "Header"], answer: 0, explain: "SLEEP(5) or pg_sleep(5) delay reveals true condition." },
    { id: "m15-q4", q: "Best SQLi defence:", options: ["WAF only", "Parameterised queries + least priv", "Escaping quotes", "Hidden fields"], answer: 1, explain: "Prepared statements make injection structurally impossible." },
    { id: "m15-q5", q: "sqlmap --level and --risk control:", options: ["Speed", "Payload aggressiveness", "Output format", "Proxy"], answer: 1, explain: "Higher level/risk enables more intrusive test vectors." },
  ],
  m16: [
    { id: "m16-q1", q: "WPA2 4-way handshake secret is:", options: ["PMK", "GTK", "PTK derived from PMK+nonces", "IV"], answer: 2, explain: "PTK = PRF(PMK, ANonce, SNonce, MACs)." },
    { id: "m16-q2", q: "WPS PIN weakness:", options: ["8 digits split into 4+3+checksum", "16 hex", "None", "AES-only"], answer: 0, explain: "PIN halves are validated separately → 11 000 attempts max." },
    { id: "m16-q3", q: "Evil-twin attack requires:", options: ["Same SSID + stronger signal", "Different SSID", "Wired uplink", "WPA3 only"], answer: 0, explain: "Rogue AP mimics SSID; clients auto-associate to strongest." },
    { id: "m16-q4", q: "WPA3 SAE replaces:", options: ["PSK 4-way handshake", "TLS", "WEP", "MAC filtering"], answer: 0, explain: "SAE (Dragonfly) is offline-dictionary resistant." },
    { id: "m16-q5", q: "Deauth frame class in 802.11:", options: ["Data", "Control", "Management (unprotected pre-MFP)", "Beacon"], answer: 2, explain: "Deauth is management; without 802.11w MFP it can be spoofed." },
  ],
  m17: [
    { id: "m17-q1", q: "Android 'dangerous' permission requires:", options: ["Install-time grant", "Runtime user prompt", "Root", "OEM approval"], answer: 1, explain: "Since Android 6, dangerous perms are runtime-gated." },
    { id: "m17-q2", q: "iOS jailbreak breaks:", options: ["Sandbox + code-signing", "Only sandbox", "Only signing", "Neither"], answer: 0, explain: "Jailbreaks disable AMFI and sandbox restrictions." },
    { id: "m17-q3", q: "MDM push profile can:", options: ["Read call logs freely", "Enforce PIN, wipe, restrict apps", "Bypass biometric", "Install kernel driver"], answer: 1, explain: "MDM manages posture: PIN, encryption, remote wipe." },
    { id: "m17-q4", q: "APK reverse-engineering tool:", options: ["strings only", "jadx / apktool", "sqlmap", "nmap"], answer: 1, explain: "jadx decompiles DEX to Java; apktool disassembles smali." },
    { id: "m17-q5", q: "Certificate pinning defends against:", options: ["Root CA compromise / MITM", "Battery drain", "Root detection", "Storage exhaustion"], answer: 0, explain: "Pinning refuses connections signed by unexpected CAs." },
  ],
  m18: [
    { id: "m18-q1", q: "MQTT default port and auth posture:", options: ["1883 / often anon", "443 / TLS+auth", "22 / SSH", "80 / basic"], answer: 0, explain: "1883/tcp — many brokers are exposed with no auth." },
    { id: "m18-q2", q: "Modbus TCP concern:", options: ["Strong auth", "No auth / plaintext on port 502", "TLS only", "Kerberos"], answer: 1, explain: "Legacy OT protocol — no authentication or encryption." },
    { id: "m18-q3", q: "Shodan is used to find:", options: ["Vuln scans", "Internet-exposed devices/services", "Malware samples", "Zero-days"], answer: 1, explain: "Shodan indexes banner + service metadata across the internet." },
    { id: "m18-q4", q: "Purdue model level 0 is:", options: ["ERP", "Physical process (sensors/actuators)", "DMZ", "SCADA"], answer: 1, explain: "Level 0 = the process; Level 5 = enterprise." },
    { id: "m18-q5", q: "Best IoT hardening baseline:", options: ["Default creds", "Change creds + disable UPnP + segment VLAN", "Public IP", "Open telnet"], answer: 1, explain: "Change defaults, segment, disable discovery protocols." },
  ],
  m19: [
    { id: "m19-q1", q: "S3 bucket 'public-read' ACL exposes:", options: ["Nothing", "Object listing/reads to anyone", "Only signed URLs", "Only same-account"], answer: 1, explain: "Any anonymous requester can list/GET objects." },
    { id: "m19-q2", q: "AWS IMDSv2 mitigates:", options: ["Cost", "SSRF stealing credentials", "S3 cost", "Region latency"], answer: 1, explain: "Session-token requirement blocks blind SSRF from reading /latest/meta-data." },
    { id: "m19-q3", q: "Azure Storage SAS token risk:", options: ["Encrypted always", "Long-lived, broad-scope tokens", "Requires MFA", "Cannot be revoked (yes)"], answer: 1, explain: "SAS often over-scoped/long-lived and can leak via logs." },
    { id: "m19-q4", q: "GCP IAM least-priv role for read-only bucket:", options: ["Owner", "Editor", "Viewer / storage.objectViewer", "Admin"], answer: 2, explain: "Predefined storage.objectViewer grants only GET/LIST." },
    { id: "m19-q5", q: "Cloud shared-responsibility: patching the guest OS is:", options: ["Provider", "Customer (in IaaS)", "Shared automatically", "Nobody"], answer: 1, explain: "In IaaS the customer patches guest OS + apps." },
  ],
  m20: [
    { id: "m20-q1", q: "AES key sizes:", options: ["56/112/168", "128/192/256", "1024/2048", "160/224/256"], answer: 1, explain: "AES supports 128, 192, and 256-bit keys." },
    { id: "m20-q2", q: "RSA security relies on:", options: ["Discrete log", "Integer factorisation", "Lattice problems", "Hashing"], answer: 1, explain: "Factoring the product of two large primes is hard." },
    { id: "m20-q3", q: "SHA-1 status:", options: ["Recommended", "Deprecated (collisions demonstrated)", "Quantum-safe", "Faster than MD5"], answer: 1, explain: "SHAttered 2017 — collisions found; do not use for signatures." },
    { id: "m20-q4", q: "HMAC provides:", options: ["Encryption", "Integrity + authenticity", "Compression", "Key exchange"], answer: 1, explain: "Keyed hash proves message wasn't tampered and came from key holder." },
    { id: "m20-q5", q: "Perfect Forward Secrecy requires:", options: ["Static RSA key exchange", "Ephemeral DH (DHE/ECDHE)", "Longer certs", "Faster CPU"], answer: 1, explain: "Ephemeral keys mean past sessions stay safe if long-term key leaks." },
  ],
};

export function getAssessment(moduleId: string): MCQ[] {
  return ASSESSMENTS[moduleId] ?? [];
}
