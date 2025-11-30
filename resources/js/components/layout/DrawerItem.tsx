import React, { useState } from 'react';
import { SvgIconComponent } from '@mui/icons-material';
import {
  Collapse,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material';

import IconExpandMore from '@mui/icons-material/ExpandMore';
import IconExpandLess from '@mui/icons-material/ExpandLess';
import { useTheme } from '@mui/material/styles';
import { Link } from '@inertiajs/react';
import { useAuthorization } from '@/hooks/useAuthorization';

interface DrawerCollapsableProps {
  open: boolean;
  items?: DrawerItemProps[];
}

const DrawerCollapsable = ({ open, items }: DrawerCollapsableProps) => {
  return (
    <Collapse in={open} timeout="auto" unmountOnExit>
      <Divider />
      <List component="div" disablePadding>
        {items &&
          items.map((item, key) => (
            <DrawerItem {...item} key={key} sub />
          ))}
      </List>
    </Collapse>
  );
};

export interface DrawerItemProps {
  name: string;
  Icon?: SvgIconComponent;
  href?: string;
  items?: DrawerItemProps[];
  sub?: boolean;
  permission?: string;
}

const DrawerItem = ({ name, Icon, href, items, sub, permission }: DrawerItemProps) => {
  const authorization = useAuthorization();
  const url = window.location.href;
  const [open, setOpen] =
    useState(items ? items.some(item => url.includes(item.href!)) : false);
  const isExpandable = items && items.length > 0;
  const theme = useTheme();

  // DEBUG: Log permission check
  if (permission) {
    console.log(`[DrawerItem] ${name}:`, {
      permission,
      hasPermission: authorization.can(permission),
      userPermissions: authorization.userPermissions,
      user: authorization.user,
      userDebug: (authorization.user as any)._debug,
    });
  }

  // Check permission - if permission is specified and user doesn't have it, don't render
  if (permission && !authorization.can(permission)) {
    console.log(`[DrawerItem] HIDING ${name} - no permission: ${permission}`);
    return null;
  }

  // Fix active state: exact match of pathname AND query params
  const currentUrl = new URL(url);
  const hrefUrl = href ? new URL(href, window.location.origin) : null;
  const active = hrefUrl ?
    currentUrl.pathname === hrefUrl.pathname &&
    currentUrl.search === hrefUrl.search : false;

  const urlParams = new URLSearchParams(window.location.search);
  const tenant = urlParams.get('tenant');
  const u = href ? new URL(href, window.location.origin) : null;
  if (u && tenant) {
    u.searchParams.set('tenant', tenant);
  }

  const handleExpand = () => {
    setOpen(!open);
  };

  return href && !isExpandable ? (
    <ListItemButton
      //button
      component={Link}
      href={u ? u.toString() : href!}
      //selected={href === location.pathname}
      //selected={url.startsWith(href)}
      selected={active}
      sx={sub ? { borderLeft: `5px solid ${theme.palette.primary.main}` } : {}}
    >
      <ListItemIcon>{Icon && <Icon />}</ListItemIcon>
      <ListItemText
        disableTypography
        primary={
          <Typography sx={{ wordWrap: 'break-word' }}>{name}</Typography>
        }
      />
    </ListItemButton>
  ) : (
    <>
      <ListItemButton onClick={handleExpand}>
        <ListItemIcon>{Icon && <Icon />}</ListItemIcon>
        <ListItemText primary={<Typography>{name}</Typography>} />
        {isExpandable && !open && <IconExpandMore />}
        {isExpandable && open && <IconExpandLess />}
      </ListItemButton>
      <DrawerCollapsable open={open} items={items} />
    </>
  );
};

export default DrawerItem;
