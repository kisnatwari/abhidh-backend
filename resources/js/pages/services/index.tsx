import AppLayout from '@/layouts/app-layout';
import services from '@/routes/services';
import { Head, router, usePage } from '@inertiajs/react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import type { BreadcrumbItem } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import AddServiceDialog from './components/add';
import EditServiceDialog from './components/edit';
import DeleteServiceDialog from './components/delete';
import ViewServiceDialog from './components/view';

type ServiceRow = {
  id: number;
  name: string;
  slug: string;
  category: string;
  created_at: string;
  thumbnail_url: string | null;
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
  services: Paginator<ServiceRow>;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Services', href: services.index().url }];

export default function ServicesIndex() {
  const { props } = usePage<PageProps>();
  const pager = props.services;

  const initial = useMemo(() => {
    const s = new URL(window.location.href).searchParams;
    return {
      search: s.get('search') ?? '',
      category: s.get('category') ?? 'all',
      perPage: s.get('per_page') ?? String(pager.per_page || 10),
    };
  }, [pager.per_page]);

  const [search, setSearch] = useState(initial.search);
  const [category, setCategory] = useState<string>(initial.category);
  const [perPage, setPerPage] = useState<string>(initial.perPage);

  useEffect(() => {
    const id = setTimeout(() => navigate(1), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, perPage]);

  const navigate = (page: number | null) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category && category !== 'all') params.set('category', category);
    if (perPage) params.set('per_page', perPage);
    if (page && page > 1) params.set('page', String(page));

    const url = `${services.index().url}${params.toString() ? `?${params}` : ''}`;
    router.visit(url, { preserveScroll: true, preserveState: true });
  };

  const goTo = (url: string | null) => {
    if (!url) return;
    router.visit(url, { preserveScroll: true, preserveState: true });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Services" />

      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Services</h1>
          <AddServiceDialog />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Select
              value={category}
              onValueChange={setCategory}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="digital_marketing">Digital Marketing</SelectItem>
                <SelectItem value="it_development">IT & Development</SelectItem>
                <SelectItem value="creative_solutions">Creative Solutions</SelectItem>
              </SelectContent>
            </Select>
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
                <TableHead className="w-[100px]">Thumbnail</TableHead>
                <TableHead className="w-[30%]">Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pager.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    No services found.
                  </TableCell>
                </TableRow>
              )}

              {pager.data.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    {s.thumbnail_url ? (
                      <img
                        src={s.thumbnail_url}
                        alt={s.name}
                        className="h-12 w-16 rounded object-cover border"
                      />
                    ) : (
                      <div className="h-12 w-16 rounded border bg-muted/50" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    <ViewServiceDialog service={s} trigger={<span className="hover:underline cursor-pointer">{s.name}</span>} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{s.category.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell>
                    {s.created_at ? format(new Date(s.created_at), 'PP') : '—'}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <EditServiceDialog service={s} />
                    <DeleteServiceDialog service={s} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {pager.last_page > 1 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="text-sm text-muted-foreground sm:text-left text-center w-full sm:w-auto">
              Showing{' '}
              <span className="font-medium">
                {(pager.current_page - 1) * pager.per_page + 1}
              </span>{' '}
              –{' '}
              <span className="font-medium">
                {Math.min(pager.current_page * pager.per_page, pager.total)}
              </span>{' '}
              of <span className="font-medium">{pager.total}</span> results
            </div>
            <div className="sm:ml-auto">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        navigate(pager.current_page > 1 ? pager.current_page - 1 : null)
                      }
                    />
                  </PaginationItem>
                  {pager.links
                    .filter(
                      (l) =>
                        l.label !== '&laquo; Previous' && l.label !== 'Next &raquo;'
                    )
                    .map((l, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          isActive={l.active}
                          onClick={() => goTo(l.url)}
                          dangerouslySetInnerHTML={{ __html: l.label }}
                        />
                      </PaginationItem>
                    ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        navigate(
                          pager.current_page < pager.last_page
                            ? pager.current_page + 1
                            : null
                        )
                      }
                    />
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

