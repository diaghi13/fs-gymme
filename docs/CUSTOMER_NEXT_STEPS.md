# Customer System - Next Steps Implementation Plan
**Data**: 13 Gennaio 2025

## 🎯 Priorità Implementazione Customer

Basandoci sul sistema completato, ecco i prossimi step in ordine di priorità:

---

## 1️⃣ PRIORITÀ ALTA - Charts & Grafici Progressione

### Obiettivo
Visualizzare l'andamento delle misurazioni nel tempo con grafici interattivi.

### Implementazione

#### Libraries da installare
```bash
npm install recharts date-fns
```

#### Component: MeasurementChartsTab
**File**: `resources/js/components/customers/tabs/MeasurementChartsTab.tsx`

**Features**:
- **Weight Progress Chart**: Grafico linea peso nel tempo
- **BMI Trend Chart**: Andamento BMI
- **Body Composition Chart**: % Grasso vs % Magra
- **Measurements Comparison**: Radar chart circonferenze
- **Period Selector**: Ultimo mese, 3 mesi, 6 mesi, anno, tutto

**UI**:
```tsx
<Box>
  <Stack direction="row" spacing={2} mb={3}>
    <ToggleButtonGroup value={period}>
      <ToggleButton value="1m">1 Mese</ToggleButton>
      <ToggleButton value="3m">3 Mesi</ToggleButton>
      <ToggleButton value="6m">6 Mesi</ToggleButton>
      <ToggleButton value="1y">Anno</ToggleButton>
      <ToggleButton value="all">Tutto</ToggleButton>
    </ToggleButtonGroup>
  </Stack>

  <Grid container spacing={3}>
    <Grid size={12} md={6}>
      <Card>
        <CardHeader title="Progressione Peso" />
        <CardContent>
          <LineChart data={weightData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="weight" />
          </LineChart>
        </CardContent>
      </Card>
    </Grid>

    <Grid size={12} md={6}>
      <Card>
        <CardHeader title="Andamento BMI" />
        <CardContent>
          <LineChart data={bmiData}>
            {/* ... */}
          </LineChart>
        </CardContent>
      </Card>
    </Grid>

    {/* Body Composition */}
    <Grid size={12}>
      <Card>
        <CardHeader title="Composizione Corporea" />
        <CardContent>
          <ComposedChart data={compositionData}>
            <Bar dataKey="body_fat" fill="#f44336" />
            <Bar dataKey="lean_mass" fill="#4caf50" />
          </ComposedChart>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
</Box>
```

**Tempo stimato**: 4-6 ore

---

## 2️⃣ PRIORITÀ ALTA - Customer Import/Export

### Obiettivo
Importare/esportare anagrafica clienti in massa (CSV, Excel).

### Feature A: Export Customers

#### Controller Method
**File**: `app/Http/Controllers/Application/Customers/CustomerController.php`

```php
public function export(Request $request)
{
    $customers = Customer::query()
        ->with(['user', 'active_subscriptions'])
        ->get();

    return Excel::download(
        new CustomersExport($customers),
        'clienti_' . now()->format('Y-m-d') . '.xlsx'
    );
}
```

#### Export Class
**File**: `app/Exports/CustomersExport.php`

```php
class CustomersExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Customer::with(['user', 'active_subscriptions'])->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nome',
            'Cognome',
            'Email',
            'Telefono',
            'Data Nascita',
            'Codice Fiscale',
            'Città',
            'CAP',
            'Abbonamenti Attivi',
            'Data Registrazione',
        ];
    }

    public function map($customer): array
    {
        return [
            $customer->id,
            $customer->first_name,
            $customer->last_name,
            $customer->email,
            $customer->phone,
            $customer->birth_date?->format('d/m/Y'),
            $customer->tax_id_code,
            $customer->city,
            $customer->zip,
            $customer->active_subscriptions->count(),
            $customer->created_at->format('d/m/Y H:i'),
        ];
    }
}
```

**UI Button**:
```tsx
<Button
  variant="outlined"
  startIcon={<Download />}
  onClick={handleExport}
>
  Esporta Clienti
</Button>
```

### Feature B: Import Customers

#### Controller Method
```php
public function import(Request $request, CustomerService $service)
{
    $request->validate([
        'file' => 'required|file|mimes:csv,xlsx,xls|max:10240'
    ]);

    $import = new CustomersImport($service);
    Excel::import($import, $request->file('file'));

    return redirect()->back()->with('success', 
        "Importati {$import->getRowCount()} clienti"
    );
}
```

#### Import Class
**File**: `app/Imports/CustomersImport.php`

```php
class CustomersImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        return $this->customerService->createWithUser([
            'first_name' => $row['nome'],
            'last_name' => $row['cognome'],
            'email' => $row['email'],
            'phone' => $row['telefono'],
            'birth_date' => $row['data_nascita'],
            'tax_id_code' => $row['codice_fiscale'],
            'city' => $row['citta'],
            'zip' => $row['cap'],
            'gdpr_consent' => true,
        ]);
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email|unique:customers,email',
            'nome' => 'required',
            'cognome' => 'required',
        ];
    }
}
```

