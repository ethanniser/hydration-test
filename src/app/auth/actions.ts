"use server";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const key = new TextEncoder().encode("test");

type SessionData = {
  user: { id: number };
  expires: string;
};

type MetadataData = {
  profilePictureUrl: string;
};

async function signToken(payload: Record<string, unknown>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1 day from now")
    .sign(key);
}

async function verifyToken<T>(input: string) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload as T;
}

async function setSession({
  userId,
  profilePictureUrl,
}: {
  userId: number;
  profilePictureUrl: string;
}) {
  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session: SessionData = {
    expires: expiresInOneDay.toISOString(),
    user: { id: userId },
  };

  // here we just set the metadata directly
  // but because this cookie is much less secure, it should *always* be derived from the encrypted session
  // so that would usually look like a db lookup to get the profile picture url based on the user id
  const metadata: MetadataData = {
    profilePictureUrl,
  };
  const encryptedSession = await signToken(session);
  (await cookies()).set("session", encryptedSession, {
    expires: expiresInOneDay,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
  (await cookies()).set("metadata", JSON.stringify(metadata), {
    expires: expiresInOneDay,
    httpOnly: false, // this is safe because it's not sensitive data, and never used at the source of truth
    secure: true,
    sameSite: "lax",
  });
}

export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  const metadata = (await cookies()).get("metadata")?.value;
  if (!session || !metadata) return null;
  const sessionData = await verifyToken<SessionData>(session);
  const metadataData = JSON.parse(metadata) as MetadataData;
  return {
    session: sessionData,
    metadata: metadataData,
  };
}

export async function signin() {
  const session = await getSession();
  if (session) return;
  const userId = 1;
  const profilePictureUrl = "/claudemybeloved.png";
  await setSession({ userId, profilePictureUrl });
}

export async function signout() {
  (await cookies()).delete("session");
  (await cookies()).delete("metadata");
}
