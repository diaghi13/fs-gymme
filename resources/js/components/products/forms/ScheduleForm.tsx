import React, { useEffect } from 'react';
import { Form, useFormikContext } from 'formik';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow, Tooltip,
  Typography
} from '@mui/material';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import Checkbox from '@/components/ui/Checkbox';
import Autocomplete from '@/components/ui/Autocomplete';
import TimePicker from '@/components/ui/TimePicker';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTheme } from '@mui/material/styles';
import { scheduleOptions } from '../index';
import { AutocompleteOption, ProductSchedule } from '@/types';
import { router } from '@inertiajs/react';
import { normalizeScheduleToSave } from '@/components/products/base-product/ScheduleTab';

interface ProductScheduleRowProps {
  day: AutocompleteOption<string> | null;
  from_time: Date | number;
  to_time: Date | number;
}

const createRow = (dayBefore: string): ProductScheduleRowProps => {
  return {
    day: scheduleOptions.find(option => option.value === dayBefore) ?? null,
    from_time: new Date().setHours(0, 0, 0),
    to_time: new Date().setHours(23, 59, 59)
  };
};

interface ScheduleFormProps {
  onDismiss: () => void;
}

export default function ScheduleForm({ onDismiss }: ScheduleFormProps) {
  const { values, setFieldValue } = useFormikContext<{
    is_schedulable: boolean,
    product_schedules: ProductSchedule[]
  }>();
  const theme = useTheme();
  const checked = values.is_schedulable;

  const handleCreate = () => {
    setFieldValue('product_schedules', [
      ...values.product_schedules,
      createRow(scheduleOptions[0].value)
    ]);
  };

  const handleUpdate = (index: number, field: string, value: any) => {
    const data = {
      ...values.product_schedules[index],
      [field]: value
    };

    router.patch(
      route('app.base-products.schedules.update', values.product_schedules[index].id),
      normalizeScheduleToSave(data),
      {
        preserveState: true
      }
    );
  };

  const handleDelete = (index: number) => {
    router.delete(
      route('app.base-products.schedules.destroy', values.product_schedules[index].id),
      {
        preserveState: true
      });
  };

  useEffect(() => {
    if (checked && values.product_schedules.length === 0) {
      const scheduleItems = scheduleOptions.map(item => createRow(item.value));
      setFieldValue('product_schedules', [...scheduleItems]);
    }

    if (!checked) {
      setFieldValue('product_schedules', []);
    }
  }, [checked, setFieldValue, values.product_schedules.length]);

  return (
    <Form>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Checkbox
            label={'Aggiungi orari di accesso'}
            name="is_schedulable"
          />
        </Grid>
        <Grid size={12}>
          <Box sx={{ border: '3px solid ' + theme.palette.primary.main, p: 2 }}>
            <Typography
              variant={'body1'}>
              <strong>N.B.:</strong> se non vengono specificati gli orari, il
              servizio è da ritenersi sempre attivo in base agli orari di apertura e chiusura del centro
            </Typography>
          </Box>
        </Grid>
        <Grid size={12}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 200 }}>Giorno</TableCell>
                <TableCell sx={{ maxWidth: 150 }}>Orario ingresso</TableCell>
                <TableCell sx={{ maxWidth: 150 }}>Orario uscita</TableCell>
                <TableCell sx={{ maxWidth: 50 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {values.product_schedules?.length > 0 && values.product_schedules.map((item: ProductSchedule, index: number) => (
                <TableRow
                  key={index}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    <Autocomplete
                      options={scheduleOptions}
                      name={`product_schedules[${index}]day`}
                      label="Giorno"
                      onBlur={() => {
                        handleUpdate(index, 'day', values.product_schedules[index].day);
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150 }}>
                    <TimePicker
                      label="Inizio"
                      name={`product_schedules[${index}]from_time`}
                      onBlur={() => {
                        const from_time = values.product_schedules[index].from_time;
                        if (from_time) {
                          handleUpdate(index, 'from_time', from_time);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150 }}>
                    <TimePicker
                      label="Fine"
                      name={`product_schedules[${index}]to_time`}
                      onBlur={() => {
                        const to_time = values.product_schedules[index].to_time;
                        if (to_time) {
                          handleUpdate(index, 'to_time', to_time);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 50 }}>
                    <Tooltip title="Rimuovi">
                      <IconButton onClick={() => handleDelete(index)}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {values.is_schedulable && (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center' }}>
                    <Button onClick={handleCreate}>Aggiungi rigo</Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Grid>
        <Grid size={12} sx={{ textAlign: 'end' }}>
          <Button size="small" sx={{ marginRight: 2 }} onClick={onDismiss}>Annulla</Button>
          <FormikSaveButton />
        </Grid>
      </Grid>
    </Form>
  );
};
