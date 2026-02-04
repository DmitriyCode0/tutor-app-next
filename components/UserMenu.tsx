"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/providers/auth-provider";

export function UserMenu() {
  const { user, signOut, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      // nothing to do — user is signed out
    }
  }, [isLoading, user]);

  if (isLoading) {
    return null;
  }

  if (!user) {
    return (
      <Link href="/login">
        <Button variant="outline" size="sm">
          Sign in
        </Button>
      </Link>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/login");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const userMeta: any = (user as any).user_metadata ?? {};
  const displayName =
    userMeta.full_name || userMeta.name || user.email?.split("@")[0] || "User";
  const avatarUrl = userMeta.avatar_url || null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="rounded-full px-2 py-1 flex items-center gap-2"
        >
          <Avatar src={avatarUrl} name={displayName} size={32} />
          <span className="hidden sm:inline-block text-sm font-medium truncate max-w-[120px]">
            {displayName}
          </span>
          <span className="sr-only">Open user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="px-4 py-2">
          <div className="text-sm font-medium">{displayName}</div>
          <div className="text-xs text-muted-foreground">{user?.email}</div>
        </div>
        <DropdownMenuItem asChild>
          <Link href="/cabinet">
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
