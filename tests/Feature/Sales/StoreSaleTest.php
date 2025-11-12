<?php

use App\Models\Customer\Customer;
use App\Models\PriceList\Article;
use App\Models\Support\DocumentTypeElectronicInvoice;
use App\Models\Support\PaymentCondition;
use App\Models\Support\PaymentMethod;
use App\Models\Tenant;
use App\Models\User;
use App\Models\VatRate;

beforeEach(function () {
    // Create tenant with database
    $this->tenant = $this->createTenantWithDatabase();

    // Initialize tenancy context
    $this->initializeTenancy($this->tenant);

    // Create structure (required for many entities)
    $this->structure = \App\Models\Structure::create([
        'name' => 'Test Structure',
        'address' => 'Test Address',
    ]);

    // Create necessary support data
    \App\Models\VatRate::create(['name' => '22%', 'code' => '22', 'percentage' => 22]);

    \App\Models\Support\DocumentTypeElectronicInvoice::create([
        'code' => 'TD01',
        'description' => 'Fattura',
    ]);

    \App\Models\Support\PaymentMethod::create([
        'name' => 'Contanti',
        'code' => 'MP01',
        'description' => 'Pagamento in contanti',
    ]);

    \App\Models\Support\PaymentCondition::create([
        'name' => 'Pagamento immediato',
        'code' => 'TP02',
        'description' => 'Pagamento immediato',
    ]);

    // End tenancy to create central user
    $this->endTenancy();

    // Create user with tenant using the TestCase helper
    $this->centralUser = $this->createUserForTenant($this->tenant);

    // Re-initialize tenancy and get tenant user
    $this->initializeTenancy($this->tenant);
    $this->user = User::where('global_id', $this->centralUser->global_id)->first();
});

afterEach(function () {
    $this->endTenancy();
});

test('can create a sale with article', function () {
    $customer = Customer::factory()->create();
    $documentType = DocumentTypeElectronicInvoice::where('code', 'TD01')->first();
    $paymentCondition = PaymentCondition::first();
    $paymentMethod = PaymentMethod::first();
    $vatRate = VatRate::first();

    $article = Article::create([
        'name' => 'Test Article',
        'price' => 100,
        'vat_rate_id' => $vatRate->id,
        'type' => 'article',
    ]);

    $data = [
        'document_type_id' => $documentType->id,
        'progressive_number' => '0001',
        'date' => now()->format('Y-m-d'),
        'year' => now()->year,
        'customer_id' => $customer->id,
        'payment_condition_id' => $paymentCondition->id,
        'status' => 'draft',
        'discount_percentage' => 0,
        'discount_absolute' => 0,
        'sale_rows' => [
            [
                'price_list_id' => $article->id,
                'quantity' => 1,
                'unit_price' => 100,
                'percentage_discount' => 0,
                'absolute_discount' => 0,
            ],
        ],
        'payments' => [
            [
                'due_date' => now()->format('Y-m-d'),
                'amount' => 100,
                'payment_method_id' => $paymentMethod->id,
            ],
        ],
    ];

    $response = $this->actingAs($this->user)
        ->withSession(['current_tenant_id' => $this->tenant->id])
        ->postJson(route('app.sales.store', ['tenant' => $this->tenant->id]), $data);

    $response->assertRedirect();
    $this->assertDatabaseHas('sales', [
        'customer_id' => $customer->id,
        'progressive_number' => '0001',
    ]);
});

test('validates required fields', function () {
    $response = $this->actingAs($this->user)
        ->withSession(['current_tenant_id' => $this->tenant->id])
        ->postJson(route('app.sales.store', ['tenant' => $this->tenant->id]), []);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors([
        'document_type_id',
        'progressive_number',
        'date',
        'year',
        'customer_id',
        'payment_condition_id',
        'status',
        'sale_rows',
        'payments',
    ]);
});

test('validates sale_rows is required array', function () {
    $customer = Customer::factory()->create();
    $documentType = DocumentTypeElectronicInvoice::where('code', 'TD01')->first();
    $paymentCondition = PaymentCondition::first();
    $paymentMethod = PaymentMethod::first();

    $data = [
        'document_type_id' => $documentType->id,
        'progressive_number' => '0001',
        'date' => now()->format('Y-m-d'),
        'year' => now()->year,
        'customer_id' => $customer->id,
        'payment_condition_id' => $paymentCondition->id,
        'status' => 'draft',
        'sale_rows' => [],
        'payments' => [
            [
                'due_date' => now()->format('Y-m-d'),
                'amount' => 100,
                'payment_method_id' => $paymentMethod->id,
            ],
        ],
    ];

    $response = $this->actingAs($this->user)
        ->withSession(['current_tenant_id' => $this->tenant->id])
        ->postJson(route('app.sales.store', ['tenant' => $this->tenant->id]), $data);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['sale_rows']);
});

test('validates payments is required array', function () {
    $customer = Customer::factory()->create();
    $documentType = DocumentTypeElectronicInvoice::where('code', 'TD01')->first();
    $paymentCondition = PaymentCondition::first();
    $vatRate = VatRate::first();

    $article = Article::create([
        'name' => 'Test Article',
        'price' => 100,
        'vat_rate_id' => $vatRate->id,
        'type' => 'article',
    ]);

    $data = [
        'document_type_id' => $documentType->id,
        'progressive_number' => '0001',
        'date' => now()->format('Y-m-d'),
        'year' => now()->year,
        'customer_id' => $customer->id,
        'payment_condition_id' => $paymentCondition->id,
        'status' => 'draft',
        'sale_rows' => [
            [
                'price_list_id' => $article->id,
                'quantity' => 1,
                'unit_price' => 100,
                'percentage_discount' => 0,
                'absolute_discount' => 0,
            ],
        ],
        'payments' => [],
    ];

    $response = $this->actingAs($this->user)
        ->withSession(['current_tenant_id' => $this->tenant->id])
        ->postJson(route('app.sales.store', ['tenant' => $this->tenant->id]), $data);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['payments']);
});
