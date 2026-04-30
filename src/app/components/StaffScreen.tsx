/**
 * Mobile-first staff management UI for adding, editing, and removing staff members.
 */
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronDown, MoreVertical, Trash2, UserPlus2, Users, X } from 'lucide-react';

type StaffRole = 'admin' | 'staff';

interface StaffMember {
  staffId: string;
  name: string;
  mobileNumber: string;
  role: StaffRole;
}

interface StaffScreenProps {
  onBack?: () => void;
}

interface StaffCardProps {
  staffMember: StaffMember;
  isMenuOpen: boolean;
  onOpenEdit: (staffMember: StaffMember) => void;
  onOpenRemove: (staffMember: StaffMember) => void;
  onToggleMenu: () => void;
}

interface AvatarProps {
  name: string;
}

interface RoleBadgeProps {
  role: StaffRole;
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

/**
 * Renders the staff list, add/edit form modal, and remove confirmation.
 */
export function StaffScreen({ onBack }: StaffScreenProps) {
  const [staffList, setStaffList] = useState<StaffMember[]>([
    { staffId: 'staff-1', name: 'Ravi Kumar', mobileNumber: '9876543210', role: 'admin' },
    { staffId: 'staff-2', name: 'Neha Singh', mobileNumber: '9123456780', role: 'staff' },
  ]);
  const [activeMenuStaffId, setActiveMenuStaffId] = useState('');
  const [isStaffFormOpen, setIsStaffFormOpen] = useState(false);
  const [editingStaffMember, setEditingStaffMember] = useState<StaffMember | null>(null);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedStaffMember, setSelectedStaffMember] = useState<StaffMember | null>(null);

  const usedStaffCount = staffList.length;
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
      setStaffList((previousList) =>
        previousList.map((staffMember) =>
          staffMember.staffId === editingStaffId ? { ...staffMember, ...staffMemberInput } : staffMember
        )
      );
      return;
    }

    const newStaffMember: StaffMember = {
      staffId: `staff-${Date.now()}`,
      ...staffMemberInput,
    };
    setStaffList((previousList) => [...previousList, newStaffMember]);
  };

  const handleConfirmRemoveStaff = () => {
    if (!selectedStaffMember) {
      return;
    }

    setStaffList((previousList) =>
      previousList.filter((staffMember) => staffMember.staffId !== selectedStaffMember.staffId)
    );
    setIsRemoveModalOpen(false);
    setSelectedStaffMember(null);
  };

  return (
    <div className="flex h-full flex-col bg-gray-50 pb-24">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label="Go back"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 active:bg-gray-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : null}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
              <p className="text-sm text-gray-500">
                {usedStaffCount} of {STAFF_LIMIT} staff used
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
        {staffList.length === 0 ? (
          <div className="mt-16 flex flex-col items-center rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center shadow-sm">
            <Users className="mb-3 h-12 w-12 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">No staff added yet</h2>
            <p className="mt-1 text-sm text-gray-500">Add your first staff member to manage billing access.</p>
            <Button
              label="Add Staff"
              icon={UserPlus2}
              onClick={handleOpenAddStaff}
              className="mt-4 w-full sm:w-auto"
            />
          </div>
        ) : (
          <div className="space-y-3">
            {staffList.map((staffMember) => (
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
              />
            ))}
          </div>
        )}
      </main>

      <div className="fixed bottom-20 left-0 right-0 px-4">
        <Button
          label="+ Add Staff"
          onClick={handleOpenAddStaff}
          className="w-full shadow-lg"
          variant="primary"
        />
      </div>

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
  onToggleMenu,
}: StaffCardProps) {
  return (
    <div className="relative rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <button
        type="button"
        onClick={() => onOpenEdit(staffMember)}
        className="flex w-full items-center gap-3 rounded-xl p-1 text-left active:bg-gray-50"
      >
        <Avatar name={staffMember.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-base font-semibold text-gray-900">{staffMember.name}</p>
            <RoleBadge role={staffMember.role} />
          </div>
          <p className="text-sm text-gray-500">{staffMember.mobileNumber}</p>
        </div>
      </button>

      <button
        type="button"
        aria-label="Open staff actions"
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
            Edit
          </button>
          <button
            type="button"
            onClick={() => onOpenRemove(staffMember)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 active:bg-red-50"
          >
            Remove
          </button>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Renders a circular initials avatar.
 */
export function Avatar({ name }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
      {initials}
    </div>
  );
}

/**
 * Renders a role badge for admin or staff roles.
 */
export function RoleBadge({ role }: RoleBadgeProps) {
  const isAdminRole = role === 'admin';
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        isAdminRole ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {isAdminRole ? 'Admin' : 'Staff'}
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
            aria-label="Close modal"
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
 * Renders add/edit staff form modal with simple mobile-friendly fields.
 */
function StaffFormModal({ isOpen, initialStaffMember, onClose, onSave }: StaffFormModalProps) {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [role, setRole] = useState<StaffRole>('staff');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setName(initialStaffMember?.name ?? '');
    setMobileNumber(initialStaffMember?.mobileNumber ?? '');
    setRole(initialStaffMember?.role ?? 'staff');
  }, [isOpen, initialStaffMember]);

  const isSaveDisabled = !name.trim() || !mobileNumber.trim();

  return (
    <Modal
      isOpen={isOpen}
      title={initialStaffMember ? 'Edit Staff' : 'Add Staff'}
      onClose={onClose}
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (isSaveDisabled) {
            return;
          }

          onSave(
            {
              name: name.trim(),
              mobileNumber: mobileNumber.trim(),
              role,
            },
            initialStaffMember?.staffId
          );
          onClose();
        }}
      >
        <div>
          <label htmlFor="staff-name" className="mb-1 block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="staff-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter full name"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-green-500"
          />
        </div>

        <div>
          <label htmlFor="staff-mobile-number" className="mb-1 block text-sm font-medium text-gray-700">
            Mobile Number
          </label>
          <input
            id="staff-mobile-number"
            type="tel"
            value={mobileNumber}
            onChange={(event) => setMobileNumber(event.target.value)}
            placeholder="Enter mobile number"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-green-500"
          />
        </div>

        <div>
          <label htmlFor="staff-role" className="mb-1 block text-sm font-medium text-gray-700">
            Role
          </label>
          <div className="relative">
            <select
              id="staff-role"
              value={role}
              onChange={(event) => setRole(event.target.value as StaffRole)}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-base outline-none focus:border-green-500"
            >
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button label="Save" type="submit" disabled={isSaveDisabled} />
        </div>
      </form>
    </Modal>
  );
}

/**
 * Renders remove confirmation modal for destructive action.
 */
function RemoveStaffModal({ isOpen, selectedStaffMember, onCancel, onConfirm }: RemoveStaffModalProps) {
  return (
    <Modal isOpen={isOpen} title="Remove Staff" onClose={onCancel}>
      <p className="text-sm text-gray-600">
        Remove this staff member?{selectedStaffMember ? ` (${selectedStaffMember.name})` : ''}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button label="Cancel" variant="secondary" onClick={onCancel} />
        <Button label="Remove" variant="danger" icon={Trash2} onClick={onConfirm} />
      </div>
    </Modal>
  );
}
