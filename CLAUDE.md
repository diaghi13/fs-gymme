<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to enhance the user's satisfaction building Laravel applications.

## Foundational Context
This application is a Laravel application and its main Laravel ecosystems package & versions are below. You are an expert with them all. Ensure you abide by these specific packages & versions.

- php - 8.3.3
- inertiajs/inertia-laravel (INERTIA) - v2
- laravel/framework (LARAVEL) - v12
- laravel/prompts (PROMPTS) - v0
- laravel/reverb (REVERB) - v1
- tightenco/ziggy (ZIGGY) - v2
- laravel/pint (PINT) - v1
- pestphp/pest (PEST) - v3
- @inertiajs/react (INERTIA) - v2
- react (REACT) - v19
- tailwindcss (TAILWINDCSS) - v4
- laravel-echo (ECHO) - v2


## Conventions
- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts
- Do not create verification scripts or tinker when tests cover that functionality and prove it works. Unit and feature tests are more important.

## Application Structure & Architecture
- Stick to existing directory structure - don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Multi-Tenancy Database Architecture (CRITICALLY IMPORTANT!)
**This application uses Stancl Tenancy with SEPARATE databases for central and tenant data.**

### Database Structure:
- **CENTRAL DATABASE** (`mysql` connection): Contains `tenants`, `domains`, `users`, `subscription_plans`, `permissions`, etc.
- **TENANT DATABASES** (`gymme-tenant_*`): Each tenant has its own database containing `products`, `price_lists`, `customers`, `sales`, `structures`, etc.

### Migration Commands (NEVER CONFUSE THESE!):
- `php artisan migrate` → Runs migrations on CENTRAL database only
- `php artisan migrate:fresh` → Drops ALL tables in CENTRAL database (DANGER!)
- `php artisan tenants:migrate` → Runs tenant migrations on ALL tenant databases
- `php artisan tenants:migrate-fresh` → Drops and recreates ALL tenant databases (DANGER!)

### Migration File Locations:
- `database/migrations/` → Central database migrations
- `database/migrations/tenant/` → Tenant database migrations

### CRITICAL RULES:
1. ⚠️ **NEVER** run `php artisan migrate --path=database/migrations/tenant` - This runs TENANT migrations on CENTRAL database!
2. ✅ **ALWAYS** use `php artisan tenants:migrate` for tenant migrations
3. ⚠️ **NEVER** run `migrate:fresh` without understanding it will destroy the central DB including the `tenants` table
4. ✅ **ALWAYS** verify which database you're targeting before running destructive commands
5. ✅ When creating migrations, place them in the correct folder based on which database they belong to

### What Goes Where:
**CENTRAL DB:**
- Tenants, Domains, Users (global)
- Subscription Plans (SaaS plans)
- Permissions, Roles (global)

**TENANT DB:**
- Products, Price Lists
- Customers, Sales, Payments
- Structures (gym locations)
- Documents, Invoices
- Activity logs (tenant-specific)

## Frontend Bundling
- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Replies
- Be concise in your explanations - focus on what's important rather than explaining obvious details.

## Documentation Files
- You must only create documentation files if explicitly requested by the user.


=== boost rules ===

## Laravel Boost
- Laravel Boost is an MCP server that comes with powerful tools designed specifically for this application. Use them.

## Artisan
- Use the `list-artisan-commands` tool when you need to call an Artisan command to double check the available parameters.

## URLs
- Whenever you share a project URL with the user you should use the `get-absolute-url` tool to ensure you're using the correct scheme, domain / IP, and port.

## Tinker / Debugging
- You should use the `tinker` tool when you need to execute PHP to debug code or query Eloquent models directly.
- Use the `database-query` tool when you only need to read from the database.

## Reading Browser Logs With the `browser-logs` Tool
- You can read browser logs, errors, and exceptions using the `browser-logs` tool from Boost.
- Only recent browser logs will be useful - ignore old logs.

## Searching Documentation (Critically Important)
- Boost comes with a powerful `search-docs` tool you should use before any other approaches. This tool automatically passes a list of installed packages and their versions to the remote Boost API, so it returns only version-specific documentation specific for the user's circumstance. You should pass an array of packages to filter on if you know you need docs for particular packages.
- The 'search-docs' tool is perfect for all Laravel related packages, including Laravel, Inertia, Livewire, Filament, Tailwind, Pest, Nova, Nightwatch, etc.
- You must use this tool to search for Laravel-ecosystem documentation before falling back to other approaches.
- Search the documentation before making code changes to ensure we are taking the correct approach.
- Use multiple, broad, simple, topic based queries to start. For example: `['rate limiting', 'routing rate limiting', 'routing']`.
- Do not add package names to queries - package information is already shared. For example, use `test resource table`, not `filament 4 test resource table`.

