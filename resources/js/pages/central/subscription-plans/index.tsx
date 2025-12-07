import * as React from 'react';
import { PageProps, SubscriptionPlan } from '@/types';
import CentralLayout from '@/layouts/CentralLayout';
import { Button, Grid } from '@mui/material';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';

import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { router } from '@inertiajs/react';
import MyCard from '@/components/ui/MyCard';
import { Str } from '@/support/Str';

const columns: GridColDef<SubscriptionPlan>[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  {
    field: 'name',
    headerName: 'Nome',
    flex: 1,
    minWidth: 150
  },
  {
    field: 'tier',
    headerName: 'Livello',
    width: 100,
    valueGetter: (value, row) => {
      if (!row.tier) return '-';
      const tiers: Record<string, string> = {
        base: 'Base',
        gold: 'Gold',
        platinum: 'Platinum'
      };
      return tiers[row.tier] || row.tier;
    }
  },
  {
    field: 'price',
    headerName: 'Prezzo',
    type: 'number',
    valueFormatter: (value, row) => {
      if (row.price === 0) return 'Gratuito';
      // Convert cents to euros
      return Str.EURO(row.price);
    },
    width: 120
  },
  {
    field: 'interval',
    headerName: 'Intervallo',
    width: 100,
    valueGetter: (value, row) => {
      const intervals: Record<string, string> = {
        monthly: 'Mensile',
        yearly: 'Annuale',
        weekly: 'Settimanale',
        daily: 'Giornaliero'
      };
      return intervals[row.interval] || row.interval;
    }
  },
  {
    field: 'trial_days',
    headerName: 'Trial',
    type: 'number',
    width: 80,
    valueGetter: (value, row) => row.trial_days || 0
  },
  {
    field: 'is_trial_plan',
    headerName: 'Piano Trial',
    type: 'boolean',
    width: 100
  },
  {
    field: 'is_active',
    headerName: 'Attivo',
    type: 'boolean',
    width: 80
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
