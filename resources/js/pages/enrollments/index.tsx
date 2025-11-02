import AppLayout from '@/layouts/app-layout';
import enrollments from '@/routes/enrollments';
import CourseController from '@/actions/App/Http/Controllers/CourseController';
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import EnrollmentActionsMenu from './components/actions-menu';
import ViewEnrollmentDialog from './components/view';

const statusLabels = {
  active: 'Active',
  completed: 'Completed',
  dropped: 'Dropped',
};

const statusColors = {
  active: 'bg-green-500',
  completed: 'bg-blue-500',
  dropped: 'bg-red-500',
};

export type EnrollmentRow = {
  id: number;
  user_id: number;
  course_id: number;
  user: { id: number; name: string; email: string };
  course: { 
    id: number; 
    title: string; 
    program: { id: number; name: string } | null
  } | null;
  enrollment_date: string;
  status: string;
  is_paid: boolean;
  payment_screenshot_path: string | null;
  payment_screenshot_url: string | null;
  payment_verified: boolean;
  payment_verified_at: string | null;
  verified_by: { id: number; name: string } | null;
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
  enrollments: Paginator<EnrollmentRow>;
  courses: { id: number; name: string; program: { id: number; name: string } }[];
  users: { id: number; name: string; email: string }[];
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Enrollments', href: enrollments.index().url }];

export default function EnrollmentsIndex() {
  const { props } = usePage<PageProps>();
  const pager = props.enrollments;
  const courseOptions = props.courses;
  const userOptions = props.users;

  // read current query params (so refresh/back/links keep state)
  const initial = useMemo(() => {
    const s = new URL(window.location.href).searchParams;
    return {
      search: s.get('search') ?? '',
      status: s.get('status') ?? 'all',
      isPaid: s.get('is_paid') ?? 'all',
      perPage: s.get('per_page') ?? String(pager.per_page || 10),
    };
  }, [pager.per_page]);

  const [search, setSearch] = useState(initial.search);
  const [status, setStatus] = useState(initial.status);
  const [isPaid, setIsPaid] = useState(initial.isPaid);
  const [perPage, setPerPage] = useState<string>(initial.perPage);

  // Debounce search a bit so it doesn't navigate every keystroke
  useEffect(() => {
    const id = setTimeout(() => navigate(1), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, isPaid, perPage]);

  const navigate = (page: number | null) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status && status !== 'all') params.set('status', status);
    if (isPaid && isPaid !== 'all') params.set('is_paid', isPaid);
    if (perPage) params.set('per_page', perPage);
    if (page && page > 1) params.set('page', String(page));

    const url = `${enrollments.index().url}${params.toString() ? `?${params}` : ''}`;
    router.visit(url, { preserveScroll: true, preserveState: true });
  };

  const goTo = (url: string | null) => {
    if (!url) return;
    router.visit(url, { preserveScroll: true, preserveState: true });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Enrollments" />

      <div className="flex flex-col gap-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Enrollments</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enrollments are created when users submit payment screenshots via API. Verify payments to auto-enroll users.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search enrollments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={isPaid} onValueChange={setIsPaid}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="1">Paid</SelectItem>
                <SelectItem value="0">Unpaid</SelectItem>
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
                <TableHead className="w-[20%]">Student</TableHead>
                <TableHead className="w-[20%]">Course</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead className="w-[50px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pager.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                    No enrollments found.
                  </TableCell>
                </TableRow>
              )}

              {pager.data.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">
                    <ViewEnrollmentDialog 
                      enrollment={e} 
                      courses={courseOptions}
                      users={userOptions}
                      trigger={
                        <span className="hover:underline cursor-pointer">
                          {e.user.name}
                        </span>
                      } 
                    />
                    <div className="text-sm text-muted-foreground">{e.user.email}</div>
                  </TableCell>
                  
                  <TableCell>
                    {e.course ? (
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium"
                        onClick={() => {
                          if (e.course) {
                            router.visit(CourseController.show.url(e.course.id));
                          }
                        }}
                      >
                        {e.course.title}
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {e.course?.program ? (
                      <Badge variant="outline">{e.course.program.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        'text-white',
                        statusColors[e.status as keyof typeof statusColors]
                      )}
                    >
                      {statusLabels[e.status as keyof typeof statusLabels]}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    {e.is_paid ? (
                      <Badge variant="default">Paid</Badge>
                    ) : (
                      <Badge variant="outline">Unpaid</Badge>
                    )}
                    {e.payment_screenshot_url && (
                      <div className="mt-1">
                        <a 
                          href={e.payment_screenshot_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View Screenshot
                        </a>
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {e.payment_verified ? (
                      <Badge variant="secondary" className="text-white bg-green-600">
                        Verified
                      </Badge>
                    ) : e.payment_screenshot_path ? (
                      <Badge variant="secondary" className="text-white bg-yellow-600">
                        Pending
                      </Badge>
                    ) : (
                      <Badge variant="outline">No Screenshot</Badge>
                    )}
                    {e.verified_by && (
                      <div className="text-xs text-muted-foreground mt-1">
                        by {e.verified_by.name}
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {new Date(e.enrollment_date).toLocaleDateString()}
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <EnrollmentActionsMenu 
                      enrollment={e} 
                      courses={courseOptions}
                      users={userOptions}
                    />
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


