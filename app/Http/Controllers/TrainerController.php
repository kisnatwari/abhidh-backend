<?php

namespace App\Http\Controllers;

use App\Models\Trainer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TrainerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $trainers = Trainer::latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('trainers/index', [
            'trainers' => $trainers,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'expertise' => ['required', 'string', 'max:255'],
            'years_of_experience' => ['required', 'integer', 'min:0', 'max:50'],
            'photo' => ['nullable', 'image', 'max:2048'], // 2MB limit
        ]);

        // Handle photo upload if provided
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('trainers', 'public');
            $validated['photo_path'] = $path;
        }

        $trainer = Trainer::create($validated);

        return redirect()
            ->route('trainers.index')
            ->with('success', 'Trainer created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Trainer $trainer)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Trainer $trainer)
    {
        return Inertia::render('trainers/edit', [
            'trainer' => $trainer,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Trainer $trainer)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'expertise' => ['required', 'string', 'max:255'],
            'years_of_experience' => ['required', 'integer', 'min:0', 'max:50'],
            'photo' => ['nullable', 'image', 'max:2048'],
        ]);

        // Handle photo upload if provided
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($trainer->photo_path) {
                \Storage::disk('public')->delete($trainer->photo_path);
            }
            $path = $request->file('photo')->store('trainers', 'public');
            $validated['photo_path'] = $path;
        }

        $trainer->update($validated);

        return redirect()
            ->route('trainers.index')
            ->with('success', 'Trainer updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Trainer $trainer)
    {
        // Delete photo if exists
        if ($trainer->photo_path) {
            \Storage::disk('public')->delete($trainer->photo_path);
        }

        $trainer->delete();

        return redirect()
            ->route('trainers.index')
            ->with('success', 'Trainer deleted successfully.');
    }
}
