# Course System Recreation Plan

## Overview
Recreating the course system with two distinct types: **Guided Courses** and **Self-Paced Courses**.

---

## Course Type 1: Guided Courses
### Purpose
For structured, instructor-led training programs (School/College/Corporate)

### Data Structure

#### Basic Information
1. **Course Title** (string, required)
2. **Course Description** (text, required)
3. **Duration** (string, e.g., "19 Hours", "2 weeks", nullable)
4. **Target Audience** (text, required)

#### Syllabus Structure
5. **Syllabus Table** - Structured data with:
   - **Session** (number, sequential)
   - **Course Topic** (string, e.g., "Introduction to Happiness at Workplace")
   - **Learnings** (text/array - supports multiple rows/bullets, can include outcomes)
   - **Hours** (number, e.g., 1, 1.5, 2)

6. **Key Learning Objectives** (text/array - bulleted list)

### Technical Implementation
- **No RTE required** - Simple text fields and structured data
- **Learnings field**: 
  - Can store as JSON array for structured bullets
  - Or as plain text with line breaks/bullets
  - Should support "Outcome:" prefix for outcomes within learnings
- **Table data**: Store as JSON array of objects for flexibility

### Example Data Structure
```json
{
  "course_type": "guided",
  "title": "Happiness at Workplace",
  "description": "A comprehensive course on workplace happiness...",
  "duration": "19 Hours",
  "target_audience": "HR Professionals, Managers, Team Leaders",
  "syllabus": [
    {
      "session": 1,
      "course_topic": "Introduction to Happiness at Workplace",
      "learnings": [
        "Importance of happiness and well-being in the workplace.",
        "The business case for promoting happiness and its impact on employee engagement and productivity.",
        "Introduction to the key concepts of positive psychology.",
        "Outcome: Understand the significance of happiness at work and its impact on organizational success."
      ],
      "hours": 1
    },
    {
      "session": 2,
      "course_topic": "Building Positive Work Culture",
      "learnings": [
        "Strategies for creating positive work environments.",
        "Outcome: Develop skills to foster positive culture."
      ],
      "hours": 2
    }
  ],
  "key_learning_objectives": [
    "Understand workplace happiness concepts",
    "Implement positive psychology principles",
    "Build positive work culture"
  ]
}
```

---

## Course Type 2: Self-Paced Courses
### Purpose
For self-study courses with comprehensive content/guides

### Data Structure

#### Basic Information
1. **Course Title** (string, required)

#### Content Structure
2. **Topics/Chapters Table** - Structured data with:
   - **Topic** (string, e.g., "Introduction to Digital Marketing")
   - **Subtopic** (array - multiple sub-topics/learnings per topic)
   - **Duration** (string/number, e.g., "1.5 hrs", "2 hrs")

3. **Topic Content** (RTE) - Rich text content for each topic/chapter
   - One RTE editor per topic
   - Stores full formatted content (HTML from Quill.js)

### Technical Implementation
- **RTE Required** - Using existing Quill.js rich text editor
- **Topic Content**: Store as JSON object mapping topic_id to HTML content
- Each topic gets its own RTE instance in the form

### Example Data Structure
```json
{
  "course_type": "self_paced",
  "title": "Marketing in the Digital Age",
  "topics": [
    {
      "topic": "Introduction to Digital Marketing",
      "subtopics": [
        "Evolution from traditional to digital",
        "Why digital marketing matters in Nepal & globally",
        "Key channels: Search, Social, Email, Content, Paid Ads",
        "Activity: Compare one traditional ad with one digital ad"
      ],
      "duration": "1.5 hrs",
      "content": "<p>Full rich text content here...</p>"
    },
    {
      "topic": "Understanding the Digital Consumer",
      "subtopics": [
        "Who is today's customer? Behavior shifts in Nepal",
        "Customer journey (Awareness → Consideration → Purchase)",
        "Importance of data in understanding consumers"
      ],
      "duration": "2 hrs",
      "content": "<p>Full rich text content for this topic...</p>"
    }
  ]
}
```

---

## Database Schema Plan

### Courses Table
```php
Schema::create('courses', function (Blueprint $table) {
    $table->id();
    $table->enum('course_type', ['guided', 'self_paced']);
    $table->string('title');
    $table->text('description')->nullable(); // For guided courses
    $table->string('duration')->nullable(); // For guided courses total duration
    $table->text('target_audience')->nullable(); // For guided courses
    $table->text('key_learning_objectives')->nullable(); // JSON array or text
    $table->json('syllabus')->nullable(); // For guided courses - array of session objects
    $table->json('topics')->nullable(); // For self-paced - array of topic objects with content
    $table->foreignId('program_id')->nullable()->constrained();
    $table->boolean('featured')->default(false);
    $table->timestamps();
});
```

