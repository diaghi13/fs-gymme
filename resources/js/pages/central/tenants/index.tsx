import * as React from 'react';
import { PageProps, Tenant } from '@/types';
import CentralLayout from '@/layouts/CentralLayout';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { Box } from '@mui/material';

import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';

const columns: GridColDef<Tenant>[] = [
  { field: 'id', headerName: 'ID', flex: 0.5 },
  {
    field: 'name',
    headerName: 'Name',
    flex: 1,
  },
  {
    field: 'is_active',
    headerName: 'Active',
    type: 'boolean'
  },
  {
    field: 'created_at',
    headerName: 'Creato il',
    type: 'dateTime',
    width: 160,
    valueGetter: (value, row) => new Date(row.created_at)
  },
  {
    field: 'users_count',
    headerName: 'Utenti',
  },
  {
    field: 'active_plan',
    headerName: 'Piano attivo',
    valueGetter: (value, row) => row.active_subscription_plan ? row.active_subscription_plan.name : 'Nessun piano attivo'
  },
  {
    field: 'plan_ends_at',
    headerName: 'Scadenza piano',
    type: 'date',
    width: 150,
    valueGetter: (value, row) => row.active_subscription_plan?.pivot.ends_at ? new Date(row.active_subscription_plan.pivot.ends_at) : null
  },
  {
    field: 'actions',
    type: 'actions',
    width: 40,
    getActions: () => [
      <GridActionsCellItem
        icon={<VisibilityIcon />}
        label="Visualizza"
        onClick={() => {}}
        showInMenu
      />,
      <GridActionsCellItem
        icon={<EditIcon />}
        label="Modifica"
        onClick={() => {}}
        showInMenu
      />,
    ]
  }
];

interface TenantsProps extends PageProps {
  tenants: Tenant[];
}

const Index: React.FC<TenantsProps> = ({ auth, tenants }) => {
  return (
    <CentralLayout user={auth.user}>
      <Box sx={{ p: 2 }}>
        <h1>Tenants</h1>
        <DataGrid
          rows={tenants}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10
              }
            }
          }}
          density="compact"
          pageSizeOptions={[10, 20, 30, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Box>
    </CentralLayout>
  );
};

export default Index;
