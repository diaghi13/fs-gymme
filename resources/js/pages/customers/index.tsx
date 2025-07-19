import * as React from 'react';
import { Customer, PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { DataGrid, GridActionsCellItem, GridColDef, GridInitialState, useGridApiRef } from '@mui/x-data-grid';
import { Box, CircularProgress } from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { router, usePage } from '@inertiajs/react';

const columns: GridColDef<Customer>[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  {
    field: 'first_name',
    headerName: 'First name',
    width: 150,
  },
  {
    field: 'last_name',
    headerName: 'Last name',
    width: 150,
  },
  {
    field: 'email',
    headerName: 'Email',
    type: 'number',
    width: 110,
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

interface IndexProps extends PageProps{
  customers: Customer[];
}

const Index : React.FC<IndexProps> = ({auth, customers}) => {
  const page = usePage<PageProps>().props;
  const apiRef = useGridApiRef();

  const [initialState, setInitialState] = React.useState<GridInitialState>();

  const saveSnapshot = React.useCallback(() => {
    if (apiRef?.current?.exportState && localStorage) {
      const currentState = apiRef.current.exportState();
      localStorage.setItem('customerDataGridState', JSON.stringify(currentState));
    }
  }, [apiRef]);

  React.useLayoutEffect(() => {
    const stateFromLocalStorage = localStorage?.getItem('customerDataGridState');
    setInitialState(stateFromLocalStorage ? JSON.parse(stateFromLocalStorage) : {});

    // handle refresh and navigating away/refreshing
    window.addEventListener('beforeunload', saveSnapshot);

    return () => {
      // in case of an SPA remove the event-listener
      window.removeEventListener('beforeunload', saveSnapshot);
      saveSnapshot();
    };
  }, [saveSnapshot]);

  if (!initialState) {
    return <CircularProgress />;
  }

  return (
   <AppLayout user={auth.user}>
     <Box sx={{p: 2}}>
       <DataGrid
         rows={customers}
         columns={columns}
         initialState={{
            ...initialState,
           pagination: {
             paginationModel: {
               pageSize: 10,
             },
           },
         }}
         pageSizeOptions={[10, 20, 30, 50, 100]}
         checkboxSelection
         disableRowSelectionOnClick
         apiRef={apiRef}
         onRowClick={(params) => {
           router.get(route('app.customers.show', {customer: params.row.id, tenant: page.currentTenantId}));
         }}
       />
     </Box>
   </AppLayout>
 );
};

export default Index
