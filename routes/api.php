<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\TrainerController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\ProgramController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\FileUploadController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\ContactUsController;

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// Public read-only content routes (no authentication required)
Route::get('blogs', [BlogController::class, 'index']);
Route::get('blogs/{blog}', [BlogController::class, 'show']);

Route::get('trainers', [TrainerController::class, 'index']);
Route::get('trainers/{trainer}', [TrainerController::class, 'show']);

Route::get('galleries', [GalleryController::class, 'index']);
Route::get('galleries/{gallery}', [GalleryController::class, 'show']);

Route::get('teams', [TeamController::class, 'index']);
Route::get('teams/{team}', [TeamController::class, 'show']);

Route::get('programs', [ProgramController::class, 'index']);
Route::get('programs/{program}', [ProgramController::class, 'show']);

Route::get('courses', [CourseController::class, 'index']);
Route::get('courses/{course}', [CourseController::class, 'show']);
Route::get('courses/programs/list', [CourseController::class, 'programs']);

// Contact Us route (public, no authentication required)
Route::post('contact-us', [ContactUsController::class, 'store']);

// File upload route (no authentication required for now)
Route::post('upload', [FileUploadController::class, 'upload']);
Route::delete('upload', [FileUploadController::class, 'delete']);

// Protected routes (require authentication) - Read-only for enrollments
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('user', [AuthController::class, 'user']);
        Route::post('refresh', [AuthController::class, 'refresh']);
    });

    // Enrollment routes (protected, read-only)
    Route::get('enrollments', [EnrollmentController::class, 'index']);
    Route::get('enrollments/{enrollment}', [EnrollmentController::class, 'show']);
    Route::get('enrollments/options/list', [EnrollmentController::class, 'options']);

    // Payment routes (protected, users can submit payment screenshots)
    Route::post('payments/submit', [PaymentController::class, 'submitPayment']);
});
