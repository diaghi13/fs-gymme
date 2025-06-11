import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material';
import { usePage } from '@inertiajs/react';
import { CustomerShowProps } from '@/pages/customers/customer-show';
import { Str } from '@/support/Str';
import SaleRow from '@/components/customers/Table/SaleRow';

interface SalesTabProps {

}

const SalesTab : React.FC<SalesTabProps> = () => {
  const { customer} = usePage<CustomerShowProps>().props;

  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      <Grid size={12}>
        <Card>
          <CardHeader title="Resoconto"/>
          <CardContent>
            <ListItem>
              <ListItemText
                primary="Prodotti venduti"
                secondary={customer.sales_summary?.total_sale_products}
              />
              <ListItemText
                primary="Totale"
                secondary={Str.EURO(customer.sales_summary!.total_amount).format()}
              />
              <ListItemText
                primary="Pagato"
                secondary={Str.EURO(customer.sales_summary!.payed).format()}
              />
              <ListItemText
                primary="Non pagato"
                secondary={Str.EURO(customer.sales_summary!.not_payed).format()}
              />
              <ListItemText
                primary="Scaduto"
                secondary={Str.EURO(customer.sales_summary!.expired).format()}
              />
            </ListItem>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={12}>
        <Card>
          <CardHeader title="Vendite e pagamenti"/>
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell>N. vendita</TableCell>
                      <TableCell>Data vendita</TableCell>
                      <TableCell>Prezzo base</TableCell>
                      <TableCell>Sconto</TableCell>
                      <TableCell>Sconto %</TableCell>
                      <TableCell>Totale</TableCell>
                      <TableCell>Pagato</TableCell>
                      <TableCell>A saldo</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customer.sales && customer.sales.map((sale, index: number) =>
                      <SaleRow sale={sale} key={index}/>
                    )}
                  </TableBody>
                </Table>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
};

export default SalesTab
