import React, { useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
    Chip,
    Button,
    Tab,
    Tabs,
    Paper,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import FormattedCurrency from '@/components/ui/FormattedCurrency';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
}

interface Payment {
    id: number;
    sale_id: number;
    sale_number: string;
    customer: Customer;
    amount: number;
    due_date: string;
    days_overdue: number;
    status: string;
    payment_method: string;
}

interface Statistics {
    total_receivables: number;
    overdue_count: number;
    customers_with_overdue: number;
    average_days_overdue: number;
}

interface Props {
    payments: Payment[];
    statistics: Statistics;
    filters: {
        status?: string;
        customer_id?: number;
    };
}

export default function PendingPayments({ payments, statistics, filters }: Props) {
    const [currentTab, setCurrentTab] = useState(filters.status || 'overdue');
    const [markAsPaidDialogOpen, setMarkAsPaidDialogOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setCurrentTab(newValue);
        router.get(
            route('app.accounting.pending-payments', { tenant: route().params.tenant }),
            { status: newValue },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleExport = () => {
        const params: Record<string, string> = {
            status: currentTab,
        };

        // Build URL with query parameters
        const queryString = new URLSearchParams(params).toString();
        const exportUrl = route('app.accounting.pending-payments.export', { tenant: route().params.tenant }) +
            (queryString ? `?${queryString}` : '');

        // Trigger download
        window.location.href = exportUrl;
    };

    const handleMarkAsPaidClick = (payment: Payment) => {
        setSelectedPayment(payment);
        setMarkAsPaidDialogOpen(true);
    };

    const handleMarkAsPaidConfirm = () => {
        if (!selectedPayment) return;

        router.patch(
            route('app.accounting.payments.mark-as-paid', {
                tenant: route().params.tenant,
                payment: selectedPayment.id,
            }),
            {},
            {
                onSuccess: () => {
                    setMarkAsPaidDialogOpen(false);
                    setSelectedPayment(null);
                },
            }
        );
    };

    const handleMarkAsPaidCancel = () => {
        setMarkAsPaidDialogOpen(false);
        setSelectedPayment(null);
    };

    const handleSendReminder = (payment: Payment) => {
        if (window.confirm('Sei sicuro di voler inviare un promemoria via email al cliente?')) {
            router.post(
                route('app.accounting.payments.send-reminder', {
                    tenant: route().params.tenant,
                    payment: payment.id,
                }),
                {}
            );
        }
    };

    const getDaysOverdueColor = (days: number) => {
        if (days === 0) return 'warning';
        if (days < 7) return 'warning';
        if (days < 30) return 'error';
        return 'error';
    };

    const getDaysOverdueLabel = (days: number) => {
        if (days === 0) return 'In scadenza';
        if (days === 1) return '1 giorno';
        return `${days} giorni`;
    };

    const columns: GridColDef[] = [
        {
            field: 'customer_name',
            headerName: 'Cliente',
            flex: 1,
            minWidth: 200,
            valueGetter: (value, row) => row.customer.name,
        },
        {
            field: 'sale_number',
            headerName: 'Documento',
            width: 130,
        },
        {
            field: 'due_date',
            headerName: 'Scadenza',
            width: 130,
            valueFormatter: (value) => {
                return format(new Date(value), 'dd/MM/yyyy', { locale: it });
            },
        },
        {
            field: 'days_overdue',
            headerName: 'Ritardo',
            width: 130,
            renderCell: (params: GridRenderCellParams) => {
                if (params.value === 0) return <Chip label="Oggi" color="warning" size="small" />;
                return (
                    <Chip
                        label={getDaysOverdueLabel(params.value)}
                        color={getDaysOverdueColor(params.value)}
                        size="small"
                    />
                );
            },
        },
        {
            field: 'amount',
            headerName: 'Importo',
            width: 130,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params: GridRenderCellParams) => (
                <Typography fontWeight="medium">
                    <FormattedCurrency value={params.value} showSymbol />
                </Typography>
            ),
        },
        {
            field: 'payment_method',
            headerName: 'Metodo',
            width: 130,
        },
        {
            field: 'actions',
            headerName: 'Azioni',
            width: 250,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" spacing={1}>
                    <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsPaidClick(params.row);
                        }}
                    >
                        Pagato
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<EmailIcon />}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSendReminder(params.row);
                        }}
                    >
                        Invia
                    </Button>
                </Stack>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Pagamenti In Sospeso" />

            <Box sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4" component="h1">
                        💰 Pagamenti In Sospeso
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleExport}
                        disabled={payments.length === 0}
                    >
                        Esporta CSV
                    </Button>
                </Stack>

                {/* Statistics Cards */}
                <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" variant="body2" gutterBottom>
                                    Totale Crediti
                                </Typography>
                                <Typography variant="h5" fontWeight="bold" color="error">
                                    <FormattedCurrency value={statistics.total_receivables} showSymbol />
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" variant="body2" gutterBottom>
                                    Rate Scadute
                                </Typography>
                                <Typography variant="h5" fontWeight="bold" color="error">
                                    {statistics.overdue_count}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" variant="body2" gutterBottom>
                                    Clienti Morosi
                                </Typography>
                                <Typography variant="h5" fontWeight="bold" color="warning.main">
                                    {statistics.customers_with_overdue}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" variant="body2" gutterBottom>
                                    Media Ritardo
                                </Typography>
                                <Typography variant="h5" fontWeight="bold">
                                    {Math.round(statistics.average_days_overdue || 0)} gg
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Tabs */}
                <Card>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={currentTab} onChange={handleTabChange}>
                            <Tab
                                label={
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <span>🔴 Scaduti</span>
                                        <Chip
                                            label={statistics.overdue_count}
                                            size="small"
                                            color="error"
                                        />
                                    </Stack>
                                }
                                value="overdue"
                            />
                            <Tab label="🟡 In Scadenza (7gg)" value="upcoming" />
                            <Tab label="📋 Tutti" value="all" />
                        </Tabs>
                    </Box>

                    <CardContent>
                        {payments.length === 0 ? (
                            <Typography color="text.secondary" align="center" py={4}>
                                {currentTab === 'overdue' && 'Nessun pagamento scaduto 🎉'}
                                {currentTab === 'upcoming' && 'Nessun pagamento in scadenza'}
                                {currentTab === 'all' && 'Nessun pagamento in sospeso'}
                            </Typography>
                        ) : (
                            <Box sx={{ height: 600, width: '100%' }}>
                                <DataGrid
                                    rows={payments}
                                    columns={columns}
                                    pageSizeOptions={[10, 25, 50, 100]}
                                    initialState={{
                                        pagination: {
                                            paginationModel: { pageSize: 25, page: 0 },
                                        },
                                        sorting: {
                                            sortModel: [{ field: 'days_overdue', sort: 'desc' }],
                                        },
                                    }}
                                    disableRowSelectionOnClick
                                    onRowClick={(params) => {
                                        router.visit(
                                            route('app.sales.show', {
                                                tenant: route().params.tenant,
                                                sale: params.row.sale_id,
                                            })
                                        );
                                    }}
                                    sx={{
                                        '& .MuiDataGrid-row': {
                                            cursor: 'pointer',
                                        },
                                    }}
                                />
                            </Box>
                        )}
                    </CardContent>
                </Card>

                {/* Help Text */}
                <Card sx={{ mt: 3, bgcolor: 'info.light' }}>
                    <CardContent>
                        <Typography variant="body2" color="info.contrastText">
                            💡 <strong>Suggerimento:</strong> Clicca su una riga per visualizzare i dettagli della
                            vendita. Usa il bottone "Pagato" per segnare un pagamento come ricevuto.
                        </Typography>
                    </CardContent>
                </Card>

                {/* Mark as Paid Dialog */}
                <Dialog
                    open={markAsPaidDialogOpen}
                    onClose={handleMarkAsPaidCancel}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Conferma Pagamento Ricevuto</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Sei sicuro di voler segnare questo pagamento come ricevuto?
                        </DialogContentText>
                        {selectedPayment && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                                <Stack spacing={1}>
                                    <Typography variant="body2">
                                        <strong>Cliente:</strong> {selectedPayment.customer.name}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Documento:</strong> {selectedPayment.sale_number}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Importo:</strong>{' '}
                                        <FormattedCurrency value={selectedPayment.amount} showSymbol />
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Scadenza:</strong>{' '}
                                        {format(new Date(selectedPayment.due_date), 'dd/MM/yyyy', { locale: it })}
                                    </Typography>
                                </Stack>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleMarkAsPaidCancel} color="inherit">
                            Annulla
                        </Button>
                        <Button
                            onClick={handleMarkAsPaidConfirm}
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                        >
                            Conferma Pagamento
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </AppLayout>
    );
}
