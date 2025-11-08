import { router, usePage } from '@inertiajs/react';
import {
  Box,
  MenuItem,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Menu,
  ListItemIcon,
} from '@mui/material';
import { Building2, Check } from 'lucide-react';
import React, { useState } from 'react';
import { route } from 'ziggy-js';
import { PageProps } from '@/types';

export default function StructureSwitcher() {
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

    // Use GET request to avoid CSRF issues
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
    <>
      <Tooltip title="Cambia struttura">
        <IconButton
          onClick={handleClick}
          size="small"
          color="inherit"
          disabled={switching}
          sx={{ ml: 1 }}
          aria-controls={menuOpen ? 'structure-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={menuOpen ? 'true' : undefined}
        >
          {switching ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <Building2 size={20} />
          )}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        id="structure-menu"
        open={menuOpen}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              minWidth: 250,
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%) translateY(-50%) rotate(45deg)',
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            STRUTTURE
          </Typography>
        </Box>
        {structures.map((structure) => (
          <MenuItem
            key={structure.id}
            onClick={() => handleSwitch(structure.id)}
            selected={structure.id === currentStructureId}
          >
            <ListItemIcon>
              {structure.id === currentStructureId ? (
                <Check size={18} />
              ) : (
                <Box sx={{ width: 18 }} />
              )}
            </ListItemIcon>
            <Box>
              <Typography variant="body2" fontWeight={structure.id === currentStructureId ? 600 : 400}>
                {structure.name}
              </Typography>
              {structure.address && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {structure.address}
                </Typography>
              )}
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
