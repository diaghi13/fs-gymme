import { router, usePage } from '@inertiajs/react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  CircularProgress,
  Tooltip,
  alpha,
} from '@mui/material';
import { Building2, ChevronDown, Check } from 'lucide-react';
import React, { useState } from 'react';
import { route } from 'ziggy-js';
import { PageProps } from '@/types';

interface DrawerStructureSwitcherProps {
  open: boolean;
}

export default function DrawerStructureSwitcher({ open }: DrawerStructureSwitcherProps) {
  const [switching, setSwitching] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const page = usePage<PageProps>();
  const tenantId = page.props.currentTenantId;

  const structures = page.props.structures?.list || [];
  const currentStructureId = page.props.structures?.current_id || null;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSwitch = (structureId: number) => {
    if (structureId === currentStructureId) {
      handleClose();
      return;
    }

    setSwitching(true);
    handleClose();

    router.visit(
      route('app.structures.switch', {
        tenant: tenantId,
        structure: structureId
      }),
      {
        preserveScroll: true,
        onError: (errors) => {
          console.error('Failed to switch structure:', errors);
          setSwitching(false);
        },
        onFinish: () => {
          setSwitching(false);
        },
      }
    );
  };

  // Don't show switcher if there's only one structure or no structures
  if (!structures || structures.length <= 1) {
    return null;
  }

  const currentStructure = structures.find(s => s.id === currentStructureId);

  return (
    <Box sx={{ px: open ? 2 : 1, py: 1.5 }}>
      {open ? (
        <>
          <Button
            onClick={handleClick}
            disabled={switching}
            fullWidth
            variant="outlined"
            startIcon={switching ? <CircularProgress size={16} /> : <Building2 size={18} />}
            endIcon={<ChevronDown size={16} />}
            sx={{
              justifyContent: 'space-between',
              textAlign: 'left',
              borderColor: 'divider',
              color: 'text.primary',
              py: 1,
              px: 1.5,
              textTransform: 'none',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: alpha('#000', 0.02),
              },
            }}
          >
            <Box sx={{ overflow: 'hidden', flex: 1, mr: 1 }}>
              <Typography variant="body2" fontWeight={500} noWrap>
                {currentStructure?.name || 'Seleziona'}
              </Typography>
              {currentStructure?.address && (
                <Typography variant="caption" color="text.secondary" noWrap display="block">
                  {currentStructure.address}
                </Typography>
              )}
            </Box>
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleClose}
            onClick={handleClose}
            slotProps={{
              paper: {
                sx: {
                  minWidth: 220,
                  maxWidth: 300,
                },
              },
            }}
          >
            {structures.map((structure) => (
              <MenuItem
                key={structure.id}
                onClick={() => handleSwitch(structure.id)}
                selected={structure.id === currentStructureId}
                sx={{ py: 1.5 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                  <Box sx={{ minWidth: 18 }}>
                    {structure.id === currentStructureId && <Check size={18} />}
                  </Box>
                  <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    <Typography variant="body2" fontWeight={structure.id === currentStructureId ? 600 : 400} noWrap>
                      {structure.name}
                    </Typography>
                    {structure.address && (
                      <Typography variant="caption" color="text.secondary" noWrap display="block">
                        {structure.address}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Menu>
        </>
      ) : (
        <Tooltip title={currentStructure?.name || 'Cambia struttura'} placement="right">
          <Button
            onClick={handleClick}
            disabled={switching}
            variant="outlined"
            sx={{
              minWidth: 40,
              width: 40,
              height: 40,
              p: 0,
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
              },
            }}
          >
            {switching ? <CircularProgress size={20} /> : <Building2 size={20} />}
          </Button>
        </Tooltip>
      )}
    </Box>
  );
}