import React, { useState, useCallback, useEffect, SyntheticEvent } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import { useFormikContext, FieldArray } from 'formik';
import { SaleFormValues } from '../sale-create';
import { PaymentCondition, PaymentMethod, FinancialResource } from '@/types';
import Autocomplete from '@/components/ui/Autocomplete';
import DatePicker from '@/components/ui/DatePicker';
import MoneyTextField from '@/components/ui/MoneyTextField';
import PaymentIcon from '@mui/icons-material/Payment';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { addDays, endOfMonth } from 'date-fns';
import axios from 'axios';
import currency from 'currency.js';
import { useQuickCalculate } from '@/hooks/useQuickCalculate';

interface PaymentsSectionProps {
  paymentConditions: PaymentCondition[];
  paymentMethods: PaymentMethod[];
  financialResources: FinancialResource[];
}

export default function PaymentsSection({
  paymentConditions,
  paymentMethods,
  financialResources,
}: PaymentsSectionProps) {
  const { values, setFieldValue, validateForm } = useFormikContext<SaleFormValues>();
  const { result: quickCalcResult, calculate: quickCalculate } = useQuickCalculate(300);
  const [availableFinancialResources, setAvailableFinancialResources] = useState<FinancialResource[]>([]);
  const [hasInstallmentsSuggestion, setHasInstallmentsSuggestion] = useState(false);
  const [installmentsLocked, setInstallmentsLocked] = useState(false);
  const [calculatingInstallments, setCalculatingInstallments] = useState(false);

  // Trigger calculation when cart or discounts change to keep quickCalcResult updated
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
      vat_rate_nature: content.price_list?.vat_rate?.nature || content.subscription_selected_content?.map(selected_content => selected_content.vat_rate.nature) || null,
      vat_breakdown: content.subscription_selected_content?.map(selected_content => ({
        subtotal: selected_content.price,
        vat_rate: selected_content.vat_rate.percentage,
        vat_nature: selected_content.vat_rate.nature,
      })) || undefined,
    }));

    quickCalculate({
      rows,
      sale_percentage_discount: values.discount_percentage || null,
      sale_absolute_discount: values.discount_absolute || 0,
      tax_included: values.tax_included,
    });
  }, [values.sale_contents, values.discount_percentage, values.discount_absolute, values.tax_included, quickCalculate]);

  // Calculate total from cart with discounts INCLUDING stamp duty
  const calculateTotal = useCallback(() => {
    // Use quickCalcResult if available (includes stamp duty)
    if (quickCalcResult) {
      return quickCalcResult.total;
    }

    // Fallback calculation (shouldn't happen often)
    if (values.sale_contents.length === 0) return 0;

    const rows = values.sale_contents.map((content) => ({
      unit_price: content.unit_price || 0,
      quantity: content.quantity || 1,
      percentage_discount: content.percentage_discount || null,
      absolute_discount: content.absolute_discount || 0,
      vat_rate_percentage: content.price_list?.vat_rate?.percentage || null,
    }));

    // Calculate subtotal after item discounts
    let subtotal = 0;
    rows.forEach((row) => {
      const lineTotal = row.unit_price * row.quantity;
      const discount = row.percentage_discount ? lineTotal * (row.percentage_discount / 100) : row.absolute_discount;
      subtotal += lineTotal - discount;
    });

    // Apply sale-level discount
    if (values.discount_percentage) {
      subtotal -= subtotal * (values.discount_percentage / 100);
    }
    if (values.discount_absolute) {
      subtotal -= values.discount_absolute;
    }

    return subtotal;
  }, [quickCalcResult, values.sale_contents, values.discount_percentage, values.discount_absolute]);

  const getPaymentConditionData = useCallback(
    async (id: number) => {
      setCalculatingInstallments(true);
      try {
        const response = await axios.get(route('api.v1.payment-conditions.show', { paymentCondition: id }));
        const resData: PaymentCondition = await response.data;

        // Set available financial resources
        setAvailableFinancialResources(financialResources);
        const defaultFinancialResource = financialResources.find((f) => f.default) || null;

        // Set field value with validation enabled
        await setFieldValue('financial_resource', defaultFinancialResource, true);

        // Small delay to ensure Formik state is updated, then validate
        setTimeout(() => {
          validateForm();
        }, 0);

        const totalAmount = calculateTotal();

      // Check if payment condition has installments suggestion
      if (!resData.installments || resData.installments.length === 0) {
        // No installments suggestion - fully manual mode
        setHasInstallmentsSuggestion(false);
        setInstallmentsLocked(false);
        await setFieldValue('payments', [
          {
            due_date: new Date(),
            amount: totalAmount,
            payment_method: paymentMethods.find((p) => p.id === resData.payment_method?.id) || paymentMethods[0],
            payed_at: new Date(),
          },
        ], true);
        return;
      }

      // Has installments suggestion - generate them but allow unlock
      setHasInstallmentsSuggestion(true);
      setInstallmentsLocked(true); // Start locked, user can unlock
      const dividedAmount = currency(totalAmount).distribute(resData.installments.length);

      const payments = resData.installments.map((installment, index) => {
        const dueDate = resData.end_of_month
          ? endOfMonth(addDays(new Date(), installment.days))
          : addDays(new Date(), installment.days);

        return {
          due_date: dueDate,
          amount: dividedAmount[index].value,
          payment_method: paymentMethods.find((p) => p.id === resData.payment_method?.id) || paymentMethods[0],
          payed_at: dueDate <= new Date() ? new Date() : null,
        };
      });

        await setFieldValue('payments', payments, true);
      } finally {
        setCalculatingInstallments(false);
      }
    },
    [financialResources, setFieldValue, validateForm, calculateTotal, paymentMethods]
  );

  const handlePaymentConditionChange = async (_: SyntheticEvent<Element, Event>, value: PaymentCondition | null) => {
    if (typeof value === 'string' || !value) {
      await setFieldValue('payment_condition', null);
      await setFieldValue('payments', []);
      await setFieldValue('financial_resource', null);
      setAvailableFinancialResources([]);
      setHasInstallmentsSuggestion(false);
      setInstallmentsLocked(false);
      return;
    }

    await setFieldValue('payment_condition', value);
    await getPaymentConditionData(Number(value.id));
  };

  // Quick installments generation for manual mode
  const handleQuickInstallments = async (count: number, daysBetween: number = 30) => {
    const totalAmount = calculateTotal();
    const dividedAmount = currency(totalAmount).distribute(count);

    const payments = Array.from({ length: count }, (_, i) => ({
      due_date: addDays(new Date(), i * daysBetween),
      amount: dividedAmount[i].value,
      payment_method: values.payments[0]?.payment_method || paymentMethods[0],
      payed_at: null,
    }));

    await setFieldValue('payments', payments);

    // Unlock if it was locked (user is customizing)
    if (installmentsLocked) {
      setInstallmentsLocked(false);
    }
  };

  // Toggle lock/unlock for installments
  const toggleInstallmentsLock = () => {
    setInstallmentsLocked(!installmentsLocked);
  };

  return (
    <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <PaymentIcon color="primary" />
        <Typography variant="h6">Pagamenti</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configura le condizioni di pagamento e le rate
      </Typography>

      <Grid container spacing={2}>
        {/* Info Alert */}
        <Grid size={12}>
          <Alert severity="info" sx={{ mb: 1 }}>
            <Typography variant="body2">
              <strong>Condizione di pagamento</strong> e <strong>Risorsa finanziaria</strong> sono obbligatorie.
              La risorsa finanziaria verrà selezionata automaticamente quando scegli una condizione di pagamento.
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Configura le risorse finanziarie in: Configurazioni → Risorse Finanziarie
            </Typography>
          </Alert>
        </Grid>

        {/* Payment Condition (required) */}
        <Grid size={12}>
          <Autocomplete<PaymentCondition>
            name="payment_condition"
            label="Condizione di Pagamento *"
            options={paymentConditions}
            onChange={handlePaymentConditionChange}
            getOptionLabel={(option) => option.description}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disabled={calculatingInstallments}
          />
        </Grid>

        {/* Loading Indicator */}
        {calculatingInstallments && (
          <Grid size={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', py: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Calcolo rate in corso...
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Financial Resource */}
        <Grid size={6}>
          <Autocomplete<FinancialResource>
            name="financial_resource"
            label="Risorsa Finanziaria *"
            options={availableFinancialResources}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disabled={!values.payment_condition}
          />
        </Grid>

        {/* Quick Actions - Always show when payment condition selected */}
        {values.payment_condition && (
          <Grid size={12}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Azioni rapide:
                </Typography>
                {hasInstallmentsSuggestion && (
                  <Button
                    variant="text"
                    size="small"
                    startIcon={installmentsLocked ? <LockIcon /> : <LockOpenIcon />}
                    onClick={toggleInstallmentsLock}
                    color={installmentsLocked ? 'warning' : 'success'}
                    sx={{ flexShrink: 0, minWidth: 'auto', px: 1 }}
                  >
                    {installmentsLocked ? 'Sblocca' : 'Blocca'}
                  </Button>
                )}
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                <Button variant="outlined" size="small" onClick={() => handleQuickInstallments(1)} disabled={installmentsLocked}>
                  Unica
                </Button>
                <Button variant="outlined" size="small" onClick={() => handleQuickInstallments(2)} disabled={installmentsLocked}>
                  2 rate
                </Button>
                <Button variant="outlined" size="small" onClick={() => handleQuickInstallments(3)} disabled={installmentsLocked}>
                  3 rate
                </Button>
                <Button variant="outlined" size="small" onClick={() => handleQuickInstallments(6)} disabled={installmentsLocked}>
                  6 rate
                </Button>
                <Button variant="outlined" size="small" onClick={() => handleQuickInstallments(12)} disabled={installmentsLocked}>
                  12 rate
                </Button>
              </Stack>
            </Box>
          </Grid>
        )}

        {/* Installments Lock Info */}
        {hasInstallmentsSuggestion && installmentsLocked && (
          <Grid size={12}>
            <Alert
              severity="info"
              icon={<LockIcon fontSize="small" />}
              sx={{
                py: 0.5,
                '& .MuiAlert-message': {
                  fontSize: '0.875rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }
              }}
            >
              Rate predefinite. Clicca "Sblocca" per modificare.
            </Alert>
          </Grid>
        )}

        {/* Payments Table */}
        {values.payments.length > 0 && (
          <Grid size={12}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Data Scadenza</TableCell>
                  <TableCell>Importo</TableCell>
                  <TableCell>Metodo</TableCell>
                  <TableCell>Data Pagamento</TableCell>
                  {!installmentsLocked && <TableCell></TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                <FieldArray
                  name="payments"
                  render={(arrayHelpers) => (
                    <>
                      {values.payments.map((payment, index) => (
                        <TableRow key={index} sx={{ bgcolor: index % 2 ? 'action.hover' : 'transparent' }}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell sx={{ maxWidth: 150 }}>
                            <DatePicker name={`payments[${index}].due_date`} disabled={installmentsLocked} />
                          </TableCell>
                          <TableCell sx={{ maxWidth: 120 }}>
                            <MoneyTextField name={`payments[${index}].amount`} disabled={installmentsLocked} />
                          </TableCell>
                          <TableCell sx={{ minWidth: 200 }}>
                            <Autocomplete
                              name={`payments[${index}].payment_method`}
                              options={paymentMethods}
                              isOptionEqualToValue={(option, value) => option.id === value.id}
                              disabled={installmentsLocked}
                            />
                          </TableCell>
                          <TableCell sx={{ maxWidth: 150 }}>
                            <DatePicker
                              name={`payments[${index}].payed_at`}
                              label="Pagato il"
                            />
                          </TableCell>
                          {!installmentsLocked && (
                            <TableCell sx={{ width: 10, padding: 0 }}>
                              <IconButton onClick={() => arrayHelpers.remove(index)} size="small">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                      {!installmentsLocked && (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ textAlign: 'center' }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<AddIcon />}
                              onClick={() =>
                                arrayHelpers.push({
                                  due_date: new Date(),
                                  amount: 0,
                                  payment_method: paymentMethods[0],
                                  payed_at: null,
                                })
                              }
                            >
                              Aggiungi rata
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )}
                />
              </TableBody>
            </Table>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}
