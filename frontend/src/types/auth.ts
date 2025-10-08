export interface Profile {
  id: number;
  user_id: number;
  full_name: string | null;
  phone: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserRole {
  id: number;
  user_id: number;
  role: string;
  created_at?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  profile?: Profile | null;
  userRoles?: UserRole[];
  is_admin: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthSession {
  access_token: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}
