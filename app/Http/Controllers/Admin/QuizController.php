<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Quiz;
use App\Models\QuizOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class QuizController extends Controller
{
    public function index(Course $course)
    {
        $quizzes = Quiz::with('options')
            ->where('course_id', $course->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/courses/quizzes/index', [
            'course' => $course,
            'quizzes' => $quizzes,
        ]);
    }

    public function updateSettings(Request $request, Course $course)
    {
        \Log::info('Updating quiz settings for course: ' . $course->id, $request->all());
        $validated = $request->validate([
            'quiz_time_limit_minutes' => 'required|integer|min:0',
            'quiz_pass_marks' => 'required|integer|min:0|max:100',
        ]);

        $course->update($validated);
        \Log::info('Course updated successfully.');

        return back()->with('success', 'Quiz settings updated successfully.');
    }

    public function store(Request $request)
    {
        \Log::info('Storing new quiz question', $request->all());
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'question_text' => 'required|string',
            'options' => 'required|array|min:2',
            'options.*.option_text' => 'required|string',
            'options.*.is_correct' => 'required|boolean',
        ]);

        $hasCorrect = collect($validated['options'])->contains('is_correct', true);
        if (!$hasCorrect) {
            \Log::warning('No correct option selected');
            return back()->withErrors(['options' => 'At least one correct option is required.']);
        }

        DB::transaction(function () use ($validated) {
            $quiz = Quiz::create([
                'course_id' => $validated['course_id'],
                'question_text' => $validated['question_text'],
            ]);

            foreach ($validated['options'] as $option) {
                QuizOption::create([
                    'quiz_id' => $quiz->id,
                    'option_text' => $option['option_text'],
                    'is_correct' => $option['is_correct'],
                ]);
            }
        });

        \Log::info('Quiz question stored successfully.');
        return back()->with('success', 'Quiz question added successfully.');
    }

    public function bulkUpload(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'file' => 'required|file|mimes:csv,txt',
        ]);

        $courseId = $request->input('course_id');
        $file = $request->file('file');
        
        $results = [
            'success_count' => 0,
            'errors' => [],
        ];

        if (($handle = fopen($file->getRealPath(), "r")) !== FALSE) {
            $header = fgetcsv($handle, 1000, ",");
            // Normalize headers
            $header = array_map('strtolower', array_map('trim', $header));
            
            $rowNum = 2; // Starting after header
            while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                if (count($header) !== count($data)) {
                    $results['errors'][] = "Row {$rowNum}: Column count mismatch.";
                    $rowNum++;
                    continue;
                }

                $row = array_combine($header, $data);
                
                $validator = Validator::make($row, [
                    'question' => 'required|string',
                    'option_1' => 'required|string',
                    'option_2' => 'required|string',
                    'correct_options' => 'required|string', // comma separated indices like "1,3"
                ]);

                if ($validator->fails()) {
                    $results['errors'][] = "Row {$rowNum}: " . implode(', ', $validator->errors()->all());
                    $rowNum++;
                    continue;
                }

                try {
                    DB::transaction(function () use ($row, $courseId, &$results) {
                        $quiz = Quiz::create([
                            'course_id' => $courseId,
                            'question_text' => $row['question'],
                        ]);

                        $correctIndices = explode(',', $row['correct_options']);
                        $correctIndices = array_map('trim', $correctIndices);

                        // Dynamic options
                        for ($i = 1; $i <= 10; $i++) {
                            $key = "option_{$i}";
                            if (isset($row[$key]) && !empty(trim($row[$key]))) {
                                QuizOption::create([
                                    'quiz_id' => $quiz->id,
                                    'option_text' => trim($row[$key]),
                                    'is_correct' => in_array((string)$i, $correctIndices),
                                ]);
                            }
                        }
                        $results['success_count']++;
                    });
                } catch (\Exception $e) {
                    $results['errors'][] = "Row {$rowNum}: Database error - " . $e->getMessage();
                }

                $rowNum++;
            }
            fclose($handle);
        }

        return back()->with([
            'success' => $results['success_count'] . ' questions uploaded successfully.',
            'upload_report' => $results,
        ]);
    }

    public function destroy(Quiz $quiz)
    {
        $quiz->delete();
        return back()->with('success', 'Quiz question deleted.');
    }
}
