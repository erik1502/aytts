
import { Profile, Report, Assignment, ReportCategory, UserRole, EvacuationCenter, CitizenStatus, NewsItem } from '../types';

// Initial Mock Data
const MOCK_USERS: Profile[] = [
  { id: 'u1', full_name: 'Admin User', role: 'admin', is_verified: true, email: 'admin@resq.com' },
  { id: 'u2', full_name: 'Joker', role: 'citizen', is_verified: true, citizen_status: 'safe', email: 'citizen@resq.com' },
  { id: 'u3', full_name: 'Shai Na', role: 'responder', is_verified: true, status: 'idle', email: 'responder@resq.com' },
  { id: 'u4', full_name: 'Jorlyn Row', role: 'responder', is_verified: true, status: 'busy', email: 'mike@resq.com' },
  {id: 'u4', full_name: 'Pat Rik', role: 'responder', is_verified: true, status: 'idle', email: 'miks@resq.com'}
];

const MOCK_REPORTS: Report[] = [
  {
    id: 'r1',
    user_id: 'u2',
    category: 'fire',
    description: 'Small brush fire starting near the playground.',
    location: '34.0522,-118.2437',
    severity: 'medium',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'r2',
    user_id: 'u2',
    category: 'medical',
    description: 'Car accident, one person looks injured and trapped.',
    location: '34.0525,-118.2440',
    severity: 'high',
    status: 'pending',
    created_at: new Date(Date.now() - 1800000).toISOString(),
  }
];

const MOCK_ASSIGNMENTS: Assignment[] = [];

const MOCK_EVAC_CENTERS: EvacuationCenter[] = [
    { id: 'e1', name: 'Central City Gym', location: '34.0550,-118.2450', type: 'gym' },
    { id: 'e2', name: 'Memorial Hospital', location: '34.0500,-118.2400', type: 'hospital' },
    { id: 'e3', name: 'Westside High School', location: '34.0510,-118.2490', type: 'school' },
];

const MOCK_NEWS: NewsItem[] = [
    { id: 'n1', title: 'Typhoon Signal No. 3 Raised', summary: 'Heavy rains and winds expected in the next 24 hours. Prepare evacuation kits.', source: 'NDRRMC', timestamp: new Date().toISOString(), type: 'alert' },
    { id: 'n2', title: 'Relief Goods Distribution', summary: 'Distribution starts at 8:00 AM at the City Hall for Zone 1 residents.', source: 'LGU', timestamp: new Date(Date.now() - 86400000).toISOString(), type: 'info' },
    { id: 'n3', title: 'Flood Warning: Low Areas', summary: 'Water levels rising in Marikina River. Alert level 2.', source: 'PAGASA', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'alert' },
];

// Local Storage Keys
const LS_KEYS = {
  USERS: 'resq_users',
  REPORTS: 'resq_reports',
  ASSIGNMENTS: 'resq_assignments',
  SESSION: 'resq_session'
};

const loadData = <T,>(key: string, defaultData: T[]): T[] => {
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(key, JSON.stringify(defaultData));
  return defaultData;
};

class MockSupabaseService {
  private users: Profile[];
  private reports: Report[];
  private assignments: Assignment[];

  constructor() {
    this.users = loadData(LS_KEYS.USERS, MOCK_USERS);
    this.reports = loadData(LS_KEYS.REPORTS, MOCK_REPORTS);
    this.assignments = loadData(LS_KEYS.ASSIGNMENTS, MOCK_ASSIGNMENTS);
  }

  private saveData(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- Auth ---
  async signIn(email: string): Promise<{ user: Profile | null; error: string | null }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = this.users.find(u => u.email === email);
    if (user) {
      localStorage.setItem(LS_KEYS.SESSION, JSON.stringify(user));
      return { user, error: null };
    }
    return { user: null, error: 'User not found.' };
  }

  async signOut() {
    localStorage.removeItem(LS_KEYS.SESSION);
  }

  async signUp(email: string, full_name: string, role: UserRole = 'citizen'): Promise<{ user: Profile; error: null }> {
    const newUser: Profile = {
      id: crypto.randomUUID(),
      email,
      full_name,
      role,
      is_verified: false,
      citizen_status: role === 'citizen' ? 'safe' : undefined,
      status: role === 'responder' ? 'idle' : undefined
    };
    this.users.push(newUser);
    this.saveData(LS_KEYS.USERS, this.users);
    localStorage.setItem(LS_KEYS.SESSION, JSON.stringify(newUser));
    return { user: newUser, error: null };
  }