---

## Frontend Implementation Plan

### 1. Course Type Selection
- Radio buttons or dropdown: "Guided Course" vs "Self-Paced Course"
- Show different forms based on selection

### 2. Guided Course Form
- Simple text inputs for: Title, Description, Duration, Target Audience
- Textarea for Key Learning Objectives (with line breaks or bullets)
- Dynamic table builder for Syllabus:
  - Add/Remove rows
  - Session (auto-increment or manual)
  - Course Topic (text input)
  - Learnings (textarea or multi-input with add bullet button)
  - Hours (number input)
- Learnings field should support:
  - Multiple lines
  - Bullet points
  - Outcomes (can be prefixed with "Outcome:" or styled differently)

### 3. Self-Paced Course Form
- Text input for Title
- Dynamic table builder for Topics:
  - Add/Remove rows
  - Topic (text input)
  - Subtopic (textarea or multi-input with add button)
  - Duration (text/number input)
- Dynamic RTE sections:
  - One RTE editor per topic
  - Show/hide RTE when topic is added/removed
  - Label each RTE with topic name
  - Store content linked to topic

### 4. Course List/Display
- Show course type badge/indicator
- Different display layouts for guided vs self-paced
- Guided: Show syllabus table
- Self-Paced: Show topics table with expandable content sections

---

## API Endpoints Plan

### Courses API
- `GET /api/courses` - List all courses (filter by type)
- `GET /api/courses/{id}` - Show course details
- `POST /api/courses` - Create course (validate by type)
- `PUT /api/courses/{id}` - Update course
- `DELETE /api/courses/{id}` - Delete course

### Validation Rules
- Guided: Require title, description, target_audience, syllabus
- Self-Paced: Require title, topics (with content)

---

## Questions/Clarifications Needed

1. **Program Relationship**: Should courses still be linked to Programs? (Keeping for now)

2. **Learnings Format**: 
   - Should learnings be stored as JSON array or plain text with delimiters?
   - Recommendation: JSON array for structured data

3. **Outcomes in Learnings**:
   - Should outcomes be identified by "Outcome:" prefix?
   - Or separate field in syllabus table?

4. **Subtopics in Self-Paced**:
   - Should subtopics be editable list items or just display reference?
   - Recommendation: Editable list, stored as JSON array

5. **Enrollment Updates**:
   - How should enrollments work with new course structure?
   - Both types can have enrollments?

6. **Topic Content Display**:
   - For self-paced courses, should content be displayed progressively (one topic at a time)?
   - Or all expandable sections?

7. **Featured/Browsing**:
   - Should both course types appear in same listing?
   - Filter by type option?

---

## Implementation Steps

1. ✅ Create database migration for new courses table structure
2. ✅ Create Course model with new structure and relationships
3. ✅ Create/Update CourseController (web & API) with type-based validation
4. ✅ Create course type selection component
5. ✅ Create Guided Course form component
6. ✅ Create Self-Paced Course form component
7. ✅ Update course index/listing page
8. ✅ Update course show/view page
9. ✅ Update routes
10. ✅ Update sidebar/navigation
11. ✅ Test guided course creation/editing
12. ✅ Test self-paced course creation/editing
13. ✅ Update enrollment system if needed

---

## UI/UX Considerations

- **Course Type Badge**: Visual indicator on cards/list items
- **Form Validation**: Clear errors for required fields per type
- **Dynamic Forms**: Smooth add/remove of table rows
- **RTE Integration**: Seamless integration with existing Quill editor
- **Responsive**: Tables should be responsive on mobile
- **Save Draft**: Consider auto-save for long forms (future enhancement)

---

## Files to Create/Modify

### New Files
- `database/migrations/YYYY_MM_DD_create_courses_table.php` (recreate)
- `app/Models/Course.php` (recreate)
- `app/Http/Controllers/CourseController.php` (recreate)
- `app/Http/Controllers/Api/CourseController.php` (recreate)
- `resources/js/pages/courses/index.tsx` (recreate)
- `resources/js/pages/courses/components/add.tsx` (recreate)
- `resources/js/pages/courses/components/edit.tsx` (recreate)
- `resources/js/pages/courses/components/view.tsx` (recreate)
- `resources/js/pages/courses/components/guided-course-form.tsx` (new)
- `resources/js/pages/courses/components/self-paced-course-form.tsx` (new)

### Modified Files
- `routes/web.php` (add course routes back)
- `routes/api.php` (add course API routes back)
- `resources/js/components/app-sidebar.tsx` (add Courses menu back)

---

## Ready to Proceed?

Please confirm if this plan aligns with your vision. Any adjustments needed before implementation?
