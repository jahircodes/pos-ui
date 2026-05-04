/**
 * Full-screen auth: login, new-user (OTP + shop name), and forgot MPIN (OTP + success → login).
 */
import { useState, type FormEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Phone,
  Shield,
  Store,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from './ui/input-otp';
import {
  normalizeMobileDigits,
  useAuthStore,
} from '../authStore';

type AuthStep =
  | 'login'
  | 'newUser_mobile'
  | 'newUser_otp'
  | 'newUser_shop'
  | 'forgot_mobile'
  | 'forgot_otp'
  | 'forgot_success';

const fieldLabelClass = 'mb-2 block text-sm font-medium text-gray-800';

const textInputClass =
  'w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-4 pr-4 text-base text-gray-900 shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-500/15';

const otpSlotClass =
  'h-14 w-11 rounded-xl border-2 border-gray-100 bg-gray-50/80 text-lg font-semibold tabular-nums shadow-inner transition-[border-color,box-shadow,background-color] first:rounded-xl last:rounded-xl data-[active=true]:border-green-500 data-[active=true]:bg-white data-[active=true]:ring-4 data-[active=true]:ring-green-500/15';

const primaryButtonClass =
  'w-full rounded-xl bg-gradient-to-b from-green-600 to-green-700 py-3.5 text-base font-semibold text-white shadow-lg shadow-green-900/20 outline-none transition-[transform,box-shadow,filter] active:scale-[0.99] active:shadow-md enabled:hover:brightness-[1.03] focus-visible:ring-4 focus-visible:ring-green-500/35 disabled:pointer-events-none disabled:opacity-50';

const secondaryLinkClass =
  'flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-green-800 transition-colors hover:bg-green-50 active:bg-green-100/80';

/**
 * Returns true when the string is exactly four digits (OTP / MPIN).
 */
function isFourDigitCode(value: string): boolean {
  return /^\d{4}$/.test(value);
}

/** Centered white card on gradient shell (shared chrome for all steps). */
function AuthChrome({
  children,
  header,
  footerLabel,
}: {
  children: ReactNode;
  header?: ReactNode;
  footerLabel: string;
}) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-gradient-to-b from-gray-50 via-white to-emerald-50/40">
      <div className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="rounded-2xl border border-gray-100/90 bg-white/95 p-6 shadow-xl shadow-gray-200/40 ring-1 ring-black/[0.03] backdrop-blur-sm sm:p-8">
            {header}
            {children}
          </div>
          <p className="mt-6 text-center text-xs tracking-wide text-gray-400">{footerLabel}</p>
        </div>
      </div>
    </div>
  );
}

/** Pill back control for sub-flows. */
function AuthBackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group -ml-1 mb-5 flex w-fit items-center gap-2 rounded-full py-1.5 pl-1 pr-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors group-hover:bg-white group-hover:shadow-sm">
        <ArrowLeft className="h-4 w-4" aria-hidden />
      </span>
      {label}
    </button>
  );
}

