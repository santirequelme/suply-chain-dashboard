import { useState } from "react";
import { User, Mail, Lock, Shield, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Shared sub-components ────────────────────────────────────────────────────

const SECTION_CLASS = "card p-5 space-y-5";
const LABEL_CLASS   = "block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5";

function SectionHeader({ icon: Icon, title, description }: {
  icon: React.ElementType; title: string; description: string;
}) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-slate-100 dark:border-white/5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 dark:bg-brand/20 flex-shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-brand" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>{label}</label>
      {children}
    </div>
  );
}

// ─── Section: Profile ─────────────────────────────────────────────────────────

function ProfileSection() {
  const [name, setName] = useState("Santi Reke");
  const [bio,  setBio]  = useState("Supply chain analyst & dashboard admin.");
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <section className={SECTION_CLASS} aria-labelledby="profile-heading">
      <SectionHeader
        icon={User}
        title="Profile"
        description="Your public identity within the dashboard"
      />

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-brand/10 border-2 border-brand/30 dark:bg-brand/20 dark:border-brand/50 flex items-center justify-center">
            <span className="text-xl font-bold text-brand">SR</span>
          </div>
          <button
            className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-full bg-brand flex items-center justify-center shadow-brand-glow"
            aria-label="Change avatar"
          >
            <Camera className="h-3 w-3 text-white" aria-hidden="true" />
          </button>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Santi Reke</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Admin · Supply Chain</p>
          <button className="text-xs text-brand hover:underline mt-1">Upload new photo</button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <Field label="Full Name" id="full-name">
          <input
            id="full-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input w-full"
            placeholder="Your full name"
          />
        </Field>

        <Field label="Bio" id="bio">
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="input w-full resize-none"
            placeholder="A short description about yourself"
          />
        </Field>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-sm font-medium bg-brand text-white hover:bg-brand/90 transition-colors shadow-brand-glow"
          >
            Save Profile
          </button>
          {saved && (
            <span className="text-xs text-success font-medium">Changes saved ✓</span>
          )}
        </div>
      </form>
    </section>
  );
}

// ─── Section: Account Settings ────────────────────────────────────────────────

function AccountSettingsSection() {
  const [email, setEmail] = useState("santireke37@gmail.com");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [emailSaved, setEmailSaved] = useState(false);
  const [pwSaved,    setPwSaved]    = useState(false);
  const [pwError,    setPwError]    = useState("");

  function handleEmailSave(e: React.FormEvent) {
    e.preventDefault();
    setEmailSaved(true);
    setTimeout(() => setEmailSaved(false), 2500);
  }

  function handlePwSave(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (!currentPw) { setPwError("Current password is required."); return; }
    if (newPw.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { setPwError("Passwords don't match."); return; }
    setPwSaved(true);
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setTimeout(() => setPwSaved(false), 2500);
  }

  return (
    <section className={SECTION_CLASS} aria-labelledby="account-settings-heading">
      <SectionHeader
        icon={Shield}
        title="Account Settings"
        description="Manage your login credentials and security"
      />

      {/* Email */}
      <div className="pb-5 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="h-4 w-4 text-brand" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email</p>
        </div>
        <form onSubmit={handleEmailSave} className="space-y-3">
          <Field label="Email Address" id="email">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full"
              placeholder="your@email.com"
            />
          </Field>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-medium bg-brand text-white hover:bg-brand/90 transition-colors"
            >
              Update Email
            </button>
            {emailSaved && (
              <span className="text-xs text-success font-medium">Email updated ✓</span>
            )}
          </div>
        </form>
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Lock className="h-4 w-4 text-brand" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Password</p>
        </div>
        <form onSubmit={handlePwSave} className="space-y-3">
          <Field label="Current Password" id="current-pw">
            <input
              id="current-pw"
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              className="input w-full"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="New Password" id="new-pw">
              <input
                id="new-pw"
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="input w-full"
                placeholder="Min. 8 characters"
                autoComplete="new-password"
              />
            </Field>
            <Field label="Confirm New Password" id="confirm-pw">
              <input
                id="confirm-pw"
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className={cn("input w-full", pwError && confirmPw && newPw !== confirmPw && "border-danger focus:ring-danger/30")}
                placeholder="Repeat new password"
                autoComplete="new-password"
              />
            </Field>
          </div>
          {pwError && (
            <p className="text-xs text-danger" role="alert">{pwError}</p>
          )}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-medium bg-brand text-white hover:bg-brand/90 transition-colors"
            >
              Change Password
            </button>
            {pwSaved && (
              <span className="text-xs text-success font-medium">Password changed ✓</span>
            )}
          </div>
        </form>
      </div>

      {/* Security info */}
      <div className="rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] px-4 py-3">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-3.5 w-3.5 text-success" aria-hidden="true" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Security Tips</p>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and symbols. Never share your credentials.
        </p>
      </div>
    </section>
  );
}

// ─── Account page ─────────────────────────────────────────────────────────────

export default function AccountView() {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Account</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your profile and login credentials
        </p>
      </div>

      <ProfileSection />
      <AccountSettingsSection />
    </div>
  );
}
