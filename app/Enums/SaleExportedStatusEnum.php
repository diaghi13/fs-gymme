<?php

namespace App\Enums;

enum SaleExportedStatusEnum: string
{
    case PENDING = 'pending';
    case EXPORTED = 'exported';
    case NOT_EXPORTED = 'not_exported';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => __('Pending'),
            self::EXPORTED => __('Exported'),
            self::NOT_EXPORTED => __('Not exported'),
        };
    }
}
