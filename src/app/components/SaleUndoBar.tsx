/**
 * Post-sale undo affordance: countdown and action to reverse the last transaction.
 */
import { useTranslation } from 'react-i18next';

interface SaleUndoBarProps {
  secondsLeft: number;
  onUndo: () => void;
}

export function SaleUndoBar({ secondsLeft, onUndo }: SaleUndoBarProps) {
  const { t } = useTranslation();

  return (
    <div
      className="pointer-events-auto fixed bottom-16 left-0 right-0 z-[60] border-t border-gray-200 bg-gray-900 px-4 py-3 text-white shadow-lg"
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <p className="min-w-0 flex-1 text-sm font-medium">
          {t('sales.undo_sale_message', { seconds: secondsLeft })}
        </p>
        <button
          type="button"
          onClick={onUndo}
          className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 active:bg-gray-100"
        >
          {t('sales.undo')}
        </button>
      </div>
    </div>
  );
}
