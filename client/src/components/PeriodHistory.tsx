import { usePeriodHistory } from "@/hooks/use-goals";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PeriodHistoryProps {
  goalId: number;
  unit?: string;
}

export function PeriodHistory({ goalId, unit }: PeriodHistoryProps) {
  const { data: history, isLoading } = usePeriodHistory(goalId);

  if (isLoading) {
    return (
      <div className="py-4 text-center text-muted-foreground text-sm">
        Laden...
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground text-sm">
        Nog geen periode geschiedenis
      </div>
    );
  }

  const periodLabel = (type: string) => {
    switch (type) {
      case "weekly": return "Week";
      case "monthly": return "Maand";
      default: return "Periode";
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        Vorige periodes
      </h4>
      <div className="space-y-2">
        {history.slice(0, 10).map((period, index) => {
          const percentage = period.targetValue 
            ? Math.round((period.finalValue / period.targetValue) * 100) 
            : null;
          const previousPeriod = history[index + 1];
          const trend = previousPeriod 
            ? period.finalValue - previousPeriod.finalValue 
            : 0;

          return (
            <Card key={period.id} className="bg-secondary/30">
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {periodLabel(period.periodType)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(period.periodStart), "d MMM", { locale: nl })} - {format(new Date(period.periodEnd), "d MMM yyyy", { locale: nl })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {period.finalValue}
                      {period.targetValue && <span className="text-muted-foreground font-normal">/{period.targetValue}</span>}
                      {unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
                    </span>
                    {percentage !== null && (
                      <Badge 
                        variant={percentage >= 100 ? "default" : "secondary"}
                        className={percentage >= 100 ? "bg-emerald-500" : ""}
                      >
                        {percentage}%
                      </Badge>
                    )}
                    {trend !== 0 && (
                      trend > 0 
                        ? <TrendingUp className="w-4 h-4 text-emerald-500" />
                        : <TrendingDown className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
