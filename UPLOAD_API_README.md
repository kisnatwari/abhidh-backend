# File Upload API

A simple file upload API endpoint that accepts files, slugifies filenames, ensures uniqueness, and stores them locally.

## Features

✅ No database operations required  
✅ Automatic filename slugification  
✅ Unique filename generation with numeric suffixes  
✅ Local storage in `storage/app/public/uploads/`  
✅ Returns file URL for immediate use  
✅ Support for file deletion  
✅ Maximum file size: 10MB  
✅ No authentication required (configurable)

## Setup

### 1. Create Storage Link

Before using the upload API, create a symbolic link from `public/storage` to `storage/app/public`:

```bash
php artisan storage:link
```

**Note:** You need PHP 8.2+ to run this command. If you have PHP 8.1, please upgrade to PHP 8.2 or higher.

### 2. Verify Permissions

Ensure the `storage/app/public` directory has write permissions:

```bash
chmod -R 775 storage/app/public
```

## API Endpoints

### Upload File

**Endpoint:** `POST /api/upload`

**Content-Type:** `multipart/form-data`

**Parameters:**
- `file` (required) - The file to upload (max 10MB)

**Example Request (curl):**
```bash
curl -X POST http://localhost:8000/api/upload \
  -F "file=@/path/to/your/document.pdf"
```

**Example Request (JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
});

const data = await response.json();
console.log(data);
```

**Success Response:**
```json
{
    "success": true,
    "message": "File uploaded successfully.",
    "data": {
        "filename": "my-document-1.pdf",
        "path": "uploads/my-document-1.pdf",
        "url": "http://localhost:8000/storage/uploads/my-document-1.pdf",
        "original_name": "My Document!.pdf",
        "size": 12345,
        "mime_type": "application/pdf"
    }
}
```

### Delete File

**Endpoint:** `DELETE /api/upload`

**Content-Type:** `application/json`

**Parameters:**
- `path` (required) - The file path (e.g., "uploads/filename.pdf")

**Example Request (curl):**
```bash
curl -X DELETE http://localhost:8000/api/upload \
  -H "Content-Type: application/json" \
  -d '{"path":"uploads/my-document-1.pdf"}'
```

**Example Request (JavaScript):**
```javascript
const response = await fetch('/api/upload', {
    method: 'DELETE',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        path: 'uploads/my-document-1.pdf'
    })
});

const data = await response.json();
console.log(data);
```

**Success Response:**
```json
{
    "success": true,
    "message": "File deleted successfully."
}
```

## How It Works

1. **File Reception:** The API receives the uploaded file
2. **Filename Processing:**
   - Extracts the original filename and extension
   - Slugifies the filename (e.g., "My Document!.pdf" → "my-document.pdf")
   - Generates a fallback name if slugification results in an empty string
3. **Uniqueness Check:**
   - Checks if a file with the same name exists
   - If it exists, appends a numeric suffix (e.g., "my-document-1.pdf", "my-document-2.pdf", etc.)
4. **Storage:**
   - Saves the file to `storage/app/public/uploads/`
   - The file is accessible via `public/storage/uploads/` after running `php artisan storage:link`
5. **Response:**
   - Returns file information including the public URL

## Testing

A test HTML page is available at `public/test-upload.html`. 

To use it:
1. Start your Laravel server: `php artisan serve`
2. Navigate to: `http://localhost:8000/test-upload.html`
3. Upload and delete files using the web interface

## File Storage Structure

```
storage/
└── app/
    └── public/
        └── uploads/
            ├── my-document.pdf
            ├── photo-1.jpg
            ├── photo-2.jpg
            └── ...
```

Files are accessible via:
```
http://localhost:8000/storage/uploads/filename.ext
```

## Security Considerations

### Current Implementation
- Public access (no authentication required)
- Files stored in public disk
- 10MB file size limit
- Basic path validation for deletion

### Recommendations for Production
1. **Add Authentication:** Wrap routes in `auth:sanctum` middleware
2. **File Type Validation:** Add mime type restrictions based on your needs
3. **Virus Scanning:** Implement virus scanning for uploaded files
4. **Rate Limiting:** Add rate limiting to prevent abuse
5. **CDN Integration:** Consider using cloud storage (S3, etc.) for production

## Customization

### Change Upload Directory

Edit `app/Http/Controllers/Api/FileUploadController.php`:

```php
// Change 'uploads' to your preferred directory
$path = $file->storeAs('your-directory', $filename, 'public');
```

### Change File Size Limit

Edit the validation rule in `FileUploadController.php`:

```php
'file' => ['required', 'file', 'max:20480'], // 20MB
```

### Add File Type Restrictions

```php
'file' => [
    'required', 
    'file', 
    'mimes:pdf,doc,docx,jpg,png', 
    'max:10240'
],
```

### Add Authentication

In `routes/api.php`:

```php
// Protected upload (requires authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('upload', [FileUploadController::class, 'upload']);
    Route::delete('upload', [FileUploadController::class, 'delete']);
});
```

## Error Responses

### Validation Error (422)
```json
{
    "success": false,
    "message": "Validation failed.",
    "errors": {
        "file": ["The file field is required."]
    }
}
```

### File Not Found (404)
```json
{
    "success": false,
    "message": "File not found."
}
```

### Server Error (500)
```json
{
    "success": false,
    "message": "File upload failed: [error details]"
}
```

## Code Location

- **Controller:** `app/Http/Controllers/Api/FileUploadController.php`
- **Routes:** `routes/api.php` (lines 38-39)
- **Config:** `config/filesystems.php`
- **Test Page:** `public/test-upload.html`

## Support

For issues or questions, refer to the Laravel documentation:
- [File Storage](https://laravel.com/docs/filesystem)
- [File Uploads](https://laravel.com/docs/requests#files)



