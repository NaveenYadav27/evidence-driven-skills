// GFS SOC template data — sub-lessons + commands + supplementary tab content
// for modules 16–20. Other tab content (Enterprise, Assessment) reuses
// existing per-module data files.

export type SubLesson = {
  id: string;
  title: string;
  body: string;
  bullets?: string[];
};

export type TerminalCommand = {
  cmd: string;
  purpose: string;
  expected: string;
  mitre?: string;
};

export type KeyTool = {
  name: string;
  traditional: string;
  aiEvolution: string;
  cmd: string;
};

export type Pitfall = {
  mistake: string;
  why: string;
  fix: string;
};

export type GfsTemplate = {
  slug: string;
  phase: string;
  moduleTitle: string;
  subtitle: string;
  subLessons: SubLesson[];
  diagram: { title: string; ascii: string; caption: string; workflow: string[] };
  keyTools: KeyTool[];
  commandsWindows: TerminalCommand[];
  commandsKali: TerminalCommand[];
  pitfalls: Pitfall[];
  handsOn: { title: string; steps: string[]; expected: string };
  summary: { keyPoints: string[]; examTraps: string[]; nextModule: string };
};

/* ============================== MODULE 16 ============================== */
const M16: GfsTemplate = {
  slug: "hacking-wireless-networks",
  phase: "Phase 16: Wireless Security Analyst",
  moduleTitle: "Hacking Wireless Networks",
  subtitle: "WPA2/WPA3 attack surface, rogue APs, and 802.1X trust chains at GFS HQ.",
  subLessons: [
    { id: "sl1", title: "Wireless Concepts",
      body: "802.11 wireless LANs operate on 2.4 GHz, 5 GHz, and (Wi-Fi 6E/7) 6 GHz bands using frames grouped into Management (beacon, probe, auth, assoc), Control (RTS/CTS, ACK), and Data. All management frames are unencrypted prior to WPA3-PMF, which is the root cause of deauth, disassociation, and evil-twin attacks. Understand SSID vs BSSID vs ESSID, infrastructure vs ad-hoc vs mesh topologies, and NIC modes (Managed, Monitor, Master, Promiscuous).",
      bullets: ["802.11a/b/g/n/ac/ax/be standards", "Bands, channels, RSSI, SNR", "SSID / BSSID / ESSID / IBSS", "Managed vs Monitor vs Master mode", "Antenna types: omni, Yagi, parabolic"] },
    { id: "sl2", title: "Wireless Encryption",
      body: "WEP (RC4, IV reuse) is trivially broken; WPA (TKIP) is deprecated. WPA2-Personal (PSK) derives PMK→PTK through a 4-way EAPOL handshake — capture enables offline hashcat mode 22000. WPA2-Enterprise uses 802.1X/RADIUS with EAP methods (EAP-TLS is gold; PEAP-MSCHAPv2 cracks offline). WPA3-SAE (Dragonfly) resists offline dictionary attack; Management Frame Protection (802.11w) blocks deauth. Transition mode preserves WPA2 fallback and creates a downgrade path.",
      bullets: ["WEP → WPA → WPA2 → WPA3 evolution", "4-way handshake + PMKID capture", "EAP-TLS vs PEAP vs TTLS vs LEAP", "SAE (Dragonfly) + PMF/802.11w", "AES-CCMP vs GCMP-256"] },
    { id: "sl3", title: "Wireless Threats",
      body: "Threats span physical, RF, and protocol layers: rogue APs (unmanaged AP on corp LAN), evil twin (spoofed SSID with same BSSID pattern), Karma/MANA (respond to any probe), deauth/disassoc floods, KRACK (nonce reuse in 4-way), FragAttacks, Dragonblood (SAE side-channel), WPS PIN brute-force, and jamming. Client-side risks: auto-join to open SSIDs, captive-portal MITM, and cached PSK exfiltration via `netsh wlan show profile key=clear`.",
      bullets: ["Rogue AP vs Evil Twin vs Karma", "Deauth / Disassoc / Beacon flood", "KRACK, FragAttacks, Dragonblood", "WPS PIN attack (Pixie Dust, Reaver)", "Bluetooth: Bluejacking, Bluesnarfing, BlueBorne"] },
    { id: "sl4", title: "Wireless Hacking Methodology",
      body: "Standard EC-Council sequence: (1) Wi-Fi Discovery — passive scan with airodump-ng/Kismet/inSSIDer; (2) GPS Mapping / Wardriving; (3) Wireless Traffic Analysis via Wireshark with 802.11 dissector; (4) Launch Attack — deauth, PMKID capture, evil twin with eaphammer, WPS Pixie Dust; (5) Crack Encryption — hashcat -m 22000 for WPA2, -m 22001 for PMKID; (6) Compromise Wi-Fi Network — pivot into internal LAN and continue with LAN post-exploitation.",
      bullets: ["Discover → Map → Analyse → Attack → Crack → Compromise", "airmon-ng, airodump-ng, aireplay-ng, aircrack-ng", "hcxdumptool + hcxpcapngtool → hashcat", "eaphammer, wifite2, Fluxion (evil twin)", "Pivot: internal recon after AP break-in"] },
    { id: "sl5", title: "Wireless Attack Countermeasures",
      body: "Enforce WPA3-SAE with PMF required; where WPA2 is unavoidable use EAP-TLS with per-device client certs and RADIUS server-cert pinning distributed via MDM. Disable WPS on every AP. Deploy a WIPS (Cisco, Aruba, Extreme) to detect and auto-contain rogues; enforce SSID cloaking is not a control. Segment guest and IoT SSIDs onto isolated VLANs with client isolation. Quarterly physical RF surveys catch under-desk rogues invisible to logical scans.",
      bullets: ["WPA3-SAE + PMF required, ban PSK on corp", "EAP-TLS + RADIUS cert pinning via MDM", "Disable WPS, hide SSID is NOT security", "WIPS auto-containment + physical RF sweeps", "Guest/IoT isolated VLANs + client isolation"] },
  ],
  diagram: {
    title: "GFS HQ Wireless Topology",
    ascii: `  ┌─────────────┐        ┌──────────────┐        ┌──────────────┐
  │  Client     │──assoc──▶│ Managed AP   │──802.1X──▶│  RADIUS/CA  │
  │ (Laptop/BYOD)│         │  (Corp SSID) │           │  (EAP-TLS)  │
  └──────┬──────┘          └──────┬───────┘           └──────────────┘
         │                        │
         │            ┌───────────┴──────────┐
         │            │ WIPS Sensor (Anomaly)│
         │            └──────────────────────┘
         │
    ┌────▼────┐  probe   ┌──────────────┐
    │  Rogue  │◀─────────│ Auto-Probe   │  ← Karma capture off-site
    │   AP    │─assoc───▶│ (Off-site)   │
    └─────────┘          └──────────────┘`,
    caption: "Every dashed path bypasses controls. WIPS + RADIUS cert-pinning close them.",
    workflow: [
      "Passive survey (airodump-ng / Kismet) — enumerate every beacon",
      "Correlate BSSIDs with sanctioned AP map — flag deltas as rogues",
      "Confirm EAP method on corp SSID — must be EAP-TLS",
      "Guest PSK: PMKID capture + offline crack estimate",
      "WPA3 audit — transition mode, firmware version",
      "Client audit — MDM RADIUS cert pinning across OS variants",
    ],
  },
  keyTools: [
    { name: "airodump-ng", traditional: "Passive 802.11 frame capture and BSSID enumeration.", aiEvolution: "AI clusters beacons by fingerprint (BSSID + IE order + timing) to flag rogue APs without an allow-list.", cmd: "airodump-ng wlan0mon" },
    { name: "hcxdumptool", traditional: "PMKID and EAPOL capture from live wireless.", aiEvolution: "AI ranks captured PSKs by likely candidate wordlists based on org's naming patterns.", cmd: "hcxdumptool -i wlan0mon -o gfs.pcapng" },
    { name: "wifite2", traditional: "Automated multi-attack wireless auditor.", aiEvolution: "AI selects attack ordering based on live signal quality + client density to minimise noise.", cmd: "wifite --wpa --wps" },
    { name: "eaphammer", traditional: "Rogue AP + evil-twin toolkit for 802.1X.", aiEvolution: "AI generates realistic captive-portal clones tailored to observed corporate branding.", cmd: "eaphammer -i wlan0 --creds --auth peap --essid GFS-Corp" },
  ],
  commandsWindows: [
    { cmd: "netsh wlan show interfaces", purpose: "Show current wireless adapter state and SSID.", expected: "State, SSID, BSSID, channel, signal.", mitre: "T1016" },
    { cmd: "netsh wlan show profiles", purpose: "List saved wireless profiles (auto-connect surface).", expected: "All User Profiles list.", mitre: "T1016" },
    { cmd: "netsh wlan show profile name=\"GFS-Corp\" key=clear", purpose: "Reveal stored key material (audit).", expected: "Security settings + key content (if any).", mitre: "T1555.004" },
    { cmd: "netsh wlan show networks mode=bssid", purpose: "Enumerate visible BSSIDs + auth types.", expected: "SSID, BSSID, signal, radio type, auth.", mitre: "T1016" },
    { cmd: "Get-NetAdapter | Where-Object PhysicalMediaType -eq 'Native 802.11'", purpose: "Enumerate wireless adapters via PowerShell.", expected: "Adapter list with status.", mitre: "T1016" },
    { cmd: "netsh wlan show wlanreport", purpose: "Generate wireless diagnostic HTML report.", expected: "Report at %ProgramData%\\Microsoft\\Windows\\WlanReport.", mitre: "T1082" },
  ],
  commandsKali: [
    { cmd: "airmon-ng start wlan0", purpose: "Put NIC into monitor mode.", expected: "monitor mode enabled on wlan0mon", mitre: "T1040" },
    { cmd: "airodump-ng wlan0mon", purpose: "Passive survey of every beacon.", expected: "BSSID / PWR / Beacons / #Data / CH / ENC list.", mitre: "T1040" },
    { cmd: "airodump-ng --bssid AA:BB:CC:11:22:33 -c 6 -w cap wlan0mon", purpose: "Targeted capture on one AP + channel.", expected: "cap-01.cap grows as frames arrive.", mitre: "T1040" },
    { cmd: "hcxdumptool -i wlan0mon -o gfs.pcapng --enable_status=1", purpose: "Capture PMKIDs and EAPOL frames.", expected: "PMKID FOUND lines per BSSID.", mitre: "T1040" },
    { cmd: "hcxpcapngtool -o hash.22000 gfs.pcapng", purpose: "Convert capture to hashcat format.", expected: "hash.22000 file for hashcat -m 22000.", mitre: "T1110.002" },
    { cmd: "kismet -c wlan0mon", purpose: "Long-running wireless intel + rogue-AP detection.", expected: "Web UI at http://localhost:2501.", mitre: "T1040" },
  ],
  pitfalls: [
    { mistake: "Enabling WPA3 in transition mode indefinitely.", why: "Attackers force clients onto WPA2 and attack PMKID.", fix: "Move to WPA3-only once client fleet supports SAE." },
    { mistake: "Shared PSK on corp SSID for 'ease of onboarding'.", why: "One leak = full compromise; no per-user revocation.", fix: "EAP-TLS with per-device certs from internal CA." },
    { mistake: "Trusting SSID names.", why: "Any device can broadcast 'GFS-Corp' at zero cost.", fix: "RADIUS server-cert pinning via MDM." },
    { mistake: "No physical RF sweeps.", why: "Rogue APs planted in server rooms are invisible to logical scans.", fix: "Quarterly WIPS + physical spectrum survey." },
  ],
  handsOn: {
    title: "Rogue-AP Hunt on the GFS Trading Floor",
    steps: [
      "Enable monitor mode on the assessment adapter.",
      "Run a 15-minute passive survey with airodump-ng across 2.4 & 5 GHz.",
      "Diff the observed BSSIDs against the sanctioned AP register.",
      "For each unknown BSSID: capture 3 beacons, note channel + signal.",
      "Cross-check WIPS controller telemetry for the same timeframe.",
      "Physically triangulate any confirmed rogue with a directional antenna.",
    ],
    expected: "Rogue-AP register with BSSID, RSSI, physical floor, and containment status.",
  },
  summary: {
    keyPoints: [
      "PSK anywhere on corp = a ticking clock — EAP-TLS is the floor.",
      "PMKID means 'no client needed' — dictionary strength matters.",
      "WPA3 transition mode is a downgrade doorway — retire it fast.",
      "MDM RADIUS cert pinning is the control that stops evil-twins wherever employees roam.",
    ],
    examTraps: [
      "PEAP-MSCHAPv2 is NOT equivalent to EAP-TLS — the hashes crack offline.",
      "Deauth is Layer-2, works even on WPA2/3 (WPA3 mitigates via PMF).",
      "PMKID is captured from a single frame — no full handshake required.",
    ],
    nextModule: "M17 — Hacking Mobile Platforms",
  },
};

