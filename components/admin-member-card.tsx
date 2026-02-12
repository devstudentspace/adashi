'use client';

import { ContributionCard } from './contribution-card';
import { recordContribution } from '@/lib/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface AdminMemberCardProps {
  userId: string;
  schemeId: string;
  amount: number;
  transactions: any[];
  startDate: string;
  frequency: string;
}

export function AdminMemberCard({ 
  userId, 
  schemeId, 
  amount, 
  transactions, 
  startDate, 
  frequency 
}: AdminMemberCardProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCellClick = async (date: Date) => {
    setLoading(true);
    try {
      const result = await recordContribution({
        userId,
        schemeId,
        amount: Number(amount),
        type: 'deposit',
        date: date.toISOString(),
        notes: `Contribution for ${date.toLocaleDateString()} recorded by Admin`
      });

      if (result.success) {
        toast.success("Contribution recorded successfully!");
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

  return (
    <ContributionCard
      transactions={transactions}
      contributionAmount={Number(amount)}
      frequency={frequency}
      startDate={startDate}
      onCellClick={handleCellClick} // Admin can record contributions
      isLoading={loading}
    />
  );
}