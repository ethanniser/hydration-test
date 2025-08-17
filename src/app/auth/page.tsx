"use client";

import React, { useEffect, useState } from "react";
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
          <ProfilePictureOrSigninButton />
        </div>
      </div>
      <YouAreLoggedInOrSignOutButton />
      <HydrationIndicator />
      <script src="/api/slow.js"></script>
    </div>
  );
}

function ProfilePictureOrSigninButton() {
  const auth = useAuth();
  if (!auth) return "loading...";
  return (
    <div className="size-64 flex items-center justify-center ">
      {auth.isSignedIn ? (
        <ProfilePicture url={auth.profilePictureUrl} />
      ) : (
        <SigninButton />
      )}
    </div>
  );
}

function YouAreLoggedInOrSignOutButton() {
  const auth = useAuth();
  if (!auth) return "loading...";
  return (
    <div className="size-64 flex items-center justify-center ">
      {auth.isSignedIn ? (
        <button
          onClick={auth.signOut}
          className="bg-red-500 text-white p-2 rounded-md"
        >
          Sign out
        </button>
      ) : (
        <button
          onClick={auth.signIn}
          className="bg-green-500 text-white p-2 rounded-md"
        >
          Sign in
        </button>
      )}
    </div>
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

function useAuth(): Auth | null {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["auth"],
    queryFn: getSession,
  });

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

  if (isLoading) return null;

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
    <button className="bg-blue-500 text-white p-2 rounded-md">Sign in</button>
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
      <div className="bg-red-600 text-white p-2 rounded-md">
        HTML from server, not yet hydrated
      </div>
    );
  }
  return (
    <div className="bg-green-600 text-white p-2 rounded-md">React hydrated</div>
  );
}
