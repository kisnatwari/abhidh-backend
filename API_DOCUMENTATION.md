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
- Payment API (POST for submitting payment screenshots)

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

List all programs with optional search and filtering.

```http
GET /api/programs?search=keyword&category=school&per_page=10&page=1
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `search` | string | No | - | Search term to filter programs by name or description |
| `category` | string | No | - | Filter by category. Valid values: `school`, `college`, `corporate`, `it`, `digital_marketing`. Use `all` to show all categories |
| `per_page` | integer | No | 10 | Number of items per page |
| `page` | integer | No | 1 | Page number |

#### Response

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "School Program",
            "description": "Educational program for schools",
            "category": "school",
            "color": "#3b82f6",
            "courses_count": 5,
            "created_at": "2025-01-01T00:00:00.000000Z",
            "updated_at": "2025-01-01T00:00:00.000000Z"
        }
    ],
    "pagination": {
        "current_page": 1,
        "last_page": 1,
        "per_page": 10,
        "total": 5,
        "from": 1,
        "to": 5
    }
}
```

#### Example Request

```bash
curl -X GET "http://localhost:8000/api/programs?search=education&category=school&per_page=5"
```

### Get Program

Get a single program by ID with its associated courses.

```http
GET /api/programs/{id}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Program ID |

#### Response

```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "School Program",
        "description": "Educational program for schools",
        "category": "school",
        "color": "#3b82f6",
        "created_at": "2025-01-01T00:00:00.000000Z",
        "updated_at": "2025-01-01T00:00:00.000000Z",
        "courses": [
            {
                "id": 1,
                "course_type": "guided",
                "title": "Mathematics Basics",
                "description": "Introduction to mathematics",
                "program_id": 1,
                "featured": true,
                "created_at": "2025-01-01T00:00:00.000000Z",
                "updated_at": "2025-01-01T00:00:00.000000Z"
            }
        ]
    }
}
```

#### Example Request

```bash
curl -X GET "http://localhost:8000/api/programs/1"
```

**Note:** Create, Update, and Delete operations are only available through the Inertia.js dashboard.

---

## Courses API (Public - Read Only)

### List Courses

List all courses with optional search and filtering.

```http
GET /api/courses?search=keyword&course_type=guided&program_id=1&featured=1&per_page=10&page=1
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `search` | string | No | - | Search term to filter courses by title or description |
| `course_type` | string | No | - | Filter by course type. Valid values: `guided`, `self_paced`. Use `all` to show all types |
| `program_id` | integer | No | - | Filter courses by program ID |
| `featured` | string | No | - | Filter by featured status. Valid values: `1` (featured), `0` (not featured). Use `all` to show all |
| `per_page` | integer | No | 10 | Number of items per page |
| `page` | integer | No | 1 | Page number |

#### Response

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "course_type": "guided",
            "title": "Mathematics Basics",
            "description": "Introduction to mathematics for beginners",
            "duration": "40 hours",
            "target_audience": "High school students",
            "key_learning_objectives": [
                "Understand basic arithmetic",
                "Master algebra fundamentals"
            ],
            "syllabus": [
                {
                    "session": 1,
                    "course_topic": "Introduction to Numbers",
                    "learnings": [
                        "Natural numbers",
                        "Whole numbers",
                        "Integers"
                    ],
                    "outcomes": [
                        "Identify different number types",
                        "Perform basic operations"
                    ],
                    "hours": 5
                }
            ],
            "topics": null,
            "program_id": 1,
            "featured": true,
            "created_at": "2025-01-01T00:00:00.000000Z",
            "updated_at": "2025-01-01T00:00:00.000000Z",
            "program": {
                "id": 1,
                "name": "School Program",
                "description": "Educational program for schools",
                "category": "school",
                "color": "#3b82f6"
            }
        },
        {
            "id": 2,
            "course_type": "self_paced",
            "title": "Web Development Fundamentals",
            "description": null,
            "duration": null,
            "target_audience": null,
            "key_learning_objectives": null,
            "syllabus": null,
            "topics": [
                {
                    "topic": "HTML Basics",
                    "subtopics": [
                        "Elements and Tags",
                        "Attributes",
                        "Forms"
                    ],
                    "duration": "10 hours",
                    "content": "<p>Introduction to HTML...</p>"
                },
                {
                    "topic": "CSS Styling",
                    "subtopics": [
                        "Selectors",
                        "Box Model",
                        "Flexbox"
                    ],
                    "duration": "15 hours",
                    "content": "<p>Introduction to CSS...</p>"
                }
            ],
            "program_id": 2,
            "featured": false,
            "created_at": "2025-01-01T00:00:00.000000Z",
            "updated_at": "2025-01-01T00:00:00.000000Z",
            "program": {
                "id": 2,
                "name": "IT Program",
                "description": "Information Technology courses",
                "category": "it",
                "color": "#10b981"
            }
        }
    ],
    "pagination": {
        "current_page": 1,
        "last_page": 3,
        "per_page": 10,
        "total": 25,
        "from": 1,
        "to": 10
    }
}
```

#### Course Data Structure

**Guided Course** (`course_type: "guided"`):
- Contains: `description`, `duration`, `target_audience`, `key_learning_objectives`, `syllabus`
- `syllabus` is an array of session objects with: `session`, `course_topic`, `learnings` (array), `outcomes` (array), `hours`
- `topics` is `null`

**Self-Paced Course** (`course_type: "self_paced"`):
- Contains: `description` (optional), `topics` (array of topic objects)
- Each topic has: `topic`, `subtopics` (array), `duration`, `content` (HTML string)
- `duration`, `target_audience`, `key_learning_objectives`, `syllabus` are `null`

#### Example Request

```bash
curl -X GET "http://localhost:8000/api/courses?course_type=guided&program_id=1&featured=1"
```

### Get Course

Get a single course by ID with its associated program and enrollments.

```http
GET /api/courses/{id}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Course ID |

