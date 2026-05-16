/**
 * Subscription plans list and upgrade selection (demo UI).
 */
import { useTranslation } from 'react-i18next';
import { Check, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore, type SubscriptionPlanId } from '../authStore';
import { SUBSCRIPTION_PLANS } from '../settingsPlans';
import { Badge, SettingsCard } from './SettingsScreen';
import { SettingsSubScreenLayout } from './SettingsSubScreenLayout';

interface PlansSettingsScreenProps {
  onBack: () => void;
}

export function PlansSettingsScreen({ onBack }: PlansSettingsScreenProps) {
  const { t, i18n } = useTranslation();
  const activePlanId = useAuthStore((s) => s.activePlanId);
  const subscriptionEndDate = useAuthStore((s) => s.subscriptionEndDate);
  const setActivePlan = useAuthStore((s) => s.setActivePlan);

  const activePlan = SUBSCRIPTION_PLANS.find((p) => p.id === activePlanId) ?? SUBSCRIPTION_PLANS[1];
  const locale = i18n.language.startsWith('ta') ? 'ta-IN' : 'en-IN';

  const formatEndDate = (iso: string) => {
    if (!iso) return t('settings.plan_no_expiry');
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleSelectPlan = (planId: SubscriptionPlanId) => {
    if (planId === activePlanId) return;
    setActivePlan(planId);
    toast.success(t('settings.toast_plan_updated'));
  };

  return (
    <SettingsSubScreenLayout title={t('settings.plans_title')} onBack={onBack}>
      <div className="space-y-4">
        <SettingsCard>
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <Crown className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-semibold text-gray-900">{t(activePlan.nameKey)}</p>
                <Badge label={t('settings.badge_active')} variant="success" />
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {t('settings.plan_valid_until', { date: formatEndDate(subscriptionEndDate) })}
              </p>
            </div>
          </div>
        </SettingsCard>

        <p className="text-sm font-medium text-gray-700">{t('settings.plans_available')}</p>

        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrent = plan.id === activePlanId;
          const priceLabel =
            plan.priceInr === 0
              ? t('settings.plan_price_free')
              : t('settings.plan_price_per_month', { price: plan.priceInr });

          return (
            <SettingsCard key={plan.id}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-bold text-gray-900">{t(plan.nameKey)}</p>
                      {plan.isPopular ? (
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800">
                          {t('settings.plan_popular')}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-sm font-semibold text-green-700">{priceLabel}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {t('settings.plan_limits', {
                        products: plan.maxProducts,
                        staff: plan.maxStaff,
                      })}
                    </p>
                  </div>
                  {isCurrent ? (
                    <span className="shrink-0 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                      {t('settings.plan_current')}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSelectPlan(plan.id)}
                      className="shrink-0 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white active:bg-green-700"
                    >
                      {plan.priceInr === 0 ? t('settings.plan_switch') : t('settings.plan_upgrade')}
                    </button>
                  )}
                </div>
                <ul className="space-y-2 border-t border-gray-100 pt-3">
                  {plan.featureKeys.map((featureKey) => (
                    <li key={featureKey} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      <span>{t(featureKey)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </SettingsCard>
          );
        })}

        <p className="text-center text-xs text-gray-500">{t('settings.plans_billing_note')}</p>
      </div>
    </SettingsSubScreenLayout>
  );
}
