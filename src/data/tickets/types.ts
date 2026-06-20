// CEH Operations Center — ticket type system.

export type Priority = "low" | "medium" | "high" | "critical";
export type Difficulty = "rookie" | "analyst" | "senior" | "lead";

export interface Frameworks {
  ceh: string[];
  nist_csf?: ("Identify" | "Protect" | "Detect" | "Respond" | "Recover" | "Govern")[];
  mitre_attack?: string[];   // e.g. ["TA0043 Reconnaissance", "T1589"]
  owasp?: string[];           // e.g. ["A01:2021"]
  iso_27001?: string[];       // e.g. ["A.5 Asset Mgmt"]
  cis?: string[];             // e.g. ["Control 1"]
  pci_dss?: string[];
  nist_800_53?: string[];
  kill_chain?: ("Recon" | "Weaponization" | "Delivery" | "Exploitation" | "Installation" | "C2" | "Actions")[];
}

export type EvidenceKind =
  | "screenshot" | "command" | "log" | "note" | "whois" | "dns"
  | "mapping" | "risk_matrix" | "link" | "file" | "report";

export interface EvidenceRequirement {
  kind: EvidenceKind;
  label: string;
  hint?: string;
  /** required count for full score on this step */
  count?: number;
}

export interface DecisionOption {
  id: string;
  label: string;
  /** route to a follow-up step id, OR mark as a finding */
  next?: string;
  finding?: { severity: "low" | "medium" | "high" | "critical"; label: string };
  correct?: boolean;
}

export interface DecisionTree {
  prompt: string;
  options: DecisionOption[];
}

export interface InvestigationStep {
  id: string;
  phase:
    | "understand" | "collect" | "analyze" | "map"
    | "impact" | "recommend" | "deliver" | "close";
  title: string;
  objective: string;
  instructions: string[];   // bullets
  expected: string;
  evidence: EvidenceRequirement[];
  commonMistakes?: string[];
  analystNotes?: string;
  decision?: DecisionTree;
}

export type DeliverableKind =
  | "exec_summary" | "technical" | "risk" | "incident"
  | "mitigation" | "recon" | "threat_intel" | "mitre" | "detection_rule";

export interface DeliverableSpec {
  kind: DeliverableKind;
  title: string;
  prompt: string;     // what the student must write
  minChars?: number;
}

export interface RubricCriterion {
  id: "evidence" | "analysis" | "frameworks" | "recommendations";
  label: string;
  weight: number;   // 0-100
}

export interface Ticket {
  id: string;                 // e.g. "GH-1001"
  hourSlug: string;           // links to Day1 hour
  title: string;
  category: string;           // "Asset Identification", "Phishing Investigation", ...
  priority: Priority;
  difficulty: Difficulty;
  estMinutes: number;
  xp: number;                 // base XP if instructor doesn't override
  badge?: string;             // badge code awarded on pass
  client: string;             // "GlassHouse Bank"
  ticketTag: string;          // "OPERATION GLASSHOUSE"
  analystBrief: string;       // narrative
  contextFacts: { label: string; value: string }[];
  frameworks: Frameworks;
  steps: InvestigationStep[];
  deliverables: DeliverableSpec[];
  rubric: RubricCriterion[];
  passingScore: number;       // 0-100
}

export const DEFAULT_RUBRIC: RubricCriterion[] = [
  { id: "evidence", label: "Evidence Collection", weight: 30 },
  { id: "analysis", label: "Analysis Quality", weight: 30 },
  { id: "frameworks", label: "Framework Mapping", weight: 20 },
  { id: "recommendations", label: "Recommendations", weight: 20 },
];

export const XP_BY_PRIORITY: Record<Priority, number> = {
  low: 10, medium: 25, high: 50, critical: 100,
};
