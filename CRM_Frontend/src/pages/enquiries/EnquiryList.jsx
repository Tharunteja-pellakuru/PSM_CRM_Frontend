import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Mail,
  Phone,
  Globe,
  Ban,
  CheckCircle,
  Clock,
  PauseCircle,
  Pause,
  ShieldAlert,
  Layout,
  RefreshCcw,
  Trash2,
  Flame,
  Sun,
  Snowflake,
  Plus,
  Send,
  Inbox,
  Search,
  X,
  Sparkles,
  ChevronDown,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import DatePicker from "../../components/ui/DatePicker";
import {
  analyzeEnquiryRelevance,
  batchAnalyzeEnquiries,
} from "../../services/aiService";

const EnquiryList = ({
  enquiries,
  onPromote,
  onDismiss,
  onHold,
  onRestore,
  onDelete,
  onDeleteAll,
  onUpdate,
  onAdd,
  aiModels = [],
}) => {
  const [activeTab, setActiveTab] = useState("new");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const aiModelRef = useRef(null);
  const [modelDropdownStyle, setModelDropdownStyle] = useState({});

  useEffect(() => {
    if (isModelDropdownOpen && aiModelRef.current) {
      const rect = aiModelRef.current.getBoundingClientRect();
      setModelDropdownStyle({
        position: 'fixed',
        top: `${rect.bottom + 8}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: 9999
      });
    }
  }, [isModelDropdownOpen]);

  useEffect(() => {
    const handleScrollResize = (e) => {
      if (isModelDropdownOpen) {
        if (e.type === 'scroll' && e.target.closest && e.target.closest('.ai-model-dropdown')) {
          return;
        }
        setIsModelDropdownOpen(false);
      }
    };
    if (isModelDropdownOpen) {
      window.addEventListener("scroll", handleScrollResize, true);
      window.addEventListener("resize", handleScrollResize, true);
    }
    return () => {
      window.removeEventListener("scroll", handleScrollResize, true);
      window.removeEventListener("resize", handleScrollResize, true);
    };
  }, [isModelDropdownOpen]);
  const [filterQuery, setFilterQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisError, setAiAnalysisError] = useState(null);
  const [aiAnalysisEnabled, setAiAnalysisEnabled] = useState(false);
  const [hideIrrelevant, setHideIrrelevant] = useState(false);
  const [selectedAiModel, setSelectedAiModel] = useState("");
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [promoteFormData, setPromoteFormData] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    leadType: "Warm",
    leadCategory: "Tech",
    notes: "",
  });
  const [showSimulateForm, setShowSimulateForm] = useState(false);
  const [holdModalOpen, setHoldModalOpen] = useState(false);
  const [holdReason, setHoldReason] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    message: "",
  });

  // Auto-select default model for AI Analysis
  useEffect(() => {
    if (aiModels.length > 0 && !selectedAiModel) {
      const def = aiModels.find((m) => m.isDefault) || aiModels[0];
      setSelectedAiModel(def.modelId);
    }
  }, [aiModels]);

  const hideIrrelevantRef = React.useRef(hideIrrelevant);
  useEffect(() => {
    hideIrrelevantRef.current = hideIrrelevant;
  }, [hideIrrelevant]);

  const analysisLoopRef = React.useRef(false);

  useEffect(() => {
    if (aiAnalysisEnabled && activeTab === "new" && !analysisLoopRef.current) {
      const runAnalysis = async () => {
        const toAnalyze = enquiries.filter(
          (e) => (e.status === "new" || e.status === "read") && !e.aiAnalysis,
        );
        if (toAnalyze.length > 0) {
          analysisLoopRef.current = true;
          setIsAnalyzing(true);
          setAiAnalysisError(null);
          const modelObj =
            aiModels.find((m) => m.modelId === selectedAiModel) ||
            aiModels.find((m) => m.isDefault) ||
            aiModels[0];
          const apiKey = modelObj?.apiKey || process.env.API_KEY;
          const modelId = modelObj?.modelId || "gemini-2.0-flash";

          const batchSize = 5;
          for (let i = 0; i < toAnalyze.length; i += batchSize) {
            const batch = toAnalyze.slice(i, i + batchSize);
            try {
              const results = await batchAnalyzeEnquiries(
                batch,
                apiKey,
                modelId,
              );
              results.forEach((res) => {
                const enq = batch.find((b) => b.id === res.id);
                if (enq) {
                  onUpdate({ id: enq.id, aiAnalysis: res });
                  // If Filter Spam is enabled and this is irrelevant, dismiss it immediately
                  if (hideIrrelevantRef.current && !res.isRelevant) {
                    onDismiss(enq.id);
                  }
                }
              });

              if (i + batchSize < toAnalyze.length) {
                // Wait 8 seconds to stay under 10 RPM (Requests Per Minute)
                await new Promise((r) => setTimeout(r, 8000));
              }
            } catch (err) {
              console.error("Failed to analyze batch:", err);
              const isQuota =
                err.status === "RESOURCE_EXHAUSTED" ||
                err.message?.toLowerCase().includes("quota exceeded") ||
                err.message?.toLowerCase().includes("rate_limit_exceeded");
              const retryDelay = err.retryDelay || 10;

              if (err.message?.includes("429")) {
                const waitMsg = err.retryAfter
                  ? `Try after ${err.retryAfter}`
                  : `Waiting ${retryDelay}s then retrying...`;
                setAiAnalysisError(`Rate limit hit. ${waitMsg}`);
                await new Promise((r) => setTimeout(r, retryDelay * 1000));
                i -= batchSize; // Retry this batch
                continue;
              }

              if (isQuota) {
                setAiAnalysisError(
                  `Daily Quota Reached for ${modelObj.name}. Try switching API keys or models.`,
                );
              } else if (
                err.message?.toLowerCase().includes("credit balance") ||
                err.message?.toLowerCase().includes("low to access")
              ) {
                setAiAnalysisError(
                  `Claude Error: Insufficient credits. Please check your Anthropic billing dashboard.`,
                );
              } else {
                setAiAnalysisError(
                  `AI Error: ${err.message || "Unknown error"}`,
                );
              }
              break; // Stop loop on fatal error or unhandled quota
            }
          }
          setIsAnalyzing(false);
          analysisLoopRef.current = false;
        }
      };
      runAnalysis();
    }
  }, [aiAnalysisEnabled, activeTab, enquiries, selectedAiModel]);

  const filteredEnquiries = enquiries.filter((e) => {
    const isIrrelevant =
      e.status === "irrelevant" || (e.aiAnalysis && !e.aiAnalysis.isRelevant);

    let matchesTab = false;
    if (activeTab === "new") {
      matchesTab = e.status === "new" || e.status === "read";
      // Hide irrelevant if spam filter is ON
      if (hideIrrelevant && isIrrelevant) matchesTab = false;
    } else if (activeTab === "hold" || activeTab === "onHold") {
      matchesTab = e.status === "hold" || e.status === "onHold";
    } else if (activeTab === "dismissed") {
      matchesTab = e.status === "dismissed" || e.status === "irrelevant";
      // Show irrelevant from Inbox if spam filter is ON
      if (
        hideIrrelevant &&
        (e.status === "new" || e.status === "read") &&
        isIrrelevant
      ) {
        matchesTab = true;
      }
    }

    if (!matchesTab) return false;

    const matchesSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.message && e.message.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    // Date Range Filter
    if (startDate || endDate) {
      const enquiryDate = new Date(e.date);
      if (startDate && enquiryDate < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (enquiryDate > end) return false;
      }
    }

    return true;
  });

  const enquiriesInTab = enquiries.filter((e) => {
    const isIrrelevant =
      e.status === "irrelevant" || (e.aiAnalysis && !e.aiAnalysis.isRelevant);

    if (activeTab === "new") {
      const isBase = e.status === "new" || e.status === "read";
      if (hideIrrelevant && isIrrelevant) return false;
      return isBase;
    }
    if (activeTab === "hold") return e.status === "hold";
    if (activeTab === "dismissed") {
      const isBase = e.status === "dismissed" || e.status === "irrelevant";
      if (
        hideIrrelevant &&
        (e.status === "new" || e.status === "read") &&
        isIrrelevant
      )
        return true;
      return isBase;
    }
    return false;
  });

  const totalInTabCount = enquiriesInTab.length;
  const analyzedInTabCount = enquiriesInTab.filter((e) => e.aiAnalysis).length;

  // Calculate how many are hidden from the current tab due to the SPAM filter
  const spamFilteredCount = enquiries.filter((e) => {
    const isBase =
      activeTab === "new" ? e.status === "new" || e.status === "read" : false;
    const isIrrelevant =
      e.status === "irrelevant" || (e.aiAnalysis && !e.aiAnalysis.isRelevant);
    return isBase && isIrrelevant && hideIrrelevant;
  }).length;

  const openLeadModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setPromoteFormData({
      name: enquiry.name,
      email: enquiry.email,
      phone: enquiry.phone,
      website: enquiry.website,
      leadType: "Warm",
      leadCategory: "Tech",
      notes: enquiry.message,
    });
    setLeadModalOpen(true);
  };

  const confirmLeadConversion = () => {
    if (selectedEnquiry) {
      // Create a temporary updated enquiry object to pass the edited data
      const updatedEnquiry = {
        ...selectedEnquiry,
        name: promoteFormData.name,
        email: promoteFormData.email,
        phone: promoteFormData.phone,
        website: promoteFormData.website,
        projectCategory: promoteFormData.leadCategory,
        message: promoteFormData.notes,
      };
      onPromote(updatedEnquiry, promoteFormData.leadType);
      setLeadModalOpen(false);
      setSelectedEnquiry(null);
    }
  };

  const openHoldModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setHoldModalOpen(true);
    setHoldReason("");
  };

  const confirmHold = () => {
    if (selectedEnquiry) {
      onUpdate({ ...selectedEnquiry, status: "hold", holdReason: holdReason });
      setHoldModalOpen(false);
      setSelectedEnquiry(null);
      setHoldReason("");
    }
  };

  const handleSimulateSubmit = (e) => {
    e.preventDefault();
    onAdd({ ...formData });
    setShowSimulateForm(false);
    setFormData({ name: "", email: "", phone: "", website: "", message: "" });
    setActiveTab("new");
  };

  return (
    <div className="w-full relative">
      <div className="space-y-5 animate-fade-in w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="max-w-2xl">
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-primary tracking-tight mb-1.5">
              Enquiry Hub
            </h2>
            <p className="text-sm text-textMuted font-medium leading-relaxed">
              Manage and qualify all incoming business enquiries.
            </p>
          </div>
          <div className="w-full lg:w-auto">
            <button
              onClick={() => setShowSimulateForm(true)}
              className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-2xl hover:bg-slate-800 transition-all text-[11px] font-bold  tracking-wider shadow-lg active:scale-95 group"
            >
              <Plus
                size={16}
                strokeWidth={2.5}
                className="group-hover:rotate-90 transition-transform"
              />
              New Enquiry
            </button>
          </div>
        </div>

        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm relative z-[60]">
          <div className="flex flex-nowrap gap-2 w-full items-center overflow-x-auto no-scrollbar">
            {/* 1. Search Bar */}
            <div className="relative min-w-[200px] flex-[1.5] shrink-0">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#18254D]/40"
              />
              <input
                type="text"
                placeholder="Search enquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-[38px] pl-11 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-[#18254D] focus:outline-none focus:ring-4 focus:ring-[#18254D]/10 focus:border-[#18254D]/20 transition-all placeholder:text-[#18254D]/30"
              />
            </div>

            {/* 2. From Date Picker */}
            <div className="min-w-[140px] flex-1 shrink-0 relative z-50">
              <DatePicker
                label="From"
                value={startDate}
                onChange={setStartDate}
              />
            </div>

            {/* 3. To Date Picker */}
            <div className="min-w-[140px] flex-1 shrink-0 relative z-50">
              <DatePicker label="To" value={endDate} onChange={setEndDate} />
            </div>

            {/* AI Controls - Integrated into same row */}
            {activeTab === "new" && (
              <React.Fragment>
                {/* AI Analysis Toggle */}
                <div className="min-w-[140px] flex-1 shrink-0 flex items-center justify-between px-3 h-[38px] bg-slate-50 border border-slate-200 rounded-xl">
                  <span
                    className={`text-[10px] font-bold uppercase ${aiAnalysisEnabled ? "text-primary" : "text-slate-400"}`}
                  >
                    AI Analysis
                  </span>

                  <button
                    onClick={() => {
                      const nextValue = !aiAnalysisEnabled;
                      setAiAnalysisEnabled(nextValue);
                      if (!nextValue) {
                        setHideIrrelevant(false);
                      }
                    }}
                    className={`relative inline-flex h-5 w-9 rounded-full transition ${
                      aiAnalysisEnabled ? "bg-secondary" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 bg-white rounded-full transform transition ${
                        aiAnalysisEnabled ? "translate-x-4" : "translate-x-1"
                      } mt-[2px]`}
                    />
                  </button>
                </div>

                {/* Filter Spam Toggle */}
                <div className="min-w-[140px] flex-1 shrink-0 flex items-center justify-between px-3 h-[38px] bg-slate-50 border border-slate-200 rounded-xl">
                  <span
                    className={`text-[10px] font-bold uppercase ${hideIrrelevant ? "text-primary" : "text-slate-400"}`}
                  >
                    Filter Spam
                  </span>

                  <button
                    onClick={() => setHideIrrelevant(!hideIrrelevant)}
                    className={`relative inline-flex h-5 w-9 rounded-full transition ${
                      hideIrrelevant ? "bg-primary" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 bg-white rounded-full transform transition ${
                        hideIrrelevant ? "translate-x-4" : "translate-x-1"
                      } mt-[2px]`}
                    />
                  </button>
                </div>

                {/* AI Model Settings */}
                {aiAnalysisEnabled && aiModels.length > 0 && (
                  <div className="relative min-w-[160px] flex-1 shrink-0 z-50" ref={aiModelRef}>
                    <button
                      onClick={() =>
                        setIsModelDropdownOpen(!isModelDropdownOpen)
                      }
                      className="w-full h-[38px] flex items-center justify-between gap-3 px-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold tracking-widest text-[#18254D] hover:bg-slate-50 transition-all shadow-sm active:scale-95 group"
                    >
                      <span className="truncate text-[10px] uppercase tracking-tight">
                        {aiModels.find((m) => m.modelId === selectedAiModel)
                          ?.name || "AI Model"}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-300 ${isModelDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isModelDropdownOpen && createPortal(
                      <>
                        <div
                          className="fixed inset-0 z-[9998]"
                          onClick={() => setIsModelDropdownOpen(false)}
                        />
                        <div 
                          className="ai-model-dropdown bg-white border border-slate-200 rounded-xl shadow-xl z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                          style={modelDropdownStyle}
                        >
                          <div className="max-h-60 overflow-y-auto py-1 no-scrollbar">
                            {aiModels.map((model) => (
                              <button
                                key={model.modelId}
                                onClick={() => {
                                  setSelectedAiModel(model.modelId);
                                  setIsModelDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex flex-col gap-0.5 ${selectedAiModel === model.modelId ? "bg-slate-50" : ""}`}
                              >
                                <span className="text-[10px] font-bold text-primary">
                                  {model.name}
                                </span>
                                <span className="text-[8px] text-slate-400 truncate">
                                  {model.description}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </>,
                      document.body
                    )}
                  </div>
                )}
              </React.Fragment>
            )}
          </div>
        </div>
        {/* Error Message Row */}
        {aiAnalysisError && aiAnalysisEnabled && (
          <div className="w-full mt-2 flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-bold">
            <span className="shrink-0">!</span>
            <div className="flex-1 min-w-0">
              <span>{aiAnalysisError}</span>
            </div>
            <button
              onClick={() => setAiAnalysisError(null)}
              className="shrink-0 text-red-400 hover:text-red-600 ml-1"
            >
              X
            </button>
          </div>
        )}

        {/* AI Analysis Progress Message */}
        {activeTab === "new" && aiAnalysisEnabled && (
          <div className="mt-4 flex justify-center">
            <div className="px-5 py-1.5 bg-slate-50 border border-slate-100 rounded-full shadow-sm flex items-center gap-3 animate-fade-in group">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black  tracking-widest text-slate-400">
                  Analysis
                </span>
                {isAnalyzing && (
                  <Loader2
                    size={12}
                    className="animate-spin text-primary"
                    strokeWidth={3}
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black  tracking-widest text-primary">
                  {analyzedInTabCount} of {totalInTabCount}
                </span>
                <span className="text-[10px] font-black  tracking-widest text-slate-400">
                  Completed
                </span>
              </div>
              {hideIrrelevant && spamFilteredCount > 0 && (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mx-1" />
                  <span className="text-[10px] font-black  tracking-widest text-secondary/60">
                    {spamFilteredCount} Filtered
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lead View Toggles (Enquiries) */}
      <div className="flex justify-center my-4 overflow-x-auto">
        <div className="inline-flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200 shadow-sm leading-none h-[42px] items-center gap-1 whitespace-nowrap">
          {["new", "hold", "dismissed"].map((tab) => {
            const colors = {
              new: {
                active: "text-blue-600 border-blue-100 bg-white",
                hover: "hover:text-blue-500 hover:bg-white/50",
              },
              hold: {
                active: "text-orange-600 border-orange-100 bg-white",
                hover: "hover:text-orange-500 hover:bg-white/50",
              },
              dismissed: {
                active: "text-rose-600 border-rose-100 bg-white",
                hover: "hover:text-rose-500 hover:bg-white/50",
              },
            };
            const activeColor = colors[tab].active;
            const hoverColor = colors[tab].hover;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 h-full rounded-xl text-[10px] font-bold  tracking-wider transition-all flex items-center justify-center min-w-[100px] border border-transparent whitespace-nowrap ${
                  activeTab === tab
                    ? `${activeColor} shadow-md`
                    : `text-slate-400 ${hoverColor}`
                }`}
              >
                {tab === "new"
                  ? "Inbox"
                  : tab === "hold"
                    ? "On Hold"
                    : "Dismissed"}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full">
        {filteredEnquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 bg-white rounded-3xl border border-slate-200 shadow-sm w-full">
            <Inbox size={22} className="text-slate-200 mb-2" />
            <p className="text-[10px] font-bold text-slate-300  tracking-widest">
              No enquiries
            </p>
          </div>
        ) : (
          filteredEnquiries.map((enquiry, idx) => (
            <div
              key={`${enquiry.id}-${idx}`}
              className="group relative bg-white rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden p-4 w-full flex flex-col gap-4"
            >
              {/* Card Header: Identity and Badge */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-inner ${
                      activeTab === "hold"
                        ? "bg-amber-500"
                        : activeTab === "dismissed"
                          ? "bg-slate-700"
                          : "bg-[#18254D]"
                    }`}
                  >
                    {enquiry.name.charAt(0)}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-base font-bold text-[#18254D] tracking-tight">
                      {enquiry.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                      <Clock size={10} className="opacity-70" />
                      {new Date(enquiry.date).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {enquiry.aiAnalysis && (
                    <div
                      className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 border ${
                        enquiry.aiAnalysis.isRelevant
                          ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                          : "bg-rose-50 border-rose-100 text-rose-600"
                      }`}
                    >
                      {enquiry.aiAnalysis.isRelevant ? (
                        <Sparkles size={10} className="text-emerald-500" />
                      ) : (
                        <ShieldAlert size={10} className="text-rose-500" />
                      )}
                      <span className="text-[8px] font-black uppercase tracking-widest">
                        {enquiry.aiAnalysis.isRelevant
                          ? "Relevant"
                          : "Spam/Irr"}
                      </span>
                      {enquiry.aiAnalysis.leadScore !== undefined && (
                        <>
                          <div className="w-px h-2 bg-current opacity-20" />
                          <span className="text-[8px] font-black">
                            {enquiry.aiAnalysis.leadScore}
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === "hold" && (
                    <div className="px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-full flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[8px] font-black uppercase tracking-[0.1em] text-amber-600">
                        Reason Logged
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Content: Contact Info and Message */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* 1. Contact Info Column */}
                <div className="flex flex-col gap-2 w-full lg:w-48 shrink-0">
                  <div className="flex items-center gap-2.5 p-2 bg-slate-50/80 border border-white/50 rounded-xl hover:bg-white hover:shadow-md hover:shadow-slate-100 transition-all group/info">
                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover/info:scale-110 transition-transform">
                      <Mail size={12} className="text-slate-400" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 truncate">
                      {enquiry.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2 bg-slate-50/80 border border-white/50 rounded-xl hover:bg-white hover:shadow-md hover:shadow-slate-100 transition-all group/info">
                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover/info:scale-110 transition-transform">
                      <Phone size={12} className="text-slate-400" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 truncate">
                      {enquiry.phone || "Not Provided"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2 bg-slate-50/80 border border-white/50 rounded-xl hover:bg-white hover:shadow-md hover:shadow-slate-100 transition-all group/info">
                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover/info:scale-110 transition-transform">
                      <Globe size={12} className="text-slate-400" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 truncate">
                      {enquiry.website || "Direct"}
                    </span>
                  </div>
                </div>

                {/* 2. Message Column */}
                <div className="flex-1 bg-slate-50/50 rounded-[1rem] p-4 flex flex-col gap-3 relative">
                  <p className="text-xs font-bold text-[#18254D] leading-relaxed italic opacity-90">
                    "{enquiry.message}"
                  </p>

                  {activeTab === "hold" && enquiry.holdReason && (
                    <div className="mt-1 space-y-1.5 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                          Hold Reason
                        </span>
                      </div>
                      <div className="p-3 bg-amber-50/50 border border-amber-100/50 rounded-xl">
                        <p className="text-[11px] font-bold text-amber-600 leading-relaxed italic">
                          {enquiry.holdReason}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Actions */}
              <div className="flex items-center gap-3 pt-1">
                {activeTab === "new" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => openLeadModal(enquiry)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#18254D] text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/10 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                      <CheckCircle size={14} strokeWidth={2.5} />
                      Add to Lead
                    </button>
                    <button
                      type="button"
                      onClick={() => openHoldModal(enquiry)}
                      className="h-9 px-4 flex items-center gap-2 text-slate-400 border border-slate-200 rounded-full hover:bg-amber-50 hover:text-amber-500 hover:border-amber-200 transition-all font-bold tracking-wider text-[9px] uppercase group/hold"
                    >
                      <PauseCircle
                        size={16}
                        className="group-hover/hold:scale-110 transition-transform"
                      />
                      Hold
                    </button>
                    <button
                      type="button"
                      onClick={() => onDismiss(enquiry.id)}
                      className="h-9 px-4 flex items-center gap-2 text-slate-400 border border-slate-200 rounded-full hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all font-bold tracking-wider text-[9px] uppercase group/dismiss"
                    >
                      <X
                        size={16}
                        className="group-hover/dismiss:rotate-90 transition-transform"
                      />
                      Dismiss
                    </button>
                  </>
                ) : activeTab === "hold" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onRestore(enquiry.id)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#18254D] text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                      <RefreshCcw size={14} strokeWidth={2.5} />
                      Restore Enquiry
                    </button>
                    <button
                      type="button"
                      onClick={() => onDismiss(enquiry.id)}
                      className="h-9 px-4 flex items-center gap-2 text-slate-400 border border-slate-200 rounded-full hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all font-bold tracking-wider text-[9px] uppercase group/dismiss"
                    >
                      <X
                        size={16}
                        className="group-hover/dismiss:rotate-90 transition-transform"
                      />
                      Dismiss
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onRestore(enquiry.id)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#18254D] text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                      <RefreshCcw size={14} strokeWidth={2.5} />
                      Restore Enquiry
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(enquiry.id)}
                      className="w-9 h-9 flex items-center justify-center text-slate-300 border border-slate-100 rounded-full hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all"
                      title="Delete Permanently"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showSimulateForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in relative my-auto">
            <button
              onClick={() => setShowSimulateForm(false)}
              className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all z-20"
              title="Close"
            >
              <X size={20} strokeWidth={3} />
            </button>
            <div className="bg-primary p-6 text-white">
              <h3 className="text-2xl font-bold tracking-tight mb-1">
                New Enquiry
              </h3>
              <p className="text-slate-400 text-[11px] font-bold  tracking-widest">
                Manual Entry
              </p>
            </div>
            <form onSubmit={handleSimulateSubmit} className="p-7 space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-primary  tracking-widest ml-1">
                    Full Name
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/5 outline-none transition-all"
                    placeholder="Enter full name..."
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-primary  tracking-widest ml-1">
                      Email
                    </label>
                    <input
                      required
                      type="email"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/5 outline-none transition-all"
                      placeholder="Email address..."
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-primary  tracking-widest ml-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/5 outline-none transition-all"
                      placeholder="Phone number..."
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-primary  tracking-widest ml-1">
                    Website URL
                  </label>
                  <input
                    type="text"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/5 outline-none transition-all"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-primary  tracking-widest ml-1">
                    Requirement Briefing
                  </label>
                  <textarea
                    required
                    rows={4}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium resize-none focus:ring-2 focus:ring-primary/5 outline-none transition-all"
                    placeholder="Type message here..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-14 bg-[#18254D] text-white rounded-2xl text-[11px] font-bold  tracking-widest shadow-xl active:scale-[0.97] transition-all hover:bg-[#1e2e5e] hover:shadow-2xl flex items-center justify-center gap-3 group/btn"
                >
                  <span>Add Enquiry</span>
                  <Send
                    size={16}
                    strokeWidth={2.5}
                    className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform"
                  />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {leadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-zoom-in my-auto">
            <div className="bg-[#18254D] px-5 py-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Plus size={18} className="text-white" />
                </div>
                <h3 className="text-lg font-bold tracking-tight ">New Lead</h3>
              </div>
              <button
                onClick={() => setLeadModalOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-primary  tracking-widest ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/5 outline-none transition-all"
                    value={promoteFormData.name}
                    onChange={(e) =>
                      setPromoteFormData({
                        ...promoteFormData,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-primary  tracking-widest ml-1">
                    Email ID
                  </label>
                  <input
                    type="email"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/5 outline-none transition-all"
                    value={promoteFormData.email}
                    onChange={(e) =>
                      setPromoteFormData({
                        ...promoteFormData,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-primary  tracking-widest ml-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/5 outline-none transition-all"
                    value={promoteFormData.phone}
                    onChange={(e) =>
                      setPromoteFormData({
                        ...promoteFormData,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-primary  tracking-widest ml-1">
                    Website URL
                  </label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/5 outline-none transition-all"
                    value={promoteFormData.website}
                    onChange={(e) =>
                      setPromoteFormData({
                        ...promoteFormData,
                        website: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-primary  tracking-widest ml-1">
                  Lead Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Tech", "Media"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        setPromoteFormData({
                          ...promoteFormData,
                          leadCategory: cat,
                        })
                      }
                      className={`flex items-center justify-center py-2.5 rounded-2xl border-2 transition-all font-bold  text-[10px] tracking-widest ${
                        promoteFormData.leadCategory === cat
                          ? "border-primary bg-primary/5 text-primary shadow-sm"
                          : "border-slate-100 text-slate-400 hover:border-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-primary  tracking-widest ml-1">
                  Lead Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Hot", "Warm", "Cold"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setPromoteFormData({
                          ...promoteFormData,
                          leadType: type,
                        })
                      }
                      className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl border-2 transition-all ${
                        promoteFormData.leadType === type
                          ? type === "Hot"
                            ? "bg-error/5 border-error text-error shadow-md shadow-error/10 scale-[1.03]"
                            : type === "Warm"
                              ? "bg-warning/5 border-warning text-warning shadow-md shadow-warning/10 scale-[1.03]"
                              : "bg-info/5 border-info text-info shadow-md shadow-info/10 scale-[1.03]"
                          : "bg-slate-50 border-slate-100 text-slate-400 grayscale opacity-60 hover:opacity-100 hover:grayscale-0"
                      }`}
                    >
                      {type === "Hot" ? (
                        <Flame size={14} strokeWidth={2.5} />
                      ) : type === "Warm" ? (
                        <Sun size={14} strokeWidth={2.5} />
                      ) : (
                        <Snowflake size={14} strokeWidth={2.5} />
                      )}
                      <span className="text-[8px] font-bold  tracking-widest">
                        {type}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-primary  tracking-widest ml-1">
                  Note
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium resize-none focus:ring-2 focus:ring-primary/5 outline-none transition-all"
                  value={promoteFormData.notes}
                  onChange={(e) =>
                    setPromoteFormData({
                      ...promoteFormData,
                      notes: e.target.value,
                    })
                  }
                />
              </div>

              <button
                type="button"
                onClick={confirmLeadConversion}
                className="w-full py-3.5 bg-[#18254D] text-white rounded-2xl text-[11px] font-bold  tracking-widest shadow-lg active:scale-[0.98] transition-all hover:bg-slate-800"
              >
                Add Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {holdModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in relative">
            <div className="bg-primary p-6 text-white">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-2xl font-bold tracking-tight">On Hold</h3>
                <button
                  onClick={() => setHoldModalOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-7 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary  tracking-widest ml-1">
                    Hold Reason
                  </label>
                  <textarea
                    required
                    rows={4}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium resize-none focus:ring-2 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300"
                    placeholder="Enter reason for suspending this enquiry..."
                    value={holdReason}
                    onChange={(e) => setHoldReason(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-4 pt-2">
                <button
                  type="button"
                  onClick={confirmHold}
                  disabled={!holdReason.trim()}
                  className="w-full h-14 bg-[#18254D] text-white rounded-2xl text-xs font-bold  tracking-widest shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale hover:bg-slate-800"
                >
                  <span>Add To Hold</span>
                  <PauseCircle size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnquiryList;
