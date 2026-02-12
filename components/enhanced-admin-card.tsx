'use client';

import { useState } from 'react';
import { ContributionCard } from './contribution-card';
import { recordContribution } from '@/lib/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarDays, Plus, TrendingUp } from 'lucide-react';

interface Props {
  userId: string;
  schemeId: string;
  amount: number;
  transactions: any[];
  startDate: string;
  userName: string;
  userPhone?: string;
  frequency: string;
}

export function EnhancedAdminCard({
  userId,
  schemeId,
  amount,
  transactions,
  startDate,
  userName,
  userPhone,
  frequency
}: Props) {
  const [loading, setLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState(amount.toString());
  const [showQuickRecord, setShowQuickRecord] = useState(false);
  const router = useRouter();

  // Calculate statistics
  const totalSaved = transactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const contributionCount = transactions.filter(t => t.type === 'deposit').length;
  
  const today = new Date().toISOString().split('T')[0];
  const paidToday = transactions.some(t => 
    t.type === 'deposit' && t.date.split('T')[0] === today
  );

  const handleCellClick = async (date: Date) => {
    setLoading(true);
    try {
      const result = await recordContribution({
        userId,
        schemeId,
        amount: parseFloat(customAmount),
        type: 'deposit',
        date: date.toISOString(),
        notes: `Manual contribution for ${formatDate(date)} recorded by Admin`
      });

      if (result.success) {
        toast.success("Contribution recorded successfully!", {
          description: `₦${parseFloat(customAmount).toLocaleString()} added to ${userName}'s account`
        });
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

  const handleQuickRecord = async () => {
    setLoading(true);
    try {
      const result = await recordContribution({
        userId,
        schemeId,
        amount: parseFloat(customAmount),
        type: 'deposit',
        notes: `Quick contribution recorded by Admin`
      });

      if (result.success) {
        toast.success("Contribution recorded successfully!", {
          description: `₦${parseFloat(customAmount).toLocaleString()} added to ${userName}'s account`
        });
        setShowQuickRecord(false);
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
    <div className="space-y-4">
      {/* Member Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{userName}</CardTitle>
              {userPhone && (
                <p className="text-sm text-muted-foreground">{userPhone}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {paidToday && (
                <Badge variant="default" className="bg-green-600">
                  Paid Today
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQuickRecord(!showQuickRecord)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Quick Record
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {showQuickRecord && (
          <CardContent className="pt-0">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label htmlFor="amount">Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder={amount.toString()}
                />
              </div>
              <Button 
                onClick={handleQuickRecord}
                disabled={loading || !customAmount}
              >
                {loading ? 'Recording...' : 'Record'}
              </Button>
            </div>
          </CardContent>
        )}

        <CardContent className="pt-0">
          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                ₦{totalSaved.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Total Saved</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {contributionCount}
              </div>
              <div className="text-xs text-muted-foreground">Contributions</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                ₦{customAmount !== amount.toString() ? parseFloat(customAmount).toLocaleString() : amount.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Next Amount</div>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 inline mr-1" />
            Click on any day in the calendar below to record a contribution
          </div>
        </CardContent>
      </Card>

      {/* Contribution Calendar */}
      <ContributionCard
        transactions={transactions}
        contributionAmount={parseFloat(customAmount)}
        frequency={frequency}
        startDate={startDate}
        onCellClick={handleCellClick}
        isLoading={loading}
      />
    </div>
  );
}