import React from 'react';
import { Formik, FormikConfig, Form } from 'formik';
import * as Yup from 'yup';
import { router, usePage } from '@inertiajs/react';
import { BookableService, PageProps } from '@/types';
import { RequestPayload } from '@inertiajs/core';
import { Grid, Typography, Divider, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import TextField from '@/components/ui/TextField';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import TimePicker from '@/components/ui/TimePicker';
import TimeSlotManager from './TimeSlotManager';

interface AvailabilityTabProps {
  service: BookableService;
  onDismiss: () => void;
}

const daysOfWeek = [
  { value: 'monday', label: 'Lunedì' },
  { value: 'tuesday', label: 'Martedì' },
  { value: 'wednesday', label: 'Mercoledì' },
  { value: 'thursday', label: 'Giovedì' },
  { value: 'friday', label: 'Venerdì' },
  { value: 'saturday', label: 'Sabato' },
  { value: 'sunday', label: 'Domenica' },
];

export default function AvailabilityTab({ service, onDismiss }: AvailabilityTabProps) {
  const { currentTenantId } = usePage<PageProps>().props;

  const availabilitySettings = service.settings?.availability || {};
  const timeSlots = availabilitySettings.time_slots || [];

  const parseTimeSlots = (slots: any[]) => {
    return slots.map(slot => ({
      day: slot.day,
      start_time: slot.start_time
        ? new Date().setHours(
            Number(slot.start_time.split(':')[0]),
            Number(slot.start_time.split(':')[1])
          )
        : null,
      end_time: slot.end_time
        ? new Date().setHours(
            Number(slot.end_time.split(':')[0]),
            Number(slot.end_time.split(':')[1])
          )
        : null,
      max_bookings: slot.max_bookings || 1,
    }));
  };

  const formik: FormikConfig<{
    available_days: string[];
    default_start_time: Date | null;
    default_end_time: Date | null;
    slot_duration_minutes: number;
    max_concurrent_bookings: number;
    time_slots: Array<{
      day: string;
      start_time: Date | null;
      end_time: Date | null;
      max_bookings: number;
    }>;
  }> = {
    initialValues: {
      available_days: availabilitySettings.available_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      default_start_time: availabilitySettings.default_start_time
        ? new Date().setHours(
            Number(availabilitySettings.default_start_time.split(':')[0]),
            Number(availabilitySettings.default_start_time.split(':')[1])
          )
        : new Date().setHours(9, 0),
      default_end_time: availabilitySettings.default_end_time
        ? new Date().setHours(
            Number(availabilitySettings.default_end_time.split(':')[0]),
            Number(availabilitySettings.default_end_time.split(':')[1])
          )
        : new Date().setHours(20, 0),
      slot_duration_minutes: availabilitySettings.slot_duration_minutes || 60,
      max_concurrent_bookings: availabilitySettings.max_concurrent_bookings || 1,
      time_slots: timeSlots.length > 0 ? parseTimeSlots(timeSlots) : [],
    },
    validationSchema: Yup.object({
      available_days: Yup.array()
        .of(Yup.string())
        .min(1, 'Seleziona almeno un giorno')
        .required('Campo obbligatorio'),
      default_start_time: Yup.date()
        .required('Campo obbligatorio')
        .nullable(),
      default_end_time: Yup.date()
        .required('Campo obbligatorio')
        .nullable()
        .test('is-after-start', 'Deve essere dopo l\'orario di inizio', function(value) {
          const { default_start_time } = this.parent;
          if (!value || !default_start_time) return true;
          return new Date(value).getTime() > new Date(default_start_time).getTime();
        }),
      slot_duration_minutes: Yup.number()
        .required('Campo obbligatorio')
        .min(15, 'Minimo 15 minuti')
        .max(480, 'Massimo 480 minuti (8 ore)'),
      max_concurrent_bookings: Yup.number()
        .required('Campo obbligatorio')
        .min(1, 'Deve essere almeno 1')
        .max(50, 'Massimo 50'),
    }),
    onSubmit: (values) => {
      const formatTime = (date: Date | null) => {
        if (!date) return null;
        const d = new Date(date);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      };

      // Format time slots for backend
      const formattedTimeSlots = values.time_slots.map(slot => ({
        day: slot.day,
        start_time: formatTime(slot.start_time),
        end_time: formatTime(slot.end_time),
        max_bookings: slot.max_bookings,
      }));

      const updatedSettings = {
        ...service.settings,
        availability: {
          available_days: values.available_days,
          default_start_time: formatTime(values.default_start_time),
          default_end_time: formatTime(values.default_end_time),
          slot_duration_minutes: values.slot_duration_minutes,
          max_concurrent_bookings: values.max_concurrent_bookings,
          time_slots: formattedTimeSlots,
        },
      };

      const data = {
        ...service,
        settings: updatedSettings,
      };

      router.patch(
        route('app.bookable-services.update', {
          bookable_service: service.id,
          tenant: currentTenantId,
        }),
        data as unknown as RequestPayload,
        { preserveState: false }
      );
    },
    enableReinitialize: true,
  };

  return (
    <Formik {...formik}>
      {({ values, setFieldValue }) => (
        <Form>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Typography variant="h6" gutterBottom>Disponibilità Generale</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={12}>
              <Typography variant="body2" gutterBottom sx={{ mb: 1 }}>Giorni Disponibili</Typography>
              <FormGroup row>
                {daysOfWeek.map((day) => (
                  <FormControlLabel
                    key={day.value}
                    control={
                      <Checkbox
                        checked={values.available_days.includes(day.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFieldValue('available_days', [...values.available_days, day.value]);
                          } else {
                            setFieldValue('available_days', values.available_days.filter(d => d !== day.value));
                          }
                        }}
                      />
                    }
                    label={day.label}
                  />
                ))}
              </FormGroup>
            </Grid>

            <Grid size={6}>
              <TimePicker name="default_start_time" label="Orario Inizio Predefinito" />
            </Grid>
            <Grid size={6}>
              <TimePicker name="default_end_time" label="Orario Fine Predefinito" />
            </Grid>

            <Grid size={6}>
              <TextField
                name="slot_duration_minutes"
                label="Durata Slot (minuti)"
                type="number"
                helperText="Durata standard di ogni slot"
                fullWidth
              />
            </Grid>
            <Grid size={6}>
              <TextField
                name="max_concurrent_bookings"
                label="Prenotazioni Simultanee Max"
                type="number"
                helperText="Max prenotazioni nello stesso orario"
                fullWidth
              />
            </Grid>

            <Grid size={12} sx={{ mt: 4 }}>
              <Divider sx={{ mb: 3 }} />
              <TimeSlotManager name="time_slots" />
            </Grid>

            <Grid size={12} sx={{ mt: 3, textAlign: 'right' }}>
              <FormikSaveButton />
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
}
