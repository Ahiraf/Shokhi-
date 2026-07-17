export type Urgency = "emergency" | "see_doctor_soon" | "self_care" | "info";

export interface RedFlag {
  id: string;
  name_bn: string;
  action_bn: string;
}

export interface Condition {
  id: string;
  name_bn: string;
  about_bn: string;
  self_care_bn: string[];
  see_doctor_bn: string;
}

export interface RiskSignal {
  id: string;
  name_bn: string;
  name_en: string;
  probability: number;
  elevated: boolean;
  auc: number | null;
}

export interface TriageResult {
  urgency: Urgency;
  urgency_label_bn: string;
  red_flags: RedFlag[];
  suspected_conditions: Condition[];
  risk_signals?: RiskSignal[];
  emergency_number_bd: string;
  health_hotline_bd: string;
  disclaimer_bn: string;
}

export interface MessageResponse {
  profile: Record<string, unknown>;
  triage: TriageResult;
  guidance: string;
  next_question: string | null;
  is_emergency: boolean;
  backend: string;
}

export interface ChatItem {
  role: "user" | "assistant";
  text: string;
  data?: MessageResponse;
}
