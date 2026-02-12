'use client';

import { ContributionCard } from './contribution-card';

interface Props {
  transactions: any[];
  contributionAmount: number;
  startDate: string;
  userName: string;
}

export function DebugContributionCard({ transactions, contributionAmount, startDate, userName }: Props) {
  console.log('=== DEBUG CONTRIBUTION CARD ===');
  console.log('User:', userName);
  console.log('Transactions received:', transactions);
  console.log('Start date:', startDate);
  console.log('Contribution amount:', contributionAmount);
  
  // Check if transactions have the right structure
  if (transactions && transactions.length > 0) {
    console.log('First transaction structure:', transactions[0]);
    console.log('Transaction dates:', transactions.map(t => ({ date: t.date, type: t.type, amount: t.amount })));
  }

  return (
    <div>
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-bold text-sm">Debug Info:</h3>
        <p className="text-xs">Transactions: {transactions?.length || 0}</p>
        <p className="text-xs">Start Date: {startDate}</p>
        <p className="text-xs">User: {userName}</p>
        {transactions && transactions.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-semibold">Recent transactions:</p>
            {transactions.slice(0, 3).map((t, i) => (
              <p key={i} className="text-xs">
                {new Date(t.date).toLocaleDateString()} - {t.type} - ₦{t.amount}
              </p>
            ))}
          </div>
        )}
      </div>
      
      <ContributionCard
        transactions={transactions}
        contributionAmount={contributionAmount}
        frequency="daily"
        startDate={startDate}
      />
    </div>
  );
}