  getSession(): Profile | null {
    const stored = localStorage.getItem(LS_KEYS.SESSION);
    return stored ? JSON.parse(stored) : null;
  }

  // --- Reports ---
  async createReport(report: Omit<Report, 'id' | 'created_at' | 'status'>): Promise<Report> {
    const newReport: Report = {
      ...report,
      id: crypto.randomUUID(),
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    this.reports.unshift(newReport);
    this.saveData(LS_KEYS.REPORTS, this.reports);
    return newReport;
  }

  async getReports(userId?: string, role?: string): Promise<Report[]> {
    if (role === 'admin') return [...this.reports];
    if (userId) return this.reports.filter(r => r.user_id === userId);
    return [];
  }

  async updateReportStatus(reportId: string, status: Report['status']): Promise<void> {
    this.reports = this.reports.map(r => r.id === reportId ? { ...r, status } : r);
    this.saveData(LS_KEYS.REPORTS, this.reports);
  }

  // --- Assignments ---
  async assignResponder(reportId: string, responderId: string): Promise<Assignment> {
    const newAssignment: Assignment = {
      id: crypto.randomUUID(),
      report_id: reportId,
      responder_id: responderId,
      status: 'dispatched'
    };
    this.assignments.push(newAssignment);
    this.saveData(LS_KEYS.ASSIGNMENTS, this.assignments);
    
    await this.updateReportStatus(reportId, 'assigned');
    return newAssignment;
  }

  async getAssignments(responderId: string): Promise<{ assignment: Assignment, report: Report }[]> {
    const myAssignments = this.assignments.filter(a => a.responder_id === responderId);
    return myAssignments.map(a => {
      const report = this.reports.find(r => r.id === a.report_id);
      if (!report) throw new Error('Report mismatch');
      return { assignment: a, report };
    }).filter(x => x.report !== undefined);
  }

  // New helper for Citizen View to see their specific responder status
  async getAssignmentByReportId(reportId: string): Promise<Assignment | undefined> {
      return this.assignments.find(a => a.report_id === reportId);
  }

  async updateAssignmentStatus(assignmentId: string, status: Assignment['status']): Promise<void> {
    this.assignments = this.assignments.map(a => a.id === assignmentId ? { ...a, status } : a);
    this.saveData(LS_KEYS.ASSIGNMENTS, this.assignments);
    
    if (status === 'completed') {
        const assignment = this.assignments.find(a => a.id === assignmentId);
        if (assignment) {
            await this.updateReportStatus(assignment.report_id, 'resolved');
        }
    }
  }

  async declineAssignment(assignmentId: string): Promise<void> {
      const assignment = this.assignments.find(a => a.id === assignmentId);
      if (assignment) {
          await this.updateReportStatus(assignment.report_id, 'pending');
          this.assignments = this.assignments.filter(a => a.id !== assignmentId);
          this.saveData(LS_KEYS.ASSIGNMENTS, this.assignments);
      }
  }

  // --- Responders & Citizens ---
  async getResponders(): Promise<Profile[]> {
    return this.users.filter(u => u.role === 'responder');
  }

  async updateResponderStatus(userId: string, status: 'idle' | 'busy'): Promise<void> {
    this.users = this.users.map(u => u.id === userId ? { ...u, status } : u);
    this.saveData(LS_KEYS.USERS, this.users);
  }

  async updateCitizenStatus(userId: string, status: CitizenStatus): Promise<void> {
      this.users = this.users.map(u => u.id === userId ? { ...u, citizen_status: status } : u);
      this.saveData(LS_KEYS.USERS, this.users);
      
      const session = this.getSession();
      if(session && session.id === userId) {
          localStorage.setItem(LS_KEYS.SESSION, JSON.stringify({ ...session, citizen_status: status }));
      }
  }

  // --- Evacuation & News ---
  async getEvacuationCenters(): Promise<EvacuationCenter[]> {
      return MOCK_EVAC_CENTERS;
  }

  async getNews(): Promise<NewsItem[]> {
      return MOCK_NEWS;
  }
}

export const db = new MockSupabaseService();
