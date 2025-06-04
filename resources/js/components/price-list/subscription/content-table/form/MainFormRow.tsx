import * as React from 'react';
import { Grid, IconButton, TableCell, TableRow } from '@mui/material';
import TextField from '@/components/ui/TextField';
import Autocomplete from '@/components/ui/Autocomplete';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { usePage } from '@inertiajs/react';
import { PriceListPageProps } from '@/pages/price-lists/price-lists';
import { useFormikContext } from 'formik';
import { SubscriptionGeneralFormValues } from '../../tabs/SubscriptionGeneralTab';

interface FormMainRowProps {
  index: number;
  name: string;
  contentType: 'standard_content' | 'optional_content';
  isProduct: boolean;
  isMembership: boolean;
  expanded: boolean;
  onExpandClick: () => void;
}

const MainFormRow: React.FC<FormMainRowProps> = (
  {
    index,
    name,
    contentType,
    isProduct,
    isMembership,
    expanded,
    onExpandClick
  }) => {
  const { vatRateOptions } = usePage<PriceListPageProps>().props;
  const { values } = useFormikContext<SubscriptionGeneralFormValues>();
  const content =  contentType === 'standard_content' ? values.standard_content[index] : values.optional_content[index];

  return (
    <TableRow sx={{ backgroundColor: 'rgba(209,209,209,0.11)' }}>
      <TableCell colSpan={(isProduct || isMembership) ? 1 : 3}>
        {name}
      </TableCell>
      {isProduct && (
        <>
          <TableCell>
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField label={'GG'} name={`${contentType}[${index}].days_duration`} />
              </Grid>
              <Grid size={6}>
                <TextField label={'MM'} name={`${contentType}[${index}].months_duration`} />
              </Grid>
            </Grid>
          </TableCell>
          <TableCell>
            <TextField label={'Illimitati'} name={`${contentType}[${index}].entrances`} />
          </TableCell>
        </>
      )}
      {isMembership && (
        <TableCell colSpan={2}>
          {content.months_duration && `${content.months_duration} ${content.months_duration === 1 ? 'Mese' : 'Mesi'}`}
        </TableCell>
      )}
      <TableCell>
        <Autocomplete
          label={'IVA'}
          name={`${contentType}[${index}].vat_rate`}
          options={vatRateOptions}
        />
      </TableCell>
      <TableCell>
        <TextField label={'Prezzo'} name={`${contentType}[${index}].price`} />
      </TableCell>
      <TableCell sx={{ padding: 0 }}>
        {isProduct && <IconButton onClick={onExpandClick} sx={{ mr: 2 }}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>}
      </TableCell>
    </TableRow>
  );
};

export default MainFormRow;
