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
import { router } from '@inertiajs/react';
import { Subscription, CustomerSubscriptionExtension } from '@/types';
import { addDays } from 'date-fns';
import FormattedDate from '@/components/ui/FormattedDate';

interface AddExtensionDialogProps {
  open: boolean;
  onClose: () => void;
  subscription: Subscription;
  extension?: CustomerSubscriptionExtension; // If provided, it's edit mode
}

const AddExtensionDialog: React.FC<AddExtensionDialogProps> = ({ open, onClose, subscription, extension }) => {
  const isEditMode = !!extension;
  const [daysExtended, setDaysExtended] = React.useState<number>(extension?.days_extended || 7);
  const [reason, setReason] = React.useState(extension?.reason || '');
  const [error, setError] = React.useState<string | null>(null);
  const [processing, setProcessing] = React.useState(false);

  // Reset state when extension prop changes
  React.useEffect(() => {
    if (extension) {
      setDaysExtended(extension.days_extended);
      setReason(extension.reason || '');
    } else {
      setDaysExtended(7);
      setReason('');
    }
  }, [extension]);

  // Quick options for days
  const quickOptions = [7, 14, 30, 60, 90];

  const currentEndDate = subscription.effective_end_date || subscription.end_date;
  const newEndDate = currentEndDate ? addDays(new Date(currentEndDate), daysExtended) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (daysExtended < 1) {
      setError('Inserisci un numero di giorni valido');
      return;
    }

    setProcessing(true);

    const data = {
      days_extended: daysExtended,
      reason: reason || null,
    };

    const options = {
      preserveScroll: true,
      onSuccess: () => {
        onClose();
        if (!isEditMode) {
          setDaysExtended(7);
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

    if (isEditMode && extension) {
      router.put(
        route('api.v1.customer-subscriptions.extensions.update', { extension: extension.id }),
        data,
        options
      );
    } else {
      router.post(
        route('api.v1.customer-subscriptions.extensions.store', { subscription: subscription.id }),
        data,
        options
      );
    }
  };


  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEditMode ? 'Modifica Proroga' : 'Proroga Abbonamento'}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {isEditMode
              ? `Modifica la proroga per l'abbonamento ${subscription.price_list?.name}.`
              : `Prolunga la durata dell'abbonamento ${subscription.price_list?.name} aggiungendo giorni alla data di scadenza.`}
          </DialogContentText>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={2}>
            {/* Quick selection buttons */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Selezione rapida:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {quickOptions.map((days) => (
                  <Button
                    key={days}
                    size="small"
                    variant={daysExtended === days ? 'contained' : 'outlined'}
                    onClick={() => setDaysExtended(days)}
                  >
                    {days} gg
                  </Button>
                ))}
              </Stack>
            </Box>

            {/* Custom days input */}
            <TextField
              label="Giorni di Proroga"
              type="number"
              value={daysExtended}
              onChange={(e) => setDaysExtended(parseInt(e.target.value) || 0)}
              inputProps={{ min: 1, max: 365 }}
              required
              fullWidth
            />

            {/* Date preview */}
            {newEndDate && (
              <Box sx={{ p: 2, bgcolor: 'success.lighter', borderRadius: 1 }}>
                <Typography variant="body2" color="success.dark">
                  Scadenza attuale: <strong>{currentEndDate ? <FormattedDate value={currentEndDate} /> : '-'}</strong>
                </Typography>
                <Typography variant="body2" color="success.dark">
                  Nuova scadenza: <strong>{newEndDate ? <FormattedDate value={newEndDate} /> : '-'}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  +{daysExtended} giorni
                </Typography>
              </Box>
            )}

            <TextField
              label="Motivo (opzionale)"
              multiline
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Es: Promozione, Compensazione, Buono sconto..."
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={processing}>
            Annulla
          </Button>
          <Button type="submit" variant="contained" color="success" disabled={processing}>
            {processing ? 'Salvataggio...' : (isEditMode ? 'Salva Modifiche' : 'Proroga')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddExtensionDialog;
