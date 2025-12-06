import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PersonIcon from '@mui/icons-material/Person';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import StoreIcon from '@mui/icons-material/Store';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LanguageIcon from '@mui/icons-material/Language';
import PercentIcon from '@mui/icons-material/Percent';
import PaymentIcon from '@mui/icons-material/Payment';
import EmailIcon from '@mui/icons-material/Email';
import ArchiveIcon from '@mui/icons-material/Archive';
import SecurityIcon from '@mui/icons-material/Security';
import WorkIcon from '@mui/icons-material/Work';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import StorageIcon from '@mui/icons-material/Storage';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import { Permission } from '@/types/permissions';

export const productType = {
  baseProduct: 'BASE_PRODUCT',
  courseProduct: 'COURSE_PRODUCT'
};

export interface MenuItem {
  name: string;
  href?: string;
  Icon: any;
  permission?: string | string[];  // Required permission(s) - user must have at least one
  feature?: string | string[];      // Required feature(s) - tenant must have at least one
  role?: string | string[];         // Required role(s) - user must have at least one
  items?: Omit<MenuItem, 'Icon' | 'items'>[];
}

export const menuList = (tenant: string): MenuItem[] => ([
  {
    name: 'Dashboard',
    href: route('app.dashboard', { tenant }),
    Icon: DashboardIcon,
    // No permission required - everyone can see dashboard
  },
  {
    name: 'Clienti',
    Icon: PeopleIcon,
    permission: [Permission.CUSTOMERS_VIEW_ALL, Permission.CUSTOMERS_VIEW_ASSIGNED],
    items: [
      {
        name: 'Aggiungi',
        href: route('app.customers.create', { tenant }),
        permission: Permission.CUSTOMERS_CREATE,
      },
      {
        name: 'Attivi',
        href: route('app.customers.index', { tenant, active: 'true' }),
        permission: [Permission.CUSTOMERS_VIEW_ALL, Permission.CUSTOMERS_VIEW_ASSIGNED],
      },
      {
        name: 'Tutti',
        href: route('app.customers.index', { tenant }),
        permission: [Permission.CUSTOMERS_VIEW_ALL, Permission.CUSTOMERS_VIEW_ASSIGNED],
      },
    ],
  },
  {
    name: 'Attività',
    Icon: AssignmentIcon,
    permission: Permission.PRODUCTS_VIEW,
    items: [
      {
        name: 'Prodotti Base',
        href: route('app.base-products.index', { tenant }),
        permission: Permission.PRODUCTS_VIEW,
      },
      {
        name: 'Corsi',
        href: route('app.course-products.index', { tenant }),
        permission: Permission.PRODUCTS_VIEW,
      },
      {
        name: 'Servizi Prenotabili',
        href: route('app.bookable-services.index', { tenant }),
        permission: Permission.PRODUCTS_VIEW,
      },
      {
        name: 'Listini',
        href: route('app.price-lists.index', { tenant }),
        permission: Permission.PRICELISTS_VIEW,
      },
    ],
  },
  {
    name: 'Vendite',
    Icon: PointOfSaleIcon,
    permission: Permission.SALES_VIEW,
    items: [
      {
        name: 'Nuova Vendita',
        href: route('app.sales.create', { tenant }),
        permission: Permission.SALES_CREATE,
      },
      {
        name: 'Effettuate',
        href: route('app.sales.index', { tenant }),
        permission: Permission.SALES_VIEW,
      },
    ],
  },
  {
    name: 'Contabilità',
    Icon: MonetizationOnIcon,
    permission: [Permission.ACCOUNTING_VIEW_JOURNAL, Permission.ACCOUNTING_VIEW_RECEIVABLES],
    feature: 'advanced_reporting',
    items: [
      {
        name: 'Prima Nota',
        href: route('app.accounting.journal-entries', { tenant }),
        permission: Permission.ACCOUNTING_VIEW_JOURNAL,
      },
      {
        name: 'Pagamenti In Sospeso',
        href: route('app.accounting.pending-payments', { tenant }),
        permission: Permission.ACCOUNTING_VIEW_RECEIVABLES,
      },
    ],
  },
  {
    name: 'Gestione Utenti',
    Icon: AdminPanelSettingsIcon,
    permission: Permission.USERS_MANAGE,
    items: [
      {
        name: 'Tutti gli utenti',
        href: route('app.users.index', { tenant }),
        permission: Permission.USERS_VIEW,
      },
      {
        name: 'Invita utente',
        href: route('app.users.create', { tenant }),
        permission: Permission.USERS_INVITE,
      },
      {
        name: 'Ruoli e permessi',
        href: route('app.roles.index', { tenant }),
        permission: Permission.USERS_MANAGE,
      },
    ],
  },
]);

