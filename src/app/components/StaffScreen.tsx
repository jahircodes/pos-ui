/**
 * Staff list UI (StaffPanel) plus shared primitives (Modal, Button) for shop/staff flows.
 */
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MoreVertical, Trash2, UserPlus2, Users, X } from 'lucide-react';
import { HubListEntityIcon } from './HubListEntityIcon';

export type StaffRole = 'admin' | 'staff';

export interface StaffMember {
  staffId: string;
  name: string;
  mobileNumber: string;
  role: StaffRole;
  /** When false, staff cannot sign in or bill (slot still counts toward limit). */
  isActive: boolean;
}

/** Controlled staff list for the active shop (or standalone screen). */
export interface StaffPanelProps {
  staffList: StaffMember[];
  onStaffListChange: (nextList: StaffMember[]) => void;
  activeShopName?: string;
  onBack?: () => void;
}

interface StaffCardProps {
  staffMember: StaffMember;
  isMenuOpen: boolean;
  onOpenEdit: (staffMember: StaffMember) => void;
  onOpenRemove: (staffMember: StaffMember) => void;
  onToggleActive: (staffMember: StaffMember) => void;
  onToggleMenu: () => void;
}

interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
  disabled?: boolean;
}

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

interface StaffFormModalProps {
  isOpen: boolean;
  initialStaffMember: StaffMember | null;
  onClose: () => void;
  onSave: (staffMemberInput: Omit<StaffMember, 'staffId'>, editingStaffId?: string) => void;
}

interface RemoveStaffModalProps {
  isOpen: boolean;
  selectedStaffMember: StaffMember | null;
  onCancel: () => void;
  onConfirm: () => void;
}

const STAFF_LIMIT = 3;

/** Admins are kept in parent state but never listed under Business → Staff */
export function isStaffMemberHiddenFromShopList(member: StaffMember): boolean {
  return String(member.role ?? '').toLowerCase() === 'admin';
}

/**
 * Renders the staff list, add/edit form modal, and remove confirmation for one shop.
 */
