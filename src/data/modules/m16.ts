// Module 16 — Hacking Wireless Networks (Day 6)
// Enterprise mission: GFS HQ wireless posture — corporate SSID, guest SSID, and
// trading-floor bring-your-own-device zone.
// Concepts: (1) WPA2/WPA3 Attack Surface, (2) Rogue APs & AI-Driven Wireless Anomaly Detection.

export const M16_SCENARIO = {
  client: "Global Financial Services — HQ & Trading Floor",
  assessment: "Wireless Security Assessment — enterprise + guest + BYOD",
  scope: "Passive + limited-active wireless assessment inside GFS HQ · no client-side deauth flooding · no impersonation of employee devices · trading-floor zone read-only",
  available: [
    "Written scope from Head of Facilities + CISO",
    "Site plan with sanctioned AP locations",
    "Corp SSID uses 802.1X (EAP-TLS); Guest is WPA2-PSK captive portal; Trading BYOD is WPA3-SAE",
  ],
  outcome: "Wireless Posture Report — SSID inventory, rogue-AP register, WPA2/3 attack-surface findings, EAP-TLS trust chain review, and detection recommendations",
  why: "The trading floor and dealer desks live on wireless. A rogue AP or downgrade attack there is not a compliance annoyance — it is a direct order-entry manipulation risk.",
};

export const M16_WORKFLOW = [
  { tool: "Passive site survey (airodump-ng / Kismet)", finding: "All beaconing SSIDs, BSSIDs, channels, RSSI heatmap vs site plan", exposure: "Beacons from unmanaged 'GFS-Guest2', 'FreeWiFi_GFS' — rogue AP candidates", opportunity: "Employee association with rogue → credential capture", risk: "802.1X credential theft; MITM on business traffic", recommendation: "Rogue-AP detection via WIPS on managed controllers; SSID naming policy; auto-containment" },
  { tool: "WPA2 handshake capture (corp SSID)", finding: "EAPOL 4-way handshake to sanctioned AP", exposure: "Confirms enterprise auth is EAP-TLS (not PEAP-MSCHAPv2)", opportunity: "If PEAP: offline crack of AD hashes", risk: "Bulk corporate credential exposure", recommendation: "Enforce EAP-TLS with per-device certificates issued by internal CA; block PEAP/MSCHAPv2 on the controller" },
  { tool: "PMKID capture (WPA2-PSK guest)", finding: "Single-frame PMKID from guest AP", exposure: "Offline dictionary crack of guest PSK", opportunity: "Bulk association to guest net → lateral pivot if guest is not isolated", risk: "Guest→corp pivot if segmentation gaps exist", recommendation: "Rotate guest PSK; enforce true guest isolation (VLAN + firewall); consider WPA3-OWE for guest" },
  { tool: "WPA3-SAE downgrade / Dragonblood checks", finding: "SAE version, transition-mode behaviour, side-channel resistance of AP firmware", exposure: "AP in WPA3/WPA2 transition mode — downgrade possible", opportunity: "Force client onto WPA2, then attack PMKID", risk: "Wireless attack surface silently regresses to WPA2 despite 'WPA3' badge", recommendation: "WPA3-only mode where clients support it; patch AP firmware against Dragonblood variants; monitor for downgrade" },
  { tool: "Evil-twin / Karma probe response test", finding: "Client devices auto-probing preferred networks", exposure: "Corporate laptops probing 'GFS-Corp' when off-site", opportunity: "Karma-style AP responds and captures 802.1X exchange", risk: "Credential capture outside HQ walls (airports, hotels)", recommendation: "Client-side: EAP server-certificate validation locked to internal CA; do not allow user to accept unknown certs" },
  { tool: "802.1X server-cert trust chain audit", finding: "Which CA(s) client devices trust for RADIUS EAP", exposure: "Devices trust public CA in addition to internal CA", opportunity: "Attacker with any public-CA cert impersonates RADIUS", risk: "Silent credential capture", recommendation: "Pin RADIUS server certificate to internal CA only via MDM; test on every OS variant" },
];

