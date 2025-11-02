<?php

use App\Http\Controllers\BlogController;
use App\Http\Controllers\TrainerController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
    //return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('blogs', BlogController::class)->except(['update']);
    Route::post('blogs/{blog}', [BlogController::class, 'update'])->name('blogs.update');
    
    Route::resource('trainers', TrainerController::class)->except(['update']);
    Route::post('trainers/{trainer}', [TrainerController::class, 'update'])->name('trainers.update');
    
    Route::resource('galleries', GalleryController::class)->except(['update']);
    Route::post('galleries/{gallery}', [GalleryController::class, 'update'])->name('galleries.update');
    
    Route::resource('teams', TeamController::class)->except(['update']);
    Route::post('teams/{team}', [TeamController::class, 'update'])->name('teams.update');
    
    Route::resource('programs', ProgramController::class)->except(['update']);
    Route::post('programs/{program}', [ProgramController::class, 'update'])->name('programs.update');
    
    Route::resource('courses', CourseController::class)->except(['update']);
    Route::post('courses/{course}', [CourseController::class, 'update'])->name('courses.update');
    
    Route::resource('enrollments', EnrollmentController::class)->except(['update']);
    Route::post('enrollments/{enrollment}', [EnrollmentController::class, 'update'])->name('enrollments.update');
    Route::post('enrollments/{enrollment}/verify', [EnrollmentController::class, 'verify'])->name('enrollments.verify');
    Route::post('enrollments/{enrollment}/unverify', [EnrollmentController::class, 'unverify'])->name('enrollments.unverify');
    
    Route::get('users', [UserController::class, 'index'])->name('users.index');
    Route::get('users/{user}', [UserController::class, 'show'])->name('users.show');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