export function StaffPanel({ staffList, onStaffListChange, activeShopName, onBack }: StaffPanelProps) {
  const { t } = useTranslation();
  const [activeMenuStaffId, setActiveMenuStaffId] = useState('');
  const [isStaffFormOpen, setIsStaffFormOpen] = useState(false);
  const [editingStaffMember, setEditingStaffMember] = useState<StaffMember | null>(null);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedStaffMember, setSelectedStaffMember] = useState<StaffMember | null>(null);

  const visibleStaffList = useMemo(
    () => staffList.filter((member) => !isStaffMemberHiddenFromShopList(member)),
    [staffList],
  );

  const usedStaffCount = visibleStaffList.length;
  const usageProgressPercent = Math.min((usedStaffCount / STAFF_LIMIT) * 100, 100);

  useEffect(() => {
    if (!activeMenuStaffId) {
      return;
    }

    const handleCloseMenuOnOutsideClick = () => {
      setActiveMenuStaffId('');
    };

    window.addEventListener('click', handleCloseMenuOnOutsideClick);
    return () => {
      window.removeEventListener('click', handleCloseMenuOnOutsideClick);
    };
  }, [activeMenuStaffId]);

  const isAddDisabled = useMemo(() => usedStaffCount >= STAFF_LIMIT, [usedStaffCount]);

  const handleOpenAddStaff = () => {
    if (isAddDisabled) {
      return;
    }
    setEditingStaffMember(null);
    setIsStaffFormOpen(true);
  };

  const handleOpenEditStaff = (staffMember: StaffMember) => {
    setActiveMenuStaffId('');
    setEditingStaffMember(staffMember);
    setIsStaffFormOpen(true);
  };

  const handleOpenRemoveStaff = (staffMember: StaffMember) => {
    setActiveMenuStaffId('');
    setSelectedStaffMember(staffMember);
    setIsRemoveModalOpen(true);
  };

  const handleSaveStaff = (staffMemberInput: Omit<StaffMember, 'staffId'>, editingStaffId?: string) => {
    if (editingStaffId) {
      onStaffListChange(
        staffList.map((staffMember) =>
          staffMember.staffId === editingStaffId ? { ...staffMember, ...staffMemberInput } : staffMember
        )
      );
      return;
    }

    const newStaffMember: StaffMember = {
      staffId: `staff-${Date.now()}`,
      ...staffMemberInput,
      isActive: staffMemberInput.isActive ?? true,
    };
    onStaffListChange([...staffList, newStaffMember]);
  };

  const handleConfirmRemoveStaff = () => {
    if (!selectedStaffMember) {
      return;
    }

    onStaffListChange(
      staffList.filter((staffMember) => staffMember.staffId !== selectedStaffMember.staffId)
    );
    setIsRemoveModalOpen(false);
    setSelectedStaffMember(null);
  };

  const handleToggleStaffActive = (staffMember: StaffMember) => {
    setActiveMenuStaffId('');
    onStaffListChange(
      staffList.map((member) =>
        member.staffId === staffMember.staffId ? { ...member, isActive: !member.isActive } : member
      )
    );
  };

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col bg-gray-50 ${
        visibleStaffList.length > 0 ? 'pb-24' : 'pb-20'
      }`}
    >
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label={t('common.go_back')}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 active:bg-gray-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : null}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('staff.title')}</h1>
              <p className="text-sm text-gray-500">
                {t('staff.usage', { count: usedStaffCount, limit: STAFF_LIMIT })}
                {activeShopName ? t('staff.usage_shop_suffix', { shop: activeShopName }) : ''}
              </p>
            </div>
          </div>
        </div>
        <div className="px-4 pb-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-green-600 transition-all"
              style={{ width: `${usageProgressPercent}%` }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {visibleStaffList.length === 0 ? (
          <div className="mt-16 flex flex-col items-center rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center shadow-sm">
            <Users className="mb-3 h-12 w-12 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">{t('staff.no_staff_title')}</h2>
            <p className="mt-1 text-sm text-gray-500">{t('staff.no_staff_hint')}</p>
            <Button
              label={t('staff.add_staff')}
              icon={UserPlus2}
              onClick={handleOpenAddStaff}
              className="mt-4 w-full sm:w-auto"
            />
          </div>
        ) : (
          <div className="space-y-3">
            {visibleStaffList.map((staffMember) => (
              <StaffCard
                key={staffMember.staffId}
                staffMember={staffMember}
                isMenuOpen={activeMenuStaffId === staffMember.staffId}
                onToggleMenu={() =>
                  setActiveMenuStaffId((currentStaffId) =>
                    currentStaffId === staffMember.staffId ? '' : staffMember.staffId
                  )
                }
                onOpenEdit={handleOpenEditStaff}
                onOpenRemove={handleOpenRemoveStaff}
                onToggleActive={handleToggleStaffActive}
              />
            ))}
          </div>
        )}
      </main>

      {visibleStaffList.length > 0 ? (
        <div className="fixed bottom-20 left-0 right-0 px-4">
          <Button
            label={t('staff.add_staff_fab')}
            onClick={handleOpenAddStaff}
            className="w-full shadow-lg"
            variant="primary"
          />
        </div>
      ) : null}

      <StaffFormModal
        isOpen={isStaffFormOpen}
        initialStaffMember={editingStaffMember}
        onClose={() => {
          setIsStaffFormOpen(false);
          setEditingStaffMember(null);
        }}
        onSave={handleSaveStaff}
      />

      <RemoveStaffModal
        isOpen={isRemoveModalOpen}
        selectedStaffMember={selectedStaffMember}
        onCancel={() => {
          setIsRemoveModalOpen(false);
          setSelectedStaffMember(null);
        }}
        onConfirm={handleConfirmRemoveStaff}
      />
    </div>
  );
}

/**
 * Renders one touch-friendly staff row card with quick action menu.
 */
export function StaffCard({
  staffMember,
  isMenuOpen,
  onOpenEdit,
  onOpenRemove,
  onToggleActive,
  onToggleMenu,
}: StaffCardProps) {
  const { t } = useTranslation();
  const isStaffActive = staffMember.isActive;

  return (
    <div
      className={`relative rounded-xl border p-3 shadow-sm ${
        isStaffActive
          ? 'border-gray-100 bg-white'
          : 'border-gray-200 bg-gray-50/90 opacity-95'
      }`}
    >
      <button
        type="button"
        onClick={() => onOpenEdit(staffMember)}
        className="flex w-full items-center gap-3 rounded-xl p-1 text-left active:bg-gray-50/80"
      >
        <HubListEntityIcon kind="staff" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={`truncate text-base font-semibold ${
                isStaffActive ? 'text-gray-900' : 'text-gray-600'
              }`}
            >
              {staffMember.name}
            </p>
            <StaffStatusBadge isActive={isStaffActive} />
          </div>
          <p className="text-sm text-gray-500">{staffMember.mobileNumber}</p>
        </div>
      </button>

      <button
        type="button"
        aria-label={t('staff.aria_staff_actions')}
        onClick={(event) => {
          event.stopPropagation();
          onToggleMenu();
        }}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 active:bg-gray-200"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isMenuOpen ? (
        <div
          className="absolute right-3 top-14 z-10 min-w-36 rounded-xl border border-gray-100 bg-white p-1 shadow-md"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onOpenEdit(staffMember)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 active:bg-gray-100"
          >
            {t('common.edit')}
          </button>
          <button
            type="button"
            onClick={() => onToggleActive(staffMember)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 active:bg-gray-100"
          >
            {isStaffActive ? t('staff.disable_staff') : t('staff.activate_staff')}
          </button>
          <button
            type="button"
            onClick={() => onOpenRemove(staffMember)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 active:bg-red-50"
          >
            {t('common.remove')}
          </button>
        </div>
      ) : null}
    </div>
  );
}

interface StaffStatusBadgeProps {
  isActive: boolean;
}

/** Compact active / disabled label for staff rows */
export function StaffStatusBadge({ isActive }: StaffStatusBadgeProps) {
  const { t } = useTranslation();
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-100 text-amber-800'
      }`}
    >
      {isActive ? t('staff.status_active') : t('staff.status_disabled')}
    </span>
  );
}

