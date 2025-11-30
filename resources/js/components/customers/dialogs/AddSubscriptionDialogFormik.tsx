import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
} from '@mui/material';
import { router, usePage } from '@inertiajs/react';
import { CustomerShowProps } from '@/pages/customers/customer-show';
import { Formik, Form, FormikConfig } from 'formik';
import TextField from '@/components/ui/TextField';
import Select from '@/components/ui/Select';
import DatePicker from '@/components/ui/DatePicker';
import * as Yup from 'yup';

interface SubscriptionFormValues {
  type: 'subscription' | 'entrance_card';
  price_list_id: number | '';
  start_date: string;
  end_date: string;
  card_number: string;
  notes: string;
  status: 'active' | 'suspended' | 'expired' | 'cancelled';
  reason: string;
}

interface AddSubscriptionDialogFormikProps {
  open: boolean;
  onClose: () => void;
  subscription?: any | null;
  onSuccess: () => void;
}

const subscriptionValidationSchema = Yup.object().shape({
  type: Yup.string()
    .oneOf(['subscription', 'entrance_card'], 'Tipo non valido')
    .required('Il tipo è obbligatorio'),
  price_list_id: Yup.number()
    .required('Il listino è obbligatorio'),
  start_date: Yup.date()
    .required('La data di inizio è obbligatoria')
    .typeError('Inserisci una data valida'),
  end_date: Yup.date()
    .nullable()
    .typeError('Inserisci una data valida')
    .min(Yup.ref('start_date'), 'La data di fine deve essere successiva alla data di inizio'),
  card_number: Yup.string().nullable(),
  notes: Yup.string().nullable(),
  status: Yup.string()
    .oneOf(['active', 'suspended', 'expired', 'cancelled'], 'Stato non valido')
    .required('Lo stato è obbligatorio'),
});

// Component to handle auto-calculation of end date
const AutoCalculateEndDate: React.FC<{
  priceListId: number | '';
  startDate: string;
  isEditMode: boolean;
  priceLists: Array<{ id: number; days_duration?: number; months_duration?: number }>;
  setFieldValue: (field: string, value: any) => void;
}> = ({ priceListId, startDate, isEditMode, priceLists, setFieldValue }) => {
  React.useEffect(() => {
    if (priceListId && startDate && !isEditMode) {
      const selectedPriceList = priceLists.find(pl => pl.id === Number(priceListId));
      if (selectedPriceList) {
        const startDateObj = new Date(startDate);

        if (selectedPriceList.days_duration) {
          startDateObj.setDate(startDateObj.getDate() + selectedPriceList.days_duration);
        } else if (selectedPriceList.months_duration) {
          startDateObj.setMonth(startDateObj.getMonth() + selectedPriceList.months_duration);
        }

        setFieldValue('end_date', startDateObj.toISOString().split('T')[0]);
      }
    }
  }, [priceListId, startDate, isEditMode, priceLists, setFieldValue]);

  return null;
};

const AddSubscriptionDialogFormik: React.FC<AddSubscriptionDialogFormikProps> = ({
  open,
  onClose,
  subscription,
  onSuccess,
}) => {
  const { customer, price_lists } = usePage<CustomerShowProps>().props;

  const isEditMode = !!subscription;

  const formik: FormikConfig<SubscriptionFormValues> = {
    initialValues: {
      type: subscription?.type || 'subscription',
      price_list_id: subscription?.price_list_id || '',
      start_date: subscription?.start_date || new Date().toISOString().split('T')[0],
      end_date: subscription?.end_date || '',
      card_number: subscription?.card_number || '',
      notes: subscription?.notes || '',
      status: subscription?.status || 'active',
      reason: '',
    },
    validationSchema: subscriptionValidationSchema,
    enableReinitialize: true,
    onSubmit: (values, { setSubmitting }) => {
      const data = {
        ...values,
        price_list_id: Number(values.price_list_id),
        reason: values.reason || (isEditMode ? 'Abbonamento modificato' : 'Abbonamento creato manualmente'),
      };

      if (isEditMode) {
        router.put(
          route('api.v1.customer-subscriptions.update', { subscription: subscription.id }),
          data,
          {
            preserveScroll: true,
            onSuccess: () => {
              setSubmitting(false);
              onSuccess();
            },
            onError: () => {
              setSubmitting(false);
            },
          }
        );
      } else {
        router.post(
          route('api.v1.customers.subscriptions.store', { customer: customer.id }),
          data,
          {
            preserveScroll: true,
            onSuccess: () => {
              setSubmitting(false);
              onSuccess();
            },
            onError: () => {
              setSubmitting(false);
            },
          }
        );
      }
    },
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditMode ? 'Modifica Abbonamento' : 'Nuovo Abbonamento'}
      </DialogTitle>
      <Formik {...formik}>
        {({ values, setFieldValue, isSubmitting }) => (
          <Form>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Select
                    name="type"
                    label="Tipo"
                    options={[
                      { value: 'subscription', label: 'Abbonamento' },
                      { value: 'entrance_card', label: 'Tessera Ingressi' },
                    ]}
                    required
                  />
                </Grid>

                <Grid size={12}>
                  <Select
                    name="price_list_id"
                    label="Listino Prezzi"
                    options={price_lists.map((pl) => ({
                      value: pl.id,
                      label: `${pl.name} - €${pl.price}${pl.entrances ? ` - ${pl.entrances} ingressi` : ''}${pl.days_duration ? ` - ${pl.days_duration} giorni` : ''}${pl.months_duration ? ` - ${pl.months_duration} mesi` : ''}`,
                    }))}
                    required
                  />
                </Grid>

                <Grid size={6}>
                  <DatePicker
                    name="start_date"
                    label="Data Inizio"
                    required
                  />
                </Grid>

                <Grid size={6}>
                  <DatePicker
                    name="end_date"
                    label="Data Fine"
                  />
                </Grid>

                <Grid size={6}>
                  <TextField
                    name="card_number"
                    label="Numero Tessera (opzionale)"
                  />
                </Grid>

                <Grid size={6}>
                  <Select
                    name="status"
                    label="Stato"
                    options={[
                      { value: 'active', label: 'Attivo' },
                      { value: 'suspended', label: 'Sospeso' },
                      { value: 'expired', label: 'Scaduto' },
                      { value: 'cancelled', label: 'Cancellato' },
                    ]}
                    required
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    name="notes"
                    label="Note (opzionale)"
                    multiline
                    rows={3}
                  />
                </Grid>

                {isEditMode && (
                  <Grid size={12}>
                    <TextField
                      name="reason"
                      label="Motivo Modifica (opzionale)"
                      multiline
                      rows={2}
                    />
                  </Grid>
                )}
              </Grid>

              <AutoCalculateEndDate
                priceListId={values.price_list_id}
                startDate={values.start_date}
                isEditMode={isEditMode}
                priceLists={price_lists}
                setFieldValue={setFieldValue}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} disabled={isSubmitting}>
                Annulla
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvataggio...' : isEditMode ? 'Aggiorna' : 'Crea'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default AddSubscriptionDialogFormik;
