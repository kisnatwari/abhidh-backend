import AppLayout from '@/layouts/app-layout';
import galleries from '@/routes/galleries';
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
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import AddGalleryDialog from './components/add';
import EditGalleryDialog from './components/edit';
import DeleteGalleryDialog from './components/delete';
import ViewGalleryDialog from './components/view';

type GalleryPhoto = {
  id: number;
  photo_path: string;
  photo_url: string;
  caption: string | null;
  sort_order: number;
};

type GalleryRow = {
  id: number;
  title: string;
  description: string | null;
  option: string | null;
  photos: GalleryPhoto[];
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
  galleries: Paginator<GalleryRow>;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Galleries', href: galleries.index().url }];

export default function GalleriesIndex() {
  const { props } = usePage<PageProps>();
  const pager = props.galleries;

  // read current query params (so refresh/back/links keep state)
  const initial = useMemo(() => {
    const s = new URL(window.location.href).searchParams;
    return {
      search: s.get('search') ?? '',
      option: s.get('option') ?? 'all',
      perPage: s.get('per_page') ?? String(pager.per_page || 10),
    };
  }, [pager.per_page]);

  const [search, setSearch] = useState(initial.search);
  const [option, setOption] = useState<string>(initial.option);
  const [perPage, setPerPage] = useState<string>(initial.perPage);

  // Debounce search a bit so it doesn't navigate every keystroke
  useEffect(() => {
    const id = setTimeout(() => navigate(1), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, option, perPage]);

  const navigate = (page: number | null) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (option && option !== 'all') params.set('option', option);
    if (perPage) params.set('per_page', perPage);
    if (page && page > 1) params.set('page', String(page));

    const url = `${galleries.index().url}${params.toString() ? `?${params}` : ''}`;
    router.visit(url, { preserveScroll: true, preserveState: true });
  };

  const goTo = (url: string | null) => {
    if (!url) return;
    router.visit(url, { preserveScroll: true, preserveState: true });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Galleries" />

      <div className="flex flex-col gap-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Galleries</h1>
          <AddGalleryDialog />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search galleries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Select
              value={option}
              onValueChange={setOption}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Options</SelectItem>
                <SelectItem value="Abhidh">Abhidh</SelectItem>
                <SelectItem value="Abhidh Creative">Abhidh Creative</SelectItem>
                <SelectItem value="Abhidh Academy">Abhidh Academy</SelectItem>
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

        {/* Table */}
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Preview</TableHead>
                <TableHead className="w-[30%]">Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Option</TableHead>
                <TableHead>Photos</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pager.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    No galleries found.
                  </TableCell>
                </TableRow>
              )}

              {pager.data.map((g) => (
                <TableRow key={g.id}>
                  <TableCell>
                    {g.photos.length > 0 ? (
                      <div className="flex gap-1">
                        {g.photos.slice(0, 3).map((photo, index) => (
                          <img
                            key={photo.id}
                            src={photo.photo_url}
                            alt={photo.caption || `Photo ${index + 1}`}
                            className="h-12 w-12 rounded object-cover border"
                          />
                        ))}
                        {g.photos.length > 3 && (
                          <div className="h-12 w-12 rounded border bg-muted/50 flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">+{g.photos.length - 3}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded border bg-muted/50 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">No Photos</span>
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="font-medium">
                    <ViewGalleryDialog gallery={g} trigger={<span className="hover:underline cursor-pointer">{g.title}</span>} />
                  </TableCell>

                  <TableCell>
                    <div className="max-w-xs truncate">
                      {g.description ? (
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ 
                            __html: g.description.replace(/<[^>]*>/g, '').substring(0, 100) + '...' 
                          }}
                        />
                      ) : '—'}
                    </div>
                  </TableCell>

                  <TableCell>
                    {g.option ? <Badge variant="outline">{g.option}</Badge> : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{g.photos.length} photos</Badge>
                  </TableCell>

                  <TableCell>
                    {new Date(g.created_at).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="text-right space-x-2">
                    <EditGalleryDialog gallery={g} />
                    <DeleteGalleryDialog gallery={g} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pager.last_page > 1 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            {/* Left side details */}
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

            {/* Right side pagination controls */}
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
