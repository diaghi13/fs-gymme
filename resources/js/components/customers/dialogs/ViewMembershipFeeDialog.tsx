import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Alert,
  Typography,
  Box,
} from '@mui/material';
import { Customer, MembershipFee } from '@/types';
import { Formik, Form } from 'formik';
import TextField from '@/components/ui/TextField';
import DatePicker from '@/components/ui/DatePicker';
import axios from 'axios';
import { route } from 'ziggy-js';
import { Info } from '@mui/icons-material';
import FormattedCurrency from '@/components/ui/FormattedCurrency';

interface ViewMembershipFeeDialogProps {
  open: boolean;
  onClose: () => void;
  customer: Customer;
  membershipFee: MembershipFee | null;
  onSuccess: () => void;
}

interface MembershipFeeFormValues {
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'suspended';
  notes: string;
}

const ViewMembershipFeeDialog: React.FC<ViewMembershipFeeDialogProps> = ({
  open,
  onClose,
  customer,
  membershipFee,
  onSuccess,
}) => {
  if (!membershipFee) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Quota Associativa</DialogTitle>
        <DialogContent>
          <Alert severity="info" icon={<Info />} sx={{ mt: 2 }}>
            Nessuna quota associativa attiva. La quota associativa viene acquistata tramite una vendita
            (es. "Quota Associativa 2025") e verrà visualizzata automaticamente qui.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Chiudi</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const initialValues: MembershipFeeFormValues = {
    start_date: membershipFee.start_date
      ? (typeof membershipFee.start_date === 'string'
          ? membershipFee.start_date
          : new Date(membershipFee.start_date).toISOString().split('T')[0])
      : '',
    end_date: membershipFee.end_date
      ? (typeof membershipFee.end_date === 'string'
          ? membershipFee.end_date
          : new Date(membershipFee.end_date).toISOString().split('T')[0])
      : '',
    status: membershipFee.status || 'active',
    notes: membershipFee.notes || '',
  };

  const handleSubmit = async (values: MembershipFeeFormValues) => {
    try {
      await axios.put(
        route('api.v1.customers.membership-fees.update', {
          customer: customer.id,
          membershipFee: membershipFee.id,
        }),
        values
      );

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating membership fee:', error);
      alert('Errore nell\'aggiornamento della quota associativa');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Dettagli Quota Associativa</DialogTitle>

      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {() => (
          <Form>
            <DialogContent>
              <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
                Le quote associative vengono create automaticamente dalle vendite.
                Qui puoi solo correggere le date o lo stato in caso di errori.
              </Alert>

              <Grid container spacing={2}>
                {/* Read-only info about the sale */}
                <Grid size={12}>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Informazioni Vendita
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={6}>
                        <Typography variant="body2" color="text.secondary">
                          Importo
                        </Typography>
                        {/*<Typography variant="body1" fontWeight={600}>*/}
                        {/*  <FormattedCurrency value={membershipFee.amount} />*/}
                        {/*</Typography>*/}
                      </Grid>
                      {/*{membershipFee.organization && (*/}
                      {/*  <Grid size={6}>*/}
                      {/*    <Typography variant="body2" color="text.secondary">*/}
                      {/*      Organizzazione*/}
                      {/*    </Typography>*/}
                      {/*    <Typography variant="body1" fontWeight={600}>*/}
                      {/*      {membershipFee.organization}*/}
                      {/*    </Typography>*/}
                      {/*  </Grid>*/}
                      {/*)}*/}
                    </Grid>
                  </Box>
                </Grid>

                {/* Editable fields */}
                <Grid size={6}>
                  <DatePicker
                    name="start_date"
                    label="Data Inizio *"
                  />
                </Grid>

                <Grid size={6}>
                  <DatePicker
                    name="end_date"
                    label="Data Scadenza *"
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    name="status"
                    label="Stato"
                    select
                    helperText="Modifica lo stato solo se necessario"
                  >
                    <MenuItem value="active">Attiva</MenuItem>
                    <MenuItem value="expired">Scaduta</MenuItem>
                    <MenuItem value="suspended">Sospesa</MenuItem>
                  </TextField>
                </Grid>

                <Grid size={12}>
                  <TextField
                    name="notes"
                    label="Note"
                    multiline
                    rows={3}
                    helperText="Note sulla quota associativa"
                  />
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button onClick={onClose}>Annulla</Button>
              <Button type="submit" variant="contained">
                Salva Modifiche
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default ViewMembershipFeeDialog;
