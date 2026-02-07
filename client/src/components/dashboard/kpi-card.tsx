import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  color?: "blue" | "green" | "purple" | "orange" | "pink";
}

const colorClasses = {
  blue: "from-blue-500 to-blue-600",
  green: "from-emerald-500 to-emerald-600",
  purple: "from-purple-500 to-purple-600",
  orange: "from-orange-500 to-orange-600",
  pink: "from-pink-500 to-pink-600",
};

export default function KPICard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon, 
  trend = "neutral",
  color = "blue" 
}: KPICardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend === "up" ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              ) : trend === "down" ? (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              ) : null}
              <span className={`text-sm font-medium ${
                trend === "up" ? "text-emerald-500" : 
                trend === "down" ? "text-red-500" : "text-gray-500"
              }`}>
                {change > 0 ? "+" : ""}{change}%
              </span>
              {changeLabel && (
                <span className="text-sm text-gray-400">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
