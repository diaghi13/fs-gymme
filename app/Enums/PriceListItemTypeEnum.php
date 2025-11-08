<?php

namespace App\Enums;

enum PriceListItemTypeEnum: string
{
    case FOLDER = 'folder';
    case SUBSCRIPTION = 'subscription';
    case ARTICLE = 'article';
    case MEMBERSHIP = 'membership';
    case BUNDLE = 'bundle';
    case DAY_PASS = 'day_pass';
    case TOKEN = 'token';
    case GIFT_CARD = 'gift_card';

    public function getLabel(): string
    {
        return match ($this) {
            self::FOLDER => 'Folder',
            self::SUBSCRIPTION => 'Subscription',
            self::ARTICLE => 'Article',
            self::MEMBERSHIP => 'Membership',
            self::BUNDLE => 'Bundle',
            self::DAY_PASS => 'Day Pass',
            self::TOKEN => 'Token',
            self::GIFT_CARD => 'Gift Card',
        };
    }
}
