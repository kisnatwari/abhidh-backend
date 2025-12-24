import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

interface ResetPasswordProps {
    email: string;
    token: string;
}

export default function ResetPassword({ email, token }: ResetPasswordProps) {
    return (
        <AuthLayout
            title="Reset password"
            description="Enter your new password below"
        >
            <Head title="Reset password" />

            <div className="space-y-6">
                <Form
                    action={store.url()}
                    method="post"
                    resetOnSuccess={['password', 'password_confirmation']}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <input type="hidden" name="email" value={email} />
                            <input type="hidden" name="token" value={token} />

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    readOnly
                                    className="bg-slate-50"
                                    autoComplete="email"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">New password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    autoFocus
                                    autoComplete="new-password"
                                    placeholder="Enter your new password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">Confirm password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    required
                                    autoComplete="new-password"
                                    placeholder="Confirm your new password"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <div className="my-6 flex items-center justify-start">
                                <Button
                                    className="w-full"
                                    disabled={processing}
                                    data-test="reset-password-button"
                                >
                                    {processing && (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    )}
                                    Reset password
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="space-x-1 text-center text-sm text-muted-foreground">
                    <span>Or, return to</span>
                    <TextLink href={login()}>log in</TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}

