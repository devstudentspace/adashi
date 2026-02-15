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
  const [descriptionAndRules, setDescriptionAndRules] = useState('');
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
      
      console.log('Current user ID:', user.id);

      // Prepare scheme data
      const schemeData = {
        name: name.trim(),
        type,
        contribution_amount: parseFloat(contributionAmount) || 0,
        frequency,
        description: descriptionAndRules.trim(),
        ...(type === 'ajita' && endDate && { end_date: endDate }),
        rules: {}, // Keep rules as empty object for future structured data
        admin_id: user.id,
      };

      console.log('Attempting to insert scheme data:', schemeData);
      
      // Additional validation
      if (!schemeData.name) {
        throw new Error('Scheme name is required');
      }
      if (schemeData.contribution_amount <= 0) {
        throw new Error('Contribution amount must be greater than 0');
      }
      if (!schemeData.type) {
        throw new Error('Scheme type is required');
      }
      if (!schemeData.frequency) {
        throw new Error('Frequency is required');
      }
      if (!schemeData.admin_id) {
        throw new Error('Admin ID is required');
      }

      console.log('Final scheme data before insertion:', schemeData);

      const insertResult = await supabase
        .from('schemes')
        .insert([schemeData]);

      console.log('Insert result:', insertResult);

      if (insertResult.error) {
        console.error('Supabase insert error details:', insertResult.error);
        throw insertResult.error;
      }

      // Success - redirect to schemes list or dashboard
      // Reset form fields
      setName('');
      setContributionAmount('');
      setFrequency('daily');
      setEndDate('');
      setDescriptionAndRules('');
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
                <Label htmlFor="descriptionAndRules">Description and Rules</Label>
                <Input
                  id="descriptionAndRules"
                  placeholder="Enter description and rules for this scheme (optional)"
                  value={descriptionAndRules}
                  onChange={(e) => setDescriptionAndRules(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Describe the purpose, guidelines, and any special rules for this savings scheme
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