/* ============================== MODULE 17 ============================== */
const M17: GfsTemplate = {
  slug: "hacking-mobile-platforms",
  phase: "Phase 17: Mobile Security Analyst",
  moduleTitle: "Hacking Mobile Platforms",
  subtitle: "Android + iOS release-candidate review for GFS Retail Banking app.",
  subLessons: [
    { id: "sl1", title: "Mobile Platform Attack Vectors",
      body: "OWASP MASVS and the Mobile Top 10 frame the surface: insecure data storage, weak communication, insecure authentication, insufficient cryptography, client-code quality, code tampering, reverse engineering, and extraneous functionality. Physical attack vectors include lost/stolen devices, malicious charging cables (juice-jacking), and shoulder-surfing. Network vectors: rogue Wi-Fi, cellular downgrade, SS7/Diameter interception. Application vectors: malicious apps from side-loading, over-permissioned SDKs, and supply-chain compromise of ad networks.",
      bullets: ["OWASP MASVS L1/L2/R + Mobile Top 10", "Physical: theft, juice-jacking, screen-recording", "Network: rogue AP, SSL stripping, SS7", "App: malware, SDK abuse, side-loading", "Web: WebView JS-bridge, cross-app URL schemes"] },
    { id: "sl2", title: "Hacking Android OS",
      body: "Android's security model rests on Linux UID isolation per app, SELinux enforcing MAC, the AndroidManifest.xml permission and export declarations, and Play Protect. Attack workflow: root or use an emulator, install Frida server, pull the APK via `adb pull`, decompile with apktool/jadx, audit the manifest for `exported=true`, `allowBackup=true`, `debuggable=true`, then hook the app at runtime with Objection to bypass SSL pinning, root detection, and biometric checks. Malware families (BankBot, Cerberus, Anubis) abuse Accessibility Services to overlay banking UIs and drain accounts.",
      bullets: ["adb, Frida, Objection, apktool, jadx, MobSF", "AndroidManifest.xml audit (exported, backup, debuggable)", "Root detection & SSL pinning bypass", "Accessibility-service overlay malware", "Deep-link + intent redirection attacks"] },
    { id: "sl3", title: "Hacking iOS",
      body: "iOS ships with mandatory app sandbox, code signing (only Apple-signed binaries execute outside dev), ATS (App Transport Security) forcing TLS 1.2+, and hardware-backed Keychain with Secure Enclave. Assessment workflow: jailbroken device or corellium, SSH in, dump the decrypted IPA with frida-ios-dump or Clutch, inspect Info.plist for ATS exceptions and URL schemes, class-dump the binary to enumerate ObjC selectors, hook with Frida to bypass jailbreak detection and biometric gates. Common findings: PII in NSLog, weak Keychain access class (`kSecAttrAccessibleAlways`), missing Universal Links assetlinks verification.",
      bullets: ["Sandbox, code signing, Secure Enclave", "frida-ios-dump / Clutch (decrypt IPA)", "class-dump + otool for binary inspection", "Info.plist: ATS exceptions, URL schemes", "Keychain access classes + App Attest"] },
    { id: "sl4", title: "Mobile Device Management (MDM)",
      body: "MDM (Intune, Jamf, Workspace ONE, MobileIron) enforces device compliance: passcode complexity, disk encryption, jailbreak/root detection, app-catalog whitelist, per-app VPN, and remote wipe. BYOD adds MAM (Mobile Application Management) with app-level containers separating corporate data. Enrolment types: DEP/ADE (Apple), Zero-Touch (Android), Company Portal. Attack path: unenrolled devices, MDM certificate theft (grants full config push), and Android Work Profile bypass via debug bridge.",
      bullets: ["MDM vs MAM vs UEM", "Apple DEP/ADE, Android Zero-Touch", "Compliance: passcode, encryption, jailbreak block", "Per-app VPN + conditional access (Azure AD)", "Remote wipe: full vs selective (BYOD)"] },
    { id: "sl5", title: "Mobile Security Guidelines & Tools",
      body: "Baseline defence: enforce OS auto-updates, ban side-loading, require app-store-only installs, mandate biometric + strong PIN, and disable USB debugging. For developers: OWASP MASVS L2 checklist, cert pinning with backup pins, obfuscation (R8/ProGuard, LLVM-obfuscator), tamper detection, and runtime application self-protection (RASP). Testing tools: MobSF (static+dynamic), Frida/Objection (runtime), Drozer (Android IPC fuzzing), Needle (iOS), mitmproxy + Burp Mobile Assistant. Compliance: PCI-MPoC for card acceptance apps, NIST SP 800-124r2.",
      bullets: ["OWASP MASVS L2 + MASTG test cases", "Cert pinning, obfuscation, tamper detection", "MobSF, Frida, Objection, Drozer, Needle", "Mandatory OS updates + no side-loading", "PCI-MPoC, NIST SP 800-124r2, GDPR"] },
  ],
  diagram: {
    title: "GFS Mobile Banking App Threat Surface",
    ascii: `  ┌────────────┐    deep link     ┌──────────────┐
  │ Phishing   │─────────────────▶│ TransferActivity│──▶ prefilled screen
  │  Page/SMS  │                  │  (exported)    │
  └────────────┘                  └──────┬─────────┘
                                         │ no re-auth
                                         ▼
  ┌────────────┐   TLS (pinned?)   ┌──────────────┐
  │  Bank App  │─────────────────▶│  Backend API │
  └─────┬──────┘                   └──────────────┘
        │
        ▼
  ┌────────────┐
  │ Keystore/  │  ← JWT MUST live here
  │ Keychain   │
  └────────────┘`,
    caption: "Break the deep-link → export → no-reauth chain and the entire fraud path collapses.",
    workflow: [
      "Pull APK + IPA from CI; verify signing chain",
      "Static: MobSF + manual manifest review",
      "Storage: pull /data/data + iOS Keychain classes",
      "Transport: mitmproxy + pinning bypass attempt",
      "Deep links: enumerate + test each action for step-up auth",
      "Log hygiene: grep tokens / PII in crash reporter payloads",
    ],
  },
  keyTools: [
    { name: "MobSF", traditional: "Static + basic dynamic analysis of APK/IPA.", aiEvolution: "AI triages MobSF findings by exploitability and correlates cross-module risks (e.g. exported + deep-link + no-reauth).", cmd: "docker run -p 8000:8000 opensecurity/mobile-security-framework-mobsf" },
    { name: "Frida / Objection", traditional: "Runtime instrumentation of Android/iOS processes.", aiEvolution: "AI-generated Frida scripts for pinning bypass tailored to the observed pinning library.", cmd: "objection -g com.gfs.bank explore" },
    { name: "apktool + jadx", traditional: "Decompile APK and read manifest + smali/java.", aiEvolution: "AI summarises decompiled activities and flags risky patterns (WebView.loadUrl of intent-provided URI, etc.).", cmd: "jadx-gui gfs-bank.apk" },
    { name: "class-dump / otool", traditional: "iOS binary introspection.", aiEvolution: "AI clusters ObjC selectors by capability (auth, transfer, biometry) to prioritise dynamic testing.", cmd: "class-dump -H GFSBank.app/GFSBank" },
  ],
  commandsWindows: [
    { cmd: "adb devices", purpose: "List connected Android devices/emulators.", expected: "serial + device state.", mitre: "T1420" },
    { cmd: "adb shell pm list packages -f | findstr gfs", purpose: "Find installed bank package + APK path.", expected: "package:/data/app/... com.gfs.bank", mitre: "T1420" },
    { cmd: "adb pull /data/app/com.gfs.bank/base.apk .", purpose: "Pull APK for static analysis.", expected: "APK file written locally.", mitre: "T1420" },
    { cmd: "keytool -printcert -jarfile base.apk", purpose: "Verify signing chain on the APK.", expected: "Owner, Issuer, SHA-256 fingerprint.", mitre: "T1553" },
    { cmd: "adb logcat -d | Select-String -Pattern \"gfs|token\"", purpose: "Grep for PII/tokens in log output.", expected: "Any matching log lines (should be none in release).", mitre: "T1552.001" },
    { cmd: "adb backup -f gfs.ab -noapk com.gfs.bank", purpose: "Test whether backup is enabled (should not be).", expected: "Backup prompt — refusal expected on hardened app.", mitre: "T1005" },
  ],
  commandsKali: [
    { cmd: "apktool d base.apk -o gfs-decoded", purpose: "Decode APK for manifest/resource review.", expected: "gfs-decoded/ directory with AndroidManifest.xml, res/, smali/.", mitre: "T1518.001" },
    { cmd: "jadx -d out base.apk", purpose: "Decompile APK to readable Java.", expected: "out/sources/... Java files.", mitre: "T1518.001" },
    { cmd: "grep -rE \"exported=\\\"true\\\"|allowBackup=\\\"true\\\"\" gfs-decoded/AndroidManifest.xml", purpose: "Fast manifest triage for risky flags.", expected: "Any matches are review-worthy.", mitre: "T1518.001" },
    { cmd: "frida-ps -Uai", purpose: "List apps on the attached USB device.", expected: "PID + name + identifier for each app.", mitre: "T1057" },
    { cmd: "objection -g com.gfs.bank explore --startup-command 'android sslpinning disable'", purpose: "Attempt runtime cert-pinning bypass.", expected: "Pinning bypass status per detected library.", mitre: "T1553.004" },
    { cmd: "mitmproxy -p 8080 --set block_global=false", purpose: "Intercept traffic once pinning is bypassed.", expected: "Live flow view of API calls.", mitre: "T1040" },
  ],
  pitfalls: [
    { mistake: "Marking components exported to make deep links work.", why: "Any app can now invoke them without permission.", fix: "App Links + signature-level permissions + re-auth on sensitive actions." },
    { mistake: "Storing JWT in SharedPreferences.", why: "Backup / rooted device / logcat leak.", fix: "Android Keystore + short TTL + server-side revocation." },
    { mistake: "Pinning only in a library that Frida can hook.", why: "One-line objection bypass.", fix: "Layer with App Attest / Play Integrity + server-side signals." },
    { mistake: "allowBackup=true on release.", why: "adb / cloud backup surfaces tokens.", fix: "allowBackup=false or scoped backup rules." },
  ],
  handsOn: {
    title: "Release-Candidate Static Review",
    steps: [
      "Pull the release APK from the CI artefact store.",
      "Run MobSF against it and export the JSON findings.",
      "Manual manifest triage: exported, allowBackup, debuggable, permissions.",
      "grep decompiled sources for hardcoded endpoints and secrets.",
      "Try adb backup and adb pull /data/data — should both fail.",
      "Attempt objection SSL pinning disable; note whether traffic becomes visible.",
    ],
    expected: "Release-blocker list with severity, evidence path, and 1-sprint fix.",
  },
  summary: {
    keyPoints: [
      "The device is untrusted — every artefact off-device is a leak.",
      "AndroidManifest.xml is the trust boundary — audit every export.",
      "Pinning is defence-in-depth, not a silver bullet — layer with attestation.",
      "Every sensitive deep-link action must re-authenticate.",
    ],
    examTraps: [
      "Root detection ≠ tamper prevention — Frida bypasses most in one line.",
      "'HTTPS' without pinning is bypassable via user-installed CA.",
      "Content providers are exported by default on old targetSdk — check!",
    ],
    nextModule: "M18 — IoT and OT Hacking",
  },
};

