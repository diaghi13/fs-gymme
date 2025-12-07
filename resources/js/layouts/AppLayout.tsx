import React, { PropsWithChildren, useEffect, useState } from 'react';
import { usePage, Link as RouterLink } from '@inertiajs/react';
import {
  Alert as MuiAlert,
  AlertProps,
  Box,
  Breadcrumbs,
  CssBaseline, Snackbar,
  Typography,
  Link
} from '@mui/material';
import AppBar from '@/components/layout/AppBar';
import { PageProps, User } from '@/types';
import Drawer from '@/components/layout/Drawer';
import { useTheme } from '@mui/material/styles';
import DrawerHeader from '@/components/layout/DrawerHeader';
import useLocalStorage from '@/hooks/useLocalStorage';
import axios from 'axios';
import { menuList } from '@/layouts/index';
import { echo } from '@laravel/echo-react';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';

export const drawerWidth = 240;

const breadcrumbNameMap: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/customers': 'Clienti',
  '/customers/create': 'Nuovo Cliente',
  '/products': 'Prodotti',
  '/base-products': 'Prodotti Base',
  '/course-products': 'Corsi',
  '/bookable-services': 'Servizi Prenotabili',
  '/price-lists': 'Listini',
  '/price-lists/create': 'Nuovo Listino',
  '/sales': 'Vendite',
  '/sales/create': 'Nuova Vendita',
  '/users': 'Gestione Utenti',
  '/users/create': 'Invita Utente',
  '/roles': 'Ruoli e Permessi',
  '/roles/create': 'Nuovo Ruolo',
  '/configurations': 'Configurazioni',
  '/configurations/company': 'Azienda',
  '/configurations/invoice': 'Fatturazione',
  '/configurations/invoice-configuration': 'Fatturazione',
  '/configurations/regional': 'Impostazioni Regionali',
  '/configurations/email': 'Email e Notifiche',
  '/configurations/vat': 'IVA e Tasse',
  '/configurations/payment': 'Metodi di Pagamento',
  '/configurations/financial-resources': 'Risorse Finanziarie',
  '/configurations/gdpr-compliance': 'GDPR Compliance',
  '/configurations/structure': 'Struttura',
  '/configurations/appearance': 'Aspetto',
  '/configurations/preservation': 'Conservazione Sostitutiva'
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

  const cleanPathname = location.pathname.split('?')[0];
  const pathnames = cleanPathname.split('/').filter((x) => x);

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  let filteredPathnames = [...pathnames];

  if (
    filteredPathnames[0] === 'app' &&
    (uuidRegex.test(filteredPathnames[1]) || filteredPathnames[1] === 'test')
  ) {
    filteredPathnames = filteredPathnames.slice(2);
  }

  // axios.defaults.headers.common['X-Tenant'] = user.tenants![0].id;
  // const urlParams = new URLSearchParams(window.location.search);
  // const tenant = urlParams.get('tenant') || user.tenants?.[0]?.id;
  // axios.defaults.params = { 'tenant': tenant };
  axios.defaults.headers.common['X-Tenant'] = page.props.currentTenantId;

  useEffect(() => {
    // Update openAlert when flash message changes
    if (status) {
      setOpenAlert(true);
    }
  }, [page.props.flash.message, page.props.flash.status, status]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleAlertClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };

  const showOnboarding = page.props.tenant && !page.props.tenant.onboarding_completed_at;

  return (
    <Box sx={{ display: 'flex' }}>
      <title>{title || 'Gymme'}</title>
      <CssBaseline />
      <AppBar open={open} setOpen={handleDrawerToggle} toggleSettingDrawerOpen={() => {
      }} />
      <Drawer open={open} setOpen={setOpen} menuList={menuList} />
      {showOnboarding && page.props.tenant && (
        <OnboardingWizard
          open={true}
          tenantName={page.props.tenant.name}
          trialEndsAt={page.props.tenant.trial_ends_at || ''}
        />
      )}
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
            {filteredPathnames.map((_, index) => {
              const to = `/${filteredPathnames.slice(0, index + 1).join('/')}`;
              const segment = filteredPathnames[index];
              const last = index === filteredPathnames.length - 1;

              // Get label from map or transform segment
              let label = breadcrumbNameMap[to];
              if (!label) {
                // Check if it's a UUID
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
                // Check if it's a numeric ID
                const isNumericId = /^\d+$/.test(segment);

                if (isUUID || isNumericId) {
                  // Try to get entity name from page props
                  const entityName = (page.props as any).customer?.full_name ||
                    (page.props as any).sale?.display_name ||
                    (page.props as any).priceList?.name ||
                    (page.props as any).product?.name ||
                    (page.props as any).baseProduct?.name ||
                    (page.props as any).courseProduct?.name;
                  label = entityName || 'Dettaglio';
                } else {
                  // Capitalize and replace dashes/underscores with spaces
                  label = segment
                    .replace(/[-_]/g, ' ')
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                }
              }

              return last ? (
                <Typography color="inherit" key={to}>
                  {label}
                </Typography>
              ) : (
                <Link
                  color="inherit"
                  component={RouterLink}
                  href={to}
                  key={to}
                  underline="hover"
                >
                  {label}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>
        <Box sx={{ p: 0, flexGrow: 1 }}>
          {page.props.errors && Object.keys(page.props.errors).map((error: string, index: number) => (
            <Alert key={index} severity="error"
                   sx={{ ml: 2, mt: 2, mr: 2 }}>{`${error}: ${page.props.errors[error]}`}</Alert>
          ))}
          {children}
        </Box>

        <Box sx={styles.footerContainer}>
          <Typography variant="body2" color="GrayText">
            Copyright © {new Date().getFullYear()}. Gymme. All Rights Reserved.
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
