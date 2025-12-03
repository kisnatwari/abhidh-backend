<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = [
            [
                'name' => 'Digital Marketing Strategy',
                'description' => 'Comprehensive digital marketing solutions to boost your online presence and drive growth.',
                'content' => '<h2>Digital Marketing Strategy</h2><p>Transform your business with our comprehensive digital marketing solutions. We help you reach your target audience, increase brand awareness, and drive measurable results.</p><h3>Our Services Include:</h3><ul><li>Search Engine Optimization (SEO)</li><li>Social Media Marketing</li><li>Content Marketing</li><li>Pay-Per-Click (PPC) Advertising</li><li>Email Marketing Campaigns</li><li>Analytics and Reporting</li></ul>',
                'category' => 'digital_marketing',
                'accent_color' => '#3b82f6',
            ],
            [
                'name' => 'Web Development',
                'description' => 'Custom web development solutions built with modern technologies for optimal performance.',
                'content' => '<h2>Web Development</h2><p>We create stunning, responsive websites and web applications that deliver exceptional user experiences. Our development team uses the latest technologies to build scalable solutions.</p><h3>What We Offer:</h3><ul><li>Custom Website Development</li><li>E-commerce Solutions</li><li>Web Application Development</li><li>API Integration</li><li>Performance Optimization</li><li>Maintenance and Support</li></ul>',
                'category' => 'it_development',
                'accent_color' => 'bg-green-500',
            ],
            [
                'name' => 'Brand Identity Design',
                'description' => 'Create a memorable brand identity that resonates with your audience and stands out in the market.',
                'content' => '<h2>Brand Identity Design</h2><p>Your brand is more than just a logo. We help you create a cohesive brand identity that tells your story and connects with your audience.</p><h3>Our Design Services:</h3><ul><li>Logo Design</li><li>Brand Guidelines</li><li>Visual Identity Systems</li><li>Packaging Design</li><li>Brand Collateral</li><li>Brand Strategy Consultation</li></ul>',
                'category' => 'creative_solutions',
                'accent_color' => '#a855f7',
            ],
            [
                'name' => 'Social Media Management',
                'description' => 'Professional social media management to engage your audience and grow your online community.',
                'content' => '<h2>Social Media Management</h2><p>Let us handle your social media presence while you focus on your business. We create engaging content, manage your accounts, and build meaningful connections with your audience.</p><h3>Services Include:</h3><ul><li>Content Creation and Curation</li><li>Community Management</li><li>Social Media Strategy</li><li>Influencer Partnerships</li><li>Analytics and Insights</li><li>Ad Campaign Management</li></ul>',
                'category' => 'digital_marketing',
                'accent_color' => '#ec4899',
            ],
            [
                'name' => 'Mobile App Development',
                'description' => 'Native and cross-platform mobile applications that deliver seamless user experiences.',
                'content' => '<h2>Mobile App Development</h2><p>From concept to launch, we develop mobile applications that users love. Whether you need iOS, Android, or cross-platform solutions, we\'ve got you covered.</p><h3>Our Expertise:</h3><ul><li>iOS App Development</li><li>Android App Development</li><li>React Native Development</li><li>Flutter Development</li><li>App UI/UX Design</li><li>App Store Optimization</li></ul>',
                'category' => 'it_development',
                'accent_color' => '#06b6d4',
            ],
            [
                'name' => 'Graphic Design',
                'description' => 'Creative graphic design services for print and digital media that capture attention.',
                'content' => '<h2>Graphic Design</h2><p>We create visually stunning designs that communicate your message effectively. From business cards to billboards, we bring your ideas to life.</p><h3>Design Services:</h3><ul><li>Print Design</li><li>Digital Graphics</li><li>Infographics</li><li>Illustrations</li><li>Brochures and Flyers</li><li>Presentation Design</li></ul>',
                'category' => 'creative_solutions',
                'accent_color' => '#f59e0b',
            ],
        ];

        foreach ($services as $service) {
            Service::firstOrCreate(
                ['slug' => Str::slug($service['name'])],
                $service
            );
        }

        $this->command->info('ServiceSeeder completed successfully!');
        $this->command->info('Created ' . count($services) . ' services.');
    }
}