#### Response

```json
{
    "success": true,
    "data": {
        "id": 1,
        "course_type": "guided",
        "title": "Mathematics Basics",
        "description": "Introduction to mathematics for beginners",
        "duration": "40 hours",
        "target_audience": "High school students",
        "key_learning_objectives": [
            "Understand basic arithmetic",
            "Master algebra fundamentals",
            "Solve real-world problems"
        ],
        "syllabus": [
            {
                "session": 1,
                "course_topic": "Introduction to Numbers",
                "learnings": [
                    "Natural numbers",
                    "Whole numbers",
                    "Integers"
                ],
                "outcomes": [
                    "Identify different number types",
                    "Perform basic operations"
                ],
                "hours": 5
            },
            {
                "session": 2,
                "course_topic": "Algebra Basics",
                "learnings": [
                    "Variables and expressions",
                    "Linear equations"
                ],
                "outcomes": [
                    "Solve linear equations",
                    "Simplify algebraic expressions"
                ],
                "hours": 8
            }
        ],
        "topics": null,
        "program_id": 1,
        "featured": true,
        "created_at": "2025-01-01T00:00:00.000000Z",
        "updated_at": "2025-01-01T00:00:00.000000Z",
        "program": {
            "id": 1,
            "name": "School Program",
            "description": "Educational program for schools",
            "category": "school",
            "color": "#3b82f6",
            "created_at": "2025-01-01T00:00:00.000000Z",
            "updated_at": "2025-01-01T00:00:00.000000Z"
        },
        "enrollments": [
            {
                "id": 1,
                "user_id": 1,
                "course_id": 1,
                "status": "active",
                "is_paid": true,
                "created_at": "2025-01-01T00:00:00.000000Z",
                "updated_at": "2025-01-01T00:00:00.000000Z",
                "user": {
                    "id": 1,
                    "name": "John Doe",
                    "email": "john@example.com"
                }
            }
        ]
    }
}
```

#### Example Request

```bash
curl -X GET "http://localhost:8000/api/courses/1"
```

### Get Programs List

Get a simplified list of all programs (ID and name only) for use in dropdowns or selections.

```http
GET /api/courses/programs/list
```

#### Response

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "School Program"
        },
        {
            "id": 2,
            "name": "College Program"
        },
        {
            "id": 3,
            "name": "Corporate Training"
        }
    ]
}
```

#### Example Request

```bash
curl -X GET "http://localhost:8000/api/courses/programs/list"
```

**Note:** Create, Update, and Delete operations are only available through the Inertia.js dashboard.

## Enrollments API (Protected - Read Only)

Enrollments represent user enrollments in courses. Users can submit payment screenshots via the Payment API, which creates or updates enrollments. Admin verification is required to complete enrollment.

### List Enrollments

Get a paginated list of enrollments for the authenticated user.

```http
GET /api/enrollments?search=keyword&status=active&is_paid=1&per_page=10
Authorization: Bearer {token}
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by user name or email |
| `status` | string | Filter by status: `active`, `completed`, `dropped`, or `all` (default: `all`) |
| `is_paid` | string | Filter by payment status: `1` (paid), `0` (unpaid), or `all` (default: `all`) |
| `per_page` | integer | Number of items per page (default: 10) |
| `page` | integer | Page number (default: 1) |

