# 📊 Roadmap Implementazione Sezione Contabilità

## 📋 Panoramica

Implementazione completa del modulo di contabilità per la gestione finanziaria della palestra, con focus su:
- **Prima Nota**: Registro cronologico movimentazioni finanziarie
- **Pagamenti In Sospeso**: Gestione crediti e rate scadute
- **Dashboard & Report**: Analytics e previsioni (Fase 2)

---

## 🎯 Obiettivi

### Business Goals
- Monitorare cashflow giornaliero/mensile
- Ridurre crediti insoluti tramite tracking rate scadute
- Semplificare chiusura giornaliera cassa
- Fornire report pronti per commercialista

### Technical Goals
- API RESTful scalabili e performanti
- UI intuitiva con Material-UI
- Sistema permessi granulare
- Export multi-formato (Excel/PDF)

---

## 🔐 Nuovi Permessi

### Backend (Database)
```
accounting.view_journal      - Visualizza prima nota
accounting.view_receivables  - Visualizza pagamenti in sospeso
accounting.manage_payments   - Segna pagamenti come pagati
accounting.export            - Esporta report contabili
```

### Assegnazione Ruoli
- **Owner**: Tutti i permessi accounting.*
- **Manager**: Tutti i permessi accounting.*
- **Back Office**: accounting.view_journal, accounting.view_receivables, accounting.export
- **Staff**: Nessuno (solo vendite)

---

## 🗓️ Sprint Planning

### ✅ Sprint 1: Funzionalità Base (12h) - PRIORITÀ ALTA

#### Milestone: MVP Contabilità Operativa

**Backend (5h)**
- [ ] Migration permessi accounting.* (30min)
- [ ] Aggiornare `RolePermissionSeeder` (30min)
- [ ] Controller `AccountingController` (2h)
  - `journalEntries()` - GET /accounting/journal-entries
  - `pendingPayments()` - GET /accounting/pending-payments
- [ ] API Resources (1h)
  - `JournalEntryResource`
  - `PendingPaymentResource`
- [ ] Routes tenant (30min)

**Frontend (6h)**
- [ ] Aggiornare `Permission` enum TypeScript (15min)
- [ ] Aggiornare menu con nuove voci (15min)
- [ ] Pagina Prima Nota (3h)
  - `resources/js/pages/accounting/journal-entries.tsx`
  - Componenti: `JournalEntryCard`, `JournalEntryRow`, `JournalFilters`
  - Filtri: Date range, Risorsa finanziaria, Tipo
  - Vista giornaliera con totali
- [ ] Pagina Pagamenti In Sospeso (2.5h)
  - `resources/js/pages/accounting/pending-payments.tsx`
  - Componenti: `PendingPaymentsTable`, `PaymentStats`
  - Tab: Scaduti / In Scadenza / Tutti
  - Filtri: Cliente, Data, Importo

**Testing & Data (1h)**
- [ ] Seeder `AccountingTestDataSeeder` (45min)
  - 50 vendite ultimi 60 giorni
  - 15 pagamenti scaduti
  - 10 pagamenti in scadenza
- [ ] Testing manuale end-to-end (15min)

**Deliverable:** ✨ Sezione Contabilità funzionante con visualizzazione dati

---

### 🔄 Sprint 2: Export e Azioni (8h) - PRIORITÀ MEDIA

#### Milestone: Gestione Completa Pagamenti

**Backend (4h)**
- [ ] Form Request `MarkPaymentAsPaidRequest` (30min)
- [ ] Endpoint PATCH `/payments/{id}/mark-paid` (1h)
- [ ] Export Excel Prima Nota (1h)
  - Package: `maatwebsite/excel`
  - Format: XLSX con totali
- [ ] Export PDF Prima Nota (1h)
  - Package: `barryvdh/laravel-dompdf`
  - Template professionale
- [ ] Export Excel/PDF Pagamenti Sospeso (30min)

**Frontend (3h)**
- [ ] Dialog `MarkAsPaidDialog.tsx` (1.5h)
  - Form: Data pagamento, Metodo pagamento
  - Validazione Formik
  - Ottimistic update tabella
- [ ] Bottone Export con dropdown (1h)
  - Formati: Excel / PDF
  - Download automatico
- [ ] Toast notifications successo/errore (30min)

**Testing (1h)**
- [ ] Test Feature `MarkPaymentAsPaidTest` (30min)
- [ ] Test export generazione file (30min)

**Deliverable:** 📥 Export report + Gestione completa pagamenti

---

### 🌟 Sprint 3: Dashboard & Analytics (14h) - FUTURO

#### Milestone: Suite Contabilità Completa

