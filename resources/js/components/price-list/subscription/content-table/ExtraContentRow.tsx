import * as React from 'react';
import { Grid, TableCell, TableRow, Typography, Divider, Chip } from '@mui/material';
import { SubscriptionGeneralFormValuesWithContent } from '../tabs/SubscriptionGeneralTab';

interface ExtraContentRowProps {
  content: SubscriptionGeneralFormValuesWithContent;
}

const ExtraContentRow: React.FC<ExtraContentRowProps> = ({ content }) => {
  const hasAccessRules = content.unlimited_entries || content.total_entries || content.daily_entries || content.weekly_entries || content.monthly_entries;
  const hasBookingRules = content.max_concurrent_bookings || content.daily_bookings || content.weekly_bookings || content.advance_booking_days || content.cancellation_hours;
  const hasValidityRules = content.validity_type || content.validity_days || content.validity_months || content.valid_from || content.valid_to;
  const hasTimeRestrictions = content.has_time_restrictions && content.time_restrictions && content.time_restrictions.length > 0;
  const hasServiceRestrictions = content.service_access_type && content.service_access_type !== 'all';

  return (
    <TableRow sx={{ backgroundColor: 'rgba(0,144,255, 0.1)' }}>
      <TableCell colSpan={6}>
        <Grid container spacing={3}>
          {/* Access Rules */}
          {hasAccessRules && (
            <>
              <Grid size={12}>
                <Typography variant="subtitle2" fontWeight="bold">Regole di Accesso</Typography>
                <Divider sx={{ mt: 0.5 }} />
              </Grid>
              {content.unlimited_entries && (
                <Grid size={12}>
                  <Chip label="Accessi Illimitati" color="success" size="small" />
                </Grid>
              )}
              {!content.unlimited_entries && (
                <>
                  {content.total_entries && (
                    <Grid size={3}>
                      Ingressi totali: <strong>{content.total_entries}</strong>
                    </Grid>
                  )}
                  {content.daily_entries && (
                    <Grid size={3}>
                      Ingressi giornalieri: <strong>{content.daily_entries}</strong>
                    </Grid>
                  )}
                  {content.weekly_entries && (
                    <Grid size={3}>
                      Ingressi settimanali: <strong>{content.weekly_entries}</strong>
                    </Grid>
                  )}
                  {content.monthly_entries && (
                    <Grid size={3}>
                      Ingressi mensili: <strong>{content.monthly_entries}</strong>
                    </Grid>
                  )}
                </>
              )}
            </>
          )}

          {/* Booking Rules */}
          {hasBookingRules && (
            <>
              <Grid size={12}>
                <Typography variant="subtitle2" fontWeight="bold">Regole di Prenotazione</Typography>
                <Divider sx={{ mt: 0.5 }} />
              </Grid>
              {content.max_concurrent_bookings && (
                <Grid size={4}>
                  Prenotazioni simultanee: <strong>{content.max_concurrent_bookings}</strong>
                </Grid>
              )}
              {content.daily_bookings && (
                <Grid size={4}>
                  Prenotazioni giornaliere: <strong>{content.daily_bookings}</strong>
                </Grid>
              )}
              {content.weekly_bookings && (
                <Grid size={4}>
                  Prenotazioni settimanali: <strong>{content.weekly_bookings}</strong>
                </Grid>
              )}
              {content.advance_booking_days && (
                <Grid size={6}>
                  Anticipo prenotazione: <strong>{content.advance_booking_days} giorni</strong>
                </Grid>
              )}
              {content.cancellation_hours && (
                <Grid size={6}>
                  Cancellazione minima: <strong>{content.cancellation_hours} ore</strong>
                </Grid>
              )}
            </>
          )}

          {/* Validity Rules */}
          {hasValidityRules && (
            <>
              <Grid size={12}>
                <Typography variant="subtitle2" fontWeight="bold">Regole di Validità</Typography>
                <Divider sx={{ mt: 0.5 }} />
              </Grid>
              {content.validity_type && (
                <Grid size={3}>
                  Tipo: <strong>
                    {content.validity_type === 'duration' && 'Durata'}
                    {content.validity_type === 'fixed_date' && 'Data Fissa'}
                    {content.validity_type === 'first_use' && 'Primo Utilizzo'}
                  </strong>
                </Grid>
              )}
              {content.validity_days && (
                <Grid size={3}>
                  Validità: <strong>{content.validity_days} giorni</strong>
                </Grid>
              )}
              {content.validity_months && (
                <Grid size={3}>
                  Validità: <strong>{content.validity_months} mesi</strong>
                </Grid>
              )}
              {content.valid_from && (
                <Grid size={3}>
                  Valido da: <strong>{content.valid_from}</strong>
                </Grid>
              )}
              {content.valid_to && (
                <Grid size={3}>
                  Valido fino a: <strong>{content.valid_to}</strong>
                </Grid>
              )}
              {content.freeze_days_allowed && (
                <Grid size={6}>
                  Giorni freeze: <strong>{content.freeze_days_allowed}</strong>
                </Grid>
              )}
              {content.freeze_cost_cents && (
                <Grid size={6}>
                  Costo freeze: <strong>€ {(content.freeze_cost_cents / 100).toFixed(2)}</strong>
                </Grid>
              )}
            </>
          )}

          {/* Time Restrictions */}
          {hasTimeRestrictions && (
            <>
              <Grid size={12}>
                <Typography variant="subtitle2" fontWeight="bold">Restrizioni Orarie</Typography>
                <Divider sx={{ mt: 0.5 }} />
              </Grid>
              {content.time_restrictions.map((restriction: any, index: number) => {
                const dayLabels: Record<string, string> = {
                  'monday': 'Lun',
                  'tuesday': 'Mar',
                  'wednesday': 'Mer',
                  'thursday': 'Gio',
                  'friday': 'Ven',
                  'saturday': 'Sab',
                  'sunday': 'Dom',
                };

                const daysText = restriction.days && restriction.days.length > 0
                  ? restriction.days.map((d: string) => dayLabels[d] || d).join(', ')
                  : 'Tutti i giorni';

                const timeText = restriction.start_time && restriction.end_time
                  ? `${restriction.start_time} - ${restriction.end_time}`
                  : 'Tutto il giorno';

                const typeText = restriction.restriction_type === 'allowed' ? 'Permesso' : 'Bloccato';

                return (
                  <Grid size={6} key={index}>
                    <Chip
                      label={`${daysText} | ${timeText} | ${typeText}`}
                      size="small"
                      color={restriction.restriction_type === 'allowed' ? 'success' : 'error'}
                      variant="outlined"
                    />
                    {restriction.description && (
                      <Typography variant="caption" display="block" sx={{ ml: 1, mt: 0.5 }}>
                        {restriction.description}
                      </Typography>
                    )}
                  </Grid>
                );
              })}
            </>
          )}

          {/* Service Access */}
          {hasServiceRestrictions && (
            <>
              <Grid size={12}>
                <Typography variant="subtitle2" fontWeight="bold">Accesso Servizi</Typography>
                <Divider sx={{ mt: 0.5 }} />
              </Grid>
              <Grid size={12}>
                Tipo Accesso: <strong>
                  {content.service_access_type === 'included' && 'Solo Servizi Selezionati'}
                  {content.service_access_type === 'excluded' && 'Tutti Tranne Selezionati'}
                </strong>
                {content.services && content.services.length > 0 && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Servizi: {content.services.length} configurati
                  </Typography>
                )}
              </Grid>
            </>
          )}

          {/* Empty state if no rules */}
          {!hasAccessRules && !hasBookingRules && !hasValidityRules && !hasTimeRestrictions && !hasServiceRestrictions && (
            <Grid size={12}>
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                Nessuna regola configurata
              </Typography>
            </Grid>
          )}
        </Grid>
      </TableCell>
    </TableRow>
  );
};

export default ExtraContentRow;
