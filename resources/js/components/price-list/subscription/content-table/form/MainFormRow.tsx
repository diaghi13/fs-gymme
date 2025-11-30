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
import { SUBSCRIPTION_CONTENT_TYPES } from '@/constants/subscriptionContentTypes';

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
  const { values, setFieldValue } = useFormikContext<SubscriptionGeneralFormValues>();
  const content =  contentType === 'standard_content' ? values.standard_content[index] : values.optional_content[index];

  const isToken = content.price_listable_type === SUBSCRIPTION_CONTENT_TYPES.TOKEN;
  const isGiftCard = content.price_listable_type === SUBSCRIPTION_CONTENT_TYPES.GIFT_CARD;

  // Show duration for: Products, Membership, Token, GiftCard
  const showDuration = isProduct || isMembership || isToken || isGiftCard;
  // Show entrances for: Products, Token
  const showEntrances = isProduct || isToken;

  // Sync entrances with unlimited_entries
  React.useEffect(() => {
    const entrances = content.entrances;
    if (!entrances || entrances === 0) {
      setFieldValue(`${contentType}[${index}].unlimited_entries`, true);
    } else {
      setFieldValue(`${contentType}[${index}].unlimited_entries`, false);
    }
  }, [content.entrances]);

  return (
    <TableRow sx={{ backgroundColor: 'rgba(209,209,209,0.11)' }}>
      <TableCell colSpan={showDuration ? 1 : 3}>
        {name}
      </TableCell>

      {/* Products: Durata (GG + MM) */}
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
            <TextField label={'Ingressi'} name={`${contentType}[${index}].entrances`} />
          </TableCell>
        </>
      )}

      {/* Membership: Solo durata mesi */}
      {isMembership && (
        <TableCell colSpan={2}>
          <TextField
            label={'Durata (Mesi)'}
            name={`${contentType}[${index}].months_duration`}
            type="number"
            fullWidth
          />
        </TableCell>
      )}

      {/* Token: Durata (GG + MM) + Ingressi */}
      {isToken && (
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
            <TextField label={'Ingressi'} name={`${contentType}[${index}].entrances`} type="number" />
          </TableCell>
        </>
      )}

      {/* GiftCard: Solo durata mesi */}
      {isGiftCard && (
        <TableCell colSpan={2}>
          <TextField
            label={'Validità (Mesi)'}
            name={`${contentType}[${index}].months_duration`}
            type="number"
            fullWidth
          />
        </TableCell>
      )}

      <TableCell>
        <Autocomplete
          label={'IVA'}
          name={`${contentType}[${index}].vat_rate`}
          options={vatRateOptions || []}
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
