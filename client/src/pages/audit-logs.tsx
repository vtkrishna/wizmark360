import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppShell from "../components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  Filter,
  Calendar,
  User,
  Globe,
  Activity,
} from "lucide-react";

interface AuditLog {
  id: number;
  timestamp: string;
  action: string;
  userId?: number;
  userName?: string;
  userEmail?: string;
  details?: string;
  ipAddress?: string;
  resource?: string;
  status?: string;
}

interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const actionColors: Record<string, string> = {
  create: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  update: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  delete: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  login: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  logout: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  invite: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  export: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  settings: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

const actionTypes = [
  { value: "all", label: "All Actions" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
  { value: "invite", label: "Invite" },
  { value: "export", label: "Export" },
  { value: "settings", label: "Settings" },
];

export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const buildUrl = () => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (actionFilter !== "all") params.set("action", actionFilter);
    if (dateFrom) params.set("startDate", dateFrom);
    if (dateTo) params.set("endDate", dateTo);
    return `/api/audit-logs?${params.toString()}`;
  };

  const { data, isLoading, error } = useQuery<AuditLogsResponse>({
    queryKey: ["/api/audit-logs", page, limit, actionFilter, dateFrom, dateTo, searchQuery],
    queryFn: async () => {
      const res = await fetch(buildUrl());
      if (!res.ok) {
        if (res.status === 404) return { logs: [], total: 0, page: 1, limit: 50, totalPages: 0 };
        throw new Error("Failed to fetch audit logs");
      }
      return res.json();
    },
  });

  const logs = data?.logs || [];
  const total = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || Math.ceil(total / limit) || 1;

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getActionColor = (action: string) => {
    const key = action.toLowerCase().split(".")[0];
    return actionColors[key] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  };

  const clearFilters = () => {
    setActionFilter("all");
    setDateFrom("");
    setDateTo("");
    setSearchQuery("");
    setPage(1);
  };

  const hasFilters = actionFilter !== "all" || dateFrom || dateTo || searchQuery;

  return (
    <AppShell currentBrand={{ id: 1, name: "Admin" }}>
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                Audit Logs
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Track all actions and changes across your organization
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                <Activity className="w-3 h-3 mr-1" />
                {total} total events
              </Badge>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by user, action, or details..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="w-44">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Action Type</label>
                  <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {actionTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-44">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Date</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                  />
                </div>

                <div className="w-44">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Date</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                  />
                </div>

                {hasFilters && (
                  <Button variant="outline" onClick={clearFilters} className="mb-0.5">
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-16">
                  <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No audit logs found</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    {hasFilters ? "Try adjusting your filters" : "Audit events will appear here as actions are performed"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Timestamp
                          </div>
                        </TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            User
                          </div>
                        </TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5" />
                            IP Address
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm text-gray-600 dark:text-gray-400 font-mono whitespace-nowrap">
                            {formatTimestamp(log.timestamp)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getActionColor(log.action)}>
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                {(log.userName || log.userEmail || "?").charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm text-gray-900 dark:text-white">
                                {log.userName || log.userEmail || "System"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500 dark:text-gray-400 max-w-[300px] truncate">
                            {log.details || "—"}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                            {log.ipAddress || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
