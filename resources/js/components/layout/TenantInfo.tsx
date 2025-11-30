import { Box, Typography, Tooltip } from '@mui/material';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Building } from 'lucide-react';

interface TenantInfoProps {
  open: boolean;
}

export default function TenantInfo({ open }: TenantInfoProps) {
  const page = usePage<PageProps>();
  const tenant = page.props.tenant;

  if (!tenant) {
    return null;
  }

  return (
    <Box
      sx={{
        px: open ? 2 : 1,
        py: 1.5,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      {open ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Building size={20} style={{ flexShrink: 0, color: '#666' }} />
          <Box sx={{ overflow: 'hidden', flex: 1 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block' }}>
              AZIENDA
            </Typography>
            <Typography variant="body2" fontWeight={600} noWrap>
              {tenant.name}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Tooltip title={tenant.name} placement="right">
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Building size={20} style={{ color: '#666' }} />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
}