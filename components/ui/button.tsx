import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {}

export default function Button({
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        "rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700",
        className
      )}
    >
      {children}
    </button>
  );
}