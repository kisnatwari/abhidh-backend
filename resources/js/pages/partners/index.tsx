import AppLayout from '@/layouts/app-layout';
import partnersRoute from '@/routes/partners';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BreadcrumbItem } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import AddPartnerDialog from './components/add';
import EditPartnerDialog from './components/edit';
import DeletePartnerDialog from './components/delete';

type PartnerRow = {
  id: number;
  name: string;
  logo_url: string | null;
  link: string | null;
  order: number;
  is_active: boolean;
  created_at: string;
};

type Paginator<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
  links: { url: string | null; label: string; active: boolean }[];
};

type PageProps = {
  partners: Paginator<PartnerRow>;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Company Partners', href: '/partners' }];

export default function PartnersIndex() {
  const { props } = usePage<PageProps>();
  const pager = props.partners;

  const initial = useMemo(() => {
    const s = new URL(window.location.href).searchParams;
    return {
      search: s.get('search') ?? '',
      perPage: s.get('per_page') ?? String(pager.per_page || 10),
    };
  }, [pager.per_page]);

  const [search, setSearch] = useState(initial.search);
  const [perPage, setPerPage] = useState<string>(initial.perPage);

  useEffect(() => {
    const id = setTimeout(() => navigate(1), 350);
    return () => clearTimeout(id);
  }, [search, perPage]);

  const navigate = (page: number | null) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (perPage) params.set('per_page', perPage);
    if (page && page > 1) params.set('page', String(page));

    const url = `/partners${params.toString() ? `?${params}` : ''}`;
    router.visit(url, { preserveScroll: true, preserveState: true });
  };

  const goTo = (url: string | null) => {
    if (!url) return;
    router.visit(url, { preserveScroll: true, preserveState: true });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Company Partners" />

      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Company Partners</h1>
          <AddPartnerDialog />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search partners..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows</span>
            <Select value={perPage} onValueChange={(v) => setPerPage(v)}>
              <SelectTrigger className="w-[90px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pager.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    No partners found.
                  </TableCell>
                </TableRow>
              )}

              {pager.data.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.logo_url ? (
                      <img
                        src={p.logo_url}
                        alt={p.name}
                        className="h-10 w-auto max-w-[80px] object-contain"
                      />
                    ) : (
                      <div className="h-10 w-10 border bg-muted/50 flex items-center justify-center rounded">
                        <span className="text-[10px] text-muted-foreground">No Logo</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    {p.link ? (
                      <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                        Visit Site
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>{p.order}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <EditPartnerDialog partner={p} />
                    <DeletePartnerDialog partner={p} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {pager.last_page > 1 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{(pager.current_page - 1) * pager.per_page + 1}</span> – <span className="font-medium">{Math.min(pager.current_page * pager.per_page, pager.total)}</span> of <span className="font-medium">{pager.total}</span> results
            </div>
            <div className="sm:ml-auto">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => navigate(pager.current_page > 1 ? pager.current_page - 1 : null)} />
                  </PaginationItem>
                  {pager.links
                    .filter((l) => l.label !== '&laquo; Previous' && l.label !== 'Next &raquo;')
                    .map((l, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink isActive={l.active} onClick={() => goTo(l.url)} dangerouslySetInnerHTML={{ __html: l.label }} />
                      </PaginationItem>
                    ))}
                  <PaginationItem>
                    <PaginationNext onClick={() => navigate(pager.current_page < pager.last_page ? pager.current_page + 1 : null)} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
