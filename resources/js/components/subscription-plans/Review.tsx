import * as React from 'react';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useFormikContext } from 'formik';
import { usePage } from '@inertiajs/react';
import { PageProps, SubscriptionPlan } from '@/types';
import { Str } from '@/support/Str';

interface SubscriptionPlanPaymentProps extends PageProps {
  subscriptionPlan: SubscriptionPlan;
}

export default function Review() {
  const { subscriptionPlan } = usePage<SubscriptionPlanPaymentProps>().props;
  const { values, setFieldValue } = useFormikContext<{ auto_renew: boolean }>();

  const intervalLabels: Record<string, string> = {
    monthly: 'Mensile',
    yearly: 'Annuale',
    weekly: 'Settimanale',
    daily: 'Giornaliero',
  };

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h6" gutterBottom>
          Riepilogo Abbonamento
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Controlla i dettagli del tuo abbonamento prima di confermare
        </Typography>
      </div>

      <Divider />

      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body1" fontWeight="medium">
            Piano
          </Typography>
          <Typography variant="body1">{subscriptionPlan.name}</Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body1" fontWeight="medium">
            Prezzo
          </Typography>
          <Typography variant="h6" color="primary">
            {Str.EURO(subscriptionPlan.price).format()}
          </Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body1" fontWeight="medium">
            Frequenza
          </Typography>
          <Typography variant="body1">
            {intervalLabels[subscriptionPlan.interval] || subscriptionPlan.interval}
          </Typography>
        </Stack>

        {subscriptionPlan.trial_days > 0 && (
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body1" fontWeight="medium">
              Periodo di Prova
            </Typography>
            <Typography variant="body1" color="success.main">
              {subscriptionPlan.trial_days} giorni gratuiti
            </Typography>
          </Stack>
        )}
      </Stack>

      <Divider />

      <FormControlLabel
        control={
          <Checkbox
            checked={values.auto_renew}
            onChange={(e) => setFieldValue('auto_renew', e.target.checked)}
            color="primary"
          />
        }
        label={
          <Stack spacing={0.5}>
            <Typography variant="body1">Rinnovo Automatico</Typography>
            <Typography variant="caption" color="text.secondary">
              Il tuo abbonamento si rinnoverà automaticamente al termine del periodo.
              Puoi annullare il rinnovo in qualsiasi momento dalle impostazioni.
            </Typography>
          </Stack>
        }
      />

      <Divider />

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ pt: 2 }}
      >
        <Typography variant="h6" fontWeight="bold">
          Totale
        </Typography>
        <Typography variant="h5" color="primary" fontWeight="bold">
          {Str.EURO(subscriptionPlan.price).format()}
        </Typography>
      </Stack>
    </Stack>
  );
}
