<?php

use App\Models\Customer\Customer;
use App\Models\Customer\CustomerMeasurement;
use App\Models\User;

beforeEach(function () {
    $this->tenant = $this->createTenantWithDatabase();
    $this->initializeTenancy($this->tenant);

    $this->user = User::factory()->create();
    $this->actingAs($this->user, 'sanctum');
});

test('can list customer measurements', function () {
    $customer = Customer::factory()->create();

    CustomerMeasurement::factory()->count(3)->create([
        'customer_id' => $customer->id,
    ]);

    $response = $this->getJson(route('api.v1.customers.measurements.index', [
        'customer' => $customer->id,
    ]));

    $response->assertSuccessful()
        ->assertJsonCount(3, 'measurements');
});

test('can create new measurement', function () {
    $customer = Customer::factory()->create();

    $data = [
        'measured_at' => now()->format('Y-m-d'),
        'weight' => 75.5,
        'height' => 180,
        'chest_circumference' => 95,
        'waist_circumference' => 80,
        'hips_circumference' => 98,
        'arm_circumference' => 35,
        'thigh_circumference' => 55,
        'body_fat_percentage' => 15.5,
        'lean_mass_percentage' => 84.5,
        'notes' => 'Prima misurazione',
    ];

    $response = $this->postJson(route('api.v1.customers.measurements.store', [
        'customer' => $customer->id,
    ]), $data);

    $response->assertSuccessful()
        ->assertJson([
            'message' => 'Misurazione salvata con successo',
        ]);

    $this->assertDatabaseHas('customer_measurements', [
        'customer_id' => $customer->id,
        'weight' => 75.5,
        'height' => 180,
        'measured_by' => $this->user->id,
    ]);
});

test('auto calculates BMI when weight and height provided', function () {
    $customer = Customer::factory()->create();

    $data = [
        'measured_at' => now()->format('Y-m-d'),
        'weight' => 80,
        'height' => 180,
    ];

    $response = $this->postJson(route('api.v1.customers.measurements.store', [
        'customer' => $customer->id,
    ]), $data);

    $response->assertSuccessful();

    $measurement = CustomerMeasurement::where('customer_id', $customer->id)->first();

    // BMI = 80 / (1.8^2) = 24.69
    expect($measurement->bmi)->not->toBeNull()
        ->and($measurement->bmi)->toBeGreaterThan(24)
        ->and($measurement->bmi)->toBeLessThan(25);
});

test('can update existing measurement', function () {
    $customer = Customer::factory()->create();
    $measurement = CustomerMeasurement::factory()->create([
        'customer_id' => $customer->id,
        'weight' => 75,
    ]);

    $data = [
        'measured_at' => $measurement->measured_at,
        'weight' => 76.5,
        'height' => 180,
        'notes' => 'Updated note',
    ];

    $response = $this->putJson(route('api.v1.customers.measurements.update', [
        'customer' => $customer->id,
        'measurement' => $measurement->id,
    ]), $data);

    $response->assertSuccessful()
        ->assertJson([
            'message' => 'Misurazione aggiornata con successo',
        ]);

    $measurement->refresh();
    expect($measurement->weight)->toBe('76.50')
        ->and($measurement->notes)->toBe('Updated note');
});

test('can delete measurement', function () {
    $customer = Customer::factory()->create();
    $measurement = CustomerMeasurement::factory()->create([
        'customer_id' => $customer->id,
    ]);

    $response = $this->deleteJson(route('api.v1.customers.measurements.destroy', [
        'customer' => $customer->id,
        'measurement' => $measurement->id,
    ]));

    $response->assertSuccessful()
        ->assertJson([
            'message' => 'Misurazione eliminata con successo',
        ]);

    $this->assertDatabaseMissing('customer_measurements', [
        'id' => $measurement->id,
    ]);
});

test('cannot access measurement from different customer', function () {
    $customer1 = Customer::factory()->create();
    $customer2 = Customer::factory()->create();

    $measurement = CustomerMeasurement::factory()->create([
        'customer_id' => $customer1->id,
    ]);

    $response = $this->getJson(route('api.v1.customers.measurements.show', [
        'customer' => $customer2->id,
        'measurement' => $measurement->id,
    ]));

    $response->assertNotFound();
});

test('validates measurement data on create', function () {
    $customer = Customer::factory()->create();

    $data = [
        'measured_at' => 'invalid-date',
        'weight' => -10, // Invalid negative
        'body_fat_percentage' => 150, // Invalid > 100
    ];

    $response = $this->postJson(route('api.v1.customers.measurements.store', [
        'customer' => $customer->id,
    ]), $data);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['measured_at', 'weight', 'body_fat_percentage']);
});

test('measurements are ordered by date descending', function () {
    $customer = Customer::factory()->create();

    $measurement1 = CustomerMeasurement::factory()->create([
        'customer_id' => $customer->id,
        'measured_at' => now()->subDays(10),
        'weight' => 75,
    ]);

    $measurement2 = CustomerMeasurement::factory()->create([
        'customer_id' => $customer->id,
        'measured_at' => now()->subDays(5),
        'weight' => 76,
    ]);

    $measurement3 = CustomerMeasurement::factory()->create([
        'customer_id' => $customer->id,
        'measured_at' => now(),
        'weight' => 77,
    ]);

    $response = $this->getJson(route('api.v1.customers.measurements.index', [
        'customer' => $customer->id,
    ]));

    $response->assertSuccessful();

    $measurements = $response->json('measurements');
    expect($measurements[0]['id'])->toBe($measurement3->id)
        ->and($measurements[1]['id'])->toBe($measurement2->id)
        ->and($measurements[2]['id'])->toBe($measurement1->id);
});
