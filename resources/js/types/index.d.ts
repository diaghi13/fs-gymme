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
  email: string;
  avatar?: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;

  [key: string]: unknown; // This allows for additional properties...
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

export interface Product {
  id?: number;
  name: string;
  color: string;
  type: ProductTypes;
  visible: boolean;
  sale_in_subscription?: boolean;
  selling_description?: string;
  vat_rate: VatRate | null;
  vat_rate_id: number | null;
}

export interface BaseProduct extends Product {
  is_schedulable: boolean;
  product_schedules: ProductSchedule[];
}

export interface CourseProduct extends Product {
  plannings: ProductPlanning[];
}

export interface ProductPlanning {
  id: number;
  name: string;
  from_date: Date | number;
  to_date: Date | number;
  details: Array<ProductPlanningDetails>;
}

export interface ProductPlanningDetails {
  day: AutocompleteOption<string>;
  time: Date | number | string;
  duration_in_minutes: number;
  instructor_id: number;
  room_id: number;
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
  id?: number | null;
  structure_id: number;
  parent_id: number | string | null;
  name: string;
  type: PriceListType;
  saleable: boolean;
  saleable_from: string | number | Date | null;
  saleable_to: string | number | Date | null;
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

export interface PriceListSubscriptionContent {
  id?: number;
  price: number;
  vat_tax: VatCode;
  is_optional: boolean;
  days_duration: number | null,
  months_duration: number | null,
  entrances?: number;
  daily_access?: number;
  weekly_access?: number;
  reservation_limit?: number;
  daily_reservation_limit?: number;
  selected?: boolean;
  vat_rate_id: number,
  vat_rate: VatRate,
  price_listable_id: number,
  price_listable_type: 'App\\Models\\Product\\Product' | 'App\\Models\\PriceList\\PriceList',
  price_listable: Product | PriceListMembershipFee | PriceListArticle,
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
}
