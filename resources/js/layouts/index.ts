import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PersonIcon from '@mui/icons-material/Person';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import StoreIcon from '@mui/icons-material/Store';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import StorageIcon from '@mui/icons-material/Storage';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import WorkIcon from '@mui/icons-material/Work';

export const productType = {
  baseProduct: 'BASE_PRODUCT',
  courseProduct: 'COURSE_PRODUCT'
};

export const menuList = (tenant: string) => ([
  {
    name: 'Dashboard',
    href: route('app.dashboard', { tenant }),
    Icon: DashboardIcon
  },
  {
    name: 'Clienti',
    //href: '/customer',
    Icon: PeopleIcon,
    items: [
      {
        name: 'Aggiungi',
        //href: '/customers/create'
        href: route('app.customers.create', { tenant })
      },
      {
        name: 'Attivi',
        href: route('app.customers.index', { tenant, active: 'true' })
      },
      {
        name: 'Tutti',
        href: route('app.customers.index', { tenant })
      }
    ]
  },
  {
    name: 'Attività',
    Icon: AssignmentIcon,
    items: [
      {
        name: 'Prodotti Base',
        //href: "/products?type=" + productType.baseProduct,
        href: route('app.base-products.index', { tenant })
      },
      {
        name: 'Corsi',
        href: route('app.course-products.index', { tenant })
      },
      /*{
        name: "Multi Attività",
        href: "/multi-activities",
      },*/
      {
        name: 'Listini',
        href: route('app.price-lists.index', { tenant })
      }
      /*{
        name: "Corsi",
        href: "/activities/course-product",
      },
      {
        name: "Appuntamenti",
        href: "/activities/date-product",
      },*/
    ]
  },
  {
    name: 'Vendite',
    Icon: PointOfSaleIcon,
    items: [
      {
        name: 'Nuova Vendita',
        href: route('app.sales.create', { tenant })
      },
      {
        name: 'Effettuate',
        href: '/sales'
      }
    ]
  },
  {
    name: 'Contabilità',
    Icon: MonetizationOnIcon,
    items: [
      {
        name: 'Prima Nota',
        href: '/accounting/journal-entries'
      },
      {
        name: 'Pagamenti In Sospeso',
        href: '/accounting/pending-payments'
      }
    ]
  },
  {
    name: 'Utenti',
    Icon: PersonIcon,
    href: '/users'
  }
  // {
  //   name: "Statitiche",
  //   href: "/statistics",
  //   Icon: QueryStatsIcon,
  // },
  // {
  //   name: "Contabilità",
  //   Icon: MonetizationOnIcon,
  //   items: [
  //     {
  //       name: "Prima Nota",
  //       href: "/statistics",
  //     },
  //     {
  //       name: "Pagamenti In Sospeso",
  //       href: "/statistics",
  //     },
  //   ],
  // },
  // {
  //   name: "Dipendenti",
  //   Icon: PeopleIcon,
  //   items: [
  //     {
  //       name: "Attivi",
  //       href: "/statistics",
  //     },
  //     {
  //       name: "Nuovo Dipendente",
  //       href: "/statistics",
  //     },
  //     {
  //       name: "Riepilogo",
  //       href: "/statistics",
  //     },
  //     {
  //       name: "Gestione",
  //       href: "/statistics",
  //     },
  //   ],
  // },
  // {
  //   name: "Calendario",
  //   href: "/calendar",
  //   Icon: ScheduleIcon,
  // },
  // {
  //   name: "Report",
  //   href: "/report",
  //   Icon: AssessmentIcon,
  // },
  // {
  //   name: "Utenti",
  //   Icon: PersonIcon,
  //   items: [
  //     {
  //       name: "Lista Utenti",
  //       href: "/statistics",
  //     },
  //     {
  //       name: "Attività",
  //       href: "/statistics",
  //     },
  //   ],
  // },
]);

export const subMenuList = [
  {
    name: 'Impostazioni Privacy e Sicurezza',
    href: '#',
    Icon: DashboardIcon
  },
  {
    name: 'Il Centro',
    href: '#',
    Icon: DashboardIcon
  },
  {
    name: 'Amministrazione',
    href: '#',
    Icon: DashboardIcon
  },
  {
    name: 'Attività Del Centro',
    href: '#',
    Icon: DashboardIcon
  },
  {
    name: 'Listini',
    href: '#',
    Icon: DashboardIcon
  }
];

export const configurationMenuList = (tenant: string) => ([
  {
    name: 'Azienda',
    href: route('app.configurations.company', { tenant }),
    Icon: ApartmentIcon
  },
  {
    name: 'Struttura',
    href: route('app.configurations.structure', { tenant }),
    Icon: StoreIcon
  },
  {
    name: 'Risorse finanziarie',
    href: route('app.configurations.financial-resources', { tenant }),
    Icon: AccountBalanceIcon
  }

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
    href: route('central.subscription-plans.index'),
    Icon: WorkIcon
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
