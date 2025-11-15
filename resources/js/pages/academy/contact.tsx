import { Head, useForm, usePage } from '@inertiajs/react';
import AcademyLayout from '@/layouts/academy-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

type ProgramOption = {
    id: number;
    name: string;
};

interface ContactProps {
    programOptions: ProgramOption[];
}

const Contact = ({ programOptions }: ContactProps) => {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const { data, setData, post, processing, reset, errors, wasSuccessful } = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        program: '',
        message: '',
    });

    useEffect(() => {
        if (wasSuccessful) {
            reset();
        }
    }, [wasSuccessful, reset]);

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/academy/contact');
    };

    return (
        <AcademyLayout>
            <Head title="Contact" />

            <section className="relative overflow-hidden border-b py-20">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/20 to-background" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                <div className="container relative mx-auto px-4">
                    <div className="mx-auto max-w-3xl space-y-6 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-semibold text-primary backdrop-blur">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            Let&apos;s Build Your Next Learning Journey
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Contact Abhidh Academy</h1>
                        <p className="text-lg text-muted-foreground/90 md:text-xl">
                            Share your goals, and our learning advisors will help you craft the perfect training plan for your team or career.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_0.9fr]">
                        <Card className="border border-white/10 bg-card/70 backdrop-blur">
                            <CardContent className="space-y-6 p-8">
                                <h2 className="text-2xl font-semibold text-foreground">Tell us about your training needs</h2>
                                <p className="text-sm text-muted-foreground">
                                    Our team typically responds within 24 hours. We&apos;ll schedule a discovery call to understand your goals and
                                    suggest the best program fit.
                                </p>

                                {props.flash?.success ? (
                                    <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                                        {props.flash.success}
                                    </div>
                                ) : null}

                                <form className="space-y-5" onSubmit={onSubmit}>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full name</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(event) => setData('name', event.target.value)}
                                                placeholder="Alex Sharma"
                                            />
                                            {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Work email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(event) => setData('email', event.target.value)}
                                                placeholder="you@company.com"
                                                required
                                            />
                                            {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Contact number</Label>
                                            <Input
                                                id="phone"
                                                value={data.phone}
                                                onChange={(event) => setData('phone', event.target.value)}
                                                placeholder="+977-9800000000"
                                            />
                                            {errors.phone ? <p className="text-xs text-destructive">{errors.phone}</p> : null}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="program">Program of interest</Label>
                                            <select
                                                id="program"
                                                value={data.program}
                                                onChange={(event) => setData('program', event.target.value)}
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            >
                                                <option value="">Select a program</option>
                                                {programOptions.map((option) => (
                                                    <option key={option.id} value={option.name}>
                                                        {option.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.program ? <p className="text-xs text-destructive">{errors.program}</p> : null}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subject">How can we help?</Label>
                                        <Input
                                            id="subject"
                                            value={data.subject}
                                            onChange={(event) => setData('subject', event.target.value)}
                                            placeholder="Custom corporate training for our team"
                                        />
                                        {errors.subject ? <p className="text-xs text-destructive">{errors.subject}</p> : null}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Share details about your training requirements</Label>
                                        <Textarea
                                            id="message"
                                            rows={6}
                                            value={data.message}
                                            onChange={(event) => setData('message', event.target.value)}
                                            placeholder="Tell us about your team, preferred schedule, expected learning outcomes, or any specific skills you want to focus on."
                                            required
                                        />
                                        {errors.message ? <p className="text-xs text-destructive">{errors.message}</p> : null}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full rounded-full bg-accent px-6 py-6 text-base font-semibold text-accent-foreground hover:bg-accent/90"
                                        disabled={processing}
                                    >
                                        {processing ? 'Submitting...' : 'Submit request'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="border border-accent/20 bg-gradient-to-br from-primary/10 via-background to-background shadow-xl">
                            <CardContent className="space-y-6 p-8">
                                <h2 className="text-2xl font-semibold text-foreground">Why partner with Abhidh Academy?</h2>
                                <ul className="space-y-4 text-sm text-foreground">
                                    {[
                                        'Customized curriculum aligned with your goals',
                                        'Expert mentors with industry experience',
                                        'Flexible schedules and delivery formats (on-site, online, hybrid)',
                                        'Post-training assessments and progress reports',
                                        'Dedicated success manager for every engagement',
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-3">
                                            <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-accent" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>

                                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-foreground backdrop-blur">
                                    <h3 className="text-lg font-semibold">We&apos;d love to meet you</h3>
                                    <p>
                                        Visit us at <strong>Nardevi, Kathmandu, Nepal</strong> or call us at{' '}
                                        <a href="tel:+9779841080407" className="font-semibold text-primary">
                                            +977-9841080407
                                        </a>
                                        .
                                    </p>
                                    <p>
                                        You can also email us directly at{' '}
                                        <a href="mailto:info@abhidhgroup.com" className="font-semibold text-primary">
                                            info@abhidhgroup.com
                                        </a>
                                        .
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
        </AcademyLayout>
    );
};

export default Contact;

