"use client";

import { useCallback, useEffect, useState } from "react";
import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess } from "react-plaid-link";
import { Button } from "@/components/ui/button";
import { Loader2, Link2 } from "lucide-react";

interface PlaidLinkButtonProps {
  onSuccess: (accessToken: string) => void;
}

export function PlaidLinkButton({ onSuccess }: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/create_link_token", { method: "POST" });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setLinkToken(data.link_token);
      } catch (err) {
        setError("Could not initialize Plaid. Check your API keys.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchToken();
  }, []);

  const handleSuccess = useCallback<PlaidLinkOnSuccess>(
    async (publicToken) => {
      try {
        setLoading(true);
        const res = await fetch("/api/get_access_token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_token: publicToken }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        onSuccess(data.access_token);
      } catch (err) {
        setError("Failed to connect account. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  const config: PlaidLinkOptions = {
    token: linkToken!,
    onSuccess: handleSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  if (error) {
    return (
      <Button variant="destructive" size="lg" disabled>
        {error}
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25"
      onClick={() => open()}
      disabled={!ready || loading || !linkToken}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" />
          Connecting…
        </>
      ) : (
        <>
          <Link2 />
          Link Your Fidelity Accounts
        </>
      )}
    </Button>
  );
}
