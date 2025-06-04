import * as React from 'react';
import { Grid, TableCell, TableRow } from '@mui/material';
import TextField from '@/components/ui/TextField';

interface ExtraExpandableFormRowProps {
  index: number;
  content: 'standard_content' | 'optional_content';
}

const ExtraFormRow: React.FC<ExtraExpandableFormRowProps> = ({ index, content }) => {
  return (
    <TableRow sx={{ backgroundColor: 'rgba(209,209,209,0.11)' }}>
      <TableCell colSpan={6}>
        <Grid container spacing={2}>
          <Grid size={3}>
            <TextField label={'Ing. giornalieri'} name={`${content}[${index}].daily_access`} />
          </Grid>
          <Grid size={3}>
            <TextField label={'Ing. settimanali'} name={`${content}[${index}].weekly_access`} />
          </Grid>
          <Grid size={3}>
            <TextField label={'Prenotazioni'} name={`${content}[${index}].reservation_limit`} />
          </Grid>
          <Grid size={3}>
            <TextField label={'Prenotazioni giornaliere'} name={`${content}[${index}].daily_reservation_limit`} />
          </Grid>
        </Grid>
      </TableCell>
    </TableRow>
  );
};

export default ExtraFormRow;
