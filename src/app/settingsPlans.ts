/**
 * Demo subscription plans aligned with subscription_plans / subscriptions schema.
 */
export type PlanId = 'starter' | 'pro' | 'business';

export interface SubscriptionPlan {
  id: PlanId;
  nameKey: string;
  priceInr: number;
  maxProducts: number;
  maxStaff: number;
  featureKeys: string[];
  isPopular?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    nameKey: 'settings.plan_starter_name',
    priceInr: 0,
    maxProducts: 50,
    maxStaff: 2,
    featureKeys: [
      'settings.plan_feature_sell',
      'settings.plan_feature_inventory',
      'settings.plan_feature_history',
    ],
  },
  {
    id: 'pro',
    nameKey: 'settings.plan_pro_name',
    priceInr: 499,
    maxProducts: 500,
    maxStaff: 10,
    isPopular: true,
    featureKeys: [
      'settings.plan_feature_sell',
      'settings.plan_feature_inventory',
      'settings.plan_feature_history',
      'settings.plan_feature_alerts',
      'settings.plan_feature_export',
    ],
  },
  {
    id: 'business',
    nameKey: 'settings.plan_business_name',
    priceInr: 999,
    maxProducts: 5000,
    maxStaff: 50,
    featureKeys: [
      'settings.plan_feature_sell',
      'settings.plan_feature_inventory',
      'settings.plan_feature_history',
      'settings.plan_feature_alerts',
      'settings.plan_feature_export',
      'settings.plan_feature_multi_shop',
    ],
  },
];
