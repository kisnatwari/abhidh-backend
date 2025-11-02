import AppLayout from '@/layouts/app-layout';
import TeamController from '@/actions/App/Http/Controllers/TeamController';
import { Head, router, usePage } from '@inertiajs/react';
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
import AddTeamDialog from './components/add';
import ViewTeamDialog from './components/view';
import EditTeamDialog from './components/edit';
import DeleteTeamDialog from './components/delete';

type TeamRow = {
  id: number;
  name: string;
  designation: string;
  years_of_experience: number | null;
  photo_url: string | null;
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
  teams: Paginator<TeamRow>;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Teams', href: TeamController.index().url }];

export default function TeamsIndex() {
  const { props } = usePage<PageProps>();
  const pager = props.teams;

  // read current query params (so refresh/back/links keep state)
  const initial = useMemo(() => {
    const s = new URL(window.location.href).searchParams;
    return {
      search: s.get('search') ?? '',
      perPage: s.get('per_page') ?? String(pager.per_page || 10),
    };
  }, [pager.per_page]);

  const [search, setSearch] = useState(initial.search);
  const [perPage, setPerPage] = useState<string>(initial.perPage);

  // Debounce search a bit so it doesn't navigate every keystroke
  useEffect(() => {
    const id = setTimeout(() => navigate(1), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, perPage]);

  const navigate = (page: number | null) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (perPage) params.set('per_page', perPage);
    if (page && page > 1) params.set('page', String(page));

    const url = `${TeamController.index().url}${params.toString() ? `?${params}` : ''}`;
    router.visit(url, { preserveScroll: true, preserveState: true });
  };

  const goTo = (url: string | null) => {
    if (!url) return;
    router.visit(url, { preserveScroll: true, preserveState: true });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Teams" />

      <div className="flex flex-col gap-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Teams</h1>
          <AddTeamDialog />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search name or designation..."
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

        {/* Table */}
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Photo</TableHead>
                <TableHead className="w-[30%]">Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pager.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    No team members found.
                  </TableCell>
                </TableRow>
              )}

              {pager.data.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    {t.photo_url ? (
                      <img
                        src={t.photo_url}
                        alt={t.name}
                        className="h-12 w-12 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full border bg-muted/50 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">No Photo</span>
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="font-medium">
                    <ViewTeamDialog team={t} trigger={<span className="hover:underline cursor-pointer">{t.name}</span>} />
                  </TableCell>

                  <TableCell>
                    {t.designation}
                  </TableCell>

                  <TableCell>
                    {t.years_of_experience ? `${t.years_of_experience} years` : '—'}
                  </TableCell>

                  <TableCell>
                    {new Date(t.created_at).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="text-right space-x-2">
                    <EditTeamDialog team={t} />
                    <DeleteTeamDialog team={t} />
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

