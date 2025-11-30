<?php

namespace Tests\Feature;

use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class OnboardingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Set up tenant migrations
        $this->artisan('migrate', ['--path' => 'database/migrations/tenant']);
    }

    protected function tearDown(): void
    {
        // End any active tenancy
        if (tenancy()->initialized) {
            tenancy()->end();
        }

        // Clean up tenant database files after each test
        foreach (glob(database_path('gymme-tenant_*')) as $file) {
            if (is_file($file)) {
                @unlink($file);
            }
        }

        parent::tearDown();
    }

    /** @test */
    public function tenant_onboarding_status_is_shared_with_inertia()
    {
        $tenant = Tenant::factory()->create([
            'onboarding_completed_at' => null,
        ]);
        $this->actingAs($tenant->owner);

        $response = $this->get(route('app.dashboard', ['tenant' => $tenant->id]));

        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->has('tenant')
            ->where('tenant.id', $tenant->id)
            ->where('tenant.name', $tenant->name)
            ->where('tenant.onboarding_completed_at', null)
        );
    }

    /** @test */
    public function completing_onboarding_updates_tenant_record()
    {
        $tenant = Tenant::factory()->create([
            'onboarding_completed_at' => null,
        ]);
        $this->actingAs($tenant->owner);

        $this->assertNull($tenant->fresh()->onboarding_completed_at);

        $response = $this->post(route('app.onboarding.complete', ['tenant' => $tenant->id]));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertNotNull($tenant->fresh()->onboarding_completed_at);
    }

    /** @test */
    public function completing_onboarding_twice_returns_info_message()
    {
        $tenant = Tenant::factory()->create([
            'onboarding_completed_at' => now(),
        ]);
        $this->actingAs($tenant->owner);

        $response = $this->post(route('app.onboarding.complete', ['tenant' => $tenant->id]));

        $response->assertRedirect();
        $response->assertSessionHas('info', 'Onboarding già completato');
    }

    /** @test */
    public function onboarding_wizard_should_not_show_after_completion()
    {
        $tenant = Tenant::factory()->create([
            'onboarding_completed_at' => now(),
        ]);
        $this->actingAs($tenant->owner);

        $response = $this->get(route('app.dashboard', ['tenant' => $tenant->id]));

        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->has('tenant')
            ->where('tenant.onboarding_completed_at', fn ($date) => $date !== null)
        );
    }

    /** @test */
    public function tenant_has_completed_onboarding_method_returns_correct_boolean()
    {
        $tenantWithoutOnboarding = Tenant::factory()->create([
            'onboarding_completed_at' => null,
        ]);

        $tenantWithOnboarding = Tenant::factory()->create([
            'onboarding_completed_at' => now(),
        ]);

        $this->assertFalse($tenantWithoutOnboarding->hasCompletedOnboarding());
        $this->assertTrue($tenantWithOnboarding->hasCompletedOnboarding());
    }

    /** @test */
    public function complete_onboarding_method_sets_timestamp()
    {
        $tenant = Tenant::factory()->create([
            'onboarding_completed_at' => null,
        ]);

        $this->assertFalse($tenant->hasCompletedOnboarding());

        $tenant->completeOnboarding();

        $this->assertTrue($tenant->fresh()->hasCompletedOnboarding());
        $this->assertNotNull($tenant->fresh()->onboarding_completed_at);
    }
}
