import React, { useEffect } from 'react';
import { Form, useFormikContext } from 'formik';
import {
  Box,
  Button,
  Grid, IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow, Tooltip,
  Typography
} from '@mui/material';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import Checkbox from '@/components/ui/Checkbox';
import { useTheme } from '@mui/material/styles';
import Autocomplete from '@/components/ui/Autocomplete';
import TimePicker from '@/components/ui/TimePicker';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { scheduleOptions } from '@/components/products';

const createDefaultOperatingHours = () => {
  return scheduleOptions.map(option => ({
    day: option,
    open: new Date('1970-01-01T00:00:00'),
    close: new Date('1970-01-01T23:59:59')
  }));
};

const getNextDay = (lastDay: { label: string, value: string }) => {
  const currentIndex = scheduleOptions.findIndex(option => option.value === lastDay.value);
  const nextIndex = (currentIndex + 1) % scheduleOptions.length;
  return scheduleOptions[nextIndex];
};

interface ScheduleFormProps {
  onDismiss: () => void;
}

export default function ScheduleForm({ onDismiss }: ScheduleFormProps) {
  const { values, setFieldValue } = useFormikContext<{
    is_schedulable: boolean,
    operating_hours: { day: { label: string, value: string }, open: Date, close: Date }[]
  }>();
  const theme = useTheme();
  const checked = values.is_schedulable;

  useEffect(() => {
    if (!checked) {
      setFieldValue('operating_hours', []);
    } else if (checked && values.operating_hours.length === 0) {
      setFieldValue('operating_hours', createDefaultOperatingHours());
    }
  }, [checked, setFieldValue, values.operating_hours.length]);

  const handleAddRow = () => {
    const day = values.operating_hours.length > 0
      ? getNextDay(values.operating_hours[values.operating_hours.length - 1].day)
      : scheduleOptions[0];

    setFieldValue('operating_hours', [
      ...values.operating_hours,
      {
        day,
        open: new Date('1970-01-01T00:00:00'),
        close: new Date('1970-01-01T23:59:59')
      }
    ]);

    if (values.operating_hours.length === 0) {
      setFieldValue('is_schedulable', true);
    }
  };

  const handleRemoveRow = (index: number) => {
    const updatedHours = values.operating_hours.filter((_, i) => i !== index);

    if (updatedHours.length === 0) {
      setFieldValue('is_schedulable', false);
      return;
    }

    setFieldValue('operating_hours', updatedHours);
  };

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
              {values.operating_hours.map((_, index) => (
                <TableRow
                  key={index}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    <Autocomplete<{ label: string, value: string }>
                      options={scheduleOptions}
                      name={`operating_hours[${index}]day`}
                      label="Giorno"
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150 }}>
                    <TimePicker
                      label="Inizio"
                      name={`operating_hours[${index}]open`}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150 }}>
                    <TimePicker
                      label="Fine"
                      name={`operating_hours[${index}]close`}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 50 }}>
                    <Tooltip title="Rimuovi">
                      <IconButton onClick={() => handleRemoveRow(index)}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Grid>
        <Grid size={12}>
          <Button onClick={handleAddRow}>Aggiungi Giorno</Button>
        </Grid>
        <Grid size={12} sx={{ textAlign: 'end' }}>
          <Button size="small" sx={{ marginRight: 2 }} onClick={onDismiss}>Annulla</Button>
          <FormikSaveButton />
        </Grid>
      </Grid>
    </Form>
  );
};
