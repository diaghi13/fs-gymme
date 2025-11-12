import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Divider, List, Skeleton, Typography } from '@mui/material';
import MyCard from '@/components/ui/MyCard';
import { useTheme } from '@mui/material/styles';
import { useFormikContext } from 'formik';
import { SaleRowFormValues } from '@/support/createCartItem';
import CartItem from '@/components/sales/CartItem';
import { SaleFormValues } from '@/pages/sales/sales';
import { SaleDiscountTypes, useSaleContext } from '@/Contexts/Sale/SaleContext';
import { useQuickCalculate } from '@/hooks/useQuickCalculate';

export default function() {
  const { values, setFieldValue } = useFormikContext<SaleFormValues>();
  const theme = useTheme();
  const [quantity, setQuantity] = useState(0);
  const { setSaleRows, setSaleDiscount } = useSaleContext();
  const { result, isCalculating, error, calculate } = useQuickCalculate(300);

  useEffect(() => {
    setQuantity(values.sale_contents.length);
  }, [values.sale_contents]);

  useEffect(() => {
    setSaleRows(values.sale_contents);
  }, [setSaleRows, values.sale_contents]);

  useEffect(() => {
    setSaleDiscount({name: SaleDiscountTypes.PERCENTAGE, discount: values.discount_percentage});
  }, [setSaleDiscount, values.discount_percentage]);

  useEffect(() => {
    setSaleDiscount({name: SaleDiscountTypes.ABSOLUTE, discount: values.discount_absolute});
  }, [setSaleDiscount, values.discount_absolute]);

  // Trigger real-time API calculation when sale data changes
  useEffect(() => {
    if (values.sale_contents.length === 0) {
      return;
    }

    const rows = values.sale_contents.map(content => ({
      unit_price: content.unit_price || 0,
      quantity: content.quantity || 1,
      percentage_discount: content.percentage_discount || null,
      absolute_discount: content.absolute_discount || 0,
      vat_rate_percentage: content.price_list?.vat_rate?.percentage || null,
    }));

    calculate({
      rows,
      sale_percentage_discount: values.discount_percentage || null,
      sale_absolute_discount: values.discount_absolute || 0,
    });
  }, [values.sale_contents, values.discount_percentage, values.discount_absolute, calculate]);

  // useEffect(() => {
  //   // Aggiorna discount_absolute solo se discount_percentage cambia manualmente
  //   if (values.discount_percentage > 0 &&
  //     Math.abs(values.discount_absolute - (values.discount_percentage / 100) * sale_price) > 0.01) {
  //     const discount = (values.discount_percentage / 100) * sale_price;
  //     setFieldValue('discount_absolute', discount);
  //   }
  //   if (values.discount_percentage === 0 && values.discount_absolute !== 0) {
  //     setFieldValue('discount_absolute', 0);
  //   }
  // }, [sale_price, setFieldValue, values.discount_percentage]);
  //
  // useEffect(() => {
  //   // Aggiorna discount_percentage solo se discount_absolute cambia manualmente
  //   if (values.discount_absolute > 0 &&
  //     Math.abs(values.discount_percentage - (values.discount_absolute / sale_price) * 100) > 0.01) {
  //     const percentage = (values.discount_absolute / sale_price) * 100;
  //     setFieldValue('discount_percentage', percentage);
  //   }
  //   if (values.discount_absolute === 0 && values.discount_percentage !== 0) {
  //     setFieldValue('discount_percentage', 0);
  //   }
  // }, [sale_price, setFieldValue, values.discount_absolute]);

  // Format currency for display
  const formatCurrency = (euros: number) => {
    return euros.toFixed(2).replace('.', ',');
  };

  return (
    <MyCard title={'Carrello'} sx={{ p: 0 }} bgColor={theme.palette.primary.main}>
      <>
        {!quantity && <Typography>Nessun articolo presente nel carrello</Typography>}
        {quantity > 0 && (
          <React.Fragment>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                mb: 2
              }}
            >
              <Typography fontWeight={800}>
                Q.tà articoli: {quantity}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'start',
                  gap: 0.5
                }}
              >
                {/* Show loading skeleton during calculation */}
                {isCalculating && !result ? (
                  <>
                    <Skeleton variant="text" width={150} height={24} />
                    <Skeleton variant="text" width={150} height={24} />
                    <Skeleton variant="text" width={150} height={32} />
                  </>
                ) : result ? (
                  <>
                    <Typography fontWeight={600} variant="body2">
                      Imponibile: € {formatCurrency(result.subtotal)}
                    </Typography>
                    <Typography fontWeight={600} variant="body2" color="text.secondary">
                      IVA: € {formatCurrency(result.tax_total)}
                    </Typography>
                    <Divider sx={{ width: '100%', my: 0.5 }} />
                    <Typography fontWeight={800} variant="h6" color="primary.main">
                      TOTALE: € {formatCurrency(result.total)}
                    </Typography>
                    {isCalculating && (
                      <CircularProgress size={16} sx={{ mt: 0.5 }} />
                    )}
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Calcolo in corso...
                  </Typography>
                )}

                {error && (
                  <Alert severity="error" sx={{ mt: 1, width: '100%' }}>
                    {error}
                  </Alert>
                )}

                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    setFieldValue('sale_contents', []);
                  }}
                  sx={{ mt: 2 }}
                >
                  SVUOTA CARRELLO
                </Button>
              </Box>
            </Box>
            <Divider />
            <List>
              {values.sale_contents.map((content: SaleRowFormValues, index: number) =>
                <CartItem key={index} content={content} index={index} />
              )}
            </List>
          </React.Fragment>
        )}
      </>
    </MyCard>
  );
};
