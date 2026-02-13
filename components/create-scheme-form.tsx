'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';

export function CreateSchemeForm() {
  const [name, setName] = useState('');
  const [type, setType] = useState<'akawo' | 'kwanta' | 'ajita'>('akawo');
  const [contributionAmount, setContributionAmount] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [endDate, setEndDate] = useState('');
  const [rules, setRules] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!name.trim()) {
        throw new Error('Scheme name is required');
      }
      
      if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
        throw new Error('Contribution amount must be greater than 0');
      }

      // Get current user to set as admin
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      // Prepare scheme data
      const schemeData = {
        name: name.trim(),
        type,
        contribution_amount: parseFloat(contributionAmount),
        frequency,
        ...(type === 'ajita' && endDate && { end_date: endDate }),
        rules: rules ? JSON.parse(rules) : {},
        admin_id: user.id,
      };

      // Insert the new scheme
      const { data, error: insertError } = await supabase
        .from('schemes')
        .insert([schemeData])
        .select()
        .single();

      if (insertError) throw insertError;

      // Success - redirect to schemes list or dashboard
      router.push('/dashboard/admin/schemes');
    } catch (error: unknown) {
      console.error('Error creating scheme:', error);
      setError(error instanceof Error ? error.message : 'Failed to create scheme');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Scheme</CardTitle>
          <CardDescription>
            Set up a new savings scheme for your members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Scheme Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Main Market Group"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="type">Scheme Type</Label>
                <Select value={type} onValueChange={(value: 'akawo' | 'kwanta' | 'ajita') => setType(value)}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select scheme type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="akawo">Akawo (Daily Contribution)</SelectItem>
                    <SelectItem value="kwanta">Kwanta (Rotating/ROSCA)</SelectItem>
                    <SelectItem value="ajita">Ajita (Target Savings)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="amount">Contribution Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="e.g., 1000"
                  required
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="frequency">Contribution Frequency</Label>
                <Select value={frequency} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setFrequency(value)}>
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {type === 'ajita' && (
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date (for Ajita schemes)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="rules">Additional Rules (JSON)</Label>
                <Input
                  id="rules"
                  placeholder='e.g., {"service_charge_percent": 5}'
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Advanced settings in JSON format (optional)
                </p>
              </div>
              
              {error && <p className="text-sm text-red-500">{error}</p>}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Scheme...' : 'Create Scheme'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}