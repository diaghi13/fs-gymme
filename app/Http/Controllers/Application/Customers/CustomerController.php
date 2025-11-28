<?php

namespace App\Http\Controllers\Application\Customers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CustomerStoreRequest;
use App\Models\Customer\Customer;
use App\Services\Customer\CustomerService;
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
        $customers = Customer::query()
            ->with(['active_subscriptions' => function (HasMany $query) {
                $query->with(['entity', 'price_list', 'sale_row' => ['entity']]);
            }])
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        return Inertia::render('customers/index', [
            'customers' => $customers,
        ]);
    }

    /**
     * CustomerShow the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('customers/customer-create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CustomerStoreRequest $request, CustomerService $customerService)
    {
        $customer = $customerService->createWithUser($request->validated());

        return redirect()->route('app.customers.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'customer' => $customer->id,
        ])
            ->with('status', 'success')
            ->with('message', __('Customer created successfully.'));
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer, CustomerService $service)
    {
        $loadedCustomer = $service->get($customer);

        return Inertia::render('customers/customer-show', [
            'customer' => $loadedCustomer,
            'payment_methods' => \App\Models\Support\PaymentMethod::where('is_active', true)
                ->orderBy('order')
                ->get()
                ->map(fn ($pm) => [
                    'id' => $pm->id,
                    'description' => $pm->description,
                ]),
            'price_lists' => \App\Models\PriceList\PriceList::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get()
                ->map(fn ($pl) => [
                    'id' => $pl->id,
                    'name' => $pl->name,
                    'price' => $pl->price,
                    'entrances' => $pl->entrances,
                    'days_duration' => $pl->days_duration,
                    'months_duration' => $pl->months_duration,
                ]),
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

        return redirect()->route('app.customers.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'customer' => $customer->id,
        ])
            ->with('status', 'success')
            ->with('message', __('Customer updated successfully.'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer)
    {
        if ($customer->active_subscriptions()->exists()) {
            return redirect()->back()
                ->with('status', 'error')
                ->with('message', __('Cannot delete customer with active subscriptions.'));
        }

        $customer->delete();

        return redirect()->route('app.customers.index')
            ->with('status', 'success')
            ->with('message', __('Customer deleted successfully.'));
    }

    /**
     * Check if email is available for this tenant
     */
    public function checkEmail(Request $request, CustomerService $customerService)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $available = $customerService->isEmailAvailable($request->input('email'));

        return response()->json([
            'available' => $available,
            'message' => $available
                ? 'Email disponibile'
                : 'Un cliente con questa email esiste già',
        ]);
    }

    /**
     * Calculate Italian Tax Code (Codice Fiscale)
     */
    public function calculateTaxCode(Request $request, CustomerService $customerService)
    {
        $request->validate([
            'first_name' => ['required', 'string'],
            'last_name' => ['required', 'string'],
            'birth_date' => ['required', 'date'],
            'birthplace' => ['required', 'string'],
            'gender' => ['required', 'string', 'in:M,F'],
        ]);

        $taxCode = $customerService->calculateTaxCode($request->all());

        return response()->json([
            'tax_code' => $taxCode,
        ]);
    }

    /**
     * Upload customer avatar photo
     */
    public function uploadAvatar(Request $request, Customer $customer)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'max:2048'], // Max 2MB
        ]);

        // Delete old avatar if exists
        if ($customer->avatar_path) {
            \Storage::disk('public')->delete($customer->avatar_path);
        }

        // Store new avatar
        $path = $request->file('avatar')->store('avatars', 'public');

        // Update customer with new avatar path (not URL)
        $customer->update([
            'avatar_path' => $path,
        ]);

        return redirect()->back()
            ->with('status', 'success')
            ->with('message', 'Avatar aggiornato con successo');
    }
}
