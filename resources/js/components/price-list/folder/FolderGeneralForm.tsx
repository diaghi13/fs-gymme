import { Form, Formik, FormikConfig } from 'formik';
import { Button, Grid } from '@mui/material';
import TextField from '@/components/ui/TextField';
import FolderIcon from '@mui/icons-material/Folder';
import Select from '@/components/ui/Select';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { PriceListFolder } from '@/types';
import FolderPriceListDialog from '@/components/price-list/FolderPriceListDialog';
import { PriceListPageProps } from '@/pages/price-lists/price-lists';

export default function FolderGeneralForm() {
  const {props: {priceList, priceListOptions, priceListOptionsTree}} = usePage<PriceListPageProps>()
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);

  if (!priceList || !priceListOptionsTree) {
    return null;
  }

  const formik: FormikConfig<{
    name: string;
    saleable: boolean;
    parent_id: string | number;
  }> = {
    initialValues: {
      name: priceList.name ?? '',
      saleable: priceList.saleable ?? true,
      parent_id: priceList.parent_id ?? ''
    },
    onSubmit: (values) => {
      if (!priceList.id) {
        router.post(
          route('price-lists.folders.store'),
          values,
          { preserveState: false });
      } else {
        router.put(
          route('price-lists.folders.update', { folder: priceList.id }),
          values,
          { preserveState: false }
        );
      }
    },
    enableReinitialize: true
  };

  return (
    <Formik {...formik}>
      {({ values, setFieldValue }) => {

        const toggleFolderDialogOpen = () => {
          setFolderDialogOpen(!folderDialogOpen);
        };

        const handleFolderSelect = (folder: PriceListFolder) => {
          setFieldValue('parent_id', folder.id);
          toggleFolderDialogOpen();
        };

        return (
          <Form>
            <Grid container spacing={4}>
              <Grid size={12}>
                <TextField label={'Nome'} name={'name'} />
              </Grid>
              <Grid size={6} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                <FolderIcon sx={{ mr: 1 }} fontSize={'medium'} />
                <Select name={'parent_id'} label={'Listino'} options={priceListOptions} disabled />
                <Button
                  sx={{ ml: 2, px: 3 }}
                  variant={'contained'}
                  onClick={toggleFolderDialogOpen}
                >
                  Seleziona
                </Button>
                <FolderPriceListDialog
                  priceListOptionsTree={priceListOptionsTree}
                  open={folderDialogOpen}
                  onSelect={handleFolderSelect}
                  onClose={toggleFolderDialogOpen}
                />
              </Grid>
              <Grid size={12}>
                <Button onClick={() => {
                  setFieldValue('saleable', !values.saleable);
                }}>
                  {values.saleable
                    ? 'Disabilita la vendita'
                    : 'Abilita la vendita'}
                </Button>
              </Grid>
              <Grid size={12} sx={{ textAlign: 'end' }}>
                <Button size="small" sx={{ marginRight: 2 }} onClick={() => {
                }}>Annulla</Button>
                <FormikSaveButton />
              </Grid>
            </Grid>
          </Form>
        );
      }}
    </Formik>
  );
};
