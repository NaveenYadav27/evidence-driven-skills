// Simulated-execution registry for OS-level commands surfaced in the GFS SOC
// module template (Windows / Kali). Real system binaries can't run in the
// browser sandbox, so we produce realistic, deterministic output derived
// from the `purpose` + `expected` metadata authored per command.

import { GFS_TEMPLATE_MODULES } from "@/data/modules/gfs-template-data";

export interface SimulatedCommand {
  cmd: string;              // exact command string as authored
  tool: string;             // first meaningful token (adb, airodump-ng, netsh, ...)
  purpose: string;
  expected: string;
  mitre?: string;
  os: "windows" | "kali";
  moduleSlug: string;
}

function firstToken(cmd: string): string {
  // Strip a leading "$" prompt if any, then take the first token; special-case
  // PowerShell verbs and pipelines by using the first word before whitespace.
  const clean = cmd.trim().replace(/^\$\s*/, "");
  return clean.split(/[\s|(]/)[0].toLowerCase();
}

const REGISTRY: SimulatedCommand[] = [];
const BY_EXACT = new Map<string, SimulatedCommand>();
const BY_TOOL = new Map<string, SimulatedCommand[]>();

for (const [slug, mod] of Object.entries(GFS_TEMPLATE_MODULES)) {
  for (const c of mod.commandsWindows) {
    const entry: SimulatedCommand = { ...c, tool: firstToken(c.cmd), os: "windows", moduleSlug: slug };
    REGISTRY.push(entry);
    BY_EXACT.set(c.cmd.trim(), entry);
    const arr = BY_TOOL.get(entry.tool) ?? [];
    arr.push(entry); BY_TOOL.set(entry.tool, arr);
  }
  for (const c of mod.commandsKali) {
    const entry: SimulatedCommand = { ...c, tool: firstToken(c.cmd), os: "kali", moduleSlug: slug };
    REGISTRY.push(entry);
    BY_EXACT.set(c.cmd.trim(), entry);
    const arr = BY_TOOL.get(entry.tool) ?? [];
    arr.push(entry); BY_TOOL.set(entry.tool, arr);
  }
}

export const SIMULATED_TOOLS: ReadonlySet<string> = new Set(BY_TOOL.keys());

/** Look up a registered command — exact string match preferred, tool-name fallback. */
export function findSimulated(raw: string): SimulatedCommand | null {
  const trimmed = raw.trim();
  const exact = BY_EXACT.get(trimmed);
  if (exact) return exact;
  const tool = firstToken(trimmed);
  const list = BY_TOOL.get(tool);
  return list?.[0] ?? null;
}

/** Deterministic pseudo-terminal output for a simulated tool. */
export function simulateOutput(raw: string): { output: string; matched: SimulatedCommand | null } {
  const matched = findSimulated(raw);
  if (!matched) return { output: "", matched: null };

  const banner =
`[sim] Executing in sandboxed range · tool=${matched.tool} · os=${matched.os}
[sim] Purpose : ${matched.purpose}${matched.mitre ? `\n[sim] MITRE   : ${matched.mitre}` : ""}
[sim] ─────────────────────────────────────────────────────────────`;

  const body = renderBody(matched);
  const footer = `[sim] ✓ completed — output matches expected shape:\n         ${matched.expected}`;
  return { output: `${banner}\n${body}\n${footer}`, matched };
}

function renderBody(c: SimulatedCommand): string {
  const t = c.tool;
  // Curated per-tool canned output. Falls back to a generic block that
  // echoes the expected description so lab reviewers can still grade.
  switch (t) {
    case "adb":
      if (c.cmd.includes("devices")) return "List of devices attached\nR58M12AB34XY    device";
      if (c.cmd.includes("pull")) return "/data/app/com.gfs.bank/base.apk: 1 file pulled, 0 skipped. 45.2 MB/s (18732144 bytes in 0.394s)";
      if (c.cmd.includes("pm list packages")) return "package:/data/app/com.gfs.bank-1/base.apk=com.gfs.bank";
      if (c.cmd.includes("logcat")) return "10-14 09:22:11.884  4213  4213 I gfs.bank : session established (jwt suppressed in release build)";
      if (c.cmd.includes("backup")) return "Now unlock your device and confirm the backup operation.\nBackup unsuccessful: backup rules disabled by target application.";
      break;
    case "airmon-ng":
      return " PHY   Interface   Driver     Chipset\n phy0  wlan0       iwlwifi    Intel AX210\n\n (mac80211 monitor mode vif enabled on [phy0]wlan0mon)";
    case "airodump-ng":
      return `CH  6 ][ Elapsed: 42 s ][ 2026-07-19 09:22
 BSSID              PWR  Beacons #Data  CH  MB   ENC  CIPHER  AUTH ESSID
 AA:BB:CC:11:22:33  -42     412    88   6  270  WPA2 CCMP    PSK  GFS-Corp
 AA:BB:CC:11:22:34  -49     388    12   6  270  WPA3 CCMP    SAE  GFS-Corp
 DE:AD:BE:EF:00:01  -71      92     0  11  130  WPA2 CCMP    PSK  GFS-Guest`;
    case "hcxdumptool":
      return "start capturing (stop with ctrl+c)\nINFO: cha=6, rx=412, tx=88\nEAPOL: M1 captured\nPMKID FOUND: AA:BB:CC:11:22:33  GFS-Corp";
    case "hcxpcapngtool":
      return "reading from gfs.pcapng\nsummary:\n--------\nfile name...............: gfs.pcapng\nESSIDS (unique)..........: 3\nEAPOL M1 messages........: 4\nPMKIDs (total)...........: 1\nhashes written to hash.22000";
    case "kismet":
      return "INFO: Kismet starting\nINFO: Data sources: wlan0mon\nINFO: Web UI listening on http://localhost:2501";
    case "wifite":
    case "wifite2":
      return " NUM ESSID          CH  ENCR    POWER  CLIENTS\n  1  GFS-Corp        6   WPA2      42db     3\n  2  GFS-Guest       11  WPA2      27db     0\n [+] select target(s): 1";
    case "eaphammer":
      return "[*] Starting evil-twin AP GFS-Corp on wlan0\n[*] hostapd-wpe running · RADIUS listening\n[+] captured EAP-MSCHAPv2 challenge from 00:1a:2b:3c:4d:5e";
    case "netsh":
      if (c.cmd.includes("interfaces")) return "There is 1 interface on the system:\n    Name                   : Wi-Fi\n    State                  : connected\n    SSID                   : GFS-Corp\n    BSSID                  : aa:bb:cc:11:22:33\n    Radio type             : 802.11ax\n    Signal                 : 92%";
      if (c.cmd.includes("profiles") && !c.cmd.includes("name=")) return "Profiles on interface Wi-Fi:\n  All User Profile     : GFS-Corp\n  All User Profile     : GFS-Guest";
      if (c.cmd.includes("key=clear")) return "Security settings\n    Authentication         : WPA2-Personal\n    Cipher                 : CCMP\n    Security key           : Present\n    Key Content            : ●●●●●●●●";
      if (c.cmd.includes("mode=bssid")) return "SSID 1 : GFS-Corp\n    Network type            : Infrastructure\n    Authentication          : WPA2-Enterprise\n    BSSID 1                 : aa:bb:cc:11:22:33  Signal: 92%  Channel: 6";
      if (c.cmd.includes("wlanreport")) return "Report written to: C:\\ProgramData\\Microsoft\\Windows\\WlanReport\\wlan-report-latest.html";
      break;
    case "get-netadapter":
      return "Name    InterfaceDescription        ifIndex Status  MacAddress          LinkSpeed\n----    --------------------        ------- ------  ----------          ---------\nWi-Fi   Intel(R) Wi-Fi 6 AX201       14      Up      00-11-22-33-44-55   866 Mbps";
    case "apktool":
      return "I: Using Apktool 2.9.3\nI: Loading resource table...\nI: Decoding AndroidManifest.xml with resources...\nI: Copying assets and libs...\nI: Baksmaling classes.dex...";
    case "jadx":
    case "jadx-gui":
      return "INFO - loading ...\nINFO - processing ...\nINFO - done";
    case "keytool":
      return "Signer #1:\nSignature:\n    Owner: CN=GFS Mobile Release, O=GFS, C=SG\n    Issuer: CN=GFS Root CA, O=GFS, C=SG\n    SHA-256: 2A:14:B5:...:E0:9F";
    case "frida-ps":
      return " PID  Name                Identifier\n----  ------------------  ---------------------\n 1420 GFS Bank            com.gfs.bank\n 1621 Settings            com.android.settings";
    case "frida":
      return "     ____\n    / _  |   Frida 16.4\n   | (_| |\n    > _  |\n   /_/ |_|\n[Android::com.gfs.bank]-> ";
    case "objection":
      return "[tab] to autocomplete · [help] for commands\n(agent) [android:root] com.gfs.bank on (Android: 14) [usb]\n(*) SSL pinning bypass loaded — 3 pinning libraries hooked";
    case "mitmproxy":
      return "Proxy server listening at http://*:8080\n<< 200 OK  api.gfs.bank/accounts     application/json 4.2kb";
    case "grep":
      return "gfs-decoded/AndroidManifest.xml:87:        android:exported=\"true\"\ngfs-decoded/AndroidManifest.xml:104:    android:allowBackup=\"true\"";
    case "class-dump":
      return "@interface GFSAuthController : NSObject\n- (void)beginBiometricLogin;\n- (void)signTransfer:(GFSTransfer *)t;\n@end";
    case "docker":
      return "Unable to find image 'opensecurity/mobile-security-framework-mobsf:latest' locally\nDigest: sha256:9a2c...\nStatus: Downloaded newer image\n[*] MobSF starting at http://localhost:8000";
    default:
      return `[sim] ${c.expected}`;
  }
  return `[sim] ${c.expected}`;
}
