'use client';

import { useState } from 'react';
import { ContributionCard } from './contribution-card';
import { recordContribution } from '@/lib/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Props {
  userId: string;
  schemeId: string;
  amount: number;
  transactions: any[];
  startDate: string;
  userName: string;
  frequency: string;
}

export function AdminMemberCardInteractive({
  userId,
  schemeId,
  amount,
  transactions,
  startDate,
  userName,
  frequency
}: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCellClick = async (date: Date) => {
    setLoading(true);
    try {
      const result = await recordContribution({
        userId,
        schemeId,
        amount,
        type: 'deposit',
        date: date.toISOString(),
        notes: `Manual contribution for ${formatDate(date)} recorded by Admin`
      });

      if (result.success) {
        toast.success("Contribution recorded successfully!", {
          description: `₦${amount.toLocaleString()} added to ${userName}'s account`
        });
        // Refresh the page to show updated data
        router.refresh();
      } else {
        toast.error("Failed to record contribution", {
          description: result.error || "An unknown error occurred"
        });
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred", {
        description: error.message || "Please try again later"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <ContributionCard
      transactions={transactions}
      contributionAmount={amount}
      frequency={frequency}
      startDate={startDate}
      onCellClick={handleCellClick}
      isLoading={loading}
    />
  );
}
