<?php

namespace App\Http\Controllers\App\PriceLists;

use App\Http\Controllers\Controller;
use App\Models\PriceList\PriceList;
use Illuminate\Http\Request;

class PriceListSalesUpdate extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, PriceList $priceList)
    {

        $validated = $request->validate([
            'saleable_from' => 'nullable|date',
            'saleable_to' => 'nullable|date',
        ]);

        $priceList->update($validated);

        $routes = [
            ['routeName' => 'price-lists.folders.show', 'parameterName' => 'folder'],
            ['routeName' => 'price-lists.articles.show', 'parameterName' => 'article'],
            ['routeName' => 'price-lists.memberships.show', 'parameterName' => 'membership'],
            ['routeName' => 'price-lists.subscriptions.show', 'parameterName' => 'subscription'],
        ];

        $route = collect($routes)->firstWhere('parameterName', $priceList->type);

        return to_route($route['routeName'], [$route['parameterName'] => $priceList->id])
            ->with('status', 'success')
            ->with('message', __('Price list sales updated successfully.'));
    }
}
