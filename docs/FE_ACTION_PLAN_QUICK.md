# 🎯 ACTION PLAN - Fatturazione Elettronica Go-Live
**Priorità**: ALTA  
**Timeline**: 2-3 giorni per minimal viable, 1 settimana per robusto

---

## 🔥 IMMEDIATE ACTIONS (Blockers - 2 ore)

### Action 1: Setup Provider API (30 minuti)
```bash
# 1. Registrati
https://www.fattura-elettronica-api.it/register

# 2. Attiva piano
- Scegli piano Basic (€29/mese, 50 fatture)
- O Standard (€79/mese, 200 fatture)

# 3. Copia credenziali
Dashboard → API Keys → Copia Key
Dashboard → Webhooks → Copia Secret

# 4. Configura webhook URL
Webhook URL: https://tuodominio.it/webhooks/fattura-elettronica-api/notifications
```

**Deliverable**: API key e webhook secret pronti ✅

---

### Action 2: Configura .env Produzione (5 minuti)
```bash
# Aggiungi a .env produzione:
FE_API_ENABLED=true
FE_API_KEY=your_api_key_here
FE_API_WEBHOOK_SECRET=your_webhook_secret_here
FE_API_SANDBOX=false  # true per test, false per produzione
FE_API_BASE_URL=https://api.fattura-elettronica-api.it/v1

# Ricarica config
php artisan config:cache
php artisan route:cache
```

**Deliverable**: .env configurato ✅

---

### Action 3: Popola Dati Fiscali Tenant (15 minuti per tenant)
```php
// Script da eseguire per ogni tenant
php artisan tinker

// Trova tenant
$tenant = App\Models\Tenant::where('id', 'your-tenant-id')->first();

// Popola dati (ESEMPIO - adatta ai tuoi dati reali)
$tenant->update([
    'vat_number' => '12345678901',              // P.IVA 11 cifre
    'tax_code' => '12345678901',                // CF azienda = P.IVA
    'address' => 'Via Roma 1',
    'city' => 'Milano',
    'postal_code' => '20100',
    'province' => 'MI',
    'country' => 'IT',
    'pec_email' => 'pec@tuaazienda.it',        // OBBLIGATORIO
    'fiscal_regime' => 'RF01',                  // Regime ordinario
    'phone' => '+39 02 12345678',
]);

// Verifica
dd($tenant->toArray());
exit
```

**Codici Regime Fiscale**:
- `RF01` = Ordinario
- `RF02` = Contribuenti minimi
- `RF04` = Agricoltura e attività connesse
- `RF05` = Vendita sali e tabacchi
- `RF09` = Forfettario (fino €85k)
- `RF19` = Forfettario (€85k-€100k)

**Deliverable**: Tenant con dati fiscali completi ✅

---

### Action 4: Verifica Customer Test (5 minuti)
```php
php artisan tinker

// Trova o crea customer test
$customer = App\Models\Customer\Customer::first();

// PRIVATO
$customer->update([
    'first_name' => 'Mario',
    'last_name' => 'Rossi',
    'tax_code' => 'RSSMRA85M01H501U',  // CF valido
    'address' => 'Via Milano 10',
    'city' => 'Roma',
    'zip' => '00100',
    'province' => 'RM',
    'country' => 'IT',
]);

// O AZIENDA
$customer->update([
    'company_name' => 'Palestra Test SRL',
    'vat_number' => '12345678901',
    'tax_code' => '12345678901',
    'address' => 'Via Torino 5',
    'city' => 'Milano',
    'zip' => '20100',
    'province' => 'MI',
    'country' => 'IT',
]);

dd($customer->toArray());
exit
```

**Deliverable**: Customer test pronto ✅

---

### Action 5: Test Sandbox End-to-End (1 ora)
```bash
# 1. Assicurati sandbox mode attivo
FE_API_SANDBOX=true in .env

# 2. Nel browser
- Vai su /app/{tenant}/sales/create
- Crea vendita con customer test
- Aggiungi prodotto con IVA 22%
- Salva vendita (status = saved)

# 3. Vai su sale-show
- Click "Genera Fattura Elettronica"
- Verifica status = GENERATED
- Click "Scarica XML"
- Apri XML e verifica:
  ✓ Dati cedente corretti
  ✓ Dati committente corretti
  ✓ Importi senza errori
  ✓ IVA corretta
  
# 4. Invia a SDI sandbox
- Click "Invia a SDI"
- Verifica status = SENT
- Attendi 2-5 minuti
- Refresh pagina
- Verifica status = ACCEPTED (sandbox accetta sempre)

# 5. Scarica PDF
- Click "Scarica PDF"
- Verifica layout professionale

# 6. Check logs
tail -f storage/logs/laravel.log
# Cerca "Webhook received" e verifica tenant trovato
```

