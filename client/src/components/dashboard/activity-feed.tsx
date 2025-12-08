import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  MessageSquare,
  FileText,
  Target,
  Megaphone,
  Zap
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: "success" | "warning" | "info" | "task";
  title: string;
  description: string;
  time: string;
  icon?: any;
}

const activities: ActivityItem[] = [
  {
    id: "1",
    type: "success",
    title: "Campaign Published",
    description: "Diwali Social Campaign is now live across Instagram and Facebook",
    time: "2 min ago",
    icon: Megaphone
  },
  {
    id: "2",
    type: "info",
    title: "Lead Scored",
    description: "AI scored 12 new leads from LinkedIn campaign",
    time: "15 min ago",
    icon: Target
  },
  {
    id: "3",
    type: "task",
    title: "Content Approved",
    description: "WhatsApp template approved and ready for deployment",
    time: "1 hour ago",
    icon: FileText
  },
  {
    id: "4",
    type: "warning",
    title: "Budget Alert",
    description: "Meta Ads spend reaching 85% of monthly limit",
    time: "2 hours ago",
    icon: AlertCircle
  },
  {
    id: "5",
    type: "success",
    title: "AI Agent Complete",
    description: "SEO Content Agent finished optimizing 15 blog posts",
    time: "3 hours ago",
    icon: Zap
  }
];

const typeStyles = {
  success: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20",
  warning: "bg-amber-50 text-amber-600 dark:bg-amber-900/20",
  info: "bg-blue-50 text-blue-600 dark:bg-blue-900/20",
  task: "bg-purple-50 text-purple-600 dark:bg-purple-900/20"
};

export default function ActivityFeed() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</button>
      </div>
      
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {activities.map((activity) => (
          <div key={activity.id} className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
            <div className="flex gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${typeStyles[activity.type]}`}>
                {activity.icon ? <activity.icon className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{activity.description}</p>
              </div>
              
              <span className="text-xs text-gray-400 flex-shrink-0">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