### Available Search Syntax
- You can and should pass multiple queries at once. The most relevant results will be returned first.

1. Simple Word Searches with auto-stemming - query=authentication - finds 'authenticate' and 'auth'
2. Multiple Words (AND Logic) - query=rate limit - finds knowledge containing both "rate" AND "limit"
3. Quoted Phrases (Exact Position) - query="infinite scroll" - Words must be adjacent and in that order
4. Mixed Queries - query=middleware "rate limit" - "middleware" AND exact phrase "rate limit"
5. Multiple Queries - queries=["authentication", "middleware"] - ANY of these terms


=== php rules ===

## PHP

- Always use curly braces for control structures, even if it has one line.

### Constructors
- Use PHP 8 constructor property promotion in `__construct()`.
    - <code-snippet>public function __construct(public GitHub $github) { }</code-snippet>
- Do not allow empty `__construct()` methods with zero parameters.

### Type Declarations
- Always use explicit return type declarations for methods and functions.
- Use appropriate PHP type hints for method parameters.

<code-snippet name="Explicit Return Types and Method Params" lang="php">
protected function isAccessible(User $user, ?string $path = null): bool
{
    ...
}
</code-snippet>

## Comments
- Prefer PHPDoc blocks over comments. Never use comments within the code itself unless there is something _very_ complex going on.

## PHPDoc Blocks
- Add useful array shape type definitions for arrays when appropriate.

## Enums
- Typically, keys in an Enum should be TitleCase. For example: `FavoritePerson`, `BestLake`, `Monthly`.


=== inertia-laravel/core rules ===

## Inertia Core

- Inertia.js components should be placed in the `resources/js/Pages` directory unless specified differently in the JS bundler (vite.config.js).
- Use `Inertia::render()` for server-side routing instead of traditional Blade views.

<code-snippet lang="php" name="Inertia::render Example">
// routes/web.php example
Route::get('/users', function () {
    return Inertia::render('Users/Index', [
        'users' => User::all()
    ]);
});
</code-snippet>


=== inertia-laravel/v2 rules ===

## Inertia v2

- Make use of all Inertia features from v1 & v2. Check the documentation before making any changes to ensure we are taking the correct approach.

### Inertia v2 New Features
- Polling
- Prefetching
- Deferred props
- Infinite scrolling using merging props and `WhenVisible`
- Lazy loading data on scroll

### Deferred Props & Empty States
- When using deferred props on the frontend, you should add a nice empty state with pulsing / animated skeleton.


=== laravel/core rules ===

## Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using the `list-artisan-commands` tool.
- If you're creating a generic PHP class, use `artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Database
- Always use proper Eloquent relationship methods with return type hints. Prefer relationship methods over raw queries or manual joins.
- Use Eloquent models and relationships before suggesting raw database queries
- Avoid `DB::`; prefer `Model::query()`. Generate code that leverages Laravel's ORM capabilities rather than bypassing them.
- Generate code that prevents N+1 query problems by using eager loading.
- Use Laravel's query builder for very complex database operations.

### Model Creation
- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `list-artisan-commands` to check the available options to `php artisan make:model`.

### APIs & Eloquent Resources
- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

### Controllers & Validation
- Always create Form Request classes for validation rather than inline validation in controllers. Include both validation rules and custom error messages.
- Check sibling Form Requests to see if the application uses array or string based validation rules.

### Queues
- Use queued jobs for time-consuming operations with the `ShouldQueue` interface.

### Authentication & Authorization
- Use Laravel's built-in authentication and authorization features (gates, policies, Sanctum, etc.).

### URL Generation
- When generating links to other pages, prefer named routes and the `route()` function.

### Configuration
- Use environment variables only in configuration files - never use the `env()` function directly outside of config files. Always use `config('app.name')`, not `env('APP_NAME')`.

