"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSession, signin, signout } from "./actions";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex flex-row items-center justify-center gap-4">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold">Broken</h1>
          <ProfilePictureOrSigninButton />
        </div>
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold">Fixed</h1>
          <ProfilePictureOrSigninButton initStateFromCookie />
        </div>
      </div>
      <YouAreLoggedInOrSignOutButton />
      <HydrationIndicator />
    </div>
  );
}

function Box({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <div className="size-64 flex items-center justify-center" id={id}>
      {children}
    </div>
  );
}

function ProfilePictureOrSigninButton({
  initStateFromCookie,
}: {
  initStateFromCookie?: boolean;
}) {
  const auth = useAuth({ initStateFromCookie });

  return (
    <>
      <Box id={initStateFromCookie ? "auth" : undefined}>
        {auth ? (
          auth.isSignedIn ? (
            <ProfilePicture url={auth.profilePictureUrl} />
          ) : (
            <SigninButton />
          )
        ) : (
          <p>loading...</p>
        )}
      </Box>
      {initStateFromCookie && (
        <script
          dangerouslySetInnerHTML={{
            __html: `(${() => {
              function parseCookie(cookie: string) {
                return cookie
                  .split(";")
                  .reduce((acc: Record<string, string>, cookie) => {
                    const [key, value] = cookie.split("=");
                    if (key && value !== undefined) {
                      acc[key.trim()] = decodeURIComponent(value.trim());
                    }
                    return acc;
                  }, {});
              }

              const auth = document.getElementById("auth");
              if (!auth) {
                console.error("auth element not found");
                return;
              }
              const cookies = parseCookie(document.cookie);
              if (!cookies.metadata) {
                return;
              }
              const metadata = JSON.parse(cookies.metadata);
              const profilePictureUrl = metadata.profilePictureUrl;
              if (profilePictureUrl) {
                const image = document.createElement("img");
                image.src = profilePictureUrl;
                image.alt = "Profile Picture";
                image.className = "size-32 rounded-full";
                auth.innerHTML = "";
                auth.appendChild(image);
                auth.dataset.inlineInit = "pfp";
              } else {
                const signinButton = document.createElement("button");
                signinButton.innerHTML = "Sign in";
                signinButton.className =
                  "bg-blue-500 text-white p-2 rounded-md";
                auth.innerHTML = "";
                auth.appendChild(signinButton);
                auth.dataset.inlineInit = "signin";
              }
            }})()`,
          }}
        />
      )}
    </>
  );
}

function YouAreLoggedInOrSignOutButton() {
  const auth = useAuth({ initStateFromCookie: false });
  console.log("auth", auth);
  return (
    <Box>
      {auth ? (
        auth.isSignedIn ? (
          <button
            onClick={auth.signOut}
            className="bg-red-500 text-white p-2 rounded-md hover:bg-red-700"
          >
            Sign out
          </button>
        ) : (
          <button
            onClick={auth.signIn}
            className="bg-green-500 text-white p-2 rounded-md hover:bg-green-700"
          >
            Sign in
          </button>
        )
      ) : (
        <p>loading...</p>
      )}
    </Box>
  );
}

type Auth =
  | {
      isSignedIn: true;
      profilePictureUrl: string;
      signOut: () => void;
    }
  | {
      isSignedIn: false;
      profilePictureUrl: null;
      signIn: () => void;
    };

function parseCookie(cookie: string) {
  return cookie.split(";").reduce((acc: Record<string, string>, cookie) => {
    const [key, value] = cookie.split("=");
    if (key && value !== undefined) {
      acc[key.trim()] = decodeURIComponent(value.trim());
    }
    return acc;
  }, {});
}

function useSeededSession() {
  const initialData = (() => {
    if (typeof window !== "undefined") {
      const cookies = parseCookie(document.cookie);
      if (cookies.metadata) {
        const metadata = JSON.parse(cookies.metadata);
        if (metadata.profilePictureUrl) {
          return {
            sessionData: null,
            metadata,
          };
        }
      }
    }
    return undefined;
  })();

  return useQuery({
    queryKey: ["auth"],
    queryFn: getSession,
    initialData: initialData as any as Awaited<ReturnType<typeof getSession>>,
  });
}

function useNormalSession() {
  return useQuery({
    queryKey: ["auth"],
    queryFn: getSession,
  });
}

function useAuth({
  initStateFromCookie,
}: {
  initStateFromCookie?: boolean;
}): Auth | null {
  const queryClient = useQueryClient();

  const seededSession = useSeededSession();
  const normalSession = useNormalSession();

  const data = initStateFromCookie ? seededSession.data : normalSession.data;

  const { mutate: signinMutation } = useMutation({
    mutationFn: signin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
  const { mutate: signoutMutation } = useMutation({
    mutationFn: signout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  if (data === undefined) return null;

  if (data) {
    return {
      isSignedIn: true,
      profilePictureUrl: data.metadata.profilePictureUrl,
      signOut: signoutMutation,
    };
  } else {
    return {
      isSignedIn: false,
      profilePictureUrl: null,
      signIn: signinMutation,
    };
  }
}

function ProfilePicture({ url }: { url: string }) {
  return (
    <img src={url} alt="Profile Picture" className="size-32 rounded-full" />
  );
}

function SigninButton() {
  return (
    <button className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-700">Sign in</button>
  );
}

function useIsHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => {
    setHasHydrated(true);
  }, []);
  return hasHydrated;
}

function HydrationIndicator() {
  const hasHydrated = useIsHydrated();
  if (!hasHydrated) {
    return (
    <div className="text-center py-4 lg:px-4">
      <div className="p-2 bg-amber-700 items-center text-indigo-100 leading-none lg:rounded-full flex lg:inline-flex" role="alert">
        <span className="flex uppercase px-2 py-1 text-xs font-bold">HTML from server, not yet hydrated</span>
      </div>
    </div>
    );
  }
  return (
    <div className="text-center py-4 lg:px-4">
      <div className="p-2 bg-cyan-700 items-center text-indigo-100 leading-none lg:rounded-full flex lg:inline-flex" role="alert">
        <span className="flex uppercase px-2 py-1 text-xs font-bold">React hydrated</span>
      </div>
    </div>
  );
}
