import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
} from '@mui/material';
import { router, usePage } from '@inertiajs/react';
import { CustomerShowProps } from '@/pages/customers/customer-show';
import axios from 'axios';

interface PriceList {
  id: number;
  name: string;
  price: number;
  entrances?: number;
  days_duration?: number;
  months_duration?: number;
}

interface AddSubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
  subscription?: any | null;
  onSuccess: () => void;
}

const AddSubscriptionDialog: React.FC<AddSubscriptionDialogProps> = ({
  open,
  onClose,
  subscription,
  onSuccess,
}) => {
  const { customer, price_lists } = usePage<CustomerShowProps>().props;
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<any>({});

  const [formData, setFormData] = React.useState({
    type: 'subscription' as 'subscription' | 'entrance_card',
    price_list_id: '',
    start_date: '',
    end_date: '',
    card_number: '',
    notes: '',
    status: 'active',
    reason: '',
  });

  // Helper function to format date from backend (YYYY-MM-DD HH:MM:SS) to input format (YYYY-MM-DD)
  const formatDateForInput = (dateString: string | null): string => {
    if (!dateString) return '';
    // Handle both "2025-11-20" and "2025-11-20 00:00:00" formats
    return dateString.split(' ')[0];
  };

  // Reset form when dialog opens/closes or subscription changes
  React.useEffect(() => {
    if (open) {
      if (subscription) {
        // Edit mode - populate with existing data
        setFormData({
          type: subscription.type || 'subscription',
          price_list_id: subscription.price_list_id?.toString() || '',
          start_date: formatDateForInput(subscription.start_date),
          end_date: formatDateForInput(subscription.end_date),
          card_number: subscription.card_number || '',
          notes: subscription.notes || '',
          status: subscription.status || 'active',
          reason: '',
        });
      } else {
        // Create mode - empty form with today's date
        setFormData({
          type: 'subscription',
          price_list_id: '',
          start_date: new Date().toISOString().split('T')[0],
          end_date: '',
          card_number: '',
          notes: '',
          status: 'active',
          reason: '',
        });
      }
      setErrors({});
    }
  }, [open, subscription]);

  // Auto-calculate end date when price list changes (only in create mode)
  React.useEffect(() => {
    if (formData.price_list_id && formData.start_date && !subscription && price_lists) {
      const selectedPriceList = price_lists.find(pl => pl.id === parseInt(formData.price_list_id));
      if (selectedPriceList) {
        const startDate = new Date(formData.start_date);

        if (selectedPriceList.days_duration) {
          startDate.setDate(startDate.getDate() + selectedPriceList.days_duration);
        } else if (selectedPriceList.months_duration) {
          startDate.setMonth(startDate.getMonth() + selectedPriceList.months_duration);
        }

        setFormData(prev => ({
          ...prev,
          end_date: startDate.toISOString().split('T')[0],
        }));
      }
    }
  }, [formData.price_list_id, formData.start_date, price_lists, subscription]);

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    const data = {
      type: formData.type,
      price_list_id: parseInt(formData.price_list_id),
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      card_number: formData.card_number || null,
      notes: formData.notes || null,
      status: formData.status,
      reason: formData.reason || (subscription ? 'Abbonamento modificato' : 'Abbonamento creato manualmente'),
    };

    try {
      if (subscription) {
        // Update existing subscription via API
        await axios.put(
          `/api/v1/customer-subscriptions/${subscription.id}`,
          data
        );
      } else {
        // Create new subscription via API
        await axios.post(
          `/api/v1/customers/${customer.id}/subscriptions`,
          data
        );
      }

      // Reload the page to fetch fresh data
      router.reload({
        preserveScroll: true,
        onSuccess: () => {
          setLoading(false);
          onSuccess();
        },
      });
    } catch (error: any) {
      setLoading(false);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: 'Si è verificato un errore. Riprova.' });
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {subscription ? 'Modifica Abbonamento' : 'Nuovo Abbonamento'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {Object.keys(errors).length > 0 && (
            <Alert severity="error">
              Si sono verificati degli errori. Controlla i campi e riprova.
            </Alert>
          )}

          <FormControl fullWidth error={!!errors.type}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={formData.type}
              label="Tipo"
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            >
              <MenuItem value="subscription">Abbonamento</MenuItem>
              <MenuItem value="entrance_card">Tessera Ingressi</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth error={!!errors.price_list_id}>
            <InputLabel>Listino Prezzi</InputLabel>
            <Select
              value={formData.price_list_id}
              label="Listino Prezzi"
              onChange={(e) => setFormData({ ...formData, price_list_id: e.target.value })}
            >
              {price_lists && price_lists.map((pl) => (
                <MenuItem key={pl.id} value={pl.id}>
                  {pl.name} - €{(pl.price / 100).toFixed(2)}
                  {pl.entrances && ` - ${pl.entrances} ingressi`}
                  {pl.days_duration && ` - ${pl.days_duration} giorni`}
                  {pl.months_duration && ` - ${pl.months_duration} mesi`}
                </MenuItem>
              ))}
            </Select>
            {errors.price_list_id && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {errors.price_list_id}
              </Typography>
            )}
          </FormControl>

          <TextField
            fullWidth
            label="Data Inizio"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            error={!!errors.start_date}
            helperText={errors.start_date}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            label="Data Fine"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            error={!!errors.end_date}
            helperText={errors.end_date}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            label="Numero Tessera (opzionale)"
            value={formData.card_number}
            onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
            error={!!errors.card_number}
            helperText={errors.card_number}
          />

          <FormControl fullWidth error={!!errors.status}>
            <InputLabel>Stato</InputLabel>
            <Select
              value={formData.status}
              label="Stato"
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <MenuItem value="active">Attivo</MenuItem>
              <MenuItem value="suspended">Sospeso</MenuItem>
              <MenuItem value="expired">Scaduto</MenuItem>
              <MenuItem value="cancelled">Cancellato</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Note (opzionale)"
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            error={!!errors.notes}
            helperText={errors.notes}
          />

          {subscription && (
            <TextField
              fullWidth
              label="Motivo Modifica (opzionale)"
              multiline
              rows={2}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              error={!!errors.reason}
              helperText={errors.reason}
              placeholder="Es: Correzione data, cambio listino, ecc."
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annulla
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.price_list_id || !formData.start_date}
        >
          {loading ? 'Salvataggio...' : subscription ? 'Salva Modifiche' : 'Crea Abbonamento'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSubscriptionDialog;

