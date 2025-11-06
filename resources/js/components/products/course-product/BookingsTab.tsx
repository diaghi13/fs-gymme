import React from 'react';
import { Formik, FormikConfig } from 'formik';
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
