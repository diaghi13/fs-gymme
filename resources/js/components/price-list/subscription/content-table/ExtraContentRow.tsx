import * as React from 'react';
import { Grid, TableCell, TableRow } from '@mui/material';
import { SubscriptionGeneralFormValuesWithContent } from '../tabs/SubscriptionGeneralTab';

interface ExtraContentRowProps {
  content: SubscriptionGeneralFormValuesWithContent;
}

const ExtraContentRow: React.FC<ExtraContentRowProps> = ({ content }) => {
  return (
    <TableRow sx={{ backgroundColor: 'rgba(0,144,255, 0.1)' }}>
      <TableCell colSpan={6}>
        <Grid container spacing={2}>
          <Grid size={3}>
            Ing. giornalieri: <strong>{content.daily_access || 'illimitati'}</strong>
          </Grid>
          <Grid size={3}>
            Ing. mensili: <strong>{content.weekly_access || 'illimitati'}</strong>
          </Grid>
          <Grid size={3}>
            Limite prenotazioni: <strong>{content.reservation_limit || 'nessun limite'}</strong>
          </Grid>
          <Grid size={3}>
            Limite prenotazioni giornaliere: <strong>{content.daily_reservation_limit || 'nessun limite'}</strong>
          </Grid>
        </Grid>
      </TableCell>
    </TableRow>
  );
};

export default ExtraContentRow;
