<?php

namespace Tests\Feature\Product;

use App\Dtos\Product\BaseProductDto;
use App\Models\Product\BaseProduct;
use App\Services\Product\BaseProductService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class BaseProductServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_update_preserves_existing_settings(): void
    {
        $service = new BaseProductService();

        $product = BaseProduct::factory()->create([
            'settings' => [
                'key1' => 'value1',
                'key2' => 'value2',
            ],
        ]);

        $dto = new BaseProductDto([
            'id' => $product->id,
            'settings' => [
                'key2' => 'new_value2',
                'key3' => 'value3',
            ],
        ]);

        $updatedProduct = $service->update($dto);

        $this->assertEquals([
            'key1' => 'value1',
            'key2' => 'new_value2',
            'key3' => 'value3',
        ], $updatedProduct->settings);
    }

    public function test_update_throws_exception_for_nonexistent_product(): void
    {
        $service = new BaseProductService();

        $dto = new BaseProductDto([
            'id' => 9999, // Nonexistent ID
        ]);

        $this->expectException(ValidationException::class);

        $service->update($dto);
    }
}
