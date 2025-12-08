import { useState } from "react";
import { useLocation } from "wouter";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  ChevronDown,
  ChevronRight,
  Search,
  Bell,
  Plus,
  Building2,
  Megaphone,
  Globe,
  Target,
  MessageCircle,
  Linkedin,
  TrendingUp,
  Zap,
  Menu,
  X
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
  currentBrand?: { id: number; name: string; logo?: string };
  onBrandSwitch?: () => void;
}

const verticals = [
  { id: "social", name: "Social Media", icon: Megaphone, color: "text-pink-500" },
  { id: "seo", name: "SEO & GEO", icon: Globe, color: "text-green-500" },
  { id: "web", name: "Web Dev", icon: LayoutDashboard, color: "text-blue-500" },
  { id: "sales", name: "Sales SDR", icon: Target, color: "text-orange-500" },
  { id: "whatsapp", name: "WhatsApp", icon: MessageCircle, color: "text-emerald-500" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-sky-500" },
  { id: "performance", name: "Performance", icon: TrendingUp, color: "text-purple-500" },
];

export default function AppShell({ children, currentBrand, onBrandSwitch }: AppShellProps) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [verticalsExpanded, setVerticalsExpanded] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location === path || location.startsWith(path + "/");

  const NavItem = ({ icon: Icon, label, path, badge }: { icon: any; label: string; path: string; badge?: number }) => (
    <button
      onClick={() => setLocation(path)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium
        ${isActive(path) 
          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
          : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
        }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {sidebarOpen && (
        <>
          <span className="flex-1 text-left">{label}</span>
          {badge && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">{badge}</span>
          )}
        </>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 hidden lg:flex`}>
        {/* Logo & Brand */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-gray-900 dark:text-white truncate">WizardsTech</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Agency Platform</p>
              </div>
            )}
          </div>
        </div>

        {/* Brand Selector */}
        {sidebarOpen && (
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={onBrandSwitch}
              className="w-full flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {currentBrand?.name || "Select Brand"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Switch workspace</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavItem icon={LayoutDashboard} label="Dashboard" path="/dashboard" />
          <NavItem icon={MessageSquare} label="AI Assistant" path="/chat" badge={3} />
          
          {/* Verticals Section */}
          <div className="pt-4">
            {sidebarOpen && (
              <button
                onClick={() => setVerticalsExpanded(!verticalsExpanded)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600"
              >
                {verticalsExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Marketing Verticals
              </button>
            )}
            
            {verticalsExpanded && (
              <div className="space-y-0.5 mt-1">
                {verticals.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setLocation(`/vertical/${v.id}`)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm
                      ${isActive(`/vertical/${v.id}`)
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20" 
                        : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                  >
                    <v.icon className={`w-4 h-4 ${v.color}`} />
                    {sidebarOpen && <span>{v.name}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Other sections */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
            <NavItem icon={Users} label="Brands & CRM" path="/brands" />
            <NavItem icon={FileText} label="Content Library" path="/content" />
            <NavItem icon={BarChart3} label="Analytics" path="/analytics" />
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <NavItem icon={Settings} label="Settings" path="/settings" />
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-6 gap-4">
          {/* Search */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search or ask AI... (Ctrl+K)"
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300 rounded">⌘K</kbd>
            </div>
          </div>

          {/* Actions */}
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            New Task
          </button>

          {/* User */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              W
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
