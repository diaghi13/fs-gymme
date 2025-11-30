import React from 'react';
import {
  Button,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Select as MuiSelect,
  FormControl, InputLabel, MenuItem, SelectChangeEvent, Stack, IconButton
} from '@mui/material';
import { Form, useFormikContext } from 'formik';
import { AutocompleteOptions, CourseProduct, ProductPlanning } from '@/types';

import DeleteIcon from '@mui/icons-material/Delete';
import DatePicker from '@/components/ui/DatePicker';
import Autocomplete from '@/components/ui/Autocomplete';
import TimePicker from '@/components/ui/TimePicker';
import Select from '@/components/ui/Select';
import TextField from '@/components/ui/TextField';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import { scheduleOptions } from '@/components/products';

const fillPlanning = (planning: ProductPlanning) => {
  return {
    planning_id: planning.id,
    from_date: new Date(planning.from_date),
    to_date: new Date(planning.to_date),
    details: planning.details?.map(detail => {
      const dayOption = scheduleOptions.find(option => option.value === String(detail.day));
      const timeDate = new Date();
      timeDate.setHours(
        Number((detail.time as string).split(':')[0]),
        Number((detail.time as string).split(':')[1])
      );

      return {
        day: dayOption || { value: '', label: '' },
        time: timeDate,
        duration_in_minutes: detail.duration_in_minutes,
        instructor_id: detail.instructor_id?.toString() || '',
        room_id: detail.room_id?.toString() || ''
      };
    }) || []
  };
};

const getCurrentPlanning = (plannings: Array<ProductPlanning>) => {
  const today = new Date();

  let current: string | number = '';

  plannings.forEach(planning => {
    const startAt = new Date(planning.from_date);
    const endAt = new Date(planning.to_date);

    if (today >= startAt && today <= endAt) {
      current = planning.id;
    }
  });

  return current;
};

interface TimetableFormProps {
  product: CourseProduct;
  planningOptions: AutocompleteOptions<number>;
}

export default function TimetableForm({ product, planningOptions }: TimetableFormProps) {
  const { values, setFieldValue, resetForm } = useFormikContext<{
    planning_id: number | null;
    from_date: Date | null;
    to_date: Date | null;
    details: Array<{
      day: { value: string; label: string };
      time: Date;
      duration_in_minutes: number;
      instructor_id: string;
      room_id: string;
    }>;
  }>();
  const [reformatPlanningOptions, setReformatPlanningOptions] = React.useState(planningOptions);

  const [planningSelect, setPlanningSelect] = React.useState(values.planning_id?.toString() || '');

  const handleChange = (event: SelectChangeEvent) => {
    setPlanningSelect(event.target.value as string);
  };

  const createRow = () => {
    if (values.details.length > 0) {
      const lastInsert = values.details.slice(-1)[0];
      const lastInsertDay = lastInsert.day;
      const lastInsertDayIndex = scheduleOptions.indexOf(lastInsertDay);
      const nextDay = lastInsertDayIndex === (scheduleOptions.length - 1)
        ? scheduleOptions[0]
        : scheduleOptions[lastInsertDayIndex + 1];

      return {
        day: nextDay,
        time: lastInsert.time,
        duration_in_minutes: lastInsert.duration_in_minutes,
        instructor_id: lastInsert.instructor_id,
        room_id: lastInsert.room_id
      };
    } else {
      return {
        day: scheduleOptions[0],
        time: null,
        duration_in_minutes: '',
        instructor_id: '',
        room_id: ''
      };
    }
  };

  const handleCreateRow = () => {
    const newRow = createRow();

    setFieldValue('details', [...values.details, newRow]);
  };

  const handleDelete = (index: number) => {
    const newValues = values.details.toSpliced(index, 1);
    console.log(newValues);

    setFieldValue('details', newValues);
  };

  React.useEffect(() => {
    if (planningSelect && product.plannings) {
      const planning = product.plannings.find(planning => planning.id === planningSelect as unknown as number);

      if (planning) {
        const currentValues = fillPlanning(planning);
        resetForm({ values: currentValues });
      }
    } else {
      const currentValues = {
        planning_id: null,
        from_date: null,
        to_date: null,
        details: []
      };

      resetForm({ values: currentValues });
    }
  }, [planningSelect, product.plannings, resetForm]);

  return (
    <Form id={'planning_form'}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <FormControl fullWidth variant="standard">
            <InputLabel id="planning-select-label">Planning</InputLabel>
            <MuiSelect
              labelId="planning-select-label"
              id="planning-select"
              value={planningSelect}
              label="Age"
              onChange={handleChange}
            >
              <MenuItem value={''}>Scegli...</MenuItem>
              {reformatPlanningOptions.map((planning, index) => (
                <MenuItem key={index} value={planning.value}>{planning.label}</MenuItem>
              ))}
            </MuiSelect>
          </FormControl>
        </Grid>
        {planningSelect && (
          <Grid size={12}>
            <Stack display={'flex'} flexDirection={'row'} spacing={2}>
              <Button variant={'contained'} onClick={() => {
                setPlanningSelect('');
                document.getElementById('from_date')?.focus();
              }}>Aggiungi</Button>
            </Stack>
          </Grid>
        )}
        <Grid size={12}>
          <Divider />
        </Grid>
        <Grid size={6}>
          <DatePicker label={'Data inizio'} name={'from_date'} />
        </Grid>
        <Grid size={6}>
          <DatePicker label={'Data fine'} name={'to_date'} />
        </Grid>
        <Grid size={12}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 150 }}>
                  Giorno
                </TableCell>
                <TableCell sx={{ width: 100 }}>
                  Orario
                </TableCell>
                <TableCell sx={{ width: 100 }}>
                  Durata(m)
                </TableCell>
                <TableCell>Istruttore</TableCell>
                <TableCell>Sala</TableCell>
                <TableCell sx={{ width: 30 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {values.details.map((_: any, index: number) => (
                <TableRow key={index}>
                  <TableCell sx={{ paddingX: 1 }}>
                    <Autocomplete name={`details[${index}]day`} options={scheduleOptions} />
                  </TableCell>
                  <TableCell sx={{ paddingX: 1, maxWidth: 100 }}>
                    <TimePicker name={`details[${index}]time`} />
                  </TableCell>
                  <TableCell sx={{ paddingX: 1, maxWidth: 100 }}>
                    <TextField name={`details[${index}]duration_in_minutes`} />
                  </TableCell>
                  <TableCell sx={{ paddingX: 1 }}>
                    <Select name={`details[${index}]instructor_id`} options={[]} />
                  </TableCell>
                  <TableCell sx={{ paddingX: 1 }}>
                    <Select name={`details[${index}]room_id`} options={[]} />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDelete(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center' }}>
                  <Button onClick={handleCreateRow}>Aggiungi rigo</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Grid>
        <Grid size={12} sx={{ textAlign: 'end' }}>
          <Button size="small" sx={{ marginRight: 2 }} onClick={() => {
          }}>Annulla</Button>
          <FormikSaveButton />
        </Grid>
      </Grid>
    </Form>
  );
}
