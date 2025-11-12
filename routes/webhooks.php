<?php

use App\Http\Controllers\Webhooks\FatturaElettronicaApiWebhookController;
use Illuminate\Support\Facades\Route;

Route::post('/fattura-elettronica-api/notifications', FatturaElettronicaApiWebhookController::class)
    ->name('webhooks.fattura-elettronica-api');
