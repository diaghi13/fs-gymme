<?php

namespace App\Http\Controllers\Application\Sales;

use App\Models\Sale\Sale;
use Illuminate\Http\JsonResponse;

class DebugSaleStatusController
{
    public function __invoke(Sale $sale): JsonResponse
    {
        return response()->json([
            'sale_id' => $sale->id,
            'progressive_number' => $sale->progressive_number,
            'status' => $sale->status,
            'status_type' => gettype($sale->status),
            'has_electronic_invoice' => $sale->electronic_invoice ? 'YES' : 'NO',
            'can_generate' => ! in_array($sale->status, ['draft', 'canceled']),
            'all_statuses' => [
                'draft' => 'Bozza',
                'saved' => 'Salvata',
                'sent' => 'Inviata',
                'canceled' => 'Annullata',
            ],
        ]);
    }
}

