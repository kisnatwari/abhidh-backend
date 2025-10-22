# Quick Reference Guide

> Fast lookup for common tasks and patterns in the Abhidh Backend application

---

## 🚀 Common Commands

### Development
```bash
# Start development server with hot reload
composer dev

# Start with SSR
composer dev:ssr

# Run tests
composer test

# Format code
npm run format

# Check types
npm run types

# Lint code
npm run lint
```

### Database
```bash
# Run migrations
php artisan migrate

# Fresh migration + seed
php artisan migrate:fresh --seed

# Create migration
php artisan make:migration create_table_name

# Create model with migration and factory
php artisan make:model ModelName -mf
```

### File Storage
```bash
# Create storage symlink
php artisan storage:link

# Clear storage cache
php artisan cache:clear
php artisan config:clear
php artisan view:clear
```

---

## 🏗️ Code Patterns

### Creating a New Resource

#### 1. Database Migration
```php
// database/migrations/YYYY_MM_DD_HHMMSS_create_items_table.php
Schema::create('items', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->text('description')->nullable();
    $table->timestamps();
});
```

#### 2. Model
```php
// app/Models/Item.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Item extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description'];
    
    protected $casts = [
        'created_at' => 'datetime',
    ];
}
```

#### 3. Factory
```php
// database/factories/ItemFactory.php
namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'description' => fake()->paragraph(),
        ];
    }
}
```

#### 4. Web Controller (Inertia)
```php
// app/Http/Controllers/ItemController.php
namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ItemController extends Controller
{
    public function index()
    {
        $items = Item::latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('items/index', [
            'items' => $items,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        Item::create($validated);

        return redirect()->route('items.index')
            ->with('success', 'Item created successfully.');
    }

    public function update(Request $request, Item $item)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $item->update($validated);

        return redirect()->route('items.index')
            ->with('success', 'Item updated successfully.');
    }

    public function destroy(Item $item)
    {
        $item->delete();

        return redirect()->route('items.index')
            ->with('success', 'Item deleted successfully.');
    }
}
```

#### 5. API Controller
```php
// app/Http/Controllers/Api/ItemController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Item::query();

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $items = $query->latest()->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $items->items(),
            'pagination' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function show(Item $item): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $item,
        ]);
    }
}
```

#### 6. Routes
```php
// routes/web.php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('items', ItemController::class)->except(['update']);
    Route::post('items/{item}', [ItemController::class, 'update'])->name('items.update');
});

// routes/api.php
Route::get('items', [ItemController::class, 'index']);
Route::get('items/{item}', [ItemController::class, 'show']);
```

#### 7. React Page Component
```tsx
// resources/js/pages/items/index.tsx
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { BreadcrumbItem } from '@/types';
import AddItemDialog from './components/add';
import EditItemDialog from './components/edit';
import DeleteItemDialog from './components/delete';

type Item = {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
};

type Paginator<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};

type PageProps = {
    items: Paginator<Item>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Items', href: '/items' }
];

export default function ItemsIndex() {
    const { props } = usePage<PageProps>();
    const pager = props.items;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Items" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Items</h1>
                    <AddItemDialog />
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pager.data.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.description || '—'}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <EditItemDialog item={item} />
                                        <DeleteItemDialog item={item} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
```

---

## 📝 Common TypeScript Types

```typescript
// User type
interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
}

// Paginator type
type Paginator<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    from: number | null;
    to: number | null;
};

// Page props type
type PageProps = {
    auth: { user: User };
    [key: string]: any;
};

// Breadcrumb type
interface BreadcrumbItem {
    title: string;
    href: string;
}
```

---

## 🎨 UI Components Usage

### Button
```tsx
import { Button } from '@/components/ui/button';

<Button variant="default">Click Me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">View</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

### Dialog (Modal)
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

<Dialog>
    <DialogTrigger asChild>
        <Button>Open Dialog</Button>
    </DialogTrigger>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
        </DialogHeader>
        <div>Dialog content goes here</div>
    </DialogContent>
</Dialog>
```

### Form
```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';

const { data, setData, post, errors } = useForm({
    name: '',
    description: '',
});

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/items', {
        onSuccess: () => {
            // Handle success
        },
    });
};

<form onSubmit={handleSubmit} className="space-y-4">
    <div>
        <Label htmlFor="name">Name</Label>
        <Input
            id="name"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
    </div>

    <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
            id="description"
            value={data.description}
            onChange={(e) => setData('description', e.target.value)}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
    </div>

    <Button type="submit">Submit</Button>
</form>
```

### Table
```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

<Table>
    <TableHeader>
        <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
        </TableRow>
    </TableHeader>
    <TableBody>
        {items.map((item) => (
            <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.email}</TableCell>
            </TableRow>
        ))}
    </TableBody>
</Table>
```

---

## 🔐 Authentication Patterns

