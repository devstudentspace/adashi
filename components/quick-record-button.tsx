'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Plus } from 'lucide-react';
import { recordContribution } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

interface QuickRecordButtonProps {
  userId: string;
  schemeId: string;
  amount: number;
  userName: string;
}

export function QuickRecordButton({ userId, schemeId, amount, userName }: QuickRecordButtonProps) {
  const [loading, setLoading] = useState(false);
  const [hasContributed, setHasContributed] = useState(false);
  const { toastSuccess, toastError } = useToast();

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
        setHasContributed(true);
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
    // Only allow recording if user hasn't contributed in this session yet
    // Note: The parent component handles the "already contributed today" logic
    if (!hasContributed) {
      handleRecord();
    }
  };

  // Determine if the button should be disabled (if user has contributed in this session)
  const isDisabled = hasContributed;

  return (
    <Button
      size="sm"
      variant={isDisabled ? "outline" : "default"}
      className={isDisabled ? "border-green-500 text-green-500" : ""}
      disabled={loading || isDisabled}
      onClick={handleClick}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isDisabled ? (
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
