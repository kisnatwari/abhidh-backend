<?php

namespace App\Http\Controllers;

use App\Models\LegalPage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LegalPageController extends Controller
{
    public function index()
    {
        $pages = LegalPage::latest()->get();
        return Inertia::render('legal-pages/index', ['pages' => $pages]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type'         => ['required', 'in:terms,privacy'],
            'title'        => ['required', 'string', 'max:255'],
            'content'      => ['required', 'string'],
            'is_published' => ['nullable', 'boolean'],
            'published_at' => ['nullable', 'date'],
        ]);

        $validated['is_published'] = (bool) ($validated['is_published'] ?? false);

        if ($validated['is_published'] && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        LegalPage::create($validated);

        return redirect()->route('legal-pages.index')->with('success', 'Legal page created successfully.');
    }

    public function update(Request $request, LegalPage $legalPage)
    {
        $validated = $request->validate([
            'type'         => ['required', 'in:terms,privacy'],
            'title'        => ['required', 'string', 'max:255'],
            'content'      => ['required', 'string'],
            'is_published' => ['nullable', 'boolean'],
            'published_at' => ['nullable', 'date'],
        ]);

        $validated['is_published'] = (bool) ($validated['is_published'] ?? false);

        if ($validated['is_published'] && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $legalPage->update($validated);

        return redirect()->route('legal-pages.index')->with('success', 'Legal page updated successfully.');
    }

    public function destroy(LegalPage $legalPage)
    {
        $legalPage->delete();
        return redirect()->route('legal-pages.index')->with('success', 'Legal page deleted successfully.');
    }

    public function showPrivacy()
    {
        $page = LegalPage::where('type', 'privacy')
            ->where('is_published', true)
            ->latest('published_at')
            ->first();
        return Inertia::render('legal/show', ['page' => $page, 'pageType' => 'Privacy Policy']);
    }

    public function showTerms()
    {
        $page = LegalPage::where('type', 'terms')
            ->where('is_published', true)
            ->latest('published_at')
            ->first();
        return Inertia::render('legal/show', ['page' => $page, 'pageType' => 'Terms of Service']);
    }
}
