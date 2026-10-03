import { User } from '../types';

const AUTH_STORAGE_KEY = 'smart_iot_auth_user';
const USERS_STORAGE_KEY = 'smart_iot_registered_users';

interface StoredAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // simulated hash for client safety
  role: 'OPERATIONS_ENGINEER' | 'PLANT_MANAGER' | 'MAINTENANCE_LEAD';
}

// Simple deterministic hash simulation for local safety
function hashPassword(pass: string): string {
  let hash = 0;
  for (let i = 0; i < pass.length; i++) {
    hash = (hash << 5) - hash + pass.charCodeAt(i);
    hash |= 0;
  }
  return `sha256_${Math.abs(hash).toString(16)}`;
}

// Pre-seeded verified industrial operators
const DEFAULT_USERS: StoredAccount[] = [
  {
    id: 'usr_eng_01',
    name: 'Marcus Vance',
    email: 'engineer@smartiot.industrial',
    passwordHash: hashPassword('IndustrialPass2026!'),
    role: 'OPERATIONS_ENGINEER',
  },
  {
    id: 'usr_mgr_02',
    name: 'Elena Rostova',
    email: 'plant.lead@smartiot.industrial',
    passwordHash: hashPassword('IndustrialPass2026!'),
    role: 'PLANT_MANAGER',
  }
];

export function getRegisteredUsers(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    // Ensure default demo users are always present
    if (!parsed.some((u: StoredAccount) => u.email === 'engineer@smartiot.industrial')) {
      parsed.push(DEFAULT_USERS[0]);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return DEFAULT_USERS;
  }
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): { isValid: boolean; message: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one numeric digit (0-9).' };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain alphabetical letters.' };
  }
  return { isValid: true, message: '' };
}

export function registerUser(payload: RegisterPayload): { success: boolean; error?: string; user?: User } {
  const name = payload.name.trim();
  const email = payload.email.trim().toLowerCase();

  if (!name || name.length < 2) {
    return { success: false, error: 'Full operator name is required (minimum 2 characters).' };
  }
  if (!validateEmail(email)) {
    return { success: false, error: 'Please enter a valid work or corporate email address.' };
  }

  const passCheck = validatePassword(payload.password);
  if (!passCheck.isValid) {
    return { success: false, error: passCheck.message };
  }

  if (payload.password !== payload.confirmPassword) {
    return { success: false, error: 'Password confirmation does not match the entered password.' };
  }

  const users = getRegisteredUsers();
  if (users.some(u => u.email === email)) {
    return { success: false, error: 'An account with this email address already exists. Please sign in.' };
  }

  const newUser: StoredAccount = {
    id: `usr_${Date.now().toString(36)}`,
    name,
    email,
    passwordHash: hashPassword(payload.password),
    role: 'OPERATIONS_ENGINEER',
  };

  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  const authUser: User = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  };
  setCurrentUser(authUser);

  return { success: true, user: authUser };
}

export function loginUser(emailInput: string, passwordInput: string): { success: boolean; error?: string; user?: User } {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput.trim();

  if (!email || !password) {
    return { success: false, error: 'Please enter both your work email and password.' };
  }
  if (!validateEmail(email)) {
    return { success: false, error: 'Please provide a valid email format.' };
  }

  const users = getRegisteredUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    return { success: false, error: 'Authentication Failed: No registered operator found with this email. Please check your credentials or register.' };
  }

  // Support both IndustrialPass2026 and IndustrialPass2026!
  const isMatch =
    user.passwordHash === hashPassword(password) ||
    (password === 'IndustrialPass2026!' && user.passwordHash === hashPassword('IndustrialPass2026')) ||
    (password === 'IndustrialPass2026' && user.passwordHash === hashPassword('IndustrialPass2026!'));

  if (!isMatch) {
    return { success: false, error: 'Authentication Failed: Incorrect password. Please check your credentials.' };
  }

  const authUser: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  setCurrentUser(authUser);

  return { success: true, user: authUser };
}

export function logoutUser(): void {
  setCurrentUser(null);
}
