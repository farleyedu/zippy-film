export type User = {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'USER';
};

export type Profile = {
  id: string;
  name: string;
  avatar: string;
  isKids: boolean;
  language: string;
  maturityLevel: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
};
