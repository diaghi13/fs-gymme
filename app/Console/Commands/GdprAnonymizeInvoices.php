<?php

namespace App\Console\Commands;

use App\Services\Sale\GdprComplianceService;
use Illuminate\Console\Command;

class GdprAnonymizeInvoices extends Command
{
    protected $signature = 'gdpr:anonymize-invoices
                            {--dry-run : Run in preview mode without making changes}
                            {--force : Skip confirmation prompt}';

    protected $description = 'Anonymize electronic invoices beyond legal retention period (10 years) for GDPR compliance';

    public function handle(GdprComplianceService $service): int
    {
        $this->info('🔒 GDPR Compliance: Electronic Invoice Anonymization');
        $this->newLine();

        $dryRun = $this->option('dry-run');
        $force = $this->option('force');

        if ($dryRun) {
            $this->warn('⚠️  DRY RUN MODE: No data will be modified');
            $this->newLine();
        }

        $dashboard = $service->getRetentionDashboard();

        $this->info('📊 Current Status:');
        $this->table(
            ['Metric', 'Value'],
            [
                ['Legal Retention Period', $dashboard['retention_years'].' years'],
                ['Retention Deadline', $dashboard['retention_deadline']],
                ['Total Invoices', $dashboard['stats']['total_invoices']],
                ['Expired (Not Anonymized)', $dashboard['stats']['expired_not_anonymized']],
                ['Near Expiry (3 months)', $dashboard['stats']['near_expiry']],
                ['Already Anonymized', $dashboard['stats']['already_anonymized']],
            ]
        );

        $this->newLine();

        $compliance = $dashboard['compliance_status'];
        $statusColor = match ($compliance['status']) {
            'compliant' => 'info',
            'warning' => 'warn',
            'critical' => 'error',
            default => 'info',
        };

        $this->components->{$statusColor}(
            sprintf(
                'Compliance: %s%% (%d/%d anonymized)',
                $compliance['compliance_percentage'],
                $compliance['anonymized'],
                $compliance['total_expired']
            )
        );

        if ($dashboard['stats']['expired_not_anonymized'] === 0) {
            $this->components->success('✅ No invoices need anonymization. System is compliant!');

            return Command::SUCCESS;
        }

        $this->newLine();

        if (! $force && ! $dryRun) {
            if (! $this->confirm(sprintf(
                'Do you want to anonymize %d expired invoices?',
                $dashboard['stats']['expired_not_anonymized']
            ))) {
                $this->components->warn('Operation cancelled by user.');

                return Command::FAILURE;
            }
        }

        $this->info('🔄 Processing anonymization...');
        $this->newLine();

        $result = $service->anonymizeExpiredInvoices($dryRun);

        $this->info('✅ Process Completed:');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Total Found', $result['total_found']],
                ['Successfully Anonymized', $result['anonymized']],
                ['Failed', $result['failed']],
            ]
        );

        if ($dryRun) {
            $this->newLine();
            $this->warn('⚠️  DRY RUN: No data was modified. Run without --dry-run to apply changes.');
        } else {
            $this->newLine();
            $this->components->success(sprintf('✅ Successfully anonymized %d invoices!', $result['anonymized']));

            // Send email notification if configured
            $this->sendEmailNotification($service, $result);
        }

        return Command::SUCCESS;
    }

    /**
     * Send email notification to admins
     */
    protected function sendEmailNotification(GdprComplianceService $service, array $result): void
    {
        try {
            $dashboard = $service->getRetentionDashboard();
            $adminEmails = \App\Models\TenantSetting::get('email.admin_recipients', []);

            if (empty($adminEmails)) {
                $adminEmails = [tenant('email')];
            }

            $adminEmails = array_filter($adminEmails, fn ($email) => filter_var($email, FILTER_VALIDATE_EMAIL));

            if (empty($adminEmails)) {
                $this->warn('⚠️  No valid admin emails configured for notifications');

                return;
            }

            $mailable = new \App\Mail\GdprComplianceAlert(
                dashboard: $dashboard,
                result: $result,
                tenantName: tenant('name') ?? 'Tenant'
            );

            foreach ($adminEmails as $email) {
                \Illuminate\Support\Facades\Mail::to($email)->send($mailable);
            }

            $this->info(sprintf('📧 Email notifications sent to %d recipient(s)', count($adminEmails)));
        } catch (\Exception $e) {
            $this->warn('⚠️  Failed to send email notifications: '.$e->getMessage());
        }
    }
}
