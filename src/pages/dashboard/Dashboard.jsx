import { useState, useEffect, useRef } from "react";
import { Area, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, UserPlus, Clock, CheckCircle2, ChevronRight, ChevronDown, Filter, Calendar, TrendingUp, X, Bell, Info, Inbox, Activity } from "lucide-react";

// Simple stat card component
function StatCard({ title, value, trend, trendUp, icon, description }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:-translate-y-1 hover:shadow-md transition-all relative">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-primary/5 text-primary rounded-xl">
          {icon}
        </div>
        {trend && (
          <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${trendUp ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-textMuted text-[13px] font-semibold tracking-wider">{title}</h3>
      <p className="text-2xl sm:text-3xl font-bold text-primary mt-1.5">{value}</p>
      
      {description && (
        <div className="absolute bottom-4 right-4 group/info">
          <Info size={14} className="text-slate-300 hover:text-primary cursor-help" />
          <div className="absolute bottom-full right-0 mb-2 w-48 p-2.5 bg-[#18254D] text-white text-[12px] rounded-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all">
            {description}
          </div>
        </div>
      )}
    </div>
  );
}

function Dashboard({ followUps, clients, leads = [], enquiries, aiModels = [], onSelectFollowUp, onNavigate, onClearNotifications, loading = false }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedYear, setSelectedYear] = useState(() => {
    // Default to current year, but if there's no data, try to find the latest year with data
    const currentYear = new Date().getFullYear().toString();
    const allYears = [
      ...clients.map(c => c.joinedDate ? new Date(c.joinedDate).getFullYear() : null),
      ...enquiries.map(e => e.date ? new Date(e.date).getFullYear() : null),
      ...leads.map(l => l.joinedDate ? new Date(l.joinedDate).getFullYear() : null)
    ].filter(Boolean);
    
    if (allYears.length > 0) {
      const latestYear = Math.max(...allYears).toString();
      return latestYear;
    }
    return currentYear;
  });
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [showViewAllModal, setShowViewAllModal] = useState(false);
  const [viewAllTab, setViewAllTab] = useState("Today");
  const [activeTaskTab, setActiveTaskTab] = useState("Today");
  const [currentUser, setCurrentUser] = useState(null);
  const dropdownRef = useRef(null);

  // Load user from localStorage and sync year with data
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) setCurrentUser(user);

    // Sync selectedYear with latest data available
    const dataYears = [
      ...clients.map(c => c.joinedDate ? new Date(c.joinedDate).getFullYear() : null),
      ...enquiries.map(e => e.date ? new Date(e.date).getFullYear() : null),
      ...leads.map(l => l.joinedDate ? new Date(l.joinedDate).getFullYear() : null)
    ].filter(Boolean);
    
    if (dataYears.length > 0) {
      const latestYear = Math.max(...dataYears).toString();
      setSelectedYear(latestYear);
    }
  }, [clients.length, enquiries.length, leads.length]);

  // Helper functions
  function isToday(date) {
    const d = new Date(date);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }

  function isMissed(date) {
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  }

  // Calculate stats
  const newEnquiries = enquiries.filter((e) => e.status === "new");
  const todayTasks = followUps.filter((f) => isToday(f.dueDate) && f.status === "pending");
  const missedTasks = followUps.filter((f) => isMissed(f.dueDate) && f.status === "pending");
  const totalNotifications = newEnquiries.length;
  const newEnquiriesCount = newEnquiries.length;
  
  const leadCount = leads.filter((l) => l.status === "Lead").length;
  const clientCount = clients.filter((c) => c.status === "Active").length;
  const totalPool = leadCount + clientCount;
  const engagementRate = totalPool > 0 ? Math.round((clientCount / totalPool) * 100) : 0;

  // Chart data
  function getChartData() {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const yearNum = parseInt(selectedYear);
    const activeClients = clients.filter(c => c.status === "Active");
    
    if (selectedMonth === "All") {
      return months.map((month, index) => {
        const monthlyEnquiries = enquiries.filter(e => {
          const d = new Date(e.date);
          return d.getFullYear() === yearNum && d.getMonth() === index;
        }).length;
        
        const monthlyClients = activeClients.filter(c => {
          const d = new Date(c.joinedDate);
          return d.getFullYear() === yearNum && d.getMonth() === index;
        }).length;

        const monthlyLeads = leads.filter(l => {
          const d = new Date(l.joinedDate);
          return l.status === "Lead" && d.getFullYear() === yearNum && d.getMonth() === index;
        }).length;

        // Engagement rate: (Clients / (Enquiries + Leads)) * 100
        const totalPotential = monthlyEnquiries + monthlyLeads;
        const engagement = totalPotential > 0 ? Math.round((monthlyClients / totalPotential) * 100) : 0;

        return {
          name: month,
          enquiries: monthlyEnquiries,
          clients: monthlyClients,
          leads: monthlyLeads,
          engagement: engagement
        };
      });
    }
    
    // Weekly for specific month
    const monthIndex = months.indexOf(selectedMonth);
    return [1, 2, 3, 4].map(week => {
      const startDay = (week - 1) * 7 + 1;
      const endDay = week * 7;
      
      const weeklyEnquiries = enquiries.filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === yearNum && d.getMonth() === monthIndex && d.getDate() >= startDay && d.getDate() <= endDay;
      }).length;
      
      const weeklyClients = activeClients.filter(c => {
        const d = new Date(c.joinedDate);
        return d.getFullYear() === yearNum && d.getMonth() === monthIndex && d.getDate() >= startDay && d.getDate() <= endDay;
      }).length;

      const weeklyLeads = leads.filter(l => {
        const d = new Date(l.joinedDate);
        return l.status === "Lead" && d.getFullYear() === yearNum && d.getMonth() === monthIndex && d.getDate() >= startDay && d.getDate() <= endDay;
      }).length;

      const totalPotential = weeklyEnquiries + weeklyLeads;
      const engagement = totalPotential > 0 ? Math.round((weeklyClients / totalPotential) * 100) : 0;

      return {
        name: `Week ${week}`,
        enquiries: weeklyEnquiries,
        clients: weeklyClients,
        leads: weeklyLeads,
        engagement: engagement
      };
    });
  }

  const chartData = getChartData();

  // Dynamic years for dropdown
  const availableYears = (() => {
    const currentYear = new Date().getFullYear();
    const dataYears = [
      ...clients.map(c => c.joinedDate ? new Date(c.joinedDate).getFullYear() : null),
      ...enquiries.map(e => e.date ? new Date(e.date).getFullYear() : null),
      ...leads.map(l => l.joinedDate ? new Date(l.joinedDate).getFullYear() : null)
    ].filter(Boolean);
    
    const yearSet = new Set([currentYear, ...dataYears]);
    return Array.from(yearSet).sort((a, b) => b - a).map(String);
  })();

  // Show loading state
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <div className="space-y-6 md:space-y-8 animate-fade-in relative z-0">
        <div className="flex flex-row flex-wrap justify-between items-center gap-6">
          <div className="max-w-2xl shrink-0">
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-[#18254D] tracking-tight mb-1.5">
              Welcome back, {currentUser?.full_name?.split(' ')[0] || 'Admin'}
            </h2>
            <p className="text-xs md:text-sm text-textMuted font-medium leading-relaxed">
              Let's build something remarkable today.
            </p>
          </div>

          <div className="flex items-center bg-white p-1 rounded-full border border-slate-200 shadow-sm w-auto relative z-20">
            <div
              className="relative flex-1 lg:flex-initial lg:w-10 shrink-0"
              ref={dropdownRef}
            >
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`h-11 md:h-12 w-full rounded-full transition-all relative flex items-center justify-center shrink-0 ${
                  showNotifications
                    ? "bg-primary text-white"
                    : "bg-transparent text-primary hover:bg-slate-50"
                }`}
              >
                <div className="relative">
                  <Bell size={18} strokeWidth={2.5} />
                  {totalNotifications > 0 && !showNotifications && (
                    <span className="bg-[#18254D] text-white text-[12px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg absolute -top-1.5 -right-1.5 border border-white">
                      {totalNotifications}
                    </span>
                  )}
                </div>
              </button>
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-[90] bg-black/10 backdrop-blur-sm"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="fixed lg:absolute left-1/2 md:left-auto lg:right-0 -translate-x-1/2 lg:translate-x-0 mt-3 w-[280px] bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 overflow-hidden animate-pop z-[100] top-24 lg:top-auto">
                    <div className="p-4 pb-2 border-b border-black/5 bg-black/5">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-[12px] font-bold text-primary  tracking-widest capitalize">
                          New Enquiries
                        </h3>
                        <div className="flex items-center gap-2">
                          {newEnquiries.length > 0 && (
                            <button
                              onClick={onClearNotifications}
                              className="text-[14px] font-bold text-primary hover:text-white hover:bg-primary px-2.5 py-1.5 rounded-lg border border-primary/10 hover:border-primary tracking-widest transition-all active:scale-95 whitespace-nowrap shadow-sm"
                            >
                              Clear All
                            </button>
                          )}
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="p-1 hover:bg-slate-200 rounded-lg text-slate-400"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto p-2.5 no-scrollbar space-y-1.5">
                      {newEnquiries.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-[12px] text-slate-400 font-bold  tracking-widest">
                            No new enquiries
                          </p>
                        </div>
                      ) : (
                        newEnquiries.map((e) => (
                          <div
                            key={e.id}
                            onClick={() => onNavigate("enquiries")}
                            className="p-2.5 bg-white border border-slate-100 rounded-xl cursor-pointer hover:border-secondary transition-all"
                          >
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="text-[7.5px] font-bold text-secondary  tracking-widest">
                                New Enquiry
                              </span>
                              <span className="text-[7.5px] text-slate-400 font-bold">
                                {new Date(e.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[13px] font-bold text-primary truncate">
                              {e.name}
                            </p>
                            <p className="text-[14px] text-slate-400 truncate mt-0.5">
                              {e.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="w-[1px] h-6 bg-slate-100 mx-1" />
            <div className="flex-1 lg:flex-initial flex items-center justify-center sm:justify-end gap-2 px-2 min-w-max">
              <div className="text-right flex flex-col items-end">
                <p className="text-xs font-bold text-primary leading-none">
                  {currentUser?.full_name?.split(' ')[0] || 'Admin'}
                </p>
                <p className="text-[14px] font-bold text-secondary  tracking-widest mt-0.5">
                  {currentUser?.role || 'Admin'}
                </p>
              </div>
              {currentUser?.image ? (
                <img
                  src={currentUser.image}
                  alt="Profile"
                  className="w-8 h-8 md:w-9 md:h-9 rounded-lg object-cover border border-slate-100 shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-primary flex items-center justify-center border border-slate-100 shadow-sm">
                  <span className="text-sm font-bold text-white">
                    {currentUser?.full_name?.charAt(0).toUpperCase() || "A"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <StatCard
            title="New Enquiries"
            value={newEnquiriesCount.toString()}
            trend="+4 today"
            trendUp={true}
            icon={<Inbox />}
            description="Total number of new enquiry messages received from the landing page."
          />
          <StatCard
            title="Total Leads"
            value={leadCount.toString()}
            trend="Steady"
            trendUp={true}
            icon={<UserPlus />}
            description="Total count of potential customers currently in the 'Lead' status."
          />
          <StatCard
            title="Lead → Client Conversion"
            value={clientCount.toString()}
            trend="Retained"
            trendUp={true}
            icon={<CheckCircle2 />}
            description="Number of leads who have been successfully onboarded as active clients."
          />
          <StatCard
            title="Engagement Rate"
            value={`${engagementRate}%`}
            trend="High"
            trendUp={true}
            icon={<Activity />}
            description="Percentage of total prospects that have been converted into active clients."
          />
        </div>

        <div className="flex flex-col gap-4 md:gap-5">
          <div className="flex flex-wrap gap-4 md:gap-5">
            <div className="flex-1 min-w-[340px] xl:max-w-[calc(30%-10px)] bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[500px]">
            <div className="flex flex-row justify-between items-center gap-2 mb-6 flex-nowrap">
              <div className="flex items-center gap-1 p-0.5 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
                <button
                  onClick={() => setActiveTaskTab("Today")}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wider transition-all whitespace-nowrap ${
                    activeTaskTab === "Today"
                      ? "bg-white text-primary shadow-sm border border-slate-100"
                      : "text-slate-400 hover:text-primary"
                  }`}
                >
                  Today's Task
                </button>
                <button
                  onClick={() => setActiveTaskTab("Pending")}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wider transition-all whitespace-nowrap ${
                    activeTaskTab === "Pending"
                      ? "bg-white text-error shadow-sm border border-slate-100"
                      : "text-slate-400 hover:text-error"
                  }`}
                >
                  Pending Tasks
                </button>
              </div>
              <button
                onClick={() => {
                  setViewAllTab(activeTaskTab === "Today" ? "Today" : "Overdue");
                  setShowViewAllModal(true);
                }}
                className={`text-[11px] font-bold tracking-wider px-2 py-1.5 rounded-lg border transition-all whitespace-nowrap shrink-0 ${
                  activeTaskTab === "Today"
                    ? "text-primary bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-200"
                    : "text-error bg-error/5 border-error/10 hover:bg-error/10 hover:border-error/20"
                }`}
              >
                View All
              </button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-1 no-scrollbar animate-fade-in" key={activeTaskTab}>
              {activeTaskTab === "Today" ? (
                todayTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <CheckCircle2 size={24} className="text-slate-200 mb-3" />
                    <p className="text-[12px] font-bold text-slate-300 tracking-widest">
                      All Caught Up
                    </p>
                  </div>
                ) : (
                  todayTasks.slice(0, 4).map((f) => {
                    const client = clients.find((c) => c.id === f.clientId);
                    return (
                      <div
                        key={f.id}
                        onClick={() =>
                          client && onSelectFollowUp(client, "activity")
                        }
                        className="p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:border-secondary transition-all cursor-pointer shadow-sm group"
                      >
                        <div className="flex justify-between items-start mb-2.5">
                          <div className="flex gap-1.5 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[13px] font-bold tracking-widest ${f.priority === "High" ? "bg-error/10 text-error" : "bg-info/10 text-info"}`}
                            >
                              {f.priority}
                            </span>
                            {client && (
                              <span
                                className={`px-2 py-0.5 rounded-lg text-[13px] font-bold tracking-widest ${
                                  client.status === "Active"
                                    ? "bg-primary/10 text-primary uppercase"
                                    : "bg-secondary/10 text-secondary uppercase"
                                }`}
                              >
                                {client.status === "Lead" ? "New" : "Reference"}
                              </span>
                            )}
                          </div>
                          <span className="text-[14px] text-textMuted font-bold flex items-center gap-1 ">
                            <Clock size={10} />{" "}
                            {new Date(f.dueDate).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {client && (
                            <p className="text-[12px] font-bold text-slate-400 group-hover:text-primary transition-colors">
                              {client.name}
                            </p>
                          )}
                          <h4 className="text-sm font-bold text-primary group-hover:text-secondary truncate">
                            {f.title}
                          </h4>
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                missedTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <CheckCircle2 size={24} className="text-slate-200 mb-3" />
                    <p className="text-[12px] font-bold text-slate-300 tracking-widest">
                      No Missed Tasks
                    </p>
                  </div>
                ) : (
                  missedTasks.slice(0, 4).map((f) => {
                    const client = clients.find((c) => c.id === f.clientId);
                    return (
                      <div
                        key={f.id}
                        onClick={() =>
                          client && onSelectFollowUp(client, "activity")
                        }
                        className="p-4 bg-error/5 border border-error/10 rounded-xl hover:bg-white hover:border-error transition-all cursor-pointer shadow-sm group"
                      >
                        <div className="flex justify-between items-start mb-2.5">
                          <div className="flex gap-1.5 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[13px] font-black tracking-widest bg-white/50 text-error border border-error/10`}
                            >
                              Overdue
                            </span>
                            {client && (
                              <span
                                className={`px-2 py-0.5 rounded-lg text-[13px] font-bold tracking-widest ${
                                  client.status === "Active"
                                    ? "bg-primary text-white uppercase"
                                    : "bg-secondary text-white uppercase"
                                } shadow-sm`}
                              >
                                {client.status === "Lead" ? "New" : "Reference"}
                              </span>
                            )}
                          </div>
                          <span className="text-[13px] text-error/60 font-black flex items-center gap-1 ">
                            <Clock size={10} />{" "}
                            {new Date(f.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {client && (
                            <p className="text-[12px] font-bold text-error/60 group-hover:text-error transition-colors">
                              {client.name}
                            </p>
                          )}
                          <h4 className="text-sm font-bold text-primary group-hover:text-error truncate">
                            {f.title}
                          </h4>
                        </div>
                      </div>
                    );
                  })
                )
              )}
            </div>
          </div>
          <div className="flex-[2] min-w-[500px] bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-primary tracking-tight">
                  Engagement Rate
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-2">
                  {/* Custom Year Dropdown */}
                  <div className="relative" ref={null}>
                    <button
                      onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                      className="flex items-center justify-between gap-3 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-bold tracking-widest text-[#18254D] hover:bg-white hover:border-slate-300 transition-all min-w-[90px] shadow-sm group"
                    >
                      <span>{selectedYear}</span>
                      <ChevronDown
                        size={14}
                        strokeWidth={2.5}
                        className={`transition-transform duration-300 ${isYearDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isYearDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-[80]"
                          onClick={() => setIsYearDropdownOpen(false)}
                        />
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl overflow-hidden z-[90] animate-fade-in-up origin-top no-scrollbar">
                          {availableYears.map((y) => (
                            <button
                              key={y}
                              onClick={() => {
                                setSelectedYear(y);
                                setIsYearDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-[12px] font-bold tracking-wider transition-colors ${
                                selectedYear === y
                                  ? "bg-[#18254D] text-white"
                                  : "text-[#18254D] hover:bg-slate-50"
                              }`}
                            >
                              {y}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Custom Month Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setIsMonthDropdownOpen(!isMonthDropdownOpen)
                      }
                      className="flex items-center justify-between gap-3 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-bold tracking-widest text-[#18254D] hover:bg-white hover:border-slate-300 transition-all min-w-[100px] shadow-sm group"
                    >
                      <span>
                        {selectedMonth === "All" ? "All Months" : selectedMonth}
                      </span>
                      <ChevronDown
                        size={14}
                        strokeWidth={2.5}
                        className={`transition-transform duration-300 ${isMonthDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isMonthDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-[80]"
                          onClick={() => setIsMonthDropdownOpen(false)}
                        />
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl overflow-hidden z-[90] animate-fade-in-up origin-top max-h-60 overflow-y-auto no-scrollbar">
                          {[
                            "All",
                            "Jan",
                            "Feb",
                            "Mar",
                            "Apr",
                            "May",
                            "Jun",
                            "Jul",
                            "Aug",
                            "Sep",
                            "Oct",
                            "Nov",
                            "Dec",
                          ].map((m) => (
                            <button
                              key={m}
                              onClick={() => {
                                setSelectedMonth(m);
                                setIsMonthDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-[12px] font-bold tracking-wider transition-colors ${
                                selectedMonth === m
                                  ? "bg-[#18254D] text-white"
                                  : "text-[#18254D] hover:bg-slate-50"
                              }`}
                            >
                              {m === "All" ? "All Months" : m}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="h-64 md:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#F1F5F9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 9, fontWeight: 800 }}
                  />
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 9, fontWeight: 800 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #E2E8F0",
                      fontSize: "10px",
                    }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="enquiries"
                    stroke="#1F3A5F"
                    fill="#1F3A5F"
                    fillOpacity={0.05}
                    strokeWidth={2.5}
                    name="Enquiries"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="leads"
                    stroke="#F5A623"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 2 }}
                    name="Pending Leads"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="clients"
                    stroke="#2EC4B6"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    name="Active Clients"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

        {/* View All Follow-ups Selection Modal */}
        {showViewAllModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-[#18254D]/40 backdrop-blur-sm animate-fade-in"
              onClick={() => setShowViewAllModal(false)}
            />
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm overflow-hidden animate-pop relative z-10">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-sm font-bold text-[#18254D] tracking-tight">
                  View Follow-ups
                </h3>
                <button
                  onClick={() => setShowViewAllModal(false)}
                  className="p-1.5 hover:bg-slate-200 rounded-xl text-slate-400 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <button
                  onClick={() => {
                    onNavigate("followups-clients", viewAllTab);
                    setShowViewAllModal(false);
                  }}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-[#18254D] hover:text-white transition-all group border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl group-hover:bg-white/10 shadow-sm border border-slate-100">
                      <Users
                        size={18}
                        className="text-primary group-hover:text-white"
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold tracking-tight">
                        Reference Follow-ups
                      </p>
                      <p className="text-[14px] opacity-60 font-medium">
                        Continue with existing clients
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} />
                </button>

                <button
                  onClick={() => {
                    onNavigate("followups-leads", viewAllTab);
                    setShowViewAllModal(false);
                  }}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-secondary hover:text-white transition-all group border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl group-hover:bg-white/10 shadow-sm border border-slate-100">
                      <UserPlus
                        size={18}
                        className="text-secondary group-hover:text-white"
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold tracking-tight">
                        New Follow-ups
                      </p>
                      <p className="text-[14px] opacity-60 font-medium">
                        Connect with potential leads
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="p-3 bg-slate-50/50 text-center">
                <p className="text-[14px] text-slate-400 font-bold uppercase tracking-widest">
                  Parivartan CRM Selection
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