**UI Component**:
```tsx
<Box>
  <Typography variant="h6">Importa Clienti</Typography>
  <input
    type="file"
    accept=".csv,.xlsx,.xls"
    onChange={handleFileUpload}
  />
  <Button type="submit">Carica File</Button>
</Box>
```

**Tempo stimato**: 6-8 ore

---

## 3️⃣ PRIORITÀ MEDIA - Duplicate Detection

### Obiettivo
Rilevare clienti duplicati prima dell'inserimento (fuzzy matching).

### Implementazione

#### Service Method
**File**: `app/Services/Customer/CustomerService.php`

```php
public function findPotentialDuplicates(array $data): Collection
{
    $query = Customer::query();

    // Exact email match
    if (!empty($data['email'])) {
        $emailMatch = $query->where('email', $data['email'])->first();
        if ($emailMatch) {
            return collect([$emailMatch]);
        }
    }

    // Fuzzy match on name + birthdate
    $duplicates = Customer::query()
        ->where(function($q) use ($data) {
            // Similar first name
            $q->where('first_name', 'LIKE', '%' . $data['first_name'] . '%')
              ->orWhere('last_name', 'LIKE', '%' . $data['last_name'] . '%');
        })
        ->when(!empty($data['birth_date']), function($q) use ($data) {
            $q->where('birth_date', $data['birth_date']);
        })
        ->limit(5)
        ->get();

    return $duplicates;
}
```

#### Controller Method
```php
public function checkDuplicates(Request $request, CustomerService $service)
{
    $duplicates = $service->findPotentialDuplicates($request->all());

    return response()->json([
        'has_duplicates' => $duplicates->isNotEmpty(),
        'duplicates' => $duplicates,
    ]);
}
```

#### Frontend Integration
Nel `CustomerForm.tsx`, prima del submit:
```tsx
const checkDuplicates = async (values) => {
    const response = await axios.post(
        route('api.v1.customers.check-duplicates'),
        values
    );

    if (response.data.has_duplicates) {
        setDuplicates(response.data.duplicates);
        setShowDuplicateDialog(true);
        return false; // Block submit
    }

    return true;
};
```

**Dialog**:
```tsx
<Dialog open={showDuplicateDialog}>
  <DialogTitle>Possibili Duplicati Trovati</DialogTitle>
  <DialogContent>
    <Alert severity="warning">
      Trovati {duplicates.length} clienti simili. Vuoi continuare?
    </Alert>
    <List>
      {duplicates.map(dup => (
        <ListItem key={dup.id}>
          <ListItemText
            primary={`${dup.first_name} ${dup.last_name}`}
            secondary={`${dup.email} - ${dup.birth_date}`}
          />
        </ListItem>
      ))}
    </List>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCancel}>Annulla</Button>
    <Button onClick={handleContinueAnyway} color="primary">
      Continua Comunque
    </Button>
  </DialogActions>
</Dialog>
```

**Tempo stimato**: 4-5 ore

---

## 4️⃣ PRIORITÀ MEDIA - Customer Merge

### Obiettivo
Unire due clienti duplicati mantenendo lo storico.

### Implementazione

#### Service Method
```php
public function mergecustomers(Customer $mainCustomer, Customer $duplicateCustomer): Customer
{
    DB::transaction(function() use ($mainCustomer, $duplicateCustomer) {
        // Merge subscriptions
        $duplicateCustomer->subscriptions()->update([
            'customer_id' => $mainCustomer->id
        ]);

        // Merge sales
        $duplicateCustomer->sales()->update([
            'customer_id' => $mainCustomer->id
        ]);

        // Merge measurements
        $duplicateCustomer->measurements()->update([
            'customer_id' => $mainCustomer->id
        ]);

        // Merge files
        $duplicateCustomer->files()->update([
            'fileable_id' => $mainCustomer->id
        ]);

        // Update main customer with missing data
        if (!$mainCustomer->phone && $duplicateCustomer->phone) {
            $mainCustomer->phone = $duplicateCustomer->phone;
        }
        
        if (!$mainCustomer->birth_date && $duplicateCustomer->birth_date) {
            $mainCustomer->birth_date = $duplicateCustomer->birth_date;
        }

        // Save notes about merge
        $mainCustomer->notes = ($mainCustomer->notes ?? '') . 
            "\n[MERGE] Cliente unito con ID {$duplicateCustomer->id} il " . now()->format('d/m/Y H:i');
        
        $mainCustomer->save();

        // Soft delete duplicate
        $duplicateCustomer->delete();
    });

    return $mainCustomer->fresh();
}
```

#### Controller
```php
public function merge(Customer $mainCustomer, Customer $duplicateCustomer, CustomerService $service)
{
    $this->authorize('merge', Customer::class);

    $merged = $service->mergeCustomers($mainCustomer, $duplicateCustomer);

    return redirect()
        ->route('app.customers.show', $merged)
        ->with('success', 'Clienti uniti con successo');
}
```