/* ============================== MODULE 18 ============================== */
const M18: GfsTemplate = {
  slug: "iot-hacking",
  phase: "Phase 18: IoT/OT Security Analyst",
  moduleTitle: "IoT and OT Hacking",
  subtitle: "Branch physical-security IoT + OT/BMS review across GFS estate.",
  subLessons: [
    { id: "sl1", title: "IoT vs OT — Why the distinction matters",
      body: "IoT = internet-connected consumer/enterprise devices (cameras, badges). OT = operational tech (BMS, HVAC, physical access, industrial control). Availability > confidentiality; patch windows are years, not weeks.",
      bullets: ["Purdue model", "IT/OT DMZ", "Safety Instrumented Systems"] },
    { id: "sl2", title: "IoT Attack Surface",
      body: "Firmware, UART/JTAG, cloud APIs, mobile companion apps, wireless (BLE/Zigbee/Z-Wave/LoRa). Default credentials remain the #1 finding decades on.",
      bullets: ["Firmware extraction (binwalk)", "UART/JTAG shell", "Companion-app auth"] },
    { id: "sl3", title: "OT Protocols (Modbus, DNP3, BACnet, S7)",
      body: "Legacy protocols designed without authentication or encryption. On a routable network they are trivially replay-able. Segmentation is the primary control.",
      bullets: ["Modbus function codes", "DNP3 unsolicited responses", "BACnet building-mgmt"] },
    { id: "sl4", title: "Passive OT Assessment Rules",
      body: "Active scans crash safety-critical devices. GFS engagement rule: passive-only in OT zones; any active testing requires facilities director sign-off and a maintenance window.",
      bullets: ["Passive tap / SPAN", "Zeek + ICS parsers", "No fuzzing in prod"] },
    { id: "sl5", title: "Detection & Segmentation",
      body: "OT-aware NDR (Claroty / Nozomi / Dragos) baselines expected flows and alerts on new talkers or unusual function codes. Firewall diode enforces one-way IT→OT telemetry.",
      bullets: ["Purdue-aligned firewalls", "Unidirectional gateways", "Asset inventory as a control"] },
  ],
  diagram: {
    title: "GFS Branch IoT + OT Layout (Purdue Model)",
    ascii: `  Level 5 : Corporate IT (Email, ERP)
  Level 4 : Business  (Branch LAN, Wi-Fi)
  ──────── IT / OT DMZ  (proxy, jump, data diode) ────────
  Level 3 : Site ops   (BMS server, historian)
  Level 2 : Control    (PLCs — HVAC, access control)
  Level 1 : Basic ctrl (Sensors, relays)
  Level 0 : Physical   (doors, HVAC, cameras)`,
    caption: "Every level crossing must be brokered; any 'flat network' between levels is a finding.",
    workflow: [
      "Inventory: all IoT/OT assets across branch estate",
      "Segmentation review: firewall rules between Purdue levels",
      "Passive capture in OT zone (SPAN port only)",
      "Firmware pulls for sample IoT (cameras, badges) — analyse offline",
      "Companion-app API review shared with M17 tooling",
      "Detection review: NDR baselines + alerting thresholds",
    ],
  },
  keyTools: [
    { name: "binwalk", traditional: "Firmware signature scanning and extraction.", aiEvolution: "AI clusters extracted binaries by function and flags suspicious embedded credentials.", cmd: "binwalk -Me firmware.bin" },
    { name: "Zeek + ICS parsers", traditional: "Passive protocol analysis with Modbus/DNP3/BACnet parsers.", aiEvolution: "AI baselines expected flows per device and alerts on new function codes.", cmd: "zeek -i eth0 icsnpp-modbus" },
    { name: "shodan CLI", traditional: "External exposure lookups for IoT/OT devices.", aiEvolution: "AI correlates exposed devices to known CVEs and infers exploit likelihood.", cmd: "shodan search 'org:\"GFS\" port:502'" },
    { name: "PLCScan (passive)", traditional: "Read-only PLC fingerprinting.", aiEvolution: "AI infers PLC role from historian topic subscriptions without active queries.", cmd: "plcscan --passive --pcap capture.pcap" },
  ],
  commandsWindows: [
    { cmd: "Get-NetTCPConnection | Where-Object RemotePort -eq 502", purpose: "Detect Modbus TCP flows on an audited workstation.", expected: "Any 502/TCP connections listed.", mitre: "T1046" },
    { cmd: "arp -a", purpose: "Local L2 neighbours — IoT devices often show up here.", expected: "IP / MAC / type list.", mitre: "T1018" },
    { cmd: "Test-NetConnection <BMS-IP> -Port 47808", purpose: "BACnet UDP reachability check (from BMS-authorised host only).", expected: "TcpTestSucceeded True/False.", mitre: "T1046" },
    { cmd: "Get-DnsClientCache | Where-Object Entry -like '*bms*'", purpose: "Find BMS-related DNS names cached on host.", expected: "BMS controller hostnames.", mitre: "T1016" },
    { cmd: "Get-WinEvent -LogName System -MaxEvents 200 | Where-Object Message -match 'BACnet|Modbus'", purpose: "Look for OT-protocol references in system logs.", expected: "Any matching events (usually none on IT hosts).", mitre: "T1082" },
    { cmd: "route print", purpose: "Verify IT host has no routes into OT segments.", expected: "Should NOT list OT subnets.", mitre: "T1016" },
  ],
  commandsKali: [
    { cmd: "binwalk -Me firmware.bin", purpose: "Extract embedded filesystems and binaries.", expected: "_firmware.bin.extracted/ tree.", mitre: "T1518.001" },
    { cmd: "strings squashfs-root/etc/passwd", purpose: "Look for baked-in accounts in extracted firmware.", expected: "Any non-nobody user is worth review.", mitre: "T1552.001" },
    { cmd: "sudo tcpdump -i eth0 -w ot.pcap 'port 502 or port 20000 or port 47808'", purpose: "Passive capture of Modbus/DNP3/BACnet on a SPAN port.", expected: "ot.pcap grows over time.", mitre: "T1040" },
    { cmd: "zeek -r ot.pcap icsnpp-modbus", purpose: "Parse Modbus flows offline (SAFE).", expected: "modbus.log with function codes.", mitre: "T1040" },
    { cmd: "nmap -sn 10.20.30.0/24", purpose: "IoT segment host discovery (ping sweep — non-invasive).", expected: "Host up entries; NEVER run scripts against OT.", mitre: "T1018" },
    { cmd: "shodan search 'org:\"GFS\" port:47808'", purpose: "External BACnet exposure check.", expected: "Should return 0; anything else is a finding.", mitre: "T1590" },
  ],
  pitfalls: [
    { mistake: "Running nmap -sV or scripts against a PLC.", why: "Malformed packets can halt safety-critical logic.", fix: "Passive capture only; active tests need facilities sign-off + window." },
    { mistake: "Assuming 'not on internet' = safe.", why: "Modbus/BACnet have no auth; lateral pivot from IT trivially reaches them.", fix: "Segment at the firewall; monitor at the boundary with an OT-aware NDR." },
    { mistake: "Trusting IoT firmware without offline analysis.", why: "Hardcoded credentials and update-server URLs are the norm.", fix: "binwalk + strings + companion-app review for every purchased fleet." },
    { mistake: "Skipping companion apps.", why: "Cloud API auth in the app is often the weakest link.", fix: "Share tooling and findings with the M17 mobile review." },
  ],
  handsOn: {
    title: "Branch Firmware & Segmentation Review",
    steps: [
      "Extract firmware from a sample badge reader with binwalk.",
      "grep the rootfs for /etc/shadow, hardcoded API keys, update URLs.",
      "From an IT host, attempt to reach the BMS controller — should fail.",
      "From the OT jump host, verify only the historian is reachable.",
      "Passive-capture 30 minutes of OT traffic and parse with Zeek.",
      "Confirm NDR alerted on any injected test frame from the jump host.",
    ],
    expected: "Segmentation matrix + firmware findings + NDR coverage gaps.",
  },
  summary: {
    keyPoints: [
      "OT prioritises availability — active scans can kill people.",
      "Default credentials + hardcoded keys remain the #1 IoT finding.",
      "Segmentation is the primary control, not host hardening.",
      "OT-aware NDR baselines are the detection story.",
    ],
    examTraps: [
      "Modbus TCP has NO authentication or encryption.",
      "Zeek can parse ICS protocols passively — no packets sent.",
      "Purdue Level 3.5 = the IT/OT DMZ (not Level 3 or 4).",
    ],
    nextModule: "M19 — Cloud Computing",
  },
};

