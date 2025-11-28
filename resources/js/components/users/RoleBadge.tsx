import React from 'react';
import { Chip } from '@mui/material';
import {
  AdminPanelSettings as OwnerIcon,
  ManageAccounts as ManagerIcon,
  BusinessCenter as BackOfficeIcon,
  People as StaffIcon,
  FitnessCenter as TrainerIcon,
  PersonPin as ReceptionistIcon,
  Person as CustomerIcon,
  SupervisorAccount as AdminIcon,
  Shield as SuperAdminIcon,
  School as InstructorIcon,
} from '@mui/icons-material';
import { useRolePermissionLabels } from '@/hooks/useRolePermissionLabels';

interface RoleBadgeProps {
  role: string;
  size?: 'small' | 'medium';
  showIcon?: boolean;
  variant?: 'filled' | 'outlined';
}

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

const roleStyles: Record<string, { color: ChipColor; icon: React.ReactElement }> = {
  owner: { color: 'error', icon: <OwnerIcon /> },
  'super-admin': { color: 'error', icon: <SuperAdminIcon /> },
  admin: { color: 'secondary', icon: <AdminIcon /> },
  manager: { color: 'secondary', icon: <ManagerIcon /> },
  back_office: { color: 'info', icon: <BackOfficeIcon /> },
  staff: { color: 'default', icon: <StaffIcon /> },
  trainer: { color: 'success', icon: <TrainerIcon /> },
  instructor: { color: 'success', icon: <InstructorIcon /> },
  receptionist: { color: 'warning', icon: <ReceptionistIcon /> },
  customer: { color: 'default', icon: <CustomerIcon /> },
};

/**
 * Component to display a role badge with appropriate color and icon
 *
 * @example
 * <RoleBadge role="owner" />
 * <RoleBadge role="trainer" size="medium" showIcon={true} />
 */
export default function RoleBadge({
  role,
  size = 'small',
  showIcon = true,
  variant = 'filled',
}: RoleBadgeProps) {
  const { getRoleLabel } = useRolePermissionLabels();

  const style = roleStyles[role] || { color: 'default' as ChipColor, icon: <StaffIcon /> };
  const label = getRoleLabel(role);

  return (
    <Chip
      icon={showIcon ? style.icon : undefined}
      label={label}
      color={style.color}
      size={size}
      variant={variant}
      sx={{
        fontWeight: 600,
        '& .MuiChip-icon': {
          color: variant === 'outlined' ? `${style.color}.main` : 'inherit',
        },
      }}
    />
  );
}
