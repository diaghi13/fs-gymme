import React from 'react';
import { Box, Alert, Collapse } from '@mui/material';
import { useFormikContext } from 'formik';
import FormFeedback from '@/components/ui/FormFeedback';

interface TabContainerProps {
  children: React.ReactNode;
  warning?: string;
}

export default function TabContainer({ children, warning }: TabContainerProps) {
  const formik = useFormikContext();
  const hasErrors = formik ? Object.keys(formik.errors).length > 0 && formik.submitCount > 0 : false;

  return (
    <Box>
      <FormFeedback isSubmitting={formik?.isSubmitting} />

      {warning && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="warning">{warning}</Alert>
        </Box>
      )}

      <Collapse in={hasErrors}>
        <Box sx={{ mb: 2 }}>
          <Alert severity="error">
            Correggi gli errori nel modulo prima di salvare
          </Alert>
        </Box>
      </Collapse>

      {children}
    </Box>
  );
}
