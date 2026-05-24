import AcademyLayout from '@/layouts/academy-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Search, CheckCircle2, XCircle, Award } from 'lucide-react';

interface CertificateData {
    certificate_number: string;
    issued_at: string;
    student_name: string;
    course_title: string;
    course_duration: string | null;
}

interface PageProps {
    certificate: CertificateData | null;
    error: string | null;
}

export default function VerifyCertificate({ certificate, error }: PageProps) {
    const [code, setCode] = useState(certificate?.certificate_number ?? '');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = code.trim().toUpperCase();
        if (trimmed) {
            router.get(`/verify-certificate/${trimmed}`);
        }
    }

    return (
        <AcademyLayout>
            <Head title="Verify Certificate — Abhidh Academy" />

            <section className="min-h-[80vh] bg-background py-20 px-4">
                <div className="container mx-auto max-w-2xl">

                    {/* Header */}
                    <div className="mb-12 text-center space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
                            <ShieldCheck className="h-4 w-4" />
                            Certificate Verification
                        </div>
                        <h1 className="text-3xl font-bold md:text-4xl">Verify Certificate</h1>
                        <p className="text-muted-foreground">
                            Enter the certificate number to verify its authenticity.
                        </p>
                    </div>

                    {/* Search form */}
                    <form onSubmit={handleSearch} className="flex gap-3 mb-10">
                        <Input
                            value={code}
                            onChange={e => setCode(e.target.value.toUpperCase())}
                            placeholder="e.g. SMM2205202601"
                            className="h-12 text-base font-mono tracking-wider uppercase"
                            autoFocus
                        />
                        <Button type="submit" className="h-12 px-6 gap-2 shrink-0">
                            <Search className="h-4 w-4" /> Verify
                        </Button>
                    </form>

                    {/* Error state */}
                    {error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 flex items-start gap-4">
                            <XCircle className="h-6 w-6 text-red-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-semibold text-red-700">Not Found</p>
                                <p className="text-sm text-red-600 mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Success state */}
                    {certificate && (
                        <div className="rounded-2xl border border-green-200 bg-green-50 p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-green-800 text-lg">Certificate Verified</p>
                                    <p className="text-sm text-green-600">This certificate is authentic.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="rounded-xl bg-white border border-green-100 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Student Name</p>
                                    <p className="font-bold text-foreground text-lg">{certificate.student_name}</p>
                                </div>
                                <div className="rounded-xl bg-white border border-green-100 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Certificate Number</p>
                                    <p className="font-mono font-bold text-foreground">{certificate.certificate_number}</p>
                                </div>
                                <div className="rounded-xl bg-white border border-green-100 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Course</p>
                                    <p className="font-semibold text-foreground">{certificate.course_title}</p>
                                </div>
                                <div className="rounded-xl bg-white border border-green-100 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Issued On</p>
                                    <p className="font-semibold text-foreground">{certificate.issued_at}</p>
                                </div>
                                {certificate.course_duration && (
                                    <div className="rounded-xl bg-white border border-green-100 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Duration</p>
                                        <p className="font-semibold text-foreground">{certificate.course_duration}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
                                <Award className="h-5 w-5 text-amber-600 shrink-0" />
                                <p className="text-sm text-amber-800">
                                    This certificate was issued by <strong>Abhidh Academy</strong> and is verified as genuine.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </AcademyLayout>
    );
}
