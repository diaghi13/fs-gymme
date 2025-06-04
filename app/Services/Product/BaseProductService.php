<?php

namespace App\Services\Product;

use App\Models\Product\BaseProduct;
use App\Services\VatRateService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class BaseProductService
{
    public function show(BaseProduct $product)
    {
        $product
            ->append('is_schedulable')
            ->load([
                'product_schedules',
                'vat_rate'
            ]);

        $vatRates = VatRateService::toOptions();

        return [
            'product' => $product,
            'vatRateOptions' => $vatRates,
        ];
    }

    /**
     * @throws ValidationException
     */
    public function store(array $data): BaseProduct
    {
        $validatedData = $this->validate($data);

        return DB::transaction(function () use ($validatedData) {
            return $this->createProduct($validatedData);
        });
    }

    public function update(array $data, BaseProduct $product): BaseProduct
    {
        $validatedData = $this->validate($data);

        return DB::transaction(function () use ($validatedData, $product) {
            $product->update($validatedData);
            return $product;
        });
    }

    public function delete(BaseProduct $product): bool
    {
        return DB::transaction(function () use ($product) {
            // Check if the product is used in any schedules
            if ($product->product_schedules()->exists()) {
                return to_route('base-products.index')
                    ->with('status', 'error')
                    ->with('message', 'Cannot delete a product that is used in schedules.');
            }

            // Delete the product
            return $product->delete();
        });
    }

    /**
     * @throws ValidationException
     */
    private function validate(array $data): array
    {
        // Perform validation logic here
        // For example, you can use Laravel's Validator facade
        $validator = Validator::make($data, [
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:7',
            'visible' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            throw new \Illuminate\Validation\ValidationException($validator);
        }

        return $validator->validated();
    }

    private function createProduct(array $validatedData)
    {
        // Create a new BaseProduct instance
        $product = new BaseProduct($validatedData);

        // Save the product to the database
        $product->save();

        return $product;
    }
}
