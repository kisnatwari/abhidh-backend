import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { BreadcrumbItem } from '@/types';
import AddLegalPageDialog from './components/add';
import EditLegalPageDialog from './components/edit';
import DeleteLegalPageDialog from './components/delete';

type LegalPageRow = {
    id: number;
    type: 'terms' | 'privacy';
    title: string;
    content: string;
    is_published: boolean;
    published_at: string | null;
    created_at: string;
};

type PageProps = {
    pages: LegalPageRow[];
};

const typeLabels: Record<string, string> = {
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Legal Pages', href: '/legal-pages' }];

export default function LegalPagesIndex() {
    const { props } = usePage<PageProps>();
    const pages = props.pages;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Legal Pages" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Legal Pages</h1>
                    <AddLegalPageDialog />
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead className="w-[40%]">Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Published</TableHead>
                                <TableHead>Updated</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pages.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                                        No legal pages found. Create a Terms of Service or Privacy Policy.
                                    </TableCell>
                                </TableRow>
                            )}

                            {pages.map((page) => (
                                <TableRow key={page.id}>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {typeLabels[page.type] ?? page.type}
                                        </Badge>
                                    </TableCell>

                                    <TableCell className="font-medium">{page.title}</TableCell>

                                    <TableCell>
                                        {page.is_published ? (
                                            <Badge variant="default">Published</Badge>
                                        ) : (
                                            <Badge variant="secondary">Draft</Badge>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        {page.published_at ? format(new Date(page.published_at), 'PP') : '—'}
                                    </TableCell>

                                    <TableCell>
                                        {page.created_at ? format(new Date(page.created_at), 'PP') : '—'}
                                    </TableCell>

                                    <TableCell className="text-right space-x-2">
                                        <EditLegalPageDialog page={page} />
                                        <DeleteLegalPageDialog page={page} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
