
export type UserRole = 'citizen' | 'admin' | 'responder';

export type ResponderStatus = 'idle' | 'busy';

export type CitizenStatus = 'safe' | 'need_food' | 'need_water' | 'in_danger';

export interface Profile {
  id: string; // uuid
  full_name: string;
  role: UserRole;
  is_verified: boolean;
  status?: ResponderStatus; // Only for responders
  citizen_status?: CitizenStatus; // Only for citizens
  email: string;
}

export type ReportSeverity = 'low' | 'medium' | 'high';
export type ReportCategory = 'flood' | 'medical' | 'fire' | 'rescue';
export type ReportStatus = 'pending' | 'verified' | 'assigned' | 'resolved';

export interface Report {
  id: string; // uuid
  user_id: string; // references profiles.id
  category: ReportCategory;
  description: string;
  location: string; // "lat, long" string
  severity: ReportSeverity;
  status: ReportStatus;
  created_at: string; // timestamp ISO string
  ai_analysis?: string; 
}

export type AssignmentStatus = 'dispatched' | 'accepted' | 'on_site' | 'completed';

export interface Assignment {
  id: string; // uuid
  report_id: string; // references reports.id
  responder_id: string; // references profiles.id
  status: AssignmentStatus;
}

export interface EvacuationCenter {
    id: string;
    name: string;
    location: string;
    type: 'school' | 'hospital' | 'gym';
}

export interface NewsItem {
    id: string;
    title: string;
    summary: string;
    source: string;
    timestamp: string;
    type: 'alert' | 'info';
}
