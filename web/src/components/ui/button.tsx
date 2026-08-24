import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonBaseProps = {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
};

const variantStyles: Record<NonNullable<ButtonBaseProps["variant"]>, string> = {
  primary:
    "bg-accent text-accent-foreground hover:opacity-90 border border-transparent",
  secondary:
    "bg-transparent text-foreground border border-border-strong hover:border-accent hover:text-accent",
  ghost: "bg-transparent text-muted-strong hover:text-foreground border border-transparent",
};

const sizeStyles: Record<NonNullable<ButtonBaseProps["size"]>, string> = {
  sm: "text-sm px-4 py-2",
  md: "text-sm px-5 py-2.5",
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2";

export function buttonClasses(
  variant: NonNullable<ButtonBaseProps["variant"]> = "primary",
  size: NonNullable<ButtonBaseProps["size"]> = "md",
  className?: string
) {
  return cn(baseStyles, variantStyles[variant], sizeStyles[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  ...props
}: ButtonBaseProps &
  (
    | ({ href: string } & Omit<React.ComponentPropsWithoutRef<typeof Link>, "href" | "className">)
    | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>)
  )) {
  const classes = cn(baseStyles, variantStyles[variant], sizeStyles[size], className);

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        {...(props as Omit<React.ComponentPropsWithoutRef<typeof Link>, "href">)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
