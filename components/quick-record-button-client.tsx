'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Plus } from 'lucide-react';
import { recordContribution, hasUserContributedToday } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

interface QuickRecordButtonProps {
  userId: string;
  schemeId: string;
  amount: number;
  userName: string;
}

export function QuickRecordButton({ userId, schemeId, amount, userName }: QuickRecordButtonProps) {
  const [loading, setLoading] = useState(false);
  const [hasContributedToday, setHasContributedToday] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const { toastSuccess, toastError } = useToast();

  // Check contribution status on mount and after any contribution
  useEffect(() => {
    const checkContributionStatus = async () => {
      setCheckingStatus(true);
      try {
        const contributed = await hasUserContributedToday(userId, schemeId);
        setHasContributedToday(contributed);
      } catch (error) {
        console.error('Error checking contribution status:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkContributionStatus();
  }, [userId, schemeId]);

  const handleRecord = async () => {
    setLoading(true);
    try {
      const result = await recordContribution({
        userId,
        schemeId,
        amount,
        type: 'deposit',
        notes: `Daily contribution for ${userName}`
      });

      if (result.success) {
        // Update the contribution status after successful recording
        setHasContributedToday(true);
        toastSuccess("Contribution recorded successfully!", {
          description: `₦${amount.toLocaleString()} added to ${userName}'s account`
        });
      } else {
        toastError("Failed to record contribution", {
          description: result.error || "An unknown error occurred"
        });
      }
    } catch (err: any) {
      toastError("An unexpected error occurred", {
        description: err.message || "Please try again later"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    // Only allow recording if user hasn't contributed today
    if (!hasContributedToday) {
      handleRecord();
    }
  };

  // Show loading state while checking status
  if (checkingStatus) {
    return (
      <Button size="sm" variant="outline" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant={hasContributedToday ? "outline" : "default"}
      className={hasContributedToday ? "border-green-500 text-green-500" : ""}
      disabled={loading || hasContributedToday}
      onClick={handleClick}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : hasContributedToday ? (
        <Check className="h-4 w-4" />
      ) : (
        <>
          <Plus className="h-4 w-4 mr-1" />
          ₦{amount.toLocaleString()}
        </>
      )}
    </Button>
  );
}