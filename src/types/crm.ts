export type UserRole = 'ADMIN' | 'MANAGER' | 'VOLUNTEER';

export type CompanyStatus = 'PROSPECT' | 'ACTIVE' | 'INACTIVE' | 'FORMER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  contactName?: string;
  contactEmail?: string;
  phone?: string;
  status: CompanyStatus;
  boothNumber?: string;
  boothLocation?: string;
  boothSize?: string;
  tags: Tag[];
  notes: Note[];
  assignments: Assignment[];
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  companyId: string;
  authorId: string;
  author: User;
}

export interface Assignment {
  id: string;
  role: string;
  createdAt: string;
  companyId: string;
  userId: string;
  user: User;
}