/**
 * Renders a reusable button style used across staff UI.
 */
export function Button({
  label,
  variant = 'primary',
  icon: Icon,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
}: ButtonProps) {
  const variantClassName =
    variant === 'secondary'
      ? 'border border-gray-200 bg-white text-gray-700 active:bg-gray-50'
      : variant === 'danger'
        ? 'bg-red-500 text-white active:bg-red-600'
        : 'bg-green-600 text-white active:bg-green-700';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${variantClassName} ${className}`}
    >
      {Icon ? <Icon className="h-5 w-5" /> : null}
      <span>{label}</span>
    </button>
  );
}

/**
 * Renders a shared bottom-sheet modal container for staff forms and confirmations.
 */
export function Modal({ isOpen, title, children, onClose }: ModalProps) {
  const { t } = useTranslation();
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full rounded-t-3xl bg-white p-4 shadow-xl sm:max-w-md sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close_modal')}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 active:bg-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/**
 * Renders add/edit staff modal: add flow uses password fields and fixed staff role;
 * edit flow updates name and mobile only.
 */
function StaffFormModal({ isOpen, initialStaffMember, onClose, onSave }: StaffFormModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMismatchMessage, setPasswordMismatchMessage] = useState('');

  const isAddMode = !initialStaffMember;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setName(initialStaffMember?.name ?? '');
    setMobileNumber(initialStaffMember?.mobileNumber ?? '');
    setPassword('');
    setConfirmPassword('');
    setPasswordMismatchMessage('');
  }, [isOpen, initialStaffMember]);

  const isSaveDisabled = isAddMode
    ? !name.trim() || !mobileNumber.trim() || !password || !confirmPassword
    : !name.trim() || !mobileNumber.trim();

  return (
    <Modal
      isOpen={isOpen}
      title={initialStaffMember ? t('staff.modal_edit') : t('staff.modal_add')}
      onClose={onClose}
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (isSaveDisabled) {
            return;
          }

          if (isAddMode) {
            if (password !== confirmPassword) {
              setPasswordMismatchMessage(t('staff.password_mismatch'));
              return;
            }
            setPasswordMismatchMessage('');
          }

          onSave(
            {
              name: name.trim(),
              mobileNumber: mobileNumber.trim(),
              role: isAddMode ? 'staff' : initialStaffMember.role,
              isActive: isAddMode ? true : initialStaffMember.isActive,
            },
            initialStaffMember?.staffId
          );
          onClose();
        }}
      >
        <div>
          <label htmlFor="staff-name" className="mb-1 block text-sm font-medium text-gray-700">
            {t('staff.field_name')}
          </label>
          <input
            id="staff-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('staff.placeholder_name')}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-green-500"
          />
        </div>

        <div>
          <label htmlFor="staff-mobile-number" className="mb-1 block text-sm font-medium text-gray-700">
            {t('staff.field_mobile')}
          </label>
          <input
            id="staff-mobile-number"
            type="tel"
            value={mobileNumber}
            onChange={(event) => setMobileNumber(event.target.value)}
            placeholder={t('staff.placeholder_mobile')}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-green-500"
          />
        </div>

        {isAddMode ? (
          <>
            <div>
              <label htmlFor="staff-password" className="mb-1 block text-sm font-medium text-gray-700">
                {t('staff.field_password')}
              </label>
              <input
                id="staff-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setPasswordMismatchMessage('');
                }}
                placeholder={t('staff.placeholder_password')}
                autoComplete="new-password"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label htmlFor="staff-confirm-password" className="mb-1 block text-sm font-medium text-gray-700">
                {t('staff.field_confirm_password')}
              </label>
              <input
                id="staff-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setPasswordMismatchMessage('');
                }}
                placeholder={t('staff.placeholder_confirm_password')}
                autoComplete="new-password"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-green-500"
              />
            </div>
            {passwordMismatchMessage ? (
              <p className="text-sm text-red-600" role="alert">
                {passwordMismatchMessage}
              </p>
            ) : null}
          </>
        ) : null}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button label={t('common.cancel')} variant="secondary" onClick={onClose} />
          <Button label={t('common.save')} type="submit" disabled={isSaveDisabled} />
        </div>
      </form>
    </Modal>
  );
}

/**
 * Renders remove confirmation modal for destructive action.
 */
function RemoveStaffModal({ isOpen, selectedStaffMember, onCancel, onConfirm }: RemoveStaffModalProps) {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} title={t('staff.remove_title')} onClose={onCancel}>
      <p className="text-sm text-gray-600">
        {t('staff.remove_confirm')}
        {selectedStaffMember ? t('staff.remove_name_suffix', { name: selectedStaffMember.name }) : ''}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button label={t('common.cancel')} variant="secondary" onClick={onCancel} />
        <Button label={t('common.remove')} variant="danger" icon={Trash2} onClick={onConfirm} />
      </div>
    </Modal>
  );
}
