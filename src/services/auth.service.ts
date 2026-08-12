import { LoginCredentials, LoginResponse, User } from '../types';
import apiClient from './api';

// Mock credentials for development
const MOCK_USERS: (User & { password: string })[] = [
  { id: 1, name: 'Arjun Sharma',  email: 'admin@nexerp.com',     role: 'admin',     password: 'admin123' },
  { id: 2, name: 'Priya Nair',    email: 'sales@nexerp.com',     role: 'sales',     password: 'sales123' },
  { id: 3, name: 'Ravi Verma',    email: 'warehouse@nexerp.com', role: 'warehouse', password: 'wh123' },
  { id: 4, name: 'Kavita Joshi',  email: 'accounts@nexerp.com',  role: 'accounts',  password: 'acc123' },
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  // Replace with: const response = await apiClient.post('/auth/login', credentials); return response.data;
  await delay(800);
  const user = MOCK_USERS.find(
    (u) => u.email === credentials.email && u.password === credentials.password
  );
  if (!user) throw new Error('Invalid email or password. Please try again.');

  const { password: _, ...userWithoutPassword } = user;
  const token = `mock_jwt_token_${user.role}_${Date.now()}`;
  return { token, user: userWithoutPassword };
}

export async function getCurrentUser(): Promise<User> {
  // Replace with: const response = await apiClient.get('/auth/me'); return response.data;
  const stored = localStorage.getItem('nexerp_user');
  if (!stored) throw new Error('Not authenticated');
  return JSON.parse(stored) as User;
}