/** Decorative step icon in a soft circle. */
function StepIcon({
  icon: Icon,
  variant = 'green',
}: {
  icon: LucideIcon;
  variant?: 'green' | 'amber';
}) {
  const ring =
    variant === 'amber'
      ? 'bg-amber-50 text-amber-700 ring-amber-200/60'
      : 'bg-emerald-50 text-emerald-700 ring-emerald-200/60';
  return (
    <div
      className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${ring} shadow-sm`}
      aria-hidden
    >
      <Icon className="h-6 w-6" strokeWidth={1.75} />
    </div>
  );
}

/** Four OTP / MPIN boxes with consistent styling. */
function FourDigitInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <InputOTP
      maxLength={4}
      value={value}
      onChange={(v) => onChange(v.replace(/\D/g, '').slice(0, 4))}
      containerClassName="justify-center gap-2.5 sm:gap-3"
    >
      <InputOTPGroup className="gap-2.5 sm:gap-3">
        {[0, 1, 2, 3].map((i) => (
          <InputOTPSlot key={i} index={i} className={otpSlotClass} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}

export function AuthFlow() {
  const { t } = useTranslation();
  const loginWithMpin = useAuthStore((s) => s.loginWithMpin);
  const registerNewUser = useAuthStore((s) => s.registerNewUser);
  const completeForgotMpin = useAuthStore((s) => s.completeForgotMpin);
  const hasCompleteAccount = useAuthStore((s) => s.hasCompleteAccount);
  const isRegisteredMobile = useAuthStore((s) => s.isRegisteredMobile);

  const [step, setStep] = useState<AuthStep>('login');
  const [loginMobile, setLoginMobile] = useState('');
  const [loginMpin, setLoginMpin] = useState('');
  const [newUserMobile, setNewUserMobile] = useState('');
  const [newUserOtp, setNewUserOtp] = useState('');
  const [newUserShopName, setNewUserShopName] = useState('');
  const [forgotMobile, setForgotMobile] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');

  const resetForgotLocal = () => {
    setForgotMobile('');
    setForgotOtp('');
  };

  const resetNewUserLocal = () => {
    setNewUserMobile('');
    setNewUserOtp('');
    setNewUserShopName('');
  };

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    const digits = normalizeMobileDigits(loginMobile);
    if (digits.length !== 10) {
      toast.error(t('auth.toast_invalid_mobile'));
      return;
    }
    if (!isFourDigitCode(loginMpin)) {
      toast.error(t('auth.toast_invalid_mpin'));
      return;
    }
    if (!hasCompleteAccount()) {
      toast.error(t('auth.toast_no_account'));
      return;
    }
    const ok = loginWithMpin(digits, loginMpin);
    if (!ok) {
      toast.error(t('auth.toast_login_failed'));
    }
  };

  const handleNewUserSendOtp = () => {
    const digits = normalizeMobileDigits(newUserMobile);
    if (digits.length !== 10) {
      toast.error(t('auth.toast_invalid_mobile'));
      return;
    }
    toast.success(t('auth.toast_otp_sent'));
    setNewUserOtp('');
    setStep('newUser_otp');
  };

  const handleNewUserVerifyOtp = () => {
    if (!isFourDigitCode(newUserOtp)) {
      toast.error(t('auth.toast_invalid_otp'));
      return;
    }
    toast.success(t('auth.toast_otp_verified'));
    setStep('newUser_shop');
  };

  const handleNewUserGoDashboard = () => {
    const name = newUserShopName.trim();
    if (!name) {
      toast.error(t('auth.toast_shop_name_required'));
      return;
    }
    const digits = normalizeMobileDigits(newUserMobile);
    registerNewUser(digits, name);
    resetNewUserLocal();
    setLoginMobile('');
    setLoginMpin('');
  };

  const handleForgotSendOtp = () => {
    const digits = normalizeMobileDigits(forgotMobile);
    if (digits.length !== 10) {
      toast.error(t('auth.toast_invalid_mobile'));
      return;
    }
    if (!isRegisteredMobile(digits)) {
      toast.error(t('auth.toast_forgot_unknown_mobile'));
      return;
    }
    toast.success(t('auth.toast_otp_sent'));
    setForgotOtp('');
    setStep('forgot_otp');
  };

  const handleForgotVerifyOtp = () => {
    if (!isFourDigitCode(forgotOtp)) {
      toast.error(t('auth.toast_invalid_otp'));
      return;
    }
    const digits = normalizeMobileDigits(forgotMobile);
    const ok = completeForgotMpin(digits);
    if (!ok) {
      toast.error(t('auth.toast_forgot_unknown_mobile'));
      return;
    }
    setStep('forgot_success');
  };

  const handleForgotContinueToLogin = () => {
    resetForgotLocal();
    setStep('login');
  };

  const goLoginFromNewUser = () => {
    resetNewUserLocal();
    setStep('login');
  };

  const goLoginFromForgotPhone = () => {
    resetForgotLocal();
    setStep('login');
  };

  const loginHeader = (
    <div className="mb-6 flex items-start gap-4 border-b border-gray-100 pb-6">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 text-white shadow-lg shadow-green-900/25">
        <Store className="h-7 w-7" strokeWidth={1.5} aria-hidden />
      </div>
      <div className="min-w-0 pt-0.5">
        <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">{t('auth.login_title')}</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{t('auth.login_subtitle')}</p>
      </div>
    </div>
  );

  return (
    <AuthChrome
      footerLabel={t('auth.brand_footer')}
      header={step === 'login' ? loginHeader : step === 'forgot_success' ? null : undefined}
    >
      {step === 'login' && (
        <form onSubmit={handleLoginSubmit} className="space-y-5">
          <div>
            <label htmlFor="auth-login-mobile" className={fieldLabelClass}>
              {t('auth.field_mobile')}
            </label>
            <div className="relative">
              <Phone
                className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                aria-hidden
              />
              <input
                id="auth-login-mobile"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder={t('auth.placeholder_mobile')}
                value={loginMobile}
                onChange={(e) => setLoginMobile(e.target.value)}
                className={`${textInputClass} pl-11`}
              />
            </div>
          </div>
          <div>
            <span className={fieldLabelClass}>{t('auth.field_mpin')}</span>
            <FourDigitInput value={loginMpin} onChange={setLoginMpin} />
            <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-600 ring-1 ring-gray-100">
              {t('auth.login_mpin_hint')}
            </p>
          </div>
          <button type="submit" className={primaryButtonClass}>
            {t('auth.login_submit')}
          </button>
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50/80 p-1">
            <button
              type="button"
              onClick={() => {
                setForgotMobile(loginMobile);
                setStep('forgot_mobile');
              }}
              className={secondaryLinkClass}
            >
              <KeyRound className="h-4 w-4 opacity-80" aria-hidden />
              {t('auth.link_forgot_mpin')}
            </button>
            <div className="mx-3 h-px bg-gray-200/90" />
            <button
              type="button"
              onClick={() => {
                setNewUserMobile(loginMobile);
                setStep('newUser_mobile');
              }}
              className={secondaryLinkClass}
            >
              <UserPlus className="h-4 w-4 opacity-80" aria-hidden />
              {t('auth.link_new_user')}
            </button>
          </div>
        </form>
      )}

      {step === 'newUser_mobile' && (
        <div>
          <AuthBackButton label={t('auth.back_to_login')} onClick={goLoginFromNewUser} />
          <StepIcon icon={UserPlus} />
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">{t('auth.new_user_title')}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{t('auth.new_user_subtitle')}</p>
          </div>
          <div className="space-y-5">
            <div>
              <label htmlFor="auth-new-mobile" className={fieldLabelClass}>
                {t('auth.field_mobile')}
              </label>
              <div className="relative">
                <Phone
                  className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                  aria-hidden
                />
                <input
                  id="auth-new-mobile"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder={t('auth.placeholder_mobile')}
                  value={newUserMobile}
                  onChange={(e) => setNewUserMobile(e.target.value)}
                  className={`${textInputClass} pl-11`}
                />
              </div>
            </div>
            <button type="button" onClick={handleNewUserSendOtp} className={primaryButtonClass}>
              {t('auth.send_otp')}
            </button>
          </div>
        </div>
      )}

      {step === 'newUser_otp' && (
        <div>
          <AuthBackButton label={t('auth.back')} onClick={() => setStep('newUser_mobile')} />
          <StepIcon icon={Shield} />
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">{t('auth.verify_otp_title')}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{t('auth.verify_otp_hint')}</p>
          </div>
          <div className="space-y-5">
            <div>
              <span className={fieldLabelClass}>{t('auth.field_otp')}</span>
              <FourDigitInput value={newUserOtp} onChange={setNewUserOtp} />
            </div>
            <button type="button" onClick={handleNewUserVerifyOtp} className={primaryButtonClass}>
              {t('auth.verify_otp')}
            </button>
          </div>
        </div>
      )}

      {step === 'newUser_shop' && (
        <div>
          <StepIcon icon={Store} />
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">{t('auth.shop_name_title')}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{t('auth.shop_name_subtitle')}</p>
          </div>
          <div className="space-y-5">
            <div>
              <label htmlFor="auth-shop-name" className={fieldLabelClass}>
                {t('auth.field_shop_name')}
              </label>
              <div className="relative">
                <Store
                  className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                  aria-hidden
                />
                <input
                  id="auth-shop-name"
                  type="text"
                  autoComplete="organization"
                  placeholder={t('auth.placeholder_shop_name')}
                  value={newUserShopName}
                  onChange={(e) => setNewUserShopName(e.target.value)}
                  className={`${textInputClass} pl-11`}
                />
              </div>
            </div>
            <button type="button" onClick={handleNewUserGoDashboard} className={primaryButtonClass}>
              {t('auth.go_dashboard')}
            </button>
          </div>
        </div>
      )}

      {step === 'forgot_mobile' && (
        <div>
          <AuthBackButton label={t('auth.back_to_login')} onClick={goLoginFromForgotPhone} />
          <StepIcon icon={KeyRound} variant="amber" />
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">{t('auth.forgot_title')}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{t('auth.forgot_subtitle')}</p>
          </div>
          <div className="space-y-5">
            <div>
              <label htmlFor="auth-forgot-mobile" className={fieldLabelClass}>
                {t('auth.field_mobile')}
              </label>
              <div className="relative">
                <Phone
                  className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                  aria-hidden
                />
                <input
                  id="auth-forgot-mobile"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder={t('auth.placeholder_mobile')}
                  value={forgotMobile}
                  onChange={(e) => setForgotMobile(e.target.value)}
                  className={`${textInputClass} pl-11`}
                />
              </div>
            </div>
            <button type="button" onClick={handleForgotSendOtp} className={primaryButtonClass}>
              {t('auth.send_otp')}
            </button>
          </div>
        </div>
      )}

      {step === 'forgot_otp' && (
        <div>
          <AuthBackButton label={t('auth.back')} onClick={() => setStep('forgot_mobile')} />
          <StepIcon icon={Shield} variant="amber" />
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">{t('auth.verify_otp_title')}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{t('auth.verify_otp_hint')}</p>
          </div>
          <div className="space-y-5">
            <div>
              <span className={fieldLabelClass}>{t('auth.field_otp')}</span>
              <FourDigitInput value={forgotOtp} onChange={setForgotOtp} />
            </div>
            <button type="button" onClick={handleForgotVerifyOtp} className={primaryButtonClass}>
              {t('auth.verify_otp')}
            </button>
          </div>
        </div>
      )}

      {step === 'forgot_success' && (
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-b from-emerald-50 to-green-100 ring-4 ring-green-500/15">
            <CheckCircle2 className="h-10 w-10 text-green-600" strokeWidth={1.75} aria-hidden />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">{t('auth.forgot_success_title')}</h2>
          <p className="mx-auto mt-3 max-w-[280px] text-sm leading-relaxed text-gray-600">{t('auth.forgot_success_body')}</p>
          <button
            type="button"
            onClick={handleForgotContinueToLogin}
            className={`${primaryButtonClass} mt-8`}
          >
            {t('auth.forgot_back_login')}
          </button>
        </div>
      )}
    </AuthChrome>
  );
}
