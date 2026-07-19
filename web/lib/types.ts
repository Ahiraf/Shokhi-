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

export interface GuideCard {
  id: string;
  icon: string;
  title_bn: string;
  title_en: string;
  summary_bn: string;
}

export interface GuideResponse {
  guide: { id: string; icon: string; title_bn: string; title_en: string };
  guidance: string;
}

export interface CycleLog {
  start: string; // ISO date (YYYY-MM-DD)
  end?: string;
  flow?: "light" | "normal" | "heavy";
  pain?: 0 | 1 | 2 | 3;
  note?: string;
}

export interface CycleAnalysis {
  logged_count: number;
  cycle_lengths: number[];
  avg_cycle_length: number | null;
  shortest_cycle: number | null;
  longest_cycle: number | null;
  avg_period_length: number | null;
  regular: boolean | null;
  predicted_next_start: string | null;
  days_until_next: number | null;
  insights_bn: string[];
  suggested_symptoms: Record<string, boolean>;
  disclaimer_bn: string;
}
