"use client";

import React, { useState } from "react";
import { User, LogOut, Settings } from "lucide-react";
import { Button } from "../ui/button";
import db from "../../lib/instant/client";
import { cn } from "../../lib/utils";

interface UserProfileProps {
  className?: string;
  showEmail?: boolean;
}

export function UserProfile({ className, showEmail = true }: UserProfileProps) {
  const { user } = db.useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!user) return null;

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-2"
      >
        <div className="flex items-center justify-center w-6 h-6 bg-accent-mint/20 rounded-full">
          <User size={14} className="text-accent-mint" />
        </div>
        {showEmail && (
          <span className="text-sm text-foreground truncate max-w-32">
            {user.email}
          </span>
        )}
      </Button>

      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-20">
            <div className="p-2 border-b border-border">
              <p className="text-sm font-medium text-foreground truncate">
                {user.email}
              </p>
            </div>
            <div className="p-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => {
                  setIsMenuOpen(false);
                  // Add settings navigation here
                }}
              >
                <Settings size={14} />
                Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                onClick={() => {
                  setIsMenuOpen(false);
                  db.auth.signOut();
                }}
              >
                <LogOut size={14} />
                Sign out
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}