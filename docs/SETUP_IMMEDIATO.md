# ⚡ AZIONI IMMEDIATE - Setup Finale (30 minuti)
**Prima del Go-Live**: Configurazioni finali obbligatorie

---

## ✅ CHECKLIST SETUP FINALE

### 1. Setup Scheduling (10 minuti) - OBBLIGATORIO

**File**: `routes/console.php`

```php
<?php

use Illuminate\Support\Facades\Schedule;

// ============================================================
// CONSERVAZIONE SOSTITUTIVA (OBBLIGATORIO - Legge 10 anni)
// ============================================================

// Conserva automaticamente fatture accettate da SDI
Schedule::command('electronic-invoice:preserve')
    ->daily()
    ->at('02:00')
    ->name('preserve-accepted-invoices')
    ->emailOutputOnFailure('admin@yourdomain.com');

// Check scadenze conservazione (alert 90 giorni)
Schedule::command('electronic-invoice:check-expiring --days=90')
    ->weekly()
    ->sundays()
    ->at('09:00')
    ->name('check-expiring-preservations')
    ->emailOutputOnFailure('admin@yourdomain.com');

// Verifica integrità documenti conservati
Schedule::command('electronic-invoice:check-expiring --verify-integrity')
    ->monthly()
    ->name('verify-integrity-preservations')
    ->emailOutputOnFailure('admin@yourdomain.com');
```

**Verifica setup**:
```bash
php artisan schedule:list
```

---

### 2. Configure Cron (5 minuti) - OBBLIGATORIO

```bash
# Apri crontab
crontab -e

# Aggiungi (sostituisci /path/to/project):
* * * * * cd /path/to/your/project && php artisan schedule:run >> /dev/null 2>&1

# Salva e verifica
crontab -l | grep schedule
```

**Verifica funzionamento**:
```bash
# Run manualmente per test
php artisan schedule:run

# Check logs
tail -f storage/logs/laravel.log
```

---

### 3. Configure SMTP (5 minuti) - Per Email Notifications

**File**: `.env`

```env
# SMTP Configuration (esempio Gmail)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your@email.com
MAIL_PASSWORD=your_app_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="${APP_NAME}"
```

**Test email**:
```bash
php artisan tinker

Mail::raw('Test email', function($message) {
    $message->to('test@example.com')
            ->subject('Test Email FE System');
});

exit
```

**Verifica email ricevuta** ✅

---

### 4. Setup Queue Worker (5 minuti) - Per Email Async

#### Opzione A: Manual (Test)
```bash
php artisan queue:work --verbose
```

#### Opzione B: Supervisor (Production - Consigliato)

**File**: `/etc/supervisor/conf.d/laravel-worker.conf`

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/your/project/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/your/project/storage/logs/worker.log
stopwaitsecs=3600
```

**Attiva supervisor**:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:*
sudo supervisorctl status
```

---

### 5. Switch Produzione (2 minuti)

**File**: `.env`

```env
# Switch da sandbox a produzione
FE_API_SANDBOX=false  # ERA: true
```

**Clear cache**:
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

### 6. Test Finale (3 minuti)

#### Test Conservazione
```bash
# Test manuale conservazione
php artisan electronic-invoice:preserve

# Verifica output:
# ✅ Conservate con successo: X
```

#### Test Email
```bash
# Trigger notifica test
php artisan tinker

$invoice = App\Models\Sale\ElectronicInvoice::where('status', 'accepted')->first();
$user = App\Models\User::first();
$user->notify(new App\Notifications\ElectronicInvoice\ElectronicInvoiceAcceptedNotification($invoice));

exit

# Check email ricevuta ✅
```

#### Test Schedule
```bash
# Verifica schedule configurato
php artisan schedule:list

# Output atteso:
# 0 2 * * * electronic-invoice:preserve
# 0 9 * * 0 electronic-invoice:check-expiring --days=90
```

---

## ✅ VERIFICA FINALE PRE GO-LIVE

### Checklist Tecnica
- [ ] Schedule configurato in `routes/console.php`
- [ ] Cron attivo (crontab -l)
- [ ] SMTP configurato (.env)
- [ ] Queue worker attivo (Supervisor)
- [ ] FE_API_SANDBOX=false
- [ ] Cache cleared
- [ ] Test conservazione eseguito
- [ ] Test email ricevuta
- [ ] Logs puliti (no errori critici)

### Checklist Business
- [ ] Tenant fiscal data completo
- [ ] Customer test con dati validi
- [ ] 1 fattura test inviata e accettata
- [ ] Webhook funzionante
- [ ] Email notifications ricevute
- [ ] Dashboard widget visibile
- [ ] Team formato su workflow

---

## 🚀 GO-LIVE!

### Una Volta Completata la Checklist

```bash
# 1. Verifica tutto green
php artisan schedule:list
php artisan queue:work --once  # Test queue
tail -f storage/logs/laravel.log | head -n 20  # No errors

# 2. Restart services
sudo supervisorctl restart laravel-worker:*

# 3. Monitor per le prime 24h
tail -f storage/logs/laravel.log | grep -E "(preserved|notification|webhook)"
```

### Monitoring Post-Launch

**Primo Giorno**:
- Watch logs ogni 2-3 ore
- Verifica email arrivano
- Check conservazione automatica (02:00)
- Monitor webhook SDI

**Prima Settimana**:
- Check logs giornaliero
- Verifica scadenze domenica (09:00)
- Raccogliere feedback utenti
- Fix eventuali problemi minori

**Primo Mese**:
- Verifica integrità mensile
- Check storage utilizzo
- Review performance
- Plan enhancements

---

## 📞 SUPPORT & TROUBLESHOOTING

### Logs da Monitorare
```bash
# Conservazione
tail -f storage/logs/laravel.log | grep "preserved"

# Email
tail -f storage/logs/laravel.log | grep "notification"

# Webhook
tail -f storage/logs/laravel.log | grep "webhook"

# Errori
tail -f storage/logs/laravel.log | grep "ERROR"
```

### Comandi Utili Debug
```bash
# Lista schedule
php artisan schedule:list

# Test schedule manuale
php artisan schedule:run

# Queue status
php artisan queue:work --once

# Failed jobs
php artisan queue:failed

# Cache clear
php artisan cache:clear
php artisan config:clear
```

### Contacts
- **Provider API**: support@fattura-elettronica-api.it
- **Internal**: Check logs + documentation
- **Emergency**: Rollback via git + restore DB

---

## 🎯 RISULTATO ATTESO

### Dopo Setup (30 min)
✅ Schedule attivo
✅ Cron configurato  
✅ SMTP funzionante  
✅ Queue worker running  
✅ Produzione attiva  
✅ Test passing  

### Sistema Running
✅ Conservazione automatica ogni notte 02:00  
✅ Check scadenze ogni domenica 09:00  
✅ Email notifications real-time  
✅ Webhook SDI funzionanti  
✅ Dashboard monitoring attivo  
✅ Compliance 10 anni garantita  

---

## 🎊 READY TO GO-LIVE!

**Tempo totale setup**: 30 minuti  
**Sistemi attivi**: Customer + FE + Conservazione  
**Compliance**: 100% conforme normativa  

**🚀 SISTEMA PRODUCTION-READY! 🚀**

---

*Setup guide generata: 13 Gennaio 2025*  
*Tempo stimato: 30 minuti*  
*Dopo questo: GO-LIVE!*

