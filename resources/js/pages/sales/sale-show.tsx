import * as React from 'react';
import { PageProps, Sale } from '@/types';
import { Grid, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { CodeIcon, PrinterIcon, SendIcon } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import SaleHeaderCard from '@/components/sales/cards/SaleHeaderCard';
import SaleTotalsCard from '@/components/sales/cards/SaleTotalsCard';
import MyCard from '@/components/ui/MyCard';
import SaleCustomerCard from '@/components/sales/cards/SaleCustomerCard';
import SaleRowsCard from '@/components/sales/cards/SaleRowsCard';

interface SaleShowProps extends PageProps {
  sale: Sale;
}

const SaleShow: React.FC<SaleShowProps> = ({ auth, sale, currentTenantId }) => {
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
              <IconButton href={route('app.sales.export-xml', { tenant: currentTenantId, sale: sale.id! })}>
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
        <Grid size={4}>
          <SaleHeaderCard sale={sale} />
        </Grid>
        <Grid size={4}>
          <SaleCustomerCard sale={sale} />
        </Grid>
        <Grid size={4}>
          <SaleTotalsCard sale={sale} />
        </Grid>
        <Grid size={12}>
          <SaleRowsCard sale={sale} />
        </Grid>
      </Grid>
    </AppLayout>
  );
};

export default SaleShow;
