"use client";

import { ShieldCheck, Zap, Server, Lock, Sparkles } from "lucide-react";
import { AnimatedNumber, Card, Chip, Typography } from "@galyan/ui";

const CAPABILITIES = [
  {
    icon: ShieldCheck,
    tone: "text-[var(--gy-primary)] bg-[var(--gy-primary)]/12 ring-[var(--gy-primary)]/25",
    title: "Hardware 2FA & WebAuthn",
    description: "FIDO2 biometric keys with cryptographic isolation.",
  },
  {
    icon: Zap,
    tone: "text-[var(--gy-info)] bg-[var(--gy-info)]/12 ring-[var(--gy-info)]/25",
    title: "Spatial Mesh Sync",
    description: "Sub-10ms edge state replication for virtual offices.",
  },
  {
    icon: Server,
    tone: "text-[var(--gy-success)] bg-[var(--gy-success)]/12 ring-[var(--gy-success)]/25",
    title: "Isolated Tenant Boundary",
    description: "Data isolation across private organizational DBs.",
  },
  {
    icon: Lock,
    tone: "text-[var(--gy-warning)] bg-[var(--gy-warning)]/12 ring-[var(--gy-warning)]/25",
    title: "Deterministic Policy RBAC",
    description: "Granular role enforcement across pods & agents.",
  },
];

const STATS = [
  { value: 99.99, decimals: 2, suffix: "%", label: "Uptime SLA" },
  { value: 15, prefix: "<", suffix: "ms", label: "Realtime sync" },
  { value: 256, suffix: "-bit", label: "Encryption" },
];

export function AuthShowcase() {
  return (
    <section className="hidden lg:flex lg:col-span-7 flex-col justify-center gap-6 max-w-2xl transition-all duration-700 ease-out starting:opacity-0 starting:-translate-x-6">
      <div>
        <Chip variant="soft" size="sm" icon={<Sparkles className="size-3" />}>
          Enterprise Identity Fabric
        </Chip>
      </div>

      <div className="space-y-4">
        <Typography
          variant="h1"
          weight="extrabold"
          className="text-4xl xl:text-[2.85rem] tracking-tight leading-[1.08] text-[var(--gy-text)]"
        >
          Autonomous virtual workplaces,{" "}
          <span className="bg-linear-to-r from-[var(--gy-primary)] via-[var(--gy-secondary)] to-[var(--gy-info)] bg-clip-text text-transparent">
            instant zero-trust identity.
          </span>
        </Typography>
        <Typography variant="p" className="text-base leading-relaxed max-w-xl text-[var(--gy-text-secondary)]">
          Connect distributed engineering pods, AI runtime agents, and hardware modules behind
          deterministic cryptographic access policies.
        </Typography>
      </div>

      {/* Live stats */}
      <Card variant="glass" padding="none" radius="xl" className="[@media(max-height:720px)]:hidden">
        <div className="grid grid-cols-3 divide-x divide-[var(--gy-divider)]">
          {STATS.map((stat) => (
            <div key={stat.label} className="px-5 py-3.5">
              <AnimatedNumber
                value={stat.value}
                decimals={stat.decimals}
                prefix={stat.prefix}
                suffix={stat.suffix}
                variant="h3"
                weight="bold"
                mode="roller"
                easing="easeOutExpo"
                duration={1600}
                animateOnMount
                className="tracking-tight text-[var(--gy-text)]"
              />
              <Typography variant="span" className="mt-1 block text-xs uppercase tracking-wider text-[var(--gy-text-subtle)]">
                {stat.label}
              </Typography>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {CAPABILITIES.map(({ icon: Icon, tone, title, description }, idx) => (
          <Card
            key={title}
            variant="glass"
            padding="sm"
            radius="lg"
            hoverEffect="glow"
            className="group transition-all duration-500 ease-out hover:-translate-y-0.5 starting:opacity-0 starting:translate-y-3"
            style={{ transitionDelay: `${150 + idx * 80}ms` }}
          >
            <div className="flex items-start gap-3">
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-lg ring-1 transition-transform duration-300 group-hover:scale-110 ${tone}`}
              >
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 space-y-0.5">
                <Typography variant="span" weight="semibold" className="block text-sm text-[var(--gy-text)]">
                  {title}
                </Typography>
                <Typography variant="span" className="block text-xs leading-snug text-[var(--gy-text-secondary)]">
                  {description}
                </Typography>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
