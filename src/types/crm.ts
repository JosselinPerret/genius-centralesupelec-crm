// Database types matching Supabase schema
export type UserRole = 'ADMIN' | 'MANAGER' | 'VOLUNTEER';

export type CompanyStatus = 'PROSPECT' | 'REFUSE' | 'EN_COURS' | 'RELANCE';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  contact_name?: string;
  contact_email?: string;
  phone?: string;
  status: CompanyStatus;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  company_id: string;
  author_id: string;
  profiles: Profile;
}

export interface Assignment {
  id: string;
  role: string;
  created_at: string;
  company_id: string;
  user_id: string;
  profiles: Profile;
}