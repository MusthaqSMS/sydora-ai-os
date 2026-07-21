"use client";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;
export function DialogOverlay({ className, ...props }: ComponentProps<typeof DialogPrimitive.Overlay>) { return <DialogPrimitive.Overlay className={cn("fixed inset-0 z-50 bg-black/50", className)} {...props} />; }
export function DialogContent({ className, children, ...props }: ComponentProps<typeof DialogPrimitive.Content>) { return <DialogPortal><DialogOverlay /><DialogPrimitive.Content className={cn("fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-6 shadow-lg", className)} {...props}>{children}</DialogPrimitive.Content></DialogPortal>; }
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
