<?php

namespace App\Http\Controllers\Customers;

use App\Http\Controllers\Controller;
use App\Models\Customer\Customer;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * CustomerShow the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer)
    {
        $customer->load([
            'active_subscriptions' => function (HasMany $query) {
                $query->with(['entity', 'price_list', 'sale_row' => ['entity']]);
            },
            'active_membership',
            'last_membership',
            'last_medical_certification',
            'sales' => function (HasMany $query) {
                $query->with(['payment_condition', 'financial_resource', 'promotion', 'rows' => function (HasMany $query) {
                    $query->with(['entity', 'price_list']);
                }])->orderBy('date', 'desc')
                    ->limit(5);
            },
            'sales.payments' => ['payment_method'],
        ]);

        $customer->append([
            'sales_summary',
        ]);

        return Inertia::render('customers/customer-show', [
            'customer' => $customer,
            'payment_methods' => \App\Models\Support\PaymentMethod::all(),
        ]);
    }

    /**
     * CustomerShow the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Customer $customer)
    {
        if ($request->has('gdpr_consent_at') && $request->input('gdpr_consent_at') !== null) {
            $request->merge([
                'data_retention_until' => Carbon::parse($request->input('gdpr_consent_at'))->addYears(7),
            ]);
        } else {
            $request->merge([
                'gdpr_consent' => false,
                'gdpr_consent_at' => null,
                'marketing_consent' => false,
                'marketing_consent_at' => null,
                'photo_consent' => false,
                'medical_data_consent' => false,
                'data_retention_until' => null,
            ]);
        }

        $customer->update($request->all());

        return redirect()->route('customers.show', $customer->id)
            ->with('status', 'success')
            ->with('message', __('Customer updated successfully.'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public
    function destroy(string $id)
    {
        //
    }
}
