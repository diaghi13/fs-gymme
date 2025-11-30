<?php

namespace App\Http\Controllers\Application\Configurations;

use App\Http\Controllers\Controller;
use App\Models\TenantSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailSettingsController extends Controller
{
    /**
     * Display email settings page
     */
    public function show(): Response
    {
        return Inertia::render('configurations/email-settings', [
            'settings' => [
                'sender' => TenantSetting::get('email.sender', tenant('email')),
                'sender_name' => TenantSetting::get('email.sender_name', tenant('name')),
                'reply_to' => TenantSetting::get('email.reply_to', tenant('email')),
                'signature' => TenantSetting::get('email.signature', ''),
                'admin_recipients' => TenantSetting::get('email.admin_recipients', []),
            ],
            'notifications' => [
                'invoice_accepted' => TenantSetting::get('notifications.invoice_accepted', true),
                'invoice_rejected' => TenantSetting::get('notifications.invoice_rejected', true),
                'customer_created' => TenantSetting::get('notifications.customer_created', false),
                'subscription_expiring' => TenantSetting::get('notifications.subscription_expiring', true),
                'subscription_expired' => TenantSetting::get('notifications.subscription_expired', true),
                'medical_cert_expiring' => TenantSetting::get('notifications.medical_cert_expiring', true),
                'sports_registration_expiring' => TenantSetting::get('notifications.sports_registration_expiring', true),
                'warning_threshold' => TenantSetting::get('customer.warning_threshold', 7),
            ],
        ]);
    }

    /**
     * Update email settings
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'sender' => 'required|email',
            'sender_name' => 'required|string|max:255',
            'reply_to' => 'required|email',
            'signature' => 'nullable|string|max:2000',
            'admin_recipients' => 'nullable|array',
            'admin_recipients.*' => 'email',
        ]);

        // Save email settings
        TenantSetting::set('email.sender', $validated['sender'], 'email', 'Default email sender');
        TenantSetting::set('email.sender_name', $validated['sender_name'], 'email', 'Default sender name');
        TenantSetting::set('email.reply_to', $validated['reply_to'], 'email', 'Reply-to email address');
        TenantSetting::set('email.signature', $validated['signature'] ?? '', 'email', 'Email signature');
        TenantSetting::set('email.admin_recipients', $validated['admin_recipients'] ?? [], 'email', 'Admin email recipients');

        return redirect()->back()->with('success', 'Impostazioni email aggiornate con successo');
    }

    /**
     * Update notification preferences
     */
    public function updateNotifications(Request $request)
    {
        $validated = $request->validate([
            'invoice_accepted' => 'boolean',
            'invoice_rejected' => 'boolean',
            'customer_created' => 'boolean',
            'subscription_expiring' => 'boolean',
            'subscription_expired' => 'boolean',
            'medical_cert_expiring' => 'boolean',
            'sports_registration_expiring' => 'boolean',
            'warning_threshold' => 'required|integer|min:1|max:90',
        ]);

        // Save notification preferences
        foreach ($validated as $key => $value) {
            if ($key === 'warning_threshold') {
                continue; // Handle separately
            }

            TenantSetting::set(
                "notifications.{$key}",
                $value,
                'notifications',
                "Email notification: {$key}"
            );
        }

        // Save customer warning threshold
        TenantSetting::set(
            'customer.warning_threshold',
            $validated['warning_threshold'],
            'customer',
            'Giorni prima della scadenza per mostrare avvisi nella scheda cliente'
        );

        return redirect()->back()->with('success', 'Preferenze notifiche aggiornate con successo');
    }
}
