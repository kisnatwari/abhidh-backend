import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function UnverifyEnrollmentButton({ enrollmentId }: { enrollmentId: number }) {
  const handleUnverify = () => {
    if (confirm('Are you sure you want to unverify this payment?')) {
      router.post(`/enrollments/${enrollmentId}/unverify`, {}, {
        preserveScroll: true,
        onSuccess: () => {
          // Success message will come from backend
        },
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleUnverify}
      className="text-red-600 border-red-600 hover:bg-red-50"
    >
      <XCircle className="h-4 w-4 mr-1" />
      Unverify
    </Button>
  );
}

