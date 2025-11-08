import React from 'react';
import { Formik, FormikConfig } from 'formik';
import * as Yup from 'yup';
import { router, usePage } from '@inertiajs/react';
import { CourseProduct } from '@/types';
import { RequestPayload } from '@inertiajs/core';
import { CourseProductPageProps } from '@/pages/products/course-products';
import { Form } from 'formik';
import { Grid, Typography, Divider } from '@mui/material';
import TextField from '@/components/ui/TextField';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import Switch from '@/components/ui/Switch';
import Select from '@/components/ui/Select';

interface BookingsTabProps {
  product: CourseProduct;
  onDismiss: () => void;
}

const skillLevelOptions = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzato' },
];

const courseTypeOptions = [
  { value: 'group', label: 'Gruppo' },
  { value: 'semi_private', label: 'Semi-Privato' },
];

export default function BookingsTab({ product, onDismiss }: BookingsTabProps) {
  const { currentTenantId } = usePage<CourseProductPageProps>().props;

  // Extract settings with safe defaults
  const courseSettings = product.settings?.course || {};
  const bookingSettings = product.settings?.booking || {};
  const materialsSettings = product.settings?.materials || {};
  const progressionSettings = product.settings?.progression || {};

  const formik: FormikConfig<{
    total_lessons: number;
    lessons_per_week: number;
    lesson_duration_minutes: number;
    skill_level: string;
    course_type: string;
    curriculum: string;
    // Standard booking rules (for subscription integration)
    advance_days: number;
    min_advance_hours: number;
    cancellation_hours: number;
    max_per_day: number | null;
    buffer_minutes: number;
    // Course-specific booking rules
    enrollment_deadline_days: number;
    min_students_to_start: number;
    max_absences_allowed: number;
    makeup_lessons_allowed: boolean;
    transfer_to_next_course: boolean;
    equipment_provided: boolean;
    bring_own_equipment: boolean;
    materials_fee: number;
    has_certification: boolean;
  }> = {
    initialValues: {
      total_lessons: courseSettings.total_lessons || 12,
      lessons_per_week: courseSettings.lessons_per_week || 2,
      lesson_duration_minutes: courseSettings.lesson_duration_minutes || 60,
      skill_level: courseSettings.skill_level || 'beginner',
      course_type: courseSettings.course_type || 'group',
      curriculum: courseSettings.curriculum || '',
      // Standard booking rules
      advance_days: bookingSettings.advance_days || 7,
      min_advance_hours: bookingSettings.min_advance_hours || 24,
      cancellation_hours: bookingSettings.cancellation_hours || 48,
      max_per_day: bookingSettings.max_per_day || null,
      buffer_minutes: bookingSettings.buffer_minutes || 0,
      // Course-specific booking rules
      enrollment_deadline_days: bookingSettings.enrollment_deadline_days || 0,
      min_students_to_start: bookingSettings.min_students_to_start || 1,
      max_absences_allowed: bookingSettings.max_absences_allowed || 0,
      makeup_lessons_allowed: bookingSettings.makeup_lessons_allowed !== false,
      transfer_to_next_course: bookingSettings.transfer_to_next_course !== false,
      equipment_provided: materialsSettings.equipment_provided || false,
      bring_own_equipment: materialsSettings.bring_own_equipment !== false,
      materials_fee: materialsSettings.materials_fee || 0,
      has_certification: progressionSettings.has_certification || false,
    },
    validationSchema: Yup.object({
      total_lessons: Yup.number()
        .required('Campo obbligatorio')
        .min(1, 'Deve essere almeno 1 lezione')
        .max(200, 'Massimo 200 lezioni'),
      lessons_per_week: Yup.number()
        .required('Campo obbligatorio')
        .min(1, 'Deve essere almeno 1 lezione a settimana')
        .max(7, 'Massimo 7 lezioni a settimana'),
      lesson_duration_minutes: Yup.number()
        .required('Campo obbligatorio')
        .min(15, 'Minimo 15 minuti')
        .max(480, 'Massimo 480 minuti (8 ore)'),
      skill_level: Yup.string()
        .required('Campo obbligatorio')
        .oneOf(['beginner', 'intermediate', 'advanced'], 'Valore non valido'),
      course_type: Yup.string()
        .required('Campo obbligatorio')
        .oneOf(['group', 'semi_private'], 'Valore non valido'),
      curriculum: Yup.string()
        .url('Deve essere un URL valido')
        .nullable(),
      // Standard booking rules validation
      advance_days: Yup.number()
        .required('Campo obbligatorio')
        .min(0, 'Non può essere negativo')
        .max(365, 'Massimo 365 giorni'),
      min_advance_hours: Yup.number()
        .required('Campo obbligatorio')
        .min(0, 'Non può essere negativo')
        .max(168, 'Massimo 168 ore (7 giorni)'),
      cancellation_hours: Yup.number()
        .required('Campo obbligatorio')
        .min(0, 'Non può essere negativo')
        .max(168, 'Massimo 168 ore (7 giorni)'),
      max_per_day: Yup.number()
        .nullable()
        .min(1, 'Deve essere almeno 1')
        .max(50, 'Massimo 50 prenotazioni al giorno'),
      buffer_minutes: Yup.number()
        .required('Campo obbligatorio')
        .min(0, 'Non può essere negativo')
        .max(120, 'Massimo 120 minuti'),
      // Course-specific booking rules validation
      enrollment_deadline_days: Yup.number()
        .required('Campo obbligatorio')
        .min(0, 'Non può essere negativo')
        .max(90, 'Massimo 90 giorni'),
      min_students_to_start: Yup.number()
        .required('Campo obbligatorio')
        .min(1, 'Deve essere almeno 1 studente')
        .max(100, 'Massimo 100 studenti'),
      max_absences_allowed: Yup.number()
        .required('Campo obbligatorio')
        .min(0, 'Non può essere negativo')
        .test('max-absences-vs-total', 'Non può superare il numero totale di lezioni', function(value) {
          const { total_lessons } = this.parent;
          if (!value || !total_lessons) return true;
          return value <= total_lessons;
        }),
      materials_fee: Yup.number()
        .required('Campo obbligatorio')
        .min(0, 'Non può essere negativo')
        .max(10000, 'Massimo 10.000€'),
    }),
    onSubmit: (values) => {
      const updatedSettings = {
        ...product.settings,
        course: {
          total_lessons: values.total_lessons,
          lessons_per_week: values.lessons_per_week,
          lesson_duration_minutes: values.lesson_duration_minutes,
          skill_level: values.skill_level,
          course_type: values.course_type,
          curriculum: values.curriculum,
        },
        booking: {
          // Standard booking rules (for subscription integration)
          advance_days: values.advance_days,
          min_advance_hours: values.min_advance_hours,
          cancellation_hours: values.cancellation_hours,
          max_per_day: values.max_per_day,
          buffer_minutes: values.buffer_minutes,
          // Course-specific booking rules
          enrollment_deadline_days: values.enrollment_deadline_days,
          min_students_to_start: values.min_students_to_start,
          max_absences_allowed: values.max_absences_allowed,
          makeup_lessons_allowed: values.makeup_lessons_allowed,
          transfer_to_next_course: values.transfer_to_next_course,
        },
        materials: {
          equipment_provided: values.equipment_provided,
          equipment_list: materialsSettings.equipment_list || [],
          bring_own_equipment: values.bring_own_equipment,
          materials_fee: values.materials_fee,
        },
        progression: {
          has_certification: values.has_certification,
          next_level_course_id: progressionSettings.next_level_course_id || null,
          prerequisites: progressionSettings.prerequisites || [],
        },
      };

      const data = {
        ...product,
        settings: updatedSettings,
      };

      router.patch(
        route('app.course-products.update', {
          course_product: product.id,
          tenant: currentTenantId,
          tab: 3,
        }),
        data as unknown as RequestPayload,
        { preserveState: false }
      );
    },
    enableReinitialize: true,
  };

  return (
    <Formik {...formik}>
      <Form>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Typography variant="h6" gutterBottom>Configurazione Corso</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid size={6}><TextField name="total_lessons" label="Numero Totale Lezioni" type="number" fullWidth /></Grid>
          <Grid size={6}><TextField name="lessons_per_week" label="Lezioni a Settimana" type="number" fullWidth /></Grid>
          <Grid size={6}><TextField name="lesson_duration_minutes" label="Durata Lezione (minuti)" type="number" fullWidth /></Grid>
          <Grid size={6}><Select name="skill_level" label="Livello" options={skillLevelOptions} fullWidth /></Grid>
          <Grid size={6}><Select name="course_type" label="Tipo Corso" options={courseTypeOptions} fullWidth /></Grid>
          <Grid size={6}><TextField name="curriculum" label="Link Programma Corso" fullWidth /></Grid>

          <Grid size={12} sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Regole Prenotazione Standard</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Queste impostazioni vengono utilizzate come template quando il corso viene aggiunto a un abbonamento
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid size={6}>
            <TextField
              name="advance_days"
              label="Giorni Anticipo Prenotazione"
              type="number"
              helperText="Giorni massimi di anticipo per prenotare"
              fullWidth
            />
          </Grid>
          <Grid size={6}>
            <TextField
              name="min_advance_hours"
              label="Ore Minime Anticipo"
              type="number"
              helperText="Ore minime di anticipo per prenotare"
              fullWidth
            />
          </Grid>
          <Grid size={6}>
            <TextField
              name="cancellation_hours"
              label="Ore Minime Cancellazione"
              type="number"
              helperText="Ore minime per cancellare senza penali"
              fullWidth
            />
          </Grid>
          <Grid size={6}>
            <TextField
              name="max_per_day"
              label="Max Prenotazioni al Giorno"
              type="number"
              helperText="Lascia vuoto per illimitato"
              fullWidth
            />
          </Grid>
          <Grid size={6}>
            <TextField
              name="buffer_minutes"
              label="Minuti Buffer"
              type="number"
              helperText="Tempo di pausa tra prenotazioni consecutive"
              fullWidth
            />
          </Grid>

          <Grid size={12} sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Regole Iscrizione</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid size={6}><TextField name="enrollment_deadline_days" label="Giorni Limite Iscrizione" type="number" helperText="Giorni prima dell'inizio corso" fullWidth /></Grid>
          <Grid size={6}><TextField name="min_students_to_start" label="Studenti Minimi per Partire" type="number" fullWidth /></Grid>
          <Grid size={6}><TextField name="max_absences_allowed" label="Assenze Massime Consentite" type="number" fullWidth /></Grid>
          <Grid size={6}><Switch name="makeup_lessons_allowed" label="Lezioni di Recupero Permesse" /></Grid>
          <Grid size={6}><Switch name="transfer_to_next_course" label="Trasferimento al Corso Successivo" /></Grid>

          <Grid size={12} sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Materiali</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid size={6}><Switch name="equipment_provided" label="Attrezzatura Fornita" /></Grid>
          <Grid size={6}><Switch name="bring_own_equipment" label="Porta Propria Attrezzatura" /></Grid>
          <Grid size={6}><TextField name="materials_fee" label="Costo Materiali (€)" type="number" fullWidth /></Grid>

          <Grid size={12} sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Progressione</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid size={6}><Switch name="has_certification" label="Ha Certificazione Finale" /></Grid>

          <Grid size={12} sx={{ mt: 3, textAlign: 'right' }}>
            <FormikSaveButton />
          </Grid>
        </Grid>
      </Form>
    </Formik>
  );
}
