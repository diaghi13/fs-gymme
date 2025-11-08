import React from "react";
import {Button, Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";
import {FieldArray, useFormikContext} from "formik";
import { AutocompleteOptions, BookableService, PriceListArticle, PriceListMembershipFee, Product, VatRate } from '@/types';
import SubscriptionTableRow from "@/components/price-list/subscription/content-table/SubscriptionTableRow";
import SubscriptionAddContentDialog from "@/components/price-list/subscription/SubscriptionAddContentDialog";
import SubscriptionTableFormRow from "@/components/price-list/subscription/content-table/form/SubscriptionTableFormRow";
import { ARTICLE, MEMBERSHIP, PriceListPageProps } from '@/pages/price-lists/price-lists';
import { usePage } from '@inertiajs/react';
import {
  SubscriptionGeneralFormValues,
  SubscriptionGeneralFormValuesWithContent
} from '@/components/price-list/subscription/tabs/SubscriptionGeneralTab';

const createRow = (entity: Product | BookableService | PriceListMembershipFee | PriceListArticle | any, vatRateOptions: any, isOptional: boolean = false): SubscriptionGeneralFormValuesWithContent | undefined => {
  if (!entity.id) {
    return;
  }

  // Check if it's a Product (BaseProduct, CourseProduct, or BookableService)
  // Types can be: "base", "course", "bookable_service", or full class names
  const isProduct = entity.type === "base" ||
                    entity.type === "course" ||
                    entity.type === "bookable_service" ||
                    entity.type === "base_product" ||
                    entity.type === "course_product" ||
                    entity.type === "App\\Models\\Product\\BaseProduct" ||
                    entity.type === "App\\Models\\Product\\CourseProduct" ||
                    entity.type === "App\\Models\\Product\\BookableService";

  if (isProduct) {
    // Extract booking rules from product settings if available (for bookable services)
    const bookingSettings = entity.settings?.booking;

    return {
      id: undefined,
      days_duration: null,
      months_duration: null,
      price: null,
      vat_rate_id: entity.vat_rate_id ?? null,
      vat_rate: vatRateOptions.find((option: any) => option.value === entity.vat_rate_id) ?? null,
      entrances: null,
      is_optional: isOptional,
      price_listable_id: entity.id,
      price_listable_type: 'App\\Models\\Product\\Product',
      price_listable: entity,

      // Access rules
      unlimited_entries: true, // Default to unlimited if entrances not specified
      total_entries: null,
      daily_entries: null,
      weekly_entries: null,
      monthly_entries: null,

      // Booking rules - Load from product as template if available
      max_concurrent_bookings: null,
      daily_bookings: bookingSettings?.max_per_day ?? null,
      weekly_bookings: null,
      advance_booking_days: bookingSettings?.advance_days ?? null,
      cancellation_hours: bookingSettings?.cancellation_hours ?? null,

      // Validity rules
      validity_type: 'duration',
      validity_days: null,
      validity_months: null,
      valid_from: null,
      valid_to: null,
      freeze_days_allowed: null,
      freeze_cost_cents: null,

      // Time restrictions
      has_time_restrictions: false,
      time_restrictions: [],

      // Service access
      service_access_type: 'all',
      services: [],

      // Benefits

      // Metadata
      sort_order: 0,
      settings: null,

      // Legacy fields
      daily_access: null,
      weekly_access: null,
      reservation_limit: null,
      daily_reservation_limit: null,

      isDirty: true
    }
  }

  if (entity.type === MEMBERSHIP || entity.type === ARTICLE) {
    return {
      id: undefined,
      days_duration: null,
      months_duration: entity.type === MEMBERSHIP ? (entity as any).months_duration : null,
      price: (entity as any).price,
      vat_rate_id: entity.vat_rate_id ?? null,
      vat_rate: vatRateOptions.find((option: any) => option.value === entity.vat_rate_id) ?? null,
      entrances: null,
      is_optional: isOptional,
      price_listable_id: entity.id as number,
      price_listable_type: 'App\\Models\\PriceList\\PriceList',
      price_listable: entity,

      // Access rules
      unlimited_entries: true, // Default to unlimited if entrances not specified
      total_entries: null,
      daily_entries: null,
      weekly_entries: null,
      monthly_entries: null,

      // Booking rules
      max_concurrent_bookings: null,
      daily_bookings: null,
      weekly_bookings: null,
      advance_booking_days: null,
      cancellation_hours: null,

      // Validity rules
      validity_type: 'duration',
      validity_days: null,
      validity_months: null,
      valid_from: null,
      valid_to: null,
      freeze_days_allowed: null,
      freeze_cost_cents: null,

      // Time restrictions
      has_time_restrictions: false,
      time_restrictions: [],

      // Service access
      service_access_type: 'all',
      services: [],

      // Benefits

      // Metadata
      sort_order: 0,
      settings: null,

      // Legacy fields
      daily_access: null,
      weekly_access: null,
      reservation_limit: null,
      daily_reservation_limit: null,

      isDirty: true
    }
  }

  // If we get here, the entity type is not recognized
  return undefined;
}

interface SubscriptionTableProps {
  contentType: "standard" | "optional";
}

export default function ({contentType}: SubscriptionTableProps) {
  const {
    baseProducts,
    courseProducts,
    bookableServices,
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
                ? content.map((item, index) => {
                  if (!item) return null;
                  return (
                    <React.Fragment key={index}>
                      {!item.isDirty && (
                        <SubscriptionTableRow
                          key={index}
                          content={item}
                          onUpdate={() => replace(index, {...item, isDirty: true})}
                          onRemove={() => remove(index)}/>
                      )}
                      {item.isDirty && (
                        <SubscriptionTableFormRow
                          content={item}
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
                bookableServices={bookableServices!}
                articles={articles!}
                membershipFees={membershipFees!}
                dayPasses={[]}
                tokens={[]}
                giftCards={[]}
                onClose={toggleOpenContentDialog}
                onSelect={(entity) => {
                  const newRow = createRow(entity, vatRateOptions!, contentType === "optional");
                  if (newRow) {
                    push(newRow);
                  }
                }}
                open={openContentDialog}
              />
            </>
          )}
        />
      </TableBody>
    </Table>
  )
};
