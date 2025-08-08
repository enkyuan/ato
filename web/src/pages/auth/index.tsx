"use client";

import React, { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Mail } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { cn } from "../../lib/utils";
import db from "../../lib/instant/client";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../../components/ui/input-otp";

// Environment variables for Google OAuth - using WAKU_PUBLIC_ prefix
const GOOGLE_CLIENT_ID = process.env.WAKU_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_NAME = process.env.WAKU_PUBLIC_GOOGLE_CLIENT_NAME || 'Ato Todo App';

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full min-w-md">
        <db.SignedIn>
          <AuthenticatedView />
        </db.SignedIn>
        <db.SignedOut>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <LoginView />
          </GoogleOAuthProvider>
        </db.SignedOut>
      </div>
    </div>
  );
}

function AuthenticatedView() {
  const { user } = db.useAuth();

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold text-accent-mint">Welcome back!</CardTitle>
        <CardDescription>
          You're signed in as {user?.email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={() => db.auth.signOut()}
          variant="outline"
          className="w-full"
        >
          Sign out
        </Button>
        <Button
          onClick={() => window.location.href = '/todo'}
          className="w-full"
        >
          Go to Todo App
        </Button>
      </CardContent>
    </Card>
  );
}

function LoginView() {
  const [sentEmail, setSentEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold text-primary">Welcome to Ato</CardTitle>
        <CardDescription>
          Get back into managing your workflow
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!sentEmail ? (
          <EmailStep
            onSendEmail={setSentEmail}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        ) : (
          <CodeStep
            sentEmail={sentEmail}
            onBack={() => setSentEmail("")}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}
      </CardContent>
    </Card>
  );
}

interface EmailStepProps {
  onSendEmail: (email: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

function EmailStep({ onSendEmail, isLoading, setIsLoading }: EmailStepProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [nonce] = useState(crypto.randomUUID());

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputEl = inputRef.current!;
    const email = inputEl.value;

    if (!email) return;

    setIsLoading(true);

    try {
      await db.auth.sendMagicCode({ email });
      onSendEmail(email);
    } catch (err: any) {
      console.error("Error sending magic code:", err);
      alert("Error sending code: " + (err.body?.message || err.message));
      onSendEmail("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      alert("No credential received from Google");
      return;
    }

    setIsLoading(true);

    try {
      await db.auth.signInWithIdToken({
        clientName: GOOGLE_CLIENT_NAME,
        idToken: credentialResponse.credential,
        nonce,
      });
    } catch (err: any) {
      console.error("Error with Google sign in:", err);
      alert("Error with Google sign in: " + (err.body?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    alert("Google sign in failed. Please try again.");
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            ref={inputRef}
            id="email"
            type="email"
            placeholder="Enter your email"
            required
            autoFocus
            disabled={isLoading}
            leadingIcon={<Mail />}
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send Magic Code"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="flex justify-center">
        {GOOGLE_CLIENT_ID ? (
          <div className={cn(
            "w-full transition-opacity [&>div]:!text-center [&>div>div]:!justify-center",
            isLoading && "opacity-50 pointer-events-none"
          )}>
            <GoogleLogin
              nonce={nonce}
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              theme="outline"
              size="large"
              text="signin"
              shape="rectangular"
              width="100%"
            />
          </div>
        ) : (
          <div className="text-center p-4 border border-dashed border-border rounded-md w-full">
            <p className="text-sm text-muted-foreground">
              Google OAuth not configured
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Add WAKU_PUBLIC_GOOGLE_CLIENT_ID to your environment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface CodeStepProps {
  sentEmail: string;
  onBack: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

function CodeStep({ sentEmail, onBack, isLoading, setIsLoading }: CodeStepProps) {
  const [code, setCode] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!code || code.length !== 6) return;

    setIsLoading(true);

    try {
      await db.auth.signInWithMagicCode({ email: sentEmail, code });
    } catch (err: any) {
      console.error("Error verifying code:", err);
      setCode("");
      alert("Error verifying code: " + (err.body?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Check your email</h3>
        <p className="text-sm text-muted-foreground">
          We sent a verification code to{" "}
          <span className="font-medium text-foreground">{sentEmail}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="code" className="text-sm font-medium text-foreground">
            Verification code
          </label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={setCode}
              disabled={isLoading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || code.length !== 6}
        >
          {isLoading ? "Verifying..." : "Verify Code"}
        </Button>
      </form>

      <div className="text-center">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-sm"
          disabled={isLoading}
        >
          ← Back to email
        </Button>
      </div>
    </div>
  );
}