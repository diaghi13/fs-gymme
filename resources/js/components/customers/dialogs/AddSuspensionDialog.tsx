import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Alert,
  Stack,
  Typography,
  Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { it } from 'date-fns/locale';
import { router } from '@inertiajs/react';
import { Subscription, CustomerSubscriptionSuspension } from '@/types';
import { differenceInDays } from 'date-fns';

interface AddSuspensionDialogProps {
  open: boolean;
  onClose: () => void;
  subscription: Subscription;
  suspension?: CustomerSubscriptionSuspension; // If provided, it's edit mode
}

const AddSuspensionDialog: React.FC<AddSuspensionDialogProps> = ({ open, onClose, subscription, suspension }) => {
  const isEditMode = !!suspension;
  const [startDate, setStartDate] = React.useState<Date | null>(suspension ? new Date(suspension.start_date) : new Date());
  const [endDate, setEndDate] = React.useState<Date | null>(suspension ? new Date(suspension.end_date) : null);
  const [reason, setReason] = React.useState(suspension?.reason || '');
  const [error, setError] = React.useState<string | null>(null);
  const [processing, setProcessing] = React.useState(false);

  // Reset state when suspension prop changes
  React.useEffect(() => {
    if (suspension) {
      setStartDate(new Date(suspension.start_date));
      setEndDate(new Date(suspension.end_date));
      setReason(suspension.reason || '');
    } else {
      setStartDate(new Date());
      setEndDate(null);
      setReason('');
    }
  }, [suspension]);

  const daysSuspended = startDate && endDate ? differenceInDays(endDate, startDate) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate) {
      setError('Seleziona entrambe le date');
      return;
    }

    if (endDate <= startDate) {
      setError('La data di fine deve essere successiva alla data di inizio');
      return;
    }

    setProcessing(true);

    const data = {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      reason: reason || null,
    };

    const options = {
      preserveScroll: true,
      onSuccess: () => {
        onClose();
        if (!isEditMode) {
          setStartDate(new Date());
          setEndDate(null);
          setReason('');
        }
      },
      onError: (errors: any) => {
        setError(Object.values(errors).join(', '));
      },
      onFinish: () => {
        setProcessing(false);
      },
    };

    if (isEditMode && suspension) {
      router.put(
        route('api.v1.customer-subscriptions.suspensions.update', { suspension: suspension.id }),
        data,
        options
      );
    } else {
      router.post(
        route('api.v1.customer-subscriptions.suspensions.store', { subscription: subscription.id }),
        data,
        options
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEditMode ? 'Modifica Sospensione' : 'Sospendi Abbonamento'}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {isEditMode
              ? `Modifica il periodo di sospensione per l'abbonamento ${subscription.price_list?.name}.`
              : `Sospendi l'abbonamento ${subscription.price_list?.name} per il periodo indicato. I giorni di sospensione verranno aggiunti alla data di scadenza.`}
          </DialogContentText>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={2}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
              <DatePicker
                label="Data Inizio Sospensione"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />

              <DatePicker
                label="Data Fine Sospensione"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                minDate={startDate || undefined}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </LocalizationProvider>

            {daysSuspended > 0 && (
              <Box sx={{ p: 2, bgcolor: 'warning.lighter', borderRadius: 1 }}>
                <Typography variant="body2" color="warning.dark">
                  Giorni di sospensione: <strong>{daysSuspended}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  La nuova data di scadenza sarà posticipata di {daysSuspended} giorni
                </Typography>
              </Box>
            )}

            <TextField
              label="Motivo (opzionale)"
              multiline
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Es: Infortunio, Malattia, Motivi personali..."
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={processing}>
            Annulla
          </Button>
          <Button type="submit" variant="contained" color="warning" disabled={processing}>
            {processing ? 'Salvataggio...' : (isEditMode ? 'Salva Modifiche' : 'Sospendi')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddSuspensionDialog;
