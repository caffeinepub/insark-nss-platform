import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  "data-ocid"?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  color = "text-primary",
  "data-ocid": dataOcid,
}: StatCardProps) {
  return (
    <Card className="border-border" data-ocid={dataOcid}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className={cn("p-3 rounded-xl bg-accent", color)}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
