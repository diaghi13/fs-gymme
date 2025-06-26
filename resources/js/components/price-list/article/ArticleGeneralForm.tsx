import React, { useState } from 'react';
import { Button, Divider, Grid } from '@mui/material';
import { Form, Formik, FormikConfig, FormikProps } from 'formik';
import TextField from '@/components/ui/TextField';
import FolderIcon from '@mui/icons-material/Folder';
import Select from '@/components/ui/Select';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import ColorInput from '@/components/ui/ColorInput';
import { router } from '@inertiajs/react';
import {
  AutocompleteOption,
  AutocompleteOptions,
  PriceListArticle,
  PriceListFolder,
  PriceListFolderTree,
  PriceListMembershipFee
} from '@/types';
import Autocomplete from '@/components/ui/Autocomplete';
import FolderPriceListDialog from '@/components/price-list/FolderPriceListDialog';
import { ARTICLE, MEMBERSHIP } from '@/pages/price-lists/price-lists';
import MoneyTextField from '@/components/ui/MoneyTextField';

export type FormikValues = {
  name: string;
  type: string;
  color: string;
  saleable: boolean;
  parent_id: number | string | null;
  vat_rate: number | AutocompleteOption<number> | null;
  price: string | number;
  months_duration?: number;
}

interface ArticleGeneralFormProps {
  priceList: PriceListArticle | PriceListMembershipFee;
  priceListOptions: AutocompleteOptions<number>
  priceListOptionsTree: Array<PriceListFolderTree>;
  vatCodes: AutocompleteOptions<number>,
  ref: React.RefObject<FormikProps<FormikValues>>;
}

export default function ArticleGeneralForm(
  {
    priceList,
    priceListOptions,
    vatCodes,
    priceListOptionsTree,
    ref
  }: ArticleGeneralFormProps) {
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);

  const initialValues = {
    name: priceList.name ?? '',
    type: priceList.type,
    color: priceList.color ?? '',
    saleable: priceList.saleable,
    parent_id: priceList.parent_id ?? null,
    vat_rate: priceList.vat_rate_id ? vatCodes.find(item => item.value === priceList.vat_rate_id)! : null,
    price: priceList.price ?? ''
  };

  const formik: FormikConfig<FormikValues> = {
    initialValues: priceList.type === ARTICLE
      ? initialValues
      : { ...initialValues, months_duration: priceList.months_duration ?? 0 },
    onSubmit: (values) => {
      let vat_rate_id = null;

      if (values.vat_rate && typeof values.vat_rate !== 'number') {
        vat_rate_id = values.vat_rate.value;
      } else {
        vat_rate_id = values.vat_rate;
      }

      if (!priceList.id) {
        router.post(
          route(priceList.type === ARTICLE ? 'app.price-lists.articles.store' : 'app.price-lists.memberships.store'),
          { ...values, vat_rate_id },
          { preserveState: false }
        );
      } else {
        router.patch(
          route(priceList.type === ARTICLE ? 'app.price-lists.articles.update' : 'app.price-lists.memberships.update',
            priceList.type === ARTICLE ? { article: priceList.id } : { membership: priceList.id }
          ),
          { ...values, vat_rate_id },
          { preserveState: false }
        );
      }
    },
    enableReinitialize: true
  };

  return (
    <Formik {...formik} innerRef={ref}>
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
                <Grid size={12}>
                  <Divider />
                </Grid>
                <Grid size={12}>
                  <Autocomplete
                    label={'Reparto fiscale'}
                    name={'vat_rate'}
                    options={vatCodes}
                  />
                </Grid>
                <Grid size={6}>
                  <MoneyTextField
                    label={'Prezzo'}
                    name={'price'}
                  />
                </Grid>
                {priceList.type === MEMBERSHIP && (
                  <>
                    <Grid size={6} />
                    <Grid size={6}>
                      <TextField
                        label={'Durata in mesi'}
                        name={'months_duration'}
                        type={'number'}
                      />
                    </Grid>
                  </>
                )}
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
            </>
          </Form>
        );
      }}
    </Formik>
  );
};
