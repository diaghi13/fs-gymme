<?php

namespace App\Services\Sale;

use App\Enums\ElectronicInvoiceStatusEnum;
use App\Models\ElectronicInvoiceLookup;
use App\Models\Sale\ElectronicInvoice;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FatturaElettronicaApiService
{
    protected string $username;

    protected string $password;

    protected string $endpoint;

    protected bool $sandbox;

    public function __construct()
    {
        $this->username = config('services.fattura_elettronica_api.username');
        $this->password = config('services.fattura_elettronica_api.password');
        $this->sandbox = config('services.fattura_elettronica_api.sandbox', true);

        // Endpoint corretto dalla documentazione ufficiale
        $this->endpoint = $this->sandbox
            ? config('services.fattura_elettronica_api.endpoint_test')
            : config('services.fattura_elettronica_api.endpoint_prod');
    }

    /**
     * Crea HTTP client con autenticazione e opzioni corrette
     */
    protected function createHttpClient()
    {
        $http = Http::withBasicAuth($this->username, $this->password);

        // In ambiente locale/sandbox, disabilita verifica SSL se necessario
        // Risolve errore cURL 77: certificate file not found
        if (app()->environment('local') || $this->sandbox) {
            $http = $http->withOptions([
                'verify' => false,
            ]);
        }

        return $http;
    }

    /**
     * Invia fattura elettronica a SDI tramite API
     * Documentazione: POST [endpoint]/fatture con Content-Type: application/xml
     */
    public function send(ElectronicInvoice $electronicInvoice): array
    {
        try {
            // Secondo la doc ufficiale: inviare XML direttamente con Content-Type: application/xml
            $response = $this->createHttpClient()
                ->withHeaders([
                    'Content-Type' => 'application/xml',
                    'Accept' => 'application/json',
                ])
                ->withBody($electronicInvoice->xml_content, 'application/xml')
                ->post("{$this->endpoint}/fatture");

            if ($response->successful()) {
                $data = $response->json();

                // Response contiene: id, sdi_identificativo, sdi_nome_file, sdi_fattura, sdi_stato, sdi_messaggio
                $electronicInvoice->update([
                    'external_id' => $data['id'] ?? null,
                    'sdi_status' => $this->mapSdiStatus($data['sdi_stato'] ?? 'INVI'),
                    'sdi_sent_at' => now(),
                    'send_attempts' => ($electronicInvoice->send_attempts ?? 0) + 1,
                    'last_send_attempt_at' => now(),
                ]);

                // Save lookup mapping for webhook routing (central database)
                if (isset($data['id'])) {
                    ElectronicInvoiceLookup::updateOrCreate(
                        ['external_id' => $data['id']],
                        ['tenant_id' => tenant('id')]
                    );
                }

                Log::info('Electronic invoice sent successfully', [
                    'transmission_id' => $electronicInvoice->transmission_id,
                    'api_id' => $data['id'] ?? null,
                    'tenant_id' => tenant('id'),
                ]);

                return [
                    'success' => true,
                    'message' => 'Fattura inviata con successo a SDI',
                    'api_id' => $data['id'] ?? null,
                    'data' => $data,
                ];
            }

            // Log dettagliato errore API
            Log::error('API Error Response', [
                'status' => $response->status(),
                'body' => $response->body(),
                'json' => $response->json(),
                'headers' => $response->headers(),
            ]);

            $errorMessage = $response->json('error') ?? $response->json('message') ?? $response->body() ?? 'Errore invio fattura';
            throw new \Exception($errorMessage);
        } catch (\Exception $e) {
            $electronicInvoice->update([
                'send_attempts' => ($electronicInvoice->send_attempts ?? 0) + 1,
                'last_send_attempt_at' => now(),
                'sdi_error_messages' => $e->getMessage(),
            ]);

            Log::error('Failed to send electronic invoice', [
                'transmission_id' => $electronicInvoice->transmission_id,
                'error' => $e->getMessage(),
                'tenant_id' => tenant('id'),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verifica stato fattura su API
     * Endpoint: GET [endpoint]/fatture/[ID]
     */
    public function checkStatus(ElectronicInvoice $electronicInvoice): ?array
    {
        if (! $electronicInvoice->external_id) {
            return null;
        }

        try {
            $response = $this->createHttpClient()
                ->get("{$this->endpoint}/fatture/{$electronicInvoice->external_id}");

            if ($response->successful()) {
                return $response->json();
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Failed to check invoice status', [
                'external_id' => $electronicInvoice->external_id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Scarica PDF fattura dall'API
     * Endpoint: GET [endpoint]/fatture/[ID]/pdf
     */
    public function downloadPdf(ElectronicInvoice $electronicInvoice): ?string
    {
        if (! $electronicInvoice->external_id) {
            return null;
        }

        try {
            $response = $this->createHttpClient()
                ->get("{$this->endpoint}/fatture/{$electronicInvoice->external_id}/pdf");

            if ($response->successful()) {
                return $response->body();
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Failed to download PDF', [
                'external_id' => $electronicInvoice->external_id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Scarica file notifica SDI dall'API
     * Endpoint: GET [endpoint]/fatture/[ID]/notifica
     */
    public function downloadReceipt(ElectronicInvoice $electronicInvoice): ?string
    {
        if (! $electronicInvoice->external_id) {
            return null;
        }

        try {
            $response = $this->createHttpClient()
                ->get("{$this->endpoint}/fatture/{$electronicInvoice->external_id}/notifica");

            if ($response->successful()) {
                return $response->body();
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Failed to download receipt', [
                'external_id' => $electronicInvoice->external_id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Mappa gli stati SDI dalla documentazione ufficiale
     * INVI=Inviato, PREN=Prenotato, ERRO=Errore, CONS=Consegnato, NONC=Non Consegnato
     * ACCE=Accettato (PA), RIFI=Rifiutato (PA), DECO=Decorrenza termini (PA)
     */
    protected function mapSdiStatus(string $sdiStato): string
    {
        return match ($sdiStato) {
            'INVI' => ElectronicInvoiceStatusEnum::SENT->value,
            'PREN' => ElectronicInvoiceStatusEnum::GENERATED->value, // Prenotato
            'CONS' => ElectronicInvoiceStatusEnum::DELIVERED->value,
            'ACCE' => ElectronicInvoiceStatusEnum::ACCEPTED->value,
            'RIFI', 'NONC' => ElectronicInvoiceStatusEnum::REJECTED->value,
            'DECO' => ElectronicInvoiceStatusEnum::ACCEPTED->value, // Accettazione implicita
            'ERRO' => ElectronicInvoiceStatusEnum::REJECTED->value,
            default => ElectronicInvoiceStatusEnum::SENT->value,
        };
    }
}
