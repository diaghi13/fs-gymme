<?php

namespace Database\Seeders\Tenant;

use App\Models\Support\PaymentCondition;
use App\Models\Support\PaymentConditionInstallment;
use App\Models\Support\PaymentMethod;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaymentConditionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $paymentMethods = PaymentMethod::all()
            ->map(fn ($paymentMethod) => ([
                'id' => $paymentMethod->id, 'label' => $paymentMethod->label,
            ]));

        // dd($paymentMethods);
        // dd($this->getPaymentMethodId($paymentMethods, $this->getPaymentMethodId($paymentMethods, "MP01 - Contanti")));

        // Truncate table payment_conditions
        // set foreign key checks to false
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        PaymentCondition::query()->truncate();
        PaymentConditionInstallment::query()->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        PaymentCondition::query()->create(
            [
                'description' => 'A vista',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP01 - Contanti'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 0]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Assegni bancari',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP02 - Assegno'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 0]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Assegni circolari',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP03 - Assegno circolare'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 0]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico 120 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 1,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 120]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico 15 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 15]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico 180 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 180]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico 180 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 1,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 180]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico 30 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 30]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico 30 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 1,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 30]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico 30-60 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 2,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 30]),
            new PaymentConditionInstallment(['days' => 60]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico 30-60 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 2,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 30]),
            new PaymentConditionInstallment(['days' => 60]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico 30-60-90 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 3,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 30]),
            new PaymentConditionInstallment(['days' => 60]),
            new PaymentConditionInstallment(['days' => 90]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico 30-60-90 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 3,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 30]),
            new PaymentConditionInstallment(['days' => 60]),
            new PaymentConditionInstallment(['days' => 90]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico 30-60-90-120 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 4,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 30]),
            new PaymentConditionInstallment(['days' => 60]),
            new PaymentConditionInstallment(['days' => 90]),
            new PaymentConditionInstallment(['days' => 120]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico 30-60-90-120 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 4,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 30]),
            new PaymentConditionInstallment(['days' => 60]),
            new PaymentConditionInstallment(['days' => 90]),
            new PaymentConditionInstallment(['days' => 120]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico 45 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 45]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico 45 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 1,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 45]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico 60 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 60]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico 60 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 1,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 60]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico 60-90 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 2,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 60]),
            new PaymentConditionInstallment(['days' => 90]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico 60-90 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 2,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 60]),
            new PaymentConditionInstallment(['days' => 90]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico 60-90-120 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 3,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 60]),
            new PaymentConditionInstallment(['days' => 90]),
            new PaymentConditionInstallment(['days' => 120]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico 60-90-120 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 3,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 60]),
            new PaymentConditionInstallment(['days' => 90]),
            new PaymentConditionInstallment(['days' => 120]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico 90 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 90]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico 90 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 1,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 90]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico 90-120 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 2,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 90]),
            new PaymentConditionInstallment(['days' => 120]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico 90-120 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 2,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 90]),
            new PaymentConditionInstallment(['days' => 120]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico a vista fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 0]),
        ]);
        // TODO: check for manual expiration
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico data scadenza',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'end_of_month' => false,
            ]
        );
        PaymentCondition::query()->create(
            [
                'description' => 'Bonifico fine mese data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 1,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 0]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Carta di credito',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP08 - Carta di pagamento'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 0]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Contanti',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP01 - Contanti'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 0]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Contrassegno',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP01 - Contanti'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        );
        PaymentCondition::query()->create(
            [
                'description' => 'Pagamento effettuato con assegno',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP02 - Assegno'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 0]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Pagamento effettuato con bonifico',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP05 - Bonifico'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 0]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Pagamento effettuato in contanti',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP01 - Contanti'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 0]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Pagamento POS',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP16 - Domiciliazione bancaria'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 0]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'Paypal',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP08 - Carta di pagamento'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 0]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 100 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 100]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 120 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 120]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 120 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 1,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 120]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 180 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 180]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 180 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 1,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 180]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 30 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 30]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 30 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 1,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 30]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 30-60 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 2,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 30]),
            new PaymentConditionInstallment(['days' => 60]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 30-60 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 2,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 30]),
            new PaymentConditionInstallment(['days' => 60]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 30-60-90 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 3,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 30]),
            new PaymentConditionInstallment(['days' => 60]),
            new PaymentConditionInstallment(['days' => 90]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 30-60-90 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 3,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 30]),
            new PaymentConditionInstallment(['days' => 60]),
            new PaymentConditionInstallment(['days' => 90]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 30-60-90-120 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 4,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 30]),
            new PaymentConditionInstallment(['days' => 60]),
            new PaymentConditionInstallment(['days' => 90]),
            new PaymentConditionInstallment(['days' => 120]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 30-60-90-120 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 4,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 30]),
            new PaymentConditionInstallment(['days' => 60]),
            new PaymentConditionInstallment(['days' => 90]),
            new PaymentConditionInstallment(['days' => 120]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 35 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 35]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 40 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 40]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 45 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 45]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 45 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 1,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 45]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 45-75 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 2,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 45]),
            new PaymentConditionInstallment(['days' => 75]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 45-75 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 2,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 45]),
            new PaymentConditionInstallment(['days' => 75]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 60 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 60]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 60 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 1,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 60]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 60-90 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 2,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 60]),
            new PaymentConditionInstallment(['days' => 90]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 60-90 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 2,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 60]),
            new PaymentConditionInstallment(['days' => 90]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 60-90-120 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 3,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 60]),
            new PaymentConditionInstallment(['days' => 90]),
            new PaymentConditionInstallment(['days' => 120]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 60-90-120 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 3,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 60]),
            new PaymentConditionInstallment(['days' => 90]),
            new PaymentConditionInstallment(['days' => 120]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 85 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 85]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 85 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 1,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 85]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 90 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 90]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 90 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 1,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 90]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 90-120 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 2,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 90]),
            new PaymentConditionInstallment(['days' => 120]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. 90-120 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 2,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 90]),
            new PaymentConditionInstallment(['days' => 120]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'RI.BA. data fattura fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
                'number_of_installments' => 1,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 0]),
        ]);
        PaymentCondition::query()->create([
            'description' => 'RI.BA. data scadenza',
            'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP12 - Riba'),
            'end_of_month' => false,
        ]
        );
        PaymentCondition::query()->create(
            [
                'description' => 'Rimessa diretta',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP01 - Contanti'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 0]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'SDD 30 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP19 - SEPA Direct Debit'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 30]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'SDD 30 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP19 - SEPA Direct Debit'),
                'number_of_installments' => 1,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 30]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'SDD 30-60 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP19 - SEPA Direct Debit'),
                'number_of_installments' => 2,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 30]),
            new PaymentConditionInstallment(['days' => 60]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'SDD 30-60 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP19 - SEPA Direct Debit'),
                'number_of_installments' => 2,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 30]),
            new PaymentConditionInstallment(['days' => 60]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'SDD 30-60-90 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP19 - SEPA Direct Debit'),
                'number_of_installments' => 3,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 30]),
            new PaymentConditionInstallment(['days' => 60]),
            new PaymentConditionInstallment(['days' => 90]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'SDD 30-60-90 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP19 - SEPA Direct Debit'),
                'number_of_installments' => 3,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 30]),
            new PaymentConditionInstallment(['days' => 60]),
            new PaymentConditionInstallment(['days' => 90]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'SDD 30-60-90-120 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP19 - SEPA Direct Debit'),
                'number_of_installments' => 4,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 30]),
            new PaymentConditionInstallment(['days' => 60]),
            new PaymentConditionInstallment(['days' => 90]),
            new PaymentConditionInstallment(['days' => 120]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'SDD 30-60-90-120 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP19 - SEPA Direct Debit'),
                'number_of_installments' => 4,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 30]),
            new PaymentConditionInstallment(['days' => 60]),
            new PaymentConditionInstallment(['days' => 90]),
            new PaymentConditionInstallment(['days' => 120]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'SDD 45 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP19 - SEPA Direct Debit'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 45]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'SDD 45 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP19 - SEPA Direct Debit'),
                'number_of_installments' => 1,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 45]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'SDD 60 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP19 - SEPA Direct Debit'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 60]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'SDD 60 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP19 - SEPA Direct Debit'),
                'number_of_installments' => 1,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 60]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'SDD 60-90 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP19 - SEPA Direct Debit'),
                'number_of_installments' => 2,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 60]),
            new PaymentConditionInstallment(['days' => 90]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'SDD 60-90 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP19 - SEPA Direct Debit'),
                'number_of_installments' => 2,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 60]),
            new PaymentConditionInstallment(['days' => 90]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'SDD 90 gg data fattura',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP19 - SEPA Direct Debit'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 90]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'SDD 90 gg fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP19 - SEPA Direct Debit'),
                'number_of_installments' => 1,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 90]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'SDD data fattura fine mese',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP19 - SEPA Direct Debit'),
                'number_of_installments' => 1,
                'end_of_month' => true,
            ]
        )->installments()->saveMany([
            new PaymentConditionInstallment(['days' => 0]),
        ]);
        PaymentCondition::query()->create(
            [
                'description' => 'SDD data scadenza',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP19 - SEPA Direct Debit'),
                'number_of_installments' => 1,
                'end_of_month' => false,
            ]
        );
        PaymentCondition::query()->create(
            [
                'description' => 'Trattenuta su somme già riscosse',
                'payment_method_id' => $this->getPaymentMethodId($paymentMethods, 'MP22 - Trattenuta su somme già riscosse'),
                'number_of_installments' => 0,
                'end_of_month' => false,
            ]
        );
    }

    protected function getPaymentMethodId($paymentMethods, $string)
    {
        return $paymentMethods->filter(fn ($paymentMethod) => strtolower($paymentMethod['label']) === strtolower($string))->first()['id'];
    }
}
