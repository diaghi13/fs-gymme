import React from "react";
import {Button, Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";
import {FieldArray, useFormikContext} from "formik";
import { AutocompleteOption, BookableService, PriceListArticle, PriceListMembershipFee, PriceListToken, PriceListGiftCard, PriceListDayPass, Product } from '@/types';
import { MEMBERSHIP, ARTICLE, TOKEN, GIFT_CARD, DAY_PASS } from '@/pages/price-lists/price-lists';
import { SubscriptionGeneralFormValuesWithContent, SubscriptionGeneralFormValues } from '@/components/price-list/subscription/tabs/SubscriptionGeneralTab';
import { usePage } from '@inertiajs/react';
import { PriceListPageProps } from '@/pages/price-lists/price-lists';
import SubscriptionTableRow from '@/components/price-list/subscription/content-table/SubscriptionTableRow';
import SubscriptionTableFormRow from '@/components/price-list/subscription/content-table/form/SubscriptionTableFormRow';
import SubscriptionAddContentDialog from '@/components/price-list/subscription/SubscriptionAddContentDialog';

/**
 * Determine the specific model class for a product/pricelist type
 */
const getProductTypeClass = (entity: Product | BookableService | PriceListMembershipFee | PriceListArticle | PriceListToken | PriceListGiftCard | PriceListDayPass): SubscriptionGeneralFormValuesWithContent['price_listable_type'] => {
  // If entity.type is already a full class name, return it
  if (entity.type?.startsWith('App\\Models\\')) {
    return entity.type as SubscriptionGeneralFormValuesWithContent['price_listable_type'];
  }

  // Map product type to full class name
  const typeMap = {
    // PRODUCT types (catalog)
    'base': 'App\\Models\\Product\\BaseProduct',
    'base_product': 'App\\Models\\Product\\BaseProduct',
    'course': 'App\\Models\\Product\\CourseProduct',
    'course_product': 'App\\Models\\Product\\CourseProduct',
    'bookable_service': 'App\\Models\\Product\\BookableService',

    // PRICELIST types (commercial offerings)
    'article': 'App\\Models\\PriceList\\Article',
    'membership': 'App\\Models\\PriceList\\Membership',
    'membership_fee': 'App\\Models\\PriceList\\Membership',
    'token': 'App\\Models\\PriceList\\Token',
    'day_pass': 'App\\Models\\PriceList\\DayPass',
    'gift_card': 'App\\Models\\PriceList\\GiftCard',
  } as const;

  // Otherwise map the short type to full class name (with null check)
  return (entity.type && typeMap[entity.type as keyof typeof typeMap]) as SubscriptionGeneralFormValuesWithContent['price_listable_type'] || 'App\\Models\\Product\\BaseProduct' as SubscriptionGeneralFormValuesWithContent['price_listable_type'];
};

const createRow = (
  entity: Product | BookableService | PriceListMembershipFee | PriceListArticle | PriceListToken | PriceListGiftCard | PriceListDayPass,
  vatRateOptions: AutocompleteOption<number>[],
  isOptional: boolean = false
): SubscriptionGeneralFormValuesWithContent | undefined => {
  if (!entity.id) {
    console.error('createRow: entity has no id', entity);
    return;
  }

  // Determine the specific product type class
  const price_listable_type = getProductTypeClass(entity);

  // Check if it's a Product type (vs PriceList type like Article)
  const isProduct = price_listable_type.includes('Product\\');

  // Extract booking rules from product settings if available (for bookable services)
  const bookingSettings = entity.settings?.booking;

  if (isProduct) {
    return {
      id: undefined,
      days_duration: null,
      months_duration: null,
      price: null,
      vat_rate_id: entity.vat_rate_id ?? null,
      vat_rate: vatRateOptions.find(option => option.value === entity.vat_rate_id) ?? null,
      is_optional: isOptional,
      price_listable_id: typeof entity.id === 'number' ? entity.id : parseInt(String(entity.id)),
      price_listable_type: price_listable_type,
      price_listable: entity as Product | BookableService | PriceListMembershipFee | PriceListArticle | PriceListToken | PriceListGiftCard | PriceListDayPass,

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
    };
  }

  // Handle PriceList types (Article, Membership, Token, DayPass, GiftCard)
  if (entity.type === MEMBERSHIP || entity.type === ARTICLE || entity.type === TOKEN || entity.type === GIFT_CARD || entity.type === DAY_PASS) {
    // Determine the specific type
    const price_listable_type = getProductTypeClass(entity);

    // Calculate days_duration and months_duration based on type
    // Access properties directly from entity without strict type casting
    let days_duration = null;
    let months_duration = null;
    let entrances = null;

    if (entity.type === MEMBERSHIP) {
      // For membership, use months_duration directly
      months_duration = (entity as any).months_duration ?? null;
    } else if (entity.type === TOKEN) {
      // Token uses validity_days/validity_months for duration
      days_duration = (entity as any).validity_days ?? null;
      months_duration = (entity as any).validity_months ?? null;
      // Use entrances directly (DB column is now entrances)
      entrances = (entity as any).entrances ?? null;
    } else if (entity.type === GIFT_CARD) {
      months_duration = (entity as any).validity_months ?? null;
    }

    return {
      id: undefined,
      days_duration: days_duration ?? null,
      months_duration: months_duration ?? null,
      entrances: entrances ?? null,
      price: (entity as any).price ?? null,
      vat_rate_id: entity.vat_rate_id ?? null,
      vat_rate: vatRateOptions.find(option => option.value === entity.vat_rate_id) ?? null,
      is_optional: isOptional,
      price_listable_id: typeof entity.id === 'number' ? entity.id : parseInt(String(entity.id)),
      price_listable_type: price_listable_type,
      price_listable: entity as Product | BookableService | PriceListMembershipFee | PriceListArticle | PriceListToken | PriceListGiftCard | PriceListDayPass,

      // Access rules
      unlimited_entries: true,
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

      // Metadata
      sort_order: 0,
      settings: null,

      // Legacy fields
      daily_access: null,
      weekly_access: null,
      reservation_limit: null,
      daily_reservation_limit: null,

      isDirty: true
    };
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
    articles,
    membershipFees,
    bookableServices,
    tokens,
    giftCards,
    dayPasses,
    vatRateOptions,
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
                courseProducts={courseProducts || []}
                baseProducts={baseProducts || []}
                articles={articles || []}
                membershipFees={membershipFees || []}
                bookableServices={bookableServices || []}
                tokens={tokens || []}
                giftCards={giftCards || []}
                dayPasses={dayPasses || []}
                onClose={toggleOpenContentDialog}
                onAdd={(entity: Product | BookableService | PriceListMembershipFee | PriceListArticle | PriceListToken | PriceListGiftCard | PriceListDayPass) => {
                  const newRow = createRow(entity, vatRateOptions || [], contentType === "optional");
                  if (newRow) {
                    push(newRow);
                  }
                  toggleOpenContentDialog();
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
