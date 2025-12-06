import React from 'react';
import { Box, Paper, Typography, Grid, InputAdornment } from '@mui/material';
import { useFormikContext } from 'formik';
import { SaleFormValues } from '../sale-create';
import TextField from '@/components/ui/TextField';
import DiscountIcon from '@mui/icons-material/Discount';
import PercentIcon from '@mui/icons-material/Percent';
import EuroIcon from '@mui/icons-material/Euro';
import { useSaleContext, SaleDiscountTypes } from '@/contexts/Sale/SaleContext';

export default function DiscountsSection() {
  const { values, setFieldValue } = useFormikContext<SaleFormValues>();
  const { sale_price, setSaleDiscount } = useSaleContext();

  const handlePercentageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const percentage = parseFloat(event.target.value.replace(',', '.')) || 0;
    const absoluteDiscount = (sale_price * percentage) / 100;

    await setFieldValue('discount_percentage', percentage);
    await setFieldValue('discount_absolute', absoluteDiscount);
    setSaleDiscount({ name: SaleDiscountTypes.PERCENTAGE, discount: percentage });
  };

  const handleAbsoluteChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const absolute = parseFloat(event.target.value.replace(',', '.')) || 0;
    const percentage = sale_price > 0 ? (absolute / sale_price) * 100 : 0;

    await setFieldValue('discount_absolute', absolute);
    await setFieldValue('discount_percentage', percentage);
    setSaleDiscount({ name: SaleDiscountTypes.ABSOLUTE, discount: absolute });
  };

  return (
    <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <DiscountIcon color="primary" />
        <Typography variant="h6">Sconti Vendita</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Applica uno sconto globale all'intera vendita
      </Typography>

      <Grid container spacing={2}>
        <Grid size={6}>
          <TextField
            name="discount_percentage"
            label="Sconto Percentuale"
            type="number"
            onChange={handlePercentageChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PercentIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            name="discount_absolute"
            label="Sconto Assoluto"
            type="number"
            onChange={handleAbsoluteChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EuroIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      {(values.discount_percentage > 0 || values.discount_absolute > 0) && (
        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'success.lighter', borderRadius: 1 }}>
          <Typography variant="body2" color="success.dark">
            Sconto applicato: {values.discount_percentage > 0 ? `${values.discount_percentage.toFixed(2)}%` : `€${values.discount_absolute.toFixed(2)}`}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
