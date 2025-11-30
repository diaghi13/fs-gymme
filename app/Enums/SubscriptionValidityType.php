<?php

namespace App\Enums;

enum SubscriptionValidityType: string
{
    case SUBSCRIPTION_PERIOD = 'subscription_period'; // valido per tutta la durata dell'abbonamento
    case FIXED_DAYS = 'fixed_days'; // valido per X giorni dalla data di inizio
    case CALENDAR_MONTH = 'calendar_month'; // valido per il mese di calendario
}
