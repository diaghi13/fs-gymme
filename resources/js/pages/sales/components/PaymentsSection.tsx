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
import { addDays, endOfMonth, format } from 'date-fns';
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
  const { values, setFieldValue } = useFormikContext<SaleFormValues>();
  const [availableFinancialResources, setAvailableFinancialResources] = useState<FinancialResource[]>([]);
  const [isAutomaticInstallments, setIsAutomaticInstallments] = useState(false);
  const { result: calculatedTotals } = useQuickCalculate(0);

  const getPaymentConditionData = useCallback(
    async (id: number) => {
      const response = await axios.get(route('api.v1.payment-conditions.show', { paymentCondition: id }));
      const resData: PaymentCondition = await response.data;

      // Set available financial resources
      setAvailableFinancialResources(financialResources);
      await setFieldValue('financial_resource', financialResources.find((f) => f.default) || null);

      const totalAmount = calculatedTotals?.total || 0;

      // Check if payment condition has installments (automatic)
      if (!resData.installments || resData.installments.length === 0) {
        // No installments - manual mode, create single payment
        setIsAutomaticInstallments(false);
        await setFieldValue('payments', [
          {
            due_date: new Date(),
            amount: totalAmount,
            payment_method: paymentMethods.find((p) => p.id === resData.payment_method?.id) || paymentMethods[0],
            payed_at: new Date(),
          },
        ]);
        return;
      }

      // Has installments - automatic mode
      setIsAutomaticInstallments(true);
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

      await setFieldValue('payments', payments);
    },
    [financialResources, setFieldValue, calculatedTotals, paymentMethods]
  );

  const handlePaymentConditionChange = async (_: SyntheticEvent<Element, Event>, value: PaymentCondition | null) => {
    if (typeof value === 'string' || !value) {
      await setFieldValue('payment_condition', null);
      await setFieldValue('payments', []);
      await setFieldValue('financial_resource', null);
      setAvailableFinancialResources([]);
      setIsAutomaticInstallments(false);
      return;
    }

    await setFieldValue('payment_condition', value);
    await getPaymentConditionData(Number(value.id));
  };

  // Quick installments generation for manual mode
  const handleQuickInstallments = async (count: number, daysBetween: number = 30) => {
    if (isAutomaticInstallments) return;

    const totalAmount = calculatedTotals?.total || 0;
    const dividedAmount = currency(totalAmount).distribute(count);

    const payments = Array.from({ length: count }, (_, i) => ({
      due_date: addDays(new Date(), i * daysBetween),
      amount: dividedAmount[i].value,
      payment_method: values.payments[0]?.payment_method || paymentMethods[0],
      payed_at: null,
    }));

    await setFieldValue('payments', payments);
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
        {/* Payment Condition (required) */}
        <Grid size={12}>
          <Autocomplete<PaymentCondition>
            name="payment_condition"
            label="Condizione di Pagamento *"
            options={paymentConditions}
            onChange={handlePaymentConditionChange}
            getOptionLabel={(option) => option.description}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        </Grid>

        {/* Financial Resource */}
        <Grid size={6}>
          <Autocomplete<FinancialResource>
            name="financial_resource"
            label="Risorsa Finanziaria"
            options={availableFinancialResources}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disabled={!values.payment_condition}
          />
        </Grid>

        {/* Quick Actions for Manual Mode */}
        {values.payment_condition && !isAutomaticInstallments && (
          <Grid size={12}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Azioni rapide:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                <Button variant="outlined" size="small" onClick={() => handleQuickInstallments(1)}>
                  Unica soluzione
                </Button>
                <Button variant="outlined" size="small" onClick={() => handleQuickInstallments(2)}>
                  2 rate
                </Button>
                <Button variant="outlined" size="small" onClick={() => handleQuickInstallments(3)}>
                  3 rate
                </Button>
                <Button variant="outlined" size="small" onClick={() => handleQuickInstallments(6)}>
                  6 rate
                </Button>
                <Button variant="outlined" size="small" onClick={() => handleQuickInstallments(12)}>
                  12 rate
                </Button>
              </Stack>
            </Box>
          </Grid>
        )}

        {/* Automatic Installments Info */}
        {isAutomaticInstallments && (
          <Grid size={12}>
            <Alert severity="info">
              Rate generate automaticamente dalla condizione di pagamento. Non modificabili.
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
                  {!isAutomaticInstallments && <TableCell></TableCell>}
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
                            <DatePicker name={`payments[${index}].due_date`} disabled={isAutomaticInstallments} />
                          </TableCell>
                          <TableCell sx={{ maxWidth: 120 }}>
                            <MoneyTextField name={`payments[${index}].amount`} disabled={isAutomaticInstallments} />
                          </TableCell>
                          <TableCell sx={{ minWidth: 200 }}>
                            <Autocomplete
                              name={`payments[${index}].payment_method`}
                              options={paymentMethods}
                              isOptionEqualToValue={(option, value) => option.id === value.id}
                              disabled={isAutomaticInstallments}
                            />
                          </TableCell>
                          {!isAutomaticInstallments && (
                            <TableCell sx={{ width: 10, padding: 0 }}>
                              <IconButton onClick={() => arrayHelpers.remove(index)} size="small">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                      {!isAutomaticInstallments && (
                        <TableRow>
                          <TableCell colSpan={5} sx={{ textAlign: 'center' }}>
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
