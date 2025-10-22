\# API Documentation

This Laravel application now provides both Inertia.js web interface and REST API endpoints using Laravel Sanctum for authentication.

## Base URL
```
http://localhost:8000/api
```

## Authentication

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "password123"
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

### Get User
```http
GET /api/auth/user
Authorization: Bearer {token}
```

### Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer {token}
```

## Public Read-Only Endpoints

The following endpoints are publicly accessible and do not require authentication. **All APIs are read-only** - no write operations (POST, PUT, DELETE) are available through the API:

- Blogs API (GET operations only)
- Trainers API (GET operations only)
- Galleries API (GET operations only)
- Programs API (GET operations only)
- Courses API (GET operations only)

## Protected Read-Only Endpoints

The following endpoints require authentication. Include the token in the Authorization header:
```
Authorization: Bearer {your-token}
```

- Authentication endpoints (logout, user, refresh)
- Enrollments API (GET operations only)

## Important Note

**All write operations (create, update, delete) are only available through the Inertia.js dashboard interface.** The API is designed to be read-only for external consumption, while the dashboard provides full CRUD functionality for content management.

## Blogs API (Public - Read Only)

### List Blogs
```http
GET /api/blogs?search=keyword&category=tech&per_page=10
```

### Get Blog
```http
GET /api/blogs/{id}
```

**Note:** Create, Update, and Delete operations are only available through the Inertia.js dashboard.

## Trainers API (Public - Read Only)

### List Trainers
```http
GET /api/trainers?search=keyword&per_page=10
```

### Get Trainer
```http
GET /api/trainers/{id}
```

**Note:** Create, Update, and Delete operations are only available through the Inertia.js dashboard.

## Galleries API (Public - Read Only)

### List Galleries
```http
GET /api/galleries?search=keyword&per_page=10
```

### Get Gallery
```http
GET /api/galleries/{id}
```

**Note:** Create, Update, and Delete operations are only available through the Inertia.js dashboard.

## Programs API (Public - Read Only)

### List Programs
```http
GET /api/programs?search=keyword&category=school&per_page=10
```

### Get Program
```http
GET /api/programs/{id}
```

**Note:** Create, Update, and Delete operations are only available through the Inertia.js dashboard.

## Courses API (Public - Read Only)

### List Courses
```http
GET /api/courses?search=keyword&program=1&level=beginner&featured=1&per_page=10
```

### Get Course
```http
GET /api/courses/{id}
```

### Get Programs List
```http
GET /api/courses/programs/list
```

**Note:** Create, Update, and Delete operations are only available through the Inertia.js dashboard.

## Enrollments API (Protected - Read Only)

### List Enrollments
```http
GET /api/enrollments?search=keyword&status=active&is_paid=1&per_page=10
Authorization: Bearer {token}
```

### Get Enrollment
```http
GET /api/enrollments/{id}
Authorization: Bearer {token}
```

### Get Options
```http
GET /api/enrollments/options/list
Authorization: Bearer {token}
```

**Note:** Create, Update, and Delete operations are only available through the Inertia.js dashboard.

## Response Format

All API responses follow this format:

### Success Response
```json
{
    "success": true,
    "message": "Operation successful",
    "data": { ... },
    "pagination": {
        "current_page": 1,
        "last_page": 5,
        "per_page": 10,
        "total": 50,
        "from": 1,
        "to": 10
    }
}
```

### Error Response
```json
{
    "success": false,
    "message": "Error message",
    "errors": {
        "field": ["Error details"]
    }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `401` - Unauthorized
- `422` - Validation Error
- `404` - Not Found
- `500` - Server Error

## File Uploads

For endpoints that accept file uploads (blogs, trainers, galleries), use `multipart/form-data` content type.

## Pagination

All list endpoints support pagination with these query parameters:
- `per_page` - Number of items per page (default: 10)
- `page` - Page number (default: 1)

## Search and Filtering

Most list endpoints support search and filtering:
- `search` - Search term
- Various filter parameters specific to each resource

## Testing the API

You can test the API using tools like:
- Postman
- Insomnia
- curl
- Any HTTP client

Example curl command:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```
