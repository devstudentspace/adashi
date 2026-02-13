'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  format, 
  isSameDay, 
  isAfter, 
  startOfToday,
  getDaysInMonth,
  isBefore,
  startOfDay,
  startOfMonth,
  addMonths
} from "date-fns";
import { CalendarDays, Maximize2, ChevronRight, Settings2, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface Transaction {
  amount: number;
  date: string;
  type: string;
}

interface ContributionCardProps {
  transactions: Transaction[];
  contributionAmount: number;
  frequency: string;
  startDate: string;
  onCellClick?: (date: Date) => Promise<void>;
  isLoading?: boolean;
}

export function ContributionCard({ 
  transactions, 
  contributionAmount, 
  frequency, 
  startDate,
  onCellClick,
  isLoading = false
}: ContributionCardProps) {
  const [mounted, setMounted] = useState(false);
  const [monthsToShow, setMonthsToShow] = useState(3);
  const [gridSize, setGridSize] = useState(32); 
  const [processingDate, setProcessingDate] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const today = startOfToday();
  const startDateTime = startOfDay(new Date(startDate));
  const startMonth = startOfMonth(startDateTime);
  
  const months = Array.from({ length: monthsToShow }, (_, i) => {
    return addMonths(startMonth, i);
  });

  const getStatus = (date: Date) => {
    const isFuture = isAfter(date, today);
    const isPast = isBefore(date, startDateTime) && !isSameDay(date, startDateTime);
    
    // Get contributions for this specific day - ONLY if they are on or after startDateTime
    const dayContributions = transactions.filter(t => {
      const transactionDate = startOfDay(new Date(t.date));
      const cellDate = startOfDay(date);
      return t.type === 'deposit' && 
             isSameDay(transactionDate, cellDate) && 
             (isAfter(transactionDate, startDateTime) || isSameDay(transactionDate, startDateTime));
    });
    
    const hasContribution = dayContributions.length > 0;
    const contributionCount = dayContributions.length;

    // Check if this day should be colored due to excess contributions from previous days
    let shouldColorFromPrevious = false;
    if (!hasContribution && !isFuture && !isPast) {
      // Look for previous days with multiple contributions
      const currentDate = startOfDay(date);
      let excessContributions = 0;
      
      // Go through all previous days from start date to current date
      let checkDate = startOfToday().getTime() > startDateTime.getTime() 
        ? startDateTime 
        : startOfDay(new Date(startDate));
      
      while (isBefore(checkDate, currentDate)) {
        const dayContribs = transactions.filter(t => {
          const transactionDate = startOfDay(new Date(t.date));
          return t.type === 'deposit' && 
                 isSameDay(transactionDate, checkDate) &&
                 (isAfter(transactionDate, startDateTime) || isSameDay(transactionDate, startDateTime));
        });
        
        if (dayContribs.length > 1) {
          excessContributions += (dayContribs.length - 1);
        } else if (dayContribs.length === 0 && excessContributions > 0) {
          // This day was missed, so excess contributions should cover it
          excessContributions -= 1;
        }
        
        checkDate = new Date(checkDate.getTime() + 24 * 60 * 60 * 1000); // Add 1 day
      }
      
      shouldColorFromPrevious = excessContributions > 0;
    }

    if (isPast) return 'inactive';
    if (hasContribution) return 'paid';
    if (shouldColorFromPrevious) return 'covered';
    if (isFuture) return 'future';
    return 'missed';
  };

  const handleCellClick = async (date: Date, status: string) => {
    if (!onCellClick || status === 'paid' || status === 'inactive') return;
    
    setProcessingDate(date.toISOString());
    try {
      await onCellClick(date);
    } finally {
      setProcessingDate(null);
    }
  };

  return (
    <Card className="w-full overflow-hidden border-x-0 sm:border-x border-y border-primary/20 shadow-xl bg-card rounded-none sm:rounded-xl relative">
      {isLoading && (
        <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] z-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <CardHeader className="border-b bg-muted/30 py-4 px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
             <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <CalendarDays className="h-5 w-5 text-primary" />
             </div>
             <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg font-black tracking-tight text-foreground truncate">
                  DIGITAL PASSBOOK
                </CardTitle>
                <CardDescription className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                  {format(startDateTime, 'MMM d, yyyy')} <ChevronRight className="h-2 w-2" /> {monthsToShow}M
                </CardDescription>
             </div>
          </div>

          <div className="flex items-center gap-2">
            {mounted && (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9 sm:hidden">
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-4" align="end">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase text-muted-foreground">Months to view</span>
                        <Select value={monthsToShow.toString()} onValueChange={(v) => setMonthsToShow(parseInt(v))}>
                          <SelectTrigger className="h-9 w-full text-xs font-black">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 3, 6, 12].map(n => (
                              <SelectItem key={n} value={n.toString()}>{n} Months</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase text-muted-foreground">Grid Zoom</span>
                        <Slider value={[gridSize]} min={28} max={48} step={4} onValueChange={([v]) => setGridSize(v)} />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="hidden sm:flex items-center gap-3 bg-background/50 p-1.5 rounded-lg border border-primary/10 shadow-sm">
                  <div className="flex items-center gap-1.5 border-r pr-3">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Period</span>
                      <Select value={monthsToShow.toString()} onValueChange={(v) => setMonthsToShow(parseInt(v))}>
                        <SelectTrigger className="h-7 w-16 text-[10px] font-black border-none bg-transparent focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 3, 6, 12].map(n => (
                            <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </div>
                  <div className="flex items-center gap-2 pl-1 pr-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Zoom</span>
                      <Slider value={[gridSize]} min={28} max={48} step={4} onValueChange={([v]) => setGridSize(v)} className="w-16" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative overflow-x-auto scrollbar-hide bg-slate-50/30 touch-pan-x">
          <div className="p-4 sm:p-6 min-w-max">
            <div className="flex items-center mb-3">
               <div className="w-16 sm:w-20 shrink-0 font-black text-[9px] text-primary/40 uppercase tracking-wider border-r border-primary/10 mr-3 text-right pr-2">
                 DAY
               </div>
               <div className="flex gap-1">
                  {Array.from({ length: 31 }, (_, i) => (
                    <div 
                      key={i} 
                      style={{ width: gridSize }}
                      className="shrink-0 flex items-center justify-center text-[9px] font-black text-muted-foreground/60"
                    >
                      {(i + 1).toString().padStart(2, '0')}
                    </div>
                  ))}
               </div>
            </div>

            <div className="flex flex-col gap-1.5">
               {months.map((month, mIdx) => {
                  const daysInMonth = getDaysInMonth(month);
                  const monthPaidCount = transactions.filter(t => {
                    const transactionDate = startOfDay(new Date(t.date));
                    return t.type === 'deposit' && 
                    new Date(t.date).getMonth() === month.getMonth() && 
                    new Date(t.date).getFullYear() === month.getFullYear() &&
                    (isAfter(transactionDate, startDateTime) || isSameDay(transactionDate, startDateTime));
                  }).length;

                  return (
                    <div key={mIdx} className="flex items-center group/row">
                       <div className="w-16 sm:w-20 shrink-0 flex flex-col pr-3 border-r border-primary/10 group-hover/row:border-primary/40 transition-colors text-right">
                          <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight text-foreground leading-none mb-0.5">
                             {format(month, 'MMM')}
                          </span>
                          <span className="text-[8px] font-bold text-primary/70">
                             {monthPaidCount}/{daysInMonth}
                          </span>
                       </div>

                       <div className="flex gap-1 pl-3">
                          {Array.from({ length: 31 }, (_, dIdx) => {
                            const dayNumber = dIdx + 1;
                            if (dayNumber > daysInMonth) {
                              return <div key={dIdx} style={{ width: gridSize, height: gridSize }} className="bg-muted/5 rounded shrink-0 opacity-5" />;
                            }
                            
                            const date = new Date(month.getFullYear(), month.getMonth(), dayNumber);
                            const status = getStatus(date);
                            const isProcessing = processingDate === date.toISOString();
                            
                            // Count contributions for this specific day
                            const dayContributions = transactions.filter(t => 
                              t.type === 'deposit' && isSameDay(startOfDay(new Date(t.date)), date)
                            );
                            const contributionCount = dayContributions.length;
                            
                            return (
                              <div 
                                key={dIdx}
                                onClick={() => handleCellClick(date, status)}
                                style={{ width: gridSize, height: gridSize }}
                                className={cn(
                                  "rounded-md border flex items-center justify-center text-[10px] font-bold transition-all duration-200 relative shrink-0",
                                  onCellClick && status !== 'inactive' && status !== 'paid' && status !== 'covered' && "cursor-pointer hover:border-primary hover:shadow-md hover:scale-105 hover:bg-primary/5",
                                  status === 'paid' && contributionCount === 1 && "bg-emerald-500 border-emerald-600 text-white shadow-sm scale-105 z-10",
                                  status === 'paid' && contributionCount > 1 && "bg-emerald-600 border-emerald-700 text-white shadow-md scale-110 z-20 ring-2 ring-emerald-300",
                                  status === 'covered' && "bg-emerald-400 border-emerald-500 text-white shadow-sm scale-105 z-10",
                                  status === 'missed' && "bg-rose-50 border-rose-200 text-rose-500",
                                  status === 'future' && "bg-white border-slate-200 text-slate-300",
                                  status === 'inactive' && "bg-muted/5 border-transparent text-transparent",
                                  isProcessing && "animate-pulse border-primary",
                                  onCellClick && status === 'missed' && "hover:bg-rose-100 hover:border-rose-300",
                                  onCellClick && status === 'future' && "hover:bg-blue-50 hover:border-blue-200"
                                )}
                                title={
                                  contributionCount > 0 
                                    ? `${contributionCount} contribution${contributionCount > 1 ? 's' : ''} on ${format(date, 'MMM d, yyyy')}` 
                                    : status === 'covered' 
                                      ? `Covered by excess contributions from ${format(date, 'MMM d, yyyy')}`
                                      : undefined
                                }
                              >
                                {isProcessing ? (
                                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                ) : status === 'paid' ? (
                                  contributionCount > 1 ? (
                                    <span className="text-[8px] font-black">{contributionCount}</span>
                                  ) : (
                                    '✓'
                                  )
                                ) : status === 'covered' ? (
                                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                ) : (
                                  dayNumber
                                )}
                                {/* Multiple contribution indicator */}
                                {contributionCount > 1 && (
                                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full border border-white"></div>
                                )}
                              </div>
                            );
                          })}
                       </div>
                    </div>
                  );
               })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 bg-muted/20 border-t border-primary/10 divide-x divide-primary/10">
          <div className="py-2.5 px-4 flex flex-col">
            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Saved</span>
            <span className="text-xs font-black text-foreground">
              ₦{transactions.filter(t => {
                const transactionDate = startOfDay(new Date(t.date));
                return t.type === 'deposit' && (isAfter(transactionDate, startDateTime) || isSameDay(transactionDate, startDateTime));
              }).reduce((acc, t) => acc + Number(t.amount), 0).toLocaleString()}
            </span>
          </div>
          <div className="py-2.5 px-4 flex flex-col">
            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Contributions</span>
            <span className="text-xs font-black text-foreground">
              {transactions.filter(t => {
                const transactionDate = startOfDay(new Date(t.date));
                return t.type === 'deposit' && (isAfter(transactionDate, startDateTime) || isSameDay(transactionDate, startDateTime));
              }).length} times
            </span>
          </div>
          <div className="py-2.5 px-4 flex flex-col">
            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Consistency</span>
            <div className="flex items-center gap-1.5">
               <span className="text-[10px] font-black text-emerald-700">
                 {Math.round((transactions.filter(t => {
                    const transactionDate = startOfDay(new Date(t.date));
                    return t.type === 'deposit' && (isAfter(transactionDate, startDateTime) || isSameDay(transactionDate, startDateTime));
                 }).length / (monthsToShow * 30)) * 100)}%
               </span>
               <div className="h-1 w-8 bg-emerald-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500" 
                    style={{ width: `${Math.min(100, Math.round((transactions.filter(t => {
                        const transactionDate = startOfDay(new Date(t.date));
                        return t.type === 'deposit' && (isAfter(transactionDate, startDateTime) || isSameDay(transactionDate, startDateTime));
                    }).length / (monthsToShow * 30)) * 100))}%` }} 
                  />
               </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="px-4 py-3 bg-muted/10 border-t border-primary/5">
          <div className="flex items-center justify-center gap-3 text-[10px] font-bold flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-emerald-500 rounded border border-emerald-600"></div>
              <span className="text-muted-foreground">Paid</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-emerald-600 rounded border border-emerald-700 relative">
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-yellow-400 rounded-full border border-white"></div>
              </div>
              <span className="text-muted-foreground">Multiple</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-emerald-400 rounded border border-emerald-500"></div>
              <span className="text-muted-foreground">Covered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-rose-50 rounded border border-rose-200"></div>
              <span className="text-muted-foreground">Missed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-white rounded border border-slate-200"></div>
              <span className="text-muted-foreground">Future</span>
            </div>
          </div>
          {onCellClick && (
            <div className="text-center mt-2 text-[9px] text-muted-foreground">
              💡 Click on any day to record a contribution
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