### Web (Inertia)
```tsx
import { usePage } from '@inertiajs/react';

// Get current user
const { auth } = usePage().props;
const user = auth.user;

// Conditional rendering
{auth.user && <p>Welcome, {auth.user.name}!</p>}
```

### API (Sanctum)
```typescript
// Login
const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
});
const { data } = await response.json();
const token = data.token;

// Authenticated request
const response = await fetch('/api/auth/user', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    },
});
```

---

## 📤 File Upload Patterns

### Inertia Form
```tsx
import { useForm } from '@inertiajs/react';

const { data, setData, post, progress } = useForm({
    image: null as File | null,
});

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/blogs', {
        forceFormData: true, // Important for file uploads
    });
};

<input
    type="file"
    onChange={(e) => setData('image', e.target.files?.[0] || null)}
/>

{progress && <progress value={progress.percentage} max="100" />}
```

### API Upload
```typescript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
});

const result = await response.json();
console.log(result.data.url); // File URL
```

---

## 🔍 Search & Filter Pattern

```tsx
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';

const [search, setSearch] = useState('');

// Debounced search
useEffect(() => {
    const timer = setTimeout(() => {
        router.visit(`/items?search=${search}`, {
            preserveState: true,
            preserveScroll: true,
        });
    }, 350);

    return () => clearTimeout(timer);
}, [search]);

<Input
    placeholder="Search..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
/>
```

---

## 🎯 Routing Patterns

### Type-Safe Routes (Wayfinder)
```typescript
import { blogs, dashboard } from '@/routes';

// Get URL
blogs.index().url         // '/blogs'
blogs.show(5).url         // '/blogs/5'
blogs.update(5).url       // '/blogs/5'

// Get method
blogs.store().method      // 'post'
blogs.update(5).method    // 'post'

// Inertia navigation
import { router } from '@inertiajs/react';

router.visit(blogs.index().url);
router.post(blogs.store().url, data);
```

### Form Actions
```tsx
import { useForm } from '@inertiajs/react';
import { blogs } from '@/routes';

const { post } = useForm({ title: '', content: '' });

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(blogs.store().url);
};
```

---

## 🛠️ Common Utils

### Class Names (cn)
```tsx
import { cn } from '@/lib/utils';

<div className={cn(
    'base-class',
    isActive && 'active-class',
    isPrimary ? 'primary' : 'secondary',
    className // From props
)} />
```

### Date Formatting
```tsx
import { format } from 'date-fns';

format(new Date(blog.created_at), 'PP')       // Jan 1, 2024
format(new Date(blog.created_at), 'PPP')      // January 1, 2024
format(new Date(blog.created_at), 'PPpp')     // Jan 1, 2024, 12:00 PM
```

---

## 🐛 Debugging

### Backend
```php
// Laravel Telescope: /telescope
// View requests, queries, exceptions, logs

// Debug in controller
dd($data);           // Dump and die
dump($data);         // Dump and continue
logger()->info($data); // Log to storage/logs/laravel.log
```

### Frontend
```tsx
// Console log
console.log(data);

// Inertia props
const { props } = usePage();
console.log(props);

// Form errors
const { errors } = useForm();
console.log(errors);
```

---

## 📊 Database Queries

### Eloquent Patterns
```php
// Basic queries
Item::all();
Item::find(1);
Item::where('name', 'like', '%search%')->get();
Item::latest()->paginate(10);

// Relationships
$program->courses;
$program->courses()->where('featured', true)->get();
$course->program;

// Eager loading (avoid N+1)
Program::with('courses')->get();
Course::with('program', 'enrollments')->get();

// Counts
$program->courses()->count();
$program->loadCount('courses');
```

---

## 🎨 Styling Quick Reference

### Common Tailwind Classes
```
Spacing:     p-4, m-2, gap-4, space-y-2
Layout:      flex, grid, grid-cols-3
Sizing:      w-full, h-screen, max-w-md
Typography:  text-xl, font-semibold, text-muted-foreground
Colors:      bg-primary, text-destructive, border-border
Radius:      rounded, rounded-xl, rounded-full
Shadow:      shadow-sm, shadow-md, shadow-lg
```

### Theme Colors
```
background, foreground
card, card-foreground
primary, primary-foreground
secondary, secondary-foreground
muted, muted-foreground
destructive, destructive-foreground
border, input, ring
```

---

## 📱 Responsive Design

```tsx
// Mobile first approach
<div className="
    flex flex-col     /* Mobile: stack vertically */
    md:flex-row       /* Tablet+: side by side */
    gap-4             /* Always 4 units gap */
">
    <div className="w-full md:w-1/2">Left</div>
    <div className="w-full md:w-1/2">Right</div>
</div>

// Hide on mobile
<div className="hidden md:block">Desktop only</div>

// Show only on mobile
<div className="md:hidden">Mobile only</div>
```

---

*This quick reference covers the most common patterns used in daily development.*


