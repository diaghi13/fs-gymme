import * as React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import { usePage, router } from '@inertiajs/react';
import { CustomerShowProps } from '@/pages/customers/customer-show';
import { route } from 'ziggy-js';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import AddSubscriptionDialog from '@/components/customers/dialogs/AddSubscriptionDialog';
import SubscriptionHistoryDialog from '@/components/customers/dialogs/SubscriptionHistoryDialog';

interface CustomerSubscription {
  id: number;
  customer_id: number;
  sale_row_id: number | null;
  type: 'subscription' | 'entrance_card';
  price_list_id: number;
  price_list?: {
    id: number;
    name: string;
    price: number;
    entrances?: number;
    days_duration?: number;
    months_duration?: number;
  };
  entitable_type?: string;
  entitable_id?: number;
  entity?: any;
  start_date: string;
  end_date: string | null;
  effective_end_date: string | null;
  card_number?: string;
  notes?: string;
  status: 'active' | 'suspended' | 'expired' | 'cancelled';
  suspended_days: number;
  extended_days: number;
  suspensions?: any[];
  extensions?: any[];
}

const SubscriptionsTab = () => {
  const { customer } = usePage<CustomerShowProps>().props;
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [openAddDialog, setOpenAddDialog] = React.useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = React.useState(false);
  const [selectedSubscription, setSelectedSubscription] = React.useState<CustomerSubscription | null>(null);

  // Filter subscriptions based on status - data already loaded from props
  const subscriptions = React.useMemo(() => {
    const allSubscriptions = customer.subscriptions || [];
    const now = new Date();

    switch (statusFilter) {
      case 'active':
        return allSubscriptions.filter(sub => {
          const startDate = new Date(sub.start_date);
          const endDate = sub.end_date ? new Date(sub.end_date) : null;
          return startDate <= now && (!endDate || endDate >= now);
        });
      case 'expired':
        return allSubscriptions.filter(sub => {
          const endDate = sub.end_date ? new Date(sub.end_date) : null;
          return endDate && endDate < now;
        });
      case 'future':
        return allSubscriptions.filter(sub => {
          const startDate = new Date(sub.start_date);
          return startDate > now;
        });
      default:
        return allSubscriptions;
    }
  }, [customer.subscriptions, statusFilter]);

  const handleDelete = (subscription: CustomerSubscription) => {
    if (!confirm('Sei sicuro di voler eliminare questo abbonamento?')) {
      return;
    }

    const reason = prompt('Inserisci il motivo dell\'eliminazione (opzionale):');

    router.delete(
      route('api.v1.customer-subscriptions.destroy', { subscription: subscription.id }),
      {
        data: { reason },
        preserveScroll: true,
      }
    );
  };

  const handleEdit = (subscription: CustomerSubscription) => {
    setSelectedSubscription(subscription);
    setOpenAddDialog(true);
  };

  const handleViewHistory = (subscription: CustomerSubscription) => {
    setSelectedSubscription(subscription);
    setOpenHistoryDialog(true);
  };

  const handleAddSuccess = () => {
    setOpenAddDialog(false);
    setSelectedSubscription(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'warning';
      case 'expired':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Attivo';
      case 'suspended':
        return 'Sospeso';
      case 'expired':
        return 'Scaduto';
      case 'cancelled':
        return 'Cancellato';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'subscription':
        return 'Abbonamento';
      case 'entrance_card':
        return 'Tessera Ingressi';
      default:
        return type;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('it-IT');
  };

  return (
    <Box sx={{ p: 2 }}>
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Gestione Abbonamenti</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedSubscription(null);
                setOpenAddDialog(true);
              }}
            >
              Nuovo Abbonamento
            </Button>
          </Stack>

          <Box mb={2}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filtra per stato</InputLabel>
              <Select
                value={statusFilter}
                label="Filtra per stato"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Tutti</MenuItem>
                <MenuItem value="active">Attivi</MenuItem>
                <MenuItem value="expired">Scaduti</MenuItem>
                <MenuItem value="future">Futuri</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {subscriptions.length === 0 ? (
            <Typography>Nessun abbonamento trovato.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Listino</TableCell>
                    <TableCell>Inizio</TableCell>
                    <TableCell>Fine</TableCell>
                    <TableCell>Fine Effettiva</TableCell>
                    <TableCell>Stato</TableCell>
                    <TableCell>Giorni Sosp.</TableCell>
                    <TableCell>Giorni Est.</TableCell>
                    <TableCell align="right">Azioni</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>{getTypeLabel(subscription.type)}</TableCell>
                      <TableCell>{subscription.price_list?.name || '-'}</TableCell>
                      <TableCell>{formatDate(subscription.start_date)}</TableCell>
                      <TableCell>{formatDate(subscription.end_date)}</TableCell>
                      <TableCell>
                        <strong>{formatDate(subscription.effective_end_date)}</strong>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(subscription.status)}
                          color={getStatusColor(subscription.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{subscription.suspended_days || 0}</TableCell>
                      <TableCell>{subscription.extended_days || 0}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Visualizza storico">
                          <IconButton
                            size="small"
                            onClick={() => handleViewHistory(subscription)}
                          >
                            <HistoryIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modifica">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(subscription)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Elimina">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(subscription)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <AddSubscriptionDialog
        open={openAddDialog}
        onClose={() => {
          setOpenAddDialog(false);
          setSelectedSubscription(null);
        }}
        subscription={selectedSubscription}
        onSuccess={handleAddSuccess}
      />

      {selectedSubscription && (
        <SubscriptionHistoryDialog
          open={openHistoryDialog}
          onClose={() => {
            setOpenHistoryDialog(false);
            setSelectedSubscription(null);
          }}
          subscription={selectedSubscription}
        />
      )}
    </Box>
  );
};

export default SubscriptionsTab;

