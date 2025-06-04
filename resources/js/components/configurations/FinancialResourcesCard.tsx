import * as React from 'react';
import { FinancialResource } from '@/types';
import MyCard from '@/components/ui/MyCard';
import {
  Button,
  Chip,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu, MenuItem, MenuList, Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material';
import Dialog from '@/components/ui/Dialog';
import TextField from '@/components/ui/TextField';
import { Form, Formik, FormikConfig, FormikProps } from 'formik';
import RadioButtonsGroup from '@/components/ui/RadioButtonsGroup';
import { router } from '@inertiajs/react';
import * as Yup from 'yup';
import { useRef } from 'react';
import { RequestPayload } from '@inertiajs/core';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import { CheckIcon, HomeIcon } from 'lucide-react';
import DeleteIcon from '@mui/icons-material/Delete';

// ^([A-Z]{2}[ \-]?[0-9]{2})(?=(?:[ \-]?[A-Z0-9]){9,30}$)((?:[ \-]?[A-Z0-9]{3,5}){2,7})([ \-]?[A-Z0-9]{1,3})?$
// IBAN: IT57G0306901631100000014862
// IBAN: IT79M0306901603100000107478

const schema = Yup.object().shape({
  type: Yup.string().required('Richiesto'),
  name: Yup.string().required('Richiesto'),
  iban: Yup.string().when('type',
    ([type], schema) => type === 'bank'
      ? schema.matches(/(?:IT|SM)\d{2} ?[A-Z]\d{3}(?: ?\d{4}){4} ?\d{3}|CY\d{2} ?[A-Z]\d{3}(?: ?\d{4}){5}|NL\d{2} ?[A-Z]{4}(?: ?\d{4}){2} ?\d{2}|LV\d{2} ?[A-Z]{4}(?: ?\d{4}){3} ?\d|(?:BG|BH|GB|IE)\d{2} ?[A-Z]{4}(?: ?\d{4}){3} ?\d{2}|GI\d{2} ?[A-Z]{4}(?: ?\d{4}){3} ?\d{3}|RO\d{2} ?[A-Z]{4}(?: ?\d{4}){4}|KW\d{2} ?[A-Z]{4}(?: ?\d{4}){5} ?\d{2}|MT\d{2} ?[A-Z]{4}(?: ?\d{4}){5} ?\d{3}|NO\d{2}(?: ?\d{4}){4}|(?:DK|FI|GL|FO)\d{2}(?: ?\d{4}){3} ?\d{2}|MK\d{2}(?: ?\d{4}){3} ?\d{3}|(?:AT|EE|KZ|LU|XK)\d{2}(?: ?\d{4}){4}|(?:BA|HR|LI|CH|CR)\d{2}(?: ?\d{4}){4} ?\d|(?:GE|DE|LT|ME|RS)\d{2}(?: ?\d{4}){4} ?\d{2}|IL\d{2}(?: ?\d{4}){4} ?\d{3}|(?:AD|CZ|ES|MD|SA)\d{2}(?: ?\d{4}){5}|PT\d{2}(?: ?\d{4}){5} ?\d|(?:BE|IS)\d{2}(?: ?\d{4}){5} ?\d{2}|(?:FR|MR|MC)\d{2}(?: ?\d{4}){5} ?\d{3}|(?:AL|DO|LB|PL)\d{2}(?: ?\d{4}){6}|(?:AZ|HU)\d{2}(?: ?\d{4}){6} ?\d|(?:GR|MU)\d{2}(?: ?\d{4}){6} ?\d{2}/g, 'Iban non valido')
        //schema.matches(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/, 'Iban non valido')
        //.length(27, 'Iban deve essere di 27 caratteri')
        // .test('valid-iban',
        //   'Iban non valido',
        //   async (value) => {
        //     const response = await fetch(
        //       'https://openiban.com/validate/' + value + '?getBIC=true&validateBankCode=true',
        //     );
        //     if (!response.ok) {
        //       return false;
        //     }
        //     const data = await response.json();
        //     console.log(data);
        //     return data.valid;
        // })
        .required('Richiesto')
      : schema.notRequired()
  ),
  swift: Yup.string().when('type',
    ([type], schema) => type === 'bank'
      ? schema.matches(/^[A-Z]{6}[A-Z0-9]{2}$/, 'BIC/SWIFT non valido').notRequired()
      : schema.notRequired()
  )
});

interface FinancialResourceFormProps {
  type: string;
  name: string;
  iban: string;
  bic: string;
}

interface FinancialResourcesCardProps {
  financialResources: FinancialResource[];
}

const FinancialResourcesCard: React.FC<FinancialResourcesCardProps> = ({ financialResources }) => {
  const [open, setOpen] = React.useState(false);
  const [menuState, setMenuState] = React.useState<{
    anchorEl: HTMLElement | null,
    id: number | null
  }>({ anchorEl: null, id: null });
  const formikRef = useRef<FormikProps<FinancialResourceFormProps>>(null);
  const [current, setCurrent] = React.useState<FinancialResource | null>(null);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    if (formikRef.current) {
      formikRef.current.resetForm();
    }
    setCurrent(null);
  };

  const handleClickOpen = (event: React.MouseEvent<HTMLButtonElement>, id: number) => {
    setMenuState({ anchorEl: event.currentTarget, id });
  };

  const handleCloseMenu = () => {
    setMenuState({ anchorEl: null, id: null });
  };

  const formik: FormikConfig<FinancialResourceFormProps> = {
    initialValues: {
      type: 'bank',
      name: '',
      iban: '',
      bic: ''
    },
    validationSchema: schema,
    onSubmit: (values) => {
      if (current) {
        router.put(route('configurations.financial-resources.update', { financial_resource: current.id }), values as unknown as RequestPayload);
      } else {
        router.post(route('configurations.financial-resources.store'), values as unknown as RequestPayload);
      }
    }
  };

  const handleSubmit = async () => {
    if (formikRef.current) {
      await formikRef.current.submitForm();
      handleClose();
    }
  };

  const handleEdit = (financialResource: FinancialResource) => {
    handleCloseMenu();
    //router.get(route('configurations.financial-resources.edit', { financialResource: financialResourceId }));
    setCurrent(financialResource);

    formikRef.current?.setValues({
      type: financialResource.type,
      name: financialResource.name,
      iban: financialResource.iban || '',
      bic: financialResource.bic || ''
    });

    handleOpen();
  };

  const handleSetDefault = (financialResource: FinancialResource) => {
    handleCloseMenu();
    router.put(route('configurations.financial-resources.set-default', { financial_resource: financialResource.id }));
  };

  const handleToggleActive = (financialResource: FinancialResource) => {
    handleCloseMenu();
    router.put(route('configurations.financial-resources.toggle-active', { financial_resource: financialResource.id }));
  };

  return (
    <MyCard title="Risorse finanziarie">
      <Grid container spacing={2}>
        <Grid size={12}>
          <Button variant="contained" color="primary" onClick={handleOpen}>
            Aggiungi risorsa finanziaria
          </Button>
          <Formik {...formik} innerRef={formikRef}>
            {({ values }) => (
              <Form>
                <Dialog open={open} onClose={handleClose} title="Aggiungi risorsa finanziaria"
                        onAgree={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <RadioButtonsGroup
                        label="Tipo"
                        name="type"
                        row
                        options={[
                          { label: 'Conto corrente', value: 'bank' },
                          { label: 'Cassa', value: 'cash' },
                          { label: 'Carta di credito', value: 'credit_card' }
                        ]} />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        label={'Nome'}
                        name={'name'}
                      />
                    </Grid>
                    {values.type === 'bank' && (
                      <React.Fragment>
                        <Grid size={8}>
                          <TextField
                            label={'Iban'}
                            name={'iban'}
                          />
                        </Grid>
                        <Grid size={4}>
                          <TextField
                            label={'Bic (opzionale)'}
                            name={'bic'}
                          />
                        </Grid>
                      </React.Fragment>
                    )}
                  </Grid>
                </Dialog>
              </Form>
            )}
          </Formik>
        </Grid>
        <Grid size={12}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell sx={{ width: 150 }}>Predefinito</TableCell>
                <TableCell sx={{ width: 100 }}>Tipo</TableCell>
                <TableCell sx={{ width: 50 }}>Attivo</TableCell>
                <TableCell sx={{ width: 20 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {financialResources.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Nessuna risorsa finanziaria trovata
                  </TableCell>
                </TableRow>
              )}
              {financialResources.map((financialResource, index) => (
                <TableRow key={index}>
                  <TableCell>{financialResource.name}</TableCell>
                  <TableCell>{financialResource.default &&
                      <Chip label="Default" variant="outlined" />}</TableCell>
                  <TableCell>{financialResource.type}</TableCell>
                  {/*<TableCell>{financialResource.is_active*/}
                  {/*  ? <Chip label="Attivo" variant="filled" color="success" />*/}
                  {/*  : <Chip label="Inattivo" color="error" />}*/}
                  {/*</TableCell>*/}
                  <TableCell>
                    <Switch
                      checked={financialResource.is_active}
                      onChange={() => handleToggleActive(financialResource)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      id={'financial-resource-menu-button-' + financialResource.id}
                      aria-controls={menuState.anchorEl && menuState.id === financialResource.id ? 'financial-resource-menu-' + financialResource.id : undefined}
                      aria-haspopup="true"
                      aria-expanded={menuState.anchorEl && menuState.id === financialResource.id ? 'true' : undefined}
                      onClick={(e) => handleClickOpen(e, financialResource.id!)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      id={'financial-resource-menu-' + financialResource.id}
                      anchorEl={menuState.anchorEl}
                      open={menuState.anchorEl !== null && menuState.id === financialResource.id}
                      onClose={handleCloseMenu}
                    >
                      <MenuList>
                        <MenuItem onClick={() => handleEdit(financialResource)}>
                          <ListItemIcon>
                            <EditIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>
                            Modifica
                          </ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => handleSetDefault(financialResource)}>
                          <ListItemIcon>
                            <HomeIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>
                            Imposta come predefinito
                          </ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => handleToggleActive(financialResource)}>
                          <ListItemIcon>
                            {financialResource.is_active ? <DeleteIcon fontSize="small" /> :
                              <CheckIcon fontSize="small" />}
                          </ListItemIcon>
                          <ListItemText>
                            {financialResource.is_active ? 'Disabilita' : 'Abilita'}
                          </ListItemText>
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    </MyCard>
  );
};

export default FinancialResourcesCard;
