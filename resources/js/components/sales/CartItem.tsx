import React, { useState } from 'react';
import { Box, Grid, IconButton, ListItem, Stack, Typography, TextField as MuiTextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFormikContext } from 'formik';
import { itNumberForma } from '@/support/format';
import { PriceListMembershipFee, PriceListSubscriptionContent } from '@/types';
import { Str } from '@/support/Str';
import { SaleRowFormValues } from '@/support/createCartItem';
import { SaleFormValues } from '@/pages/sales/sales';
import MoneyTextField from '@/components/ui/MoneyTextField';
import { addDays, addMonths } from 'date-fns';
import { MEMBERSHIP } from '@/pages/price-lists/price-lists';
import { NumericFormat } from 'react-number-format';
import MyMath from '@/support/Math';

export const expiryDateCalculator = (startDate: Date | null | undefined, priceListSubscriptionContent: PriceListSubscriptionContent | PriceListMembershipFee) => {
  if (!startDate || !priceListSubscriptionContent) {
    throw new Error('No date or subscription provided!');
  }

  const endDate = addMonths(new Date(startDate), priceListSubscriptionContent.months_duration ?? 0);

  if ('days_duration' in priceListSubscriptionContent) {
    addDays(endDate, priceListSubscriptionContent.days_duration ?? 0);
  }

  return endDate;
};

export default function CartItem({ content, index }: { content: SaleRowFormValues, index: number }) {
  const { values, setFieldValue } = useFormikContext<SaleFormValues>();

  const handleRemove = () => {
    const index = values.sale_contents.indexOf(values.sale_contents.find(item => item.price_list.id === content.price_list.id) as SaleRowFormValues);
    const prev = [...values.sale_contents];
    prev.splice(index, 1);

    setFieldValue('sale_contents', prev);
  };

  return (
    <ListItem>
      <Grid container>
        <Grid size={{ xs: 7, md: 8 }}>
          <Typography variant="h6" component="p">
            {content.price_list.name}
          </Typography>
        </Grid>
        <Grid size={{ xs: 3, md: 2 }}>
          <Typography variant="h6" component="p">
            {/*{`€ ${content.total_price.toFixed(2).replace(".", ",")}`}*/}
            {Str.EURO(content.unit_price).format()}
          </Typography>
        </Grid>
        <Grid
          size={2}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            zIndex: 2
          }}
        >
          <IconButton
            aria-label="remove-product"
            onClick={handleRemove}
          >
            <DeleteIcon />
          </IconButton>
        </Grid>
        <Grid size={12}>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <DiscountContent content={content} index={index} />
              {content.subscription_selected_content?.map(selected_content => (
                <Grid container sx={{mb: 2}} key={selected_content.id}>
                  <Grid size={{ xs: 7, md: 6 }}>
                    <Typography variant="body2" color="info">
                      {selected_content.price_listable.name}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 3, md: 2 }}>
                    <Typography variant="body2" color="info">
                      {/*{`€ ${content.total_price.toFixed(2).replace(".", ",")}`}*/}
                      {Str.EURO(selected_content.price).format()}
                    </Typography>
                  </Grid>
                  {selected_content.days_duration || selected_content.months_duration && (
                    <React.Fragment>
                      <Grid size={{ xs: 3, md: 2 }}>
                        <Typography variant="body2" color="info">
                          Dal: {itNumberForma(content.start_date!)}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 3, md: 2 }}>
                        <Typography variant="body2" color="info">
                          Al: {itNumberForma(expiryDateCalculator(content.start_date, selected_content))}
                        </Typography>
                      </Grid>
                    </React.Fragment>
                  )}
                </Grid>
              ))}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ListItem>
  );
};

const DiscountContent = ({ content, index }: { content: SaleRowFormValues, index: number }) => {
  const { setFieldValue } = useFormikContext<SaleFormValues>();
  const [totalPrice, setTotalPrice] = useState<number>(content.unit_price);

  const handlePercentageDiscountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const percentage_discount = parseFloat(event.target.value.replace(',', '.')) || 0;
    const diffDiscount = MyMath.percentageDiscount(content.unit_price, percentage_discount);

    setTotalPrice(content.unit_price - diffDiscount)

    setFieldValue(`sale_contents[${index}].absolute_discount`, diffDiscount !== 0 ? Math.round((diffDiscount + Number.EPSILON) * 100) / 100 : 0);
    setFieldValue(`sale_contents[${index}].percentage_discount`, percentage_discount !== 0 ? Math.round((percentage_discount + Number.EPSILON) * 100) / 100 : 0);

    if (diffDiscount === 0) {
      setFieldValue(`sale_contents[${index}].percentage_discount`, "0");
    }
  };

  const handleAbsoluteDiscountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const absolute_discount = parseFloat(event.target.value.replace(',', '.')) || 0;
    const percentageDiscount = (absolute_discount / content.unit_price) * 100;

    setTotalPrice(content.unit_price - absolute_discount)

    setFieldValue(`sale_contents[${index}].percentage_discount`,percentageDiscount !== 0 ? Math.round((percentageDiscount + Number.EPSILON) * 100) / 100 : 0)
    setFieldValue(`sale_contents[${index}].absolute_discount`, absolute_discount !== 0 ? Math.round((absolute_discount + Number.EPSILON) * 100) / 100 : 0);

    if (absolute_discount === 0) {
      setFieldValue(`sale_contents[${index}].absolute_discount`, "0");
    }
  };

  return (
    <Grid container spacing={2}>
      {content.price_list.type === MEMBERSHIP && (
        <React.Fragment>
          <Grid size={6}>
            <Typography variant="body2" color="info">
              Dal: <span style={{ fontWeight: 'bold' }}>{itNumberForma(content.start_date!)}</span>
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="info">
              Al: <span
              style={{ fontWeight: 'bold' }}>{itNumberForma(expiryDateCalculator(content.start_date, content.price_list))}</span>
            </Typography>
          </Grid>
        </React.Fragment>
      )}
      <Grid size={12}>
        <Stack
          direction="row"
          sx={{ paddingY: 2 }}
          spacing={2}
        >
          <MoneyTextField
            label="Prezzo Base"
            name={`sale_contents[${index}].unit_price`}
            disabled
          />
          <MoneyTextField
            label="Sconto %"
            name={`sale_contents[${index}].percentage_discount`}
            onChange={handlePercentageDiscountChange}
            prefix={undefined}
            thousandSeparator={undefined}
          />
          <MoneyTextField
            label="Sconto assoluto"
            name={`sale_contents[${index}].absolute_discount`}
            onChange={handleAbsoluteDiscountChange}
            prefix={undefined}
            thousandSeparator={undefined}
          />
          <NumericFormat
            customInput={MuiTextField}
            label="Totale"
            value={totalPrice.toFixed(2)}
            disabled
            variant="standard"
            sx={{ width: '100%' }}
            thousandSeparator="."
            decimalSeparator=","
            valueIsNumericString
            prefix="€"
          />
        </Stack>
      </Grid>
    </Grid>
  );
};
