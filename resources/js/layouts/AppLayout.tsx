import React, { PropsWithChildren, useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import {
  Alert as MuiAlert,
  AlertProps,
  Box,
  Breadcrumbs,
  CssBaseline, Snackbar,
  Typography
} from '@mui/material';
import AppBar from '@/components/layout/AppBar';
import { PageProps, User } from '@/types';
import Drawer from '@/components/layout/Drawer';
import { useTheme } from '@mui/material/styles';
import DrawerHeader from '@/components/layout/DrawerHeader';
import useLocalStorage from '@/hooks/useLocalStorage';

export const drawerWidth = 240;

const breadcrumbNameMap: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/customers': 'Clienti',
  '/customers/create': 'Nuovo cliente',
  '/products': 'Prodotti',
  '/products/product': 'Gestione prodotti',
  '/price-lists': 'Listini',
  '/sales': 'Vendite',
  '/sales/create': 'Nuova vendita',
  '/users': 'Utenti'
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function AppLayout({ title, children }: PropsWithChildren<{ user: User, title?: string, }>) {

  const [open, setOpen] = useLocalStorage('ui.drawerOpen', true);
  const page = usePage<PageProps>();
  const theme = useTheme();
  const status = page.props.flash.status;
  const message = page.props.flash.message;
  const [openAlert, setOpenAlert] = useState<boolean>(!!(status as string));

  const pathnames = location.pathname.split('/').filter((x) => x);

  useEffect(() => {
    //const variant = page.props.flash.status;
    //const message = page.props.flash.message;

    // if (variant) {
    //     enqueueSnackbar(message ?? 'Inserimento avvenuto con successo', { variant });
    // }
    //setOpenAlert(!!(status as string));
  }, [page.props.flash.message, page.props.flash.status]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleAlertClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <title>{title || 'Gymme'}</title>
      <CssBaseline />
      <AppBar open={open} setOpen={handleDrawerToggle} toggleSettingDrawerOpen={() => {
      }} />
      <Drawer open={open} setOpen={setOpen} />
      <Box
        component="main"
        sx={{
          //flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: '100%',
          overflow: 'auto',
          background: theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5'
        }}
      >
        <DrawerHeader dark />
        <Box
          role="presentation"
          id="my-breadcrumb"
          sx={{
            //position: "fixed",
            zIndex: theme.zIndex.appBar,
            padding: 1.5,
            background:
              theme.palette.mode === 'dark'
                ? theme.palette.grey[900]
                : theme.palette.primary.dark,
            width: '100%',
            boxShadow: theme.shadows[1]
          }}
        >
          <Breadcrumbs
            separator="›"
            aria-label="breadcrumb"
            sx={{ color: 'white' }}
          >
            <Typography color="inherit">Gymme</Typography>
            {pathnames.map((_, index) => {
              const last = index === pathnames.length - 1;
              const to = `/${pathnames.slice(0, index + 1).join('/')}`;

              //console.log(to);

              return last ? (
                <Typography color="inherit" key={to}>
                  {breadcrumbNameMap[to]}
                </Typography>
              ) : (
                <Typography color="inherit" key={to}>
                  {breadcrumbNameMap[to]}
                </Typography>
              );
            })}
          </Breadcrumbs>
        </Box>
        <Box sx={{ p: 0, flexGrow: 1 }}>
          {page.props.errors && Object.keys(page.props.errors).map((error: string, index: number) => (
            <Alert key={index} severity="error" sx={{ ml: 2, mt: 2, mr: 2 }}>{`${error}: ${page.props.errors[error]}`}</Alert>
          ))}
          {children}
        </Box>

        <Box sx={styles.footerContainer}>
          <Typography variant="body2" color="GrayText">
            Copyright © 2022. Energym Club. All Rights Reserved.
          </Typography>
          <Typography variant="body2" color="GrayText">
            Made by Davide Donghi.
          </Typography>
        </Box>
        {status === 'success' && (
          <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleAlertClose}>
            <Alert onClose={handleAlertClose} severity="success" sx={{ width: '100%' }}>
              {message || 'Inserimento avvenuto con successo'}
            </Alert>
          </Snackbar>
        )}
        {status === 'error' && (
          <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleAlertClose}>
            <Alert onClose={handleAlertClose} severity="error" sx={{ width: '100%' }}>
              {message || 'Si è verificato un errore durante l\'inserimento'}
            </Alert>
          </Snackbar>
        )}
      </Box>
    </Box>
  );
}

const styles = {
  footerContainer: {
    background: 'transparent',
    p: 2
  },
  speedDialContainer: {
    position: 'fixed',
    bottom: 16,
    right: 16
  }
};
