/**
 * Demo subscription billing invoices (aligns with future subscription_invoices API).
 */
import type { PlanId } from './settingsPlans';

export type SubscriptionInvoiceStatus = 'paid' | 'pending';

export interface SubscriptionInvoice {
  id: string;
  invoiceNumber: string;
  planId: PlanId;
  planNameKey: string;
  amountInr: number;
  issuedAt: string;
  status: SubscriptionInvoiceStatus;
}

/** Sample paid invoices for subscription billing history UI. */
export const SUBSCRIPTION_INVOICES: SubscriptionInvoice[] = [
  {
    id: 'inv-2026-04',
    invoiceNumber: 'SUB-2026-04-001',
    planId: 'pro',
    planNameKey: 'settings.plan_pro_name',
    amountInr: 499,
    issuedAt: '2026-04-01',
    status: 'paid',
  },
  {
    id: 'inv-2026-03',
    invoiceNumber: 'SUB-2026-03-001',
    planId: 'pro',
    planNameKey: 'settings.plan_pro_name',
    amountInr: 499,
    issuedAt: '2026-03-01',
    status: 'paid',
  },
  {
    id: 'inv-2026-02',
    invoiceNumber: 'SUB-2026-02-001',
    planId: 'pro',
    planNameKey: 'settings.plan_pro_name',
    amountInr: 499,
    issuedAt: '2026-02-01',
    status: 'paid',
  },
];
