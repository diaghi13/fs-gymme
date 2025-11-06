import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
  auth: {
    user: User;
  };
  success: boolean;
  app_config: {
    [key: string]: string | number
  };
  flash: {
    status: 'default' | 'success' | 'info' | 'warning' | 'error' | undefined;
    message: string;
  };
  currentTenantId: string;
  tenant?: {
    id: string;
    name: string;
    onboarding_completed_at: string | null;
    trial_ends_at: string | null;
  };
  structures?: {
    list: Array<{
      id: number;
      name: string;
      address: string;
    }>;
    current_id: number | null;
  } | null;
};

export type AutocompleteOption = {
  label: string;
  //value: T;
}

export type AutocompleteOptions = Array<AutocompleteOption>

export interface Auth {
  user: User;
}

export interface BreadcrumbItem {
  title: string;
  href: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon | null;
  isActive?: boolean;
}

export interface SharedData {
  name: string;
  quote: { message: string; author: string };
  auth: Auth;
  ziggy: Config & { location: string };
  sidebarOpen: boolean;

  [key: string]: unknown;
}

export interface User {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  roles: {
    id: number;
    name: string;
    guard_name: string;
  }[];
  permissions: {
    id: number;
    name: string;
    guard_name: string;
  }[];
  tenants?: {
    id: string;
  }[]

  company?: {
    id: string;
    name: string;
    slug: string;
    vat_number: string;
    tax_code: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
    phone: string;
    email: string;
    pec_email: string;
    sdi_code: string;
  }

  [key: string]: unknown; // This allows for additional properties...
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  vat_number: string;
  tax_code: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
  pec_email: string;
  sdi_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  users_count?: number;
  users?: User[];

  subscription_plans?: {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    currency: string;
    interval: string; // e.g., 'month', 'year'
    trial_days: number;
    is_active: boolean;
    pivot: {
      starts_at: string;
      ends_at: string | null;
      is_active: boolean;
      is_trial: boolean;
      trial_ends_at: string | null;
      status: 'active' | 'expired' | 'cancelled';
    }
  }
  active_subscription_plan?: {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    currency: string;
    interval: string; // e.g., 'month', 'year'
    trial_days: number;
    is_active: boolean;
    pivot: {
      starts_at: string;
      ends_at: string | null;
      is_active: boolean;
      is_trial: boolean;
      trial_ends_at: string | null;
      status: 'active' | 'expired' | 'cancelled';
    }
  }

  [key: string]: unknown; // This allows for additional properties...
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  interval: string; // e.g., 'month', 'year'
  trial_days: number;
  is_active: boolean;
  stripe_price_id: string;
}

export interface VatRate {
  id?: number;
  code: string;
  description: string;
  percentage: number;
  order: number;
  nature: string;
  visible_in_activity: boolean;
  checkout_application: boolean;
  withholding_tax_application: boolean;
  social_security_withholding_application: boolean;
}

export interface ProductListItem {
  id: number;
  name: string;
  color: string;
}

export type ProductTypes =
  'App\\Models\\Product\\BaseProduct'
  | 'App\\Models\\Product\\CourseProduct'
  | 'App\\Models\\Product\\SubscriptionProduct'
  | 'App\\Models\\Product\\ServiceProduct';

