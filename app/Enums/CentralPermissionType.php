<?php

namespace App\Enums;

enum CentralPermissionType: string
{
    case MANAGE_USERS = 'manage.users';
    case MANAGE_TENANTS = 'manage.tenants';
    case MANAGE_SETTINGS = 'manage.settings';
    case MANAGE_BILLING = 'manage.billing';
    case MANAGE_ROLES = 'manage.roles';
    case MANAGE_PERMISSIONS = 'manage.permissions';
    case MANAGE_SUBSCRIPTIONS = 'manage.subscriptions';
    case MANAGE_CUSTOMERS = 'manage.customers';
    case VIEW_DASHBOARD = 'view.dashboard';
    case VIEW_ANALYTICS = 'view.analytics';
    case VIEW_REPORTS = 'view.reports';
    case VIEW_LOGS = 'view.logs';
    case VIEW_SETTINGS = 'view.settings';
    case VIEW_USERS = 'view.users';
    case VIEW_TENANTS = 'view.tenants';
    case VIEW_BILLING = 'view.billing';
    case VIEW_SUBSCRIPTIONS = 'view.subscriptions';
    case VIEW_CUSTOMERS = 'view.customers';
    case ACCESS_API = 'access.api';

    public function label(): string
    {
        return match($this) {
            CentralPermissionType::MANAGE_USERS => 'Manage Users',
            CentralPermissionType::MANAGE_TENANTS => 'Manage Tenants',
            CentralPermissionType::MANAGE_SETTINGS => 'Manage Settings',
            CentralPermissionType::MANAGE_BILLING => 'Manage Billing',
            CentralPermissionType::MANAGE_ROLES => 'Manage Roles',
            CentralPermissionType::MANAGE_PERMISSIONS => 'Manage Permissions',
            CentralPermissionType::MANAGE_SUBSCRIPTIONS => 'Manage Subscriptions',
            CentralPermissionType::MANAGE_CUSTOMERS => 'Manage Customers',
            CentralPermissionType::VIEW_DASHBOARD => 'View Dashboard',
            CentralPermissionType::VIEW_ANALYTICS => 'View Analytics',
            CentralPermissionType::VIEW_REPORTS => 'View Reports',
            CentralPermissionType::VIEW_LOGS => 'View Logs',
            CentralPermissionType::VIEW_SETTINGS => 'View Settings',
            CentralPermissionType::VIEW_USERS => 'View Users',
            CentralPermissionType::VIEW_TENANTS => 'View Tenants',
            CentralPermissionType::VIEW_BILLING => 'View Billing',
            CentralPermissionType::VIEW_SUBSCRIPTIONS => 'View Subscriptions',
            CentralPermissionType::VIEW_CUSTOMERS => 'View Customers',
            CentralPermissionType::ACCESS_API => 'Access API',
        };
    }
}
