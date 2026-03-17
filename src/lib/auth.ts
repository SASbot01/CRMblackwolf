"use client";

export interface User {
  id: string;
  email: string;
  nombre: string;
  avatar?: string;
  role: "admin" | "user";
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
}

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  "admin@blackwolfsec.io": {
    password: "blackwolf2026",
    user: {
      id: "u1",
      email: "admin@blackwolfsec.io",
      nombre: "Admin BlackWolf",
      role: "admin",
      created_at: "2026-01-01T00:00:00Z",
    },
  },
  "demo@blackwolfsec.io": {
    password: "demo1234",
    user: {
      id: "u2",
      email: "demo@blackwolfsec.io",
      nombre: "Demo User",
      role: "user",
      created_at: "2026-03-01T00:00:00Z",
    },
  },
};

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  await new Promise((r) => setTimeout(r, 800));

  const entry = DEMO_USERS[email.toLowerCase()];
  if (!entry) {
    return { success: false, error: "Invalid credentials" };
  }
  if (entry.password !== password) {
    return { success: false, error: "Invalid credentials" };
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("bw_session", JSON.stringify(entry.user));
  }

  return { success: true, user: entry.user };
}

export function logoutUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("bw_session");
  }
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("bw_session");
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return null;
}
