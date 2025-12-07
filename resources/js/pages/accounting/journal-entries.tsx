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
    Divider,
    TextField,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Skeleton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { it } from 'date-fns/locale';
import DownloadIcon from '@mui/icons-material/Download';
import FormattedCurrency from '@/components/ui/FormattedCurrency';
import { format, subDays } from 'date-fns';

interface JournalEntry {
    id: string | number;
    type: 'sale' | 'payment';
    time: string;
    customer_name: string;
    customer_id: number;
    amount: number;
    financial_resource: string;
    sale_number: string;
    payment_id?: number;
}

interface DayEntries {
    entries: JournalEntry[];
    daily_total: number;
}

interface Props {
    entriesByDate: Record<string, DayEntries>;
    periodTotal: number;
    filters: {
        date_from?: string;
        date_to?: string;
        financial_resource_id?: number;
    };
}

export default function JournalEntries({ entriesByDate, periodTotal, filters }: Props) {
    const [dateFrom, setDateFrom] = useState<Date | null>(
        filters.date_from ? new Date(filters.date_from) : subDays(new Date(), 30)
    );
    const [dateTo, setDateTo] = useState<Date | null>(
        filters.date_to ? new Date(filters.date_to) : new Date()
    );

    const handleFilter = () => {
        const params: Record<string, string> = {};

        if (dateFrom) {
            params.date_from = format(dateFrom, 'yyyy-MM-dd');
        }
        if (dateTo) {
            params.date_to = format(dateTo, 'yyyy-MM-dd');
        }

        router.get(route('app.accounting.journal-entries', { tenant: route().params.tenant }), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setDateFrom(subDays(new Date(), 30));
        setDateTo(new Date());
        router.get(route('app.accounting.journal-entries', { tenant: route().params.tenant }), {}, {
            preserveState: false,
        });
    };

    const handleExport = () => {
        const params: Record<string, string> = {};

        if (dateFrom) {
            params.date_from = format(dateFrom, 'yyyy-MM-dd');
        }
        if (dateTo) {
            params.date_to = format(dateTo, 'yyyy-MM-dd');
        }

        // Build URL with query parameters
        const queryString = new URLSearchParams(params).toString();
        const exportUrl = route('app.accounting.journal-entries.export', { tenant: route().params.tenant }) +
            (queryString ? `?${queryString}` : '');

        // Trigger download
        window.location.href = exportUrl;
    };

    const getTypeLabel = (type: string) => {
        return type === 'sale' ? 'Vendita' : 'Pagamento';
    };

    const getTypeColor = (type: string): 'primary' | 'success' => {
        return type === 'sale' ? 'primary' : 'success';
    };

    return (
        <AppLayout>
            <Head title="Prima Nota" />

            <Box sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4" component="h1">
                        📊 Prima Nota
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleExport}
                        disabled={Object.keys(entriesByDate).length === 0}
                    >
                        Esporta CSV
                    </Button>
                </Stack>

                {/* Filters */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
                            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                                <DatePicker
                                    label="Data Inizio"
                                    value={dateFrom}
                                    onChange={(newValue) => setDateFrom(newValue)}
                                    slotProps={{
                                        textField: { size: 'small', sx: { minWidth: 200 } }
                                    }}
                                />
                                <DatePicker
                                    label="Data Fine"
                                    value={dateTo}
                                    onChange={(newValue) => setDateTo(newValue)}
                                    slotProps={{
                                        textField: { size: 'small', sx: { minWidth: 200 } }
                                    }}
                                />
                                <Button variant="contained" onClick={handleFilter}>
                                    Filtra
                                </Button>
                                <Button variant="outlined" onClick={handleReset}>
                                    Reset
                                </Button>
                            </Stack>
                        </LocalizationProvider>
                    </CardContent>
                </Card>

                {/* Entries by Date */}
                <Stack spacing={3}>
                    {Object.keys(entriesByDate).length === 0 ? (
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" align="center">
                                    Nessuna movimentazione trovata per il periodo selezionato
                                </Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        Object.entries(entriesByDate).map(([date, dayData]) => (
                            <Card key={date}>
                                <CardContent>
                                    <Stack spacing={2}>
                                        {/* Date Header */}
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="h6">
                                                📅 {format(new Date(date), 'EEEE dd MMMM yyyy', { locale: it })}
                                            </Typography>
                                            <Chip
                                                label={<FormattedCurrency value={dayData.daily_total} showSymbol />}
                                                color="primary"
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </Stack>

                                        <Divider />

                                        {/* Entries Table */}
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Ora</TableCell>
                                                        <TableCell>Tipo</TableCell>
                                                        <TableCell>Cliente</TableCell>
                                                        <TableCell>Documento</TableCell>
                                                        <TableCell align="right">Importo</TableCell>
                                                        <TableCell>Cassa/Banca</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {dayData.entries.map((entry) => (
                                                        <TableRow
                                                            key={entry.id}
                                                            hover
                                                            sx={{ cursor: 'pointer' }}
                                                            onClick={() => {
                                                                if (entry.type === 'sale') {
                                                                    router.visit(
                                                                        route('app.sales.show', {
                                                                            tenant: route().params.tenant,
                                                                            sale: entry.id,
                                                                        })
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            <TableCell>{entry.time}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={getTypeLabel(entry.type)}
                                                                    color={getTypeColor(entry.type)}
                                                                    size="small"
                                                                />
                                                            </TableCell>
                                                            <TableCell>{entry.customer_name}</TableCell>
                                                            <TableCell>{entry.sale_number}</TableCell>
                                                            <TableCell align="right">
                                                                <Typography fontWeight="medium">
                                                                    <FormattedCurrency value={entry.amount} showSymbol />
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>{entry.financial_resource}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </Stack>

                {/* Period Total */}
                {Object.keys(entriesByDate).length > 0 && (
                    <Card sx={{ mt: 3, bgcolor: 'primary.main', color: 'white' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6" fontWeight="bold">
                                    TOTALE PERIODO
                                </Typography>
                                <Typography variant="h5" fontWeight="bold">
                                    <FormattedCurrency value={periodTotal} showSymbol />
                                </Typography>
                            </Stack>
                        </CardContent>
                    </Card>
                )}
            </Box>
        </AppLayout>
    );
}
