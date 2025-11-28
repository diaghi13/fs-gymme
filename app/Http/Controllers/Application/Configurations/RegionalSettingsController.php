<?php

namespace App\Http\Controllers\Application\Configurations;

use App\Http\Controllers\Controller;
use App\Models\TenantSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RegionalSettingsController extends Controller
{
    /**
     * Display regional settings page
     */
    public function show(): Response
    {
        return Inertia::render('configurations/regional-settings', [
            'settings' => [
                'language' => TenantSetting::get('regional.language', 'it'),
                'timezone' => TenantSetting::get('regional.timezone', 'Europe/Rome'),
                'date_format' => TenantSetting::get('regional.date_format', 'd/m/Y'),
                'time_format' => TenantSetting::get('regional.time_format', 'H:i'),
                'currency' => TenantSetting::get('regional.currency', 'EUR'),
                'decimal_separator' => TenantSetting::get('regional.decimal_separator', ','),
                'thousands_separator' => TenantSetting::get('regional.thousands_separator', '.'),
            ],
            'timezones' => $this->getTimezones(),
            'languages' => $this->getLanguages(),
            'currencies' => $this->getCurrencies(),
        ]);
    }

    /**
     * Update regional settings
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'language' => 'required|string|in:it,en,es,fr,de',
            'timezone' => 'required|string|timezone',
            'date_format' => 'required|string',
            'time_format' => 'required|string|in:H:i,h:i A',
            'currency' => 'required|string|size:3',
            'decimal_separator' => 'required|string|size:1',
            'thousands_separator' => 'required|string|size:1',
        ]);

        foreach ($validated as $key => $value) {
            TenantSetting::set(
                "regional.{$key}",
                $value,
                'regional',
                "Regional setting: {$key}"
            );
        }

        return redirect()->back()->with('success', 'Impostazioni regionali aggiornate con successo');
    }

    /**
     * Get available timezones grouped by region
     */
    protected function getTimezones(): array
    {
        $timezones = [
            'Europe' => [
                'Europe/Rome' => 'Roma (UTC+1)',
                'Europe/London' => 'London (UTC+0)',
                'Europe/Paris' => 'Paris (UTC+1)',
                'Europe/Berlin' => 'Berlin (UTC+1)',
                'Europe/Madrid' => 'Madrid (UTC+1)',
                'Europe/Amsterdam' => 'Amsterdam (UTC+1)',
                'Europe/Brussels' => 'Brussels (UTC+1)',
                'Europe/Vienna' => 'Vienna (UTC+1)',
                'Europe/Zurich' => 'Zurich (UTC+1)',
            ],
            'America' => [
                'America/New_York' => 'New York (UTC-5)',
                'America/Los_Angeles' => 'Los Angeles (UTC-8)',
                'America/Chicago' => 'Chicago (UTC-6)',
                'America/Toronto' => 'Toronto (UTC-5)',
                'America/Sao_Paulo' => 'São Paulo (UTC-3)',
            ],
            'Asia' => [
                'Asia/Dubai' => 'Dubai (UTC+4)',
                'Asia/Tokyo' => 'Tokyo (UTC+9)',
                'Asia/Shanghai' => 'Shanghai (UTC+8)',
                'Asia/Singapore' => 'Singapore (UTC+8)',
            ],
        ];

        return $timezones;
    }

    /**
     * Get available languages
     */
    protected function getLanguages(): array
    {
        return [
            'it' => 'Italiano',
            'en' => 'English',
            'es' => 'Español',
            'fr' => 'Français',
            'de' => 'Deutsch',
        ];
    }

    /**
     * Get available currencies
     */
    protected function getCurrencies(): array
    {
        return [
            'EUR' => 'Euro (€)',
            'USD' => 'US Dollar ($)',
            'GBP' => 'British Pound (£)',
            'CHF' => 'Swiss Franc (CHF)',
            'JPY' => 'Japanese Yen (¥)',
        ];
    }
}
