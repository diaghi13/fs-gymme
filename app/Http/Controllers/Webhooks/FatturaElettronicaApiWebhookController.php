<?php

namespace App\Http\Controllers\Webhooks;

use App\Enums\ElectronicInvoiceStatusEnum;
use App\Http\Controllers\Controller;
use App\Models\ElectronicInvoiceLookup;
use App\Models\Sale\ElectronicInvoice;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class FatturaElettronicaApiWebhookController extends Controller
{
    public function __invoke(Request $request): Response
    {
        // Verifica autenticazione Bearer secondo documentazione ufficiale
        // Header: "Authorization: Bearer [token]"
        $authHeader = $request->headers->get('Authorization');
        $expectedToken = config('services.fattura_elettronica_api.webhook_token');

        if (! $authHeader || ! str_starts_with($authHeader, 'Bearer ')) {
            Log::warning('Missing or invalid Authorization header from Fattura Elettronica API webhook');

            return response()->noContent(401);
        }

        $receivedToken = substr($authHeader, 7); // Rimuove "Bearer "

        if (! hash_equals($expectedToken, $receivedToken)) {
            Log::warning('Invalid webhook token from Fattura Elettronica API');

            return response()->noContent(401);
        }

        $payload = $request->json()->all();

        Log::info('Fattura Elettronica API Webhook received', $payload);

        // Il payload contiene array di fatture (come da GET /fatture)
        // Ogni elemento ha: ricezione, id, sdi_identificativo, sdi_stato, etc.

        if (empty($payload) || ! is_array($payload)) {
            Log::warning('Empty or invalid payload in webhook');

            return response()->noContent();
        }

        // Processa ogni aggiornamento
        foreach ($payload as $item) {
            $this->processWebhookItem($item);
        }

        return response()->noContent();
    }

    /**
     * Processa singolo item dal webhook
     */
    protected function processWebhookItem(array $item): void
    {
        $ricezione = $item['ricezione'] ?? 0;
        $id = $item['id'] ?? null; // ID interno Fattura Elettronica API

        if (! $id) {
            Log::warning('Missing id in webhook item');

            return;
        }

        // Use lookup table to find tenant quickly (central database)
        $tenantId = ElectronicInvoiceLookup::findTenantByExternalId($id);

        if (! $tenantId) {
            Log::warning('Electronic invoice not found in lookup table', ['external_id' => $id]);

            return;
        }

        // Find tenant and process webhook
        $tenant = Tenant::find($tenantId);

        if (! $tenant) {
            Log::warning('Tenant not found for webhook', ['tenant_id' => $tenantId, 'external_id' => $id]);

            return;
        }

        // Switch to tenant database and process
        $tenant->run(function () use ($id, $item) {
            $electronicInvoice = ElectronicInvoice::where('external_id', $id)->first();

            if (! $electronicInvoice) {
                Log::warning('Electronic invoice not found in tenant database', [
                    'external_id' => $id,
                    'tenant_id' => tenant('id'),
                ]);

                return;
            }

            if ($item['ricezione'] == 0) {
                // Aggiornamento trasmissione
                $this->handleTransmissionUpdate($electronicInvoice, $item);
            } else {
                // Nuova fattura ricevuta (ricezione passiva)
                Log::info('Received new invoice (passive receipt)', ['id' => $id]);
                // TODO: gestione ricezione passiva se necessaria
            }
        });
    }

    /**
     * Gestisce aggiornamento stato trasmissione
     * Stati: INVI, PREN, ERRO, CONS, NONC, ACCE (PA), RIFI (PA), DECO (PA)
     */
    protected function handleTransmissionUpdate(ElectronicInvoice $electronicInvoice, array $item): void
    {
        $sdiStato = $item['sdi_stato'] ?? null;
        $sdiMessaggio = $item['sdi_messaggio'] ?? null;
        $sdiIdentificativo = $item['sdi_identificativo'] ?? null;

        if (! $sdiStato) {
            return;
        }

        // Mappa stato secondo doc ufficiale
        $newStatus = $this->mapSdiStatus($sdiStato);

        $electronicInvoice->update([
            'sdi_status' => $newStatus,
            'sdi_status_updated_at' => now(),
            'sdi_error_messages' => $sdiMessaggio,
        ]);

        // Aggiorna anche stato vendita
        $electronicInvoice->sale->update([
            'electronic_invoice_status' => $newStatus,
        ]);

        Log::info('Electronic invoice status updated from webhook', [
            'id' => $electronicInvoice->id,
            'external_id' => $electronicInvoice->external_id,
            'old_status' => $electronicInvoice->sdi_status,
            'new_status' => $newStatus,
            'sdi_stato' => $sdiStato,
        ]);
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
