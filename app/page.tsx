"use client";

import { createClient } from "@/lib/supabaseBrowser";

export default function Home() {
  const supabase = createClient();

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button onClick={loginWithGoogle}>
      Sign in with Google
    </button>
  );
}