### Testing
- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] <name>` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

### Vite Error
- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.


=== laravel/v12 rules ===

## Laravel 12

- Use the `search-docs` tool to get version specific documentation.
- Since Laravel 11, Laravel has a new streamlined file structure which this project uses.

### Laravel 12 Structure
- No middleware files in `app/Http/Middleware/`.
- `bootstrap/app.php` is the file to register middleware, exceptions, and routing files.
- `bootstrap/providers.php` contains application specific service providers.
- **No app\Console\Kernel.php** - use `bootstrap/app.php` or `routes/console.php` for console configuration.
- **Commands auto-register** - files in `app/Console/Commands/` are automatically available and do not require manual registration.

### Database
- When modifying a column, the migration must include all of the attributes that were previously defined on the column. Otherwise, they will be dropped and lost.
- Laravel 11 allows limiting eagerly loaded records natively, without external packages: `$query->latest()->limit(10);`.

### Models
- Casts can and likely should be set in a `casts()` method on a model rather than the `$casts` property. Follow existing conventions from other models.


=== pint/core rules ===

## Laravel Pint Code Formatter

- You must run `vendor/bin/pint --dirty` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test`, simply run `vendor/bin/pint` to fix any formatting issues.


=== pest/core rules ===

## Pest

### Testing
- If you need to verify a feature is working, write or update a Unit / Feature test.

### Pest Tests
- All tests must be written using Pest. Use `php artisan make:test --pest <name>`.
- You must not remove any tests or test files from the tests directory without approval. These are not temporary or helper files - these are core to the application.
- Tests should test all of the happy paths, failure paths, and weird paths.
- Tests live in the `tests/Feature` and `tests/Unit` directories.
- Pest tests look and behave like this:
<code-snippet name="Basic Pest Test Example" lang="php">
it('is true', function () {
    expect(true)->toBeTrue();
});
</code-snippet>

### Running Tests
- Run the minimal number of tests using an appropriate filter before finalizing code edits.
- To run all tests: `php artisan test`.
- To run all tests in a file: `php artisan test tests/Feature/ExampleTest.php`.
- To filter on a particular test name: `php artisan test --filter=testName` (recommended after making a change to a related file).
- When the tests relating to your changes are passing, ask the user if they would like to run the entire test suite to ensure everything is still passing.

### Pest Assertions
- When asserting status codes on a response, use the specific method like `assertForbidden` and `assertNotFound` instead of using `assertStatus(403)` or similar, e.g.:
<code-snippet name="Pest Example Asserting postJson Response" lang="php">
it('returns all', function () {
    $response = $this->postJson('/api/docs', []);

    $response->assertSuccessful();
});
</code-snippet>

### Mocking
- Mocking can be very helpful when appropriate.
- When mocking, you can use the `Pest\Laravel\mock` Pest function, but always import it via `use function Pest\Laravel\mock;` before using it. Alternatively, you can use `$this->mock()` if existing tests do.
- You can also create partial mocks using the same import or self method.

### Datasets
- Use datasets in Pest to simplify tests which have a lot of duplicated data. This is often the case when testing validation rules, so consider going with this solution when writing tests for validation rules.

<code-snippet name="Pest Dataset Example" lang="php">
it('has emails', function (string $email) {
    expect($email)->not->toBeEmpty();
})->with([
    'james' => 'james@laravel.com',
    'taylor' => 'taylor@laravel.com',
]);
</code-snippet>


=== inertia-react/core rules ===

## Inertia + React

- Use `router.visit()` or `<Link>` for navigation instead of traditional links.

<code-snippet lang="react" name="Inertia Client Navigation">
    import { Link } from '@inertiajs/react'

    <Link href="/">Home</Link>
</code-snippet>

- For form handling, use `router.post` and related methods. Do not use regular forms.

### HTTP Requests (CRITICAL)
- **ALWAYS use Inertia's `router` methods** (`router.get()`, `router.post()`, `router.put()`, `router.delete()`) for making HTTP requests in React components
- **NEVER use `axios` directly** for requests that modify data - this causes CSRF token issues (419 errors)
- `router` methods automatically handle CSRF tokens, preserve state, and integrate with Inertia's page system
- Only use `axios` for non-Inertia endpoints or when you need raw XHR responses (e.g., downloading files, external APIs)

<code-snippet lang="react" name="Correct: Using Inertia Router">
import { router } from '@inertiajs/react'

