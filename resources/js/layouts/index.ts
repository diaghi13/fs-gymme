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

export const productType = {
  baseProduct: 'BASE_PRODUCT',
  courseProduct: 'COURSE_PRODUCT'
};

export const menuList = (tenant: string) => ([
  {
    name: 'Dashboard',
    href: route('app.dashboard', { tenant }),
    Icon: DashboardIcon,
  },
  {
    name: 'Clienti',
    Icon: PeopleIcon,
    items: [
      {
        name: 'Aggiungi',
        href: route('app.customers.create', { tenant }),
      },
      {
        name: 'Attivi',
        href: route('app.customers.index', { tenant, active: 'true' }),
      },
      {
        name: 'Tutti',
        href: route('app.customers.index', { tenant }),
      },
    ],
  },
  {
    name: 'Attività',
    Icon: AssignmentIcon,
    items: [
      {
        name: 'Prodotti Base',
        href: route('app.base-products.index', { tenant }),
      },
      {
        name: 'Corsi',
        href: route('app.course-products.index', { tenant }),
      },
      {
        name: 'Servizi Prenotabili',
        href: route('app.bookable-services.index', { tenant }),
      },
      {
        name: 'Listini',
        href: route('app.price-lists.index', { tenant }),
      },
    ],
  },
  {
    name: 'Vendite',
    Icon: PointOfSaleIcon,
    items: [
      {
        name: 'Nuova Vendita',
        href: route('app.sales.create', { tenant }),
      },
      {
        name: 'Effettuate',
        href: route('app.sales.index', { tenant }),
      },
    ],
  },
  {
    name: 'Contabilità',
    Icon: MonetizationOnIcon,
    items: [
      {
        name: 'Prima Nota',
        href: '/accounting/journal-entries',
      },
      {
        name: 'Pagamenti In Sospeso',
        href: '/accounting/pending-payments',
      },
    ],
  },
  {
    name: 'Gestione Utenti',
    Icon: AdminPanelSettingsIcon,
    permission: 'users.manage',
    items: [
      {
        name: 'Tutti gli utenti',
        href: route('app.users.index', { tenant }),
      },
      {
        name: 'Invita utente',
        href: route('app.users.create', { tenant }),
      },
      {
        name: 'Ruoli e permessi',
        href: route('app.roles.index', { tenant }),
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
    name: 'Subscription System',
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
        name: 'Associazione Features',
        href: '#' // TODO: gestione pivot
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
