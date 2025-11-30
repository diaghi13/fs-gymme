import React from 'react';
import {
    Box,
    Paper,
    TextField,
    MenuItem,
    Button,
    Chip,
    Stack,
    IconButton,
    Collapse,
    Divider,
    Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Filter, X, Search, Download } from 'lucide-react';
import { router } from '@inertiajs/react';

interface FilterOptions {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    customer?: string;
    minAmount?: number;
    maxAmount?: number;
    transmission_id?: string;
}

interface ElectronicInvoiceFiltersProps {
    filters: FilterOptions;
    onFilterChange: (filters: FilterOptions) => void;
    onExport?: () => void;
}

const statusOptions = [
    { value: '', label: 'Tutti gli stati' },
    { value: 'generated', label: 'Generata' },
    { value: 'sent', label: 'Inviata' },
    { value: 'delivered', label: 'Consegnata' },
    { value: 'accepted', label: 'Accettata' },
    { value: 'rejected', label: 'Rifiutata' },
];

export default function ElectronicInvoiceFilters({
    filters,
    onFilterChange,
    onExport,
}: ElectronicInvoiceFiltersProps) {
    const [expanded, setExpanded] = React.useState(false);
    const [localFilters, setLocalFilters] = React.useState<FilterOptions>(filters);

    const hasActiveFilters = Object.values(filters).some((value) => value !== undefined && value !== '');

    const handleFilterChange = (key: keyof FilterOptions, value: any) => {
        setLocalFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const applyFilters = () => {
        onFilterChange(localFilters);
    };

    const clearFilters = () => {
        const emptyFilters: FilterOptions = {
            status: '',
            dateFrom: '',
            dateTo: '',
            customer: '',
            minAmount: undefined,
            maxAmount: undefined,
            transmission_id: '',
        };
        setLocalFilters(emptyFilters);
        onFilterChange(emptyFilters);
    };

    const getActiveFiltersCount = () => {
        return Object.values(localFilters).filter((value) => value !== undefined && value !== '').length;
    };

    return (
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        variant={expanded ? 'contained' : 'outlined'}
                        startIcon={<Filter size={18} />}
                        onClick={() => setExpanded(!expanded)}
                        size="small"
                    >
                        Filtri {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
                    </Button>

                    {hasActiveFilters && (
                        <Button
                            variant="text"
                            startIcon={<X size={18} />}
                            onClick={clearFilters}
                            size="small"
                            color="error"
                        >
                            Rimuovi Filtri
                        </Button>
                    )}
                </Box>

                {onExport && (
                    <Button
                        variant="outlined"
                        startIcon={<Download size={18} />}
                        onClick={onExport}
                        size="small"
                    >
                        Esporta Excel
                    </Button>
                )}
            </Box>

            {/* Active Filters Chips */}
            {hasActiveFilters && !expanded && (
                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                    {localFilters.status && (
                        <Chip
                            label={`Stato: ${statusOptions.find((o) => o.value === localFilters.status)?.label}`}
                            onDelete={() => handleFilterChange('status', '')}
                            size="small"
                        />
                    )}
                    {localFilters.dateFrom && (
                        <Chip
                            label={`Da: ${new Date(localFilters.dateFrom).toLocaleDateString('it-IT')}`}
                            onDelete={() => handleFilterChange('dateFrom', '')}
                            size="small"
                        />
                    )}
                    {localFilters.dateTo && (
                        <Chip
                            label={`A: ${new Date(localFilters.dateTo).toLocaleDateString('it-IT')}`}
                            onDelete={() => handleFilterChange('dateTo', '')}
                            size="small"
                        />
                    )}
                    {localFilters.customer && (
                        <Chip
                            label={`Cliente: ${localFilters.customer}`}
                            onDelete={() => handleFilterChange('customer', '')}
                            size="small"
                        />
                    )}
                    {localFilters.minAmount !== undefined && (
                        <Chip
                            label={`Min: €${localFilters.minAmount}`}
                            onDelete={() => handleFilterChange('minAmount', undefined)}
                            size="small"
                        />
                    )}
                    {localFilters.maxAmount !== undefined && (
                        <Chip
                            label={`Max: €${localFilters.maxAmount}`}
                            onDelete={() => handleFilterChange('maxAmount', undefined)}
                            size="small"
                        />
                    )}
                </Stack>
            )}

            {/* Expanded Filters */}
            <Collapse in={expanded}>
                <Divider sx={{ mb: 3 }} />

                <Stack spacing={3}>
                    {/* Row 1: Status + Transmission ID */}
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <TextField
                            select
                            label="Stato Fattura"
                            value={localFilters.status || ''}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            size="small"
                            fullWidth
                        >
                            {statusOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="ID Trasmissione"
                            value={localFilters.transmission_id || ''}
                            onChange={(e) => handleFilterChange('transmission_id', e.target.value)}
                            placeholder="ES: IT01234567890_00001"
                            size="small"
                            fullWidth
                        />
                    </Stack>

                    {/* Row 2: Date Range */}
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <DatePicker
                            label="Data Da"
                            value={localFilters.dateFrom ? new Date(localFilters.dateFrom) : null}
                            onChange={(date) =>
                                handleFilterChange('dateFrom', date ? date.toISOString().split('T')[0] : '')
                            }
                            slotProps={{
                                textField: { size: 'small', fullWidth: true },
                            }}
                        />

                        <DatePicker
                            label="Data A"
                            value={localFilters.dateTo ? new Date(localFilters.dateTo) : null}
                            onChange={(date) =>
                                handleFilterChange('dateTo', date ? date.toISOString().split('T')[0] : '')
                            }
                            slotProps={{
                                textField: { size: 'small', fullWidth: true },
                            }}
                        />
                    </Stack>

                    {/* Row 3: Amount Range + Customer */}
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <TextField
                            label="Importo Minimo"
                            type="number"
                            value={localFilters.minAmount || ''}
                            onChange={(e) =>
                                handleFilterChange('minAmount', e.target.value ? parseFloat(e.target.value) : undefined)
                            }
                            InputProps={{
                                startAdornment: '€',
                            }}
                            size="small"
                            fullWidth
                        />

                        <TextField
                            label="Importo Massimo"
                            type="number"
                            value={localFilters.maxAmount || ''}
                            onChange={(e) =>
                                handleFilterChange('maxAmount', e.target.value ? parseFloat(e.target.value) : undefined)
                            }
                            InputProps={{
                                startAdornment: '€',
                            }}
                            size="small"
                            fullWidth
                        />

                        <TextField
                            label="Cliente"
                            value={localFilters.customer || ''}
                            onChange={(e) => handleFilterChange('customer', e.target.value)}
                            placeholder="Nome o Ragione Sociale"
                            size="small"
                            fullWidth
                        />
                    </Stack>

                    {/* Actions */}
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button variant="outlined" onClick={clearFilters}>
                            Reset
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Search size={18} />}
                            onClick={applyFilters}
                        >
                            Applica Filtri
                        </Button>
                    </Stack>
                </Stack>
            </Collapse>
        </Paper>
    );
}

