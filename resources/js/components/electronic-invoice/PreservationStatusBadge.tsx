import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import { Archive as ArchiveIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface PreservationStatusBadgeProps {
  preserved: boolean;
  preservedAt?: string | null;
  preservationPath?: string | null;
  size?: 'small' | 'medium';
}

export default function PreservationStatusBadge({
  preserved,
  preservedAt,
  preservationPath,
  size = 'small',
}: PreservationStatusBadgeProps) {
  if (!preserved || !preservedAt) {
    return null;
  }

  const tooltipContent = (
    <>
      <strong>Conservata il:</strong>{' '}
      {format(new Date(preservedAt), "dd MMMM yyyy 'alle' HH:mm", { locale: it })}
      {preservationPath && (
        <>
          <br />
          <strong>Path:</strong> {preservationPath}
        </>
      )}
    </>
  );

  return (
    <Tooltip title={tooltipContent} arrow>
      <Chip
        icon={<ArchiveIcon />}
        label="Conservata"
        color="success"
        size={size}
        variant="outlined"
        sx={{
          fontWeight: 600,
          '& .MuiChip-icon': {
            color: 'success.main',
          },
        }}
      />
    </Tooltip>
  );
}

