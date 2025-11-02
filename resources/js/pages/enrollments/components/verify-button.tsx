import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function VerifyEnrollmentButton({ enrollmentId }: { enrollmentId: number }) {
  const handleVerify = () => {
    if (confirm('Are you sure you want to verify this payment? The user will be automatically enrolled.')) {
      router.post(`/enrollments/${enrollmentId}/verify`, {}, {
        preserveScroll: true,
        onSuccess: () => {
          // Success message will come from backend
        },
      });
    }
  };

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleVerify}
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      <CheckCircle2 className="h-4 w-4 mr-1" />
      Verify
    </Button>
  );
}

