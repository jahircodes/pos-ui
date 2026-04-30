/**
 * Mobile-first change password form (UI only; no API calls).
 */
import { useState, type FormEvent } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface ChangePasswordScreenProps {
  onBack: () => void;
}

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
  autoComplete?: string;
}

/**
 * Single password input with show/hide toggle for touch devices.
 */
function PasswordField({
  id,
  label,
  value,
  onChange,
  isVisible,
  onToggleVisibility,
  autoComplete = 'current-password',
}: PasswordFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="w-full rounded-xl border border-gray-200 py-3 pl-4 pr-12 text-base outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 active:bg-gray-100"
        >
          {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

/**
 * Renders the change password flow with validation feedback and success toast.
 */
export function ChangePasswordScreen({ onBack }: ChangePasswordScreenProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMismatch, setConfirmMismatch] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setConfirmMismatch(false);

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmMismatch(true);
      toast.error('New password and confirmation do not match');
      return;
    }

    toast.success('Password updated successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="flex h-full flex-col bg-gray-50 pb-20">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 p-4">
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 active:bg-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Change Password</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <PasswordField
              id="current-password"
              label="Current Password"
              value={currentPassword}
              onChange={setCurrentPassword}
              isVisible={showCurrent}
              onToggleVisibility={() => setShowCurrent((v) => !v)}
              autoComplete="current-password"
            />
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="space-y-4">
              <PasswordField
                id="new-password"
                label="New Password"
                value={newPassword}
                onChange={(v) => {
                  setNewPassword(v);
                  if (confirmMismatch) setConfirmMismatch(false);
                }}
                isVisible={showNew}
                onToggleVisibility={() => setShowNew((v) => !v)}
                autoComplete="new-password"
              />
              <PasswordField
                id="confirm-new-password"
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(v) => {
                  setConfirmPassword(v);
                  if (confirmMismatch) setConfirmMismatch(false);
                }}
                isVisible={showConfirm}
                onToggleVisibility={() => setShowConfirm((v) => !v)}
                autoComplete="new-password"
              />
              {confirmMismatch ? (
                <p className="text-sm text-red-600">Passwords do not match.</p>
              ) : null}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-green-600 py-4 text-base font-semibold text-white shadow-md active:bg-green-700"
          >
            Update Password
          </button>
        </form>
      </main>
    </div>
  );
}
