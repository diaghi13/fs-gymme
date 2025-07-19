import React, { SyntheticEvent, useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Grid, IconButton,
  Table, TableBody, TableCell, TableHead, TableRow,
  Typography
} from '@mui/material';
import MyCard from '@/components/ui/MyCard';
import { useTheme } from '@mui/material/styles';
import { FieldArray, useFormikContext } from 'formik';
import { usePage } from '@inertiajs/react';
import { SaleFormValues, SalePageProps } from '@/pages/sales/sales';
import MoneyTextField from '@/components/ui/MoneyTextField';
import { SaleDiscountTypes, useSaleContext } from '@/Contexts/Sale/SaleContext';
import MyMath from '@/support/Math';
import Autocomplete from '@/components/ui/Autocomplete';
import { FinancialResource, PaymentCondition, PaymentMethod } from '@/types';
import SaleDiscounts from '@/components/sales/payment/SaleDiscounts';
import CalculatorDialog from '@/components/sales/payment/CalculatorDialog';
import currency from 'currency.js';
import DatePicker from '@/components/ui/DatePicker';
import DeleteIcon from '@mui/icons-material/Delete';
import { addDays, endOfMonth } from 'date-fns';
import axios from 'axios';

export interface SaleInstallmentFormValues {
  due_date: Date | null;
  amount: number | string;
  payment_method: PaymentMethod;
  payed_at: Date | null;
}

export interface CalculatorProps {
  installment_quantity: string,
  payment_method: PaymentMethod | null,
  first_effective_date: Date | null,
  month_effective_date: string
}

interface PaymentCardProps {
  calculator: CalculatorProps,
  setCalculator: ((values: CalculatorProps | ((prev: CalculatorProps) => CalculatorProps)) => void);
}

