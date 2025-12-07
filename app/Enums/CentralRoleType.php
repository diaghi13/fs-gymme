<?php

namespace App\Enums;

enum CentralRoleType: string
{
    case SUPER_ADMIN = 'super_admin';
    case ADMIN = 'admin';
    case TENANT_ADMIN = 'tenant_admin';
    case CUSTOMER ='customer';
    case USER = 'user';

    public function label(): string
    {
        return match($this) {
            CentralRoleType::SUPER_ADMIN => 'Super Admin',
            CentralRoleType::ADMIN => 'Admin',
            CentralRoleType::TENANT_ADMIN => 'Tenant Admin',
            CentralRoleType::CUSTOMER => 'Customer',
            CentralRoleType::USER => 'User',
        };
    }
}
