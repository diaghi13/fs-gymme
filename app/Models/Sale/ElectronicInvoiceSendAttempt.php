<?php

namespace App\Models\Sale;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ElectronicInvoiceSendAttempt extends Model
{
    protected $fillable = [
        'electronic_invoice_id',
        'attempt_number',
        'status',
        'request_payload',
        'response_payload',
        'error_messages',
        'external_id',
        'sent_at',
        'user_id',
    ];

    protected $casts = [
        'request_payload' => 'array',
        'response_payload' => 'array',
        'sent_at' => 'datetime',
    ];

    /**
     * Electronic invoice relationship
     */
    public function electronicInvoice(): BelongsTo
    {
        return $this->belongsTo(ElectronicInvoice::class);
    }

    /**
     * User who triggered the send
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    /**
     * Was this attempt successful?
     */
    public function wasSuccessful(): bool
    {
        return in_array($this->status, ['sent', 'accepted']);
    }

    /**
     * Get parsed error details
     */
    public function getParsedErrors(): array
    {
        if (! $this->error_messages) {
            return [];
        }

        $parser = app(\App\Services\Sale\SdiErrorParserService::class);

        return $parser->parseErrors($this->error_messages)->toArray();
    }
}
