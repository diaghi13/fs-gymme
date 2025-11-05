<?php

namespace App\Http\Controllers\Application\Products;

use App\Http\Controllers\Controller;
use App\Models\Product\CourseProduct;
use App\Models\Product\CourseProductPlanning;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseProductPlanningController extends Controller
{
    /**
     * Store a newly created planning for a course product.
     */
    public function store(Request $request, CourseProduct $courseProduct)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'details' => 'required|array|min:1',
            'details.*.day' => 'required|string|in:sunday,monday,tuesday,wednesday,thursday,friday,saturday',
            'details.*.time' => 'required|date_format:H:i:s',
            'details.*.duration_in_minutes' => 'required|integer|min:1',
            'details.*.instructor_id' => 'nullable|integer',
            'details.*.room_id' => 'nullable|integer',
        ]);

        try {
            DB::transaction(function () use ($courseProduct, $validated) {
                $planning = $courseProduct->plannings()->create([
                    'name' => $validated['name'],
                    'start_date' => $validated['start_date'],
                    'end_date' => $validated['end_date'],
                    'selected' => false,
                ]);

                foreach ($validated['details'] as $detail) {
                    $planning->details()->create([
                        'day' => $detail['day'],
                        'time' => $detail['time'],
                        'duration_in_minutes' => $detail['duration_in_minutes'],
                        'instructor_id' => $detail['instructor_id'] ?? null,
                        'room_id' => $detail['room_id'] ?? null,
                    ]);
                }
            });

            return back()
                ->with('status', 'success')
                ->with('message', 'Planning creato con successo');
        } catch (\Throwable $e) {
            return back()
                ->with('status', 'error')
                ->with('message', 'Errore nella creazione del planning')
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Update the specified planning.
     */
    public function update(Request $request, CourseProduct $courseProduct, CourseProductPlanning $planning)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'details' => 'required|array|min:1',
            'details.*.day' => 'required|string|in:sunday,monday,tuesday,wednesday,thursday,friday,saturday',
            'details.*.time' => 'required|date_format:H:i:s',
            'details.*.duration_in_minutes' => 'required|integer|min:1',
            'details.*.instructor_id' => 'nullable|integer',
            'details.*.room_id' => 'nullable|integer',
        ]);

        try {
            DB::transaction(function () use ($planning, $validated) {
                $planning->update([
                    'name' => $validated['name'],
                    'start_date' => $validated['start_date'],
                    'end_date' => $validated['end_date'],
                ]);

                // Delete existing details and recreate
                $planning->details()->delete();

                foreach ($validated['details'] as $detail) {
                    $planning->details()->create([
                        'day' => $detail['day'],
                        'time' => $detail['time'],
                        'duration_in_minutes' => $detail['duration_in_minutes'],
                        'instructor_id' => $detail['instructor_id'] ?? null,
                        'room_id' => $detail['room_id'] ?? null,
                    ]);
                }
            });

            return back()
                ->with('status', 'success')
                ->with('message', 'Planning aggiornato con successo');
        } catch (\Throwable $e) {
            return back()
                ->with('status', 'error')
                ->with('message', 'Errore nell\'aggiornamento del planning')
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Remove the specified planning.
     */
    public function destroy(CourseProduct $courseProduct, CourseProductPlanning $planning)
    {
        try {
            $planning->delete();

            return back()
                ->with('status', 'success')
                ->with('message', 'Planning eliminato con successo');
        } catch (\Throwable $e) {
            return back()
                ->with('status', 'error')
                ->with('message', 'Errore nell\'eliminazione del planning')
                ->withErrors(['error' => $e->getMessage()]);
        }
    }
}
