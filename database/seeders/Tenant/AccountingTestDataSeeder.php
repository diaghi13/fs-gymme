<?php

namespace Database\Seeders\Tenant;

use App\Enums\SaleStatusEnum;
use App\Models\Customer\Customer;
use App\Models\Sale\Payment;
use App\Models\Sale\Sale;
use App\Models\Sale\SaleRow;
use App\Models\Support\PaymentMethod;
use App\Models\VatRate;
use Illuminate\Database\Seeder;

class AccountingTestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Generates test data for accounting features:
     * - 50 sales in the last 60 days
     * - Mix of paid and unpaid sales
     * - 15 overdue payments
     * - 10 payments due in next 7 days
     */
    public function run(): void
    {
        $this->command->info('🌱 Seeding accounting test data...');

        // Get or create customers
        $customers = Customer::factory(10)->create();
        $this->command->info('   ✓ Created 10 test customers');

        // Get or create payment methods
        $paymentMethods = PaymentMethod::all();
        if ($paymentMethods->isEmpty()) {
            $this->command->warn('   ⚠ No payment methods found. Please seed payment methods first.');

            return;
        }

        // Get financial resources
        $financialResources = \App\Models\Support\FinancialResource::all();
        if ($financialResources->isEmpty()) {
            $this->command->warn('   ⚠ No financial resources found. Please seed financial resources first.');

            return;
        }

        // Get payment conditions
        $paymentConditions = \App\Models\Support\PaymentCondition::all();
        if ($paymentConditions->isEmpty()) {
            $this->command->warn('   ⚠ No payment conditions found. Please seed payment conditions first.');

            return;
        }

        // Get a VAT rate for sale rows
        $vatRate = VatRate::first();
        if (! $vatRate) {
            $this->command->warn('   ⚠ No VAT rates found. Please seed VAT rates first.');

            return;
        }

        // Get a price list for sale rows
        $priceList = \App\Models\PriceList\PriceList::first();
        if (! $priceList) {
            $this->command->warn('   ⚠ No price lists found. Please seed price lists first.');

            return;
        }

        $salesCreated = 0;
        $paymentsCreated = 0;
        $overduePayments = 0;
        $upcomingPayments = 0;

        // Generate 50 sales over the last 60 days
        for ($i = 0; $i < 50; $i++) {
            $daysAgo = rand(0, 60);
            $saleDate = now()->subDays($daysAgo);

            $sale = Sale::create([
                'date' => $saleDate,
                'year' => $saleDate->year,
                'customer_id' => $customers->random()->id,
                'financial_resource_id' => $financialResources->random()->id,
                'payment_condition_id' => $paymentConditions->random()->id,
                'status' => SaleStatusEnum::SAVED,
                'payment_status' => 'pending',
                'accounting_status' => 'pending',
                'exported_status' => 'pending',
                'electronic_invoice_status' => 'draft',
                'currency' => 'EUR',
                'tax_included' => true,
                'progressive_number' => 'FAT-'.str_pad($i + 1, 5, '0', STR_PAD_LEFT),
            ]);

            $salesCreated++;

            // Create a sale row to give the sale a total
            $unitPrice = rand(50, 500) * 100; // Random price between 50€ and 500€ in cents
            $quantity = rand(1, 3);
            $totalNet = $unitPrice * $quantity;
            $vatAmount = intval($totalNet * ($vatRate->percentage / 100));
            $totalGross = $totalNet + $vatAmount;

            SaleRow::create([
                'sale_id' => $sale->id,
                'price_list_id' => $priceList->id,
                'description' => 'Abbonamento palestra',
                'quantity' => $quantity,
                'unit_price_net' => $unitPrice,
                'unit_price_gross' => $unitPrice + intval($unitPrice * ($vatRate->percentage / 100)),
                'percentage_discount' => 0,
                'absolute_discount' => 0,
                'vat_rate_id' => $vatRate->id,
                'vat_amount' => $vatAmount,
                'total_net' => $totalNet,
                'total_gross' => $totalGross,
            ]);

            // Randomly decide if this sale has payments
            $hasPayments = rand(1, 100) > 30; // 70% have payments

            if ($hasPayments) {
                // Random amount between 50€ and 500€
                $totalAmount = rand(50, 500) * 100; // in cents
                $numberOfInstallments = rand(1, 3);
                $amountPerInstallment = intval($totalAmount / $numberOfInstallments);

                for ($j = 0; $j < $numberOfInstallments; $j++) {
                    // Calculate due date
                    $dueDate = $saleDate->copy()->addDays(30 * ($j + 1));

                    // Decide payment status
                    $isPaid = null;
                    $payedAt = null;

                    // Create overdue payments (15 target)
                    if ($overduePayments < 15 && $dueDate->isPast() && rand(1, 100) > 50) {
                        // Leave as unpaid (overdue)
                        $overduePayments++;
                    }
                    // Create upcoming payments (10 target)
                    elseif ($upcomingPayments < 10 && $dueDate->isFuture() && $dueDate->diffInDays(now()) <= 7) {
                        // Leave as unpaid (upcoming)
                        $upcomingPayments++;
                    }
                    // Otherwise, randomly pay it
                    elseif (rand(1, 100) > 40) {
                        $isPaid = true;
                        $payedAt = $dueDate->copy()->addDays(rand(-5, 10));
                    }

                    Payment::create([
                        'sale_id' => $sale->id,
                        'due_date' => $dueDate,
                        'amount' => $amountPerInstallment,
                        'payment_method_id' => $paymentMethods->random()->id,
                        'payed_at' => $payedAt,
                    ]);

                    $paymentsCreated++;
                }
            }
        }

        $this->command->info("   ✓ Created $salesCreated sales");
        $this->command->info("   ✓ Created $paymentsCreated payments");
        $this->command->info("   ✓ $overduePayments overdue payments");
        $this->command->info("   ✓ $upcomingPayments upcoming payments (next 7 days)");
        $this->command->info('✅ Accounting test data seeded successfully!');
    }
}
