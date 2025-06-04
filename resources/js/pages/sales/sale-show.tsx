import * as React from 'react';
import { PageProps, Sale } from '@/types';
import { Grid, IconButton, Stack, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { CodeIcon, PrinterIcon, SendIcon } from 'lucide-react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import SaleHeaderCard from '@/components/sales/cards/SaleHeaderCard';
import TotalsCard from '@/components/sales/cards/TotalsCard';

interface SaleShowProps extends PageProps {
  sale: Sale;
}

const SaleShow: React.FC<SaleShowProps> = ({ auth, sale }) => {
  console.log('sale', sale);

  return (
    <AppLayout user={auth.user} title="Mostra vendita">
      <Grid container spacing={2} sx={{ p: 2 }}>
        <Grid size={12}>
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
            <Tooltip title="Modifica vendita">
              <IconButton>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Esporta XML">
              <IconButton href={route('sales.export-xml', { sale: sale.id! })}>
                <CodeIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Stampa">
              <IconButton>
                <PrinterIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Inoltra">
              <IconButton>
                <SendIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Grid>
        <Grid size={6}>
          <SaleHeaderCard sale={{
            date: sale.date,
            customer: sale.customer ? { label: sale.customer.full_name! } : undefined
          }} />
        </Grid>
        <Grid size={6}>
          {/*<TotalsCard sale_price={} total_price={} sale={}*/}
        </Grid>
      </Grid>
    </AppLayout>
  );
};

export default SaleShow;
