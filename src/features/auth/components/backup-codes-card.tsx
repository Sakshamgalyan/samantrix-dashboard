"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";
import { CONSOLE_HOME } from "@/lib/home-path";
import { useAuthPageContext } from "../context";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Checkbox,
  Chip,
  Typography,
} from "@galyan/ui";
import {
  Copy,
  Check,
  Download,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export function BackupCodesCard() {
  const router = useRouter();
  const { refreshSession } = useAuth();
  const {
    backupCodes,
    acknowledgedBackup,
    setAcknowledgedBackup,
    copiedAllCodes,
    setCopiedAllCodes,
  } = useAuthPageContext();

  if (!backupCodes || backupCodes.length === 0) {
    return null;
  }

  const copyAll = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopiedAllCodes(true);
    setTimeout(() => setCopiedAllCodes(false), 2500);
  };

  const downloadTxt = () => {
    const content = `SAMANTRIX ENTERPRISE — 2FA EMERGENCY BACKUP CODES\nGenerated: ${new Date().toISOString()}\n\nKeep these codes in a secure password vault (e.g. 1Password / Bitwarden).\nEach code can only be used once.\n\n${backupCodes
      .map((c, i) => `${i + 1}. ${c}`)
      .join("\n")}\n`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `samantrix-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFinish = async () => {
    await refreshSession();
    router.push(CONSOLE_HOME.workspace);
  };

  return (
    <Card
      variant="glass"
      shadow="lg"
      padding="lg"
      radius="xl"
      className="w-full max-w-lg mx-auto transition-all duration-500 ease-out starting:opacity-0 starting:translate-y-4"
    >
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <span className="grid size-11 place-items-center rounded-xl bg-[var(--gy-warning)]/10 text-[var(--gy-warning)]">
            <ShieldAlert className="size-5" />
          </span>
          <Chip size="sm" variant="warning">
            Action required
          </Chip>
        </div>

        <div className="space-y-1">
          <Typography variant="h4" weight="bold" className="tracking-tight text-[var(--gy-text)]">
            Save your backup codes
          </Typography>
          <Typography variant="p" className="text-sm text-[var(--gy-text-secondary)]">
            If you lose your authenticator device, these one-time codes are the only way to
            recover your root administrator account.
          </Typography>
        </div>
      </CardHeader>

      <CardBody className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface-sunken)] p-3">
          {backupCodes.map((code, idx) => (
            <Typography
              key={idx}
              variant="span"
              weight="semibold"
              className="rounded-lg border border-[var(--gy-border)] bg-[var(--gy-surface)] py-2 text-center font-mono text-sm tracking-widest text-[var(--gy-text)] select-all transition-colors hover:border-[var(--gy-primary)]"
            >
              {code}
            </Typography>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="soft"
            size="md"
            onClick={copyAll}
            fullWidth
            leftIcon={copiedAllCodes ? <Check className="size-4" /> : <Copy className="size-4" />}
          >
            {copiedAllCodes ? "Copied" : "Copy all"}
          </Button>
          <Button
            type="button"
            variant="glass"
            size="md"
            onClick={downloadTxt}
            fullWidth
            leftIcon={<Download className="size-4" />}
          >
            Download .txt
          </Button>
        </div>

        <Checkbox
          checked={acknowledgedBackup}
          onChange={(e) => setAcknowledgedBackup(e.target.checked)}
          label="I have saved these backup codes somewhere safe."
        />
      </CardBody>

      <CardFooter className="pt-4">
        <Button
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          disabled={!acknowledgedBackup}
          onClick={handleFinish}
          rightIcon={<ArrowRight className="size-4" />}
        >
          Continue to dashboard
        </Button>
      </CardFooter>
    </Card>
  );
}
