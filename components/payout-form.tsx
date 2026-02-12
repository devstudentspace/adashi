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
  const [processFullAmount, setProcessFullAmount] = useState(false); // Option to process full amount
  const [useCustomAmount, setUseCustomAmount] = useState(false); // Option to use custom amount
  const [customAmount, setCustomAmount] = useState<number>(0); // Custom amount to process

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
      // Determine which amount to process based on user selection
      let amountToProcess: number | undefined = undefined;
      
      if (useCustomAmount && customAmount > 0) {
        amountToProcess = customAmount;
      }

      const result = await processPayout({
        userId,
        schemeId,
        processFullAmount, // Pass the option to process full amount
        customAmount: amountToProcess, // Pass custom amount if specified
        notes: notes || `Payout for ${memberName} - ${new Date().toLocaleDateString()}`
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        // Use the processed amount from the result
        const processedAmount = result.payoutDetails.processedAmount || 
                               (amountToProcess !== undefined ? amountToProcess : 
                               (processFullAmount ? payoutDetails.grossAmount : payoutDetails.netPayout));
        
        toast.success(`Payout of ₦${processedAmount.toLocaleString()} processed for ${memberName}`);

        // Generate receipt data
        const receipt = {
          memberName,
          memberPhone: memberPhone || 'N/A',
          schemeName: payoutDetails.scheme.name,
          schemeType: payoutDetails.scheme.type,
          grossAmount: payoutDetails.grossAmount,
          serviceCharge: payoutDetails.serviceCharge,
          netPayout: payoutDetails.netPayout,
          processedAmount: processedAmount, // Include the actual processed amount
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

        {/* Process Full Amount Toggle */}
        <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <input
            type="checkbox"
            id="processFullAmount"
            checked={processFullAmount}
            onChange={(e) => {
              setProcessFullAmount(e.target.checked);
              if (e.target.checked) setUseCustomAmount(false); // Uncheck custom if full is selected
            }}
            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="processFullAmount" className="text-sm font-medium text-blue-800">
            Process Full Amount (₦{payoutDetails.grossAmount.toLocaleString()})
          </label>
        </div>

        {/* Use Custom Amount Toggle */}
        <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
          <input
            type="checkbox"
            id="useCustomAmount"
            checked={useCustomAmount}
            onChange={(e) => {
              setUseCustomAmount(e.target.checked);
              if (e.target.checked) setProcessFullAmount(false); // Uncheck full if custom is selected
            }}
            className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
          />
          <label htmlFor="useCustomAmount" className="text-sm font-medium text-purple-800">
            Use Custom Amount
          </label>
        </div>

        {/* Custom Amount Input */}
        {useCustomAmount && (
          <div className="space-y-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
            <Label htmlFor="customAmount">Enter Custom Amount (₦)</Label>
            <Input
              id="customAmount"
              type="number"
              min="0"
              max={payoutDetails.grossAmount}
              value={customAmount || ''}
              onChange={(e) => setCustomAmount(Number(e.target.value))}
              placeholder={`Enter amount up to ₦${payoutDetails.grossAmount.toLocaleString()}`}
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground">
              Current balance after payout: ₦{(payoutDetails.grossAmount - (customAmount || 0)).toLocaleString()}
            </p>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={handleProcessPayout}
          disabled={isLoading || (useCustomAmount && (customAmount <= 0 || customAmount > payoutDetails.grossAmount))}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Processing...' : 
           useCustomAmount ? `Process Custom Payout of ₦${customAmount.toLocaleString()}` :
           processFullAmount ? `Process Full Payout of ₦${payoutDetails.grossAmount.toLocaleString()}` :
           `Process Payout of ₦${payoutDetails.netPayout.toLocaleString()}`}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          This action will record the withdrawal and adjust the member's balance.
          {processFullAmount ? ' Full amount will be processed.' : 
           useCustomAmount ? ` Custom amount ₦${customAmount.toLocaleString()} will be processed.` :
           ` Service charges (₦${payoutDetails.serviceCharge.toLocaleString()}) will be deducted.`}
        </p>
      </CardContent>
    </Card>
  );
}