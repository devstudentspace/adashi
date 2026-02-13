'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PayoutForm } from '@/components/payout-form';
import { calculateMemberBalance } from '@/lib/actions';

interface MemberBalanceCardProps {
  userId: string;
  schemeId: string;
  memberName: string;
  memberPhone?: string;
  schemeType: string;
}

interface BalanceData {
  balance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalFees: number;
}

export function MemberBalanceCard({ userId, schemeId, memberName, memberPhone, schemeType }: MemberBalanceCardProps) {
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadBalance = async () => {
    try {
      const data = await calculateMemberBalance(userId, schemeId);
      setBalanceData(data);
    } catch (error) {
      console.error('Failed to load balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBalance();
  }, [userId, schemeId]);

  const handlePayoutSuccess = () => {
    setShowPayoutForm(false);
    loadBalance(); // Refresh balance after payout
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!balanceData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Failed to load balance data</p>
        </CardContent>
      </Card>
    );
  }

  if (showPayoutForm) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setShowPayoutForm(false)}
          className="mb-4"
        >
          ← Back to Balance
        </Button>
        <PayoutForm
          userId={userId}
          schemeId={schemeId}
          memberName={memberName}
          memberPhone={memberPhone}
          onSuccess={handlePayoutSuccess}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{memberName}</CardTitle>
            <Badge variant="secondary" className="mt-2">
              {schemeType.toUpperCase()}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <p className="text-2xl font-bold text-green-600">
              ₦{balanceData.balance.toLocaleString()}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance Breakdown */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Deposits</p>
            <p className="font-semibold text-green-600">
              ₦{balanceData.totalDeposits.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Withdrawals</p>
            <p className="font-semibold text-red-600">
              ₦{balanceData.totalWithdrawals.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Fees</p>
            <p className="font-semibold text-orange-600">
              ₦{balanceData.totalFees.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Actions */}
        {balanceData.balance > 0 && (
          <Button 
            onClick={() => setShowPayoutForm(true)}
            className="w-full"
            size="lg"
          >
            Process Payout
          </Button>
        )}

        {balanceData.balance <= 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            No funds available for payout
          </p>
        )}
      </CardContent>
    </Card>
  );
}