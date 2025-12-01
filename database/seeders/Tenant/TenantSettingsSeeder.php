<?php

namespace Database\Seeders\Tenant;

use App\Models\TenantSetting;
use Illuminate\Database\Seeder;

class TenantSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ========================================
        // IMPOSTAZIONI REGIONALI (Localizzazione)
        // ========================================
        TenantSetting::set(
            key: 'regional.language',
            value: 'it',
            group: 'regional',
            description: 'Lingua predefinita dell\'interfaccia (it, en, es, fr, de)'
        );

        TenantSetting::set(
            key: 'regional.timezone',
            value: 'Europe/Rome',
            group: 'regional',
            description: 'Fuso orario per date e orari visualizzati'
        );

        TenantSetting::set(
            key: 'regional.date_format',
            value: 'd/m/Y',
            group: 'regional',
            description: 'Formato data (d/m/Y, m/d/Y, Y-m-d, d.m.Y)'
        );

        TenantSetting::set(
            key: 'regional.time_format',
            value: 'H:i',
            group: 'regional',
            description: 'Formato ora: H:i (24h) o h:i A (12h con AM/PM)'
        );

        TenantSetting::set(
            key: 'regional.currency',
            value: 'EUR',
            group: 'regional',
            description: 'Valuta predefinita (EUR, USD, GBP, CHF, JPY)'
        );

        TenantSetting::set(
            key: 'regional.decimal_separator',
            value: ',',
            group: 'regional',
            description: 'Separatore decimale (, o .)'
        );

        TenantSetting::set(
            key: 'regional.thousands_separator',
            value: '.',
            group: 'regional',
            description: 'Separatore migliaia (. o , o spazio)'
        );

        // ========================================
        // IMPOSTAZIONI EMAIL
        // ========================================
        TenantSetting::set(
            key: 'email.sender',
            value: tenant('email') ?? 'noreply@example.com',
            group: 'email',
            description: 'Email utilizzata come mittente per le comunicazioni automatiche'
        );

        TenantSetting::set(
            key: 'email.sender_name',
            value: tenant('name') ?? 'Sistema Gestionale',
            group: 'email',
            description: 'Nome visualizzato come mittente nelle email'
        );

        TenantSetting::set(
            key: 'email.reply_to',
            value: tenant('email') ?? 'info@example.com',
            group: 'email',
            description: 'Email dove arriveranno le risposte dei destinatari'
        );

        TenantSetting::set(
            key: 'email.signature',
            value: '',
            group: 'email',
            description: 'Firma automatica aggiunta a tutte le email'
        );

        TenantSetting::set(
            key: 'email.admin_recipients',
            value: [],
            group: 'email',
            description: 'Indirizzi email che riceveranno notifiche amministrative (JSON array)'
        );

        // ========================================
        // NOTIFICHE EMAIL
        // ========================================
        TenantSetting::set(
            key: 'notifications.invoice_accepted',
            value: true,
            group: 'notifications',
            description: 'Invia notifica quando fattura elettronica viene accettata da SDI'
        );

        TenantSetting::set(
            key: 'notifications.invoice_rejected',
            value: true,
            group: 'notifications',
            description: 'Invia notifica quando fattura elettronica viene rifiutata da SDI'
        );

        TenantSetting::set(
            key: 'notifications.customer_created',
            value: false,
            group: 'notifications',
            description: 'Invia notifica quando viene creato un nuovo cliente'
        );

        TenantSetting::set(
            key: 'notifications.subscription_expiring',
            value: true,
            group: 'notifications',
            description: 'Invia notifica quando un abbonamento sta per scadere'
        );

        TenantSetting::set(
            key: 'notifications.subscription_expired',
            value: true,
            group: 'notifications',
            description: 'Invia notifica quando un abbonamento è scaduto'
        );

        TenantSetting::set(
            key: 'notifications.medical_cert_expiring',
            value: true,
            group: 'notifications',
            description: 'Invia notifica quando un certificato medico sta per scadere'
        );

        TenantSetting::set(
            key: 'notifications.sports_registration_expiring',
            value: true,
            group: 'notifications',
            description: 'Invia notifica quando un tesseramento sportivo sta per scadere'
        );

        // ========================================
        // IMPOSTAZIONI CLIENTI
        // ========================================
        TenantSetting::set(
            key: 'customer.warning_threshold',
            value: 7,
            group: 'customer',
            description: 'Giorni prima della scadenza per mostrare avvisi nella scheda cliente'
        );

        // ========================================
        // IMPOSTAZIONI IVA
        // ========================================
        TenantSetting::set(
            key: 'vat.default_sales_rate_id',
            value: null,
            group: 'vat',
            description: 'Aliquota IVA predefinita per le vendite'
        );

        TenantSetting::set(
            key: 'vat.default_purchase_rate_id',
            value: null,
            group: 'vat',
            description: 'Aliquota IVA predefinita per gli acquisti'
        );

        TenantSetting::set(
            key: 'vat.split_payment_enabled',
            value: false,
            group: 'vat',
            description: 'Abilita lo split payment (scissione dei pagamenti PA)'
        );

        TenantSetting::set(
            key: 'vat.reverse_charge_enabled',
            value: false,
            group: 'vat',
            description: 'Abilita il reverse charge (inversione contabile)'
        );

        // Note: VAT natures (Natura IVA) are now managed dynamically via the vat_natures table
        // instead of individual boolean settings. See VatNature model and VatNatureSeeder.

        // ========================================
        // IMPOSTAZIONI FATTURAZIONE - Imposta di Bollo
        // ========================================
        TenantSetting::set(
            key: 'invoice.stamp_duty.charge_customer',
            value: true,
            group: 'invoice',
            description: 'Se TRUE, l\'imposta di bollo viene addebitata al cliente. Se FALSE, l\'azienda se ne fa carico internamente.'
        );

        TenantSetting::set(
            key: 'invoice.stamp_duty.amount',
            value: 200, // 2€ in centesimi
            group: 'invoice',
            description: 'Importo imposta di bollo in centesimi (default 200 = 2€)'
        );

        TenantSetting::set(
            key: 'invoice.stamp_duty.threshold',
            value: 77.47,
            group: 'invoice',
            description: 'Soglia minima in euro per applicazione bollo (default 77,47€)'
        );
    }
}
