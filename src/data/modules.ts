export type ModuleStatus = "available" | "preview" | "locked";

export interface CEHModule {
  id: string;
  number: number;
  slug: string;
  title: string;
  short: string;
  domain: string;
  status: ModuleStatus;
  labCount: number;
  challengeCount: number;
  tools: string[];
}

import { LABS } from "./labs";

const count = (id: string, kind: "terminal" | "challenge") =>
  LABS.filter(l => l.moduleId === id && l.kind === kind).length;

const m = (id: string, number: number, slug: string, title: string, short: string, domain: string, tools: string[]): CEHModule => ({
  id, number, slug, title, short, domain,
  status: "available",
  labCount: count(id, "terminal"),
  challengeCount: count(id, "challenge"),
  tools,
});

export const MODULES: CEHModule[] = [
  m("m01", 1,  "introduction-to-ethical-hacking",   "Introduction to Ethical Hacking",      "Kill-chain mapping, MITRE ATT&CK technique IDs.",                "Information Security", ["MITRE ATT&CK", "Cyber Kill Chain", "cve"]),
  m("m02", 2,  "footprinting-and-reconnaissance",   "Footprinting and Reconnaissance",      "Passive & active intel gathering on real targets.",              "Reconnaissance",       ["whois", "dig", "subs", "wayback"]),
  m("m03", 3,  "scanning-networks",                  "Scanning Networks",                    "IP/ASN intel and HTTP service fingerprinting.",                  "Scanning",             ["ip", "methods", "headers", "dig"]),
  m("m04", 4,  "enumeration",                        "Enumeration",                          "DNS zone mining, CAA & TXT/SPF/DMARC enumeration.",              "Enumeration",          ["dig"]),
  m("m05", 5,  "vulnerability-analysis",             "Vulnerability Analysis",               "Live NVD CVE triage and CVSS v3.1 vectoring.",                   "Analysis",             ["cve", "cvss"]),
  m("m06", 6,  "system-hacking",                     "System Hacking",                       "Hash cracking and Linux privilege-escalation paths.",            "Exploitation",         ["hash", "crack"]),
  m("m07", 7,  "malware-threats",                    "Malware Threats",                      "IoC hashing and malware-to-CVE mapping.",                        "Malware",              ["hash", "cve"]),
  m("m08", 8,  "sniffing",                           "Sniffing",                             "Layer-2 sniffing concepts and credential decoding.",             "Network Attacks",      ["b64"]),
  m("m09", 9,  "social-engineering",                 "Social Engineering",                   "Phishing-domain CT recon and DMARC defense.",                    "Human Layer",          ["subs", "dig"]),
  m("m10", 10, "denial-of-service",                  "Denial of Service",                    "Amplification factors and reflector protocols.",                 "Availability",         []),
  m("m11", 11, "session-hijacking",                  "Session Hijacking",                    "JWT decoding (alg=none) and cookie-flag auditing.",              "Web/Network",          ["jwt", "headers"]),
  m("m12", 12, "evading-ids-firewalls-honeypots",    "Evading IDS, Firewalls and Honeypots", "Fragmentation, decoy, and evasion flags.",                       "Evasion",              []),
  m("m13", 13, "hacking-web-servers",                "Hacking Web Servers",                  "Header audits, robots.txt intel, stack fingerprinting.",         "Web",                  ["headers", "robots", "wayback"]),
  m("m14", 14, "hacking-web-applications",           "Hacking Web Applications",             "XSS payload craft and TLS certificate inspection.",              "Web",                  ["tls"]),
  m("m15", 15, "sql-injection",                      "SQL Injection",                        "Tautology bypass and UNION column-count discovery.",             "Web",                  []),
  m("m16", 16, "hacking-wireless-networks",          "Hacking Wireless Networks",            "WPA2 4-way handshake mechanics.",                                "Wireless",             []),
  m("m17", 17, "hacking-mobile-platforms",           "Hacking Mobile Platforms",             "Android dangerous-permission identification.",                   "Mobile",               []),
  m("m18", 18, "iot-hacking",                        "IoT and OT Hacking",                   "MQTT protocol footprint.",                                       "IoT/OT",               []),
  m("m19", 19, "cloud-computing",                    "Cloud Computing",                      "S3 endpoints and cloud IMDS attack paths.",                      "Cloud",                []),
  m("m20", 20, "cryptography",                       "Cryptography",                         "Hashing comparison and XOR symmetric toy.",                      "Cryptography",         ["hash", "xor"]),
];

export const getModule = (slug: string) => MODULES.find(x => x.slug === slug);

export const TOTAL_LABS = MODULES.reduce((a, x) => a + x.labCount, 0);
export const TOTAL_CHALLENGES = MODULES.reduce((a, x) => a + x.challengeCount, 0);
