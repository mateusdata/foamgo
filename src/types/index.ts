
export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  color?: string;
  isDefault: boolean;
}

export interface Company {
  id: string;
  name: string;
  phone?: string;
  avatar?: string;
  description?: string;
  googleMapLink?: string;
  pixKey?: string;
  email?: string;
  addresses?: Address;
}

export interface Team {
  id: string;
  name: string;
  companyId: string;
  company?: Company;
}

export interface Membership {
  id: string;
  userId: string;
  teamId: string;
  role: 'MANAGER' | 'MEMBER' | 'TRAINER';
  team?: Team;
}

export interface User {

  id: string;
  name: string;
  email: string;
  token: string;
  avatar?: string;
  phone?: string;
  cpf?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  isActive?: boolean;
  role?: 'USER' | 'ADMIN' | 'PARTNER' | 'WORKER';
  vehicles?: Vehicle[];
  address?: Address | null;
  company?: Company;
  activeCompanyId?: string;
  hasPlan?: boolean;
  memberships?: Membership[];
}


export interface AuthContextProps {
  user: User | null;
  activeRole: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setActiveRole: (role: string | null) => void;
  logOut: () => Promise<void>;
  login: (email: string, password: string, roleFlag?: string) => Promise<User | null>;
  refreshUser: () => Promise<User | null>;
  
  signInWithGoogle: (role?: string | string[]) => Promise<void>;
  signInWithApple: (role?: string | string[]) => Promise<void>;
}