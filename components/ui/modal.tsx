import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./dialog";

export function Modal({ children, description, isOpen, onOpenChange, title }: { children: ReactNode; description?: string; isOpen: boolean; onOpenChange: (open: boolean) => void; title: string }) {
  return <Dialog open={isOpen} onOpenChange={onOpenChange}><DialogContent><DialogTitle>{title}</DialogTitle>{description && <DialogDescription className="mt-2 text-sm text-muted-foreground">{description}</DialogDescription>}<div className="mt-4">{children}</div></DialogContent></Dialog>;
}
