export type AuthUser = {
  id: string;
  name: string | null;
  email: string;
  passwordHash: string | null;
  googleId: string | null;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const memoryUsers: AuthUser[] = [];
let memoryUserId = 1;

function makeUser(data: Omit<AuthUser, "id" | "createdAt" | "updatedAt"> & { id?: string; createdAt?: Date; updatedAt?: Date }) {
  return {
    id: data.id ?? `mem-${memoryUserId++}`,
    name: data.name ?? null,
    email: data.email,
    passwordHash: data.passwordHash ?? null,
    googleId: data.googleId ?? null,
    verified: data.verified ?? false,
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
  } satisfies AuthUser;
}

export async function findUserByEmailFallback(email: string): Promise<AuthUser | null> {
  return memoryUsers.find((user) => user.email === email) ?? null;
}

export async function findUserByGoogleIdFallback(googleId: string): Promise<AuthUser | null> {
  return memoryUsers.find((user) => user.googleId === googleId) ?? null;
}

export async function createUserFallback(data: {
  name: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  verified?: boolean;
}): Promise<AuthUser> {
  const user = makeUser({
    name: data.name,
    email: data.email,
    passwordHash: data.passwordHash ?? null,
    googleId: data.googleId ?? null,
    verified: data.verified ?? false,
  });
  memoryUsers.push(user);
  return user;
}

export async function updateUserVerificationFallback(userId: string, verified: boolean): Promise<void> {
  const user = memoryUsers.find((entry) => entry.id === userId);
  if (user) {
    user.verified = verified;
    user.updatedAt = new Date();
  }
}

export async function linkGoogleAccountFallback(userId: string, googleId: string): Promise<void> {
  const user = memoryUsers.find((entry) => entry.id === userId);
  if (user) {
    user.googleId = googleId;
    user.verified = true;
    user.updatedAt = new Date();
  }
}
