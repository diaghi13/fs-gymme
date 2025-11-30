<?php

use App\Models\Customer\Customer;

it('returns option label without birth date when birth date is null', function () {
    $customer = new Customer([
        'first_name' => 'Luigi',
        'last_name' => 'Bianchi',
    ]);
    $customer->birth_date = null;

    expect($customer->option_label)->toBe('Luigi Bianchi');
});

it('returns full name attribute correctly', function () {
    $customer = new Customer([
        'first_name' => 'Anna',
        'last_name' => 'Verdi',
    ]);

    expect($customer->full_name)->toBe('Anna Verdi');
});
