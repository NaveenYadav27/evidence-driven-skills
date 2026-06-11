export type ModuleStatus = "available" | "preview" | "locked";

export interface CEHModule {
  id: string;          // "m02"
  number: number;      // 2
  slug: string;        // "footprinting-and-reconnaissance"
  title: string;
  short: string;       // one-line tagline
  domain: string;      // CEH domain
  status: ModuleStatus;
  labCount: number;
  challengeCount: number;
  tools: string[];
}

export const MODULES: CEHModule[] = [
  { id: "m01", number: 1, slug: "introduction-to-ethical-hacking", title: "Introduction to Ethical Hacking", short: "Threat landscape, attack lifecycle, laws & ethics.", domain: "Information Security", status: "preview", labCount: 6, challengeCount: 2, tools: ["MITRE ATT&CK", "Cyber Kill Chain"] },
  { id: "m02", number: 2, slug: "footprinting-and-reconnaissance", title: "Footprinting and Reconnaissance", short: "Passive & active intel gathering on real targets.", domain: "Reconnaissance", status: "available", labCount: 4, challengeCount: 1, tools: ["whois", "dig", "nslookup", "subs (crt.sh)", "wayback"] },
  { id: "m03", number: 3, slug: "scanning-networks", title: "Scanning Networks", short: "Host discovery, port scanning, service fingerprinting.", domain: "Scanning", status: "preview", labCount: 18, challengeCount: 6, tools: ["nmap", "masscan", "hping3"] },
  { id: "m04", number: 4, slug: "enumeration", title: "Enumeration", short: "Extract users, shares, services from exposed protocols.", domain: "Enumeration", status: "preview", labCount: 12, challengeCount: 4, tools: ["enum4linux", "smbclient", "rpcclient", "ldapsearch"] },
  { id: "m05", number: 5, slug: "vulnerability-analysis", title: "Vulnerability Analysis", short: "CVSS, CVE triage, vulnerability scanners.", domain: "Analysis", status: "preview", labCount: 10, challengeCount: 3, tools: ["Nessus", "OpenVAS", "Nikto"] },
  { id: "m06", number: 6, slug: "system-hacking", title: "System Hacking", short: "Gain access, escalate, persist, cover tracks.", domain: "Exploitation", status: "preview", labCount: 16, challengeCount: 5, tools: ["Metasploit", "Mimikatz", "John", "Hashcat"] },
  { id: "m07", number: 7, slug: "malware-threats", title: "Malware Threats", short: "Static & dynamic analysis of trojans, worms, RATs.", domain: "Malware", status: "preview", labCount: 8, challengeCount: 3, tools: ["pestudio", "Cuckoo", "Ghidra"] },
  { id: "m08", number: 8, slug: "sniffing", title: "Sniffing", short: "MITM, ARP/DNS poisoning, packet capture.", domain: "Network Attacks", status: "preview", labCount: 9, challengeCount: 3, tools: ["Wireshark", "tcpdump", "Bettercap"] },
  { id: "m09", number: 9, slug: "social-engineering", title: "Social Engineering", short: "Phishing kits, pretext design, OSINT for SE.", domain: "Human Layer", status: "preview", labCount: 7, challengeCount: 2, tools: ["GoPhish", "SET"] },
  { id: "m10", number: 10, slug: "denial-of-service", title: "Denial of Service", short: "Volumetric, protocol, and application-layer attacks.", domain: "Availability", status: "preview", labCount: 6, challengeCount: 2, tools: ["hping3", "slowloris"] },
  { id: "m11", number: 11, slug: "session-hijacking", title: "Session Hijacking", short: "Token theft, fixation, TLS downgrade attacks.", domain: "Web/Network", status: "preview", labCount: 7, challengeCount: 2, tools: ["Burp", "mitmproxy"] },
  { id: "m12", number: 12, slug: "evading-ids-firewalls-honeypots", title: "Evading IDS, Firewalls and Honeypots", short: "Bypass techniques, fragmentation, decoys.", domain: "Evasion", status: "preview", labCount: 8, challengeCount: 3, tools: ["nmap", "fragroute", "snort"] },
  { id: "m13", number: 13, slug: "hacking-web-servers", title: "Hacking Web Servers", short: "Misconfig, default creds, server-side flaws.", domain: "Web", status: "preview", labCount: 11, challengeCount: 4, tools: ["nikto", "wpscan", "gobuster"] },
  { id: "m14", number: 14, slug: "hacking-web-applications", title: "Hacking Web Applications", short: "OWASP Top 10 against real intentionally-vulnerable apps.", domain: "Web", status: "preview", labCount: 22, challengeCount: 8, tools: ["Burp Suite", "ZAP", "ffuf"] },
  { id: "m15", number: 15, slug: "sql-injection", title: "SQL Injection", short: "Union, boolean-blind, time-based, OOB exfiltration.", domain: "Web", status: "preview", labCount: 12, challengeCount: 5, tools: ["sqlmap", "Burp"] },
  { id: "m16", number: 16, slug: "hacking-wireless-networks", title: "Hacking Wireless Networks", short: "WPA2/WPA3 attacks, evil-twin, deauth.", domain: "Wireless", status: "preview", labCount: 9, challengeCount: 3, tools: ["aircrack-ng", "hcxdumptool"] },
  { id: "m17", number: 17, slug: "hacking-mobile-platforms", title: "Hacking Mobile Platforms", short: "Android/iOS recon, MASVS, runtime tampering.", domain: "Mobile", status: "preview", labCount: 8, challengeCount: 3, tools: ["MobSF", "Frida", "objection"] },
  { id: "m18", number: 18, slug: "iot-hacking", title: "IoT and OT Hacking", short: "Firmware extraction, MQTT, ICS protocols.", domain: "IoT/OT", status: "preview", labCount: 7, challengeCount: 2, tools: ["binwalk", "firmwalker"] },
  { id: "m19", number: 19, slug: "cloud-computing", title: "Cloud Computing", short: "IAM abuse, S3 enum, container & K8s attack paths.", domain: "Cloud", status: "preview", labCount: 10, challengeCount: 4, tools: ["aws-cli", "ScoutSuite", "kube-hunter"] },
  { id: "m20", number: 20, slug: "cryptography", title: "Cryptography", short: "Symmetric/asymmetric, hash collisions, crypto pitfalls.", domain: "Cryptography", status: "preview", labCount: 8, challengeCount: 3, tools: ["openssl", "hashcat", "CyberChef"] },
];

export const getModule = (slug: string) => MODULES.find(m => m.slug === slug);

export const TOTAL_LABS = MODULES.reduce((a, m) => a + m.labCount, 0);
export const TOTAL_CHALLENGES = MODULES.reduce((a, m) => a + m.challengeCount, 0);
