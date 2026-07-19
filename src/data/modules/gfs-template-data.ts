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
      body: "**What it is.** Wi-Fi (802.11) is radio, not cable. Devices talk over 2.4, 5, and 6 GHz using three frame types: Management (join/leave), Control (traffic cops), and Data (payload).\n\n**Why it matters.** Management frames are sent *in the clear* on WPA2 and earlier — that single fact enables deauth attacks, evil twins, and forced disconnects.\n\n**Terms to lock in.**\n- **SSID** = the network name you see. **BSSID** = the AP's MAC address.\n- **Managed mode** = normal client. **Monitor mode** = capture every frame in the air.",
      bullets: ["802.11a/b/g/n/ac/ax/be standards", "Bands, channels, RSSI, SNR", "SSID / BSSID / ESSID / IBSS", "Managed vs Monitor vs Master mode", "Antenna types: omni, Yagi, parabolic"] },
    { id: "sl2", title: "Wireless Encryption",
      body: "**The lineage.** WEP → WPA → WPA2 → WPA3. Only WPA2 and WPA3 are acceptable today. WEP and WPA (TKIP) are broken.\n\n**WPA2-Personal (PSK).** One shared password. When a device joins, a **4-way handshake** happens — capture it and you can guess the password offline (`hashcat -m 22000`).\n\n**WPA2-Enterprise (802.1X).** No shared password. Each user authenticates to a RADIUS server. **EAP-TLS** (client certificates) is the gold standard; **PEAP-MSCHAPv2** can be cracked offline.\n\n**WPA3-SAE.** Fixes the offline-guess problem and adds **PMF (802.11w)** to stop deauth attacks. Watch out for **transition mode**, which keeps WPA2 alive as a fallback and re-opens the door.",
      bullets: ["WEP → WPA → WPA2 → WPA3 evolution", "4-way handshake + PMKID capture", "EAP-TLS vs PEAP vs TTLS vs LEAP", "SAE (Dragonfly) + PMF/802.11w", "AES-CCMP vs GCMP-256"] },
    { id: "sl3", title: "Wireless Threats",
      body: "**Rogue AP** — an unauthorised AP plugged into the corporate LAN. Bridges attacker straight to the internal network.\n\n**Evil Twin** — a fake AP copying a real SSID. Users auto-connect; attacker sees all their traffic.\n\n**Deauth flood** — spoofed disconnect frames kick users off so they re-join (and reveal the handshake).\n\n**Protocol bugs** — KRACK, FragAttacks, and Dragonblood exploit weaknesses in the standards themselves.\n\n**Client-side leaks** — laptops re-broadcast every SSID they've ever joined. Karma/MANA answers \"yes, I'm that one\" to whichever probe arrives.",
      bullets: ["Rogue AP vs Evil Twin vs Karma", "Deauth / Disassoc / Beacon flood", "KRACK, FragAttacks, Dragonblood", "WPS PIN attack (Pixie Dust, Reaver)", "Bluetooth: Bluejacking, Bluesnarfing, BlueBorne"] },
    { id: "sl4", title: "Wireless Hacking Methodology",
      body: "The six-step EC-Council flow — memorise the order:\n\n1. **Discover** — passive scan for APs and clients (`airodump-ng`).\n2. **Map** — GPS-tag the APs (wardriving).\n3. **Analyse** — read the captured traffic in Wireshark.\n4. **Attack** — deauth to force a handshake, or stand up an evil twin.\n5. **Crack** — feed the handshake to `hashcat`.\n6. **Compromise** — you're on the LAN; now pivot inward.",
      bullets: ["Discover → Map → Analyse → Attack → Crack → Compromise", "airmon-ng, airodump-ng, aireplay-ng, aircrack-ng", "hcxdumptool + hcxpcapngtool → hashcat", "eaphammer, wifite2, Fluxion (evil twin)", "Pivot: internal recon after AP break-in"] },
    { id: "sl5", title: "Wireless Attack Countermeasures",
      body: "**Pick the right protocol.** WPA3-SAE with PMF *required*. If you must run WPA2, use **EAP-TLS with per-device certificates** — never PSK on a corporate SSID.\n\n**Kill the easy wins.** Turn off WPS on every AP. Hiding the SSID is *not* security — it hides nothing from a monitor-mode capture.\n\n**Watch the air.** A WIPS (Cisco, Aruba, Extreme) auto-contains rogue and evil-twin APs. Do a physical RF sweep once a quarter — under-desk rogues never show up in logical scans.\n\n**Segment.** Guest and IoT SSIDs go on isolated VLANs with client isolation enabled.",
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
      body: "Mobile attacks come through **four doors**:\n\n- **Physical** — lost or stolen phone, malicious charging cables (juice-jacking), shoulder-surfing.\n- **Network** — rogue Wi-Fi, SSL stripping, cellular downgrade, SS7 interception.\n- **App** — malicious side-loaded apps, over-permissioned SDKs, compromised ad libraries.\n- **Web/inter-app** — WebView JavaScript bridges, custom URL schemes, cross-app deep links.\n\nOWASP **MASVS** and the **Mobile Top 10** name the recurring weaknesses — insecure storage, weak transport, weak auth, weak crypto, reverse-engineering exposure, and leftover debug code.",
      bullets: ["OWASP MASVS L1/L2/R + Mobile Top 10", "Physical: theft, juice-jacking, screen-recording", "Network: rogue AP, SSL stripping, SS7", "App: malware, SDK abuse, side-loading", "Web: WebView JS-bridge, cross-app URL schemes"] },
    { id: "sl2", title: "Hacking Android OS",
      body: "**How Android defends itself.** Every app runs as its own Linux user, SELinux enforces mandatory access control, and the `AndroidManifest.xml` declares what the app exposes to other apps.\n\n**Attacker workflow.**\n1. Root a test device or use an emulator.\n2. Pull the APK: `adb pull /data/app/.../base.apk`.\n3. Decompile with `apktool` / `jadx`.\n4. Audit the manifest for the three red flags: `exported=true`, `allowBackup=true`, `debuggable=true`.\n5. Attach `Frida` / `Objection` at runtime to strip SSL pinning, root detection, and biometric checks.\n\n**Real-world impact.** Banking malware (BankBot, Cerberus, Anubis) abuses **Accessibility Services** to draw fake login screens over the real bank app and steal credentials.",
      bullets: ["adb, Frida, Objection, apktool, jadx, MobSF", "AndroidManifest.xml audit (exported, backup, debuggable)", "Root detection & SSL pinning bypass", "Accessibility-service overlay malware", "Deep-link + intent redirection attacks"] },
    { id: "sl3", title: "Hacking iOS",
      body: "**How iOS defends itself.** Strict app sandbox, mandatory code signing (only Apple-signed binaries run), **ATS** forces TLS 1.2+, and secrets sit in a hardware-backed **Keychain / Secure Enclave**.\n\n**Attacker workflow.**\n1. Jailbroken device (or Corellium VM).\n2. Decrypt the IPA: `frida-ios-dump` or `Clutch`.\n3. Read `Info.plist` for ATS exceptions and custom URL schemes.\n4. `class-dump` to list Objective-C methods.\n5. Hook with `Frida` to bypass jailbreak and biometric checks.\n\n**Common findings.** PII printed to `NSLog`, tokens stored with the loosest Keychain class (`kSecAttrAccessibleAlways`), and missing Universal Links verification.",
      bullets: ["Sandbox, code signing, Secure Enclave", "frida-ios-dump / Clutch (decrypt IPA)", "class-dump + otool for binary inspection", "Info.plist: ATS exceptions, URL schemes", "Keychain access classes + App Attest"] },
    { id: "sl4", title: "Mobile Device Management (MDM)",
      body: "**MDM** (Intune, Jamf, Workspace ONE) manages the *whole device* — passcode, encryption, jailbreak checks, app whitelist, per-app VPN, remote wipe.\n\n**MAM** manages *just the corporate apps* inside a container — the right choice for BYOD, because you can wipe work data without touching personal photos.\n\n**Enrolment methods.** Apple **DEP/ADE** and Android **Zero-Touch** enrol devices automatically the first time they power on.\n\n**Attack paths.** Unenrolled devices, stolen MDM certificates (grant full config push), and Work Profile bypass via USB debugging.",
      bullets: ["MDM vs MAM vs UEM", "Apple DEP/ADE, Android Zero-Touch", "Compliance: passcode, encryption, jailbreak block", "Per-app VPN + conditional access (Azure AD)", "Remote wipe: full vs selective (BYOD)"] },
    { id: "sl5", title: "Mobile Security Guidelines & Tools",
      body: "**For users / IT.** Auto-update the OS, ban side-loading, require biometric + strong PIN, disable USB debugging.\n\n**For developers.** Follow OWASP MASVS L2: pin certificates (with backup pins), obfuscate (R8/ProGuard), detect tampering, and run RASP.\n\n**Testing toolbelt.**\n- **Static + basic dynamic:** MobSF\n- **Runtime hooking:** Frida, Objection\n- **Android IPC fuzzing:** Drozer\n- **iOS assessment:** Needle\n- **Traffic interception:** mitmproxy, Burp Mobile Assistant\n\n**Compliance to know.** PCI-MPoC (card acceptance on phones), NIST SP 800-124r2, GDPR.",
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
    { id: "sl1", title: "IoT Concepts and Attacks",
      body: "**What an IoT system actually is.** A physical device (sensor or actuator) + a network link + a cloud backend + usually a mobile companion app. All four layers are in scope.\n\n**The five architectural layers.** Perception (sensors) → Network (Zigbee, BLE, LoRa, Wi-Fi) → Middleware (MQTT, CoAP) → Application (dashboards, APIs) → Business.\n\n**Why IoT keeps getting hacked.**\n- Default credentials that never change (Mirai).\n- Firmware without signing → attacker replaces it.\n- Debug pins (UART/JTAG) left on the board.\n- MQTT brokers with no auth on the internet.\n- OTA update channels that don't verify signatures.\n\nOWASP **IoT Top 10** codifies these — start every review from I1–I10.",
      bullets: ["IoT arch: Perception / Network / Middleware / App / Business", "Protocols: MQTT, CoAP, AMQP, Zigbee, Z-Wave, BLE, LoRaWAN", "Mirai / Mozi / BrickerBot botnets", "OWASP IoT Top 10 (I1–I10)", "Hardware attack surface: UART, JTAG, SPI flash"] },
    { id: "sl2", title: "IoT Hacking Methodology",
      body: "Five-step flow:\n\n1. **Recon** — Shodan / Censys for the device online, FCC ID lookups and teardown photos for the hardware.\n2. **Scan** — Nmap, Nessus, Firmalyzer against the device and its cloud API.\n3. **Attack** — replay RF (HackRF/RTL-SDR), sniff BLE (Ubertooth), enumerate MQTT topics, drop a shell over UART.\n4. **Gain access** — known CVE, default creds, or a hidden backdoor account.\n5. **Persist** — flash modified firmware so a reboot doesn't clean up.\n\nThe companion mobile app is reviewed with the **M17** methodology — it's usually where the API keys live.",
      bullets: ["Shodan/Censys + FCC ID hardware recon", "binwalk + firmadyne + FACT firmware analysis", "HackRF, RTL-SDR, Ubertooth, Bus Pirate", "MQTT.fx, mqtt-explorer, coap-client", "Modify firmware → re-flash → persist"] },
    { id: "sl3", title: "IoT Attack Countermeasures",
      body: "**Before you buy.** Procurement checklist: signed firmware, unique per-device credentials, disabled debug interfaces, and a written patch lifecycle.\n\n**After you deploy.**\n- Dedicated IoT VLAN with **default-deny egress**.\n- Inventory devices via DHCP fingerprinting.\n- Turn off mDNS and UPnP.\n- Passive NDR (Armis, Claroty xDome) baselines normal behaviour.\n\n**Standards to cite.** NIST IR 8259, ETSI EN 303 645, EU Cyber Resilience Act.\n\n**Mindset.** Treat every consumer IoT device deployed in a branch as hostile until segmented.",
      bullets: ["Signed firmware + secure boot mandatory", "Unique per-device credentials at manufacturing", "IoT VLAN + default-deny egress + NDR", "NIST IR 8259, ETSI EN 303 645, EU CRA", "Regular firmware update SLA in contract"] },
    { id: "sl4", title: "OT Concepts and Attacks",
      body: "**OT vs IT.** OT (Operational Technology) is the tech that runs *physical processes* — HVAC, factory lines, power, water. Think **PLC**, **SCADA**, **DCS**, **HMI**, **Historian**.\n\n**Priorities are inverted.** In IT: Confidentiality → Integrity → Availability. In OT: **Availability → Integrity → Confidentiality**. Uptime beats secrecy — a shutdown can kill people.\n\n**Purdue Model** organises OT into Levels 0–5 with an IT/OT DMZ at Level 3.5.\n\n**Landmark incidents worth naming.** Stuxnet (2010), Ukraine grid (2015/16), TRITON (2017, safety systems), Colonial Pipeline (2021), Oldsmar water (2021).",
      bullets: ["Purdue Model Levels 0–5 + DMZ (3.5)", "ICS / SCADA / DCS / PLC / RTU / HMI / Historian", "Protocols: Modbus, DNP3, BACnet, S7, EtherNet/IP, OPC-UA", "Stuxnet, TRITON, Industroyer, PIPEDREAM", "IEC 62443 zones + conduits model"] },
    { id: "sl5", title: "OT Hacking Methodology",
      body: "**Rule #0.** Passive-first. Active fuzzing against OT has killed people — every active step needs facilities sign-off and a maintenance window.\n\n**Five-step flow.**\n1. Capture traffic via SPAN/TAP; parse with Wireshark + Zeek ICS.\n2. Build the asset inventory from broadcast/multicast chatter.\n3. Analyse protocols — Modbus function codes 05/06/15/16 write coils and registers *without any auth*.\n4. Validate segmentation: try to reach OT from an IT jump host; it should fail.\n5. Assess HMI web apps under IEC 62443 / ISA-99.",
      bullets: ["Passive-only default; active needs sign-off + window", "Wireshark + Zeek icsnpp parsers", "PLCScan (passive), Redpoint, GRASSMARLIN", "Modbus/DNP3/BACnet function-code analysis", "Segmentation test from IT jump host"] },
    { id: "sl6", title: "OT Attack Countermeasures",
      body: "**IEC 62443 is the baseline.** Define **zones** (groups of assets with equal trust) and enforce **conduits** (the only allowed pathways between them) with firewalls or one-way **data diodes** (Waterfall, Owl).\n\n**Detect.** OT-aware NDR (Dragos, Nozomi, Claroty) learns the normal per-device flows and alerts on any new talker or unexpected function code.\n\n**Isolate safety.** Safety Instrumented Systems (SIS) must be *physically* separate from the process control system (BPCS).\n\n**Patch differently.** OT patches during scheduled outages. When you can't patch, wrap the device in an ICS-aware IPS (\"virtual patching\").\n\n**Practise IR.** Joint IT/OT runbook, tested with tabletop drills that include facilities engineers.",
      bullets: ["IEC 62443 zones + conduits + SL levels", "Unidirectional gateways for IT→OT telemetry", "OT-aware NDR: Dragos, Nozomi, Claroty xDome", "SIS physically isolated from BPCS", "Joint IT/OT IR playbook + tabletop drills"] },
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
    { id: "sl1", title: "Cloud Computing Concepts",
      body: "NIST SP 800-145 defines cloud by five essential characteristics (on-demand self-service, broad network access, resource pooling, rapid elasticity, measured service), three service models (IaaS, PaaS, SaaS), and four deployment models (public, private, hybrid, community). The shared responsibility model splits duties: the provider secures the cloud (hypervisor, physical), you secure what's in it (data, identity, config, code). Serverless and FaaS shift more up-stack but never eliminate customer responsibility for IAM and data classification.",
      bullets: ["NIST 5-4-3: characteristics / deployment / service", "IaaS vs PaaS vs SaaS vs FaaS", "Shared Responsibility Model (per-service matrix)", "CSA Cloud Controls Matrix (CCM)", "Multi-tenancy + hypervisor isolation"] },
    { id: "sl2", title: "Cloud Computing Threats",
      body: "CSA Top Threats to Cloud Computing ('Pandemic Eleven'): insufficient IAM, insecure interfaces/APIs, misconfiguration, lack of cloud security architecture, insecure software development, unsecured third-party resources, system vulnerabilities, accidental data disclosure, misconfigured serverless, advanced persistent threats, and cloud storage data exfiltration. Add: metadata SSRF (Capital One 2019), leaked access keys (Uber, CodeSpaces), and account takeover via SSO misconfig.",
      bullets: ["CSA 'Pandemic Eleven' top threats", "Misconfiguration = #1 root cause (Verizon DBIR)", "SSRF → IMDS credential theft", "Leaked keys in GitHub / Docker Hub", "Data residency + sovereignty risk"] },
    { id: "sl3", title: "Cloud Hacking",
      body: "Provider-agnostic attack flow: (1) External recon — S3/GCS/Blob enumeration (bucket_finder, GCPBucketBrute), DNS + certificate transparency for cloud fingerprints, GitHub secret scanning; (2) Initial access — leaked keys, phished SSO, exposed Jenkins/K8s dashboards; (3) Enumeration — Pacu (AWS), MicroBurst/ROADrecon (Azure), GCPTokenReuse (GCP); (4) Privilege escalation — iam:PassRole chains, subscription-owner via inherited role; (5) Persistence — new IAM user, Lambda backdoor, cross-account role trust; (6) Exfiltration — S3 sync to attacker account.",
      bullets: ["Recon: bucket enumeration + cert transparency", "Pacu (AWS), MicroBurst (Azure), GCPTokenReuse", "iam:PassRole + AssumeRole privilege chain", "Lambda/Function-app backdoor persistence", "Cross-account exfil via S3 sync"] },
    { id: "sl4", title: "AWS Hacking",
      body: "AWS-specific tradecraft: enumerate with `aws sts get-caller-identity`, ScoutSuite, Prowler, Pacu modules (iam__enum_permissions, iam__privesc_scan). Recurring wins: overly-broad `*` in IAM policies, IMDSv1 still enabled (SSRF → role theft), public S3 (BPA not enforced), unencrypted EBS snapshots, Lambda env-vars containing secrets, CloudTrail disabled in secondary regions, root user with active keys. Escalation techniques: 21+ documented iam privesc paths in Rhino Security's research (CreatePolicyVersion, PassRole+CreateFunction, etc.).",
      bullets: ["Pacu, ScoutSuite, Prowler, CloudSploit", "IMDSv1 SSRF → STS credential theft", "Rhino Security's 21 IAM privesc paths", "S3 BPA + KMS + Object Lock", "GuardDuty + CloudTrail + Config baselines"] },
    { id: "sl5", title: "Microsoft Azure Hacking",
      body: "Azure attack surface centres on Entra ID (formerly Azure AD): password spray via MSOL, device-code phishing, consent phishing (illicit consent grant), and Primary Refresh Token (PRT) theft on domain-joined devices. Tools: MicroBurst, ROADrecon, AzureHound, Stormspotter, PowerZure. Common findings: legacy auth still enabled (basic auth on Exchange), Global Admins > 5, no Conditional Access on privileged roles, Managed Identity with Contributor on subscription, storage accounts with `allowBlobPublicAccess=true`, Azure Key Vault without soft-delete/purge protection.",
      bullets: ["Entra ID: password spray, device-code, consent phish", "MicroBurst, ROADrecon, AzureHound, Stormspotter", "Conditional Access + PIM (JIT) mandatory", "Managed Identity blast radius review", "Defender for Cloud + Sentinel baseline"] },
    { id: "sl6", title: "Google Cloud Hacking",
      body: "GCP tradecraft: enumerate with `gcloud auth list`, GCPBucketBrute for storage, GCP IAM Recommender for over-privilege, and IAM Deny policies as a modern SCP-equivalent. Attack paths: service account impersonation (iam.serviceAccounts.getAccessToken), actAs chains, Cloud Function deploy → workload identity abuse, and metadata server (169.254.169.254) SSRF for the compute service account. Common findings: default compute service account with Editor role, public GCS buckets, Cloud SQL with public IP and no Cloud SQL Auth Proxy, unused service-account keys older than 90 days.",
      bullets: ["gcloud + gsutil + bq CLIs", "GCPBucketBrute, GCP IAM Recommender", "Service-account impersonation (actAs chains)", "Default Editor role on compute SA (huge blast radius)", "IAM Deny policies + Org Policy + VPC-SC perimeters"] },
    { id: "sl7", title: "Container Hacking",
      body: "Container + Kubernetes attack surface: vulnerable base images (Trivy, Grype), image pulled from untrusted registry, privileged containers with `--privileged` or hostPath mounts, exposed Docker/containerd sockets, exposed Kubelet (:10250) or Kubernetes API server without RBAC, kube-apiserver anonymous auth, ServiceAccount tokens auto-mounted with cluster-admin. Post-exploitation: kube-hunter, kubectl-who-can, botb (Break Out The Box), CDK (Container DoKing), Peirates. Runtime detection: Falco, Sysdig Secure, Tetragon.",
      bullets: ["Trivy, Grype, Anchore (image scan)", "kube-hunter, kubescape, botb, Peirates", "Privileged pod + hostPath = trivial node escape", "RBAC least-privilege + PodSecurity Standards", "Falco / Tetragon runtime detection"] },
    { id: "sl8", title: "Cloud Security",
      body: "Defence baseline (CIS Benchmarks + CSA CCM + NIST SP 800-53): (1) Identity — federate to corp IdP, ban static keys, enforce MFA/FIDO2, PIM/JIT for privileged roles; (2) Data — encrypt at rest with customer-managed KMS + BYOK, Block Public Access account-wide; (3) Network — private endpoints, VPC-SC/service perimeters, egress firewall; (4) Detection — CloudTrail/Defender/Cloud Audit Logs multi-region + immutable, CSPM (Wiz, Prisma, Defender for Cloud) continuous; (5) CI/CD — OIDC federation, signed artefacts (cosign), SLSA L3+; (6) IR — cloud-native runbook, immutable snapshots, out-of-band admin access.",
      bullets: ["CIS Benchmarks + CSA CCM + NIST 800-53", "CSPM: Wiz, Prisma Cloud, Defender for Cloud", "CIEM: Ermetic, SailPoint (identity blast-radius)", "CNAPP consolidates CSPM + CWPP + CIEM + IaC scan", "Immutable multi-region logging + cloud IR runbook"] },
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
    { id: "sl1", title: "Cryptography Concepts & Algorithms",
      body: "Cryptography provides confidentiality, integrity, authentication, and non-repudiation. Symmetric ciphers (AES-128/192/256, ChaCha20, 3DES-deprecated) share one key and are fast. Block-cipher modes matter more than key length: ECB leaks patterns; CBC needs a random IV + separate MAC; CTR needs unique nonces; AEAD modes (GCM, GCM-SIV, ChaCha20-Poly1305) provide confidentiality + integrity in one primitive. Asymmetric (RSA-2048+, ECDSA P-256/P-384, Ed25519, X25519) use key pairs for signing and key exchange. Hash functions (SHA-256, SHA-3, BLAKE2/3) must be collision-resistant; MD5 and SHA-1 are broken. HMAC provides keyed integrity. Key exchange: ECDHE for forward secrecy.",
      bullets: ["Symmetric: AES-GCM, ChaCha20-Poly1305 (AEAD)", "Asymmetric: RSA-2048+, ECDSA, Ed25519, X25519", "Hashes: SHA-256/3, BLAKE2/3; MD5 + SHA-1 broken", "MAC vs signature vs hash — different guarantees", "PFS via ephemeral key exchange (ECDHE)"] },
    { id: "sl2", title: "Applications of Cryptography",
      body: "Real-world crypto shows up in TLS 1.3 (transport), IPsec/WireGuard (VPN), SSH (remote admin), S/MIME + PGP/GPG (email), full-disk encryption (BitLocker, FileVault, LUKS), database TDE, file/object encryption with envelope + KMS, digital signatures for code (Authenticode, cosign, GPG), blockchain (secp256k1 for Bitcoin, Ed25519 for Solana), and password hashing (Argon2id, scrypt, bcrypt — never plain SHA-256). PKI operationalises trust: X.509 certs, CAs, OCSP stapling, Certificate Transparency logs, and ACME automation (Let's Encrypt).",
      bullets: ["TLS 1.3, IPsec, WireGuard, SSH, S/MIME, PGP", "Envelope encryption + KMS/HSM (per-service data keys)", "Password hashing: Argon2id / scrypt / bcrypt", "PKI: X.509, OCSP stapling, CT logs, ACME", "Code signing: Authenticode, cosign, Sigstore, SLSA"] },
    { id: "sl3", title: "Cryptanalysis & Crypto Attacks",
      body: "Cryptanalysis attacks target algorithms; implementation attacks target code and hardware. Classical: frequency analysis (classical ciphers), known-plaintext, chosen-plaintext/ciphertext, differential & linear cryptanalysis, birthday attacks on hashes. Protocol/implementation: padding oracle (POODLE, Lucky13), BEAST, CRIME/BREACH compression, DROWN (SSLv2 cross-protocol), Bleichenbacher (RSA PKCS#1v1.5), ROCA (Infineon RSA keygen). Side-channel: timing, power (SPA/DPA), EM, cache (Flush+Reload, Spectre/Meltdown). Nonce reuse (GCM, DSA/ECDSA — Sony PS3 key recovery). Downgrade attacks: FREAK, Logjam, POODLE. Quantum threat: Shor's breaks RSA/ECC; Grover halves symmetric security → AES-256 remains safe.",
      bullets: ["Classical: frequency, KPA, CPA/CCA, differential/linear", "Padding oracle: POODLE, Lucky13; Bleichenbacher on RSA", "Downgrade: FREAK, Logjam, POODLE, DROWN", "Side-channel: timing, power (SPA/DPA), Spectre-class", "Nonce reuse in GCM/ECDSA = catastrophic"] },
    { id: "sl4", title: "Crypto Attack Countermeasures",
      body: "Enforce an algorithm floor policy: TLS 1.2+ with AEAD suites only, ban RC4/3DES/MD5/SHA-1/RSA-1024, require ECDHE for PFS, HSTS with preload, OCSP stapling. Use vetted libraries (libsodium, BoringSSL, Bouncy Castle) — never roll your own crypto. Key management: per-service data keys with envelope encryption, root keys in HSM/KMS, automated rotation, alert on anomalous decrypt volume, quorum M-of-N for root-key admin. Code signing keys belong in HSM or ephemeral CI (Sigstore/Fulcio) with SLSA provenance. Start crypto-agility now: isolate algorithm choice behind a wrapper and pilot NIST PQC finalists (ML-KEM/Kyber, ML-DSA/Dilithium, SLH-DSA/SPHINCS+) on long-lifetime data — 'harvest now, decrypt later' is already active.",
      bullets: ["TLS 1.2+/AEAD + ECDHE + HSTS + OCSP stapling", "Ban RC4/3DES/MD5/SHA-1/RSA-1024 at policy", "libsodium / BoringSSL — never roll your own", "HSM-backed root keys + envelope + rotation + alerting", "PQ pilot: ML-KEM, ML-DSA, SLH-DSA (NIST FIPS 203/204/205)"] },
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
