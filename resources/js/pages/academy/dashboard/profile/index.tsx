import { Head, useForm, usePage } from '@inertiajs/react';
import StudentDashboardLayout from '@/layouts/student-dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ProfilePageProps = {
    user: {
        name: string;
        email: string;
    };
    flash?: {
        success?: string;
    };
};

export default function ProfilePage({ user }: ProfilePageProps) {
    const { flash } = usePage<{ flash?: { success?: string } }>().props;
    const form = useForm({
        name: user.name ?? '',
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.put('/academy/profile', {
            preserveScroll: true,
        });
    };

    return (
        <StudentDashboardLayout>
            <Head title="Profile" />

            <header className="max-w-2xl rounded-xl border border-slate-200 bg-white px-6 py-6 text-slate-700 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Learner profile</p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-900">Account details</h1>
                <p className="mt-2 text-sm text-slate-500">
                    Update your learner name for certificates. Email changes are handled by the academy team.
                </p>
            </header>

            <Card className="max-w-2xl rounded-xl border border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-6 px-6 py-6">
                    {flash?.success ? (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{flash.success}</div>
                    ) : null}

                    <form onSubmit={submit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full name</Label>
                            <Input
                                id="name"
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                className="max-w-md"
                            />
                            {form.errors.name ? <p className="text-xs text-red-500">{form.errors.name}</p> : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={user.email} disabled className="max-w-md bg-slate-100" />
                            <p className="text-xs text-slate-400">Contact support to change email address.</p>
                        </div>

                        <div className="flex gap-3">
                            <Button type="submit" className="rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary/90" disabled={form.processing}>
                                Save changes
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="rounded-md text-sm font-medium text-slate-500 hover:text-slate-900"
                                onClick={() => form.reset('name')}
                                disabled={form.processing}
                            >
                                Reset
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </StudentDashboardLayout>
    );
}

