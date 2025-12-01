import * as React from 'react';
import { PageProps } from '@/types';
import CentralLayout from '@/layouts/CentralLayout';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Payment,
  HourglassEmpty
} from '@mui/icons-material';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import FormattedCurrency from '@/components/ui/FormattedCurrency';
import FormattedDate from '@/components/ui/FormattedDate';
import MyCard from '@/components/ui/MyCard';

interface PendingPayment {
  id: number;
  tenant_id: number;
  tenant_name: string;
  tenant_email: string;
  plan_name: string;
  price: number; // in cents
  payment_method: string;
  bank_transfer_notes: string | null;
  starts_at: string;
  created_at: string;
}

interface ConfirmedPayment {
  id: number;
  tenant_id: number;
  tenant_name: string;
  tenant_email: string;
  plan_name: string;
  price: number; // in cents
  payment_method: string;
  payment_confirmed_at: string;
  starts_at: string;
  confirmed_by_name: string | null;
}

interface IndexProps extends PageProps {
  pendingPayments: PendingPayment[];
  recentlyConfirmed?: ConfirmedPayment[];
}

export default function Index({ auth, pendingPayments, recentlyConfirmed }: IndexProps) {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const [notes, setNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    if (!selectedPayment) return;

    setLoading(true);
    router.post(
      route('central.subscription-payments.confirm', selectedPayment.id),
      { notes },
      {
        onFinish: () => {
          setLoading(false);
          setConfirmDialogOpen(false);
          setSelectedPayment(null);
          setNotes('');
        },
      }
    );
  };

  const handleReject = () => {
    if (!selectedPayment || !rejectReason) return;

    setLoading(true);
    router.post(
      route('central.subscription-payments.reject', selectedPayment.id),
      { reason: rejectReason },
      {
        onFinish: () => {
          setLoading(false);
          setRejectDialogOpen(false);
          setSelectedPayment(null);
          setRejectReason('');
        },
      }
    );
  };

  const getPaymentMethodLabel = (method: string): string => {
    const methods: Record<string, string> = {
      bank_transfer: 'Bonifico Bancario',
      manual: 'Manuale',
      stripe: 'Stripe',
    };
    return methods[method] || method;
  };

  return (
    <CentralLayout user={auth.user}>
      <Grid container spacing={2} sx={{ m: 2 }}>
        {/* Header */}
        <Grid size={12}>
          <Typography variant="h4" gutterBottom>
            Gestione Pagamenti Abbonamenti
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Conferma o rifiuta i pagamenti in attesa per attivare gli abbonamenti dei tenant.
          </Typography>
        </Grid>

        {/* Pending Payments */}
        <Grid size={12}>
          <MyCard
            title="Pagamenti in Attesa"
            icon={<HourglassEmpty />}
          >
            {pendingPayments.length === 0 ? (
              <Alert severity="info">
                Nessun pagamento in attesa di conferma. Ottimo lavoro!
              </Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tenant</TableCell>
                      <TableCell>Piano</TableCell>
                      <TableCell>Importo</TableCell>
                      <TableCell>Metodo</TableCell>
                      <TableCell>Data Richiesta</TableCell>
                      <TableCell>Note</TableCell>
                      <TableCell align="right">Azioni</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingPayments.map((payment) => (
                      <TableRow key={payment.id} hover>
                        <TableCell>
                          <Stack>
                            <Typography variant="body2" fontWeight="medium">
                              {payment.tenant_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {payment.tenant_email}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip label={payment.plan_name} size="small" color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            <FormattedCurrency value={payment.price / 100} showSymbol />
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getPaymentMethodLabel(payment.payment_method)}
                            size="small"
                            icon={<Payment />}
                          />
                        </TableCell>
                        <TableCell>
                          <FormattedDate value={payment.created_at} format="short" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 200, display: 'block' }}>
                            {payment.bank_transfer_notes || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<CheckCircle />}
                              onClick={() => {
                                setSelectedPayment(payment);
                                setConfirmDialogOpen(true);
                              }}
                            >
                              Conferma
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<Cancel />}
                              onClick={() => {
                                setSelectedPayment(payment);
                                setRejectDialogOpen(true);
                              }}
                            >
                              Rifiuta
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </MyCard>
        </Grid>

        {/* Recently Confirmed (Optional - if provided by backend) */}
        {recentlyConfirmed && recentlyConfirmed.length > 0 && (
          <Grid size={12}>
            <MyCard
              title="Pagamenti Recenti Confermati"
              icon={<CheckCircle />}
            >
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tenant</TableCell>
                      <TableCell>Piano</TableCell>
                      <TableCell>Importo</TableCell>
                      <TableCell>Confermato il</TableCell>
                      <TableCell>Confermato da</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentlyConfirmed.map((payment) => (
                      <TableRow key={payment.id} hover>
                        <TableCell>
                          <Stack>
                            <Typography variant="body2" fontWeight="medium">
                              {payment.tenant_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {payment.tenant_email}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip label={payment.plan_name} size="small" color="success" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <FormattedCurrency value={payment.price / 100} showSymbol />
                        </TableCell>
                        <TableCell>
                          <FormattedDate value={payment.payment_confirmed_at} format="short" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{payment.confirmed_by_name || '-'}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </MyCard>
          </Grid>
        )}
      </Grid>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Conferma Pagamento</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <DialogContentText>
              Sei sicuro di voler confermare il pagamento per:
            </DialogContentText>

            {selectedPayment && (
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">Tenant:</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedPayment.tenant_name}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">Piano:</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedPayment.plan_name}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">Importo:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        <FormattedCurrency value={selectedPayment.price / 100} showSymbol />
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )}

            <TextField
              label="Note Aggiuntive (opzionale)"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Aggiungi note sulla conferma del pagamento..."
              fullWidth
            />

            <Alert severity="info">
              L'abbonamento verrà attivato immediatamente e il tenant riceverà una notifica via email.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} disabled={loading}>
            Annulla
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color="success"
            disabled={loading}
            startIcon={<CheckCircle />}
          >
            {loading ? 'Confermando...' : 'Conferma Pagamento'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rifiuta Pagamento</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <DialogContentText>
              Stai per rifiutare il pagamento per:
            </DialogContentText>

            {selectedPayment && (
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">Tenant:</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedPayment.tenant_name}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">Piano:</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedPayment.plan_name}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )}

            <TextField
              label="Motivo del Rifiuto"
              required
              multiline
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Specifica il motivo del rifiuto (verrà comunicato al tenant)..."
              fullWidth
              error={rejectReason.length === 0}
              helperText="Campo obbligatorio"
            />

            <Alert severity="warning">
              Il tenant riceverà una notifica del rifiuto con il motivo specificato.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)} disabled={loading}>
            Annulla
          </Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={loading || rejectReason.length === 0}
            startIcon={<Cancel />}
          >
            {loading ? 'Rifiutando...' : 'Rifiuta Pagamento'}
          </Button>
        </DialogActions>
      </Dialog>
    </CentralLayout>
  );
}
