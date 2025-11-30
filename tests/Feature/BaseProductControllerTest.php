<?php

namespace Tests\Feature;

use App\Models\Product\BaseProduct;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class BaseProductControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Set up tenant migrations
        $this->artisan('migrate', ['--path' => 'database/migrations/tenant']);
    }

    /** @test */
    public function it_renders_the_show_view_with_correct_data()
    {
        $tenant = Tenant::factory()->create();
        $this->actingAs($tenant->owner);

        $baseProduct = BaseProduct::factory()->create();

        $response = $this->get(route('app.base-products.show', [
            'tenant' => $tenant->id,
            'base_product' => $baseProduct->id,
        ]));

        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('products/base-products')
            ->has('products')
        );
    }

    /** @test */
    public function it_updates_a_base_product_and_redirects_to_correct_tab()
    {
        $tenant = Tenant::factory()->create();
        $this->actingAs($tenant->owner);

        $baseProduct = BaseProduct::factory()->create();

        $response = $this->put(route('app.base-products.update', [
            'tenant' => $tenant->id,
            'base_product' => $baseProduct->id,
        ]), [
            'name' => 'Updated Product',
            'tab' => 2,
        ]);

        $response->assertRedirect(route('app.base-products.show', [
            'tenant' => $tenant->id,
            'base_product' => $baseProduct->id,
            'tab' => 2,
        ]));

        $this->assertDatabaseHas('base_products', [
            'id' => $baseProduct->id,
            'name' => 'Updated Product',
        ]);
    }

    /** @test */
    public function it_handles_update_errors_gracefully()
    {
        $tenant = Tenant::factory()->create();
        $this->actingAs($tenant->owner);

        $baseProduct = BaseProduct::factory()->create();

        $response = $this->put(route('app.base-products.update', [
            'tenant' => $tenant->id,
            'base_product' => $baseProduct->id,
        ]), [
            'name' => '', // Invalid data
        ]);

        $response->assertSessionHasErrors(['name']);
    }
}