**Problemi comuni**:
- Webhook non arriva? Verifica URL configurato correttamente
- Status resta SENT? Check logs per errori
- XML invalido? Verifica dati tenant/customer completi

**Deliverable**: Test sandbox passato ✅

---

## ⚡ QUICK WINS (Consigliati - 3-4 ore)

### Action 6: Email Notifiche (2-3 ore)

**Step 1: Crea Notification (30min)**
```bash
php artisan make:notification ElectronicInvoiceAcceptedNotification
php artisan make:notification ElectronicInvoiceRejectedNotification
```

**Step 2: Implementa (1h)**
```php
// app/Notifications/ElectronicInvoiceAcceptedNotification.php
public function via($notifiable)
{
    return ['mail', 'database'];
}

public function toMail($notifiable)
{
    return (new MailMessage)
        ->subject('✅ Fattura ' . $this->invoice->transmission_id . ' accettata da SDI')
        ->greeting('Buone notizie!')
        ->line('La fattura è stata accettata correttamente dal Sistema di Interscambio.')
        ->action('Visualizza Vendita', route('app.sales.show', $this->invoice->sale_id))
        ->line('Transmission ID: ' . $this->invoice->transmission_id)
        ->line('Data invio: ' . $this->invoice->sent_at->format('d/m/Y H:i'));
}

// Similar per RejectedNotification con SDI errors
```

**Step 3: Trigger nel Webhook (30min)**
```php
// FatturaElettronicaApiWebhookController
if ($invoice->status === 'accepted') {
    $tenant->users()
        ->where('role', 'admin')
        ->each(fn($admin) => $admin->notify(
            new ElectronicInvoiceAcceptedNotification($invoice)
        ));
}
```

**Deliverable**: Email automatiche ✅

---

### Action 7: Command Setup Fiscal Data (1 ora)

```php
// app/Console/Commands/SetupTenantFiscalData.php
php artisan make:command SetupTenantFiscalData

public function handle()
{
    $tenantId = $this->argument('tenant_id');
    $tenant = Tenant::find($tenantId);
    
    $this->info("Setup dati fiscali per: {$tenant->name}");
    
    $data = [
        'vat_number' => $this->ask('P.IVA (11 cifre)'),
        'tax_code' => $this->ask('Codice Fiscale'),
        'address' => $this->ask('Indirizzo'),
        'city' => $this->ask('Città'),
        'postal_code' => $this->ask('CAP'),
        'province' => $this->ask('Provincia (2 lettere)'),
        'pec_email' => $this->ask('PEC Email'),
        'fiscal_regime' => $this->choice('Regime Fiscale', [
            'RF01' => 'Ordinario',
            'RF09' => 'Forfettario',
            // ... altri
        ]),
        'phone' => $this->ask('Telefono (opzionale)', null),
    ];
    
    // Validazioni
    if (strlen($data['vat_number']) !== 11) {
        $this->error('P.IVA deve essere 11 cifre');
        return 1;
    }
    
    if (!Str::contains($data['pec_email'], '@pec.')) {
        $this->warn('Email PEC dovrebbe contenere @pec.');
    }
    
    $tenant->update($data);
    
    $this->info('✅ Dati fiscali salvati con successo!');
}
```

**Usage**:
```bash
php artisan tenant:setup-fiscal-data {tenant_id}
```

**Deliverable**: Onboarding rapido tenant ✅

---

### Action 8: Dashboard Widget (1-2 ore)

```tsx
// resources/js/components/dashboard/ElectronicInvoiceWidget.tsx
export default function ElectronicInvoiceWidget() {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    axios.get('/api/dashboard/electronic-invoice-stats')
      .then(res => setStats(res.data));
  }, []);
  
  return (
    <Card>
      <CardHeader title="Fatturazione Elettronica" />
      <CardContent>
        <Grid container spacing={2}>
          <Grid size={6}>
            <Typography variant="h4">{stats.month_count}</Typography>
            <Typography variant="caption">Fatture questo mese</Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="h4">{stats.pending_count}</Typography>
            <Typography variant="caption">In attesa SDI</Typography>
          </Grid>
          {stats.rejected_count > 0 && (
            <Grid size={12}>
              <Alert severity="error">
                {stats.rejected_count} fatture rifiutate richiedono attenzione
              </Alert>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}
```

**Backend endpoint**:
```php
Route::get('/dashboard/electronic-invoice-stats', function () {
    return [
        'month_count' => ElectronicInvoice::whereMonth('created_at', now()->month)->count(),
        'pending_count' => ElectronicInvoice::whereIn('status', ['generated', 'sent'])->count(),
        'rejected_count' => ElectronicInvoice::where('status', 'rejected')->count(),
        'total_amount' => Sale::whereHas('electronic_invoice')->sum('total'),
    ];
});
```

