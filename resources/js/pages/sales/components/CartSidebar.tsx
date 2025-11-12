import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Typography,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField as MuiTextField,
  InputAdornment,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { SaleFormValues } from '../sale-create';
import { useQuickCalculate } from '@/hooks/useQuickCalculate';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import PercentIcon from '@mui/icons-material/Percent';
import EuroIcon from '@mui/icons-material/Euro';
import { addMonths, addDays, format } from 'date-fns';

export default function CartSidebar() {
  const { values, setFieldValue, isValid, submitForm } = useFormikContext<SaleFormValues>();
  const { result, isCalculating, error, calculate } = useQuickCalculate(300);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [tempPercentageDiscount, setTempPercentageDiscount] = useState<number>(0);
  const [tempAbsoluteDiscount, setTempAbsoluteDiscount] = useState<number>(0);

  // Handler per completare la vendita (status: saved)
  const handleCompleteSale = async () => {
    await setFieldValue('status', 'saved');
    submitForm();
  };

  // Handler per salvare come bozza (status: draft)
  const handleSaveDraft = async () => {
    await setFieldValue('status', 'draft');
    submitForm();
  };

  // Trigger calculation when cart or discounts change
  useEffect(() => {
    if (values.sale_contents.length === 0) {
      return;
    }

    const rows = values.sale_contents.map((content) => ({
      unit_price: content.unit_price || 0,
      quantity: content.quantity || 1,
      percentage_discount: content.percentage_discount || null,
      absolute_discount: content.absolute_discount || 0,
      vat_rate_percentage: content.price_list?.vat_rate?.percentage || content.subscription_selected_content?.map(selected_content => selected_content.vat_rate.percentage) || null,
      vat_rate_breakdown: content.subscription_selected_content?.map(selected_content => ({
        subtotal: selected_content.price,
        vat_rate: selected_content.vat_rate.percentage,
      })) || undefined,
    }));

    calculate({
      rows,
      sale_percentage_discount: values.discount_percentage || null,
      sale_absolute_discount: values.discount_absolute || 0,
      tax_included: values.tax_included,
    });
  }, [values.sale_contents, values.discount_percentage, values.discount_absolute, calculate, values.tax_included]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy');
  };

  const calculateExpiryDate = (startDate: Date | null | undefined, monthsDuration: number | null, daysDuration: number | null) => {
    if (!startDate) return null;

    const start = new Date(startDate);

    if (monthsDuration) {
      return addMonths(start, monthsDuration);
    }

    if (daysDuration) {
      return addDays(start, daysDuration);
    }

    return null;
  };

  const getProductExpiryInfo = (item: any) => {
    if (!item.start_date) return null;

    const startDate = new Date(item.start_date);
    let expiryDate = null;

    // All products with months_duration in price_list
    // (Membership, Token with months_duration)
    if (item.price_list.months_duration) {
      expiryDate = addMonths(startDate, item.price_list.months_duration);
      return { startDate, expiryDate };
    }

    // Token with validity_months
    if (item.price_list.validity_months) {
      expiryDate = addMonths(startDate, item.price_list.validity_months);
      return { startDate, expiryDate };
    }

    // Token with validity_days
    if (item.price_list.validity_days) {
      expiryDate = addDays(startDate, item.price_list.validity_days);
      return { startDate, expiryDate };
    }

    return null;
  };

  const handleRemoveItem = (index: number) => {
    const newContents = values.sale_contents.filter((_, i) => i !== index);
    setFieldValue('sale_contents', newContents);
  };

  const handleClearCart = () => {
    setFieldValue('sale_contents', []);
    setFieldValue('discount_percentage', 0);
    setFieldValue('discount_absolute', 0);
  };

  const handleEditItem = (index: number) => {
    const item = values.sale_contents[index];
    setTempPercentageDiscount(item.percentage_discount || 0);
    setTempAbsoluteDiscount(item.absolute_discount || 0);
    setEditingItem(index);
  };

  const handleSaveItemDiscount = () => {
    if (editingItem === null) return;

    setFieldValue(`sale_contents[${editingItem}].percentage_discount`, tempPercentageDiscount);
    setFieldValue(`sale_contents[${editingItem}].absolute_discount`, tempAbsoluteDiscount);
    setEditingItem(null);
  };

  const handlePercentageChange = (value: string) => {
    const percentage = parseFloat(value.replace(',', '.')) || 0;
    const item = values.sale_contents[editingItem!];
    const absolute = (item.unit_price * percentage) / 100;
    setTempPercentageDiscount(percentage);
    setTempAbsoluteDiscount(absolute);
  };

  const handleAbsoluteChange = (value: string) => {
    const absolute = parseFloat(value.replace(',', '.')) || 0;
    const item = values.sale_contents[editingItem!];
    const percentage = item.unit_price > 0 ? (absolute / item.unit_price) * 100 : 0;
    setTempAbsoluteDiscount(absolute);
    setTempPercentageDiscount(percentage);
  };

  const canComplete = isValid && values.sale_contents.length > 0 && values.payment_condition && result;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingCartIcon color="primary" />
            <Typography variant="h6">Carrello</Typography>
            {values.sale_contents.length > 0 && (
              <Chip label={values.sale_contents.length} size="small" color="primary" />
            )}
          </Box>
          {values.sale_contents.length > 0 && (
            <Button size="small" color="error" onClick={handleClearCart}>
              Svuota
            </Button>
          )}
        </Box>
      </Box>

      {/* Cart Items */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        {values.sale_contents.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <ShoppingCartIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
            <Typography variant="body2">Il carrello è vuoto</Typography>
            <Typography variant="caption">Aggiungi prodotti per iniziare</Typography>
          </Box>
        )}

        {values.sale_contents.length > 0 && (
          <List disablePadding>
            {values.sale_contents.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem
                  disablePadding
                  sx={{ py: 1 }}
                  secondaryAction={
                    <Box>
                      <IconButton size="small" onClick={() => handleEditItem(index)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton edge="end" size="small" onClick={() => handleRemoveItem(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', pr: 4 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {item.price_list.name}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(item.unit_price)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="caption" color="text.secondary" component="span" display="block">
                          Q.tà: {item.quantity}
                        </Typography>
                        {(item.percentage_discount > 0 || item.absolute_discount > 0) && (
                          <Typography variant="caption" color="error" component="span" display="block" sx={{ mt: 0.5 }}>
                            Sconto: {item.percentage_discount > 0 ? `${item.percentage_discount}%` : formatCurrency(item.absolute_discount)}
                          </Typography>
                        )}

                        {/* Product expiry info for Membership, Token, GiftCard, DayPass */}
                        {(() => {
                          const expiryInfo = getProductExpiryInfo(item);
                          if (expiryInfo && !item.subscription_selected_content) {
                            return (
                              <Typography variant="caption" color="text.secondary" component="span" display="block" sx={{ mt: 0.5 }}>
                                Inizio: {formatDate(expiryInfo.startDate)} → Scadenza: {formatDate(expiryInfo.expiryDate)}
                              </Typography>
                            );
                          }
                          return null;
                        })()}

                        {/* Subscription content expiry dates */}
                        {item.subscription_selected_content && item.subscription_selected_content.length > 0 && (
                          <Typography
                            component="span"
                            display="block"
                            sx={{ mt: 0.5, p: 0.5, bgcolor: 'primary.lighter', borderRadius: 0.5, fontSize: '0.65rem' }}
                          >
                            <Typography variant="caption" fontWeight={600} display="block" component="span" sx={{ mb: 0.25 }}>
                              Scadenze:
                            </Typography>
                            {item.subscription_selected_content.map((content: any, idx: number) => {
                              console.log('DEBUG Subscription Content:', {
                                name: content.price_listable?.name || content.name,
                                months_duration: content.months_duration,
                                days_duration: content.days_duration,
                                full_content: content
                              });

                              const expiryDate = calculateExpiryDate(
                                item.start_date,
                                content.months_duration,
                                content.days_duration
                              );
                              return (
                                <Typography key={idx} variant="caption" display="block" component="span" fontSize="0.65rem">
                                  • {content.price_listable?.name || content.name || 'N/A'}
                                  {expiryDate && ` → ${formatDate(expiryDate)}`}
                                </Typography>
                              );
                            })}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
                {index < values.sale_contents.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Totals */}
      {values.sale_contents.length > 0 && (
        <Box sx={{ borderTop: 1, borderColor: 'divider', p: 2, bgcolor: 'grey.50' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, py: 0.5 }} icon={false}>
              <Typography variant="caption">{error}</Typography>
            </Alert>
          )}

          {isCalculating && !result ? (
            <Box>
              <Skeleton variant="text" height={20} />
              <Skeleton variant="text" height={20} />
              <Skeleton variant="text" height={28} />
            </Box>
          ) : result ? (
            <Box>
              {/* VAT Breakdown */}
              {result.vat_breakdown && result.vat_breakdown.length > 0 && (
                <Box sx={{ mb: 1.5, p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    RIEPILOGO IVA
                  </Typography>
                  {result.vat_breakdown.map((vat, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                      <Typography variant="caption" fontSize="0.7rem">
                        Imp. {vat.rate}%:
                      </Typography>
                      <Typography variant="caption" fontSize="0.7rem" fontWeight={500}>
                        {formatCurrency(vat.taxable_amount)}
                      </Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 0.75 }} />
                  {result.vat_breakdown.map((vat, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                      <Typography variant="caption" fontSize="0.7rem" color="text.secondary">
                        IVA {vat.rate}%:
                      </Typography>
                      <Typography variant="caption" fontSize="0.7rem" fontWeight={500} color="text.secondary">
                        {formatCurrency(vat.tax_amount)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Totals */}
              {(values.discount_percentage > 0 || values.discount_absolute > 0) && (
                <Box sx={{ mb: 1, p: 1, bgcolor: 'warning.lighter', borderRadius: 1 }}>
                  <Typography variant="caption" color="warning.dark" fontWeight={600}>
                    Sconto vendita: {values.discount_percentage > 0 ? `${values.discount_percentage.toFixed(2)}%` : formatCurrency(values.discount_absolute)}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" fontSize="0.875rem">Imponibile:</Typography>
                <Typography variant="body2" fontSize="0.875rem" fontWeight={600}>{formatCurrency(result.subtotal)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontSize="0.875rem">IVA Totale:</Typography>
                <Typography variant="body2" fontSize="0.875rem" fontWeight={600}>{formatCurrency(result.tax_total)}</Typography>
              </Box>

              {/* Stamp Duty (Imposta di Bollo) - shown only if applied and charged to customer */}
              {result.stamp_duty_applied && result.stamp_duty_amount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontSize="0.875rem" color="info.main">
                    Imposta di Bollo:
                  </Typography>
                  <Typography variant="body2" fontSize="0.875rem" fontWeight={600} color="info.main">
                    {formatCurrency(result.stamp_duty_amount)}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ mb: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, p: 1, bgcolor: 'primary.lighter', borderRadius: 1 }}>
                <Typography variant="h6" fontSize="1.1rem" fontWeight={700}>
                  TOTALE:
                </Typography>
                <Typography variant="h6" fontSize="1.1rem" fontWeight={700} color="primary.main">
                  {formatCurrency(result.total)}
                </Typography>
              </Box>
            </Box>
          ) : null}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<CheckCircleIcon />}
              disabled={!canComplete}
              onClick={handleCompleteSale}
            >
              Completa Vendita
            </Button>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              startIcon={<SaveIcon />}
              disabled={values.sale_contents.length === 0}
              onClick={handleSaveDraft}
            >
              Salva Bozza
            </Button>
          </Box>

          {!canComplete && values.sale_contents.length > 0 && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
              {!values.payment_condition && 'Seleziona condizione di pagamento'}
            </Typography>
          )}
        </Box>
      )}

      {/* Edit Item Discount Dialog */}
      <Dialog open={editingItem !== null} onClose={() => setEditingItem(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Modifica Sconto</DialogTitle>
        <DialogContent>
          {editingItem !== null && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Prodotto: <strong>{values.sale_contents[editingItem].price_list.name}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Prezzo unitario: {formatCurrency(values.sale_contents[editingItem].unit_price)}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <MuiTextField
                  label="Sconto %"
                  type="number"
                  fullWidth
                  value={tempPercentageDiscount}
                  onChange={(e) => handlePercentageChange(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PercentIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <MuiTextField
                  label="Sconto €"
                  type="number"
                  fullWidth
                  value={tempAbsoluteDiscount}
                  onChange={(e) => handleAbsoluteChange(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EuroIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {(tempPercentageDiscount > 0 || tempAbsoluteDiscount > 0) && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: 'success.lighter', borderRadius: 1 }}>
                  <Typography variant="caption" color="success.dark">
                    Prezzo scontato: {formatCurrency(values.sale_contents[editingItem].unit_price - tempAbsoluteDiscount)}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingItem(null)}>Annulla</Button>
          <Button variant="contained" onClick={handleSaveItemDiscount}>
            Applica
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
