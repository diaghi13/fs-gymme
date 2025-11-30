<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CompletePaymentMethodsSeeder extends Seeder
{
    /**
     * Seed all 23 official FatturaPA payment methods.
     * These codes are defined by the Italian Revenue Agency (Agenzia delle Entrate)
     * for electronic invoicing.
     */
    public function run(): void
    {
        $paymentMethods = [
            ['code' => 'MP01', 'description' => 'Contanti', 'order' => 1],
            ['code' => 'MP02', 'description' => 'Assegno', 'order' => 2],
            ['code' => 'MP03', 'description' => 'Assegno circolare', 'order' => 3],
            ['code' => 'MP04', 'description' => 'Contanti presso Tesoreria', 'order' => 4],
            ['code' => 'MP05', 'description' => 'Bonifico', 'order' => 5],
            ['code' => 'MP06', 'description' => 'Vaglia cambiario', 'order' => 6],
            ['code' => 'MP07', 'description' => 'Bollettino bancario', 'order' => 7],
            ['code' => 'MP08', 'description' => 'Carta di pagamento', 'order' => 8],
            ['code' => 'MP09', 'description' => 'RID', 'order' => 9],
            ['code' => 'MP10', 'description' => 'RID utenze', 'order' => 10],
            ['code' => 'MP11', 'description' => 'RID veloce', 'order' => 11],
            ['code' => 'MP12', 'description' => 'RIBA', 'order' => 12],
            ['code' => 'MP13', 'description' => 'MAV', 'order' => 13],
            ['code' => 'MP14', 'description' => 'Quietanza erario', 'order' => 14],
            ['code' => 'MP15', 'description' => 'Giroconto su conti di contabilità speciale', 'order' => 15],
            ['code' => 'MP16', 'description' => 'Domiciliazione bancaria', 'order' => 16],
            ['code' => 'MP17', 'description' => 'Domiciliazione postale', 'order' => 17],
            ['code' => 'MP18', 'description' => 'Bollettino di c/c postale', 'order' => 18],
            ['code' => 'MP19', 'description' => 'SEPA Direct Debit', 'order' => 19],
            ['code' => 'MP20', 'description' => 'SEPA Direct Debit CORE', 'order' => 20],
            ['code' => 'MP21', 'description' => 'SEPA Direct Debit B2B', 'order' => 21],
            ['code' => 'MP22', 'description' => 'Trattenuta su somme già riscosse', 'order' => 22],
            ['code' => 'MP23', 'description' => 'PagoPA', 'order' => 23],
        ];

        foreach ($paymentMethods as $method) {
            DB::table('payment_methods')->updateOrInsert(
                ['code' => $method['code']],
                [
                    'description' => $method['description'],
                    'code' => $method['code'],
                    'order' => $method['order'],
                    'is_active' => true,
                    'is_system' => true,
                    'updated_at' => now(),
                    'created_at' => DB::raw('COALESCE(created_at, NOW())'),
                ]
            );
        }
    }
}