export default function PaymentCard({ calculator, setCalculator }: PaymentCardProps) {
  const { values, setFieldValue } = useFormikContext<SaleFormValues>();
  const [, setDisableCalculate] = useState(true);
  const [openCalculatorDialog, setOpenCalculatorDialog] = useState(false);
  const [showInstallmentCalculator, setShowInstallmentCalculator] = useState(true);
  const { paymentConditions, financialResources, paymentMethods } = usePage<SalePageProps>().props;
  const theme = useTheme();

  const [disableInstallmentCalculationButton, setDisableInstallmentCalculationButton] = useState(true);

  const { sale_price, total_price, setSaleDiscount, vatRateSummary } = useSaleContext();

  const [availableFinancialResources, setAvailableFinancialResources] = useState<(FinancialResource)[]>([]);



  useEffect(() => {
    // if (calculator.installment_quantity && calculator.payment_method && calculator.first_effective_date && calculator.month_effective_date) {
    //   setDisableCalculate(false);
    // } else {
    //   setDisableCalculate(true);
    // }
  }, [calculator]);


  const handlePaymentAmountBlur = () => {
    const amount = parseFloat(values.payments[0].amount.toString().replace(',', '.')) || 0;

    if (amount < total_price) {
      setShowInstallmentCalculator(true);
      setDisableInstallmentCalculationButton(false);
    } else {
      setShowInstallmentCalculator(false);
      setDisableInstallmentCalculationButton(true);
    }

    if (values.payments[0].amount === '') {
      setFieldValue('payments[0].amount', 0);
    }

    // reset installments if they exists and the amount is changed
    if (values.payments.length > 1) {
      setFieldValue('payments', [values.payments[0]]);
    }
  };

  const handlePercentageDiscountChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const percentage_discount = parseFloat(event.target.value.replace(',', '.')) || 0;
    const diffDiscount = MyMath.percentageDiscount(sale_price, percentage_discount);

    //setTotalPrice(content.unit_price - diffDiscount)

    await setFieldValue(`discount_absolute`, diffDiscount !== 0
      ? Math.round((diffDiscount + Number.EPSILON) * 100) / 100
      : 0);
    await setFieldValue(`discount_percentage`, percentage_discount !== 0
      ? Math.round((percentage_discount + Number.EPSILON) * 100) / 100
      : 0);

    setSaleDiscount({ name: SaleDiscountTypes.PERCENTAGE, discount: percentage_discount });

    //if (diffDiscount === 0) {
    //  setFieldValue(`sale_contents[${index}].percentage_discount`, "0");
    //}
  };

  const handleAbsoluteDiscountChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const absolute_discount = parseFloat(event.target.value.replace(',', '.')) || 0;
    const percentageDiscount = (absolute_discount / sale_price) * 100;

    // setTotalPrice(content.unit_price - absolute_discount)
    //
    await setFieldValue(`discount_percentage`, percentageDiscount !== 0
      ? Math.round((percentageDiscount + Number.EPSILON) * 100) / 100
      : 0);
    await setFieldValue(`discount_absolute`, absolute_discount !== 0
      ? Math.round((absolute_discount + Number.EPSILON) * 100) / 100
      : 0);

    setSaleDiscount({ name: SaleDiscountTypes.ABSOLUTE, discount: absolute_discount });

    // if (absolute_discount === 0) {
    //   setFieldValue(`sale_contents[${index}].absolute_discount`, "0");
    // }
  };

  const handleCalculateInstallments = () => {
    if (calculator.first_effective_date) {
      const installmentQuantity = parseInt(calculator.installment_quantity);
      const monthEffectiveDate = parseInt(calculator.month_effective_date);
      const firstEffectiveDate = new Date(calculator.first_effective_date);

      const dividedAmount = currency(total_price - Number(values.payments[0].amount)).distribute(installmentQuantity);

      const payments: SaleInstallmentFormValues[] = [];
      for (let i = 0; i < installmentQuantity; i++) {
        payments.push({
          payment_method: paymentMethods.find(p => p.id === calculator.payment_method!.id)!,
          due_date: i > 0
            ? new Date(firstEffectiveDate.setMonth(firstEffectiveDate.getMonth() + monthEffectiveDate))
            : calculator.first_effective_date,
          amount: dividedAmount[i].value,
          payed_at: null
        });
      }

      setFieldValue('payments', [
        values.payments[0],
        ...payments
      ]);
    }

    setOpenCalculatorDialog(!openCalculatorDialog);
  };

  const getPaymentConditionData = useCallback(async (id: number) => {
    const response = await axios.get(route('api.v1.payment-conditions.show', { paymentCondition: id }));
    const resData: PaymentCondition = await response.data;

    //setAvailableFinancialResources(financialResources.filter(f => f.financial_resource_type_id === resData.financial_resource_type_id));
    //await setFieldValue('financial_resource', financialResources.filter(f => f.financial_resource_type_id === resData.financial_resource_type_id).find(f => f.default) || null);
    setAvailableFinancialResources(financialResources);
    await setFieldValue('financial_resource', financialResources.find(f => f.default) || null);

    if (!resData.installments || resData.installments.length === 0) {
      await setFieldValue('payments', [{
        due_date: resData.installments ? resData.end_of_month ? endOfMonth(addDays(new Date(), resData.installments[0].days)) : addDays(new Date(), resData.installments[0].days) : new Date(),
        amount: total_price,
        payment_method: paymentMethods.find(p => p.id === resData.payment_method!.id) || paymentMethods[0],
        payed_at: new Date()
      }]);

      return;
    }

    const dividedAmount = currency(total_price).distribute(resData.installments.length);

    const payments: SaleInstallmentFormValues[] = resData.installments.map(installment => {
      const dueDate = resData.end_of_month ? endOfMonth(addDays(new Date(), installment.days)) : addDays(new Date(), installment.days);

      return {
        due_date: dueDate,
        amount: dividedAmount[resData.installments!.indexOf(installment)].value,
        payment_method: paymentMethods.find(p => p.id === resData.payment_method!.id) || paymentMethods[0],
        payed_at: dueDate <= new Date() ? new Date() : null
      }
    });

    await setFieldValue('payments', payments);
  }, [financialResources, setFieldValue, total_price, paymentMethods]);

  // useEffect(() => {
  //   if (values.payment_condition) {
  //     const paymentConditionId = values.payment_condition.value;
  //     getPaymentConditionData(paymentConditionId);
  //
  //     return;
  //   }
  //
  //   setFieldValue('payments', []);
  //   setFieldValue('financial_resource', null);
  // }, [getPaymentConditionData, setFieldValue, values.payment_condition]);

  const handlePaymentConditionChange = async (_: SyntheticEvent<Element, Event>, value: PaymentCondition | null) => {
    //getPaymentConditionData()
    if (typeof value === 'string' || !value) {
      await setFieldValue('payment_condition', null);
      await setFieldValue('payments', []);
      await setFieldValue('financial_resource', null);
      setAvailableFinancialResources([]);
      return;
    }

    await getPaymentConditionData(Number(value.id));
    await setFieldValue('payment_condition', value);
  };

  return (
    <MyCard>
      <SaleDiscounts
        handlePercentageDiscountChange={handlePercentageDiscountChange}
        handleAbsoluteDiscountChange={handleAbsoluteDiscountChange}
      />
      <Grid container spacing={2} mb={4}>
        <Grid size={12}>
          <Divider />
        </Grid>
        <Grid size={12}>
          <Typography variant={'h6'}>Condizioni di pagamento</Typography>
        </Grid>
        <Grid size={6}>
          <Autocomplete<PaymentCondition>
            label={'Condizioni di pagamento'}
            name={'payment_condition'}
            options={paymentConditions}
            onChange={handlePaymentConditionChange}
            getOptionLabel={option => option.description}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        </Grid>
        <Grid size={6}>
          <Autocomplete
            label={'Risorsa finanziaria'}
            name={'financial_resource'}
            options={availableFinancialResources}
            getOptionLabel={option => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        </Grid>
      </Grid>
      {showInstallmentCalculator && (
        <Grid container spacing={2}>
          <Grid size={12}>
            <Divider />
          </Grid>
          {/*<Typography mb={2}>*/}
          {/*  A saldo: {Str.EURO(total_price - Number(values.payments[0].amount)).format()}*/}
          {/*</Typography>*/}
          <Grid size={12}>
            <Typography variant={'h6'}>Pagamenti</Typography>
          </Grid>
          <Grid size={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Button
              variant={'contained'}
              onClick={() => setOpenCalculatorDialog(!openCalculatorDialog)}
              //disabled={disableInstallmentCalculationButton}
            >
              Calcola rateizzazione
            </Button>
          </Grid>
          <CalculatorDialog
            open={openCalculatorDialog}
            onClose={() => {
              setOpenCalculatorDialog(!openCalculatorDialog);
            }}
            calculator={calculator}
            setCalculator={setCalculator}
            onAgree={handleCalculateInstallments}
          />
        </Grid>
      )}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Data scadenza</TableCell>
            <TableCell>Importo</TableCell>
            <TableCell>Metodo di pagamento</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <FieldArray
            name="payments"
            render={arrayHelpers => (
              <>
                {values.payments.map((payment, index) => (
                  <TableRow key={index} sx={{ background: index % 2 ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.0)' }}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell sx={{ maxWidth: 150 }}>
                      <DatePicker
                        name={`payments[${index}].due_date`}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 100 }}>
                      <MoneyTextField
                        name={`payments[${index}].amount`}
                      />
                    </TableCell>
                    <TableCell>
                      <Autocomplete
                        name={`payments[${index}].payment_method`}
                        options={paymentMethods}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                      />
                    </TableCell>
                    <TableCell sx={{ width: 10, padding: 0 }}>
                      <IconButton
                        onClick={() => arrayHelpers.remove(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={() => arrayHelpers.push({
                        due_date: null,
                        amount: 0,
                        payment_method: paymentMethods[0],
                        payed_at: null
                      })}>
                      Aggiungi rata
                    </Button>
                  </TableCell>
                </TableRow>
              </>
            )}
          />
        </TableBody>
      </Table>
      <Box sx={{ background: theme.palette.success.light, padding: 2, mt: 2 }}>
        <Typography fontWeight={800}>
          {/*Acconto: {values.payments ? Str.EURO(Number(values.payments[0].amount)).format() : '€0,00'}*/}
        </Typography>
      </Box>
      <Box sx={{ background: theme.palette.warning.light, padding: 2 }}>
        <Typography fontWeight={800}>
          {/*Rateizzato: {values.payments ? Str.EURO(total_price - Number(values.payments[0].amount)).format() : total_price ? Str.EURO(total_price).format() : '€0,00'}*/}
        </Typography>
      </Box>
    </MyCard>
  );
};
