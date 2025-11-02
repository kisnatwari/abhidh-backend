import * as React from 'react';
import { router } from '@inertiajs/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, CheckCircle2, XCircle, Edit, Trash2 } from 'lucide-react';
import ViewEnrollmentDialog from './view';
import EditEnrollmentDialog from './edit';
import DeleteEnrollmentDialog from './delete';

export default function EnrollmentActionsMenu({
  enrollment,
  courses,
  users,
}: {
  enrollment: any;
  courses?: { id: number; name: string; program: { id: number; name: string } }[];
  users?: { id: number; name: string; email: string }[];
}) {
  const [viewOpen, setViewOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const handleVerify = () => {
    if (confirm('Are you sure you want to verify this payment? The user will be automatically enrolled.')) {
      router.post(`/enrollments/${enrollment.id}/verify`, {}, {
        preserveScroll: true,
      });
    }
  };

  const handleUnverify = () => {
    if (confirm('Are you sure you want to unverify this payment?')) {
      router.post(`/enrollments/${enrollment.id}/unverify`, {}, {
        preserveScroll: true,
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setViewOpen(true)}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>
          
          {!enrollment.payment_verified && enrollment.payment_screenshot_path && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleVerify} className="text-green-600 focus:text-green-600">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Verify Payment
              </DropdownMenuItem>
            </>
          )}
          
          {enrollment.payment_verified && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleUnverify} className="text-orange-600 focus:text-orange-600">
                <XCircle className="h-4 w-4 mr-2" />
                Unverify Payment
              </DropdownMenuItem>
            </>
          )}
          
          {courses && users && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            </>
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onSelect={() => setDeleteOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ViewEnrollmentDialog 
        enrollment={enrollment} 
        courses={courses}
        users={users}
        open={viewOpen}
        onOpenChange={setViewOpen}
        trigger={<span className="hidden" />}
      />

      {courses && users && (
        <EditEnrollmentDialog 
          enrollment={enrollment} 
          courses={courses} 
          users={users}
          open={editOpen}
          onOpenChange={setEditOpen}
          trigger={<span className="hidden" />}
        />
      )}

      <DeleteEnrollmentDialog 
        enrollment={enrollment}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        trigger={<span className="hidden" />}
      />
    </>
  );
}

