import React from "react";
import {Button, Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";
import {FieldArray, useFormikContext} from "formik";
import { AutocompleteOptions, PriceListArticle, PriceListMembershipFee, Product } from '@/types';
import SubscriptionTableRow from "@/components/price-list/subscription/content-table/SubscriptionTableRow";
import SubscriptionAddContentDialog from "@/components/price-list/subscription/SubscriptionAddContentDialog";
import SubscriptionTableFormRow from "@/components/price-list/subscription/content-table/form/SubscriptionTableFormRow";
import { ARTICLE, MEMBERSHIP, PriceListPageProps } from '@/pages/price-lists/price-lists';
import { usePage } from '@inertiajs/react';
import {
  SubscriptionGeneralFormValues,
  SubscriptionGeneralFormValuesWithContent
} from '@/components/price-list/subscription/tabs/SubscriptionGeneralTab';

const createRow = (entity: Product | PriceListMembershipFee | PriceListArticle, vatRateOptions: AutocompleteOptions<number>, isOptional: boolean = false): SubscriptionGeneralFormValuesWithContent | undefined => {
  if (!entity.id) {
    return;
  }

  if ( entity.type === "App\\Models\\Product\\BaseProduct" || entity.type === "App\\Models\\Product\\CourseProduct") {
    return {
      id: undefined,
      days_duration: null,
      months_duration: null,
      price: null,
      vat_rate_id: entity.vat_rate_id,
      vat_rate: vatRateOptions.find(option => option.value === entity.vat_rate_id) ?? null,
      entrances: null,
      daily_access: null,
      weekly_access: null,
      reservation_limit: null,
      daily_reservation_limit: null,
      is_optional: isOptional,
      price_listable_id: entity.id,
      price_listable_type: 'App\\Models\\Product\\Product',
      price_listable: entity,
      isDirty: true
    }
  }

  if (entity.type === MEMBERSHIP || entity.type === ARTICLE) {
    return {
      id: undefined,
      days_duration: null,
      months_duration: entity.type === MEMBERSHIP ? entity.months_duration : null,
      price: entity.price,
      vat_rate_id: entity.vat_rate_id,
      vat_rate: vatRateOptions.find(option => option.value === entity.vat_rate_id) ?? null,
      entrances: null,
      daily_access: null,
      weekly_access: null,
      reservation_limit: null,
      daily_reservation_limit: null,
      is_optional: isOptional,
      price_listable_id: entity.id,
      price_listable_type: 'App\\Models\\PriceList\\PriceList',
      price_listable: entity,
      isDirty: true
    }
  }
}

interface SubscriptionTableProps {
  contentType: "standard" | "optional";
}

export default function ({contentType}: SubscriptionTableProps) {
  const {
    baseProducts,
    courseProducts,
    articles,
    membershipFees,
    vatRateOptions
  } = usePage<PriceListPageProps>().props;
  const {values} = useFormikContext<SubscriptionGeneralFormValues>();
  const [openContentDialog, setOpenContentDialog] = React.useState<boolean>(false);
  const content = contentType === "standard" ? values.standard_content : values.optional_content;
  const contentName = contentType === "standard" ? "standard_content" : "optional_content";

  const toggleOpenContentDialog = () => {
    setOpenContentDialog(!openContentDialog);
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell sx={{minWidth: 150}}>Prodotto</TableCell>
          <TableCell sx={{minWidth: 90, maxWidth: 100}}>Durata</TableCell>
          <TableCell>Ingressi</TableCell>
          <TableCell sx={{minWidth: 130}}>Reparto fiscale</TableCell>
          <TableCell sx={{width: 100}}>Prezzo</TableCell>
          <TableCell/>
        </TableRow>
      </TableHead>
      <TableBody>
        <FieldArray
          name={contentName}
          render={({remove, push, replace}) => (
            <>
              {content.length > 0
                ? content.map((content, index) => {
                  return (
                    <React.Fragment key={index}>
                      {!content.isDirty && (
                        <SubscriptionTableRow
                          key={index}
                          content={content}
                          onUpdate={() => replace(index, {...content, isDirty: true})}
                          onRemove={() => remove(index)}/>
                      )}
                      {content.isDirty && (
                        <SubscriptionTableFormRow
                          content={content}
                          contentType={contentType}
                          index={index}
                        />
                      )}
                    </React.Fragment>
                  )
                })
                : <TableRow>
                  <TableCell sx={{textAlign: "center"}} colSpan={6}>
                    Fai click su aggiungi per inserire un nuovo prodotto
                  </TableCell>
                </TableRow>
              }
              <TableRow>
                <TableCell sx={{textAlign: "center"}} colSpan={6}>
                  <Button onClick={toggleOpenContentDialog}>Aggiungi</Button>
                </TableCell>
              </TableRow>
              <SubscriptionAddContentDialog
                courseProducts={courseProducts!}
                baseProducts={baseProducts!}
                articles={articles!}
                membershipFees={membershipFees!}
                onClose={toggleOpenContentDialog}
                onSelect={(entity) => push(createRow(entity, vatRateOptions!, contentType === "optional"))}
                open={openContentDialog}
              />
            </>
          )}
        />
      </TableBody>
    </Table>
  )
};
