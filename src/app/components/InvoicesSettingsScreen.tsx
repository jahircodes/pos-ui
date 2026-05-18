/**
 * Subscription billing invoices list (demo UI until payment API is wired).
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { SUBSCRIPTION_INVOICES, type SubscriptionInvoice } from '../settingsInvoices';
import { Badge, SettingsCard } from './SettingsScreen';
import { SettingsSubScreenLayout } from './SettingsSubScreenLayout';

interface InvoicesSettingsScreenProps {
  onBack: () => void;
}

export function InvoicesSettingsScreen({ onBack }: InvoicesSettingsScreenProps) {
  const { t, i18n } = useTranslation();
  const [selectedInvoice, setSelectedInvoice] = useState<SubscriptionInvoice | null>(null);
  const locale = i18n.language.startsWith('ta') ? 'ta-IN' : 'en-IN';

  const formatInvoiceDate = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatAmount = (amountInr: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
      amountInr,
    );

  const handleDownload = () => {
    toast.info(t('settings.invoices_download_coming'));
  };

  if (selectedInvoice) {
    return (
      <SettingsSubScreenLayout title={t('settings.invoices_detail_title')} onBack={() => setSelectedInvoice(null)}>
        <InvoiceDetailView
          invoice={selectedInvoice}
          formatInvoiceDate={formatInvoiceDate}
          formatAmount={formatAmount}
          onDownload={handleDownload}
        />
      </SettingsSubScreenLayout>
    );
  }

  return (
    <SettingsSubScreenLayout title={t('settings.invoices_title')} onBack={onBack}>
      <InvoiceListView
        invoices={SUBSCRIPTION_INVOICES}
        formatInvoiceDate={formatInvoiceDate}
        formatAmount={formatAmount}
        onSelect={setSelectedInvoice}
      />
    </SettingsSubScreenLayout>
  );
}

interface InvoiceListViewProps {
  invoices: SubscriptionInvoice[];
  formatInvoiceDate: (iso: string) => string;
  formatAmount: (amountInr: number) => string;
  onSelect: (invoice: SubscriptionInvoice) => void;
}

/** Renders invoice rows or an empty state when there is no billing history. */
function InvoiceListView({ invoices, formatInvoiceDate, formatAmount, onSelect }: InvoiceListViewProps) {
  const { t } = useTranslation();

  if (invoices.length === 0) {
    return (
      <SettingsCard>
        <EmptyInvoicesState />
      </SettingsCard>
    );
  }

  return (
    <InvoiceListContent
      invoices={invoices}
      formatInvoiceDate={formatInvoiceDate}
      formatAmount={formatAmount}
      onSelect={onSelect}
    />
  );
}

function EmptyInvoicesState() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500">
        <FileText className="h-7 w-7" />
      </div>
      <p className="text-base font-semibold text-gray-900">{t('settings.invoices_empty_title')}</p>
      <p className="max-w-xs text-sm text-gray-500">{t('settings.invoices_empty_desc')}</p>
    </div>
  );
}

function InvoiceListContent({
  invoices,
  formatInvoiceDate,
  formatAmount,
  onSelect,
}: InvoiceListViewProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">{t('settings.invoices_subtitle')}</p>
      <div className="space-y-3">
        {invoices.map((invoice) => (
          <SettingsCard key={invoice.id}>
            <button
              type="button"
              onClick={() => onSelect(invoice)}
              className="flex w-full items-center gap-3 text-left active:opacity-80"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                <FileText className="h-5 w-5" />
              </div>
              <InvoiceRowSummary
                invoice={invoice}
                formatInvoiceDate={formatInvoiceDate}
                formatAmount={formatAmount}
              />
            </button>
          </SettingsCard>
        ))}
      </div>
      <p className="text-center text-xs text-gray-500">{t('settings.invoices_billing_note')}</p>
    </div>
  );
}

interface InvoiceRowSummaryProps {
  invoice: SubscriptionInvoice;
  formatInvoiceDate: (iso: string) => string;
  formatAmount: (amountInr: number) => string;
}

function InvoiceRowSummary({ invoice, formatInvoiceDate, formatAmount }: InvoiceRowSummaryProps) {
  const { t } = useTranslation();
  const statusVariant = invoice.status === 'paid' ? 'success' : 'warning';
  const statusLabel =
    invoice.status === 'paid' ? t('settings.invoice_status_paid') : t('settings.invoice_status_pending');

  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-base font-semibold text-gray-900">{t(invoice.planNameKey)}</p>
        <Badge label={statusLabel} variant={statusVariant} />
      </div>
      <p className="text-sm text-gray-500">{formatInvoiceDate(invoice.issuedAt)}</p>
      <p className="mt-0.5 text-sm font-semibold text-gray-800">{formatAmount(invoice.amountInr)}</p>
      <p className="text-xs text-gray-400">{invoice.invoiceNumber}</p>
    </div>
  );
}

interface InvoiceDetailViewProps {
  invoice: SubscriptionInvoice;
  formatInvoiceDate: (iso: string) => string;
  formatAmount: (amountInr: number) => string;
  onDownload: () => void;
}

/** Shows a single subscription invoice summary with a demo download action. */
function InvoiceDetailView({ invoice, formatInvoiceDate, formatAmount, onDownload }: InvoiceDetailViewProps) {
  const { t } = useTranslation();
  const statusVariant = invoice.status === 'paid' ? 'success' : 'warning';
  const statusLabel =
    invoice.status === 'paid' ? t('settings.invoice_status_paid') : t('settings.invoice_status_pending');

  return (
    <div className="space-y-4">
      <SettingsCard>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-lg font-bold text-gray-900">{t(invoice.planNameKey)}</p>
              <p className="mt-1 text-sm text-gray-500">{invoice.invoiceNumber}</p>
            </div>
            <Badge label={statusLabel} variant={statusVariant} />
          </div>
          <dl className="space-y-3 border-t border-gray-100 pt-3 text-sm">
            <InvoiceDetailRow label={t('settings.invoice_field_number')} value={invoice.invoiceNumber} />
            <InvoiceDetailRow label={t('settings.invoice_field_date')} value={formatInvoiceDate(invoice.issuedAt)} />
            <InvoiceDetailRow label={t('settings.invoice_field_plan')} value={t(invoice.planNameKey)} />
            <InvoiceDetailRow label={t('settings.invoice_field_amount')} value={formatAmount(invoice.amountInr)} />
          </dl>
        </div>
      </SettingsCard>
      <button
        type="button"
        onClick={onDownload}
        className="w-full rounded-xl border border-gray-200 bg-white py-3.5 text-base font-semibold text-gray-800 active:bg-gray-50"
      >
        {t('settings.invoices_download')}
      </button>
    </div>
  );
}

function InvoiceDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{value}</dd>
    </div>
  );
}
