import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PersonIcon from '@mui/icons-material/Person';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import StoreIcon from '@mui/icons-material/Store';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

export const productType = {
  baseProduct: 'BASE_PRODUCT',
  courseProduct: 'COURSE_PRODUCT'
};

export const menuList = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    Icon: DashboardIcon
  },
  {
    name: 'Clienti',
    href: '/customer',
    Icon: PeopleIcon,
    items: [
      {
        name: 'Aggiungi',
        href: '/customers/create'
      },
      {
        name: 'Attivi',
        href: '/customers?active=true'
      },
      {
        name: 'Tutti',
        href: '/customers'
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
        href: route('base-products.index')
      },
      {
        name: 'Corsi',
        href: route('course-products.index')
      },
      /*{
        name: "Multi Attività",
        href: "/multi-activities",
      },*/
      {
        name: 'Listini',
        href: route('price-lists.index')
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
        href: '/sales/create'
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
];

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

export const configurationMenuList = [
  {
    name: 'Azienda',
    href: route('configurations.company'),
    Icon: ApartmentIcon
  },
  {
    name: 'Struttura',
    href: route('configurations.structure'),
    Icon: StoreIcon
  },
  {
    name: 'Risorse finanziarie',
    href: route('configurations.financial-resources'),
    Icon: AccountBalanceIcon
  }

];
