<?php

namespace App\Http\Controllers\Application\Products;

use App\Http\Controllers\Controller;
use App\Models\Product\BaseProduct;
use App\Models\Product\ProductSchedule;
use Illuminate\Http\Request;

class BaseProductScheduleController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, BaseProduct $product)
    {
        foreach ($request->get('schedules') as $schedule) {
            $product->product_schedules()->create([
                'day' => $schedule['day'],
                'from_time' => $schedule['from_time'],
                'to_time' => $schedule['to_time'],
            ]);
        }

        return to_route('app.base-products.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'base_product' => $product->id,
            'tab' => 2,
        ])
            ->with('status', 'success')
            ->with('message', 'Schedule created successfully');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProductSchedule $schedule)
    {
        $schedule->update([
            'day' => $request->day,
            'from_time' => $request->from_time,
            'to_time' => $request->to_time,
        ]);

        return to_route('app.base-products.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'base_product' => $schedule->product->id,
            'tab' => 2,
        ])
            ->with('status', 'success')
            ->with('message', 'Schedule updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductSchedule $schedule)
    {
        $product = $schedule->product;

        $schedule->delete();

        return to_route('app.base-products.show', [
            'tenant' => session()->get('current_tenant_id'),
            'base_product' => $product->id,
            'tab' => 2,
        ])
            ->with('status', 'success')
            ->with('message', 'Schedule deleted successfully');
    }
}
