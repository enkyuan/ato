"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import db from "../../lib/instant/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  return (
    <>
      <db.SignedIn>
        {children}
      </db.SignedIn>
      <db.SignedOut>
        {fallback || <DefaultAuthFallback />}
      </db.SignedOut>
    </>
  );
}

function DefaultAuthFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-accent-mint">Authentication Required</CardTitle>
          <CardDescription>
            You need to sign in to access this page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => window.location.href = '/auth'}
            className="w-full"
          >
            Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}