export const M16_ANALYST_FRAMEWORK = [
  {
    observation: "Two AP beacons for BSSID `aa:bb:cc:11:22:33` seen with the corp SSID — one at sanctioned location, one on floor 14 not on the AP map.",
    finding: "Suspected rogue AP mimicking the corporate SSID on floor 14.",
    exposure: "Employee laptops within range associate to whichever AP has stronger RSSI.",
    opportunity: "Karma-style capture of EAP-TLS exchange; if server-cert validation weak, credential compromise.",
    risk: "Silent, sustained credential capture inside the physical perimeter.",
    recommendation: "Physically locate & remove the rogue immediately; enable WIPS auto-containment; audit MDM enforcement of RADIUS cert pinning.",
  },
  {
    observation: "Trading BYOD SSID advertised as WPA3 but transition mode enabled; client observed associating over WPA2 despite WPA3-capable device.",
    finding: "WPA3 downgrade viable on the trading floor.",
    exposure: "Attack surface silently regresses to WPA2 dictionary/PMKID.",
    opportunity: "PMKID capture → offline crack → dealer-device access.",
    risk: "Dealer-desk device compromise in a segment where trade instructions originate.",
    recommendation: "Move trading BYOD to WPA3-only; patch AP firmware; monitor for association-mode downgrade events on the controller.",
  },
];

export const M16_GUIDED = [
  {
    topic: "WPA2-PSK vs WPA2-Enterprise (EAP)",
    look: "Handshake type, presence of RADIUS, client-cert enrolment, EAP method (TLS/PEAP/TTLS).",
    expected: "Regulated enterprise: WPA2/3-Enterprise with EAP-TLS and per-device certs from an internal CA. PSK is guest-only.",
    mistakes: "PEAP-MSCHAPv2 for staff — hashes crackable offline. Shared PSK on corp SSID for 'ease of onboarding'.",
    attackers: "Offline crack of MSCHAPv2 challenge/response yields AD credentials — used to be a signature technique of state-aligned actors.",
    defenders: "EAP-TLS + certificate pinning to internal RADIUS server cert; MDM enforcement; alert on failed EAP validations.",
  },
  {
    topic: "PMKID attack (WPA2-PSK)",
    look: "Single beacon/association frame reveals PMKID — no full handshake needed.",
    expected: "Any WPA2-PSK network is one dictionary-crack away from compromise if the PSK is guessable.",
    mistakes: "Believing 'no one connected → nothing to capture'. Long-lived, weak PSKs.",
    attackers: "Drive-by PMKID capture with hcxdumptool → hashcat overnight → done.",
    defenders: "Rotate PSKs; long random PSKs (20+ chars); move to WPA3-SAE or OWE where possible.",
  },
  {
    topic: "WPA3-SAE, transition mode, and Dragonblood",
    look: "SAE handshake vs 4-way, transition-mode flag, AP firmware version.",
    expected: "WPA3-only mode on segments where all clients support it; transition-mode only as a migration bridge with an end date.",
    mistakes: "Enabling WPA3 in transition mode indefinitely — attackers force downgrade.",
    attackers: "Dragonblood side-channels + downgrade paths keep WPA3 rollouts honest.",
    defenders: "Patch AP firmware; disable transition mode ASAP; alert on 'client capable of WPA3 associated over WPA2' anomalies.",
  },
  {
    topic: "Rogue APs, evil twins, and Karma",
    look: "Duplicate BSSIDs/SSIDs at unexpected locations, client probe requests for known SSIDs off-site.",
    expected: "Managed AP fleet with WIPS; MDM policies disabling auto-connect to open/unknown SSIDs.",
    mistakes: "Trusting the SSID name. Employees carrying laptops that auto-probe 'GFS-Corp' in coffee shops.",
    attackers: "Karma APs are cheap ($50 Wi-Fi Pineapple); harvest EAP exchanges wherever employees roam.",
    defenders: "WIPS auto-containment for HQ; MDM to disable auto-connect + require server-cert validation everywhere.",
  },
];

