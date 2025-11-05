<?php

namespace App\Http\Controllers\Application\Products;

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
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
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
        return Inertia::render('products/bookable-services', [
            'services' => $this->services,
            'service' => $bookableService->load(['vat_rate']),
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
