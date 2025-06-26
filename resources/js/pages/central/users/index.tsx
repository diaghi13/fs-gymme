import * as React from 'react';
import { PageProps, User } from '@/types';
import CentralLayout from '@/layouts/CentralLayout';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';
import FileCopyIcon from '@mui/icons-material/FileCopy';

const columns: GridColDef<User>[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  {
    field: 'first_name',
    headerName: 'First name',
    width: 150,
    editable: true,
  },
  {
    field: 'last_name',
    headerName: 'Last name',
    width: 150,
    editable: true,
  },
  {
    field: 'email',
    headerName: 'Email',
    type: 'number',
    width: 110,
    editable: true,
  },
  {
    field: 'fullName',
    headerName: 'Full name',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 160,
    valueGetter: (value, row) => `${row.first_name || ''} ${row.last_name || ''}`,
  },
  {
    field: 'roles',
    headerName: 'Roles',
    width: 200,
    valueGetter: (value, row) => row.roles.map(role => role.name).join(', '),
  },
  {
    field: 'is_active',
    headerName: 'Active',
    type: 'boolean',
  },
  {
    field: 'actions',
    type: 'actions',
    getActions: () => [
      <GridActionsCellItem
        icon={<DeleteIcon />}
        label="Delete"
        onClick={() => {}}
      />,
      <GridActionsCellItem
        icon={<SecurityIcon />}
        label="Toggle Admin"
        onClick={() => {}}
        showInMenu
      />,
      <GridActionsCellItem
        icon={<FileCopyIcon />}
        label="Duplicate User"
        onClick={() => {}}
        showInMenu
      />,
    ],
  }
];

interface UsersProps extends PageProps {
  users: User[];
}

const Index: React.FC<UsersProps> = ({ auth, users }) => {
  return (
    <CentralLayout user={auth.user}>
      <Box sx={{p: 2}}>
        <DataGrid
          rows={users}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
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
