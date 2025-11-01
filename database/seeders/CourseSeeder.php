<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Program;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure we have at least one program, or create it
        $schoolProgram = Program::firstOrCreate(
            ['name' => 'School Education Program'],
            [
                'description' => 'Comprehensive educational programs for school students',
                'category' => 'school',
                'color' => '#3b82f6',
            ]
        );

        $itProgram = Program::firstOrCreate(
            ['name' => 'IT & Technology Program'],
            [
                'description' => 'Technology and programming courses for IT professionals',
                'category' => 'it',
                'color' => '#10b981',
            ]
        );

        // Guided Course - Mathematics for High School
        Course::firstOrCreate(
            ['title' => 'Mathematics Fundamentals for High School'],
            [
                'course_type' => 'guided',
                'description' => 'A comprehensive mathematics course designed to strengthen fundamental mathematical concepts for high school students. This course covers algebra, geometry, trigonometry, and basic calculus, providing students with a solid foundation for advanced studies.',
                'duration' => '40 Hours',
                'target_audience' => 'High school students (Grades 9-12) who want to strengthen their mathematical foundation. Suitable for students preparing for college entrance exams and advanced mathematics courses.',
                'key_learning_objectives' => [
                    'Master fundamental algebraic operations and equations',
                    'Understand geometric principles and their applications',
                    'Develop problem-solving skills using mathematical concepts',
                    'Build confidence in tackling complex mathematical problems',
                    'Prepare for advanced mathematics and standardized tests'
                ],
                'syllabus' => [
                    [
                        'session' => 1,
                        'course_topic' => 'Introduction to Algebra and Number Systems',
                        'learnings' => [
                            'Natural numbers, whole numbers, integers, and rational numbers',
                            'Basic algebraic expressions and simplification',
                            'Linear equations in one variable',
                            'Graphing linear equations'
                        ],
                        'outcomes' => [
                            'Students will be able to solve linear equations confidently',
                            'Students will understand number system properties',
                            'Students will be able to graph and interpret linear equations'
                        ],
                        'hours' => 5
                    ],
                    [
                        'session' => 2,
                        'course_topic' => 'Algebraic Operations and Factoring',
                        'learnings' => [
                            'Polynomial operations (addition, subtraction, multiplication)',
                            'Factoring techniques (GCF, difference of squares, trinomials)',
                            'Quadratic equations and their solutions',
                            'Rational expressions and operations'
                        ],
                        'outcomes' => [
                            'Students will master polynomial operations',
                            'Students will be able to factor various polynomial expressions',
                            'Students will solve quadratic equations using multiple methods'
                        ],
                        'hours' => 8
                    ],
                    [
                        'session' => 3,
                        'course_topic' => 'Geometry Fundamentals',
                        'learnings' => [
                            'Basic geometric shapes and their properties',
                            'Pythagorean theorem and its applications',
                            'Area and perimeter calculations',
                            'Similarity and congruence of triangles'
                        ],
                        'outcomes' => [
                            'Students will apply geometric principles to solve problems',
                            'Students will calculate areas and perimeters accurately',
                            'Students will understand triangle relationships'
                        ],
                        'hours' => 6
                    ],
                    [
                        'session' => 4,
                        'course_topic' => 'Trigonometry Basics',
                        'learnings' => [
                            'Right triangle trigonometry (sine, cosine, tangent)',
                            'Unit circle and trigonometric functions',
                            'Solving trigonometric equations',
                            'Applications of trigonometry in real-world problems'
                        ],
                        'outcomes' => [
                            'Students will understand trigonometric functions',
                            'Students will solve problems using trigonometry',
                            'Students will apply trigonometry to practical scenarios'
                        ],
                        'hours' => 7
                    ],
                    [
                        'session' => 5,
                        'course_topic' => 'Introduction to Calculus',
                        'learnings' => [
                            'Limits and continuity concepts',
                            'Introduction to derivatives',
                            'Basic differentiation rules',
                            'Applications of derivatives'
                        ],
                        'outcomes' => [
                            'Students will understand fundamental calculus concepts',
                            'Students will be able to find derivatives of basic functions',
                            'Students will apply derivatives to solve optimization problems'
                        ],
                        'hours' => 10
                    ],
                    [
                        'session' => 6,
                        'course_topic' => 'Review and Advanced Problem Solving',
                        'learnings' => [
                            'Comprehensive review of all topics',
                            'Complex problem-solving strategies',
                            'Test-taking techniques and time management',
                            'Practice with standardized test questions'
                        ],
                        'outcomes' => [
                            'Students will demonstrate mastery of all course topics',
                            'Students will apply multiple concepts to solve complex problems',
                            'Students will be prepared for advanced mathematics courses'
                        ],
                        'hours' => 4
                    ]
                ],
                'topics' => null,
                'program_id' => $schoolProgram->id,
                'featured' => true,
            ]
        );

        // Self-Paced Course - Web Development Fundamentals
        Course::firstOrCreate(
            ['title' => 'Web Development Fundamentals - Self-Paced'],
            [
                'course_type' => 'self_paced',
                'description' => 'Learn web development at your own pace! This comprehensive self-paced course covers HTML, CSS, JavaScript, and modern web development practices. Perfect for beginners who want to become front-end developers. Complete the course on your schedule with hands-on projects and real-world examples.',
                'topics' => [
                    [
                        'topic' => 'HTML Basics',
                        'subtopics' => [
                            'HTML5 Document Structure',
                            'Text Elements and Headings',
                            'Lists (Ordered, Unordered, Definition)',
                            'Links and Navigation',
                            'Images and Media',
                            'Tables and Forms',
                            'Semantic HTML5 Elements'
                        ],
                        'duration' => '10 hours',
                        'content' => '<h2>Introduction to HTML</h2><p>HTML (HyperText Markup Language) is the foundation of every website. In this topic, you\'ll learn the basics of HTML5 and how to structure web pages effectively.</p><h3>Getting Started</h3><p>We\'ll start with the basic HTML document structure:</p><pre><code>&lt;!DOCTYPE html&gt;\n&lt;html lang="en"&gt;\n&lt;head&gt;\n    &lt;meta charset="UTF-8"&gt;\n    &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;\n    &lt;title&gt;My First Web Page&lt;/title&gt;\n&lt;/head&gt;\n&lt;body&gt;\n    &lt;h1&gt;Welcome to Web Development&lt;/h1&gt;\n    &lt;p&gt;This is a paragraph.&lt;/p&gt;\n&lt;/body&gt;\n&lt;/html&gt;</code></pre><h3>Key Concepts</h3><ul><li><strong>Elements and Tags:</strong> HTML uses tags to define elements like headings, paragraphs, and links</li><li><strong>Attributes:</strong> Tags can have attributes that provide additional information</li><li><strong>Semantic HTML:</strong> Use semantic elements like &lt;header&gt;, &lt;nav&gt;, &lt;main&gt;, and &lt;footer&gt; for better structure</li></ul><h3>Practice Exercises</h3><p>Create a simple webpage with your personal introduction, including your name, interests, and contact information using semantic HTML5 elements.</p>'
                    ],
                    [
                        'topic' => 'CSS Styling',
                        'subtopics' => [
                            'CSS Selectors (Element, Class, ID)',
                            'The Box Model',
                            'Layout Techniques (Flexbox)',
                            'CSS Grid',
                            'Responsive Design and Media Queries',
                            'CSS Variables and Custom Properties',
                            'Animations and Transitions'
                        ],
                        'duration' => '15 hours',
                        'content' => '<h2>CSS Styling Fundamentals</h2><p>CSS (Cascading Style Sheets) allows you to style and layout your web pages. Learn how to make your websites beautiful and responsive.</p><h3>CSS Basics</h3><p>CSS can be added to HTML in three ways:</p><ol><li>Inline styles (within HTML elements)</li><li>Internal stylesheet (in the &lt;style&gt; tag)</li><li>External stylesheet (separate .css file) - <em>Recommended</em></li></ol><h3>The Box Model</h3><p>Understanding the box model is crucial:</p><ul><li><strong>Content:</strong> The actual content (text, images, etc.)</li><li><strong>Padding:</strong> Space between content and border</li><li><strong>Border:</strong> A border around the padding</li><li><strong>Margin:</strong> Space outside the border</li></ul><h3>Flexbox Layout</h3><p>Flexbox makes it easy to create flexible layouts:</p><pre><code>.container {\n    display: flex;\n    justify-content: center; /* horizontal alignment */\n    align-items: center;     /* vertical alignment */\n    gap: 20px;\n}</code></pre><h3>Responsive Design</h3><p>Use media queries to make your design responsive:</p><pre><code>@media (max-width: 768px) {\n    .container {\n        flex-direction: column;\n    }\n}</code></pre><h3>Project: Create a Responsive Portfolio</h3><p>Build a personal portfolio website that looks great on both desktop and mobile devices using CSS Flexbox and Grid.</p>'
                    ],
                    [
                        'topic' => 'JavaScript Fundamentals',
                        'subtopics' => [
                            'Variables and Data Types',
                            'Functions and Scope',
                            'Arrays and Objects',
                            'DOM Manipulation',
                            'Event Handling',
                            'ES6+ Features (Arrow Functions, Destructuring, Template Literals)',
                            'Async/Await and Promises'
                        ],
                        'duration' => '20 hours',
                        'content' => '<h2>JavaScript Programming</h2><p>JavaScript is the programming language that makes websites interactive. Learn to add functionality and interactivity to your web pages.</p><h3>JavaScript Basics</h3><p>Variables in JavaScript can be declared using <code>let</code>, <code>const</code>, or <code>var</code>:</p><pre><code>let name = "John";\nconst age = 25;\nvar city = "New York"; // Avoid using var in modern JavaScript</code></pre><h3>Functions</h3><p>Functions are reusable blocks of code:</p><pre><code>// Regular function\nfunction greet(name) {\n    return `Hello, ${name}!`;\n}\n\n// Arrow function (ES6+)\nconst greet = (name) => {\n    return `Hello, ${name}!`;\n};\n\n// Simplified arrow function\nconst greet = name => `Hello, ${name}!`;</code></pre><h3>DOM Manipulation</h3><p>Interact with HTML elements using JavaScript:</p><pre><code>// Select an element\nconst button = document.querySelector(\'.btn\');\n\n// Add event listener\nbutton.addEventListener(\'click\', () => {\n    alert(\'Button clicked!\');\n});\n\n// Modify content\nconst heading = document.querySelector(\'h1\');\nheading.textContent = \'New Heading\';</code></pre><h3>Arrays and Objects</h3><pre><code>// Arrays\nconst fruits = [\'apple\', \'banana\', \'orange\'];\nfruits.push(\'grape\');\n\n// Objects\nconst person = {\n    name: \'John\',\n    age: 25,\n    greet: function() {\n        return `Hello, I\'m ${this.name}`;\n    }\n};</code></pre><h3>Project: Interactive Calculator</h3><p>Build a fully functional calculator using HTML, CSS, and JavaScript. Include basic arithmetic operations and a clear button.</p>'
                    ],
                    [
                        'topic' => 'Advanced JavaScript and APIs',
                        'subtopics' => [
                            'Fetch API and HTTP Requests',
                            'Working with JSON Data',
                            'Error Handling with Try-Catch',
                            'Local Storage and Session Storage',
                            'Introduction to REST APIs',
                            'Building Dynamic Web Applications'
                        ],
                        'duration' => '18 hours',
                        'content' => '<h2>Advanced JavaScript Concepts</h2><p>Take your JavaScript skills to the next level by learning to work with APIs, handle asynchronous operations, and build dynamic web applications.</p><h3>Fetch API</h3><p>Make HTTP requests to retrieve data from APIs:</p><pre><code>// Basic fetch request\nfetch(\'https://api.example.com/data\')\n    .then(response => response.json())\n    .then(data => {\n        console.log(data);\n    })\n    .catch(error => {\n        console.error(\'Error:\', error);\n    });\n\n// Using async/await (Modern approach)\nasync function fetchData() {\n    try {\n        const response = await fetch(\'https://api.example.com/data\');\n        const data = await response.json();\n        console.log(data);\n    } catch (error) {\n        console.error(\'Error:\', error);\n    }\n}</code></pre><h3>Working with JSON</h3><p>JSON (JavaScript Object Notation) is the standard format for data exchange:</p><pre><code>// Parse JSON string to object\nconst jsonString = \'{"name": "John", "age": 25}\';\nconst person = JSON.parse(jsonString);\n\n// Convert object to JSON string\nconst jsonOutput = JSON.stringify(person);\nconsole.log(jsonOutput); // {"name":"John","age":25}</code></pre><h3>Local Storage</h3><p>Store data in the browser:</p><pre><code>// Save data\nlocalStorage.setItem(\'user\', JSON.stringify({ name: \'John\', age: 25 }));\n\n// Retrieve data\nconst userData = JSON.parse(localStorage.getItem(\'user\'));\n\n// Remove data\nlocalStorage.removeItem(\'user\');</code></pre><h3>Error Handling</h3><p>Handle errors gracefully:</p><pre><code>try {\n    // Code that might throw an error\n    const result = riskyOperation();\n    console.log(\'Success:\', result);\n} catch (error) {\n    console.error(\'Error occurred:\', error.message);\n    // Handle the error appropriately\n} finally {\n    // Code that runs regardless of success or failure\n    console.log(\'Operation completed\');\n}</code></pre><h3>Project: Weather App</h3><p>Build a weather application that fetches data from a weather API, displays current conditions, and stores user preferences in local storage. Include error handling for failed API requests.</p>'
                    ],
                    [
                        'topic' => 'Modern Web Development Tools',
                        'subtopics' => [
                            'Version Control with Git',
                            'Package Managers (npm)',
                            'Build Tools (Webpack, Vite)',
                            'Code Quality Tools (ESLint, Prettier)',
                            'Introduction to Frameworks (React, Vue, Angular)',
                            'Deployment Basics'
                        ],
                        'duration' => '12 hours',
                        'content' => '<h2>Modern Development Workflow</h2><p>Learn the tools and practices used by professional web developers to build and deploy modern web applications.</p><h3>Git and Version Control</h3><p>Git is essential for tracking changes and collaborating:</p><pre><code># Initialize a repository\ngit init\n\n# Add files\ngit add .\n\n# Commit changes\ngit commit -m "Initial commit"\n\n# Push to remote\ngit push origin main</code></pre><h3>npm Package Manager</h3><p>npm helps you manage project dependencies:</p><pre><code># Initialize a project\nnpm init -y\n\n# Install a package\nnpm install package-name\n\n# Install as dev dependency\nnpm install --save-dev package-name\n\n# Run scripts\nnpm run script-name</code></pre><h3>Build Tools</h3><p>Modern build tools optimize your code:</p><ul><li><strong>Webpack:</strong> Bundles modules and assets</li><li><strong>Vite:</strong> Fast build tool with hot module replacement</li><li><strong>Parcel:</strong> Zero-configuration build tool</li></ul><h3>Code Quality</h3><p>Tools to maintain code quality:</p><ul><li><strong>ESLint:</strong> Finds and fixes JavaScript problems</li><li><strong>Prettier:</strong> Formats code consistently</li><li><strong>Husky:</strong> Git hooks for code quality checks</li></ul><h3>Deployment</h3><p>Popular deployment platforms:</p><ul><li><strong>Netlify:</strong> Great for static sites</li><li><strong>Vercel:</strong> Perfect for frontend frameworks</li><li><strong>GitHub Pages:</strong> Free hosting for open source projects</li></ul><h3>Project: Deploy Your Portfolio</h3><p>Set up Git for your portfolio project, initialize npm, add ESLint and Prettier, and deploy your completed portfolio to Netlify or Vercel.</p>'
                    ]
                ],
                'program_id' => $itProgram->id,
                'featured' => true,
            ]
        );

        $this->command->info('CourseSeeder completed successfully!');
        $this->command->info('Created 1 Guided Course: Mathematics Fundamentals for High School');
        $this->command->info('Created 1 Self-Paced Course: Web Development Fundamentals - Self-Paced');
    }
}

