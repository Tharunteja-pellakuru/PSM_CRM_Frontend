import React, { useState } from "react";
import { createPortal } from "react-dom";
import DatePicker from "../../components/ui/DatePicker";
import {
  Clock,
  Bell,
  CheckCircle2,
  Plus,
  MessageSquare,
  Phone,
  Check,
  X,
  ChevronDown,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CATEGORY_MAP, REVERSE_CATEGORY_MAP } from "../../constants/categoryConstants";

const FollowUpList = ({
  followUps,
  clients,
  onToggleStatus,
  onAddFollowUp,
  onEditFollowUp,
  onDeleteFollowUp,
  onNavigate,
  onSelectClient,
  typeFilter = "All",
}) => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [isHourDropdownOpen, setIsHourDropdownOpen] = useState(false);
  const [isMinuteDropdownOpen, setIsMinuteDropdownOpen] = useState(false);
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    clientId: "",
    title: "",
    description: "",
    followup_date: new Date().toISOString().split("T")[0],
    followup_mode: "call",
    followup_status: "pending",
    follow_brief: "",
    priority: "Medium",
    timeHour: "12",
    timeMinute: "00",
    timePeriod: "PM",
    completed_by: "",
    completionDate: new Date().toISOString().split("T")[0],
    completionHour: "12",
    completionMinute: "00",
    completionPeriod: "PM",
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionBrief, setCompletionBrief] = useState("");
  const [completingFollowUpId, setCompletingFollowUpId] = useState(null);
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split("T")[0]);
  const [completionHour, setCompletionHour] = useState((new Date().getHours() % 12 || 12).toString());
  const [completionMinute, setCompletionMinute] = useState(new Date().getMinutes().toString().padStart(2, "0"));
  const [completionPeriod, setCompletionPeriod] = useState(new Date().getHours() >= 12 ? "PM" : "AM");
  const [completedBy, setCompletedBy] = useState(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.full_name || "";
  });
  const [isCompHourOpen, setIsCompHourOpen] = useState(false);
  const [isCompMinOpen, setIsCompMinOpen] = useState(false);
  const [isCompPeriodOpen, setIsCompPeriodOpen] = useState(false);

  const getClientById = (id) => clients.find((c) => c.id == id);
  const isOverdue = (date) =>
    new Date(date) < new Date(new Date().setHours(0, 0, 0, 0));
  const isToday = (date) => {
    const d = new Date(date);
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  // Base filtering (type + category + search) — before status tab filter
  const baseFiltered = followUps.filter((f) => {
    const client = getClientById(f.clientId);
    if (typeFilter !== "All") {
      if (!client) return false;
      if (typeFilter === "Active" && client.status !== "Active") return false;
      if (typeFilter === "Lead" && client.status !== "Lead") return false;
    }

    // Category filter (Tech/Media)
    if (categoryFilter !== "All") {
      if (!client) return false;
      const targetCatId = REVERSE_CATEGORY_MAP[categoryFilter];
      if (client.projectCategory !== targetCatId && client.industry !== categoryFilter)
        return false;
    }

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchesTitle = f.title?.toLowerCase().includes(q);
      const matchesClient = client?.name?.toLowerCase().includes(q);
      const matchesCompany = client?.company?.toLowerCase().includes(q);
      if (!matchesTitle && !matchesClient && !matchesCompany) return false;
    }

    // Date Range Filter
    if (startDate || endDate) {
      const datePart = f.dueDate.split("T")[0];
      if (startDate && datePart < startDate) return false;
      if (endDate && datePart > endDate) return false;
    }

    return true;
  });

  // Tab counts
  const tabCounts = {
    All: typeFilter === "Lead" 
      ? baseFiltered.length 
      : baseFiltered.filter((f) => f.status !== "completed").length,
    Overdue: baseFiltered.filter(
      (f) => isOverdue(f.dueDate) && f.status === "pending",
    ).length,
    Today: baseFiltered.filter(
      (f) => isToday(f.dueDate) && f.status === "pending",
    ).length,
    Upcoming: baseFiltered.filter(
      (f) =>
        !isOverdue(f.dueDate) && !isToday(f.dueDate) && f.status === "pending",
    ).length,
  };

  const filteredFollowUps = baseFiltered
    .filter((f) => {
      if (f.status === "completed" && (activeFilter !== "All" || typeFilter !== "Lead")) return false;
      if (activeFilter === "Overdue")
        return isOverdue(f.dueDate) && f.status === "pending";
      if (activeFilter === "Today")
        return isToday(f.dueDate) && f.status === "pending";
      if (activeFilter === "Upcoming")
        return (
          !isOverdue(f.dueDate) && !isToday(f.dueDate) && f.status === "pending"
        );
      return true;
    })
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert 12h to 24h for backend
    let hour = parseInt(formData.timeHour);
    if (formData.timePeriod === "PM" && hour < 12) hour += 12;
    if (formData.timePeriod === "AM" && hour === 12) hour = 0;
    const time24 = `${hour.toString().padStart(2, "0")}:${formData.timeMinute}`;

    // Combine date and time
    const combinedDateTime = new Date(`${formData.followup_date}T${time24}`).toISOString();
    
    let compHour = parseInt(formData.completionHour || "12");
    if (formData.completionPeriod === "PM" && compHour < 12) compHour += 12;
    if (formData.completionPeriod === "AM" && compHour === 12) compHour = 0;
    const compTime24 = `${compHour.toString().padStart(2, "0")}:${formData.completionMinute || "00"}`;
    const combinedCompletionStr = new Date(`${formData.completionDate || new Date().toISOString().split("T")[0]}T${compTime24}`).toISOString();

    if (formData.id) {
      onEditFollowUp &&
        onEditFollowUp({
          ...formData,
          dueDate: combinedDateTime,
          followup_date: combinedDateTime, // Sending combined for backend
          completed_at: combinedCompletionStr,
        });
    } else {
      onAddFollowUp({
        ...formData,
        dueDate: combinedDateTime,
        followup_date: combinedDateTime, // Sending combined for backend
      });
    }
    setShowAddModal(false);
    setFormData({
      clientId: "",
      title: "",
      description: "",
      followup_date: new Date().toISOString().split("T")[0],
      followup_mode: "call",
      followup_status: "pending",
      follow_brief: "",
      priority: "Medium",
      timeHour: "12",
      timeMinute: "00",
      timePeriod: "PM",
      completed_by: "",
      completionDate: new Date().toISOString().split("T")[0],
      completionHour: "12",
      completionMinute: "00",
      completionPeriod: "PM",
    });
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case "High":
        return "bg-error/10 text-error border-error/20";
      case "Medium":
        return "bg-warning/10 text-warning border-warning/20";
      case "Low":
        return "bg-info/10 text-info border-info/20";
    }
  };

  return (
    <div className="w-full relative">
      <div className="space-y-5 animate-fade-in w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex flex-col items-start max-w-2xl text-left">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary tracking-tight mb-2">
              {typeFilter === "Active"
                ? "Reference Follow-Ups"
                : typeFilter === "Lead"
                  ? "New Follow-Ups"
                  : "Follow-Ups"}
            </h2>
            <p className="text-xs md:text-sm text-textMuted font-medium leading-relaxed max-w-md">
              {typeFilter === "Active"
                ? "Manage communications with your reference clients."
                : typeFilter === "Lead"
                  ? "Track interactions with your new follow-ups."
                  : "Stay on top of your client and lead communications."}
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-2xl hover:bg-slate-800 transition-all text-[11px] font-bold  tracking-wider shadow-lg active:scale-95 group"
            >
              <Plus
                size={16}
                strokeWidth={2.5}
                className="group-hover:rotate-90 transition-transform"
              />
              Add Follow-Up
            </button>
          </div>
        </div>

        {/* Control Bar: Filters */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 w-full">
            {/* 1. Search Bar */}
            <div className="relative w-full">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#18254D]/40"
              />
              <input
                type="text"
                placeholder="Search follow-ups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-[#18254D] focus:outline-none focus:ring-4 focus:ring-[#18254D]/10 focus:border-[#18254D]/20 transition-all placeholder:text-[#18254D]/30"
              />
            </div>

            {/* 2. Category Dropdown */}
            <div className="relative w-full">
              <button
                onClick={() =>
                  setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                }
                className="w-full h-full flex items-center justify-between gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold  tracking-widest text-[#18254D] hover:bg-white hover:border-slate-200 transition-all shadow-sm shadow-slate-200/50 group"
              >
                <span className="truncate">
                  {categoryFilter === "All" ? "All Categories" : categoryFilter}
                </span>
                <ChevronDown
                  size={16}
                  strokeWidth={2.5}
                  className={`transition-transform duration-300 shrink-0 ${isCategoryDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isCategoryDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[80]"
                    onClick={() => setIsCategoryDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[90] animate-fade-in-up origin-top">
                    {["All", "Tech", "Social Media", "Both"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setCategoryFilter(cat);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-[10px] font-bold  tracking-wider transition-colors ${
                          cat === "All"
                            ? "bg-[#18254D] text-white"
                            : categoryFilter === cat
                              ? "bg-slate-100 text-[#18254D]"
                              : "text-[#18254D] hover:bg-slate-50"
                        }`}
                      >
                        {cat === "All" ? "All Categories" : cat}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* 3. From Date */}
            <DatePicker
              label="From"
              value={startDate}
              onChange={setStartDate}
            />

            {/* 4. To Date */}
            <DatePicker label="To" value={endDate} onChange={setEndDate} />
          </div>
        </div>

        <div className="flex justify-center my-4 overflow-x-auto">
          <div className="flex w-full md:inline-flex md:w-auto bg-slate-100/50 p-1 rounded-2xl border border-slate-200 shadow-sm leading-none h-[42px] items-center gap-1 whitespace-nowrap">
            {["All", "Overdue", "Today", "Upcoming"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`flex-1 md:flex-none px-2 md:px-5 h-full rounded-xl text-[9px] md:text-[10px] font-bold  tracking-wider transition-all flex items-center justify-center gap-1 md:gap-1.5 md:min-w-[100px] border border-transparent whitespace-nowrap ${activeFilter === f ? "bg-white text-primary shadow-md border-slate-100" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"}`}
              >
                {f}
                <span
                  className={`text-[8px] md:text-[9px] font-bold min-w-[16px] md:min-w-[18px] h-[16px] md:h-[18px] flex items-center justify-center rounded-full ${activeFilter === f ? "bg-primary text-white" : "bg-slate-200 text-slate-500"}`}
                >
                  {tabCounts[f]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          {filteredFollowUps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm w-full">
              <Bell size={24} className="text-slate-100 mb-3" />
              <p className="text-[11px] font-bold text-primary  tracking-wider">
                No Active Tasks
              </p>
            </div>
          ) : (
            filteredFollowUps.map((f) => {
              const client = getClientById(f.clientId);
              const overdue = isOverdue(f.dueDate) && f.status === "pending";
              return (
                <div
                  key={f.id}
                  className={`group bg-white rounded-xl border transition-all hover:shadow-md flex flex-col md:flex-row items-start p-3 gap-3 ${f.status === "completed" ? "opacity-50 grayscale" : overdue ? "border-error/20 bg-error/[0.01]" : "border-slate-200 hover:border-secondary/30"}`}
                >
                  <button
                    onClick={() => {
                      if (f.status === "completed") {
                        onToggleStatus(f.id);
                      } else {
                        setCompletingFollowUpId(f.id);
                        setCompletionBrief("");
                        setShowCompletionModal(true);
                      }
                    }}
                    className={`w-8 h-8 rounded-lg border-2 transition-all flex items-center justify-center shrink-0 mt-1 ${f.status === "completed" ? "bg-success border-success text-white" : "bg-white border-slate-200 text-slate-300 hover:border-success hover:text-success hover:bg-success/5"}`}
                    title={f.status === "completed" ? "Mark as Pending" : "Mark as Completed"}
                  >
                    {f.status === "completed" ? (
                      <Check size={16} strokeWidth={4} />
                    ) : (
                      <CheckCircle2 size={14} strokeWidth={3} />
                    )}
                  </button>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold  tracking-wider border ${getPriorityBadge(f.priority)}`}
                      >
                        {f.priority}
                      </span>
                      {f.followup_mode && (
                        <span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold  tracking-wider border border-slate-200 bg-slate-50 text-slate-500">
                          {f.followup_mode}
                        </span>
                      )}
                      {overdue && (
                        <span className="text-[9px] font-bold  tracking-wider text-error bg-error/10 px-2.5 py-0.5 rounded-md border border-error/20">
                          Overdue
                        </span>
                      )}
                    </div>
                    <h4
                      className={`text-sm font-bold text-primary tracking-tight ${f.status === "completed" ? "line-through opacity-50" : ""}`}
                    >
                      {f.title}
                    </h4>
                    {f.description && (
                      <p className="text-[11px] text-slate-400 font-medium mt-1 line-clamp-2">
                        {f.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-textMuted font-bold  tracking-widest">
                        <Clock size={12} className="text-secondary" />
                        {new Date(f.dueDate).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}{" · "}
                        {new Date(f.dueDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </div>
                      {f.projectName && (
                        <div className="flex items-center gap-1.5 text-[10px] text-textMuted font-bold  tracking-widest">
                          <span className="text-secondary">•</span>
                          {f.projectName}
                        </div>
                      )}
                      <button 
                        onClick={() => client && onSelectClient && onSelectClient(client)}
                        className="flex items-center gap-1.5 text-[10px] text-textMuted font-bold  tracking-widest hover:text-secondary hover:underline transition-all"
                      >
                        <span className="text-secondary">•</span>
                        {client?.name}
                      </button>
                    </div>
                    {f.status === "completed" && f.follow_brief && (
                      <div className="mt-2 px-3 py-2 bg-success/5 border border-success/20 rounded-lg">
                        <p className="text-[10px] font-bold text-success  tracking-wider mb-0.5">
                          Conclusion
                        </p>
                        <p className="text-[11px] text-slate-600 font-medium">
                          {f.follow_brief}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        let compDate = new Date().toISOString().split("T")[0];
                        let compHr = "12";
                        let compMin = "00";
                        let compPrd = "PM";

                        if (f.status === "completed" && f.completed_at) {
                          const cd = new Date(f.completed_at);
                          if (!isNaN(cd.getTime())) {
                            compDate = cd.toISOString().split("T")[0];
                            compHr = (cd.getHours() % 12 || 12).toString();
                            compMin = cd.getMinutes().toString().padStart(2, "0");
                            compPrd = cd.getHours() >= 12 ? "PM" : "AM";
                          }
                        }

                        setFormData({
                          ...f,
                          followup_status: f.status || f.followup_status || "pending",
                          followup_date: f.dueDate
                            ? new Date(f.dueDate).toISOString().split("T")[0]
                            : f.followup_date ||
                              new Date().toISOString().split("T")[0],
                          timeHour: f.dueDate 
                            ? (new Date(f.dueDate).getHours() % 12 || 12).toString() 
                            : "12",
                          timeMinute: f.dueDate 
                            ? new Date(f.dueDate).getMinutes().toString().padStart(2, "0") 
                            : "00",
                          timePeriod: f.dueDate 
                            ? (new Date(f.dueDate).getHours() >= 12 ? "PM" : "AM") 
                            : "PM",
                          completed_by: f.completed_by || "",
                          completionDate: compDate,
                          completionHour: compHr,
                          completionMinute: compMin,
                          completionPeriod: compPrd,
                        });
                        setShowAddModal(true);
                      }}
                      className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-primary transition-all active:scale-90 hover:shadow-sm"
                      title="Edit Follow-up"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFollowUp && onDeleteFollowUp(f.id);
                      }}
                      className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-error hover:border-error/30 transition-all active:scale-90 hover:shadow-sm"
                      title="Delete Follow-up"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Completion Brief Modal */}
        {showCompletionModal &&
          createPortal(
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[99999] flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 animate-fade-in relative z-[100000]">
                <div className="bg-primary p-4 text-white relative rounded-t-xl">
                  <button
                    onClick={() => {
                      setShowCompletionModal(false);
                      setCompletingFollowUpId(null);
                      setCompletionBrief("");
                    }}
                    className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <X size={18} strokeWidth={3} />
                  </button>
                  <div className="flex items-center gap-3 pr-8">
                    <div className="w-8 h-8 bg-secondary/20 rounded-xl flex items-center justify-center border border-secondary/30">
                      <CheckCircle2
                        size={18}
                        strokeWidth={3}
                        className="text-secondary"
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-bold tracking-tighter leading-none">
                        Mark as Completed
                      </h3>
                      <p className="text-secondary text-[9px] font-bold  tracking-widest mt-0.5">
                        Follow-up Conclusion
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-primary  tracking-widest ml-1">
                      Conclusion Brief
                    </label>
                    <textarea
                      autoFocus
                      placeholder="Write a brief conclusion about this follow-up..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium shadow-sm focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none resize-none"
                      value={completionBrief}
                      onChange={(e) => setCompletionBrief(e.target.value)}
                      rows="3"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-primary  tracking-widest ml-1">
                        Completion Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium shadow-sm focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none"
                        value={completionDate}
                        onChange={(e) => setCompletionDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-primary  tracking-widest ml-1">
                        Completion Time
                      </label>
                      <div className="flex gap-2">
                        {/* Hour */}
                        <div className="flex-1 relative">
                          <button
                            type="button"
                            onClick={() => setIsCompHourOpen(!isCompHourOpen)}
                            className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold shadow-sm"
                          >
                            <span>{completionHour.padStart(2, '0')}</span>
                            <ChevronDown size={12} />
                          </button>
                          {isCompHourOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-lg shadow-xl z-[100] max-h-32 overflow-y-auto">
                              {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                                <button key={h} type="button" onClick={() => { setCompletionHour(h.toString()); setIsCompHourOpen(false); }} className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-slate-50">{h.toString().padStart(2, '0')}</button>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Minute */}
                        <div className="flex-1 relative">
                          <button
                            type="button"
                            onClick={() => setIsCompMinOpen(!isCompMinOpen)}
                            className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold shadow-sm"
                          >
                            <span>{completionMinute}</span>
                            <ChevronDown size={12} />
                          </button>
                          {isCompMinOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-lg shadow-xl z-[100] max-h-32 overflow-y-auto">
                              {Array.from({ length: 12 }, (_, i) => i * 5).map(m => (
                                <button key={m} type="button" onClick={() => { setCompletionMinute(m.toString().padStart(2, '0')); setIsCompMinOpen(false); }} className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-slate-50">{m.toString().padStart(2, '0')}</button>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Period */}
                        <div className="w-14 relative">
                          <button
                            type="button"
                            onClick={() => setIsCompPeriodOpen(!isCompPeriodOpen)}
                            className="w-full flex items-center justify-between px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold shadow-sm"
                          >
                            <span>{completionPeriod}</span>
                            <ChevronDown size={12} />
                          </button>
                          {isCompPeriodOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-lg shadow-xl z-[100]">
                              {["AM", "PM"].map(p => (
                                <button key={p} type="button" onClick={() => { setCompletionPeriod(p); setIsCompPeriodOpen(false); }} className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-slate-50">{p}</button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-primary  tracking-widest ml-1">
                      Completed By
                    </label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium shadow-sm focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none"
                      value={completedBy}
                      onChange={(e) => setCompletedBy(e.target.value)}
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (completingFollowUpId) {
                          let hour = parseInt(completionHour);
                          if (completionPeriod === "PM" && hour < 12) hour += 12;
                          if (completionPeriod === "AM" && hour === 12) hour = 0;
                          const time24 = `${hour.toString().padStart(2, "0")}:${completionMinute}:00`;
                          const completedAt = `${completionDate} ${time24}`;

                          onToggleStatus(completingFollowUpId, completionBrief, completedAt, completedBy);
                        }
                        setShowCompletionModal(false);
                        setCompletingFollowUpId(null);
                        setCompletionBrief("");
                      }}
                      className="w-full py-3 bg-[#18254D] text-white rounded-xl text-[11px] font-bold  tracking-[0.25em] shadow-xl active:scale-[0.97] transition-all hover:bg-[#1e2e5e] hover:shadow-2xl flex items-center justify-center gap-3"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>

      {showAddModal &&
        createPortal(
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto custom-scrollbar">
            <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl border border-slate-200 animate-fade-in my-auto">
              <div className="bg-primary p-4 text-white relative rounded-t-xl">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({
                      clientId: "",
                      title: "",
                      description: "",
                      followup_date: new Date().toISOString().split("T")[0],
                      followup_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                      followup_mode: "call",
                      followup_status: "pending",
                      follow_brief: "",
                      priority: "Medium",
                      timeHour: "12",
                      timeMinute: "00",
                      timePeriod: "PM",
                    });
                  }}
                  className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={18} strokeWidth={3} />
                </button>
                <h3 className="text-base font-bold tracking-tighter mb-0.5">
                  {formData.id ? "Edit Follow Up" : "Add Follow Up"}
                </h3>
                <p className="text-slate-400 text-[9px] font-bold  tracking-widest">
                  {formData.id
                    ? "Update follow-up details"
                    : "Create a new follow-up task"}
                </p>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-3">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-primary  tracking-widest ml-1">
                      {typeFilter === "Active"
                        ? "Client Name"
                        : typeFilter === "Lead"
                          ? "Lead Name"
                          : "Target Identity"}
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setIsClientDropdownOpen(!isClientDropdownOpen)
                        }
                        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium shadow-sm hover:border-secondary transition-all"
                      >
                        <span className="text-primary truncate max-w-[90%]">
                          {formData.clientId
                            ? clients.find((c) => c.id == formData.clientId)
                                ?.name
                            : typeFilter === "Active"
                              ? "Select a client..."
                              : typeFilter === "Lead"
                                ? "Select a lead..."
                                : "Select a client or lead..."}
                        </span>
                        <ChevronDown
                          size={16}
                          className={`text-slate-400 transition-transform flex-shrink-0 ${isClientDropdownOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {isClientDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-[80]"
                            onClick={() => setIsClientDropdownOpen(false)}
                          />
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[90] animate-fade-in-up origin-top max-h-80 flex flex-col">
                            <div className="sticky top-0 bg-[#18254D] z-10">
                              <div className="px-4 py-3 border-b border-white/10">
                                <p className="text-[9px] font-bold text-white/50  tracking-widest">
                                  Select {typeFilter === "Active" ? "Client" : typeFilter === "Lead" ? "Lead" : "Client/Lead"}
                                </p>
                              </div>
                              <div className="p-2 border-b border-slate-100 bg-slate-50">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                  <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-secondary transition-colors"
                                    value={clientSearchTerm}
                                    onChange={(e) => setClientSearchTerm(e.target.value)}
                                    autoFocus
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="overflow-y-auto max-h-60">
                              {clients
                                .filter(c => {
                                  // Type filtering if needed
                                  if (typeFilter === "Active" && c.status !== "Active") return false;
                                  if (typeFilter === "Lead" && c.status !== "Lead") return false;
                                  
                                  // Search filtering
                                  if (!clientSearchTerm.trim()) return true;
                                  const q = clientSearchTerm.toLowerCase();
                                  return c.name?.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q);
                                })
                                .map((c) => (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => {
                                      setFormData({ ...formData, clientId: c.id });
                                      setIsClientDropdownOpen(false);
                                      setClientSearchTerm("");
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-[10px] font-bold  tracking-widest transition-colors ${
                                      formData.clientId == c.id
                                        ? "bg-slate-100 text-secondary"
                                        : "text-[#18254D] hover:bg-slate-50"
                                    }`}
                                  >
                                    <div className="flex flex-col">
                                      <span>{c.name}</span>
                                      {c.company && (
                                        <span className="text-[8px] opacity-50">{c.company}</span>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              {clients.filter(c => {
                                if (typeFilter === "Active" && c.status !== "Active") return false;
                                if (typeFilter === "Lead" && c.status !== "Lead") return false;
                                if (!clientSearchTerm.trim()) return true;
                                const q = clientSearchTerm.toLowerCase();
                                return c.name?.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q);
                              }).length === 0 && (
                                <div className="px-4 py-6 text-center">
                                  <p className="text-[10px] font-bold text-slate-400 italic">No results found</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {typeFilter === "Active" && (
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-primary  tracking-widest ml-1">
                        Project Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Website Redesign"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium shadow-sm focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none"
                        value={formData.projectName || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            projectName: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-primary  tracking-widest ml-1">
                      Task Title
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Discuss project scope"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium shadow-sm focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-primary  tracking-widest ml-1">
                      Description
                    </label>
                    <textarea
                      placeholder="Add details about your follow-up..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium shadow-sm focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none resize-none"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows="3"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-primary  tracking-widest ml-1">
                        Follow-up Date
                      </label>
                      <DatePicker
                        value={formData.followup_date}
                        onChange={(val) =>
                          setFormData({ ...formData, followup_date: val })
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-primary  tracking-widest ml-1">
                        Follow-up Time (12h)
                      </label>
                      <div className="flex gap-2 relative">
                        {/* Hour Dropdown */}
                        <div className="flex-1 relative">
                          <button
                            type="button"
                            onClick={() => setIsHourDropdownOpen(!isHourDropdownOpen)}
                            className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:border-secondary transition-all"
                          >
                            <span>{formData.timeHour.padStart(2, '0')}</span>
                            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isHourDropdownOpen ? "rotate-180" : ""}`} />
                          </button>
                          {isHourDropdownOpen && (
                            <>
                              <div className="fixed inset-0 z-[80]" onClick={() => setIsHourDropdownOpen(false)} />
                              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-y-auto max-h-48 z-[90] animate-fade-in-up origin-top">
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                                  <button
                                    key={h}
                                    type="button"
                                    onClick={() => {
                                      setFormData({ ...formData, timeHour: h.toString() });
                                      setIsHourDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-[10px] font-bold tracking-widest transition-colors ${formData.timeHour === h.toString() ? "bg-slate-100 text-secondary" : "text-[#18254D] hover:bg-slate-50"}`}
                                  >
                                    {h.toString().padStart(2, '0')}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Minute Dropdown */}
                        <div className="flex-1 relative">
                          <button
                            type="button"
                            onClick={() => setIsMinuteDropdownOpen(!isMinuteDropdownOpen)}
                            className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:border-secondary transition-all"
                          >
                            <span>{formData.timeMinute}</span>
                            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isMinuteDropdownOpen ? "rotate-180" : ""}`} />
                          </button>
                          {isMinuteDropdownOpen && (
                            <>
                              <div className="fixed inset-0 z-[80]" onClick={() => setIsMinuteDropdownOpen(false)} />
                              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-y-auto max-h-48 z-[90] animate-fade-in-up origin-top">
                                {Array.from({ length: 60 }, (_, i) => i).map(m => (
                                  <button
                                    key={m}
                                    type="button"
                                    onClick={() => {
                                      setFormData({ ...formData, timeMinute: m.toString().padStart(2, '0') });
                                      setIsMinuteDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-[10px] font-bold tracking-widest transition-colors ${formData.timeMinute === m.toString().padStart(2, '0') ? "bg-slate-100 text-secondary" : "text-[#18254D] hover:bg-slate-50"}`}
                                  >
                                    {m.toString().padStart(2, '0')}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Period Dropdown */}
                        <div className="w-20 relative">
                          <button
                            type="button"
                            onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                            className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:border-secondary transition-all"
                          >
                            <span>{formData.timePeriod}</span>
                            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isPeriodDropdownOpen ? "rotate-180" : ""}`} />
                          </button>
                          {isPeriodDropdownOpen && (
                            <>
                              <div className="fixed inset-0 z-[80]" onClick={() => setIsPeriodDropdownOpen(false)} />
                              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[90] animate-fade-in-up origin-top">
                                {["AM", "PM"].map(p => (
                                  <button
                                    key={p}
                                    type="button"
                                    onClick={() => {
                                      setFormData({ ...formData, timePeriod: p });
                                      setIsPeriodDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-[10px] font-bold tracking-widest transition-colors ${formData.timePeriod === p ? "bg-slate-100 text-secondary" : "text-[#18254D] hover:bg-slate-50"}`}
                                  >
                                    {p}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-primary  tracking-widest ml-1">
                      Priority
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:border-secondary transition-all"
                      >
                        <span className={`capitalize ${getPriorityBadge(formData.priority)} px-2 py-0.5 rounded text-[10px]`}>
                          {formData.priority}
                        </span>
                        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isPriorityDropdownOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isPriorityDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-[80]" onClick={() => setIsPriorityDropdownOpen(false)} />
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[90] animate-fade-in-up origin-top">
                            {["Low", "Medium", "High"].map((p) => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, priority: p });
                                  setIsPriorityDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-[10px] font-bold tracking-widest transition-colors ${formData.priority === p ? "bg-slate-100 text-secondary" : "text-[#18254D] hover:bg-slate-50"}`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-primary  tracking-widest ml-1">
                      Follow-up Mode
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setIsModeDropdownOpen(!isModeDropdownOpen)
                        }
                        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:border-secondary transition-all"
                      >
                        <span className="text-primary capitalize">
                          {formData.followup_mode}
                        </span>
                        <ChevronDown
                          size={16}
                          className={`text-slate-400 transition-transform ${isModeDropdownOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {isModeDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-[80]"
                            onClick={() => setIsModeDropdownOpen(false)}
                          />
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[90] animate-fade-in-up origin-top">
                            <div className="bg-[#18254D] px-4 py-3 border-b border-white/10">
                              <p className="text-[9px] font-bold text-white/50  tracking-widest">
                                Select Mode
                              </p>
                            </div>
                            {["call", "email", "meeting", "whatsapp"].map(
                              (mode) => (
                                <button
                                  key={mode}
                                  type="button"
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      followup_mode: mode,
                                    });
                                    setIsModeDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-2.5 text-[10px] font-bold  tracking-widest transition-colors capitalize ${
                                    formData.followup_mode === mode
                                      ? "bg-slate-100 text-secondary"
                                      : "text-[#18254D] hover:bg-slate-50"
                                  }`}
                                >
                                  {mode}
                                </button>
                              ),
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {formData.followup_status === "completed" && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-primary tracking-widest ml-1">
                          Follow Conclusion Brief
                        </label>
                        <textarea
                          placeholder="Update the conclusion brief..."
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium shadow-sm focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none resize-none"
                          value={formData.follow_brief || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              follow_brief: e.target.value,
                            })
                          }
                          rows="3"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-primary tracking-widest ml-1">
                          Completed By
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. John Doe"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium shadow-sm focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none"
                          value={formData.completed_by || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              completed_by: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-primary tracking-widest ml-1">
                            Completion Date
                          </label>
                          <DatePicker
                            value={formData.completionDate}
                            onChange={(val) =>
                              setFormData({ ...formData, completionDate: val })
                            }
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-primary tracking-widest ml-1">
                            Completion Time
                          </label>
                          <div className="flex gap-2 relative">
                            {/* Hour Dropdown */}
                            <div className="flex-1 relative">
                              <button
                                type="button"
                                onClick={() => setIsCompHourOpen(!isCompHourOpen)}
                                className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:border-secondary transition-all"
                              >
                                <span>{formData.completionHour.padStart(2, '0')}</span>
                                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isCompHourOpen ? "rotate-180" : ""}`} />
                              </button>
                              {isCompHourOpen && (
                                <>
                                  <div className="fixed inset-0 z-[80]" onClick={() => setIsCompHourOpen(false)} />
                                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-y-auto max-h-48 z-[90] animate-fade-in-up origin-top">
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                                      <button
                                        key={h}
                                        type="button"
                                        onClick={() => {
                                          setFormData({ ...formData, completionHour: h.toString() });
                                          setIsCompHourOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-[10px] font-bold tracking-widest transition-colors ${formData.completionHour === h.toString() ? "bg-slate-100 text-secondary" : "text-[#18254D] hover:bg-slate-50"}`}
                                      >
                                        {h.toString().padStart(2, '0')}
                                      </button>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Minute Dropdown */}
                            <div className="flex-1 relative">
                              <button
                                type="button"
                                onClick={() => setIsCompMinOpen(!isCompMinOpen)}
                                className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:border-secondary transition-all"
                              >
                                <span>{formData.completionMinute}</span>
                                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isCompMinOpen ? "rotate-180" : ""}`} />
                              </button>
                              {isCompMinOpen && (
                                <>
                                  <div className="fixed inset-0 z-[80]" onClick={() => setIsCompMinOpen(false)} />
                                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-y-auto max-h-48 z-[90] animate-fade-in-up origin-top">
                                    {Array.from({ length: 60 }, (_, i) => i).map(m => (
                                      <button
                                        key={m}
                                        type="button"
                                        onClick={() => {
                                          setFormData({ ...formData, completionMinute: m.toString().padStart(2, '0') });
                                          setIsCompMinOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-[10px] font-bold tracking-widest transition-colors ${formData.completionMinute === m.toString().padStart(2, '0') ? "bg-slate-100 text-secondary" : "text-[#18254D] hover:bg-slate-50"}`}
                                      >
                                        {m.toString().padStart(2, '0')}
                                      </button>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Period Dropdown */}
                            <div className="w-20 relative">
                              <button
                                type="button"
                                onClick={() => setIsCompPeriodOpen(!isCompPeriodOpen)}
                                className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:border-secondary transition-all"
                              >
                                <span>{formData.completionPeriod}</span>
                                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isCompPeriodOpen ? "rotate-180" : ""}`} />
                              </button>
                              {isCompPeriodOpen && (
                                <>
                                  <div className="fixed inset-0 z-[80]" onClick={() => setIsCompPeriodOpen(false)} />
                                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[90] animate-fade-in-up origin-top">
                                    {["AM", "PM"].map(p => (
                                      <button
                                        key={p}
                                        type="button"
                                        onClick={() => {
                                          setFormData({ ...formData, completionPeriod: p });
                                          setIsCompPeriodOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-[10px] font-bold tracking-widest transition-colors ${formData.completionPeriod === p ? "bg-slate-100 text-secondary" : "text-[#18254D] hover:bg-slate-50"}`}
                                      >
                                        {p}
                                      </button>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-primary  tracking-widest ml-1">
                      Follow-up Status
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setIsStatusDropdownOpen(!isStatusDropdownOpen)
                        }
                        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:border-secondary transition-all"
                      >
                        <span className="text-primary capitalize">
                          {formData.followup_status}
                        </span>
                        <ChevronDown
                          size={16}
                          className={`text-slate-400 transition-transform ${isStatusDropdownOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {isStatusDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-[80]"
                            onClick={() => setIsStatusDropdownOpen(false)}
                          />
                          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[90] animate-fade-in-down origin-bottom">
                            <div className="bg-[#18254D] px-4 py-3 border-b border-white/10">
                              <p className="text-[9px] font-bold text-white/50  tracking-widest">
                                Select Status
                              </p>
                            </div>
                            {[
                              "pending",
                              "completed",
                              "reschedule",
                              "cancelled",
                            ].map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => {
                                  const updates = { followup_status: status };
                                  
                                  // If switching TO completed, and it's currently empty, pre-fill with defaults
                                  if (status === "completed") {
                                    if (!formData.completed_by) {
                                      const user = JSON.parse(localStorage.getItem("user") || "{}");
                                      updates.completed_by = user.full_name || "";
                                    }
                                    if (!formData.completionDate) {
                                      updates.completionDate = new Date().toISOString().split("T")[0];
                                    }
                                    if (!formData.completionHour) {
                                      const now = new Date();
                                      updates.completionHour = (now.getHours() % 12 || 12).toString();
                                      updates.completionMinute = now.getMinutes().toString().padStart(2, "0");
                                      updates.completionPeriod = now.getHours() >= 12 ? "PM" : "AM";
                                    }
                                  }

                                  setFormData({
                                    ...formData,
                                    ...updates
                                  });
                                  setIsStatusDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-[10px] font-bold  tracking-widest transition-colors capitalize ${
                                  formData.followup_status === status
                                    ? "bg-slate-100 text-secondary"
                                    : "text-[#18254D] hover:bg-slate-50"
                                }`}
                              >
                                {status === "reschedule" ? "Rescheduled" : status}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#18254D] text-white rounded-xl text-[11px] font-bold  tracking-[0.25em] shadow-xl active:scale-[0.97] transition-all hover:bg-[#1e2e5e] hover:shadow-2xl flex items-center justify-center gap-3"
                  >
                    {formData.id ? "Save Changes" : "Create Follow-up"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default FollowUpList;
