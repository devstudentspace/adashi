'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { recordContribution } from '@/lib/actions';
import { toast } from 'sonner';

interface Member {
  id: string;
  full_name: string;
  phone_number: string;
}

interface Scheme {
  id: string;
  name: string;
  contribution_amount: number;
  frequency: string;
}

interface QuickRecordFormProps {
  member: Member;
  scheme: Scheme;
  hasContributedToday: boolean;
  onSuccess?: () => void;
}

export function QuickRecordForm({ member, scheme, hasContributedToday, onSuccess }: QuickRecordFormProps) {
  const [amount, setAmount] = useState(scheme.contribution_amount.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState('');

  const handleQuickRecord = async () => {
    setIsLoading(true);
    try {
      const result = await recordContribution({
        userId: member.id,
        schemeId: scheme.id,
        amount: parseFloat(amount),
        type: 'deposit',
        notes: notes || `Daily contribution - ${new Date().toLocaleDateString()}`
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`₦${parseFloat(amount).toLocaleString()} recorded for ${member.full_name}`);
        setNotes('');
        onSuccess?.();
      }
    } catch (error) {
      toast.error('Failed to record contribution');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`transition-all ${hasContributedToday ? 'bg-green-50 border-green-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{member.full_name}</CardTitle>
            <p className="text-sm text-muted-foreground">{member.phone_number}</p>
          </div>
          {hasContributedToday && (
            <Badge variant="default" className="bg-green-600">
              Paid Today
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`amount-${member.id}`}>Amount (₦)</Label>
            <Input
              id={`amount-${member.id}`}
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={scheme.contribution_amount.toString()}
            />
          </div>
          <div>
            <Label htmlFor={`notes-${member.id}`}>Notes (Optional)</Label>
            <Input
              id={`notes-${member.id}`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
            />
          </div>
        </div>
        
        <Button 
          onClick={handleQuickRecord}
          disabled={isLoading || hasContributedToday}
          className="w-full"
          variant={hasContributedToday ? "secondary" : "default"}
        >
          {isLoading ? 'Recording...' : hasContributedToday ? 'Already Paid Today' : `Record ₦${parseFloat(amount).toLocaleString()}`}
        </Button>
      </CardContent>
    </Card>
  );
}