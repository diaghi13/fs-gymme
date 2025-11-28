<?php

use App\Models\CentralUser;
use App\Models\Customer\Customer;
use App\Models\Tenant;
use App\Models\User;
use App\Services\Customer\CustomerService;

beforeEach(function () {
    $this->service = app(CustomerService::class);
});

test('creates new customer with user and central user', function () {
    $tenant = $this->createTenantWithDatabase();

    $this->initializeTenancy($tenant);

    $data = [
        'first_name' => 'Mario',
        'last_name' => 'Rossi',
        'email' => 'mario.rossi@example.com',
        'phone' => '3331234567',
        'birth_date' => '1990-01-15',
        'gender' => 'M',
        'birthplace' => 'Roma',
        'tax_id_code' => 'RSSMRA90A15H501Z',
        'street' => 'Via Roma',
        'number' => '123',
        'city' => 'Milano',
        'zip' => '20100',
        'province' => 'MI',
        'country' => 'IT',
        'gdpr_consent' => true,
        'marketing_consent' => false,
    ];

    $customer = $this->service->createWithUser($data, $tenant);

    expect($customer)->toBeInstanceOf(Customer::class)
        ->and($customer->email)->toBe('mario.rossi@example.com')
        ->and($customer->first_name)->toBe('Mario')
        ->and($customer->last_name)->toBe('Rossi')
        ->and($customer->user)->not->toBeNull()
        ->and($customer->user->email)->toBe('mario.rossi@example.com');

    // Verify CentralUser was created
    $centralUser = tenancy()->central(fn () => CentralUser::where('email', 'mario.rossi@example.com')->first());
    expect($centralUser)->not->toBeNull()
        ->and($centralUser->email)->toBe('mario.rossi@example.com');

    // Verify tenant is attached to CentralUser
    $hasAttachment = tenancy()->central(fn () => $centralUser->tenants()->where('tenant_id', $tenant->id)->exists());
    expect($hasAttachment)->toBeTrue();
});

test('reuses existing central user when email already exists', function () {
    $tenant1 = $this->createTenantWithDatabase();
    $tenant2 = $this->createTenantWithDatabase();

    // Create customer in first tenant
    $this->initializeTenancy($tenant1);

    $data = [
        'first_name' => 'Luigi',
        'last_name' => 'Verdi',
        'email' => 'luigi.verdi@example.com',
        'phone' => '3337654321',
        'birth_date' => '1985-05-20',
        'gender' => 'M',
        'tax_id_code' => 'VRDLGU85E20F205X',
        'gdpr_consent' => true,
    ];

    $customer1 = $this->service->createWithUser($data, $tenant1);
    $centralUserId = tenancy()->central(fn () => CentralUser::where('email', 'luigi.verdi@example.com')->value('id'));

    // Create customer with same email in second tenant
    $this->initializeTenancy($tenant2);

    $customer2 = $this->service->createWithUser($data, $tenant2);

    // Verify same CentralUser is used
    $centralUserId2 = tenancy()->central(fn () => CentralUser::where('email', 'luigi.verdi@example.com')->value('id'));
    expect($centralUserId)->toBe($centralUserId2);

    // Verify both tenants are attached to same CentralUser
    $centralUser = tenancy()->central(fn () => CentralUser::find($centralUserId));
    $tenantIds = tenancy()->central(fn () => $centralUser->tenants()->pluck('tenant_id')->toArray());

    expect($tenantIds)->toContain($tenant1->id, $tenant2->id);

    // Verify separate User and Customer records in each tenant
    expect($customer1->id)->not->toBe($customer2->id)
        ->and($customer1->user_id)->not->toBe($customer2->user_id);
});

test('email uniqueness is enforced per tenant', function () {
    $tenant = $this->createTenantWithDatabase();
    $this->initializeTenancy($tenant);

    $data = [
        'first_name' => 'Paolo',
        'last_name' => 'Bianchi',
        'email' => 'paolo.bianchi@example.com',
        'phone' => '3339876543',
        'tax_id_code' => 'BNCPLA80M01F205Y',
        'gdpr_consent' => true,
    ];

    // Create first customer
    $customer1 = $this->service->createWithUser($data, $tenant);
    expect($customer1)->toBeInstanceOf(Customer::class);

    // Check email availability - should return false
    $available = $this->service->isEmailAvailable('paolo.bianchi@example.com');
    expect($available)->toBeFalse();

    // Check different email - should return true
    $available2 = $this->service->isEmailAvailable('new.email@example.com');
    expect($available2)->toBeTrue();
});

test('calculates tax code placeholder', function () {
    $data = [
        'first_name' => 'Giovanni',
        'last_name' => 'Neri',
        'birth_date' => '1995-03-10',
    ];

    $taxCode = $this->service->calculateTaxCode($data);

    expect($taxCode)->toBeString()
        ->and(strlen($taxCode))->toBeGreaterThan(0);
});

test('creates customer with gdpr consents correctly timestamped', function () {
    $tenant = $this->createTenantWithDatabase();
    $this->initializeTenancy($tenant);

    $data = [
        'first_name' => 'Anna',
        'last_name' => 'Gialli',
        'email' => 'anna.gialli@example.com',
        'phone' => '3332223333',
        'tax_id_code' => 'GLLNNA88D50F205K',
        'gdpr_consent' => true,
        'marketing_consent' => true,
        'photo_consent' => true,
        'medical_data_consent' => false,
    ];

    $customer = $this->service->createWithUser($data, $tenant);

    expect($customer->gdpr_consent)->toBeTrue()
        ->and($customer->gdpr_consent_at)->not->toBeNull()
        ->and($customer->marketing_consent)->toBeTrue()
        ->and($customer->marketing_consent_at)->not->toBeNull()
        ->and($customer->photo_consent)->toBeTrue()
        ->and($customer->medical_data_consent)->toBeFalse()
        ->and($customer->data_retention_until)->not->toBeNull();
});

test('creates customer with company data', function () {
    $tenant = $this->createTenantWithDatabase();
    $this->initializeTenancy($tenant);

    $data = [
        'first_name' => 'Roberto',
        'last_name' => 'Amministratore',
        'company_name' => 'Palestra Fitness SRL',
        'email' => 'info@palestrafitnessrl.it',
        'phone' => '0212345678',
        'tax_id_code' => 'MMNRRT75C15F205L',
        'vat_number' => '12345678901',
        'gdpr_consent' => true,
    ];

    $customer = $this->service->createWithUser($data, $tenant);

    expect($customer->company_name)->toBe('Palestra Fitness SRL')
        ->and($customer->vat_number)->toBe('12345678901');
});