export const M16_INCIDENTS = [
  { org: "TJX Companies (2007)", method: "WEP crack on in-store wireless → pivot to card-processing network", recon: "Drive-by wireless survey of retail sites", impact: "94M card records; $256M in costs", lesson: "Weak wireless in a peripheral store became the front door of a global breach." },
  { org: "US energy sector (FBI/CISA advisory, 2022)", method: "GRU-linked actors deployed rogue APs / RF implants in supply-chain devices", recon: "Physical proximity and supply-chain positioning", impact: "OT network reconnaissance; sustained access", lesson: "Wireless attack surface includes hardware you did not install — periodic RF sweeps matter." },
  { org: "Retail chain WPA2-PSK weak passphrase (2018, red-team public case)", method: "PMKID capture + dictionary crack of shared PSK", recon: "Parking-lot survey", impact: "Full lateral movement into POS network within 6 hours", lesson: "Shared PSK on any business network is a ticking clock." },
];

export const M16_DELIVERABLES = [
  { id: "scope", label: "Scope + facilities sign-off logged" },
  { id: "inventory", label: "Full SSID/BSSID inventory with RSSI heatmap vs site plan" },
  { id: "rogue", label: "Rogue-AP register with physical location + evidence" },
  { id: "wpa2", label: "WPA2 handshake / PMKID capture inventory (sanctioned only)" },
  { id: "wpa3", label: "WPA3 mode audit + transition-mode findings" },
  { id: "eap", label: "802.1X / RADIUS cert-trust audit across OS variants" },
  { id: "iso", label: "Guest-network isolation validation (VLAN + firewall test)" },
  { id: "mdm", label: "MDM policy review (auto-connect, cert validation)" },
  { id: "detect", label: "WIPS detection & auto-containment recommendations" },
  { id: "exec", label: "Executive summary — trading-floor risk framed for CRO" },
];

export const M16_AI_ACTIONS = [
  { id: "analyze", label: "Analyze Findings", output: "Site survey: 14 sanctioned APs, 2 suspected rogues (floors 9 and 14). Corp SSID confirmed EAP-TLS but 3 macOS devices trust a public CA for RADIUS — cert pinning gap. Trading BYOD WPA3 in transition mode; one dealer laptop observed associating over WPA2. Guest isolation validated OK." },
  { id: "correlate", label: "Correlate Evidence", output: "The floor-14 rogue's BSSID pattern matches a commodity 'Karma'-class device. Combined with the macOS cert-pinning gap, an attacker in that catchment can capture EAP exchanges from ~200 employees over a lunch hour without any deauth being needed." },
  { id: "assess", label: "Generate Assessment", output: "Wireless posture: MIXED. Corp EAP-TLS design is correct but MDM enforcement of RADIUS cert pinning is incomplete on macOS. Trading-floor WPA3 rollout is real but transition-mode leaves a downgrade path. Guest is well-isolated. Immediate concern: two unremediated rogues inside the building." },
  { id: "recommend", label: "Generate Recommendations", output: "Priority 0 (≤24h): Physically locate + remove floor-9 and floor-14 rogues; enable WIPS auto-containment. Priority 1 (≤14d): Close macOS RADIUS cert-pinning gap via MDM; disable WPA3 transition mode on trading BYOD; patch AP firmware. Priority 2 (≤60d): Move guest to WPA3-OWE; MDM policy to disable auto-connect to open networks on all corporate devices." },
  { id: "exec", label: "Executive Summary", output: "GFS's wireless design is fundamentally sound but currently permits two attacker paths inside the building: unmanaged access points mimicking the corporate SSID, and a downgrade path on the trading-floor WPA3 network. Neither would be visible in existing dashboards. The immediate fixes are physical (rogue removal) and policy (MDM), not architectural — days of work, not months." },
];

export const M16_SLUG = "hacking-wireless-networks";
