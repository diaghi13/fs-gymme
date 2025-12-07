<?php

namespace App\Http\Controllers\Application;

use App\Enums\SaleStatusEnum;
use App\Http\Controllers\Controller;
use App\Mail\PaymentReminderMail;
use App\Models\Sale\Payment;
use App\Models\Sale\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Response as ResponseFacade;
use Inertia\Inertia;
use Inertia\Response;

class AccountingController extends Controller
{
    /**
     * Display journal entries (Prima Nota)
     */
    public function journalEntries(Request $request): Response
    {
        $this->authorize('accounting.view_journal');

        $query = Sale::query()
            ->with([
                'customer:id,first_name,last_name',
                'financial_resource:id,name',
                'payments.payment_method:id,description',
            ])
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc');

        // Date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        // Financial resource filter
        if ($request->filled('financial_resource_id')) {
            $query->where('financial_resource_id', $request->financial_resource_id);
        }

        // Status filter - only saved and sent sales (exclude draft and canceled)
        $query->whereIn('status', [SaleStatusEnum::SAVED, SaleStatusEnum::SENT]);

        $sales = $query->get();

        // Group by date and calculate totals
        $entriesByDate = $sales->groupBy(function ($sale) {
            return $sale->date->format('Y-m-d');
        })->map(function ($daySales) {
            $entries = collect();

            foreach ($daySales as $sale) {
                // Add sale entry
                $entries->push([
                    'id' => $sale->id,
                    'type' => 'sale',
                    'time' => $sale->date->format('H:i'),
                    'customer_name' => $sale->customer->first_name.' '.$sale->customer->last_name,
                    'customer_id' => $sale->customer->id,
                    'amount' => $sale->sale_summary['final_total'] ?? 0,
                    'financial_resource' => $sale->financial_resource->name ?? 'N/A',
                    'sale_number' => $sale->progressive_number,
                ]);

                // Add payment entries
                foreach ($sale->payments->where('payed_at') as $payment) {
                    $entries->push([
                        'id' => 'payment-'.$payment->id,
                        'type' => 'payment',
                        'time' => $payment->payed_at->format('H:i'),
                        'customer_name' => $sale->customer->first_name.' '.$sale->customer->last_name,
                        'customer_id' => $sale->customer->id,
                        'amount' => $payment->amount,
                        'financial_resource' => $payment->payment_method->description ?? 'N/A',
                        'sale_number' => $sale->progressive_number,
                        'payment_id' => $payment->id,
                    ]);
                }
            }

            return [
                'entries' => $entries->sortBy('time')->values(),
                'daily_total' => $entries->sum('amount'),
            ];
        });

        $periodTotal = $sales->sum(function ($sale) {
            return $sale->sale_summary['final_total'] ?? 0;
        });

        return Inertia::render('accounting/journal-entries', [
            'entriesByDate' => $entriesByDate,
            'periodTotal' => $periodTotal,
            'filters' => $request->only(['date_from', 'date_to', 'financial_resource_id']),
        ]);
    }

    /**
     * Display pending payments (Pagamenti In Sospeso)
     */
    public function pendingPayments(Request $request): Response
    {
        $this->authorize('accounting.view_receivables');

        $query = Payment::query()
            ->with([
                'payment_method:id,description',
                'sale.customer:id,first_name,last_name,email,phone',
            ])
            ->whereNull('payed_at')
            ->orderBy('due_date', 'asc');

        // Status filter
        $status = $request->input('status', 'overdue');

        if ($status === 'overdue') {
            $query->whereDate('due_date', '<', now());
        } elseif ($status === 'upcoming') {
            $query->whereDate('due_date', '>=', now())
                ->whereDate('due_date', '<=', now()->addDays(7));
        }
        // 'all' = no additional filter

        // Customer filter
        if ($request->filled('customer_id')) {
            $query->whereHas('sale', function ($q) use ($request) {
                $q->where('customer_id', $request->customer_id);
            });
        }

        $payments = $query->get()->map(function ($payment) {
            $sale = $payment->sale;

            $daysOverdue = $payment->due_date->isPast()
                ? $payment->due_date->diffInDays(now())
                : 0;

            return [
                'id' => $payment->id,
                'sale_id' => $payment->sale_id,
                'sale_number' => $sale->progressive_number ?? 'N/A',
                'customer' => [
                    'id' => $sale->customer->id,
                    'name' => $sale->customer->first_name.' '.$sale->customer->last_name,
                    'email' => $sale->customer->email,
                    'phone' => $sale->customer->phone,
                ],
                'amount' => $payment->amount,
                'due_date' => $payment->due_date->format('Y-m-d'),
                'days_overdue' => $daysOverdue,
                'status' => $payment->status,
                'payment_method' => $payment->payment_method->description ?? 'N/A',
            ];
        });

        // Statistics
        $allPending = Payment::with('sale')->whereNull('payed_at')->get();
        $statistics = [
            'total_receivables' => $allPending->sum('amount'),
            'overdue_count' => $allPending->filter(fn ($p) => $p->due_date->isPast())->count(),
            'customers_with_overdue' => $allPending
                ->filter(fn ($p) => $p->due_date->isPast())
                ->pluck('sale.customer_id')
                ->unique()
                ->count(),
            'average_days_overdue' => $allPending
                ->filter(fn ($p) => $p->due_date->isPast())
                ->avg(fn ($p) => $p->due_date->diffInDays(now())),
        ];

        return Inertia::render('accounting/pending-payments', [
            'payments' => $payments,
            'statistics' => $statistics,
            'filters' => $request->only(['status', 'customer_id']),
        ]);
    }

