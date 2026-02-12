'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ReceiptGenerator } from '@/components/receipt-generator';
import { calculatePayout, processPayout } from '@/lib/actions';
import { toast } from 'sonner';

interface PayoutFormProps {
  userId: string;
  schemeId: string;
  memberName: string;
  memberPhone?: string;
  onSuccess?: () => void;
}

interface PayoutDetails {
  grossAmount: number;
  serviceCharge: number;
  netPayout: number;
  scheme: {
    name: string;
    type: string;
  };
}

export function PayoutForm({ userId, schemeId, memberName, memberPhone, onSuccess }: PayoutFormProps) {
  const [payoutDetails, setPayoutDetails] = useState<PayoutDetails | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  useEffect(() => {
    const loadPayoutDetails = async () => {
      try {
        const details = await calculatePayout(userId, schemeId);
        setPayoutDetails(details);
      } catch (error) {
        toast.error('Failed to calculate payout');
        console.error(error);
      } finally {
        setIsCalculating(false);
      }
    };

    loadPayoutDetails();
  }, [userId, schemeId]);

  const handleProcessPayout = async () => {
    if (!payoutDetails) return;

    setIsLoading(true);
    try {
      const result = await processPayout({
        userId,
        schemeId,
        notes: notes || `Payout for ${memberName} - ${new Date().toLocaleDateString()}`
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Payout of ₦${payoutDetails.netPayout.toLocaleString()} processed for ${memberName}`);
        
        // Generate receipt data
        const receipt = {
          memberName,
          memberPhone: memberPhone || 'N/A',
          schemeName: payoutDetails.scheme.name,
          schemeType: payoutDetails.scheme.type,
          grossAmount: payoutDetails.grossAmount,
          serviceCharge: payoutDetails.serviceCharge,
          netPayout: payoutDetails.netPayout,
          processedAt: new Date().toISOString(),
          receiptNumber: `RCP-${Date.now()}-${userId.slice(-6).toUpperCase()}`
        };
        
        setReceiptData(receipt);
        setShowReceipt(true);
        onSuccess?.();
      }
    } catch (error) {
      toast.error('Failed to process payout');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (showReceipt && receiptData) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setShowReceipt(false)}
          className="mb-4"
        >
          ← Back to Payout
        </Button>
        <ReceiptGenerator receiptData={receiptData} />
      </div>
    );
  }

  if (isCalculating) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Calculating payout...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!payoutDetails || payoutDetails.netPayout <= 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No funds available for payout</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Process Payout - {memberName}</CardTitle>
        <Badge variant="secondary">{payoutDetails.scheme.type.toUpperCase()}</Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payout Breakdown */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Savings</span>
            <span className="font-medium">₦{payoutDetails.grossAmount.toLocaleString()}</span>
          </div>
          
          {payoutDetails.serviceCharge > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Service Charge</span>
              <span className="font-medium text-red-600">-₦{payoutDetails.serviceCharge.toLocaleString()}</span>
            </div>
          )}
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <span className="font-semibold">Net Payout</span>
            <span className="text-xl font-bold text-green-600">₦{payoutDetails.netPayout.toLocaleString()}</span>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="payout-notes">Notes (Optional)</Label>
          <Input
            id="payout-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes for this payout..."
          />
        </div>

        {/* Action Button */}
        <Button 
          onClick={handleProcessPayout}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Processing...' : `Process Payout of ₦${payoutDetails.netPayout.toLocaleString()}`}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          This action will record the withdrawal and reset the member's balance.
        </p>
      </CardContent>
    </Card>
  );
}