// Correct - Use router.post for form submissions and data mutations
router.post(
  route('app.structures.switch', { tenant: tenantId }),
  { structure_id: newStructureId },
  {
    preserveScroll: true,
    onSuccess: () => console.log('Success!'),
    onError: (errors) => console.error('Error:', errors),
  }
)
</code-snippet>

<code-snippet lang="react" name="Wrong: Using axios directly">
// WRONG - This will cause CSRF 419 errors
axios.post(route('app.structures.switch'), { structure_id: id })
</code-snippet>

<code-snippet lang="react" name="Inertia React Form Example">
import { useState } from 'react'
import { router } from '@inertiajs/react'

export default function Edit() {
    const [values, setValues] = useState({
        first_name: "",
        last_name: "",
        email: "",
    })

    function handleChange(e) {
        const key = e.target.id;
        const value = e.target.value

        setValues(values => ({
            ...values,
            [key]: value,
        }))
    }

    function handleSubmit(e) {
        e.preventDefault()

        router.post('/users', values)
    }

    return (
    <form onSubmit={handleSubmit}>
        <label htmlFor="first_name">First name:</label>
        <input id="first_name" value={values.first_name} onChange={handleChange} />
        <label htmlFor="last_name">Last name:</label>
        <input id="last_name" value={values.last_name} onChange={handleChange} />
        <label htmlFor="email">Email:</label>
        <input id="email" value={values.email} onChange={handleChange} />
        <button type="submit">Submit</button>
    </form>
    )
}
</code-snippet>


=== mui/v6 rules ===

## Material UI v6

- This project uses Material UI (MUI) v6, which has significant breaking changes from v5
- **CRITICAL**: Always check existing MUI components in the project before creating new ones to follow the correct v6 patterns

### Grid Component Changes

**The Grid component API has completely changed in v6:**

- **REMOVED**: Individual breakpoint props (`xs`, `sm`, `md`, `lg`, `xl`)
- **NEW**: Unified `size` prop with object syntax
- **REMOVED**: `item` prop (no longer needed)
- **CHANGED**: `container` prop remains the same

<code-snippet name="MUI v6 Grid - Multiple Breakpoints" lang="tsx">
// ❌ WRONG (v5 syntax)
<Grid container spacing={3}>
  <Grid item xs={12} md={6}>
    <Card>Content</Card>
  </Grid>
</Grid>

// ✅ CORRECT (v6 syntax)
<Grid container spacing={3}>
  <Grid size={{ xs: 12, md: 6 }}>
    <Card>Content</Card>
  </Grid>
</Grid>
</code-snippet>

<code-snippet name="MUI v6 Grid - Single Breakpoint" lang="tsx">
// If size is same for all breakpoints, use single value
<Grid size={6}>
  <Card>Content</Card>
</Grid>
</code-snippet>

<code-snippet name="MUI v6 Grid - Auto Grow" lang="tsx">
// ❌ WRONG (v5 syntax)
<Grid item xs>

// ✅ CORRECT (v6 syntax)
<Grid size="grow">
</code-snippet>

### Other Important v6 Changes

**ListItem Component:**
- Use `ListItemButton` for clickable items instead of `ListItem` with button prop
- Check existing list components in the project for correct patterns

**Package Structure:**
- ESM code is now at the root of the package
- CommonJS code moved to `node/` build
- UMD bundle removed (aligns with React 19)

**Browser Support:**
- Updated to modern browsers: `> 0.5%, last 2 versions, Firefox ESR, not dead, safari >= 15.4, iOS >= 15.4`

### Migration Tools Available

If migrating old v5 code, these codemods can help:
```bash
npx @mui/codemod@latest v6.0.0/grid-v2-props <path>
npx @mui/codemod@latest v6.0.0/list-item-button-prop <path>
```

### Best Practices

1. **Always check sibling components** in the same directory for MUI v6 patterns
2. **Never use v5 syntax** - it will cause runtime errors
3. **Grid spacing** uses CSS gap property (more modern approach)
4. **Import from @mui/material** remains the same


=== tailwindcss/core rules ===

## Tailwind Core

- Use Tailwind CSS classes to style HTML, check and use existing tailwind conventions within the project before writing your own.
- Offer to extract repeated patterns into components that match the project's conventions (i.e. Blade, JSX, Vue, etc..)
- Think through class placement, order, priority, and defaults - remove redundant classes, add classes to parent or child carefully to limit repetition, group elements logically
- You can use the `search-docs` tool to get exact examples from the official documentation when needed.

