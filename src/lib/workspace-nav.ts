import {
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Plug,
  type LucideIcon,
} from "lucide-react";

export type WorkspaceNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const WORKSPACE_NAV: WorkspaceNavItem[] = [
  { href: "/batcave", label: "Briefing", icon: LayoutDashboard },
  { href: "/batcave/chat", label: "Chat", icon: MessageSquare },
  { href: "/batcave/integrations", label: "Integrations", icon: Plug },
  { href: "/batcave/billing", label: "Billing", icon: CreditCard },
];

export const LANDING_MOBILE_NAV = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
] as const;
