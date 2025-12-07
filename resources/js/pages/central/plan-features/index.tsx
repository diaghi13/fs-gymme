import * as React from 'react';
import { PageProps } from '@/types';
import CentralLayout from '@/layouts/CentralLayout';
import { Button, Chip, Grid } from '@mui/material';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';

import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { router } from '@inertiajs/react';
import MyCard from '@/components/ui/MyCard';
import { Str } from '@/support/Str';

interface PlanFeature {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  feature_type: 'boolean' | 'quota' | 'metered';
  is_active: boolean;
  is_addon_purchasable: boolean;
  default_addon_price: number | null;
  default_addon_quota: number | null;
  sort_order: number | null;
}

const columns: GridColDef<PlanFeature>[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  {
    field: 'display_name',
    headerName: 'Nome',
    flex: 1,
    minWidth: 180
  },
  {
    field: 'name',
    headerName: 'Codice',
    width: 150
  },
  {
    field: 'feature_type',
    headerName: 'Tipo',
    width: 120,
    renderCell: (params) => {
      const typeLabels: Record<string, string> = {
        boolean: 'Sì/No',
        quota: 'Con Quota',
        metered: 'A Consumo'
      };
      const typeColors: Record<string, 'primary' | 'secondary' | 'success'> = {
        boolean: 'primary',
        quota: 'secondary',
        metered: 'success'
      };
      return (
        <Chip
          label={typeLabels[params.value]}
          color={typeColors[params.value]}
          size="small"
        />
      );
    }
  },
  {
    field: 'is_addon_purchasable',
    headerName: 'Addon',
    type: 'boolean',
    width: 80
  },
  {
    field: 'default_addon_price',
    headerName: 'Prezzo Addon',
    width: 130,
    valueFormatter: (value, row) => {
      if (!row.is_addon_purchasable || !row.default_addon_price) return '-';
      return Str.EURO(row.default_addon_price).format();
    }
  },
  {
    field: 'default_addon_quota',
    headerName: 'Quota Addon',
    type: 'number',
    width: 120,
    valueGetter: (value, row) => {
      if (!row.is_addon_purchasable || !row.default_addon_quota) return '-';
      return row.default_addon_quota;
    }
  },
  {
    field: 'is_active',
    headerName: 'Attivo',
    type: 'boolean',
    width: 80
  },
  {
    field: 'sort_order',
    headerName: 'Ordine',
    type: 'number',
    width: 80,
    valueGetter: (value, row) => row.sort_order || 0
  },
  {
    field: 'actions',
    type: 'actions',
    width: 40,
    getActions: (params) => [
      <GridActionsCellItem
        icon={<VisibilityIcon />}
        label="Visualizza"
        onClick={() => router.get(route("central.plan-features.show", params.id))}
        showInMenu
      />,
      <GridActionsCellItem
        icon={<EditIcon />}
        label="Modifica"
        onClick={() => router.get(route("central.plan-features.edit", params.id))}
        showInMenu
      />,
      <GridActionsCellItem
        icon={<DeleteIcon />}
        label="Elimina"
        onClick={() => {
          if (confirm('Sei sicuro di voler eliminare questa feature?')) {
            router.delete(route("central.plan-features.destroy", params.id));
          }
        }}
        showInMenu
      />,
    ]
  }
];

interface IndexProps extends PageProps {
  features: PlanFeature[];
}

const Index: React.FC<IndexProps> = ({ auth, features }) => {
  return (
    <CentralLayout user={auth.user}>
      <Grid container spacing={2} sx={{ m: 2 }}>
        <Grid size={12}>
          <MyCard title="Features & Addons">
            <Grid container spacing={2}>
              <Grid size={12} sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
                <Button variant="contained" onClick={() => router.get(route("central.plan-features.create"))}>
                  Crea Feature
                </Button>
              </Grid>
              <Grid size={12}>
                <DataGrid
                  rows={features}
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
