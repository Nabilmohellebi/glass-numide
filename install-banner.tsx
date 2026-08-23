import { useEffect, useState } from "react";
import { useInstallPrompt } from "../hooks/use-install-prompt";

const DISMISS_KEY = "cadran_install_dismissed_until";
const SNOOZE_DAYS = 10;

function isDismissed(): boolean {
  const until = localStorage.getItem(DISMISS_KEY);
  return until ? Date.now() < Number(until) : false;
}

export function InstallBanner() {
  const { canInstall, ios, hasNativePrompt, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(isDismissed());
  const [showIOSSteps, setShowIOSSteps] = useState(false);

  useEffect(() => {
    setDismissed(isDismissed());
  }, [canInstall]);

  if (!canInstall || dismissed) return null;

  const snooze = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + SNOOZE_DAYS * 86_400_000));
    setDismissed(true);
  };

  const onInstallClick = async () => {
    if (ios && !hasNativePrompt) {
      setShowIOSSteps(true);
      return;
    }
    const outcome = await promptInstall();
    if (outcome === "dismissed") snooze();
  };

  return (
    <div className="rise mb-3.5 overflow-hidden rounded-[20px] border border-line bg-surface p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-accent">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a0a0b" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 12l4-3" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="display text-[14px] leading-tight">Installer Le Cadran</div>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-dim">
            {ios
              ? "Ajoute-le à ton écran d'accueil — il s'ouvre en plein écran, comme une vraie app."
              : "Sur ton écran d'accueil, en plein écran, sans barre d'adresse."}
          </p>
        </div>
      </div>

      {!showIOSSteps ? (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onInstallClick}
            className="display flex-1 rounded-[12px] bg-accent py-2.5 text-[12.5px] font-semibold text-[#0a0a0b]"
          >
            Installer
          </button>
          <button
            type="button"
            onClick={snooze}
            className="display rounded-[12px] border border-line bg-surface-2 px-4 py-2.5 text-[12.5px] text-ink-faint"
          >
            Plus tard
          </button>
        </div>
      ) : (
        <div className="mt-3 rounded-[14px] bg-surface-2 p-3.5">
          <ol className="flex flex-col gap-2.5">
            <IOSStep n={1}>
              Appuie sur l'icône <ShareIcon /> Partager, en bas de Safari.
            </IOSStep>
            <IOSStep n={2}>Fais défiler et choisis « Sur l'écran d'accueil ».</IOSStep>
            <IOSStep n={3}>Appuie sur « Ajouter » en haut à droite.</IOSStep>
          </ol>
          <button type="button" onClick={snooze} className="mt-3 font-mono text-[11px] text-ink-faint underline">
            J'ai compris
          </button>
        </div>
      )}
    </div>
  );
}

function IOSStep({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-[12.5px] text-ink-dim">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-3 font-mono text-[10.5px] text-ink">
        {n}
      </span>
      <span className="pt-0.5 leading-relaxed">{children}</span>
    </li>
  );
}

function ShareIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline align-[-2px]">
      <path d="M12 3v12M8 7l4-4 4 4" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}