**Backend (5h)**
- [ ] Controller `AccountingDashboardController` (2h)
  - `index()` - KPI e statistiche
  - `monthlyReport()` - Report mensile dettagliato
  - `cashflowForecast()` - Previsioni incassi futuri
- [ ] Service `CashflowForecastService` (2h)
  - Algoritmo previsionale basato su rate future
  - Probabilità incasso per customer history
- [ ] Export PDF Report Mensile (1h)

**Frontend (7h)**
- [ ] Dashboard Contabilità (4h)
  - `resources/js/pages/accounting/dashboard.tsx`
  - KPI Cards: Incassi oggi/mese, Crediti, Tasso recupero
  - Chart.js: Incassi 12 mesi, Metodi pagamento, Prodotti
  - Top 5 clienti per fatturato
  - Alert rate scadute > 30gg
- [ ] Report Mensile (2h)
  - `resources/js/pages/accounting/monthly-report.tsx`
  - Confronto mese vs precedente
  - Breakdown per tipo prodotto/metodo/risorsa
- [ ] Previsioni Cashflow (1h)
  - `resources/js/pages/accounting/cashflow-forecast.tsx`
  - Grafico 30/60/90 giorni
  - Filtro probabilità incasso

**Features Avanzate (2h)**
- [ ] Sistema notifiche reminder (2h)
  - Job `SendPaymentRemindersJob`
  - Scheduler giornaliero
  - Template email personalizzabile
  - Log invii in `payment_reminders` table

**Deliverable:** 🚀 Suite completa con analytics predittivi

---

## 🏗️ Architettura Tecnica

### Database Schema

**Tabelle Esistenti Utilizzate:**
```
sales
├── id, uuid, date, customer_id
├── payment_status (pending/partial/paid)
├── accounting_status (pending/accounted)
└── financial_resource_id

payments
├── id, sale_id, due_date, amount
├── payment_method_id
├── payed_at (NULL = non pagato)
└── status (computed: pending/payed/expired)

document_installments (opzionale)
├── document_id, amount, due_date
├── status (unpaid/paid/overdue)
└── payment_date

financial_resources
└── Casse/Conti bancari
```

**Nuove Tabelle (Solo se necessarie in Sprint 3):**
```
payment_reminders (opzionale)
├── id, payment_id, sent_at
├── reminder_type (email/sms)
└── status (sent/failed)
```

### API Endpoints

#### Prima Nota
```
GET /accounting/journal-entries
Query: ?date_from=2025-01-01&date_to=2025-01-31&financial_resource_id=1&type=sale

Response:
{
  "data": [
    {
      "date": "2025-01-06",
      "entries": [
        {
          "id": 123,
          "time": "09:30",
          "type": "sale",
          "customer": "Mario Rossi",
          "amount": 15000, // cents
          "financial_resource": "Cassa 1",
          "sale_id": 123
        }
      ],
      "daily_total": 43000
    }
  ],
  "period_total": 75000,
  "meta": {
    "date_from": "2025-01-01",
    "date_to": "2025-01-31"
  }
}
```

#### Pagamenti In Sospeso
```
GET /accounting/pending-payments
Query: ?status=overdue&customer_id=5

Response:
{
  "data": [
    {
      "id": 45,
      "sale_id": 123,
      "customer": {
        "id": 5,
        "name": "Mario Rossi",
        "email": "mario@example.com"
      },
      "amount": 15000,
      "due_date": "2024-12-20",
      "days_overdue": 17,
      "status": "overdue",
      "payment_method": "Bonifico"
    }
  ],
  "statistics": {
    "total_receivables": 345000,
    "overdue_count": 12,
    "customers_with_overdue": 8,
    "average_days_overdue": 15
  }
}
```

#### Segna Come Pagato
```
PATCH /payments/{id}/mark-paid
Body:
{
  "payed_at": "2025-01-06",
  "payment_method_id": 2
}

Response:
{
  "message": "Pagamento segnato come pagato",
  "data": { /* updated payment */ }
}
```

### Frontend Routes

```
/accounting/journal-entries        - Prima Nota
/accounting/pending-payments       - Pagamenti In Sospeso
/accounting/dashboard              - Dashboard (Sprint 3)
/accounting/monthly-report         - Report Mensile (Sprint 3)
/accounting/cashflow-forecast      - Previsioni (Sprint 3)
```

---

## 🎨 UX Design Decisions

### Prima Nota

**Vista Giornaliera (Default)**
- ✅ PRO: Intuitiva, traccia cashflow quotidiano, facile chiusura cassa
- ❌ CON: Scroll lungo per periodi ampi
- **SOLUZIONE**: Aggiungere toggle "Vista Mensile" per power users

