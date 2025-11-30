<?php

use App\Models\Customer\Customer;
use App\Models\Customer\SportsRegistration;
use App\Models\User;

beforeEach(function () {
    $this->tenant = $this->createTenantWithDatabase();
    $this->initializeTenancy($this->tenant);

    $this->user = User::factory()->create();
    $this->actingAs($this->user, 'sanctum');
});

test('can list customer sports registrations', function () {
    $customer = Customer::factory()->create();

    SportsRegistration::factory()->count(3)->create([
        'customer_id' => $customer->id,
    ]);

    $response = $this->getJson(route('api.v1.customers.sports-registrations.index', [
        'customer' => $customer->id,
    ]));

    $response->assertSuccessful()
        ->assertJsonCount(3, 'registrations');
});

test('can create new sports registration', function () {
    $customer = Customer::factory()->create();

    $data = [
        'organization' => 'ASI - Associazioni Sportive Sociali Italiane',
        'membership_number' => 'ASI123456',
        'start_date' => now()->format('Y-m-d'),
        'end_date' => now()->addYear()->format('Y-m-d'),
        'notes' => 'Tesseramento annuale',
    ];

    $response = $this->postJson(route('api.v1.customers.sports-registrations.store', [
        'customer' => $customer->id,
    ]), $data);

    $response->assertSuccessful()
        ->assertJson([
            'message' => 'Tesseramento creato con successo',
        ]);

    $this->assertDatabaseHas('sports_registrations', [
        'customer_id' => $customer->id,
        'organization' => 'ASI - Associazioni Sportive Sociali Italiane',
        'membership_number' => 'ASI123456',
        'status' => 'active',
    ]);
});

test('validates required fields on create', function () {
    $customer = Customer::factory()->create();

    $response = $this->postJson(route('api.v1.customers.sports-registrations.store', [
        'customer' => $customer->id,
    ]), []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['organization', 'start_date', 'end_date']);
});

test('validates end date is after start date', function () {
    $customer = Customer::factory()->create();

    $data = [
        'organization' => 'CONI',
        'start_date' => now()->format('Y-m-d'),
        'end_date' => now()->subDay()->format('Y-m-d'), // Before start_date
    ];

    $response = $this->postJson(route('api.v1.customers.sports-registrations.store', [
        'customer' => $customer->id,
    ]), $data);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['end_date']);
});

test('can update existing registration', function () {
    $customer = Customer::factory()->create();
    $registration = SportsRegistration::factory()->create([
        'customer_id' => $customer->id,
        'organization' => 'ASI',
    ]);

    $data = [
        'organization' => 'CONI - Comitato Olimpico Nazionale Italiano',
        'membership_number' => 'CONI789',
        'start_date' => $registration->start_date,
        'end_date' => $registration->end_date,
        'status' => 'active',
        'notes' => 'Aggiornato',
    ];

    $response = $this->putJson(route('api.v1.customers.sports-registrations.update', [
        'customer' => $customer->id,
        'registration' => $registration->id,
    ]), $data);

    $response->assertSuccessful()
        ->assertJson([
            'message' => 'Tesseramento aggiornato con successo',
        ]);

    $registration->refresh();
    expect($registration->organization)->toBe('CONI - Comitato Olimpico Nazionale Italiano')
        ->and($registration->membership_number)->toBe('CONI789')
        ->and($registration->notes)->toBe('Aggiornato');
});

test('can delete registration', function () {
    $customer = Customer::factory()->create();
    $registration = SportsRegistration::factory()->create([
        'customer_id' => $customer->id,
    ]);

    $response = $this->deleteJson(route('api.v1.customers.sports-registrations.destroy', [
        'customer' => $customer->id,
        'registration' => $registration->id,
    ]));

    $response->assertSuccessful()
        ->assertJson([
            'message' => 'Tesseramento eliminato con successo',
        ]);

    $this->assertDatabaseMissing('sports_registrations', [
        'id' => $registration->id,
    ]);
});

test('cannot access registration from different customer', function () {
    $customer1 = Customer::factory()->create();
    $customer2 = Customer::factory()->create();

    $registration = SportsRegistration::factory()->create([
        'customer_id' => $customer1->id,
    ]);

    $response = $this->getJson(route('api.v1.customers.sports-registrations.show', [
        'customer' => $customer2->id,
        'registration' => $registration->id,
    ]));

    $response->assertNotFound();
});

test('registrations are ordered by end date descending', function () {
    $customer = Customer::factory()->create();

    $reg1 = SportsRegistration::factory()->create([
        'customer_id' => $customer->id,
        'end_date' => now()->addMonths(3),
        'organization' => 'Oldest',
    ]);

    $reg2 = SportsRegistration::factory()->create([
        'customer_id' => $customer->id,
        'end_date' => now()->addYear(),
        'organization' => 'Newest',
    ]);

    $reg3 = SportsRegistration::factory()->create([
        'customer_id' => $customer->id,
        'end_date' => now()->addMonths(6),
        'organization' => 'Middle',
    ]);

    $response = $this->getJson(route('api.v1.customers.sports-registrations.index', [
        'customer' => $customer->id,
    ]));

    $response->assertSuccessful();

    $registrations = $response->json('registrations');
    expect($registrations[0]['organization'])->toBe('Newest')
        ->and($registrations[1]['organization'])->toBe('Middle')
        ->and($registrations[2]['organization'])->toBe('Oldest');
});
