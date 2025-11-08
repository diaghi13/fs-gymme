import * as React from 'react';
import { useState } from 'react';
import { Form, useFormikContext } from 'formik';
import { Button, Divider, Grid, FormControlLabel, Checkbox, Typography } from '@mui/material';
import TextField from '@/components/ui/TextField';
import FolderIcon from '@mui/icons-material/Folder';
import Select from '@/components/ui/Select';
import FolderPriceListDialog from '@/components/price-list/FolderPriceListDialog';
import ColorInput from '@/components/ui/ColorInput';
import SubscriptionTable from '@/components/price-list/subscription/content-table/SubscriptionTable';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import { usePage } from '@inertiajs/react';
import { FOLDER, PriceListPageProps } from '@/pages/price-lists/price-lists';
import { SubscriptionGeneralFormValues } from '@/components/price-list/subscription/tabs/SubscriptionGeneralTab';
import { PriceListFolder } from '@/types';

interface SubscriptionGeneralFormProps {
  onDismiss: () => void;
}

const GeneralForm: React.FC<SubscriptionGeneralFormProps> = ({ onDismiss }) => {
  const {
    priceList,
    priceListOptions,
    priceListOptionsTree,
    vatRateOptions,
    baseProducts,
    courseProducts,
    articles,
    membershipFees,
    currentTenantId
  } = usePage<PriceListPageProps>().props;

  const { values, setFieldValue } = useFormikContext<SubscriptionGeneralFormValues>();
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);

  const toggleFolderDialogOpen = () => {
    setFolderDialogOpen(!folderDialogOpen);
  };

  const handleFolderSelect = (folder: PriceListFolder) => {
    setFieldValue('parent_id', folder.id);
    toggleFolderDialogOpen();
  };

  if (!priceListOptions || !priceListOptionsTree || !vatRateOptions || !baseProducts || !courseProducts || !membershipFees || !articles) {
    return null;
  }

  return (
    <Form>
      <>
        <Grid container spacing={4}>
          <Grid size={12}>
            <TextField label={'Nome'} name={'name'} />
          </Grid>
          <Grid size={6} display={'flex'} alignItems={'center'}>
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
          <Grid size={6} />
          <Grid size={12}>
            <ColorInput label={'Colore'} name={'color'} />
          </Grid>
          {priceList?.type !== FOLDER && (
            <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              Totale: € {(values.standard_content || []).reduce(
                (acc, item) => (item && !item.isDirty) ? (item.price ? parseFloat(String(item.price)) : 0) + acc : acc,
                0
            ).toFixed(2).replace('.', ',')}
            </Grid>
          )}
          <Grid size={12}>
            <SubscriptionTable contentType={'standard'} />
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
            <Button size="small" sx={{ marginRight: 2 }} onClick={onDismiss}>Annulla</Button>
            <FormikSaveButton />
          </Grid>
        </Grid>
      </>
    </Form>
  );
};

export default GeneralForm;
