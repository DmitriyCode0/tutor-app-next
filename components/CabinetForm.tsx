"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/providers/auth-provider";

export function CabinetForm() {
  const { user, supabase } = useAuth();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>("UAH");

  useEffect(() => {
    // read currency from user metadata or localStorage
    const meta = (user as any)?.user_metadata || {};
    const saved = meta.currency || localStorage.getItem("tutor_currency");
    if (saved) setCurrency(saved);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setEmail(user.email ?? "");
    // user metadata often stored under user.user_metadata or user.user_metadata?.full_name
    const meta = (user as any).user_metadata || {};
    setName(meta.full_name || meta.name || "");
  }, [user]);

  const handleSave = async () => {
    setError(null);
    setStatus(null);

    if (!user) {
      setError("You must be signed in to update your profile");
      return;
    }

    if (password && password !== confirmPassword) {
      setError("New password and confirmation do not match");
      return;
    }

    setLoading(true);

    try {
      // Build payload for updateUser
      const updates: Record<string, any> = {};
      if (name !== "") updates.data = { full_name: name };
      if (email && email !== user.email) updates.email = email;
      if (password) updates.password = password;

      if (Object.keys(updates).length === 0) {
        setStatus("No changes to save");
        return;
      }

      // include currency preference in user metadata
      updates.data = { ...(updates.data ?? {}), currency };

      const { data, error: updateError } =
        await supabase.auth.updateUser(updates);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      // Persist currency to local cache so client components can read immediately
      try {
        localStorage.setItem("tutor_currency", currency);
      } catch (e) {
        // ignore
      }

      // On success, inform user about email confirmation if needed
      if (updates.email && updates.email !== user.email) {
        setStatus(
          "Email change requested. Check your inbox to confirm the new email.",
        );
      } else if (updates.password) {
        setStatus("Password updated successfully");
      } else if (updates.data) {
        setStatus("Profile updated");
      }

      // Clear password fields
      setPassword("");
      setConfirmPassword("");

      // Reload to make sure the AuthProvider picks up updated metadata
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {error && <div className="mb-4 text-sm text-destructive">{error}</div>}
        {status && (
          <div className="mb-4 text-sm text-muted-foreground">{status}</div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Changing your email may require confirmation via a link sent to
              the new address.
            </p>
          </div>

          <div>
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="currency">Preferred currency</Label>
            <select
              id="currency"
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="UAH">UAH — ₴</option>
              <option value="EUR">EUR — €</option>
              <option value="USD">USD — $</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              This will change currency symbols throughout the app.
            </p>
          </div>

          <div>
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Leave blank to keep current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="h-11 px-6"
            >
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
