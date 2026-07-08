export type FavoriteKind = 'module' | 'donor' | 'opportunity';

export interface User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  group_id?: string | null;
}

export interface Opportunity {
  opp_id: string;
  title: string;
  sector: string;
  location: string;
  description: string;
  image_url: string;
  featured?: boolean;
}

export interface Section {
  title: string;
  content: string;
}

export interface TrainingModule {
  module_id: string;
  title: string;
  summary: string;
  icon: string;
  duration: string;
  sections?: Section[];
}

export interface Donor {
  donor_id: string;
  name: string;
  type: string;
  country: string;
  sectors: string[];
  description: string;
  phone: string;
  website: string;
  city: string;
  avg_rating: number;
  rating_count: number;
}

export interface Review {
  user_name: string;
  stars: number;
  outcome: 'no_response' | 'responded' | 'funded' | 'rejected' | string;
  comment: string;
  created_at: string;
}

export interface Group {
  group_id: string;
  name: string;
  description: string;
  location: string;
  members: string[];
  created_by: string;
}

export interface GroupMessage {
  message_id: string;
  group_id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export interface FundingRequest {
  request_id: string;
  user_id: string;
  group_id?: string | null;
  project_name: string;
  sector: string;
  problem: string;
  solution: string;
  target_amount: string;
  beneficiaries: string;
  pitch: string;
  ai_generated: boolean;
  status: string;
  created_at: string;
}

export interface LocalReminder {
  reminder_id: string;
  kind: 'training' | 'funding' | 'opportunities';
  title: string;
  message: string;
  due_at: number;
  created_at: number;
  done_at: number | null;
  notified_at: number | null;
}

export interface FavoriteItem {
  id: string;
  kind: FavoriteKind;
  title: string;
  subtitle?: string;
  description?: string;
  href?: string;
  saved_at: number;
}

export interface TesterFeedback {
  feedback_id: string;
  name: string;
  email: string;
  rating: number;
  comment: string;
  role: string;
  created_at: string;
}
