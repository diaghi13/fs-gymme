import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { PageProps, Sale } from '@/types';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Grid,
  IconButton,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { format } from 'date-fns';

interface SaleIndexProps extends PageProps {
  sales: {
    data: Sale[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: {
    search?: string;
    status?: string;
    payment_status?: string;
    electronic_invoice_status?: string;
    date_from?: string;
    date_to?: string;
  };
  stats: {
    total_amount: number;
    paid_count: number;
    unpaid_count: number;
  };
}

// Status configurations con colori MUI
const statusConfig = {
  sale: {
    draft: { label: 'Bozza', color: 'default' as const },
    saved: { label: 'Salvata', color: 'primary' as const },
    sent: { label: 'Inviata', color: 'info' as const },
    canceled: { label: 'Annullata', color: 'error' as const },
  },
  payment: {
    pending: { label: 'In attesa', color: 'warning' as const },
    partial: { label: 'Parziale', color: 'info' as const },
    paid: { label: 'Pagato', color: 'success' as const },
    not_paid: { label: 'Non pagato', color: 'error' as const },
  },
  electronic_invoice: {
    draft: { label: 'Bozza', color: 'default' as const },
    generated: { label: 'XML Generato', color: 'info' as const },
    to_send: { label: 'Da Inviare', color: 'primary' as const },
    sending: { label: 'In Invio', color: 'secondary' as const },
    sent: { label: 'Inviata', color: 'warning' as const },
    accepted: { label: 'Accettata', color: 'success' as const },
    delivered: { label: 'Consegnata', color: 'success' as const },
    rejected: { label: 'Rifiutata', color: 'error' as const },
    delivery_failed: { label: 'Mancata Consegna', color: 'error' as const },
    cancelled: { label: 'Annullata', color: 'default' as const },
  },
  sdi_status: {
    draft: { label: 'Bozza', color: 'default' as const, isError: false },
    generated: { label: 'Preso in Carico', color: 'info' as const, isError: false },
    to_send: { label: 'Da Inviare', color: 'primary' as const, isError: false },
    sending: { label: 'In Invio', color: 'secondary' as const, isError: false },
    sent: { label: 'Inviato al SDI', color: 'warning' as const, isError: false },
    accepted: { label: 'Accettato', color: 'success' as const, isError: false },
    delivered: { label: 'Consegnato', color: 'success' as const, isError: false },
    rejected: { label: 'Rifiutato', color: 'error' as const, isError: true },
    delivery_failed: { label: 'Mancata Consegna', color: 'error' as const, isError: true },
    cancelled: { label: 'Annullato', color: 'default' as const, isError: false },
  },
};

export default function SaleIndex({ auth, sales, filters, stats, currentTenantId }: SaleIndexProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const handleSearch = () => {
    router.get(
      route('app.sales.index', { tenant: currentTenantId }),
      localFilters as any,
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };

  const handleResetFilters = () => {
    const emptyFilters = {
      search: '',
      status: '',
      payment_status: '',
      electronic_invoice_status: '',
      date_from: '',
      date_to: '',
    };
    setLocalFilters(emptyFilters);
    router.get(route('app.sales.index', { tenant: currentTenantId }), {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleNewSale = () => {
    router.get(route('app.sales.create', { tenant: currentTenantId }));
  };

  const handleViewSale = (id: number) => {
    router.get(route('app.sales.show', { tenant: currentTenantId, sale: id }));
  };

  const columns: GridColDef[] = [
    {
      field: 'progressive_number',
      headerName: 'Numero',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
          <ReceiptIcon fontSize="small" color="action" />
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'date',
      headerName: 'Data',
      width: 110,
      valueFormatter: (params) => format(new Date(params), 'dd/MM/yyyy'),
    },
    {
      field: 'customer',
      headerName: 'Cliente',
      flex: 1,
      minWidth: 200,
      valueGetter: (params) => params.full_name,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography variant="body2" noWrap>
            {params.row.customer.full_name}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'gross_total',
      headerName: 'Totale',
      width: 120,
      align: 'right' as const,
      headerAlign: 'right' as const,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%', width: '100%' }}>
          <Typography variant="body2" fontWeight="medium">
            {formatCurrency(params.value)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'xml_generated',
      headerName: 'XML',
      width: 80,
      align: 'center' as const,
      headerAlign: 'center' as const,
      valueGetter: (params, row) => row.electronic_invoice?.xml_generated ?? false,
      renderCell: (params: GridRenderCellParams) => {
        const xmlGenerated = params.row.electronic_invoice?.xml_generated;

        if (!params.row.electronic_invoice) {
          return (
            <Typography variant="caption" color="text.secondary">
              -
            </Typography>
          );
        }

        return (
          <Tooltip title={xmlGenerated ? 'XML Generato' : 'XML Non Generato'}>
            {xmlGenerated ? (
              <CheckCircleIcon color="success" fontSize="small" />
            ) : (
              <CancelIcon color="disabled" fontSize="small" />
            )}
          </Tooltip>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Stato',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const config = statusConfig.sale[params.value as keyof typeof statusConfig.sale];
        return config ? (
          <Chip label={config.label} color={config.color} size="small" />
        ) : (
          <Chip label={params.value} size="small" />
        );
      },
    },
    {
      field: 'payment_status',
      headerName: 'Pagamento',
      width: 130,
      renderCell: (params: GridRenderCellParams) => {
        const config = statusConfig.payment[params.value as keyof typeof statusConfig.payment];
        return config ? (
          <Chip label={config.label} color={config.color} size="small" variant="outlined" />
        ) : (
          <Chip label={params.value} size="small" variant="outlined" />
        );
      },
    },
    {
      field: 'sdi_status',
      headerName: 'SDI',
      width: 100,
      valueGetter: (params, row) => row.electronic_invoice?.sdi_status ?? null,
      renderCell: (params: GridRenderCellParams) => {
        const electronicInvoice = params.row.electronic_invoice;

        if (!electronicInvoice?.sdi_status) {
          return (
            <Typography variant="caption" color="text.secondary">
              -
            </Typography>
          );
        }

        // Match SDI status config
        const sdiStatus = electronicInvoice.sdi_status.toLowerCase();
        const config = statusConfig.sdi_status[sdiStatus as keyof typeof statusConfig.sdi_status];

        // Determine label and color
        const label = config?.label || electronicInvoice.sdi_status;
        const color = config?.color || 'default';
        const isError = config?.isError || false;

        // Check if there are send errors
        const hasError = electronicInvoice.error_message || (electronicInvoice.send_attempts > 0 && isError);

        return (
          <Tooltip
            title={
              <Box>
                <Typography variant="caption" display="block">
                  <strong>Stato SDI:</strong> {label}
                </Typography>
                {electronicInvoice.transmission_id && (
                  <Typography variant="caption" display="block">
                    <strong>ID Trasmissione:</strong> {electronicInvoice.transmission_id}
                  </Typography>
                )}
                {electronicInvoice.send_attempts > 0 && (
                  <Typography variant="caption" display="block">
                    <strong>Tentativi Invio:</strong> {electronicInvoice.send_attempts}
                  </Typography>
                )}
                {electronicInvoice.last_send_attempt_at && (
                  <Typography variant="caption" display="block">
                    <strong>Ultimo Tentativo:</strong> {electronicInvoice.last_send_attempt_at}
                  </Typography>
                )}
                {electronicInvoice.error_message && (
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{
                      mt: 1,
                      p: 1,
                      bgcolor: 'error.main',
                      color: 'error.contrastText',
                      borderRadius: 1,
                      fontWeight: 'bold',
                    }}
                  >
                    ⚠ ERRORE: {electronicInvoice.error_message}
                  </Typography>
                )}
                {isError && !electronicInvoice.error_message && (
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{
                      mt: 0.5,
                      p: 0.5,
                      bgcolor: 'warning.main',
                      color: 'warning.contrastText',
                      borderRadius: 1,
                    }}
                  >
                    ⚠ Richiede attenzione
                  </Typography>
                )}
              </Box>
            }
          >
            <Chip
              label={label}
              size="small"
              variant={hasError ? 'filled' : 'outlined'}
              color={hasError ? 'error' : color}
            />
          </Tooltip>
        );
      },
    },
    {
      field: 'actions',
      headerName: '',
      width: 80,
      sortable: false,
      align: 'center' as const,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title="Visualizza">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleViewSale(params.row.id);
            }}
            color="primary"
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <AppLayout user={auth.user} title="Vendite">
      <Head title="Vendite" />

      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight="bold">
            Vendite
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewSale}
            size="large"
          >
            Nuova Vendita
          </Button>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Totale Vendite
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {sales.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Valore Totale
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {formatCurrency(stats.total_amount)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Pagate
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {stats.paid_count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Non Pagate
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="error.main">
                  {stats.unpaid_count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Cerca per numero o cliente..."
              value={localFilters.search || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
              sx={{ minWidth: 300 }}
            />

            <Button
              variant={showFilters ? 'contained' : 'outlined'}
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              size="small"
            >
              Filtri
            </Button>

            <Button variant="contained" onClick={handleSearch} size="small">
              Cerca
            </Button>

            {Object.values(localFilters).some((v) => v) && (
              <Button variant="text" onClick={handleResetFilters} size="small" color="inherit">
                Reset
              </Button>
            )}
          </Box>

          {/* Advanced Filters */}
          {showFilters && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Stato</InputLabel>
                  <Select
                    value={localFilters.status || ''}
                    onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
                    label="Stato"
                  >
                    <MenuItem value="">Tutti</MenuItem>
                    {Object.entries(statusConfig.sale).map(([value, config]) => (
                      <MenuItem key={value} value={value}>
                        {config.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Pagamento</InputLabel>
                  <Select
                    value={localFilters.payment_status || ''}
                    onChange={(e) => setLocalFilters({ ...localFilters, payment_status: e.target.value })}
                    label="Pagamento"
                  >
                    <MenuItem value="">Tutti</MenuItem>
                    {Object.entries(statusConfig.payment).map(([value, config]) => (
                      <MenuItem key={value} value={value}>
                        {config.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Fattura Elettronica</InputLabel>
                  <Select
                    value={localFilters.electronic_invoice_status || ''}
                    onChange={(e) => setLocalFilters({ ...localFilters, electronic_invoice_status: e.target.value })}
                    label="Fattura Elettronica"
                  >
                    <MenuItem value="">Tutti</MenuItem>
                    {Object.entries(statusConfig.electronic_invoice).map(([value, config]) => (
                      <MenuItem key={value} value={value}>
                        {config.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Stack direction="row" spacing={1}>
                  <TextField
                    label="Da"
                    type="date"
                    value={localFilters.date_from || ''}
                    onChange={(e) => setLocalFilters({ ...localFilters, date_from: e.target.value })}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <TextField
                    label="A"
                    type="date"
                    value={localFilters.date_to || ''}
                    onChange={(e) => setLocalFilters({ ...localFilters, date_to: e.target.value })}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Stack>
              </Grid>
            </Grid>
          )}
        </Paper>

        {/* DataGrid */}
        <Paper sx={{ height: 600 }}>
          <DataGrid
            rows={sales.data}
            columns={columns}
            pageSizeOptions={[25, 50, 100]}
            disableRowSelectionOnClick
            sx={{
              border: 0,
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-row:hover': {
                cursor: 'pointer',
                bgcolor: 'action.hover',
              },
            }}
            onRowClick={(params) => handleViewSale(params.row.id)}
          />
        </Paper>
      </Box>
    </AppLayout>
  );
}
