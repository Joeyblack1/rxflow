"use client";

import { useState } from "react";
import { changePasswordAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, KeyRound } from "lucide-react";

export default function ChangePasswordPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) {
      setError("New passwords do not match");
      return;
    }
    if (next.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await changePasswordAction(current, next);
      if (result?.error) setError(result.error);
    } catch {
      // redirect throws — expected on success
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <Card className="shadow-lg border-0">
        <CardHeader className="text-center pb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: "#005EB8" }}
          >
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Set your password</CardTitle>
          <CardDescription>
            You must change your temporary password before continuing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="current">Current password</Label>
              <Input
                id="current"
                type="password"
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="next">New password</Label>
              <Input
                id="next"
                type="password"
                autoComplete="new-password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                required
                minLength={8}
                disabled={loading}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm">Confirm new password</Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full text-white font-semibold"
              style={{ backgroundColor: "#005EB8" }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating…
                </>
              ) : (
                "Set new password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
