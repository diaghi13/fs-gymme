<?php

namespace App\Models\Sale;

use App\Enums\ElectronicInvoiceStatusEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ElectronicInvoice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sale_id',
        'xml_content',
        'xml_version',
        'transmission_id',
        'transmission_format',
        'external_id',
        'sdi_status',
        'sdi_status_updated_at',
        'sdi_receipt_xml',
        'sdi_error_messages',
        'xml_file_path',
        'signed_pdf_path',
        'preserved_at',
        'preservation_hash',
        'preservation_provider',
        'preservation_reference_id',
        'send_attempts',
        'last_send_attempt_at',
    ];

    protected function casts(): array
    {
        return [
            'sdi_status' => ElectronicInvoiceStatusEnum::class,
            'sdi_status_updated_at' => 'datetime',
            'preserved_at' => 'datetime',
            'last_send_attempt_at' => 'datetime',
            'send_attempts' => 'integer',
        ];
    }

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function isPreserved(): bool
    {
        return $this->preserved_at !== null;
    }

    public function canSend(): bool
    {
        return in_array($this->sdi_status, [
            ElectronicInvoiceStatusEnum::GENERATED,
            ElectronicInvoiceStatusEnum::TO_SEND,
        ]);
    }

    public function canResend(): bool
    {
        return $this->sdi_status->canResend();
    }

    public function isFinal(): bool
    {
        return $this->sdi_status->isFinal();
    }

    public function updateStatus(ElectronicInvoiceStatusEnum $status, ?string $message = null): void
    {
        $this->update([
            'sdi_status' => $status,
            'sdi_status_updated_at' => now(),
            'sdi_error_messages' => $message,
        ]);
    }

    public function incrementSendAttempts(): void
    {
        $this->increment('send_attempts');
        $this->update(['last_send_attempt_at' => now()]);
    }
}
