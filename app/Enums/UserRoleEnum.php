<?php

namespace App\Enums;

enum UserRoleEnum: string
{
    case ADMIN = 'admin';
    case MANAGER = 'manager';
    case STAFF = 'staff';
    case INSTRUCTOR = 'instructor';
    case CUSTOMER = 'customer';
}
