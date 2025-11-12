import React, { useEffect } from 'react';
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
} from '@mui/material';
import { useFormikContext } from 'formik';
import { SaleFormValues } from '../sale-create';
import { useQuickCalculate } from '@/hooks/useQuickCalculate';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function CartSidebar() {
  const { values, setFieldValue, isValid, submitForm } = useFormikContext<SaleFormValues>();
  const { result, isCalculating, error, calculate } = useQuickCalculate(300);

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
      vat_rate_percentage: content.price_list?.vat_rate?.percentage || null,
    }));

    calculate({
      rows,
      sale_percentage_discount: values.discount_percentage || null,
      sale_absolute_discount: values.discount_absolute || 0,
    });
  }, [values.sale_contents, values.discount_percentage, values.discount_absolute, calculate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
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
                    <IconButton edge="end" size="small" onClick={() => handleRemoveItem(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
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
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Q.tà: {item.quantity}
                        </Typography>
                        {(item.percentage_discount > 0 || item.absolute_discount > 0) && (
                          <Typography variant="caption" color="error">
                            Sconto: {item.percentage_discount > 0 ? `${item.percentage_discount}%` : formatCurrency(item.absolute_discount)}
                          </Typography>
                        )}
                      </Box>
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
        <Box sx={{ borderTop: 1, borderColor: 'divider', p: 2, bgcolor: 'background.default' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {isCalculating && !result ? (
            <Box>
              <Skeleton variant="text" height={24} />
              <Skeleton variant="text" height={24} />
              <Skeleton variant="text" height={32} />
            </Box>
          ) : result ? (
            <Box>
              {/* VAT Breakdown */}
              {result.vat_breakdown && result.vat_breakdown.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Riepilogo IVA:
                  </Typography>
                  {result.vat_breakdown.map((vat, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption">
                        Imp. {vat.rate}%:
                      </Typography>
                      <Typography variant="caption">
                        {formatCurrency(vat.taxable_amount)}
                      </Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 1 }} />
                  {result.vat_breakdown.map((vat, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        IVA {vat.rate}%:
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatCurrency(vat.tax_amount)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Totals */}
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">Imponibile:</Typography>
                <Typography variant="body2">{formatCurrency(result.subtotal)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">IVA:</Typography>
                <Typography variant="body2">{formatCurrency(result.tax_total)}</Typography>
              </Box>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  TOTALE:
                </Typography>
                <Typography variant="h6" fontWeight={700} color="primary">
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
              onClick={submitForm}
            >
              Completa Vendita
            </Button>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              startIcon={<SaveIcon />}
              disabled={values.sale_contents.length === 0}
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
    </Box>
  );
}
