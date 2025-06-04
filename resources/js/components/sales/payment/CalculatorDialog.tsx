import { usePage } from '@inertiajs/react';
import { SalePageProps } from '@/pages/sales/sales';
import React from 'react';
import { AutocompleteOption } from '@/types';
import Dialog from '@/components/ui/Dialog';
import { Autocomplete as MuiAutocomplete, DialogContent, Grid, TextField as MuiTextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { CalculatorProps } from '@/components/sales/cards/PaymentCard';

interface CalculatorDialogProps {
  calculator: CalculatorProps,
  setCalculator: ((values: CalculatorProps | ((prev: CalculatorProps) => CalculatorProps)) => void);
  open: boolean;
  onClose: () => void;
  onAgree: () => void;
}

const CalculatorDialog = ({ open, onClose, calculator, setCalculator, onAgree }: CalculatorDialogProps) => {
  const { paymentMethodOptions } = usePage<SalePageProps>().props;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const key = event.target.name;
    const value = event.target.value;

    setCalculator((prevState: CalculatorProps) => ({
      ...prevState,
      [key]: value
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} onAgree={onAgree} fullWidth maxWidth={'md'}>
      <DialogContent>
        <Grid container spacing={2} mb={2}>
          <Grid size={3}>
            <MuiTextField
              name={`installment_quantity`}
              label="N. Rate"
              variant={'standard'}
              value={calculator.installment_quantity}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={3}>
            <MuiAutocomplete
              renderInput={(params) => (
                <MuiTextField
                  {...params}
                  label={'Metodo di pagamento'}
                  variant={'standard'}
                />
              )}
              options={paymentMethodOptions}
              onChange={(_, value: AutocompleteOption<number> | null ) => {
                setCalculator((prevState: CalculatorProps) => ({
                  ...prevState,
                  payment_method: value
                }));
              }}
              value={calculator.payment_method}
            />
          </Grid>
          <Grid size={3}>
            <DatePicker
              label="Data prima decorrenza"
              value={calculator.first_effective_date}
              onChange={value => {
                setCalculator((prevState: CalculatorProps) => ({
                  ...prevState,
                  first_effective_date: value
                }));
              }}
              slotProps={{
                textField: {
                  variant: 'standard',
                  name: 'first_effective_date',
                  fullWidth: true,
                }
              }}
            />
          </Grid>
          <Grid size={3}>
            <MuiTextField
              name={`month_effective_date`}
              label="Ogni 'x' mesi"
              variant={'standard'}
              value={calculator.month_effective_date}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default CalculatorDialog;
