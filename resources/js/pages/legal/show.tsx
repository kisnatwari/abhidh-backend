import { Head, usePage } from '@inertiajs/react';
import AcademyLayout from '@/layouts/academy-layout';

type LegalPageData = {
    id: number;
    title: string;
    content: string;
    published_at: string | null;
} | null;

type PageProps = {
    page: LegalPageData;
    pageType: string;
};

export default function LegalShow() {
    const { props } = usePage<PageProps>();
    const { page, pageType } = props;

    return (
        <AcademyLayout>
            <Head title={pageType} />

            <div className="container mx-auto max-w-4xl px-4 py-16">
                {page ? (
                    <>
                        <h1 className="mb-2 text-3xl font-bold text-foreground">{page.title}</h1>
                        {page.published_at && (
                            <p className="mb-8 text-sm text-muted-foreground">
                                Last updated:{' '}
                                {new Date(page.published_at).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        )}
                        <div
                            className="prose prose-sm max-w-none dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: page.content }}
                        />
                    </>
                ) : (
                    <div className="py-24 text-center">
                        <h1 className="mb-4 text-3xl font-bold text-foreground">{pageType}</h1>
                        <p className="text-muted-foreground">
                            This page is currently being updated. Please check back soon.
                        </p>
                    </div>
                )}
            </div>
        </AcademyLayout>
    );
}