/* ============================== MODULE 19 ============================== */
const M19: GfsTemplate = {
  slug: "cloud-computing",
  phase: "Phase 19: Cloud Security Analyst",
  moduleTitle: "Cloud Computing",
  subtitle: "Shared-responsibility review of GFS's multi-cloud (AWS + Azure) estate.",
  subLessons: [
    { id: "sl1", title: "Shared Responsibility & Cloud Attack Surface",
      body: "The provider secures the cloud; you secure what's in it. IAM, storage, network, workload identity, and CI/CD trust are the recurring failure modes.",
      bullets: ["AWS vs Azure vs GCP model", "IaaS vs PaaS vs SaaS split", "Regulator's view of 'cloud outages'"] },
    { id: "sl2", title: "IAM & Identity Federation",
      body: "Overprivileged roles, unrotated access keys, and weak assume-role trust policies dominate cloud breach retros. Federate to the corporate IdP; ban static keys.",
      bullets: ["Least privilege via IAM Access Analyzer", "SCPs / Azure Policy", "Just-in-Time via PIM"] },
    { id: "sl3", title: "Storage & Data Exposure",
      body: "S3 buckets and Azure Storage remain the most-photographed cloud breach surface. Block Public Access at account level; enforce SSE-KMS + BYOK for regulated data.",
      bullets: ["S3 BPA / Storage firewall", "Public-access advisor", "Versioning + Object Lock for ransomware"] },
    { id: "sl4", title: "Workload Identity & Metadata (IMDSv2)",
      body: "Any SSRF that reaches the metadata service can steal the workload's identity. IMDSv2 (session-token) is mandatory on every EC2; Azure IMDS + Managed Identities need equivalent controls.",
      bullets: ["IMDSv2 hop-limit", "GuardDuty findings", "Sidecar SSRF filtering"] },
    { id: "sl5", title: "CI/CD & Supply Chain",
      body: "The pipeline has more power than any single engineer. OIDC-federated CI, short-lived tokens, and signed artefacts (Sigstore) close the SolarWinds-era gap.",
      bullets: ["GitHub OIDC → AWS role", "SLSA provenance", "Signed images (cosign)"] },
  ],
  diagram: {
    title: "GFS Multi-Cloud Trust & Data Flow",
    ascii: `  ┌────────────┐  federation  ┌────────────┐
  │ Corporate  │─────────────▶│  AWS IAM   │
  │   IdP      │              │  Azure AD  │
  └────────────┘              └─────┬──────┘
                                    │ assume-role
             ┌──────────────────────┴──────────────┐
             ▼                                     ▼
      ┌────────────┐                        ┌────────────┐
      │  EC2 / VM  │──IMDSv2──▶ workload id │  S3/Blob  │
      └─────┬──────┘                        │  (BPA on) │
            │                               └────────────┘
            ▼
      ┌────────────┐   OIDC   ┌────────────┐
      │  CI/CD     │◀────────▶│ GitHub/ADO │ ← signed artefacts
      └────────────┘          └────────────┘`,
    caption: "SSRF into IMDS is the recurring cloud-to-cloud pivot; OIDC-federated CI removes long-lived keys.",
    workflow: [
      "IAM: pull every role, key age, last-used date; flag > 90 days",
      "Storage: enumerate every public bucket / container; account-level BPA",
      "Network: audit SG/NSG for 0.0.0.0/0 on non-web ports",
      "Workload: confirm IMDSv2-only + hop limit 1",
      "Logging: CloudTrail/Defender enabled multi-region + immutable",
      "CI/CD: replace static AWS keys with OIDC federation",
    ],
  },
  keyTools: [
    { name: "ScoutSuite / Prowler", traditional: "Multi-cloud security posture checks.", aiEvolution: "AI prioritises findings by real blast radius using inferred data classification and role reach.", cmd: "prowler aws --checks-folder cis" },
    { name: "IAM Access Analyzer", traditional: "Reports resource-based policies exposing data outside the account.", aiEvolution: "AI clusters findings into recurring anti-patterns and drafts SCP/policy fixes.", cmd: "aws accessanalyzer list-findings --analyzer-arn <arn>" },
    { name: "kube-hunter / kubescape", traditional: "Kubernetes cluster posture and CVE assessment.", aiEvolution: "AI suggests OPA/Gatekeeper policies aligned to observed workloads.", cmd: "kubescape scan framework nsa" },
    { name: "trivy / cosign", traditional: "Image vulnerability + signature verification.", aiEvolution: "AI blocks deploy when SBOM diff introduces packages with active exploitation.", cmd: "trivy image --severity HIGH,CRITICAL <image>" },
  ],
  commandsWindows: [
    { cmd: "az account show", purpose: "Confirm active Azure subscription and identity.", expected: "id / name / user block.", mitre: "T1087.004" },
    { cmd: "az role assignment list --all --assignee <upn>", purpose: "Enumerate a principal's role assignments.", expected: "roleDefinitionName + scope list.", mitre: "T1069.003" },
    { cmd: "az storage account list --query \"[?allowBlobPublicAccess==\\`true\\`].name\"", purpose: "Find storage accounts with public blobs allowed.", expected: "Names — should be empty in a hardened tenant.", mitre: "T1580" },
    { cmd: "Get-MgUser -All | Where-Object AccountEnabled -eq $false", purpose: "List disabled Azure AD users still present.", expected: "Any lingering accounts.", mitre: "T1087.004" },
    { cmd: "az monitor diagnostic-settings list --resource <id>", purpose: "Confirm diagnostic logging is enabled per resource.", expected: "Setting name + storage/eventhub sink.", mitre: "T1562.008" },
    { cmd: "az policy state summarize", purpose: "Azure Policy compliance summary.", expected: "Compliant vs non-compliant counts by policy.", mitre: "T1526" },
  ],
  commandsKali: [
    { cmd: "aws sts get-caller-identity", purpose: "Confirm current AWS identity and account.", expected: "UserId / Account / Arn JSON.", mitre: "T1087.004" },
    { cmd: "aws iam list-access-keys --user-name <user> --query 'AccessKeyMetadata[*].[AccessKeyId,CreateDate,Status]'", purpose: "Find stale access keys per user.", expected: "Any key > 90 days is a finding.", mitre: "T1552.001" },
    { cmd: "aws s3api list-buckets --query 'Buckets[*].Name'", purpose: "Enumerate all buckets in the account.", expected: "Bucket name list.", mitre: "T1580" },
    { cmd: "aws s3api get-public-access-block --bucket <b>", purpose: "Confirm BPA is enabled on each bucket.", expected: "All four flags true.", mitre: "T1580" },
    { cmd: "aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,MetadataOptions.HttpTokens]'", purpose: "Confirm IMDSv2 enforcement per instance.", expected: "HttpTokens = required for every row.", mitre: "T1552.005" },
    { cmd: "prowler aws --compliance cis_2.0_aws --output-modes html", purpose: "Full CIS AWS benchmark scan.", expected: "prowler-output-*.html with findings.", mitre: "T1526" },
  ],
  pitfalls: [
    { mistake: "Long-lived static AWS access keys in CI.", why: "Leak = full account compromise until rotation.", fix: "OIDC federation from GitHub/ADO to short-lived STS credentials." },
    { mistake: "IMDSv1 still enabled.", why: "Any SSRF → workload role theft (Capital One 2019).", fix: "Enforce IMDSv2 via SCP; hop-limit 1." },
    { mistake: "Trusting default S3 permissions.", why: "One misclick = public bucket + regulator letter.", fix: "Account-level Block Public Access; alert on any public policy." },
    { mistake: "Logging disabled 'to save money'.", why: "No CloudTrail = no incident forensics.", fix: "Multi-region CloudTrail + Defender for Cloud, immutable + KMS-encrypted." },
  ],
  handsOn: {
    title: "Cross-Cloud Posture Sweep",
    steps: [
      "Confirm caller identity in both AWS and Azure.",
      "List stale IAM keys > 90 days across all users.",
      "Enumerate every S3 bucket and storage account; confirm BPA/firewall.",
      "For every EC2, confirm IMDSv2 required.",
      "Run prowler CIS scan; export HTML.",
      "Run az policy state summarize; capture non-compliance.",
    ],
    expected: "Posture report with per-account/subscription findings + prioritised remediation.",
  },
  summary: {
    keyPoints: [
      "Shared responsibility: provider secures the cloud, you secure what's in it.",
      "IAM misconfiguration is the recurring root cause.",
      "IMDSv2 + SSRF filtering close the metadata-theft pivot.",
      "Signed artefacts + OIDC-federated CI close the supply-chain pivot.",
    ],
    examTraps: [
      "S3 bucket public ≠ 'anyone can write' — read/write are separate.",
      "GuardDuty is detection, not prevention.",
      "AWS root user should have MFA + no keys — ever.",
    ],
    nextModule: "M20 — Cryptography",
  },
};

