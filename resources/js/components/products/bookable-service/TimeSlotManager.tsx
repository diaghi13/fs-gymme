import React from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Select from '@/components/ui/Select';
import TimePicker from '@/components/ui/TimePicker';
import TextField from '@/components/ui/TextField';
import { useFormikContext } from 'formik';

interface TimeSlot {
  day: string;
  start_time: Date | null;
  end_time: Date | null;
  max_bookings: number;
}

interface TimeSlotManagerProps {
  name: string;
}

const daysOptions = [
  { value: 'monday', label: 'Lunedì' },
  { value: 'tuesday', label: 'Martedì' },
  { value: 'wednesday', label: 'Mercoledì' },
  { value: 'thursday', label: 'Giovedì' },
  { value: 'friday', label: 'Venerdì' },
  { value: 'saturday', label: 'Sabato' },
  { value: 'sunday', label: 'Domenica' },
];

export default function TimeSlotManager({ name }: TimeSlotManagerProps) {
  const { values, setFieldValue } = useFormikContext<any>();
  const timeSlots: TimeSlot[] = values[name] || [];

  const handleAddSlot = () => {
    const newSlot: TimeSlot = {
      day: 'monday',
      start_time: new Date().setHours(9, 0) as any,
      end_time: new Date().setHours(17, 0) as any,
      max_bookings: 1,
    };
    setFieldValue(name, [...timeSlots, newSlot]);
  };

  const handleDeleteSlot = (index: number) => {
    const updated = timeSlots.filter((_, i) => i !== index);
    setFieldValue(name, updated);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">Slot Personalizzati per Giorno</Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAddSlot}
        >
          Aggiungi Slot
        </Button>
      </Box>

      {timeSlots.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
          <Typography variant="body2">
            Nessuno slot personalizzato. Usa il pulsante sopra per aggiungerne uno.
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Gli slot personalizzati sovrascrivono le impostazioni predefinite per i giorni specificati
          </Typography>
        </Box>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Giorno</TableCell>
              <TableCell>Orario Inizio</TableCell>
              <TableCell>Orario Fine</TableCell>
              <TableCell>Max Prenotazioni</TableCell>
              <TableCell width={50}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {timeSlots.map((slot, index) => (
              <TableRow key={index}>
                <TableCell sx={{ paddingX: 1 }}>
                  <Select
                    name={`${name}[${index}].day`}
                    options={daysOptions}
                    size="small"
                  />
                </TableCell>
                <TableCell sx={{ paddingX: 1 }}>
                  <TimePicker
                    name={`${name}[${index}].start_time`}
                    size="small"
                  />
                </TableCell>
                <TableCell sx={{ paddingX: 1 }}>
                  <TimePicker
                    name={`${name}[${index}].end_time`}
                    size="small"
                  />
                </TableCell>
                <TableCell sx={{ paddingX: 1 }}>
                  <TextField
                    name={`${name}[${index}].max_bookings`}
                    type="number"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleDeleteSlot(index)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}
