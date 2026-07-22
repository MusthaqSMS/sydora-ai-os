"use client";

import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function UserMenu({ name, email }: { name: string; email: string | null }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button size="sm" variant="outline">{name.slice(0, 1).toUpperCase()}</Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm"><div className="font-medium">{name}</div><div className="truncate text-muted-foreground">{email}</div></div>
        <DropdownMenuItem asChild><Link href="/settings/profile">Profile</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/settings/organization">Organization</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><form action={logoutAction}><button className="w-full text-left" type="submit">Log out</button></form></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const AvatarMenu = UserMenu;
export const ProfileDropdown = UserMenu;
