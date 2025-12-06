import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

import ToggleColorMode from '@/theme/ColorModeContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { it } from 'date-fns/locale/it';
import { configureEcho } from '@laravel/echo-react';
import { OnlineUsersProvider } from '@/contexts/OnlineUserContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Only configure Echo if Reverb key is provided
if (import.meta.env.VITE_REVERB_APP_KEY) {
  configureEcho({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss']
  });
}


const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
  setup({ el, App, props }) {
    const root = createRoot(el);
    const stripePromise = loadStripe('pk_test_51HvSm6II6b7OrDOpgs8FmrS3eF4CgLItJt3eIKaGhArcFZRB568BJJYrjJxOtp5GDbYIt1cunKRRH5ETC9A99XN0000Dc8eizK');

    //axios.defaults.headers.common['X-Tenant'] = props.auth.user?.tenants[0].id;

    root.render(
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
        <OnlineUsersProvider>

          <ToggleColorMode>
            <Elements stripe={stripePromise}>
              <App {...props} />
            </Elements>
          </ToggleColorMode>

        </OnlineUsersProvider>
      </LocalizationProvider>
    )
    ;
  },
  progress: {
    color: '#4B5563'
  }
});

// This will set light / dark mode on load...
initializeTheme();

// Verifica che Ziggy sia disponibile nel contesto globale
