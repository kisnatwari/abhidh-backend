<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class FileUploadController extends Controller
{
    /**
     * Handle file upload.
     * Accepts a file, slugifies the name, checks for uniqueness, and stores it locally.
     */
    public function upload(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'file' => ['required', 'file', 'max:10240'], // Max 10MB
            ]);

            $file = $request->file('file');
            
            // Get original filename and extension
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();
            
            // Slugify the filename
            $slugifiedName = Str::slug($originalName);
            
            // Ensure we have a valid filename
            if (empty($slugifiedName)) {
                $slugifiedName = 'file-' . time();
            }
            
            // Generate unique filename
            $filename = $this->generateUniqueFilename($slugifiedName, $extension);
            
            // Store the file in the public disk under 'uploads' directory
            $path = $file->storeAs('uploads', $filename, 'public');
            
            // Generate the URL
            $url = Storage::disk('public')->url($path);
            
            return response()->json([
                'success' => true,
                'message' => 'File uploaded successfully.',
                'data' => [
                    'filename' => $filename,
                    'path' => $path,
                    'url' => $url,
                    'original_name' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ],
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'File upload failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate a unique filename by checking if it exists and appending a number if needed.
     */
    private function generateUniqueFilename(string $slugifiedName, string $extension): string
    {
        $filename = $slugifiedName . '.' . $extension;
        $counter = 1;
        
        // Check if file exists and generate unique name
        while (Storage::disk('public')->exists('uploads/' . $filename)) {
            $filename = $slugifiedName . '-' . $counter . '.' . $extension;
            $counter++;
        }
        
        return $filename;
    }

    /**
     * Delete an uploaded file.
     */
    public function delete(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'path' => ['required', 'string'],
            ]);

            $path = $validated['path'];
            
            // Security check: ensure the path is within the uploads directory
            if (!str_starts_with($path, 'uploads/')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid file path.',
                ], 400);
            }

            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
                
                return response()->json([
                    'success' => true,
                    'message' => 'File deleted successfully.',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'File not found.',
            ], 404);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        }
    }
}



