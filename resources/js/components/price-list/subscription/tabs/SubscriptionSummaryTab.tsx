import * as React from 'react';
import { PriceListSubscription } from '@/types';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface SubscriptionSummaryTabProps {
  priceList: PriceListSubscription;
}

const SubscriptionSummaryTab: React.FC<SubscriptionSummaryTabProps> = ({ priceList }) => {
  const standardContent = priceList.standard_content || [];
  const optionalContent = priceList.optional_content || [];

  const totalStandardPrice = standardContent.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalOptionalPrice = optionalContent.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <Box>
      <Grid container spacing={3}>
        {/* General Information */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informazioni Generali
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">Nome Abbonamento</Typography>
                  <Typography variant="body1" fontWeight="bold">{priceList.name || 'N/D'}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">Colore</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: 1,
                        backgroundColor: priceList.color || '#ccc',
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                    />
                    <Typography variant="body1">{priceList.color || 'N/D'}</Typography>
                  </Box>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">Vendibile</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    {priceList.saleable ? (
                      <>
                        <CheckCircleIcon color="success" fontSize="small" />
                        <Typography variant="body1">Sì</Typography>
                      </>
                    ) : (
                      <>
                        <CancelIcon color="error" fontSize="small" />
                        <Typography variant="body1">No</Typography>
                      </>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Subscription Benefits */}
        {(priceList.guest_passes_total || priceList.guest_passes_per_month || priceList.multi_location_access) && (
          <Grid size={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Benefici Abbonamento
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {priceList.guest_passes_total && (
                    <Grid size={4}>
                      <Typography variant="body2" color="text.secondary">Guest Pass Totali</Typography>
                      <Typography variant="body1" fontWeight="bold">{priceList.guest_passes_total}</Typography>
                    </Grid>
                  )}
                  {priceList.guest_passes_per_month && (
                    <Grid size={4}>
                      <Typography variant="body2" color="text.secondary">Guest Pass al Mese</Typography>
                      <Typography variant="body1" fontWeight="bold">{priceList.guest_passes_per_month}</Typography>
                    </Grid>
                  )}
                  {priceList.multi_location_access && (
                    <Grid size={4}>
                      <Typography variant="body2" color="text.secondary">Accesso Multi-Sede</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                        <Typography variant="body1">Abilitato</Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Standard Content */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Contenuto Standard
                </Typography>
                <Chip
                  label={`Totale: € ${totalStandardPrice.toFixed(2)}`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              {standardContent.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Prodotto/Servizio</strong></TableCell>
                        <TableCell align="center"><strong>Durata</strong></TableCell>
                        <TableCell align="right"><strong>Prezzo</strong></TableCell>
                        <TableCell align="center"><strong>IVA</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {standardContent.map((content, index) => (
                        <TableRow key={index}>
                          <TableCell>{content.price_listable?.name || 'N/D'}</TableCell>
                          <TableCell align="center">
                            {content.months_duration
                              ? `${content.months_duration} mes${content.months_duration > 1 ? 'i' : 'e'}`
                              : content.days_duration
                              ? `${content.days_duration} giorn${content.days_duration > 1 ? 'i' : 'o'}`
                              : 'N/D'}
                          </TableCell>
                          <TableCell align="right">€ {(content.price || 0).toFixed(2)}</TableCell>
                          <TableCell align="center">{content.vat_rate_id || 'N/D'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                  Nessun contenuto standard configurato
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Optional Content */}
        {optionalContent.length > 0 && (
          <Grid size={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Contenuto Opzionale
                  </Typography>
                  <Chip
                    label={`Totale: € ${totalOptionalPrice.toFixed(2)}`}
                    color="secondary"
                    variant="outlined"
                  />
                </Box>
                <Divider sx={{ mb: 2 }} />
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Prodotto/Servizio</strong></TableCell>
                        <TableCell align="center"><strong>Durata</strong></TableCell>
                        <TableCell align="right"><strong>Prezzo</strong></TableCell>
                        <TableCell align="center"><strong>IVA</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {optionalContent.map((content, index) => (
                        <TableRow key={index}>
                          <TableCell>{content.price_listable?.name || 'N/D'}</TableCell>
                          <TableCell align="center">
                            {content.months_duration
                              ? `${content.months_duration} mes${content.months_duration > 1 ? 'i' : 'e'}`
                              : content.days_duration
                              ? `${content.days_duration} giorn${content.days_duration > 1 ? 'i' : 'o'}`
                              : 'N/D'}
                          </TableCell>
                          <TableCell align="right">€ {(content.price || 0).toFixed(2)}</TableCell>
                          <TableCell align="center">{content.vat_rate_id || 'N/D'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Total Summary */}
        <Grid size={12}>
          <Card sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Totale Abbonamento
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  € {(totalStandardPrice + totalOptionalPrice).toFixed(2)}
                </Typography>
              </Box>
              {optionalContent.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    Standard: € {totalStandardPrice.toFixed(2)} • Opzionale: € {totalOptionalPrice.toFixed(2)}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SubscriptionSummaryTab;
