// Module 18 — IoT & OT Hacking (Day 7)
// Enterprise mission: GFS Facilities & Data-Centre OT — badge readers, HVAC/BMS,
// UPS management, and CCTV NVRs sharing network with corporate segments.
// Concepts: (1) IoT Firmware & Protocol Weaknesses, (2) OT/ICS Threat Modelling with AI.

export const M18_SCENARIO = {
  client: "Global Financial Services — Facilities & Data-Centre OT",
  assessment: "IoT / OT Attack-Surface Review across HQ + primary data centre",
  scope: "Passive discovery + documentation review · limited authenticated probing of a lab-mirror BMS · zero interaction with production physical safety controls",
  available: [
    "Asset list from Facilities Ops (partial)",
    "Segmentation diagram from Network Architecture (dated)",
    "Vendor documentation for BMS, UPS, CCTV NVRs, badge readers",
  ],
  outcome: "IoT/OT Posture Report — device inventory, protocol exposure, segmentation reality vs diagram, and remediation roadmap aligned to Purdue model",
  why: "Facilities/OT devices are on the same physical network as corporate segments in many organisations and are rarely patched. In a bank, badge readers and HVAC are also availability and life-safety concerns — not just data confidentiality.",
};

export const M18_WORKFLOW = [
  { tool: "Passive network discovery (span port + Zeek)", finding: "IoT/OT device inventory: BMS controllers, UPS SNMP, NVRs, badge readers, printers", exposure: "Devices in corporate VLANs, not isolated", opportunity: "Corporate laptop reaches BMS Modbus/BACnet directly", risk: "Segmentation-diagram-vs-reality gap", recommendation: "Rebuild segmentation to Purdue-style zones; enforce with L3 firewalls, not just VLANs" },
  { tool: "Firmware review (vendor images)", finding: "Hardcoded default creds, outdated OpenSSL/BusyBox, exposed telnet/UPnP", exposure: "Public advisories match device fleet", opportunity: "Wormable exploits (Mirai-class) against fleet", risk: "Fleet-wide compromise; DDoS or physical actuator abuse", recommendation: "Enforce vendor patch SLA in contracts; segment unpatchable devices behind restrictive ACLs" },
  { tool: "Protocol probing (Modbus, BACnet, MQTT, SNMP, RTSP)", finding: "Unauthenticated protocols reachable from corporate", exposure: "Modbus write coils possible; MQTT topics readable with no auth; SNMP community 'public'", opportunity: "Actuator manipulation; data exfil; enumeration", risk: "Physical impact (HVAC, access), surveillance data exposure", recommendation: "Move OT protocols to dedicated zones; deny at corporate perimeter; MQTT with mTLS + ACLs; SNMPv3 with auth+priv" },
  { tool: "Cloud/edge management plane audit", finding: "Vendor SaaS portals with API tokens, admin roles, MFA state", exposure: "Facilities admin using shared credentials without MFA", opportunity: "Compromise vendor account → mass-configure devices", risk: "Supply-chain style compromise via management plane", recommendation: "Per-admin accounts; enforce MFA; API-token rotation; SIEM ingest of vendor audit logs" },
  { tool: "Life-safety & availability review", finding: "Which devices, if disabled, impact people/operations", exposure: "Single point of failure on badge system for a DC row", opportunity: "Availability attack blocks physical access", risk: "Cannot enter DC to remediate; life-safety edge case", recommendation: "Mechanical override + independent secondary path; document and test physical failover" },
];

export const M18_ANALYST_FRAMEWORK = [
  {
    observation: "Corporate laptop VLAN can reach BMS controller at 10.20.30.14/tcp/502 (Modbus).",
    finding: "OT protocol reachable from a general-purpose corporate segment.",
    exposure: "Any compromised laptop can write Modbus coils to the BMS.",
    opportunity: "HVAC set-points manipulated → thermal impact on DC row → cascading availability event.",
    risk: "Physical availability impact on the primary data centre.",
    recommendation: "L3 firewall between corporate and BMS zones; only jump-host on OT VLAN can reach Modbus; log all writes; alert on writes outside change windows.",
  },
  {
    observation: "CCTV NVR admin portal reachable at NVR-04 with vendor default `admin/admin` still active.",
    finding: "Default credentials on a device holding physical surveillance footage.",
    exposure: "Full CCTV feed + historical retrieval + configuration change.",
    opportunity: "Surveillance disable + evidence tampering pre-physical intrusion.",
    risk: "Physical security operations compromised.",
    recommendation: "Rotate all NVR credentials; onboard NVRs into IAM/MFA management plane; alert on NVR admin logins outside SOC-approved windows.",
  },
];

