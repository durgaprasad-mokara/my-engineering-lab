import { AlertTriangle, FileCheck2, FlaskConical, HelpCircle, ShieldCheck, UserRound } from "lucide-react";
import type { VerificationStatus } from "@/lib/data/types";
import { Badge, type BadgeProps } from "@/components/ui/badge";

interface StatusMeta {
  label: string;
  variant: NonNullable<BadgeProps["variant"]>;
  title: string;
  icon: typeof ShieldCheck;
}

export const PROVENANCE_META: Record<VerificationStatus, StatusMeta> = {
  verified: {
    label: "Verified",
    variant: "success",
    title: "Independently verified against manufacturer datasheet or test bench measurement",
    icon: ShieldCheck,
  },
  typical: {
    label: "Typical",
    variant: "accent",
    title: "Typical value from manufacturer datasheet — not independently verified",
    icon: FileCheck2,
  },
  estimated: {
    label: "Estimated",
    variant: "warning",
    title: "Engineering estimate or generic market range — confirm against target part datasheet",
    icon: AlertTriangle,
  },
  user_provided: {
    label: "User provided",
    variant: "default",
    title: "Entered by workspace user without independent verification",
    icon: UserRound,
  },
  simulated: {
    label: "Simulated",
    variant: "illustrative",
    title: "Derived from simulation output rather than bench measurement",
    icon: FlaskConical,
  },
  unverified: {
    label: "Unverified",
    variant: "outline",
    title: "Unverified — no datasheet or bench source recorded",
    icon: HelpCircle,
  },
};

export function ProvenanceBadge({
  status,
  showIcon = true,
  className,
}: {
  status: VerificationStatus;
  showIcon?: boolean;
  className?: string;
}) {
  const meta = PROVENANCE_META[status] ?? PROVENANCE_META.unverified;
  const Icon = meta.icon;
  return (
    <Badge variant={meta.variant} title={meta.title} className={className}>
      {showIcon && <Icon className="size-3" aria-hidden />}
      {meta.label}
    </Badge>
  );
}
