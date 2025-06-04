<?php

namespace App\Enums;

enum SaleStatusEnum: string
{
    case DRAFT = 'draft';
    case SAVED = 'saved';
    case SENT = 'sent';
    case CANCELED = 'canceled';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => __('Draft'),
            self::SAVED => __('Saved'),
            self::SENT => __('Sent'),
            self::CANCELED => __('Canceled'),
        };
    }
}
