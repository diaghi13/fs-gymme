<?php

namespace App\Enums;

enum PriceListItemTypeEnum: string
{
    case FOLDER = 'folder';
    case SUBSCRIPTION = 'subscription';
    case ARTICLE = 'article';
    case MEMBERSHIP = 'membership';
    case BUNDLE = 'bundle';

    public function getLabel(): string
    {
        return match ($this) {
            self::FOLDER => 'Folder',
            self::SUBSCRIPTION => 'Subscription',
            self::ARTICLE => 'Article',
            self::MEMBERSHIP => 'Membership',
            self::BUNDLE => 'Bundle',
        };
    }
}
