import { cn } from "~/lib/utils";

type GlassPanelProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "aside" | "header" | "footer";
};

export function GlassPanel({
  children,
  className,
  as: Tag = "div",
}: GlassPanelProps) {
  return (
    <Tag className={cn("butlr-glass", className)}>
      {children}
    </Tag>
  );
}
