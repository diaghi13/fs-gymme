import * as React from 'react';
import { PageProps, SubscriptionPlan } from '@/types';
import CentralLayout from '@/layouts/CentralLayout';
import { Button, Grid } from '@mui/material';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';

import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import AppsIcon from '@mui/icons-material/Apps';
import { router } from '@inertiajs/react';
import MyCard from '@/components/ui/MyCard';

const columns: GridColDef<SubscriptionPlan>[] = [
  { field: 'id', headerName: 'ID', flex: 0.5 },
  {
    field: 'name',
    headerName: 'Name',
    flex: 1
  },
  {
    field: 'description',
    headerName: 'Descrizione',
    flex: 1,
    valueGetter: (value, row) => row.description || 'Nessuna descrizione'
  },
  {
    field: 'price',
    headerName: 'Prezzo',
    type: 'number',
    valueFormatter: (value, row) => row.price ? `€ ${row.price.toFixed(2)}` : 'Gratuito',
    width: 120
  },
  {
    field: 'currency',
    headerName: 'Valuta',
    width: 100,
    valueGetter: (value, row) => row.currency || 'EUR'
  },
  {
    field: 'interval',
    headerName: 'Intervallo',
    width: 120,
    valueGetter: (value, row) => row.interval || 'Mensile'
  },
  {
    field: 'trial_period_days',
    headerName: 'Giorni di prova',
    type: 'number',
    width: 150,
    valueGetter: (value, row) => row.trial_days || 0
  },
  {
    field: 'is_active',
    headerName: 'Active',
    type: 'boolean'
  },
  {
    field: 'actions',
    type: 'actions',
    width: 40,
    getActions: (params) => [
      <GridActionsCellItem
        icon={<VisibilityIcon />}
        label="Visualizza"
        onClick={() => router.get(route("central.subscription-plans.show", params.id))}
        showInMenu
      />,
      <GridActionsCellItem
        icon={<EditIcon />}
        label="Modifica"
        onClick={() => router.get(route("central.subscription-plans.edit", params.id))}
        showInMenu
      />,
    ]
  }
];

interface IndexProps extends PageProps {
  subscriptionPlans: SubscriptionPlan[];
}

const Index: React.FC<IndexProps> = ({ auth, subscriptionPlans }) => {
  return (
    <CentralLayout user={auth.user}>
      <Grid container spacing={2} sx={{ m: 2 }}>
        <Grid size={12}>
          <MyCard title="Piani di abbonamento">
            <Grid container spacing={2}>
              <Grid size={12} sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
                <Button variant="contained" onClick={() => router.get(route("central.subscription-plans.create"))}>Crea abbonamento</Button>
              </Grid>
              <Grid size={12}>
                <DataGrid
                  rows={subscriptionPlans}
                  columns={columns}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 10
                      }
                    }
                  }}
                  density="standard"
                  pageSizeOptions={[10, 20, 30, 50, 100]}
                  checkboxSelection
                  disableRowSelectionOnClick
                />
              </Grid>
            </Grid>
          </MyCard>
        </Grid>
      </Grid>
    </CentralLayout>
  );
};

export default Index;