#### Response

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "user_id": 1,
            "course_id": 1,
            "enrollment_date": "2025-01-15T10:30:00.000000Z",
            "status": "active",
            "is_paid": true,
            "payment_screenshot_path": "payments/screenshot123.jpg",
            "payment_verified": true,
            "payment_verified_at": "2025-01-15T11:00:00.000000Z",
            "verified_by": 2,
            "created_at": "2025-01-15T10:30:00.000000Z",
            "updated_at": "2025-01-15T11:00:00.000000Z",
            "user": {
                "id": 1,
                "name": "John Doe",
                "email": "john@example.com"
            }
        }
    ],
    "pagination": {
        "current_page": 1,
        "last_page": 3,
        "per_page": 10,
        "total": 25,
        "from": 1,
        "to": 10
    }
}
```

#### Example Request

```bash
curl -X GET "http://localhost:8000/api/enrollments?status=active&is_paid=1&per_page=20" \
  -H "Authorization: Bearer {token}"
```

### Get Enrollment

Get a single enrollment by ID.

```http
GET /api/enrollments/{id}
Authorization: Bearer {token}
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Enrollment ID |

#### Response

```json
{
    "success": true,
    "data": {
        "id": 1,
        "user_id": 1,
        "course_id": 1,
        "enrollment_date": "2025-01-15T10:30:00.000000Z",
        "status": "active",
        "is_paid": true,
        "payment_screenshot_path": "payments/screenshot123.jpg",
        "payment_verified": true,
        "payment_verified_at": "2025-01-15T11:00:00.000000Z",
        "verified_by": 2,
        "created_at": "2025-01-15T10:30:00.000000Z",
        "updated_at": "2025-01-15T11:00:00.000000Z",
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com"
        }
    }
}
```

#### Example Request

```bash
curl -X GET "http://localhost:8000/api/enrollments/1" \
  -H "Authorization: Bearer {token}"
```

### Get Options

Get list of users for enrollment selection (helper endpoint).

```http
GET /api/enrollments/options/list
Authorization: Bearer {token}
```

#### Response

```json
{
    "success": true,
    "data": {
        "users": [
            {
                "id": 1,
                "name": "John Doe",
                "email": "john@example.com"
            },
            {
                "id": 2,
                "name": "Jane Smith",
                "email": "jane@example.com"
            }
        ]
    }
}
```

#### Example Request

```bash
curl -X GET "http://localhost:8000/api/enrollments/options/list" \
  -H "Authorization: Bearer {token}"
```

**Note:** Create, Update, and Delete operations for enrollments are only available through the Inertia.js dashboard.

## Payment API (Protected - Submit Payment)

The Payment API allows authenticated users to submit payment screenshots for course enrollment. When a payment screenshot is submitted, an enrollment is created or updated with `payment_verified=false`. Admin must verify the payment from the dashboard to complete enrollment.

### Submit Payment Screenshot

Submit a payment screenshot for a course enrollment. This will create a new enrollment or update an existing one with the payment screenshot.

```http
POST /api/payments/submit
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

#### Request Body (multipart/form-data)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `course_id` | integer | Yes | Course ID to enroll in |
| `payment_screenshot` | file | Yes | Payment screenshot image (max: 5MB, formats: jpg, jpeg, png, gif, webp) |

#### Response

```json
{
    "success": true,
    "message": "Payment screenshot submitted successfully. Waiting for admin verification.",
    "data": {
        "enrollment_id": 1,
        "course_id": 1,
        "payment_verified": false
    }
}
```

#### Example Request

```bash
curl -X POST "http://localhost:8000/api/payments/submit" \
  -H "Authorization: Bearer {token}" \
  -F "course_id=1" \
  -F "payment_screenshot=@/path/to/screenshot.jpg"
```

#### Workflow

1. **User submits payment screenshot** → Creates enrollment with `payment_verified=false`, `is_paid=false`, `status='active'`
2. **Admin verifies payment** (via dashboard) → Sets `payment_verified=true`, `is_paid=true`, `status='active'`, `enrollment_date=now()`
3. **User is enrolled** → Can access course content

#### Important Notes

- If an enrollment already exists for the user and course, submitting a new screenshot will update the existing enrollment and reset verification status
- Payment verification must be done by admin through the dashboard interface
- Only one payment screenshot can be active per enrollment
- Uploading a new screenshot will replace the previous one and reset verification status

#### Error Responses

**Validation Error (422)**
```json
{
    "success": false,
    "message": "Validation failed.",
    "errors": {
        "course_id": ["The course id field is required."],
        "payment_screenshot": ["The payment screenshot must be an image."]
    }
}
```

**Unauthorized (401)**
```json
{
    "success": false,
    "message": "Unauthenticated."
}
```

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
