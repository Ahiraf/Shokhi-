export type Urgency = "emergency" | "see_doctor_soon" | "self_care" | "info";

export interface RedFlag {
  id: string;
  name_bn: string;
  name_en?: string;
  urgency?: Urgency;
  message_bn?: string;
  action_bn: string;
}

export interface Condition {
  id: string;
  name_bn: string;
  name_en?: string;
  urgency?: Urgency;
  about_bn: string;
  about_en?: string;
  self_care_bn: string[];
  self_care_en?: string[];
  see_doctor_bn: string;
  see_doctor_en?: string;
}

export interface Myth {
  myth_bn: string;
  fact_bn: string;
  myth_en?: string;
  fact_en?: string;
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
  summary_en?: string;
}

export interface GuideResponse {
  guide: { id: string; icon: string; title_bn: string; title_en: string };
  guidance: string;
}

export interface GuideFull {
  id: string;
  icon: string;
  title_bn: string;
  title_en: string;
  summary_bn: string;
  summary_en?: string;
  points_bn: string[];
  points_en?: string[];
  when_see_doctor_bn: string;
  when_see_doctor_en?: string;
}

export interface KnowledgeResponse {
  symptom_schema: Record<string, unknown>;
  meta: Record<string, unknown>;
  conditions: Condition[];
  red_flags: RedFlag[];
  myths: Myth[];
}

export interface CycleLog {
  start: string; // ISO date (YYYY-MM-DD)
  end?: string;
  flow?: "light" | "normal" | "heavy";
  pain?: 0 | 1 | 2 | 3;
  pads?: number; // pads soaked per day (peak); 6+ signals heavy bleeding
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

export interface WellnessPhase {
  id: string;
  label_bn: string; label_en: string;
  days_bn: string; days_en: string;
  move_bn: string; move_en: string;
  food_bn: string; food_en: string;
  focus_bn: string; focus_en: string;
}
export interface WellnessCondition {
  id: string;
  label_bn: string; label_en: string;
  move_bn: string; move_en: string;
  food_bn: string; food_en: string;
  note_bn: string; note_en: string;
}
export interface WellnessMove {
  id: string; icon: string;
  name_bn: string; name_en: string;
  how_bn: string; how_en: string;
}
export interface Wellness {
  intro_bn: string; intro_en: string;
  phases: WellnessPhase[];
  conditions: WellnessCondition[];
  moves: WellnessMove[];
  disclaimer_bn: string; disclaimer_en: string;
}