### Spacing
- When listing items, use gap utilities for spacing, don't use margins.

    <code-snippet name="Valid Flex Gap Spacing Example" lang="html">
        <div class="flex gap-8">
            <div>Superior</div>
            <div>Michigan</div>
            <div>Erie</div>
        </div>
    </code-snippet>


### Dark Mode
- If existing pages and components support dark mode, new pages and components must support dark mode in a similar way, typically using `dark:`.


=== tailwindcss/v4 rules ===

## Tailwind 4

- Always use Tailwind CSS v4 - do not use the deprecated utilities.
- `corePlugins` is not supported in Tailwind v4.
- In Tailwind v4, you import Tailwind using a regular CSS `@import` statement, not using the `@tailwind` directives used in v3:

<code-snippet name="Tailwind v4 Import Tailwind Diff" lang="diff"
   - @tailwind base;
   - @tailwind components;
   - @tailwind utilities;
   + @import "tailwindcss";
</code-snippet>


### Replaced Utilities
- Tailwind v4 removed deprecated utilities. Do not use the deprecated option - use the replacement.
- Opacity values are still numeric.

| Deprecated |	Replacement |
|------------+--------------|
| bg-opacity-* | bg-black/* |
| text-opacity-* | text-black/* |
| border-opacity-* | border-black/* |
| divide-opacity-* | divide-black/* |
| ring-opacity-* | ring-black/* |
| placeholder-opacity-* | placeholder-black/* |
| flex-shrink-* | shrink-* |
| flex-grow-* | grow-* |
| overflow-ellipsis | text-ellipsis |
| decoration-slice | box-decoration-slice |
| decoration-clone | box-decoration-clone |


=== react/custom-components rules ===

## Custom Components & Project Patterns

This project has many custom reusable components, hooks, and utilities. **ALWAYS check for existing components before creating new ones.**

### Layouts

**AppLayout** (`resources/js/layouts/AppLayout.tsx`):
- Main application layout with sidebar, header, breadcrumbs, and footer
- **Required props**: `user: User`, `title?: string`
- Features: automatic breadcrumbs, flash messages via Snackbar, onboarding wizard, online users context
- Automatically handles tenant headers in axios

<code-snippet name="AppLayout Usage" lang="tsx">
import AppLayout from '@/layouts/AppLayout';

export default function MyPage({ auth, data }: PageProps & { data: MyData }) {
  return (
    <AppLayout user={auth.user} title="My Page Title">
      {/* Your content here */}
    </AppLayout>
  );
}
</code-snippet>

**Other Layouts**:
- `AuthLayout.tsx` - For authentication pages
- `CentralLayout.tsx` - For central/admin pages
- Settings and configuration layouts available in `resources/js/layouts/`

### Custom Hooks

**useRolesPermissions** (`resources/js/hooks/useRolesPermissions.ts`):
- Check user roles and permissions
- Returns `{ role, can }` functions

<code-snippet name="useRolesPermissions Example" lang="tsx">
import { useRolesPermissions } from '@/hooks/useRolesPermissions';

function MyComponent({ auth }: PageProps) {
  const { role, can } = useRolesPermissions(auth.user);

  if (role('admin')) {
    // Admin only content
  }

  if (can('edit-users')) {
    // User has permission
  }
}
</code-snippet>

**useLocalStorage** (`resources/js/hooks/useLocalStorage.ts`):
- Persist state in localStorage with React state sync
- Usage: `const [value, setValue] = useLocalStorage('key', defaultValue);`

**Other Hooks Available**:
- `useLocalStorageObject.ts` - For objects in localStorage
- `useSearchParams.ts` - URL search params management
- `useQueryParam.ts` - Single query param management
- `useExitPromt.ts` - Warn before leaving page with unsaved changes
- `use-mobile-navigation.ts` - Mobile nav state

### Formik-Integrated Components

All form components in `resources/js/components/ui/` are **Formik-integrated** - they use `useField` internally.

**Autocomplete** (`resources/js/components/ui/Autocomplete.tsx`):
<code-snippet name="Formik Autocomplete" lang="tsx">
import Autocomplete from '@/components/ui/Autocomplete';
import { Formik, Form } from 'formik';

<Formik initialValues={{ country: null }}>
  <Form>
    <Autocomplete
      name="country"
      label="Select Country"
      options={countries}
      getOptionLabel={(option) => option.name}
    />
  </Form>