export const M18_GUIDED = [
  {
    topic: "The Purdue model in practice",
    look: "Levels 0-5, and where the DMZ (L3.5) sits between IT (L4-5) and OT (L0-3).",
    expected: "Enterprise IT does not directly reach OT; a data diode / firewall / jump-host mediates. OT devices do not initiate egress to internet.",
    mistakes: "Assuming VLAN separation = zone separation. Allowing engineer workstations to dual-home IT and OT.",
    attackers: "First IT foothold → any weak L3.5 → lateral into OT via legitimate management path.",
    defenders: "Build the DMZ physically; jump-host with session recording; block OT internet egress.",
  },
  {
    topic: "OT protocols (Modbus, BACnet, DNP3, S7comm)",
    look: "Cleartext protocols with no built-in auth; write commands available; broadcast discovery.",
    expected: "OT protocols confined to their zone; monitored by an OT-aware IDS (Nozomi/Claroty/Dragos style).",
    mistakes: "Treating OT protocols as 'nobody speaks these on corporate' — attackers absolutely do.",
    attackers: "One Metasploit-class module writes Modbus coils; result is physical.",
    defenders: "OT-IDS with baseline of expected commands; alert on writes from unknown sources.",
  },
  {
    topic: "Cloud-managed IoT (badge, HVAC SaaS, camera SaaS)",
    look: "Management-plane accounts, API keys, MFA, audit-log export.",
    expected: "Per-user admin accounts with MFA; API keys rotated and scoped; audit logs shipped to SIEM.",
    mistakes: "Shared vendor portal login. API keys in shared drives.",
    attackers: "Vendor management plane is often the softest path — compromise once, reconfigure the whole fleet.",
    defenders: "Treat vendor SaaS as tier-0 identity; SIEM ingest + alerting on privileged config changes.",
  },
  {
    topic: "Life-safety & availability as security concerns",
    look: "Which devices, if attacked, cause physical, safety, or availability impact — not just data loss.",
    expected: "Explicit mapping of device → business/safety impact; independent secondary path for critical functions.",
    mistakes: "Treating IoT/OT as CIA-triad problems where 'C' dominates. In OT, A > I > C.",
    attackers: "Availability attacks on OT hurt fastest and are hardest to reverse.",
    defenders: "Table-top the physical scenarios; ensure mechanical/manual overrides work and are practised.",
  },
];

export const M18_INCIDENTS = [
  { org: "Target (2013)", method: "HVAC vendor compromise → pivot into retail POS network", recon: "Supply-chain compromise + weak segmentation", impact: "40M card records; $200M+ in costs", lesson: "OT/facilities vendors and IT networks must not share reachable segments." },
  { org: "Ukraine power grid (2015, 2016)", method: "ICS-tailored malware manipulated SCADA to trip breakers", recon: "Long-dwell intrusion into ICS network via IT compromise", impact: "230k customers lost power; recovery required manual switching", lesson: "OT attacks are physical, sometimes irreversible, and often begin in IT." },
  { org: "Water treatment plant, Oldsmar FL (2021)", method: "Remote-access tool abuse to change sodium hydroxide levels", recon: "Exposed TeamViewer + shared password", impact: "Attempt caught by operator; potential public-health impact", lesson: "Remote management of OT without MFA/logging is a life-safety issue." },
];

export const M18_DELIVERABLES = [
  { id: "scope", label: "Scope + no-touch-production statement logged" },
  { id: "inventory", label: "IoT/OT device inventory with owner + criticality" },
  { id: "segmentation", label: "Segmentation reality vs diagram — gap list" },
  { id: "protocols", label: "OT protocol exposure matrix (Modbus/BACnet/MQTT/SNMP/RTSP)" },
  { id: "creds", label: "Default-credential + weak-auth register" },
  { id: "cloud", label: "Cloud/SaaS management-plane audit" },
  { id: "safety", label: "Life-safety & availability impact mapping" },
  { id: "roadmap", label: "Roadmap aligned to Purdue model + OT-IDS deployment" },
  { id: "runbook", label: "OT incident-response runbook draft" },
  { id: "exec", label: "Executive summary for CISO + Head of Facilities" },
];

export const M18_AI_ACTIONS = [
  { id: "analyze", label: "Analyze Findings", output: "Discovered 214 IoT/OT devices across HQ + primary DC. 38% reachable from general corporate VLANs. 17 devices with vendor default creds. 4 CCTV NVRs, 2 BMS controllers, 1 UPS admin plane. Cloud management-plane for badge system uses a shared vendor login without MFA." },
  { id: "correlate", label: "Correlate Evidence", output: "A single compromised corporate laptop in the HQ user VLAN has direct L3 reachability to BMS Modbus (write coils), NVR admin portals (default creds), and UPS SNMP (public community). This is a one-hop-to-physical path that the segmentation diagram claims does not exist." },
  { id: "assess", label: "Generate Assessment", output: "IoT/OT posture: MATERIALLY BELOW EXPECTATION for a Tier-1 bank. Segmentation is aspirational, not enforced. OT protocols are on the corporate wire. Vendor management planes are outside IAM. Life-safety runbooks reference systems that do not have documented manual overrides." },
  { id: "recommend", label: "Generate Recommendations", output: "Priority 0 (≤14d): Rotate all vendor default creds; L3-block Modbus/BACnet/SNMP from corporate VLANs; enforce MFA on vendor SaaS. Priority 1 (≤60d): Build OT DMZ with jump-host + session recording; deploy OT-aware IDS on DC OT segment. Priority 2 (≤180d): Full Purdue re-architecture; contractual patch SLAs with facilities vendors; table-top exercises for physical impact scenarios." },
  { id: "exec", label: "Executive Summary", output: "GFS's facilities and OT systems are reachable from ordinary corporate laptops in ways the network diagram does not reflect. In a worst-case scenario, a single ransomware event on corporate could extend into building management and physical access systems — an availability and life-safety issue, not just a data one. The immediate fixes are credential hygiene and firewall rules. The strategic fix is a genuine OT segmentation programme over 6 months." },
];

export const M18_SLUG = "iot-hacking";
