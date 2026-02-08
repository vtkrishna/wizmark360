import { useState } from "react";
import { useLocation } from "wouter";
import AppShell from "../components/layout/app-shell";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  X,
  Sparkles,
  Instagram,
  Facebook,
  Linkedin,
  Mail,
  Video,
  FileText,
  Megaphone,
  Globe,
  MessageCircle,
  Target,
} from "lucide-react";

type ContentType = "social" | "email" | "video" | "blog" | "ad";
type ViewMode = "month" | "week";

interface CalendarEvent {
  id: string;
  title: string;
  type: ContentType;
  date: string;
  time: string;
  channel: string;
  status: "scheduled" | "draft" | "published";
  description?: string;
}

const typeColors: Record<ContentType, { bg: string; text: string; dot: string }> = {
  social: { bg: "bg-pink-50 dark:bg-pink-900/20", text: "text-pink-700 dark:text-pink-300", dot: "bg-pink-500" },
  email: { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-700 dark:text-green-300", dot: "bg-green-500" },
  video: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-700 dark:text-purple-300", dot: "bg-purple-500" },
  blog: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-500" },
  ad: { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-700 dark:text-orange-300", dot: "bg-orange-500" },
};

const typeLabels: Record<ContentType, string> = {
  social: "Social Post",
  email: "Email Campaign",
  video: "Video",
  blog: "Blog Post",
  ad: "Ad Campaign",
};

const channels = [
  { id: "instagram", name: "Instagram", icon: Instagram },
  { id: "facebook", name: "Facebook", icon: Facebook },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin },
  { id: "email", name: "Email", icon: Mail },
  { id: "youtube", name: "YouTube", icon: Video },
  { id: "blog", name: "Blog", icon: FileText },
  { id: "whatsapp", name: "WhatsApp", icon: MessageCircle },
  { id: "google-ads", name: "Google Ads", icon: Target },
];

function generateSampleEvents(): CalendarEvent[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  return [
    { id: "1", title: "Instagram Reel - Product Launch", type: "social", date: `${year}-${String(month + 1).padStart(2, "0")}-03`, time: "10:00", channel: "instagram", status: "published" },
    { id: "2", title: "Weekly Newsletter #24", type: "email", date: `${year}-${String(month + 1).padStart(2, "0")}-03`, time: "14:00", channel: "email", status: "scheduled" },
    { id: "3", title: "Brand Story Video", type: "video", date: `${year}-${String(month + 1).padStart(2, "0")}-05`, time: "09:00", channel: "youtube", status: "draft" },
    { id: "4", title: "SEO Blog: AI Trends 2026", type: "blog", date: `${year}-${String(month + 1).padStart(2, "0")}-07`, time: "11:00", channel: "blog", status: "scheduled" },
    { id: "5", title: "Facebook Ad - Summer Sale", type: "ad", date: `${year}-${String(month + 1).padStart(2, "0")}-08`, time: "08:00", channel: "facebook", status: "scheduled" },
    { id: "6", title: "LinkedIn Thought Leadership", type: "social", date: `${year}-${String(month + 1).padStart(2, "0")}-10`, time: "12:00", channel: "linkedin", status: "scheduled" },
    { id: "7", title: "Product Demo Video", type: "video", date: `${year}-${String(month + 1).padStart(2, "0")}-12`, time: "15:00", channel: "youtube", status: "draft" },
    { id: "8", title: "Google Ads Campaign Refresh", type: "ad", date: `${year}-${String(month + 1).padStart(2, "0")}-13`, time: "10:00", channel: "google-ads", status: "scheduled" },
    { id: "9", title: "Customer Success Story Blog", type: "blog", date: `${year}-${String(month + 1).padStart(2, "0")}-15`, time: "09:00", channel: "blog", status: "scheduled" },
    { id: "10", title: "Instagram Carousel - Tips", type: "social", date: `${year}-${String(month + 1).padStart(2, "0")}-16`, time: "11:00", channel: "instagram", status: "scheduled" },
    { id: "11", title: "Email Drip Sequence Launch", type: "email", date: `${year}-${String(month + 1).padStart(2, "0")}-17`, time: "08:00", channel: "email", status: "draft" },
    { id: "12", title: "WhatsApp Broadcast - Promo", type: "social", date: `${year}-${String(month + 1).padStart(2, "0")}-19`, time: "10:00", channel: "whatsapp", status: "scheduled" },
    { id: "13", title: "Webinar Recording Edit", type: "video", date: `${year}-${String(month + 1).padStart(2, "0")}-20`, time: "14:00", channel: "youtube", status: "draft" },
    { id: "14", title: "Facebook Retargeting Ad", type: "ad", date: `${year}-${String(month + 1).padStart(2, "0")}-22`, time: "09:00", channel: "facebook", status: "scheduled" },
    { id: "15", title: "Industry Report Blog", type: "blog", date: `${year}-${String(month + 1).padStart(2, "0")}-23`, time: "10:00", channel: "blog", status: "scheduled" },
    { id: "16", title: "LinkedIn Post - Company News", type: "social", date: `${year}-${String(month + 1).padStart(2, "0")}-24`, time: "12:00", channel: "linkedin", status: "scheduled" },
    { id: "17", title: "Monthly Newsletter", type: "email", date: `${year}-${String(month + 1).padStart(2, "0")}-26`, time: "09:00", channel: "email", status: "scheduled" },
    { id: "18", title: "Tutorial Video Series Ep.3", type: "video", date: `${year}-${String(month + 1).padStart(2, "0")}-27`, time: "15:00", channel: "youtube", status: "draft" },
    { id: "19", title: "Instagram Story - BTS", type: "social", date: `${year}-${String(month + 1).padStart(2, "0")}-28`, time: "16:00", channel: "instagram", status: "scheduled" },
  ];
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ContentCalendar() {
  const [, setLocation] = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [events, setEvents] = useState<CalendarEvent[]>(generateSampleEvents());
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalData, setModalData] = useState({
    title: "",
    description: "",
    type: "social" as ContentType,
    channel: "instagram",
    date: "",
    time: "10:00",
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const navigateMonth = (direction: number) => {
    const newDate = new Date(year, month + direction, 1);
    setCurrentDate(newDate);
  };

  const getEventsForDate = (dateStr: string) => {
    return events.filter((e) => e.date === dateStr);
  };

  const openScheduleModal = (date?: string) => {
    const d = date || `${year}-${String(month + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    setSelectedDate(d);
    setModalData({ ...modalData, date: d });
    setShowModal(true);
  };

  const saveEvent = () => {
    if (!modalData.title.trim()) return;
    const newEvent: CalendarEvent = {
      id: String(Date.now()),
      title: modalData.title,
      type: modalData.type,
      date: modalData.date,
      time: modalData.time,
      channel: modalData.channel,
      status: "scheduled",
      description: modalData.description,
    };
    setEvents([...events, newEvent]);
    setShowModal(false);
    setModalData({ title: "", description: "", type: "social", channel: "instagram", date: "", time: "10:00" });
  };

  const upcomingEvents = events
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 8);

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const statusStyles: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    draft: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  };

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white min-w-[200px] text-center">
                  {monthNames[month]} {year}
                </h2>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("month")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === "month"
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setViewMode("week")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === "week"
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                  }`}
                >
                  Week
                </button>
              </div>
            </div>
            <button
              onClick={() => openScheduleModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Schedule Content
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="bg-gray-50 dark:bg-gray-800 px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase"
                >
                  {day}
                </div>
              ))}
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="bg-gray-50/50 dark:bg-gray-800/50 min-h-[120px]"
                    />
                  );
                }
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayEvents = getEventsForDate(dateStr);
                const isToday = dateStr === todayStr;

                return (
                  <div
                    key={dateStr}
                    onClick={() => openScheduleModal(dateStr)}
                    className={`bg-white dark:bg-gray-800 min-h-[120px] p-2 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors ${
                      isToday ? "ring-2 ring-blue-500 ring-inset" : ""
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full ${
                        isToday
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={`px-2 py-1 rounded text-xs font-medium truncate ${typeColors[event.type].bg} ${typeColors[event.type].text}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${typeColors[event.type].dot} flex-shrink-0`} />
                            <span className="truncate">{event.title}</span>
                          </div>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                          +{dayEvents.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden hidden xl:flex">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Upcoming Scheduled
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {upcomingEvents.map((event) => {
              const channelInfo = channels.find((c) => c.id === event.channel);
              const ChannelIcon = channelInfo?.icon || Globe;
              return (
                <div
                  key={event.id}
                  className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${typeColors[event.type].bg} ${typeColors[event.type].text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${typeColors[event.type].dot}`} />
                          {typeLabels[event.type]}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <ChannelIcon className="w-3 h-3" />
                          {channelInfo?.name || event.channel}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[event.status]}`}>
                      {event.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Legend</p>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(typeColors) as ContentType[]).map((type) => (
                  <div key={type} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span className={`w-2.5 h-2.5 rounded-full ${typeColors[type].dot}`} />
                    {typeLabels[type]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule Content</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Content Type
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {(Object.keys(typeColors) as ContentType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setModalData({ ...modalData, type })}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 transition-colors text-xs font-medium ${
                          modalData.type === type
                            ? `${typeColors[type].bg} ${typeColors[type].text} border-current`
                            : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300"
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full ${typeColors[type].dot}`} />
                        {typeLabels[type].split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Channel
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {channels.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => setModalData({ ...modalData, channel: ch.id })}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors text-xs ${
                          modalData.channel === ch.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300"
                        }`}
                      >
                        <ch.icon className="w-4 h-4" />
                        <span className="truncate w-full text-center">{ch.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Date
                    </label>
                    <input
                      type="date"
                      value={modalData.date}
                      onChange={(e) => setModalData({ ...modalData, date: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Time
                    </label>
                    <input
                      type="time"
                      value={modalData.time}
                      onChange={(e) => setModalData({ ...modalData, time: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    value={modalData.title}
                    onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
                    placeholder="Enter content title..."
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={modalData.description}
                    onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                    placeholder="Describe the content..."
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <button
                  onClick={() => {
                    setShowModal(false);
                    setLocation("/marketing-chat");
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  AI Generate Content
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEvent}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
