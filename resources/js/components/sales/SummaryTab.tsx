import {
  Divider,
  Grid,
  List,
  ListItem as MuiListItem, ListItemIcon, ListItemText,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import MyCard from '@/components/ui/MyCard';
import { Str } from '@/support/Str';
import React, { useEffect } from 'react';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import { usePage } from '@inertiajs/react';
import { SaleFormValues, SalePageProps } from '@/pages/sales/sales';
import format, { itNumberForma } from '@/support/format';
import { useSaleContext } from '@/Contexts/Sale/SaleContext';
import { ARTICLE, MEMBERSHIP, SUBSCRIPTION } from '@/pages/price-lists/price-lists';
import { expiryDateCalculator } from '@/components/sales/CartItem';
//import { useFormikContext } from 'formik';

interface SummaryTabProps {
  sale: SaleFormValues;
}

export default function SummaryTab({ sale }: SummaryTabProps) {
  const { paymentConditions, paymentMethods } = usePage<SalePageProps>().props;
  const { sale_price, total_price, sale_rows } = useSaleContext();
  const {vatRateSummary, calculateVatSeparation} = useSaleContext();
  //const { values } = useFormikContext();

  useEffect(() => {
    calculateVatSeparation();
  }, [calculateVatSeparation]);

  return (
    <Grid container spacing={2}>
      <Grid size={8}>
        <MyCard sx={{ height: '100%' }} title={'Testata'}>
          <Stack spacing={4}>
            <Typography>Data inserimento: {format(sale.date, 'dd/MM/yyyy')}</Typography>
            <Typography>Struttura: La mia palestra</Typography>
            <Typography>Cliente: {sale.customer?.option_label}</Typography>
          </Stack>
        </MyCard>
      </Grid>
      <Grid size={4}>
        <MyCard title={'Totali'}>
          <Stack direction={'row'} justifyContent={'space-between'}>
            <Typography>Prezzo base: </Typography>
            <Typography fontWeight={800}>{Str.EURO(sale_price).format()}</Typography>
          </Stack>
          <Stack direction={'row'} justifyContent={'space-between'}>
            <Typography>Sconto %: </Typography>
            <Typography fontWeight={800}>{sale.discount_percentage}</Typography>
          </Stack>
          <Stack direction={'row'} justifyContent={'space-between'}>
            <Typography>Sconto assoluto: </Typography>
            <Typography fontWeight={800}>{Str.EURO(sale.discount_absolute).format()}</Typography>
          </Stack>
          <Stack direction={'row'} justifyContent={'space-between'}>
            <Typography>Prezzo totale: </Typography>
            <Typography fontWeight={800}>{Str.EURO(total_price).format()}</Typography>
          </Stack>
          <Stack direction={'row'} justifyContent={'space-between'}>
            <Typography>Q.tà prodotti: </Typography>
            <Typography fontWeight={800}>{sale.sale_contents.length}</Typography>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack direction={'row'} justifyContent={'space-between'}>
            {/*<Typography>Acconto: </Typography>*/}
            {/*<Typography*/}
            {/*  fontWeight={800}>€{parseInt(String(sale.payments[0].amount)).toFixed(2).replace('.', ',')}</Typography>*/}
          </Stack>
          <Stack direction={'row'} justifyContent={'space-between'}>
            {/*<Typography>Rateizzato: </Typography>*/}
            {/*<Typography fontWeight={800}>{Str.EURO(total_price - Number(sale.payments[0].amount)).format()}</Typography>*/}
          </Stack>
        </MyCard>
      </Grid>
      <Grid size={12}>
        <MyCard title={'Prodotti'}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Descrizione</TableCell>
                <TableCell>Prezzo base</TableCell>
                <TableCell>IVA (%)</TableCell>
                <TableCell>Sconto %</TableCell>
                <TableCell>Sconto ass.</TableCell>
                <TableCell>Prezzo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sale_rows.map((saleContent, index) => (
                <React.Fragment key={index}>
                  <TableRow>
                    <TableCell>{saleContent.price_list.name}</TableCell>
                    <TableCell>{Str.EURO(sale_rows[index].unit_price).format()}</TableCell>
                    <TableCell>{saleContent.price_list.type === ARTICLE || saleContent.price_list.type === MEMBERSHIP ? saleContent.price_list.vat_rate?.percentage : '0'}</TableCell>
                    <TableCell>{saleContent.percentage_discount}</TableCell>
                    <TableCell>{Str.EURO(saleContent.absolute_discount).format()}</TableCell>
                    <TableCell>{Str.EURO(sale_rows[index].total).format()}</TableCell>
                  </TableRow>
                  {saleContent.price_list.type === SUBSCRIPTION && saleContent.subscription_selected_content && (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ p: 0, pl: 2 }}>
                        <List dense>
                          {saleContent.subscription_selected_content.map((detail, index) => (
                            <MuiListItem key={index}>
                              <ListItemIcon>
                                <SubdirectoryArrowRightIcon />
                              </ListItemIcon>
                              <ListItemText
                                primary={detail.price_listable.name}
                                //secondary={Str.EURO(detail.total_price).format()}
                                secondary={detail.price_listable_type !== "App\\Models\\PriceList\\PriceList" || detail.price_listable.type === MEMBERSHIP
                                  ? `Dal: ${saleContent.start_date ? itNumberForma(saleContent.start_date) : ''} al: ${itNumberForma(expiryDateCalculator(saleContent.start_date, detail))}`
                                  : ""}
                              />
                            </MuiListItem>
                          ))}
                        </List>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </MyCard>
      </Grid>
      <Grid size={12}>
        <MyCard title={'Riepilogo IVA'}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Codice</TableCell>
                <TableCell>Descrizione/Rif. normativo</TableCell>
                <TableCell>Natura</TableCell>
                <TableCell>Imponibile(€)</TableCell>
                <TableCell>Aliquota(%)</TableCell>
                <TableCell>Imposta(€)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vatRateSummary.map((vatRate, index) => (
                <TableRow key={index}>
                  <TableCell>{vatRate.code}</TableCell>
                  <TableCell>{vatRate.description}</TableCell>
                  <TableCell>{vatRate.nature}</TableCell>
                  <TableCell>{Str.EURO(vatRate.taxable).format()}</TableCell>
                  <TableCell>{vatRate.percentage}</TableCell>
                  <TableCell>{Str.EURO(vatRate.tax).format()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </MyCard>
      </Grid>
      <Grid size={12}>
        <MyCard title={'Pagamenti'}>
          <List>
            {
              sale.payments.map(
                (installment, index: number) => {
                  const color =
                    index % 2 ? 'rgba(0,0,0,0.0)' : 'rgba(0,0,0,0.05)';
                  return (
                    <MuiListItem
                      key={`installment-list-${index + 1}`}
                      sx={{ background: color }}
                    >
                      <ListItemText>
                        {`${index + 1}# - ${format(
                          installment.due_date!,
                          'dd/MM/yyyy'
                        )}`}
                      </ListItemText>
                      <ListItemText>
                        {`${
                          paymentMethods.find(p => p.id === installment.payment_method.id)
                            ?.label
                        } - €${parseFloat(String(installment.amount)).toFixed(2).replace('.', ',')}`}
                      </ListItemText>
                      {installment.payed_at && <ListItemText>Pagato</ListItemText>}
                      {!installment.payed_at && <ListItemText></ListItemText>}
                    </MuiListItem>
                  );
                }
              )}
          </List>
        </MyCard>
      </Grid>
    </Grid>
  );
};
