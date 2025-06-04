import React, { useEffect, useState } from 'react';
import { Button, Stack, TableCell, TableRow } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTheme } from '@mui/material/styles';
import {
  SubscriptionGeneralFormValues,
  SubscriptionGeneralFormValuesWithContent
} from '@/components/price-list/subscription/tabs/SubscriptionGeneralTab';
import { MEMBERSHIP } from '@/pages/price-lists/price-lists';
import MainFormRow from '@/components/price-list/subscription/content-table/form/MainFormRow';
import ExtraFormRow from '@/components/price-list/subscription/content-table/form/ExtraFormRow';

interface SubscriptionTableFormRowProps {
  content: SubscriptionGeneralFormValuesWithContent;
  contentType: 'standard' | 'optional';
  index: number;
}

const SubscriptionTableFormRow: React.FC<SubscriptionTableFormRowProps> = ({ content, contentType, index }) => {
  const [expanded, setExpanded] = React.useState(false);
  const { values, setFieldValue } = useFormikContext<SubscriptionGeneralFormValues>();
  const [prevValues, setPrevValues] = useState<SubscriptionGeneralFormValuesWithContent | undefined>(undefined);
  const isProduct = content.price_listable_type === 'App\\Models\\Product\\Product';
  const isMembership = content.price_listable.type === MEMBERSHIP;
  const list = contentType === 'standard' ? 'standard_content' : 'optional_content';
  const theme = useTheme();

  const handleExpand = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    if (prevValues === undefined) {
      const content = contentType === 'standard'
        ? values.standard_content[index]
        : values.optional_content[index];

      setPrevValues(content);
    }
  }, [index, list, prevValues, setPrevValues]);

  const handleSave = () => {
    const content = contentType === 'standard'
      ? values.standard_content[index]
      : values.optional_content[index];

    const newContent = {
      ...content,
      isDirty: false
    };

    if (contentType === 'standard') {
      setFieldValue(`standard_content[${index}]`, newContent);
    } else {
      setFieldValue(`optional_content[${index}]`, newContent);
    }
  };

  const handleDismiss = () => {
    if (prevValues !== undefined) {
      setFieldValue(`${list}[${index}]`, { ...prevValues, isDirty: false });
      return;
    }
  };

  return (
    <>
      <MainFormRow
        index={index}
        name={content.price_listable?.name}
        contentType={list}
        isProduct={isProduct}
        isMembership={isMembership}
        expanded={expanded}
        onExpandClick={handleExpand}
      />
      {expanded && (
        /*<TableRow sx={{backgroundColor: "rgba(0,144,255, 0.1)"}}>*/
        <ExtraFormRow index={index} content={list} />
      )}
      <TableRow
        sx={{ backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100] }}>
        <TableCell colSpan={11}>
          <Stack spacing={2} direction="row" justifyContent="flex-end">
            <Button onClick={handleDismiss}>Annulla</Button>
            <Button variant="outlined" onClick={handleSave}>Salva</Button>
          </Stack>
        </TableCell>
      </TableRow>
    </>
  );
};

export default SubscriptionTableFormRow;
