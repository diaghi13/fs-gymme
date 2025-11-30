import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Visibility,
  ShoppingCart,
  Euro,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Edit as EditIcon,
  Add as AddIcon,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material';
import { usePage, router } from '@inertiajs/react';
import { Customer, Sale, Payment } from '@/types';
import { route } from 'ziggy-js';
import { useFormatCurrency } from '@/hooks/useRegionalSettings';
import FormattedDate from '@/components/ui/FormattedDate';
import FormattedCurrency from '@/components/ui/FormattedCurrency';
import RegisterPaymentDialog from '../dialogs/RegisterPaymentDialog';
import PaymentDialog from '../dialogs/PaymentDialog';
import { Form, Formik } from 'formik';
import DatePicker from '@/components/ui/DatePicker';
import MoneyTextField from '@/components/ui/MoneyTextField';
import Autocomplete from '@/components/ui/Autocomplete';

// Dialog for creating a new partial payment
interface AddPartialPaymentDialogProps {
  sale: Sale;
  open: boolean;
  onClose: () => void;
}

const AddPartialPaymentDialog: React.FC<AddPartialPaymentDialogProps> = ({ sale, open, onClose }) => {
  const { customer, currentTenantId, payment_methods } = usePage<{ customer: Customer; currentTenantId: string; payment_methods: any[] }>().props;

  return (
    <Formik
      initialValues={{
        due_date: new Date(),
        amount: 0,
        payment_method: payment_methods[0] || null,
        payed_at: null,
      }}
      onSubmit={(values) => {
        router.post(
          route('app.customer-sale-payments.store', {
            customer: customer.id,
            sale: sale.id,
            tenant: currentTenantId,
          }),
          {
            ...values,
            payment_method: values.payment_method?.id,
          },
          { preserveScroll: true }
        );
        onClose();
      }}
    >
      {({ submitForm }) => (
        <Form>
          <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Aggiungi Pagamento Parziale</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={6}>
                  <DatePicker name="due_date" label="Data scadenza" />
                </Grid>
                <Grid size={6}>
                  <MoneyTextField name="amount" label="Importo" />
                </Grid>
                <Grid size={12}>
                  <Autocomplete
                    name="payment_method"
                    label="Metodo di pagamento"
                    options={payment_methods}
                    getOptionLabel={(option) => option.description || ''}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                  />
                </Grid>
                <Grid size={12}>
                  <DatePicker name="payed_at" label="Pagato il (opzionale)" />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>Annulla</Button>
              <Button onClick={submitForm} variant="contained" color="primary">
                Aggiungi
              </Button>
            </DialogActions>
          </Dialog>
        </Form>
      )}
    </Formik>
  );
};

// Expandable sale row component
interface SaleRowProps {
  sale: Sale;
}