export interface ProductCategory {
  id: number;
  parent_id?: number | null;
  name: string;
  slug?: string | null;
  description?: string | null;
  image_path?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Product {
  id: number;
  structure_id?: number | null;
  vat_rate_id?: number | null;
  name: string;
  slug?: string | null;
  color: string;
  description?: string | null;
  short_description?: string | null;
  sku?: string | null;
  type?: string | null;
  is_bookable: boolean;
  requires_trainer: boolean;
  duration_minutes?: number | null;
  max_participants?: number | null;
  min_participants?: number | null;
  min_age?: number | null;
  max_age?: number | null;
  gender_restriction: string;
  prerequisites?: string | null;
  settings?: Record<string, boolean | string | number | object | Array> | null;
  image_path?: string | null;
  is_active: boolean;
  saleable_in_subscription: boolean;
  selling_description?: string | null;

  vat_rate?: VatRate | null;

  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface SubscriptionComposition {
  id: number;
  subscription_product_id: number;
  included_product_id: number;
  quantity: number;
  max_uses?: number | null;
  unlimited_uses: boolean;
  validity_from_day: number;
  validity_to_day?: number | null;
  validity_type: string;
  is_included_in_base_price: boolean;
  additional_cost: number;
  cost_per_use: number;
  requires_booking: boolean;
  booking_advance_days: number;
  cancellation_hours: number;
  max_uses_per_day?: number | null;
  max_uses_per_week?: number | null;
  max_uses_per_month?: number | null;
  allowed_days?: string[] | null;
  allowed_time_slots?: string[] | null;
  allowed_time_slot_tolerance_in_minutes: number;
  blackout_dates?: string[] | null;
  priority: number;
  sort_order: number;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface BaseProduct extends Product {
  is_schedulable: boolean;
  product_schedules: ProductSchedule[];
  settings: {
    facility: {
      operating_hours: { day: string; open: string; close: string }[];
      max_occupancy: number | null;
      allow_overbooking: boolean;
    }
  }
}

export interface CourseProduct extends Product {
  plannings: ProductPlanning[];
}

export interface BookableService extends Product {
  settings: {
    booking: {
      advance_days: number;
      min_advance_hours: number;
      cancellation_hours: number;
      max_per_day: number | null;
      buffer_minutes: number;
    };
    availability: {
      days: string[];
      time_slots: Array<{ start: string; end: string }>;
      blackout_dates: string[];
    };
    requirements: {
      requires_trainer: boolean;
      requires_equipment: boolean;
      requires_room: boolean;
      min_preparation_minutes: number;
    };
  };
}

export interface ProductPlanning {
  id: number;
  name: string;
  from_date: string | Date;
  to_date: string | Date;
  selected: boolean;
  details: Array<ProductPlanningDetails>;
}

export interface ProductPlanningDetails {
  day: string;
  time: string;
  duration_in_minutes: number;
  instructor_id?: number | null;
  room_id?: number | null;
}

export interface ProductSchedule {
  id?: number;
  //product_id: number;
  //structure_id: number;
  day: AutocompleteOption<string> | string;
  from_time: string | number | Date;
  to_time: string | number | Date;
}

export interface PriceList {
  id?: number | string | null;
  company_id: number | string;
  parent_id?: number | string | null;
  name: string;
  slug: string;
  description?: string | null;
  list_type: PriceListListType; // previously string
  list_scope: PriceListScope; // previously string
  facility_id?: number | string | null;
  customer_group_id?: number | string | null;
  level: number;
  path?: string | null;
  priority: number;
  inherit_from_parent: boolean;
  override_parent_prices: boolean;
  is_default: boolean;
  valid_from?: string | Date | null;
  valid_to?: string | Date | null;
  currency: string;
  tax_included: boolean;
  default_tax_rate: number;
  base_discount_percentage: number;
  volume_discount_enabled: boolean;
  loyalty_discount_enabled: boolean;
  auto_calculate_subscriptions: boolean;
  round_prices_to: number;
  settings?: Record<string, unknown> | null;
  color?: string | null;
  icon?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface PriceListFolder extends PriceList {
  type: 'folder';
  children?: Array<PriceListFolder | PriceListArticle | PriceListMembershipFee | PriceListSubscription>;
}

export interface PriceListFolderTree extends PriceListFolder {
  depth: number;
  path: string;
  children: Array<PriceListFolderTree>;
}

export interface PriceListArticle extends PriceList {
  color: string;
  type: 'article';
  price: number;
  vat_rate_id: number | null;
  vat_rate: VatRate | null;
}

export interface PriceListMembershipFee extends PriceList {
  color: string;
  type: 'membership';
  price: number;
  vat_rate_id: number | null;
  vat_rate: VatRate | null;
  months_duration: number;
}

export interface PriceListSubscription extends PriceList {
  color: string;
  type: 'subscription';
  price: number;
  standard_content: PriceListSubscriptionContent[];
  optional_content: PriceListSubscriptionContent[];
}

export interface PriceListSubscriptionContentService {
  id: number;
  usage_limit?: number | null;
  usage_period?: 'day' | 'week' | 'month' | null;
}

export interface PriceListSubscriptionContentTimeRestriction {
  id?: number;
  days?: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'> | null;
  start_time?: string | null;
  end_time?: string | null;
  restriction_type?: 'allowed' | 'blocked';
  description?: string | null;
}

export interface PriceListSubscriptionContent {
  id?: number;
  price: number;
  vat_tax: VatCode;
  is_optional: boolean;
  days_duration: number | null;
  months_duration: number | null;
  entrances?: number | null;
  vat_rate_id: number;
  vat_rate: VatRate;
  price_listable_id: number;
  price_listable_type: 'App\\Models\\Product\\Product' | 'App\\Models\\PriceList\\PriceList';
  price_listable: Product | PriceListMembershipFee | PriceListArticle;
  selected?: boolean;

  // Access rules
  unlimited_entries?: boolean;
  total_entries?: number | null;
  daily_entries?: number | null;
  weekly_entries?: number | null;
  monthly_entries?: number | null;

  // Booking rules
  max_concurrent_bookings?: number | null;
  daily_bookings?: number | null;
  weekly_bookings?: number | null;
  advance_booking_days?: number | null;
  cancellation_hours?: number | null;

  // Validity rules
  validity_type?: 'duration' | 'fixed_date' | 'first_use';
  validity_days?: number | null;
  validity_months?: number | null;
  valid_from?: string | null;
  valid_to?: string | null;
  freeze_days_allowed?: number | null;
  freeze_cost_cents?: number | null;

  // Time restrictions
  has_time_restrictions?: boolean;
  time_restrictions?: PriceListSubscriptionContentTimeRestriction[];

  // Service access
  service_access_type?: 'all' | 'included' | 'excluded';
  services?: PriceListSubscriptionContentService[];

  // Benefits & perks
  guest_passes_total?: number | null;
  guest_passes_per_month?: number | null;
  multi_location_access?: boolean;
  discount_percentage?: number | null;

  // Metadata
  sort_order?: number;
  settings?: Record<string, any> | null;

  // Legacy fields (backward compatibility)
  daily_access?: number | null;
  weekly_access?: number | null;
  reservation_limit?: number | null;
  daily_reservation_limit?: number | null;
}

export type AllPriceLists = PriceListFolderTree | PriceListArticle | PriceListMembershipFee | PriceListSubscription

export interface Sale {
  id?: number;
  progressive_number: string;
  description: string;
  date: string;
  year: number;
  customer_id: number;
  customer: Customer | null;
  document_type_id: number | null;
  document_type: { id: number; code: string, description: string, label: string }[] | null;
  payment_condition_id: number;
  payment_condition: { id: number, description: string, payment_method_id };
  financial_resource_id: number;
  financial_resource: { id: number, description: string };
  promotion_id: number;
  promotion: { id: number, description: string };
  discount_percentage: number;
  discount_absolute: number;
  status: string;
  payment_status: string;
  accounting_status: string;
  exported_status: string;
  currency: string;
  notes: string;
  rows: SaleRow[];
  payments: Payment[];
  summary: {
    total: number;
    total_gross: number;
    payed: number;
    due: number;
  }

  sale_summary: {
    gross_price: number;
    net_price: number;
    total_tax: number;
    total_quantity: number;
    total_paid: number;
    total_due: number;
    absolute_discount: number;
    percentage_discount: number;
  }
}

export interface SaleRow {
  id?: number;
  sale_id: number;
  price_list_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  percentage_discount: number;
  absolute_discount: number;
  total: number;
  price_list: PriceListArticle | PriceListMembershipFee | PriceListSubscription;
  sale?: Sale;
  entitable_type?: string;
  entitable_id?: number;
  entitable?: PriceListSubscriptionContent;
}

export interface Payment {
  id: number;
  sale_id: number;
  due_date: Date | string;
  amount: number;
  payment_method_id: number;
  payed_at: Date | string | null;
  status: "payed" | "pending" | "expired";
  is_payed: boolean;
  payment_method: PaymentMethod | null;
}

export interface FinancialResource {
  id?: number;
  type: string;
  name: string;
  iban: string | null;
  bic: string | null;
  is_active: boolean;
  default: boolean;
  financial_resource_type_id: number | null;
  financial_resource_type?: FinancialResourceType | null;
}

export interface PaymentCondition {
  id?: number;
  description: string;
  payment_method_id: number | null;
  number_of_installments: number | null;
  end_of_month: boolean;
  visible: boolean;
  active: boolean;
  is_default: boolean;
  financial_resource_type_id: number | null;
  financial_resource_type?: FinancialResourceType | null;
  payment_method?: PaymentMethod | null;
  installments?: installment[] | null;
}

export interface PaymentMethod {
  id: number;
  description: string;
  code: string;
  order: number | null;
  label?: string;
}

export interface FinancialResourceType {
  id: number;
  name: string;
}

export interface installment {
  id: number;
  days: number;
  payment_condition_id: string;
}

export interface Promotion {
  id: number;
  name: string;
  code: string;
  description: string;
  type: string;
  value: number | string;
  start_date: Date | string | null;
  end_date: Date | string | null;
  status: string;
}

export interface Customer {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  full_name: string;
  birth_date: Date | string | null;
  gender: "female" | "male" | "other" | null;
  birthplace: string | null;
  tax_id_code: string | null;
  email: string | null;
  phone: string | null;
  street: string | null;
  number: string | null;
  city: string | null;
  zip: string | null;
  province: string | null;
  country: string | null;
  option_label: string;
  active_subscriptions?: Subscription[];
  membership?: Membership | null;
  last_membership?: Membership | null;
  sales_summary?: {
    sale_count: number;
    total_amount: number;
    payed: number;
    not_payed: number;
    expired: number;
    total_sale_products: number;
  }
  last_medical_certification?: MedicalCertification;

  gdpr_consent: boolean | null;
  gdpr_consent_at: Date | null;
  marketing_consent: boolean | null;
  marketing_consent_at: Date | null;
  photo_consent: boolean | null;
  medical_data_consent: boolean | null;
  data_retention_until: Date | null;

  sales?: Sale[];
}

export interface Subscription {
  id?: number | undefined;
  customer_id: number;
  sale_row_id: number;
  type: string;
  price_list_id: number;
  entitable_type: string;
  entitable_id: number;
  start_date: Date;
  end_date: Date | null;
  notes: string | null;
  entity?: BaseProduct | CourseProduct | PriceListMembershipFee;
  price_list?: PriceListMembershipFee | PriceListSubscription;
  sale_row?: SaleRow;
}

export interface Membership extends Subscription{
  card_number: string | null;
}

export interface MedicalCertification {
  id?: number | undefined;
  certification_date: Date | null;
  valid_until: Date | null;
  notes: string | null;
}

export interface PrivacyConsent {
  id?: number | undefined;
  blur_registry: boolean;
  data_processing_expiry_date: Date | null;
  marketing_data_usage_expiry_date: Date | null;
}

export interface City {
  denominazione: string;
  sigla: string;
}

export interface CityFull extends City{
  capoluogo: boolean;
  codice: string;
  codice_ISTAT: string;
  codice_comune: string;
  lat: string;
  lon: string;
  superficie_kmq: string;
  cap: string;
}

export interface PriceListItem {
  id?: number | string | null;
  price_list_id: number | string;
  product_id: number | string;
  base_price: number;
  discount_percentage: number;
  discount_amount: number;
  final_price: number;
  price_source: PriceSource; // was string
  inherited_from_list_id?: number | string | null;
  price_calculation_method: PriceCalculationMethod; // was string
  price_formula?: string | null;
  markup_percentage: number;
  markup_amount: number;
  min_quantity: number;
  max_quantity?: number | null;
  volume_discount_percentage: number;
  seasonal_adjustment: number;
  peak_hours_surcharge: number;
  payment_options?: Record<string, unknown> | null;
  installment_available: boolean;
  installment_months: number;
  installment_surcharge: number;
  is_locked: boolean;
  lock_reason?: string | null;
  valid_from?: string | Date | null;
  valid_to?: string | Date | null;
  is_active: boolean;
  last_updated_by?: number | string | null;
  last_update_reason?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PriceListRule {
  id?: number | string | null;
  price_list_id: number | string;
  rule_type: RuleType; // was string
  customer_group_ids?: Array<number | string> | null;
  facility_ids?: Array<number | string> | null;
  valid_from_date?: string | Date | null;
  valid_to_date?: string | Date | null;
  valid_days_of_week?: Array<number> | null;
  valid_time_slots?: Array<string> | null;
  min_quantity?: number | null;
  max_quantity?: number | null;
  min_total_amount?: number | null;
  max_total_amount?: number | null;
  min_membership_months?: number | null;
  customer_registration_after?: string | Date | null;
  custom_conditions?: Record<string, unknown> | null;
  priority: number;
  can_combine_with_other_rules: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Enum types (string unions) - corrispondono alle enum PHP in app/Enums
export type PriceListListType = 'standard' | 'promotional' | 'member' | 'corporate' | 'seasonal' | 'group' | 'facility';
export type PriceListScope = 'global' | 'facility' | 'customer_group' | 'individual';
export type PriceSource = 'manual' | 'inherited' | 'calculated' | 'formula';
export type PriceCalculationMethod = 'manual' | 'auto_sum' | 'auto_weighted' | 'formula';
export type RuleType = 'customer_group' | 'facility' | 'date_range' | 'quantity' | 'total_amount' | 'membership_duration' | 'custom';
