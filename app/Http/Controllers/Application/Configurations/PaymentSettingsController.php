<?php

namespace App\Http\Controllers\Application\Configurations;

use App\Http\Controllers\Controller;
use App\Models\Support\PaymentCondition;
use App\Models\Support\PaymentMethod;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentSettingsController extends Controller
{
    /**
     * Display payment settings page
     */
    public function show(): Response
    {
        // Get all payment methods with relationships (including inactive for advanced section)
        $paymentMethods = PaymentMethod::with('payment_conditions')
            ->orderBy('order')
            ->get()
            ->map(function ($method) {
                return [
                    'id' => $method->id,
                    'code' => $method->code,
                    'description' => $method->description,
                    'order' => $method->order,
                    'is_active' => $method->is_active,
                    'is_system' => $method->is_system,
                    'label' => $method->label,
                    'conditions_count' => $method->payment_conditions->count(),
                ];
            });

        // Get all payment conditions
        $paymentConditions = PaymentCondition::with(['payment_method', 'financial_resource_type'])
            ->orderBy('description')
            ->get()
            ->map(function ($condition) {
                return [
                    'id' => $condition->id,
                    'description' => $condition->description,
                    'payment_method_id' => $condition->payment_method_id,
                    'payment_method_code' => $condition->payment_method?->code,
                    'payment_method_description' => $condition->payment_method?->description,
                    'number_of_installments' => $condition->number_of_installments,
                    'end_of_month' => $condition->end_of_month,
                    'visible' => $condition->visible,
                    'active' => $condition->active,
                    'is_default' => $condition->is_default,
                    'is_system' => $condition->is_system,
                    'financial_resource_type_id' => $condition->financial_resource_type_id,
                ];
            });

        return Inertia::render('configurations/payment-settings', [
            'paymentMethods' => $paymentMethods,
            'paymentConditions' => $paymentConditions,
        ]);
    }

    /**
     * Toggle is_active status for a payment method
     */
    public function toggleActive(Request $request, PaymentMethod $paymentMethod)
    {
        $validated = $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $paymentMethod->update([
            'is_active' => $validated['is_active'],
        ]);

        $message = $validated['is_active']
            ? "Metodo di pagamento {$paymentMethod->code} attivato con successo"
            : "Metodo di pagamento {$paymentMethod->code} disattivato con successo";

        return redirect()->back()->with('success', $message);
    }

    /**
     * Store a custom payment method created by tenant
     */
    public function storeCustomMethod(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:payment_methods,code',
            'description' => 'required|string|max:255',
        ]);

        // Custom methods are not system methods and are active by default
        $validated['is_system'] = false;
        $validated['is_active'] = true;

        // Set order to end of list
        $maxOrder = PaymentMethod::max('order') ?? 23;
        $validated['order'] = $maxOrder + 1;

        $paymentMethod = PaymentMethod::create($validated);

        return redirect()
            ->back()
            ->with('success', "Metodo di pagamento personalizzato {$paymentMethod->code} creato con successo");
    }

    /**
     * Toggle active status for a payment condition
     */
    public function toggleConditionActive(Request $request, PaymentCondition $paymentCondition)
    {
        $validated = $request->validate([
            'active' => 'required|boolean',
        ]);

        $paymentCondition->update([
            'active' => $validated['active'],
        ]);

        $message = $validated['active']
            ? 'Condizione di pagamento attivata con successo'
            : 'Condizione di pagamento disattivata con successo';

        return redirect()->back()->with('success', $message);
    }

    /**
     * Store a custom payment condition created by tenant
     */
    public function storeCustomCondition(Request $request)
    {
        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'payment_method_id' => 'required|exists:payment_methods,id',
            'number_of_installments' => 'nullable|integer|min:1',
            'end_of_month' => 'boolean',
            'financial_resource_type_id' => 'nullable|exists:financial_resource_types,id',
        ]);

        // Custom conditions are not system conditions
        $validated['is_system'] = false;
        $validated['active'] = true;
        $validated['visible'] = true;
        $validated['is_default'] = false;

        $paymentCondition = PaymentCondition::create($validated);

        return redirect()
            ->back()
            ->with('success', 'Condizione di pagamento personalizzata creata con successo');
    }
}