**Deliverable**: Visibilità dashboard ✅

---

## 📊 TIMELINE COMPLETA

### Day 1 (Mattina - 2h)
- ✅ Setup provider API (30min)
- ✅ Configura .env (5min)
- ✅ Popola dati fiscali (30min)
- ✅ Verifica customer (5min)
- ✅ Test sandbox (1h)

**Milestone**: Sistema funzionante in sandbox ✅

---

### Day 1 (Pomeriggio - 3h)
- ✅ Email notifiche (2-3h)
- ✅ Test email in sandbox (30min)

**Milestone**: Notifiche automatiche ✅

---

### Day 2 (Mattina - 2h)
- ✅ Command setup fiscal (1h)
- ✅ Dashboard widget (1h)

**Milestone**: Tools admin completi ✅

---

### Day 2 (Pomeriggio - 2h)
- ✅ Test produzione (1h)
- ✅ Training team (30min)
- ✅ Monitoring setup (30min)

**Milestone**: PRODUCTION READY ✅

---

### Week 1 (Post-launch)
- ✅ Test suite automatici (3-4h)
- ✅ Gestione errori avanzata (2h)
- ✅ Documentazione utente (2h)

**Milestone**: Sistema robusto ✅

---

## 🎯 SUCCESS CRITERIA

### Minimal Viable (Day 1)
- [x] Provider configurato
- [x] Tenant con dati fiscali
- [x] Test sandbox passato
- [x] 1 fattura generata e inviata correttamente

### Production Ready (Day 2)
- [x] Email notifiche funzionanti
- [x] Dashboard visibilità
- [x] Command setup pronto
- [x] Test reale produzione passato
- [x] Team formato

### Robust System (Week 1)
- [x] Test suite completa
- [x] Error handling avanzato
- [x] Monitoring attivo
- [x] Documentazione utente

---

## 🚀 GO/NO-GO CHECKLIST

### Pre-Produzione
- [ ] API provider configurato
- [ ] Tenant fiscal data completo
- [ ] Customer test validato
- [ ] Test sandbox 100% passato
- [ ] Email notifiche testate
- [ ] Logs monitoring attivo

### Produzione
- [ ] FE_API_SANDBOX=false
- [ ] Webhook URL produzione configurato
- [ ] SSL certificato attivo
- [ ] Backup strategy in place
- [ ] Team formato su workflow

### Post-Launch (48h)
- [ ] Prima fattura reale inviata
- [ ] SDI accettazione ricevuta
- [ ] Email notifiche ricevute
- [ ] No errori critici in log
- [ ] Performance OK

---

## ⚠️ RISK MITIGATION

### Risk 1: Webhook non ricevuti
**Probability**: Media  
**Impact**: Alto  
**Mitigation**:
- Verifica URL configurato correttamente
- Test con curl manuale
- Check firewall/CORS
- Fallback: polling manual status check

### Risk 2: Dati fiscali incompleti
**Probability**: Alta  
**Impact**: Critico  
**Mitigation**:
- Validation command pre-invio
- Alert se dati mancanti
- Guida setup chiara

### Risk 3: XML invalido
**Probability**: Bassa  
**Impact**: Alto  
**Mitigation**:
- Validation XSD pre-invio
- Test sandbox obbligatorio
- Logging dettagliato errori

### Risk 4: Limite piano API raggiunto
**Probability**: Media  
**Impact**: Medio  
**Mitigation**:
- Dashboard monitoring usage
- Alert 80% limite
- Upgrade automatico suggerito

---

## 📞 SUPPORT & ESCALATION

### Technical Issues
- Check: `docs/FE_SETUP.md` (troubleshooting)
- Logs: `storage/logs/laravel.log`
- API Dashboard: https://dashboard.fattura-elettronica-api.it/

### Provider Support
- Email: support@fattura-elettronica-api.it
- Docs: https://docs.fattura-elettronica-api.it/
- Response time: < 24h

---

## ✅ COMPLETION CHECKLIST

### Setup Phase
- [ ] Action 1: Provider setup
- [ ] Action 2: .env config
- [ ] Action 3: Tenant fiscal data
- [ ] Action 4: Customer test
- [ ] Action 5: Sandbox test

### Enhancement Phase
- [ ] Action 6: Email notifications
- [ ] Action 7: Setup command
- [ ] Action 8: Dashboard widget

### Production Phase
- [ ] Production test
- [ ] Team training
- [ ] Monitoring setup
- [ ] Go-live!

---

**Estimated Total Time**: 8-10 hours for production-ready system  
**Minimal Go-Live**: 2 hours (Actions 1-5)  
**Recommended**: 5-6 hours (Actions 1-8)

**PRIORITÀ: Inizia con Actions 1-5 OGGI!** 🔥

