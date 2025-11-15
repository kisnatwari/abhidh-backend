import AppLayout from '@/layouts/app-layout';
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
import ViewUserDialog from './components/view';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, ShieldCheck, ShieldOff, Trash2, UserCircle2 } from 'lucide-react';
import InviteAdminDialog from './components/invite-admin-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type UserRow = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  tokens_count: number;
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
  users: Paginator<UserRow>;
  flash?: {
    success?: string;
    error?: string;
  };
  auth?: {
    user?: {
      id: number;
    };
  };
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Users', href: '/users' }];

export default function UsersIndex() {
  const { props } = usePage<PageProps>();
  const pager = props.users;
  const flash = props.flash;
  const authUserId = props.auth?.user?.id ?? null;

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
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

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

    const url = `/users${params.toString() ? `?${params}` : ''}`;
    router.visit(url, { preserveScroll: true, preserveState: true });
  };

  const handleVerify = (userId: number) => {
    setActionLoadingId(userId);
    router.post(`/users/${userId}/verify`, {}, {
      preserveScroll: true,
      onFinish: () => setActionLoadingId(null),
    });
  };

  const handleUnverify = (userId: number) => {
    setActionLoadingId(userId);
    router.post(`/users/${userId}/unverify`, {}, {
      preserveScroll: true,
      onFinish: () => setActionLoadingId(null),
    });
  };

  const handleDelete = (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    setActionLoadingId(userId);
    router.delete(`/users/${userId}`, {
      preserveScroll: true,
      onFinish: () => setActionLoadingId(null),
    });
  };

  const goTo = (url: string | null) => {
    if (!url) return;
    router.visit(url, { preserveScroll: true, preserveState: true });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Users" />

      <div className="flex flex-col gap-4 p-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold">Users</h1>
          <InviteAdminDialog />
        </div>

        {flash?.success && (
          <Alert variant="default" className="border-emerald-200 bg-emerald-50 text-emerald-700">
            <AlertTitle className="font-semibold">Success</AlertTitle>
            <AlertDescription>{flash.success}</AlertDescription>
          </Alert>
        )}

        {flash?.error && (
          <Alert variant="destructive">
            <AlertTitle className="font-semibold">Email could not be sent</AlertTitle>
            <AlertDescription>{flash.error}</AlertDescription>
          </Alert>
        )}

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search name or email..."
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
                <TableHead className="w-[80px]">Avatar</TableHead>
                <TableHead className="w-[30%]">Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>API Tokens</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pager.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              )}

              {pager.data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="h-12 w-12 rounded-full border bg-muted/50 flex items-center justify-center">
                      <UserCircle2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </TableCell>

                  <TableCell className="font-medium">
                    <ViewUserDialog user={user} trigger={<span className="hover:underline cursor-pointer">{user.name}</span>} />
                  </TableCell>

                  <TableCell>
                    {user.email}
                  </TableCell>

                  <TableCell>
                    {user.email_verified_at ? (
                      <Badge variant="secondary" className="text-white bg-green-600">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-white bg-gray-500">
                        Unverified
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline">{user.tokens_count} tokens</Badge>
                  </TableCell>

                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Open actions">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => handleVerify(user.id)}
                          disabled={actionLoadingId === user.id || !!user.email_verified_at}
                        >
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Mark as verified
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUnverify(user.id)}
                          disabled={actionLoadingId === user.id || !user.email_verified_at}
                        >
                          <ShieldOff className="mr-2 h-4 w-4" />
                          Remove verification
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(user.id)}
                          disabled={actionLoadingId === user.id || authUserId === user.id}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