const SaleRow: React.FC<SaleRowProps> = ({ sale }) => {
  const [open, setOpen] = React.useState(false);
  const { currentTenantId } = usePage<{ currentTenantId: string }>().props;
  const formatCurrency = useFormatCurrency();

  const summary = sale.sale_summary || {};
  const total = summary.final_total || 0;

  const paidAmount = (sale.payments || []).reduce((sum, payment) => {
    return sum + (payment.payed_at ? payment.amount : 0);
  }, 0);

  const unpaidAmount = total - paidAmount;

  const getPaymentStatus = () => {
    if (total === 0) return 'unknown';
    if (paidAmount >= total) return 'paid';
    if (paidAmount > 0) return 'partial';
    const hasExpired = (sale.payments || []).some(p =>
      !p.payed_at && new Date(p.due_date) < new Date()
    );
    if (hasExpired) return 'expired';
    return 'unpaid';
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'paid':
        return <Chip label="Pagato" color="success" size="small" icon={<CheckCircle />} />;
      case 'partial':
        return <Chip label="Parziale" color="warning" size="small" icon={<Warning />} />;
      case 'expired':
        return <Chip label="Scaduto" color="error" size="small" icon={<ErrorIcon />} />;
      case 'unpaid':
        return <Chip label="Non Pagato" color="default" size="small" />;
      default:
        return <Chip label="N/D" size="small" />;
    }
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' }, bgcolor: open ? 'action.hover' : 'inherit' }}>
        <TableCell sx={{ width: 50 }}>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight={600}>
            #{sale.progressive_number}
          </Typography>
        </TableCell>
        <TableCell>
          <FormattedDate value={sale.date} />
        </TableCell>
        <TableCell align="right">
          <Typography variant="body2" fontWeight={600}>
            <FormattedCurrency value={total} />
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="body2" color="success.main" fontWeight={600}>
            <FormattedCurrency value={paidAmount} />
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography
            variant="body2"
            color={unpaidAmount > 0 ? 'error.main' : 'text.secondary'}
            fontWeight={600}
          >
            <FormattedCurrency value={unpaidAmount} />
          </Typography>
        </TableCell>
        <TableCell>
          {getStatusChip(getPaymentStatus())}
        </TableCell>
        <TableCell align="right">
          <Tooltip title="Visualizza vendita">
            <IconButton
              size="small"
              onClick={() => router.visit(route('app.sales.show', { sale: sale.id, tenant: currentTenantId }))}
              color="primary"
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <PaymentDetailPanel sale={sale} />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

// Detail panel for payments
interface PaymentDetailPanelProps {
  sale: Sale;
}

const PaymentDetailPanel: React.FC<PaymentDetailPanelProps> = ({ sale }) => {
  const [selectedPayment, setSelectedPayment] = React.useState<Payment | null>(null);
  const [registerDialogOpen, setRegisterDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [addPaymentDialogOpen, setAddPaymentDialogOpen] = React.useState(false);

  const handleRegisterPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setRegisterDialogOpen(true);
  };

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setEditDialogOpen(true);
  };

  return (
    <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShoppingCart fontSize="small" />
          Pagamenti e Rate
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setAddPaymentDialogOpen(true)}
        >
          Aggiungi Pagamento Parziale
        </Button>
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Scadenza</TableCell>
            <TableCell>Metodo</TableCell>
            <TableCell align="right">Importo</TableCell>
            <TableCell>Pagato il</TableCell>
            <TableCell>Stato</TableCell>
            <TableCell align="right">Azioni</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(sale.payments || []).map((payment, index) => {
            const isPaid = Boolean(payment.payed_at);
            const isExpired = !isPaid && new Date(payment.due_date) < new Date();

            return (
              <TableRow key={payment.id} sx={{ bgcolor: 'background.paper' }}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <FormattedDate value={payment.due_date} />
                </TableCell>
                <TableCell>{payment.payment_method?.description || '-'}</TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={600}>
                    <FormattedCurrency value={payment.amount} />
                  </Typography>
                </TableCell>
                <TableCell>
                  {isPaid ? (
                    <Typography variant="body2" color="success.main">
                      {payment.payed_at && <FormattedDate value={payment.payed_at} showTime />}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {isPaid ? (
                    <Chip label="Pagato" color="success" size="small" />
                  ) : isExpired ? (
                    <Chip label="Scaduto" color="error" size="small" />
                  ) : (
                    <Chip label="In attesa" color="warning" size="small" />
                  )}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    {!isPaid && (
                      <Tooltip title="Registra pagamento">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleRegisterPayment(payment)}
                        >
                          <CheckCircle fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Modifica">
                      <IconButton
                        size="small"
                        onClick={() => handleEditPayment(payment)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Dialogs */}
      {selectedPayment && registerDialogOpen && (
        <RegisterPaymentDialog
          sale={sale}
          payment={selectedPayment}
          open={registerDialogOpen}
          onClose={() => {
            setRegisterDialogOpen(false);
            setSelectedPayment(null);
          }}
        />
      )}
      {selectedPayment && editDialogOpen && (
        <PaymentDialog
          sale={sale}
          payment={selectedPayment}
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedPayment(null);
          }}
        />
      )}
      <AddPartialPaymentDialog
        sale={sale}
        open={addPaymentDialogOpen}
        onClose={() => setAddPaymentDialogOpen(false)}
      />
    </Box>
  );
};

const SalesTab: React.FC = () => {
  const { customer } = usePage<{ customer: Customer }>().props;
  const [loading] = React.useState(false);

  const sales = customer.sales || [];
  const summary = customer.sales_summary;

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {[1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, md: 4 }}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
          <Grid size={12}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        {/* Summary Cards */}
        {summary && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <ShoppingCart color="primary" />
                      <Typography variant="body2" color="text.secondary">
                        Vendite
                      </Typography>
                    </Stack>
                    <Typography variant="h4" fontWeight={600}>
                      {summary.total_sale_products || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Prodotti venduti
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Euro color="primary" />
                      <Typography variant="body2" color="text.secondary">
                        Totale
                      </Typography>
                    </Stack>
                    <Typography variant="h4" fontWeight={600}>
                      <FormattedCurrency value={summary.total_amount || 0} />
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Fatturato totale
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant="outlined" sx={{ borderColor: 'success.main' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CheckCircle color="success" />
                      <Typography variant="body2" color="text.secondary">
                        Pagato
                      </Typography>
                    </Stack>
                    <Typography variant="h4" fontWeight={600} color="success.main">
                      <FormattedCurrency value={summary.payed || 0} />
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Incassato
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant="outlined" sx={{ borderColor: 'error.main' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Warning color="error" />
                      <Typography variant="body2" color="text.secondary">
                        Da Incassare
                      </Typography>
                    </Stack>
                    <Typography variant="h4" fontWeight={600} color="error.main">
                      <FormattedCurrency value={summary.not_payed || 0} />
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Di cui <FormattedCurrency value={summary.expired || 0} /> scaduto
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Sales Table with expandable rows */}
        <Card>
          <CardHeader
            title="Vendite e Pagamenti"
            subheader={`${sales.length} vendite registrate - Clicca sulla freccia per espandere e gestire le rate`}
          />
          <CardContent sx={{ p: 0 }}>
            {sales.length === 0 ? (
              <Box sx={{ p: 3 }}>
                <Alert severity="info" icon={<ShoppingCart />}>
                  Nessuna vendita registrata per questo cliente. Le vendite appariranno qui una
                  volta create.
                </Alert>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 50 }} />
                      <TableCell>Numero</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell align="right">Totale</TableCell>
                      <TableCell align="right">Pagato</TableCell>
                      <TableCell align="right">Da Saldare</TableCell>
                      <TableCell>Stato</TableCell>
                      <TableCell align="right">Azioni</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sales.map((sale) => (
                      <SaleRow key={sale.id} sale={sale} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default SalesTab;