    /**
     * Export journal entries to CSV
     */
    public function exportJournalEntries(Request $request)
    {
        $this->authorize('accounting.export');

        $query = Sale::query()
            ->with([
                'customer:id,first_name,last_name',
                'financial_resource:id,name',
                'payments.payment_method:id,description',
            ])
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc');

        // Date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        // Financial resource filter
        if ($request->filled('financial_resource_id')) {
            $query->where('financial_resource_id', $request->financial_resource_id);
        }

        // Status filter - only saved and sent sales
        $query->whereIn('status', [SaleStatusEnum::SAVED, SaleStatusEnum::SENT]);

        $sales = $query->get();

        // Generate CSV
        $csv = $this->generateJournalEntriesCsv($sales);

        $filename = 'prima_nota_'.now()->format('Y-m-d_His').'.csv';

        return ResponseFacade::make($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Export pending payments to CSV
     */
    public function exportPendingPayments(Request $request)
    {
        $this->authorize('accounting.export');

        $query = Payment::query()
            ->with([
                'payment_method:id,description',
                'sale.customer:id,first_name,last_name,email,phone',
            ])
            ->whereNull('payed_at')
            ->orderBy('due_date', 'asc');

        // Status filter
        $status = $request->input('status', 'overdue');

        if ($status === 'overdue') {
            $query->whereDate('due_date', '<', now());
        } elseif ($status === 'upcoming') {
            $query->whereDate('due_date', '>=', now())
                ->whereDate('due_date', '<=', now()->addDays(7));
        }

        // Customer filter
        if ($request->filled('customer_id')) {
            $query->whereHas('sale', function ($q) use ($request) {
                $q->where('customer_id', $request->customer_id);
            });
        }

        $payments = $query->get();

        // Generate CSV
        $csv = $this->generatePendingPaymentsCsv($payments);

        $filename = 'pagamenti_sospeso_'.now()->format('Y-m-d_His').'.csv';

        return ResponseFacade::make($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Generate CSV content for journal entries
     */
    private function generateJournalEntriesCsv($sales): string
    {
        $csv = "Data;Ora;Tipo;Cliente;Documento;Importo (€);Cassa/Banca\n";

        foreach ($sales as $sale) {
            // Add sale entry
            $csv .= sprintf(
                "%s;%s;%s;%s;%s;%s;%s\n",
                $sale->date->format('d/m/Y'),
                $sale->date->format('H:i'),
                'Vendita',
                $sale->customer->first_name.' '.$sale->customer->last_name,
                $sale->progressive_number,
                number_format(($sale->sale_summary['final_total'] ?? 0) / 100, 2, ',', '.'),
                $sale->financial_resource->name ?? 'N/A'
            );

            // Add payment entries
            foreach ($sale->payments->where('payed_at') as $payment) {
                $csv .= sprintf(
                    "%s;%s;%s;%s;%s;%s;%s\n",
                    $payment->payed_at->format('d/m/Y'),
                    $payment->payed_at->format('H:i'),
                    'Pagamento',
                    $sale->customer->first_name.' '.$sale->customer->last_name,
                    $sale->progressive_number,
                    number_format($payment->amount / 100, 2, ',', '.'),
                    $payment->payment_method->description ?? 'N/A'
                );
            }
        }

        return $csv;
    }

    /**
     * Generate CSV content for pending payments
     */
    private function generatePendingPaymentsCsv($payments): string
    {
        $csv = "Cliente;Email;Telefono;Documento;Scadenza;Giorni Ritardo;Importo (€);Metodo Pagamento\n";

        foreach ($payments as $payment) {
            $daysOverdue = $payment->due_date->isPast()
                ? $payment->due_date->diffInDays(now())
                : 0;

            $csv .= sprintf(
                "%s;%s;%s;%s;%s;%d;%s;%s\n",
                $payment->sale->customer->first_name.' '.$payment->sale->customer->last_name,
                $payment->sale->customer->email ?? '',
                $payment->sale->customer->phone ?? '',
                $payment->sale->progressive_number ?? 'N/A',
                $payment->due_date->format('d/m/Y'),
                $daysOverdue,
                number_format($payment->amount / 100, 2, ',', '.'),
                $payment->payment_method->description ?? 'N/A'
            );
        }

        return $csv;
    }

    /**
     * Mark a payment as paid
     */
    public function markAsPaid(Request $request, Payment $payment)
    {
        $this->authorize('accounting.manage_payments');

        $validated = $request->validate([
            'payed_at' => ['nullable', 'date'],
        ]);

        $payment->update([
            'payed_at' => $validated['payed_at'] ?? now(),
        ]);

        return redirect()->back()->with('success', 'Pagamento segnato come pagato con successo');
    }

    /**
     * Send payment reminder email
     */
    public function sendReminder(Payment $payment)
    {
        $this->authorize('accounting.manage_payments');

        // Check if payment is already paid
        if ($payment->payed_at) {
            return redirect()->back()->with('error', 'Il pagamento è già stato registrato come pagato');
        }

        // Check if customer has email
        $customer = $payment->sale->customer;
        if (! $customer->email) {
            return redirect()->back()->with('error', 'Il cliente non ha un indirizzo email configurato');
        }

        $daysOverdue = $payment->due_date->isPast()
            ? $payment->due_date->diffInDays(now())
            : 0;

        $customerName = $customer->first_name.' '.$customer->last_name;

        // Send email
        Mail::to($customer->email)->send(
            new PaymentReminderMail($payment, $customerName, $daysOverdue)
        );

        return redirect()->back()->with('success', 'Email di promemoria inviata con successo a '.$customer->email);
    }
}