</Formik>
</code-snippet>

**DatePicker** (`resources/js/components/ui/DatePicker.tsx`):
<code-snippet name="Formik DatePicker" lang="tsx">
import DatePicker from '@/components/ui/DatePicker';

<DatePicker
  name="birthDate"
  label="Data di nascita"
/>
// Automatically integrated with Formik field state
</code-snippet>

**Other Formik Components Available**:
- `TextField.tsx` - Formik-integrated text field
- `MoneyTextField.tsx` - Money input with formatting
- `ColorInput.tsx` - Color picker
- `Checkbox.tsx` - Formik checkbox
- `DateTimePicker.tsx` - Date and time picker
- `RadioButtonsGroup.tsx` - Radio group

### Utility Functions

**cn() function** (`resources/js/lib/utils.ts`):
- Merge Tailwind classes with clsx
- Usage: `cn('base-class', condition && 'conditional-class', props.className)`

### Third-Party Library Integration

**Ziggy (Laravel Routes in JS)**:
<code-snippet name="Ziggy route() Function" lang="tsx">
import { router } from '@inertiajs/react';

// Generate URL with route name
route('app.customers.show', { customer: 123, tenant: tenantId })

// Navigate using Inertia router
router.get(route('dashboard'))
router.post(route('api.save'), formData)
</code-snippet>

**Formik (Form Management)**:
- All forms use Formik for state management and validation
- Custom components are pre-integrated with Formik's `useField`
- Always use Formik's `<Form>` component

**MUI X Date Pickers**:
- `@mui/x-date-pickers` used for all date/time inputs
- Wrapped in custom components with Formik integration

**Axios Configuration**:
- Automatically includes tenant header: `X-Tenant` header set in AppLayout
- Base URL configured for API calls
- Use directly: `axios.post(route('api.endpoint'), data)`

**Lucide React (Icons)**:
- Icon library: `lucide-react`
- Import specific icons: `import { User, Settings } from 'lucide-react'`

**Laravel Echo**:
- Real-time events with `@laravel/echo-react`
- OnlineUsersProvider context available in AppLayout

### PageProps Pattern

**All pages receive PageProps** from Inertia with these properties:
<code-snippet name="PageProps Interface" lang="tsx">
interface PageProps {
  auth: {
    user: User;  // Current authenticated user
  };
  success: boolean;
  app_config: {
    [key: string]: string | number;
  };
  flash: {
    status: 'success' | 'info' | 'warning' | 'error' | undefined;
    message: string;
  };
  currentTenantId: string;  // Active tenant ID
  tenant?: {  // Tenant info (if in tenant context)
    id: string;
    name: string;
    onboarding_completed_at: string | null;
    trial_ends_at: string | null;
  };
}
</code-snippet>

**Extending PageProps**:
<code-snippet name="Custom Page Props" lang="tsx">
interface MyPageProps extends PageProps {
  // Use different prop name if conflicts with PageProps.tenant
  customData: MyDataType;
}

export default function MyPage({ auth, customData }: MyPageProps) {
  // ...
}
</code-snippet>

### Component Organization

**Tailwind Components** (`resources/js/components/tailwind/`):
- shadcn/ui components adapted for this project
- Use these for Tailwind-styled UI primitives

**MUI Components** (`resources/js/components/ui/` with capitalized names):
- Custom MUI-based components
- Formik-integrated form controls

**Domain Components**:
- `resources/js/components/customers/` - Customer-related
- `resources/js/components/products/` - Product-related
- `resources/js/components/sales/` - Sales-related
- `resources/js/components/price-list/` - Price list components

### Best Practices

1. **Always check existing components** before creating new ones
2. **Use Formik-integrated components** for all form fields
3. **Use route() helper** instead of hardcoded URLs
4. **Extend PageProps correctly** - avoid conflicts with built-in properties
5. **Use AppLayout** for authenticated pages with sidebar
6. **Check hooks directory** before implementing custom state logic
7. **Use cn() utility** for conditional class merging with Tailwind


=== tests rules ===

## Test Enforcement

- Every change must be programmatically tested. Write a new test or update an existing test, then run the affected tests to make sure they pass.
- Run the minimum number of tests needed to ensure code quality and speed. Use `php artisan test` with a specific filename or filter.
</laravel-boost-guidelines>