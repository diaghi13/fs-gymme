import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import Autocomplete from '@/components/ui/Autocomplete';
import TextField from '@/components/ui/TextField';
import DatePicker from '@/components/ui/DatePicker';
import { Customer } from '@/types';
import { SaleFormValues } from '../sale-create';
import PersonIcon from '@mui/icons-material/Person';
import TagIcon from '@mui/icons-material/Tag';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface SaleHeaderProps {
  customers: Customer[];
}

export default function SaleHeader({ customers }: SaleHeaderProps) {
  const { values } = useFormikContext<SaleFormValues>();

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Cliente */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon color="primary" />
            <Autocomplete<Customer>
              name="customer"
              label="Cliente"
              options={customers}
              getOptionLabel={(option) => option.option_label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              placeholder="Seleziona cliente (F2)"
              size="small"
            />
          </Box>
        </Grid>

        {/* Progressivo */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TagIcon color="action" />
            <TextField
              name="progressive_number"
              label="Progressivo"
              size="small"
              disabled={!values.customer}
            />
          </Box>
        </Grid>

        {/* Data */}
        <Grid size={{ xs: 12, md: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarTodayIcon color="action" />
            <DatePicker name="date" label="Data" disabled={!values.customer} />
          </Box>
        </Grid>

        {/* Anno */}
        <Grid size={{ xs: 12, md: 2 }}>
          <TextField
            name="year"
            label="Anno"
            type="number"
            size="small"
            disabled={!values.customer}
          />
        </Grid>
      </Grid>

      {values.customer && (
        <Box sx={{ mt: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {values.customer.email}
          </Typography>
          {values.customer.phone && (
            <Typography variant="caption" color="text.secondary">
              • {values.customer.phone}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