**Features UX:**
- Skeleton loading durante fetch
- Infinite scroll o pagination
- Click entry → Dialog dettaglio vendita
- Badge colorati per tipo movimentazione
- Totali progressivi e finali evidenziati

### Pagamenti In Sospeso

**Tab Switching**
- **Scaduti** (🔴 Rosso): Azione urgente richiesta
- **In Scadenza 7gg** (🟡 Giallo): Prevenzione
- **Tutti**: Vista completa

**Features UX:**
- Azioni inline: ✓ Segna pagato, ✉ Invia reminder
- Ordinamento multi-colonna
- Filtri avanzati collapsible
- Statistiche header sempre visibili
- Color coding per giorni scadenza

---

## 📊 Metriche di Successo

### KPI Tecnici
- [ ] Tempo caricamento Prima Nota < 1s
- [ ] API response time < 500ms
- [ ] Export file < 5s per 1000 righe
- [ ] Test coverage > 80%

### KPI Business
- [ ] Riduzione tempo chiusura cassa giornaliera (-50%)
- [ ] Aumento recupero crediti scaduti (+30%)
- [ ] Riduzione tempo preparazione report commercialista (-70%)
- [ ] Adozione feature da parte utenti (> 80% usage)

---

## 🧪 Testing Strategy

### Backend Tests
```
tests/Feature/Accounting/
├── JournalEntriesTest.php
│   ├── test_can_fetch_journal_entries
│   ├── test_filters_by_date_range
│   ├── test_filters_by_financial_resource
│   └── test_unauthorized_access_denied
├── PendingPaymentsTest.php
│   ├── test_can_fetch_pending_payments
│   ├── test_calculates_days_overdue
│   └── test_statistics_are_correct
└── MarkPaymentAsPaidTest.php
    ├── test_can_mark_payment_as_paid
    ├── test_validates_required_fields
    └── test_updates_payment_status_correctly
```

### Frontend Tests
- Component unit tests (Jest + React Testing Library)
- E2E tests (opzionale, Cypress)

---

## 🚀 Deployment

### Sprint 1
1. Migration permessi
2. Deploy backend API
3. Deploy frontend build
4. Run seeder su staging
5. Test manuale
6. Deploy production

### Sprint 2
1. Test export localmente
2. Verificare package dependencies
3. Deploy
4. Test download file production

### Sprint 3
1. Setup job scheduler
2. Test email sending (sandbox)
3. Deploy incrementale

---

## 📚 Documentazione

### Per Sviluppatori
- [ ] API documentation (Swagger/Postman)
- [ ] Component Storybook
- [ ] README setup locale

### Per Utenti
- [ ] Video tutorial Prima Nota
- [ ] Guida PDF "Come gestire crediti scaduti"
- [ ] FAQ contabilità

---

## 🎯 Priorità & Timeline

| Sprint | Priorità | Effort | Timeline | Status |
|--------|----------|--------|----------|--------|
| Sprint 1 | 🔴 ALTA | 12h | Week 1 | 🟡 In Progress |
| Sprint 2 | 🟡 MEDIA | 8h | Week 2 | ⚪ Planned |
| Sprint 3 | 🟢 BASSA | 14h | Week 3-4 | ⚪ Backlog |

---

## 📝 Note & Considerazioni

### Performance
- Index su `payments.due_date` e `payments.payed_at`
- Eager loading relazioni customer/paymentMethod
- Cache statistiche dashboard (5 min TTL)

### Sicurezza
- Policy authorization su tutti endpoint
- Validazione input Form Requests
- Rate limiting export (max 10/min)

### Localizzazione
- Tutte label in Italiano
- Date format: dd/mm/yyyy
- Currency: € (EUR)
- Timezone: Europe/Rome

### Accessibilità
- ARIA labels su tutte azioni
- Keyboard navigation
- Screen reader compatible
- Color contrast WCAG AA

---

## 🔗 Risorse & Riferimenti

### Documentazione Tecnica
- [Laravel Documentation](https://laravel.com/docs)
- [Material-UI DataGrid](https://mui.com/x/react-data-grid/)
- [Inertia.js](https://inertiajs.com/)

### Best Practices Contabilità
- Prima nota contabile: https://www.softwaresemplice.it/blog/prima-nota-contabile/1072
- Gym accounting guide: https://www.exercise.com/grow/accounting-for-gyms/

### Package Utili
- `maatwebsite/excel` - Export Excel
- `barryvdh/laravel-dompdf` - Export PDF
- `spatie/laravel-query-builder` - API filtering

---

**Documento creato:** 06 Gennaio 2025
**Ultima modifica:** 06 Gennaio 2025
**Versione:** 1.0
**Autore:** Claude Code