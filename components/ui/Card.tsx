import { ReactNode } from "react";
import clsx from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({
  children,
  className,
}: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-zinc-800 bg-[#111113] shadow-sm transition-all duration-300",
        "hover:border-zinc-700 hover:shadow-xl",
        className
      )}
    >
      {children}
    </div>
  );
}