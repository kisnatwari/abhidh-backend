<?php

use App\Http\Controllers\BlogController;
use App\Http\Controllers\TrainerController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\EnrollmentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('blogs', BlogController::class)->except(['update']);
    Route::post('blogs/{blog}', [BlogController::class, 'update'])->name('blogs.update');
    
    Route::resource('trainers', TrainerController::class)->except(['update']);
    Route::post('trainers/{trainer}', [TrainerController::class, 'update'])->name('trainers.update');
    
    Route::resource('galleries', GalleryController::class)->except(['update']);
    Route::post('galleries/{gallery}', [GalleryController::class, 'update'])->name('galleries.update');
    
    Route::resource('programs', ProgramController::class)->except(['update']);
    Route::post('programs/{program}', [ProgramController::class, 'update'])->name('programs.update');
    
    Route::resource('courses', CourseController::class)->except(['update']);
    Route::post('courses/{course}', [CourseController::class, 'update'])->name('courses.update');
    
    Route::resource('enrollments', EnrollmentController::class)->except(['update']);
    Route::post('enrollments/{enrollment}', [EnrollmentController::class, 'update'])->name('enrollments.update');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