/* ============================== MODULE 20 ============================== */
const M20: GfsTemplate = {
  slug: "cryptography",
  phase: "Phase 20: Cryptographic Estate Analyst",
  moduleTitle: "Cryptography",
  subtitle: "Algorithm inventory, KMS/HSM hygiene, code-signing, post-quantum roadmap.",
  subLessons: [
    { id: "sl1", title: "Symmetric, Modes & AEAD",
      body: "AES in AEAD modes (GCM, GCM-SIV, ChaCha20-Poly1305) is the modern default. ECB, CBC-without-HMAC, and static IVs are the recurring failure modes.",
      bullets: ["AES-128 vs AES-256", "GCM nonce reuse = plaintext recovery", "Prefer misuse-resistant AEAD"] },
    { id: "sl2", title: "Asymmetric, Signatures & PKI",
      body: "RSA-2048+ / ECDSA P-256+ / Ed25519 paired with SHA-256+. Short-lived certs, automated rotation, working revocation are the operational reality.",
      bullets: ["RSA-1024 / SHA-1 must go", "OCSP stapling vs CRL", "Cert lifecycle automation"] },
    { id: "sl3", title: "Key Management (KMS/HSM/Envelope)",
      body: "Where root keys live, who can use them, and how usage is audited defines the actual encryption story. 'One KMS key for the whole account' is not a strategy.",
      bullets: ["Per-service data keys", "HSM-backed root", "Alert on unusual decrypt volume"] },
    { id: "sl4", title: "Code Signing & Supply Chain",
      body: "The signing key IS the trust anchor for every downstream check. Move it to HSM; move to ephemeral per-build signing (Sigstore); publish SLSA provenance.",
      bullets: ["Signing key on CI disk = SolarWinds risk", "SLSA levels 1–4", "Sigstore/Notary v2"] },
    { id: "sl5", title: "Post-Quantum & Crypto-Agility",
      body: "Long-lived confidentiality data is already inside the 'harvest now, decrypt later' window. Start crypto-agility now; pilot ML-KEM / ML-DSA / SLH-DSA on suitable services.",
      bullets: ["NIST PQC finalists", "Prioritise long-lifetime data", "Isolate algorithm choice in code"] },
  ],
  diagram: {
    title: "GFS Cryptographic Estate — Data, Transit, Trust",
    ascii: `           ┌────────────┐   TLS 1.2+/AEAD    ┌────────────┐
  Client ─▶│  Web / API │────────────────────▶│  Backend   │
           └────┬───────┘                     └────┬───────┘
                │                                  │  KMS envelope
                ▼                                  ▼
         ┌────────────┐                      ┌────────────┐
         │ Storage    │◀── SSE-KMS / BYOK ──│ HSM / KMS   │
         │ (at rest)  │                      │ (root keys)│
         └────────────┘                      └─────┬──────┘
                                                   │ per-service data keys
                                                   ▼
                                           ┌────────────┐
                                           │ Code signer│
                                           │ (HSM/SLSA) │
                                           └────────────┘`,
    caption: "The signing HSM and the storage KMS are the two crown-jewel key stores — audit both quarterly.",
    workflow: [
      "Algorithm inventory: what runs where, at what key length",
      "TLS surface audit: protocols, ciphers, HSTS, OCSP",
      "KMS/HSM: ownership, rotation, blast radius per key",
      "Code-signing chain: keys, storage, provenance",
      "PRNG/IV/nonce audit — static IVs and GCM reuse are killers",
      "PQ exposure map — algorithms × data lifetime",
    ],
  },
  keyTools: [
    { name: "testssl.sh", traditional: "TLS protocol and cipher suite audit.", aiEvolution: "AI clusters weak-cipher hosts by owning team and generates fix-ticket copy.", cmd: "testssl.sh --severity HIGH api.gfsbank.com" },
    { name: "sslyze", traditional: "Fast programmatic TLS scanning.", aiEvolution: "AI diffs today's scan vs the last 30 days to spot regressions.", cmd: "sslyze --regular api.gfsbank.com" },
    { name: "cryptolyzer", traditional: "Algorithm/protocol audit for TLS + SSH + DNSSEC.", aiEvolution: "AI maps findings to policy floors and drafts remediation.", cmd: "cryptolyze tls all api.gfsbank.com" },
    { name: "cosign / sigstore", traditional: "Sign and verify container images/artefacts.", aiEvolution: "AI enforces SLSA provenance policy at admission; blocks unsigned images.", cmd: "cosign verify gfsbank/api:1.4.2" },
  ],
  commandsWindows: [
    { cmd: "Get-TlsCipherSuite | Select-Object Name, Cipher, Hash", purpose: "Enumerate host-supported TLS cipher suites.", expected: "List of enabled suites; look for legacy CBC or 3DES.", mitre: "T1046" },
    { cmd: "Get-ChildItem Cert:\\LocalMachine\\My | Select-Object Subject, NotAfter, HasPrivateKey", purpose: "Machine certificate inventory.", expected: "Subject / expiry / private-key flag per cert.", mitre: "T1552.004" },
    { cmd: "certutil -store My", purpose: "Detailed store contents (issuer, thumbprint, template).", expected: "Full cert details per entry.", mitre: "T1553.004" },
    { cmd: "Get-BitLockerVolume", purpose: "BitLocker status per volume.", expected: "MountPoint / ProtectionStatus / EncryptionMethod.", mitre: "T1486" },
    { cmd: "Get-Item HKLM:\\SYSTEM\\CurrentControlSet\\Control\\SecurityProviders\\SCHANNEL\\Protocols\\TLS 1.0\\Server", purpose: "Confirm TLS 1.0 is disabled at Schannel.", expected: "Enabled=0 / DisabledByDefault=1.", mitre: "T1562.001" },
    { cmd: "Get-AuthenticodeSignature C:\\path\\to\\artifact.exe", purpose: "Verify code-signing chain on an artefact.", expected: "Status Valid + SignerCertificate fields.", mitre: "T1553.002" },
  ],
  commandsKali: [
    { cmd: "testssl.sh --severity HIGH api.gfsbank.com", purpose: "TLS posture audit with severity gating.", expected: "HIGH-severity findings only.", mitre: "T1046" },
    { cmd: "nmap --script ssl-enum-ciphers -p 443 api.gfsbank.com", purpose: "Enumerate supported TLS ciphers via nmap.", expected: "Per-protocol cipher list with grade.", mitre: "T1046" },
    { cmd: "openssl s_client -connect api.gfsbank.com:443 -tls1_2 -status", purpose: "Handshake + OCSP stapling check.", expected: "Cert chain + OCSP response block.", mitre: "T1573.002" },
    { cmd: "openssl x509 -in leaf.pem -noout -text", purpose: "Inspect signature algorithm and key length.", expected: "Signature Algorithm + Public-Key: (2048 bit).", mitre: "T1552.004" },
    { cmd: "hashcat -m 22000 hash.22000 wordlist.txt --show", purpose: "Show already-cracked WPA hashes (audit, not attack).", expected: "Any cracked entries listed.", mitre: "T1110.002" },
    { cmd: "cosign verify --key cosign.pub gfsbank/api:1.4.2", purpose: "Verify container-image signature.", expected: "Verified OK + attestation JSON.", mitre: "T1553.002" },
  ],
  pitfalls: [
    { mistake: "Legacy 3DES / MD5 / SHA-1 lingering in internal services.", why: "Trivial collisions/forgery; retrospective breach risk.", fix: "Policy-level ban; algorithm floor enforced in CI." },
    { mistake: "One KMS key for the whole account.", why: "Compromise = wholesale decryption.", fix: "Per-service data keys; scoped grants; usage alerting." },
    { mistake: "Code-signing key on CI disk.", why: "Any CI compromise signs malicious artefacts as the bank.", fix: "HSM-backed signing + ephemeral per-build (Sigstore) + SLSA provenance." },
    { mistake: "'PQ is decades away, ignore it.'", why: "Harvest-now-decrypt-later is already a state-actor strategy.", fix: "Crypto-agility layer + PQ pilots on long-lifetime data now." },
  ],
  handsOn: {
    title: "TLS + Signing Audit Sweep",
    steps: [
      "Run testssl.sh against 5 GFS external endpoints.",
      "Diff enabled cipher suites vs the policy floor (TLS 1.2+ AEAD only).",
      "Enumerate KMS keys and their age; flag any > 2 years unrotated.",
      "Verify a sample of signed artefacts with cosign.",
      "Grep the codebase for MD5 / SHA1 / DES / RC4 usage.",
      "Confirm mobile / desktop app signing keys live on HSM, not CI disk.",
    ],
    expected: "Cryptographic Posture Report with weak-cipher register + signing chain review + PQ roadmap.",
  },
  summary: {
    keyPoints: [
      "AEAD everywhere; ban ECB / bare-CBC / static IVs at policy level.",
      "Per-service KMS keys, automated rotation, alert on unusual usage.",
      "Code-signing keys belong in HSM, not CI disk.",
      "Start crypto-agility + PQ pilots now — long-lifetime data is already in the window.",
    ],
    examTraps: [
      "AES-256 in ECB is still broken — mode > key length.",
      "Perfect Forward Secrecy requires ephemeral key exchange (ECDHE), not just TLS 1.2.",
      "Hashing ≠ encryption; MACs ≠ signatures.",
    ],
    nextModule: "Programme complete — schedule the CEH v13 exam.",
  },
};

export const GFS_TEMPLATE_MODULES: Record<string, GfsTemplate> = {
  [M16.slug]: M16,
  [M17.slug]: M17,
  [M18.slug]: M18,
  [M19.slug]: M19,
  [M20.slug]: M20,
};
