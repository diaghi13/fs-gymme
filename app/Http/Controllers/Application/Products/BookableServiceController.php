<?php

namespace App\Http\Controllers\Application\Products;

use App\Dtos\Product\BookableServiceDto;
use App\Http\Controllers\Controller;
use App\Models\Product\BookableService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * BookableService Controller
 *
 * Manages bookable services (PT, massages, consultations, etc.)
 */
class BookableServiceController extends Controller
{
    protected $services;

    public function __construct()
    {
        $this->services = BookableService::all(['id', 'name', 'color']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('products/bookable-services', [
            'services' => $this->services,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        return Inertia::render('products/bookable-services', [
            'services' => $this->services,
            'service' => [
                'id' => null,
                'name' => '',
                'description' => '',
                'short_description' => '',
                'color' => '#2563eb',
                'duration_minutes' => 60,
                'requires_trainer' => true,
                'is_bookable' => true,
                'is_active' => true,
                'settings' => [
                    'booking' => [
                        'advance_days' => 7,
                        'min_advance_hours' => 2,
                        'cancellation_hours' => 24,
                        'max_per_day' => null,
                        'buffer_minutes' => 15,
                    ],
                    'availability' => [
                        'days' => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                        'time_slots' => [],
                        'blackout_dates' => [],
                    ],
                ],
            ],
            'customers' => \App\Models\Customer\Customer::all()->append('option_label')->toArray(),
            'paymentConditions' => \App\Models\Support\PaymentCondition::with(['installments', 'payment_method'])
                ->where('active', true)
                ->whereHas('payment_method', function ($query) {
                    $query->where('is_active', true);
                })
                ->get()
                ->toArray(),
            'paymentMethods' => \App\Models\Support\PaymentMethod::where('is_active', true)
                ->orderBy('order')
                ->get()
                ->append('label')
                ->toArray(),
            'financialResources' => \App\Models\Support\FinancialResource::with('financial_resource_type')->get()->toArray(),
            'vatRateOptions' => \App\Models\VatRate::where('is_active', true)
                ->orderBy('percentage', 'desc')
                ->get()
                ->toArray(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, BookableServiceDto $dto)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:255',
            'color' => 'required|string|max:7',
            'duration_minutes' => 'required|integer|min:1',
            'requires_trainer' => 'boolean',
            'is_active' => 'boolean',
            'settings' => 'nullable|array',
        ]);

        try {
            $service = BookableService::create([
                ...$validated,
                'type' => 'bookable_service',
                'is_bookable' => true,
            ]);

            return to_route('app.bookable-services.show', [
                'tenant' => $request->session()->get('current_tenant_id'),
                'bookable_service' => $service->id,
            ])
                ->with('status', 'success')
                ->with('message', 'Servizio creato con successo');
        } catch (\Throwable $e) {
            return back()
                ->with('status', 'error')
                ->with('message', 'Errore nella creazione del servizio')
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(BookableService $bookableService)
    {
        // Ensure settings are initialized if null (for legacy products or edge cases)
        if (is_null($bookableService->settings)) {
            $bookableService->settings = array_merge(
                $bookableService->getCommonSettingsDefaults(),
                $bookableService->getExtraSettingsDefaults()
            );
            $bookableService->save();
        }

        return Inertia::render('products/bookable-services', [
            'services' => $this->services,
            'service' => $bookableService->load(['vat_rate']),
            'customers' => \App\Models\Customer\Customer::all()->append('option_label')->toArray(),
            'paymentConditions' => \App\Models\Support\PaymentCondition::with(['installments', 'payment_method'])
                ->where('active', true)
                ->whereHas('payment_method', function ($query) {
                    $query->where('is_active', true);
                })
                ->get()
                ->toArray(),
            'paymentMethods' => \App\Models\Support\PaymentMethod::where('is_active', true)
                ->orderBy('order')
                ->get()
                ->append('label')
                ->toArray(),
            'financialResources' => \App\Models\Support\FinancialResource::with('financial_resource_type')->get()->toArray(),
            'vatRateOptions' => \App\Models\VatRate::where('is_active', true)
                ->orderBy('percentage', 'desc')
                ->get()
                ->toArray(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, BookableService $bookableService)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:255',
            'color' => 'required|string|max:7',
            'duration_minutes' => 'required|integer|min:1',
            'requires_trainer' => 'boolean',
            'is_active' => 'boolean',
            'settings' => 'nullable|array',
            // Booking settings validation
            'settings.booking.advance_days' => 'nullable|integer|min:1|max:365',
            'settings.booking.min_advance_hours' => 'nullable|integer|min:0|max:72',
            'settings.booking.cancellation_hours' => 'nullable|integer|min:0|max:168',
            'settings.booking.max_per_day' => 'nullable|integer|min:1|max:100',
            'settings.booking.buffer_minutes' => 'nullable|integer|min:0|max:120',
            // Requirements settings validation
            'settings.requirements.requires_trainer' => 'nullable|boolean',
            'settings.requirements.requires_equipment' => 'nullable|boolean',
            'settings.requirements.requires_room' => 'nullable|boolean',
            'settings.requirements.min_preparation_minutes' => 'nullable|integer|min:0|max:180',
            // Availability settings validation
            'settings.availability.available_days' => 'nullable|array|min:1',
            'settings.availability.available_days.*' => 'string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'settings.availability.default_start_time' => 'nullable|string',
            'settings.availability.default_end_time' => 'nullable|string',
            'settings.availability.slot_duration_minutes' => 'nullable|integer|min:15|max:480',
            'settings.availability.max_concurrent_bookings' => 'nullable|integer|min:1|max:50',
            'settings.availability.time_slots' => 'nullable|array',
            'settings.availability.time_slots.*.day' => 'required_with:settings.availability.time_slots|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'settings.availability.time_slots.*.start_time' => 'required_with:settings.availability.time_slots|string',
            'settings.availability.time_slots.*.end_time' => 'required_with:settings.availability.time_slots|string',
            'settings.availability.time_slots.*.max_bookings' => 'required_with:settings.availability.time_slots|integer|min:1|max:50',
        ]);

        try {
            $bookableService->update($validated);

            return back()
                ->with('status', 'success')
                ->with('message', 'Servizio aggiornato con successo');
        } catch (\Throwable $e) {
            return back()
                ->with('status', 'error')
                ->with('message', 'Errore nell\'aggiornamento del servizio')
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BookableService $bookableService)
    {
        try {
            $bookableService->delete();

            return to_route('app.bookable-services.index', [
                'tenant' => request()->session()->get('current_tenant_id'),
            ])
                ->with('status', 'success')
                ->with('message', 'Servizio eliminato con successo');
        } catch (\Throwable $e) {
            return back()
                ->with('status', 'error')
                ->with('message', 'Errore nell\'eliminazione del servizio')
                ->withErrors(['error' => $e->getMessage()]);
        }
    }
}
