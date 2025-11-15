<?php

use App\Http\Controllers\Academy\PublicAcademyController;
use App\Http\Controllers\Academy\StudentEnrollmentController;
use App\Http\Controllers\Academy\StudentDashboardController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\TrainerController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ContactUsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::controller(PublicAcademyController::class)->group(function () {
    Route::get('/', 'index')->name('academy.home');
    Route::get('/academy/programs', 'programs')->name('academy.programs');
    Route::get('/academy/courses', 'courses')->name('academy.courses');
    Route::get('/academy/self-paced-courses', 'selfPacedCourses')->name('academy.self-paced');
    Route::get('/academy/courses/{course}', 'showCourse')->name('academy.courses.show');
    Route::get('/academy/self-paced-course/{course}', 'selfPacedCourse')->name('academy.self-paced.show');
    Route::get('/academy/galleries', 'galleries')->name('academy.galleries');
    Route::get('/academy/galleries/{gallery}', 'showGallery')->name('academy.galleries.show');
    Route::get('/academy/blog', 'blog')->name('academy.blog');
    Route::get('/academy/blog/{blog:slug}', 'blogShow')->name('academy.blog.show');
    Route::get('/academy/contact', 'contact')->name('academy.contact');
    Route::post('/academy/contact', 'submitContact')->name('academy.contact.submit');
});

Route::middleware(['auth', 'verified'])->prefix('academy')->name('academy.')->group(function () {
    Route::get('dashboard', [StudentDashboardController::class, 'overview'])->name('dashboard');
    Route::get('my-enrollments', [StudentDashboardController::class, 'enrollments'])->name('dashboard.enrollments');
    Route::get('my-enrollments/{enrollment}', [StudentDashboardController::class, 'showEnrollment'])->name('dashboard.enrollments.show');
    Route::post('my-enrollments/{enrollment}/topics/{topic}/start', [StudentDashboardController::class, 'markTopicStarted'])->name('dashboard.enrollments.topics.start');
    Route::post('my-enrollments/{enrollment}/topics/{topic}/complete', [StudentDashboardController::class, 'markTopicCompleted'])->name('dashboard.enrollments.topics.complete');
    Route::get('profile', [StudentDashboardController::class, 'profile'])->name('dashboard.profile');
    Route::put('profile', [StudentDashboardController::class, 'updateProfile'])->name('dashboard.profile.update');
});

Route::middleware(['auth'])->group(function () {
    Route::post('/academy/enrollments', [StudentEnrollmentController::class, 'store'])->name('academy.enrollments.store');
});

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
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
    Route::post('users/invite-admin', [UserController::class, 'inviteAdmin'])->name('users.invite');
    Route::post('users/{user}/verify', [UserController::class, 'verify'])->name('users.verify');
    Route::post('users/{user}/unverify', [UserController::class, 'unverify'])->name('users.unverify');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    Route::get('users/{user}', [UserController::class, 'show'])->name('users.show');
    
    Route::get('contact-us', [ContactUsController::class, 'index'])->name('contact-us.index');
    Route::get('contact-us/{contactUs}', [ContactUsController::class, 'show'])->name('contact-us.show');
    Route::post('contact-us/{contactUs}/reply', [ContactUsController::class, 'reply'])->name('contact-us.reply');
    Route::delete('contact-us/{contactUs}', [ContactUsController::class, 'destroy'])->name('contact-us.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

