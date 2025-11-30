<?php

namespace App\Http\Controllers\Webhooks;

use App\Enums\Sale\ElectronicInvoiceStatusEnum;
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
     * Trigger automatic preservation for accepted invoice
     */
    protected function triggerAutomaticPreservation(\App\Models\Sale\ElectronicInvoice $electronicInvoice): void
    {
        try {
            $preservationService = app(\App\Services\Sale\ElectronicInvoicePreservationService::class);
            $preservationService->preserve($electronicInvoice);

            \Illuminate\Support\Facades\Log::info('Automatic preservation triggered from webhook', [
                'invoice_id' => $electronicInvoice->id,
                'transmission_id' => $electronicInvoice->transmission_id,
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed automatic preservation from webhook', [
                'invoice_id' => $electronicInvoice->id,
                'error' => $e->getMessage(),
            ]);
            // Non bloccare il webhook se la conservazione fallisce
        }
    }

    /**
     * Send email notifications based on status change
     */
    protected function sendStatusNotifications(ElectronicInvoice $electronicInvoice, ?string $oldStatus, string $newStatus): void
    {
        // Only send if status actually changed
        if ($oldStatus === $newStatus) {
            return;
        }

        // Get admin recipients using TenantMailable helper
        $adminRecipients = \App\Mail\TenantMailable::getAdminRecipients();

        // Fallback: use tenant email if no admin recipients configured
        if (empty($adminRecipients)) {
            $adminRecipients = [tenant('email')];
        }

        if (empty($adminRecipients)) {
            Log::warning('No valid email recipients for notifications', [
                'invoice_id' => $electronicInvoice->id,
            ]);

            return;
        }

        // Load sale relationship
        $sale = $electronicInvoice->sale()->with('customer')->first();

        if (! $sale) {
            Log::warning('Sale not found for electronic invoice', [
                'invoice_id' => $electronicInvoice->id,
            ]);

            return;
        }

        // Send appropriate notification based on new status
        if ($newStatus === \App\Enums\Sale\ElectronicInvoiceStatusEnum::ACCEPTED->value &&
            \App\Mail\ElectronicInvoiceAccepted::shouldSendNotification('invoice_accepted')) {
            $mailable = new \App\Mail\ElectronicInvoiceAccepted($electronicInvoice, $sale);

            foreach ($adminRecipients as $recipient) {
                try {
                    \Illuminate\Support\Facades\Mail::to($recipient)->send($mailable);
                } catch (\Exception $e) {
                    Log::error('Failed to send accepted notification', [
                        'invoice_id' => $electronicInvoice->id,
                        'recipient' => $recipient,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            Log::info('Sent accepted notification emails', [
                'invoice_id' => $electronicInvoice->id,
                'recipients' => count($adminRecipients),
            ]);
        }

        if ($newStatus === \App\Enums\Sale\ElectronicInvoiceStatusEnum::REJECTED->value &&
            \App\Mail\ElectronicInvoiceRejected::shouldSendNotification('invoice_rejected')) {
            $mailable = new \App\Mail\ElectronicInvoiceRejected($electronicInvoice, $sale);

            foreach ($adminRecipients as $recipient) {
                try {
                    \Illuminate\Support\Facades\Mail::to($recipient)->send($mailable);
                } catch (\Exception $e) {
                    Log::error('Failed to send rejected notification', [
                        'invoice_id' => $electronicInvoice->id,
                        'recipient' => $recipient,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            Log::info('Sent rejected notification emails', [
                'invoice_id' => $electronicInvoice->id,
                'recipients' => count($adminRecipients),
                'sdi_errors' => $electronicInvoice->sdi_error_messages,
            ]);
        }
    }

    /**
     * Mappa gli stati SDI dalla documentazione ufficiale
    /**
     * Mappa stato SDI a ElectronicInvoiceStatusEnum
     *
     * Stati SDI completi:
     * - INVI: Inviato a SDI
     * - PREN: Prenotato (in elaborazione)
     * - CONS: Consegnato al destinatario
     * - ACCE: Accettato (PA/NSO)
     * - RIFI: Rifiutato esplicitamente
     * - NONC: Non consegnabile
     * - DECO: Decorrenza termini (accettazione implicita dopo 15gg)
     * - ERRO: Errore invio/ricezione
     * - NE: Notifica Esito (cliente ha accettato/rifiutato) - NUOVO
     * - DT: Decorrenza Termini - NUOVO
     * - AT: Attestazione Trasmissione (impossibilità recapito) - NUOVO
     */
    protected function mapSdiStatus(string $sdiStato): string
    {
        return match ($sdiStato) {
            'INVI' => ElectronicInvoiceStatusEnum::SENT->value,
            'PREN' => ElectronicInvoiceStatusEnum::GENERATED->value, // Prenotato
            'CONS' => ElectronicInvoiceStatusEnum::DELIVERED->value,
            'ACCE' => ElectronicInvoiceStatusEnum::ACCEPTED->value,
            'RIFI', 'NONC' => ElectronicInvoiceStatusEnum::REJECTED->value,
            'DECO', 'DT' => ElectronicInvoiceStatusEnum::ACCEPTED->value, // Accettazione implicita
            'ERRO' => ElectronicInvoiceStatusEnum::REJECTED->value,
            'NE' => $this->handleNotificaEsito($item ?? []), // Dinamico: accepted/rejected
            'AT' => ElectronicInvoiceStatusEnum::REJECTED->value, // Impossibilità recapito
            default => ElectronicInvoiceStatusEnum::SENT->value,
        };
    }

    /**
     * Gestisce Notifica Esito (NE) - Cliente ha accettato/rifiutato
     * La NE contiene l'esito effettivo nel campo 'esito'
     */
    protected function handleNotificaEsito(array $item): string
    {
        $esito = $item['esito'] ?? null;

        // Esito può essere: 'EC01' (accettata) o 'EC02' (rifiutata)
        if ($esito === 'EC01') {
            Log::info('Notifica Esito: Cliente ha ACCETTATO la fattura', [
                'external_id' => $item['id'] ?? null,
                'esito' => $esito,
            ]);

            return ElectronicInvoiceStatusEnum::ACCEPTED->value;
        }

        if ($esito === 'EC02') {
            Log::info('Notifica Esito: Cliente ha RIFIUTATO la fattura', [
                'external_id' => $item['id'] ?? null,
                'esito' => $esito,
                'motivo' => $item['motivo_rifiuto'] ?? 'Non specificato',
            ]);

            return ElectronicInvoiceStatusEnum::REJECTED->value;
        }

        // Default: considera consegnata se esito sconosciuto
        Log::warning('Notifica Esito con esito sconosciuto', [
            'external_id' => $item['id'] ?? null,
            'esito' => $esito,
        ]);

        return ElectronicInvoiceStatusEnum::DELIVERED->value;
    }

    /**
     * Store item for use in mapSdiStatus
     */
    private ?array $item = null;

    /**
     * Gestisce aggiornamento stato trasmissione
     * Stati: INVI, PREN, ERRO, CONS, NONC, ACCE (PA), RIFI (PA), DECO (PA), NE, DT, AT
     */
    protected function handleTransmissionUpdate(ElectronicInvoice $electronicInvoice, array $item): void
    {
        $sdiStato = $item['sdi_stato'] ?? null;
        $sdiMessaggio = $item['sdi_messaggio'] ?? null;
        $sdiIdentificativo = $item['sdi_identificativo'] ?? null;

        if (! $sdiStato) {
            return;
        }

        // Store item for use in mapSdiStatus (needed for NE handling)
        $this->item = $item;

        // Mappa stato secondo doc ufficiale
        $newStatus = $this->mapSdiStatus($sdiStato);
        $oldStatus = $electronicInvoice->sdi_status;

        // Clear item after use
        $this->item = null;

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
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'sdi_stato' => $sdiStato,
            'webhook_event' => $this->getEventLabel($sdiStato),
        ]);

        // Send email notifications for status changes
        $this->sendStatusNotifications($electronicInvoice, $oldStatus, $newStatus);

        // Trigger automatic preservation when invoice is accepted
        if ($newStatus === \App\Enums\Sale\ElectronicInvoiceStatusEnum::ACCEPTED->value && $oldStatus !== $newStatus) {
            $this->triggerAutomaticPreservation($electronicInvoice);
        }
    }

    /**
     * Get user-friendly event label
     */
    protected function getEventLabel(string $sdiStato): string
    {
        return match ($sdiStato) {
            'NE' => 'Notifica Esito Cliente',
            'DT' => 'Decorrenza Termini (Accettazione Implicita)',
            'AT' => 'Attestazione Trasmissione (Impossibilità Recapito)',
            'DECO' => 'Decorrenza Termini',
            'ACCE' => 'Accettazione Esplicita',
            'RIFI' => 'Rifiuto Esplicito',
            default => $sdiStato,
        };
    }
}