#### UI
```tsx
<Button
  variant="outlined"
  color="warning"
  startIcon={<MergeType />}
  onClick={handleMerge}
>
  Unisci con altro cliente
</Button>
```

**Tempo stimato**: 5-6 ore

---

## 5️⃣ PRIORITÀ BASSA - Goal Tracking

### Obiettivo
Permettere di impostare obiettivi di peso/composizione corporea.

### Database Migration
```php
Schema::create('customer_measurement_goals', function (Blueprint $table) {
    $table->id();
    $table->foreignId('customer_id')->constrained()->onDelete('cascade');
    $table->string('type'); // weight, body_fat, bmi, circumference
    $table->decimal('target_value', 8, 2);
    $table->decimal('starting_value', 8, 2);
    $table->date('target_date');
    $table->string('status'); // in_progress, achieved, abandoned, expired
    $table->date('achieved_at')->nullable();
    $table->text('notes')->nullable();
    $table->timestamps();
});
```

#### Model
```php
class CustomerMeasurementGoal extends Model
{
    protected $fillable = [
        'customer_id',
        'type',
        'target_value',
        'starting_value',
        'target_date',
        'status',
        'achieved_at',
        'notes',
    ];

    protected $casts = [
        'target_date' => 'date',
        'achieved_at' => 'date',
        'target_value' => 'decimal:2',
        'starting_value' => 'decimal:2',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function getCurrentProgress(): float
    {
        $latest = $this->customer->measurements()->latest()->first();
        
        if (!$latest) return 0;

        $current = match($this->type) {
            'weight' => $latest->weight,
            'body_fat' => $latest->body_fat_percentage,
            'bmi' => $latest->bmi,
            default => null,
        };

        if (!$current) return 0;

        $total = abs($this->target_value - $this->starting_value);
        $progress = abs($current - $this->starting_value);

        return min(100, ($progress / $total) * 100);
    }

    public function checkIfAchieved(): bool
    {
        if ($this->getCurrentProgress() >= 100) {
            $this->update([
                'status' => 'achieved',
                'achieved_at' => now(),
            ]);
            return true;
        }
        return false;
    }
}
```

#### UI Component
```tsx
<Card>
  <CardHeader title="Obiettivi" />
  <CardContent>
    <List>
      {goals.map(goal => (
        <ListItem key={goal.id}>
          <ListItemText
            primary={`${goal.type}: ${goal.target_value}`}
            secondary={`Progresso: ${goal.progress}%`}
          />
          <LinearProgress 
            value={goal.progress} 
            variant="determinate"
          />
        </ListItem>
      ))}
    </List>
    <Button startIcon={<Add />} onClick={handleAddGoal}>
      Aggiungi Obiettivo
    </Button>
  </CardContent>
</Card>
```

**Tempo stimato**: 8-10 ore

---

## 📊 Riepilogo Tempi

| Feature | Priorità | Tempo | Complessità |
|---------|----------|-------|-------------|
| Charts & Grafici | ⭐⭐⭐ ALTA | 4-6h | Media |
| Import/Export | ⭐⭐⭐ ALTA | 6-8h | Media |
| Duplicate Detection | ⭐⭐ MEDIA | 4-5h | Bassa |
| Customer Merge | ⭐⭐ MEDIA | 5-6h | Media |
| Goal Tracking | ⭐ BASSA | 8-10h | Alta |

**Totale stimato**: 27-35 ore (3-5 giorni lavorativi)

---

## 🎯 Roadmap Consigliata

### Sprint 1 (Giorno 1-2): Charts & Visualizzazioni
- Installare Recharts
- Creare MeasurementChartsTab
- 4 grafici principali (peso, BMI, composizione, circonferenze)
- Period selector
- Integrare in customer-show

**Output**: Clienti possono vedere progressi visuali

### Sprint 2 (Giorno 2-3): Import/Export
- Installare Laravel Excel
- CustomersExport
- CustomersImport con validazione
- UI upload/download
- Testing con file campione

**Output**: Staff può gestire anagrafiche in massa

### Sprint 3 (Giorno 3-4): Duplicate Detection & Merge
- Algoritmo fuzzy matching
- API check duplicates
- Frontend dialog conferma
- Merge service con transaction
- Testing merge completo

**Output**: Niente più duplicati nel database

### Sprint 4 (Giorno 4-5): Goal Tracking
- Migration + Model
- Goal CRUD
- Progress calculation
- Achievement detection
- UI goal cards

**Output**: Clienti motivati con obiettivi tracciati

---

## 🚀 Quale Feature Vuoi Implementare Prima?

Consiglio di iniziare con **Charts & Grafici** perché:
1. ✅ Alto valore per l'utente finale
2. ✅ Tempo relativamente breve (4-6h)
3. ✅ Usa dati già esistenti
4. ✅ Non richiede nuove migration
5. ✅ Wow factor immediato

**Procediamo con i grafici?** 📊