export const subMenuList = [
  {
    name: 'Impostazioni Privacy e Sicurezza',
    href: '#',
    Icon: DashboardIcon,
  },
  {
    name: 'Il Centro',
    href: '#',
    Icon: DashboardIcon,
  },
  {
    name: 'Amministrazione',
    href: '#',
    Icon: DashboardIcon,
  },
  {
    name: 'Attività Del Centro',
    href: '#',
    Icon: DashboardIcon,
  },
  {
    name: 'Listini',
    href: '#',
    Icon: DashboardIcon,
  },
];

export const configurationMenuList = (tenant: string) => ([
  {
    name: 'Azienda',
    href: route('app.configurations.company', { tenant }),
    Icon: ApartmentIcon,
  },
  {
    name: 'Struttura',
    href: route('app.configurations.structure', { tenant }),
    Icon: StoreIcon,
  },
  {
    name: 'Localizzazione',
    href: route('app.configurations.regional', { tenant }),
    Icon: LanguageIcon,
  },
  {
    name: 'Fatturazione',
    href: route('app.configurations.invoice', { tenant }),
    Icon: ReceiptIcon,
  },
  {
    name: 'IVA e Tasse',
    href: route('app.configurations.vat', { tenant }),
    Icon: PercentIcon,
  },
  {
    name: 'Metodi di Pagamento',
    href: route('app.configurations.payment', { tenant }),
    Icon: PaymentIcon,
  },
  {
    name: 'Risorse Finanziarie',
    href: route('app.configurations.financial-resources', { tenant }),
    Icon: AccountBalanceIcon,
  },
  {
    name: 'Email e Notifiche',
    href: route('app.configurations.email', { tenant }),
    Icon: EmailIcon,
  },
  {
    name: 'Conservazione',
    href: route('app.electronic-invoices.preservation', { tenant }),
    Icon: ArchiveIcon,
  },
  {
    name: 'GDPR Compliance',
    href: route('app.configurations.gdpr-compliance', { tenant }),
    Icon: SecurityIcon,
  },
  {
    name: 'Abbonamento',
    href: route('app.subscription.status', { tenant }),
    Icon: CardMembershipIcon,
  },
  {
    name: 'Addons & Features',
    href: route('app.addons.index', { tenant }),
    Icon: WorkIcon,
  },
]);

export const centralMenuList = () => ([
  {
    name: 'Dashboard',
    href: route('central.dashboard'),
    Icon: DashboardIcon
  },
  {
    name: 'Users',
    href: route('central.users.index'),
    Icon: PeopleIcon
  },
  {
    name: 'Tenants',
    href: route('central.tenants.index'),
    Icon: StorageIcon
  },
  {
    name: 'Abbonamenti',
    Icon: WorkIcon,
    items: [
      {
        name: 'Piani Abbonamento',
        href: route('central.subscription-plans.index')
      },
      {
        name: 'Features & Addons',
        href: route('central.plan-features.index')
      },
      {
        name: 'Pagamenti Pendenti',
        href: route('central.subscription-payments.index')
      }
    ]
  },
  {
    name: 'Ruoli e Permessi',
    Icon: NewReleasesIcon,
    items: [
      {
        name: 'Ruoli',
        href: '#'
      },
      {
        name: 'Permessi',
        href: '#'
      }
    ]
  }
]);
