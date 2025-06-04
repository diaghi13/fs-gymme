import React, { useEffect, useState } from 'react';
import { Box, Button, Divider, List, Typography } from '@mui/material';
import MyCard from '@/components/ui/MyCard';
import { useTheme } from '@mui/material/styles';
import { useFormikContext } from 'formik';
import { SaleRowFormValues } from '@/support/createCartItem';
import CartItem from '@/components/sales/CartItem';
import { SaleFormValues } from '@/pages/sales/sales';
import { SaleDiscountTypes, useSaleContext } from '@/Contexts/Sale/SaleContext';

export default function() {
  const { values, setFieldValue } = useFormikContext<SaleFormValues>();
  const theme = useTheme();
  const [quantity, setQuantity] = useState(0);
  const { setSaleRows, setSaleDiscount, sale_price, discount_absolute } = useSaleContext();

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
                  alignItems: 'center',
                  justifyContent: 'start'
                }}
              >
                <Typography fontWeight={800} marginBottom={1}>
                  Totale lordo: € {sale_price.toFixed(2).replace('.', ',')}
                </Typography>
                <Typography fontWeight={800} marginBottom={1} color="secondary">
                  Sconto totale: € {discount_absolute?.toFixed(2).replace('.', ',')}
                </Typography>
                <Typography fontWeight={800} marginBottom={2}>
                  Totale: € {sale_price.toFixed(2).replace('.', ',')}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    setFieldValue('sale_contents', []);
                  }}
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
