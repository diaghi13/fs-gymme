<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    /**
     * Override the users relationship to dynamically use the correct User model
     * based on the tenancy context.
     *
     * The issue with Spatie Permission in multi-tenant is that it caches the
     * model type from the auth provider. We override this to check tenancy
     * at query time, not at boot time.
     */
    public function users(): BelongsToMany
    {
        // Dynamically select User model based on tenancy context
        $userModel = tenancy()->initialized
            ? \App\Models\User::class
            : \App\Models\CentralUser::class;

        return $this->morphedByMany(
            $userModel,
            'model',
            config('permission.table_names.model_has_roles'),
            config('permission.column_names.role_pivot_key'),
            config('permission.column_names.model_morph_key')
        );
    }
}
