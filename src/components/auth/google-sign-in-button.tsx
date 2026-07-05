import { signIn } from "~/server/auth";
import { cn } from "~/lib/utils";

import { GoogleIcon } from "./google-icon";

type GoogleSignInButtonProps = {
  callbackUrl?: string;
  variant?: "hero" | "nav" | "full" | "compact";
  className?: string;
  label?: string;
};

const variantClass: Record<
  NonNullable<GoogleSignInButtonProps["variant"]>,
  string
> = {
  hero: "butlr-btn-google butlr-btn-google-hero w-full sm:w-auto",
  nav: "butlr-btn-google butlr-btn-google-nav",
  full: "butlr-btn-google butlr-btn-google-full w-full",
  compact: "butlr-btn-google butlr-btn-google-nav text-xs",
};

export function GoogleSignInButton({
  callbackUrl = "/batcave/chat",
  variant = "full",
  className,
  label = "Continue with Google",
}: GoogleSignInButtonProps) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: callbackUrl });
      }}
      className={cn("inline-block w-full sm:w-auto", className)}
    >
      <button
        type="submit"
        className={cn(variantClass[variant], "gap-3")}
      >
        <GoogleIcon className="size-5 shrink-0" />
        <span>{label}</span>
      </button>
    </form>
  );
}
