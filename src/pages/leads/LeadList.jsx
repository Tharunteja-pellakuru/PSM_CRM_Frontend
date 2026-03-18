import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Filter,
  Mail,
  Phone,
  ChevronRight,
  Flame,
  Sun,
  Snowflake,
  Plus,
  X,
  UserPlus,
  Briefcase,
  Tag,
  Globe,
  MoreHorizontal,
  Trash2,
  ChevronDown,
  UserCheck,
  Upload,
  Paperclip,
  UserX,
  RotateCcw,
  MessageSquare,
  Clock,
  Calendar,
  Zap,
  Check,
  Pencil,
  User,
} from "lucide-react";
import DatePicker from "../../components/ui/DatePicker";
import { countries } from "../../utils/countries";
import {
  indianStates,
  commonCurrencies,
  countryToCurrency,
} from "../../utils/locationData";
import SearchableDropdown from "../../components/common/SearchableDropdown";
import {
  CATEGORY_MAP,
  REVERSE_CATEGORY_MAP,
} from "../../constants/categoryConstants";

const LeadList = ({
  leads,
  loading = false,
  onSelectLead,
  onAddLead,
  onDeleteLead,
  onOnboardLead,
  onDismissLead,
  onRestoreLead,
  onAddActivity,
  onUpdateConvertedLead,
  allLeads = [],
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [leadTypeFilter, setLeadTypeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isTierDropdownOpen, setIsTierDropdownOpen] = useState(false);
  const [isAddStatusDropdownOpen, setIsAddStatusDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isEditCategoryDropdownOpen, setIsEditCategoryDropdownOpen] =
    useState(false);
  const [isEditStatusDropdownOpen, setIsEditStatusDropdownOpen] =
    useState(false);

  const tierButtonRef = useRef(null);
  const categoryButtonRef = useRef(null);
  const [tierDropdownStyle, setTierDropdownStyle] = useState({});
  const [categoryDropdownStyle, setCategoryDropdownStyle] = useState({});

  useEffect(() => {
    if (isTierDropdownOpen && tierButtonRef.current) {
      const rect = tierButtonRef.current.getBoundingClientRect();
      setTierDropdownStyle({
        position: "fixed",
        top: `${rect.bottom + 8}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: 9999,
      });
    }
  }, [isTierDropdownOpen]);

  useEffect(() => {
    if (isCategoryDropdownOpen && categoryButtonRef.current) {
      const rect = categoryButtonRef.current.getBoundingClientRect();
      setCategoryDropdownStyle({
        position: "fixed",
        top: `${rect.bottom + 8}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: 9999,
      });
    }
  }, [isCategoryDropdownOpen]);

  useEffect(() => {
    const handleScrollResize = (e) => {
      if (
        isTierDropdownOpen ||
        isCategoryDropdownOpen ||
        isEditCategoryDropdownOpen ||
        isEditStatusDropdownOpen
      ) {
        if (
          e.type === "scroll" &&
          e.target.closest &&
          (e.target.closest(".tier-dropdown") ||
            e.target.closest(".category-dropdown") ||
            e.target.closest(".edit-category-dropdown") ||
            e.target.closest(".edit-status-dropdown") ||
            e.target.closest(".country-dropdown"))
        ) {
          return;
        }
        setIsTierDropdownOpen(false);
        setIsCategoryDropdownOpen(false);
        setIsEditCategoryDropdownOpen(false);
        setIsEditStatusDropdownOpen(false);
      }
    };
    if (
      isTierDropdownOpen ||
      isCategoryDropdownOpen ||
      isEditCategoryDropdownOpen ||
      isEditStatusDropdownOpen
    ) {
      window.addEventListener("scroll", handleScrollResize, true);
      window.addEventListener("resize", handleScrollResize, true);
    }
    return () => {
      window.removeEventListener("scroll", handleScrollResize, true);
      window.removeEventListener("resize", handleScrollResize, true);
    };
  }, [
    isTierDropdownOpen,
    isCategoryDropdownOpen,
    isEditCategoryDropdownOpen,
    isEditStatusDropdownOpen,
  ]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardingLeadId, setOnboardingLeadId] = useState(null);
  const [isNameDropdownOpen, setIsNameDropdownOpen] = useState(false);
  const [nameSearch, setNameSearch] = useState("");
  const [leadView, setLeadView] = useState("Pending");
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [isOnboardStatusDropdownOpen, setIsOnboardStatusDropdownOpen] =
    useState(false);
  const [isOnboardPriorityDropdownOpen, setIsOnboardPriorityDropdownOpen] =
    useState(false);
  const [
    isOnboardClientStatusDropdownOpen,
    setIsOnboardClientStatusDropdownOpen,
  ] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpLeadId, setFollowUpLeadId] = useState(null);
  const [isAddCategoryDropdownOpen, setIsAddCategoryDropdownOpen] =
    useState(false);
  const [showEditConvertedModal, setShowEditConvertedModal] = useState(false);
  const [editingConvertedLeadId, setEditingConvertedLeadId] = useState(null);
  const [editConvertedData, setEditConvertedData] = useState({
    name: "",
    email: "",
    phone: "",
    organisationName: "",
    country: "",
    state: "",
    currency: "",
    clientStatus: "Active",
    projectName: "",
    projectDescription: "",
    projectCategory: 1,
    projectStatus: "In Progress",
    projectPriority: "High",
    projectBudget: "",
    deadline: "",
    onboardingDate: "",
  });
  const [followUpData, setFollowUpData] = useState({
    type: "call",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().split(" ")[0].substring(0, 5),
  });

  const [onboardingData, setOnboardingData] = useState({
    name: "",
    email: "",
    phone: "",
    clientType: "New",
    status: "Active",
    projectName: "",
    projectStatus: "In Progress",
    projectCategory: 1,
    projectPriority: "High",
    projectDescription: "",
    projectBudget: "",
    country: "",
    state: "",
    currency: "",
    organisationName: "",
    clientStatus: "Active",
  });

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    status: "Lead",
    leadType: "Warm",
    industry: "",
    notes: "",
    projectName: "",
    projectStatus: "Planning",
    projectCategory: 1,
    projectPriority: "Medium",
    projectDescription: "",
    country: "",
  });

  const handleEditConvertedClick = (lead) => {
    setEditingConvertedLeadId(lead.id);

    // Separating country code from phone number
    let initialPhone = (lead.phone || "").trim();
    let initialCountry = (lead.country || "").trim();

    // Attempt to extract country code from phone if country is not already set clearly
    const matchedCountry = countries.find((c) => {
      const code = c.code;
      const plainCode = code.replace("+", "");
      const cleanPhone = initialPhone.replace("+", "").replace(/\s/g, "");
      return cleanPhone.startsWith(plainCode);
    });

    if (matchedCountry) {
      const code = matchedCountry.code;
      const plainCode = code.replace("+", "");

      // If the phone starts with the code, strip it
      if (initialPhone.startsWith(code)) {
        initialPhone = initialPhone.slice(code.length).trim();
      } else if (initialPhone.replace("+", "").startsWith(plainCode)) {
        initialPhone = initialPhone
          .replace("+", "")
          .slice(plainCode.length)
          .trim();
      }

      // If country was not set or was set to the code, use the canonical name for the dropdown
      if (
        !initialCountry ||
        initialCountry === code ||
        initialCountry === plainCode
      ) {
        initialCountry = matchedCountry.code;
      }
    }

    setEditConvertedData({
      name: lead.name,
      email: lead.email,
      phone: initialPhone,
      organisationName: lead.company || "",
      country: initialCountry,
      state: lead.state || "",
      currency: lead.currency || "",
      clientStatus: lead.status || "Active",
      projectName: lead.projectName || "",
      projectDescription: lead.projectDescription || lead.notes || "",
      projectCategory: lead.projectCategory || 1,
      projectStatus: lead.projectStatus || "In Progress",
      projectPriority: lead.projectPriority || "High",
      projectBudget: lead.budget || "",
      deadline: lead.deadline || "",
      onboardingDate: lead.onboardingDate || lead.joinedDate || "",
      website: lead.website || "",
      leadType: lead.leadType || "Converted",
    });
    // Ensure background filters are closed
    setIsCategoryDropdownOpen(false);
    setIsTierDropdownOpen(false);
    setShowEditConvertedModal(true);
  };

  const handleEditConvertedSubmit = async (e) => {
    e.preventDefault();
    if (onUpdateConvertedLead && editingConvertedLeadId) {
      try {
        const result = await onUpdateConvertedLead(
          editingConvertedLeadId,
          editConvertedData,
        );
        if (result.success) {
          setShowEditConvertedModal(false);
          setEditingConvertedLeadId(null);
        }
      } catch (error) {
        console.error("Failed to update converted lead:", error);
      }
    }
  };

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    if (onOnboardLead && onboardingLeadId) {
      try {
        await onOnboardLead(onboardingLeadId, onboardingData);
        setOnboardingLeadId(null);
        setShowOnboardModal(false);

        // Automatically switch to Converted view for Leads
        setLeadView("Converted");

        setOnboardingData({
          name: "",
          email: "",
          phone: "",
          clientType: "New",
          status: "Active",
          projectName: "",
          projectStatus: "In Progress",
          projectCategory: 1,
          projectPriority: "Medium",
          projectDescription: "",
          country: "",
          state: "",
          currency: "",
          organisationName: "",
          clientStatus: "Active",
        });
      } catch (error) {
        console.error("Failed to onboard lead:", error);
      }
    }
  };

  const filteredLeads = (leads || []).filter((lead) => {
    // Skip invalid leads
    if (!lead || typeof lead !== "object") return false;

    const matchesSearch =
      (lead.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company || "").toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = filterStatus === "All" || lead.status === filterStatus;
    let matchesLeadType = true;
    let matchesCategory = true;

    // Sub-filter by Lead View (Pending, Converted, Dismissed)
    if (leadView === "Pending") {
      // Show leads that are not converted and not dismissed
      // Hot, Warm, Cold statuses should appear here
      if (lead.isConverted || lead.status === "Dismissed") return false;
    } else if (leadView === "Converted") {
      // Show only converted leads
      if (!lead.isConverted || lead.status === "Dismissed") return false;
    } else if (leadView === "Dismissed") {
      // Show only dismissed leads - strict check
      if (lead.status !== "Dismissed") return false;
    }

    matchesLeadType =
      leadTypeFilter === "All" || lead.leadType === leadTypeFilter;

    // Filter by category (Tech/Media/Both)
    matchesCategory =
      categoryFilter === "All" ||
      (lead.projectCategory || 1) === categoryFilter;

    // Date Range Filter
    if (startDate || endDate) {
      const joinedDate = new Date(lead.joinedDate);
      if (startDate && joinedDate < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (joinedDate > end) return false;
      }
    }

    return matchesSearch && matchesStatus && matchesLeadType && matchesCategory;
  });

  const renderContactDetails = (lead) => {
    if (!lead.phone && !lead.email) return "N/A";

    const countryInput = (lead.country || "").trim();
    let countryCode = "";

    if (countryInput) {
      const countryObj = countries.find(
        (c) =>
          c.name.toLowerCase() === countryInput.toLowerCase() ||
          c.code === countryInput ||
          c.code.replace("+", "") === countryInput.replace("+", ""),
      );
      countryCode = countryObj ? countryObj.code : countryInput;
    }

    let phone = (lead.phone || "").trim();
    if (countryCode) {
      const plainCountryCode = countryCode.replace("+", "");
      const cleanPhone = phone.replace("+", "").replace(/\s/g, "");

      if (cleanPhone.startsWith(plainCountryCode)) {
        // Remove country code from display phone if it's already there
        // This handles "+91987...", "91987...", "+91 987...", etc.
        if (phone.startsWith(countryCode)) {
          phone = phone.slice(countryCode.length).trim();
        } else if (phone.startsWith(plainCountryCode)) {
          phone = phone.slice(plainCountryCode.length).trim();
        } else if (
          phone.startsWith("+") &&
          phone.slice(1).trim().startsWith(plainCountryCode)
        ) {
          // Handles "+ 91 987..."
          const afterPlus = phone.slice(1).trim();
          phone = afterPlus.slice(plainCountryCode.length).trim();
        }
      }
    }

    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-2 text-primary">
          <Phone size={12} className="text-secondary" />
          <span className="text-xs font-bold whitespace-nowrap">
            {countryCode ? `${countryCode} ` : ""}
            {phone || "N/A"}
          </span>
        </div>
        {lead.email && (
          <div className="flex items-center gap-2 text-slate-400 mt-1">
            <Mail size={12} />
            <span className="text-[10px] font-bold truncate max-w-[150px]">
              {lead.email}
            </span>
          </div>
        )}
      </div>
    );
  };

  const getStatusBadge = (lead) => {
    // For leads with status "Lead", show their leadType (Hot/Warm/Cold)
    if (lead.status === "Lead" && lead.leadType) {
      switch (lead.leadType) {
        case "Hot":
          return {
            label: "Hot",
            className: "bg-error/10 text-error border-error/20",
            icon: <Flame size={12} strokeWidth={3} />,
          };
        case "Warm":
          return {
            label: "Warm",
            className: "bg-warning/10 text-warning border-warning/20",
            icon: <Sun size={12} strokeWidth={3} />,
          };
        case "Cold":
          return {
            label: "Cold",
            className: "bg-info/10 text-info border-info/20",
            icon: <Snowflake size={12} strokeWidth={3} />,
          };
        default:
          // Fallback if leadType exists but doesn't match
          return {
            label: lead.leadType,
            className: "bg-primary/10 text-primary border-primary/20",
            icon: null,
          };
      }
    }

    // For converted leads
    if (lead.isConverted && lead.leadType) {
      switch (lead.leadType) {
        case "Hot":
          return {
            label: "Hot",
            className: "bg-error/10 text-error border-error/20",
            icon: <Flame size={12} strokeWidth={3} />,
          };
        case "Warm":
          return {
            label: "Warm",
            className: "bg-warning/10 text-warning border-warning/20",
            icon: <Sun size={12} strokeWidth={3} />,
          };
        case "Cold":
          return {
            label: "Cold",
            className: "bg-info/10 text-info border-info/20",
            icon: <Snowflake size={12} strokeWidth={3} />,
          };
        default:
          return {
            label: lead.leadType || "Converted",
            className: "bg-success/10 text-success border-success/20",
            icon: null,
          };
      }
    }

    // For other statuses (Active, Pending, Churned, Inactive, Dismissed)
    switch (lead.status) {
      case "Lead":
        return {
          label: "Lead",
          className: "bg-info/10 text-info border-info/20",
          icon: null,
        };
      case "Active":
        return {
          label: "Active",
          className: "bg-success/10 text-success border-success/20",
          icon: null,
        };
      case "Pending":
        return {
          label: "Pending",
          className: "bg-slate-100 text-slate-500 border-slate-200",
          icon: null,
        };
      case "Churned":
        return {
          label: "Churned",
          className: "bg-slate-200 text-slate-400 border-slate-300",
          icon: null,
        };
      case "Inactive":
        return {
          label: "Inactive",
          className: "bg-slate-100 text-slate-400 border-slate-200",
          icon: null,
        };
      case "Dismissed":
        return {
          label: "Dismissed",
          className: "bg-slate-100 text-slate-400 border-slate-200",
          icon: <UserX size={12} />,
        };
      default:
        return {
          label: lead.status,
          className: "bg-slate-100 text-slate-700 border-slate-200",
          icon: null,
        };
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onAddLead) {
      const submissionData = {
        ...formData,
        company: formData.company || "",
        industry: formData.industry || "Unknown",
      };
      onAddLead(submissionData);
      setShowAddModal(false);
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        status: "Lead",
        leadType: "Warm",
        industry: "",
        notes: "",
        projectName: "",
        projectStatus: "Planning",
        projectCategory: 1, // Changed to numeric ID
        projectPriority: "Medium",
        projectDescription: "",
        country: "",
      });
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <div className="space-y-5 animate-fade-in w-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="max-w-2xl">
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-primary tracking-tight mb-2">
              Leads
            </h2>
            <p className="text-xs md:text-sm text-textMuted font-medium leading-relaxed">
              Manage your network of leads and strategic partnerships.
            </p>
          </div>
          <div className="w-full lg:w-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-2xl hover:bg-slate-800 transition-all text-[11px] font-bold  tracking-wider shadow-lg active:scale-95 group"
            >
              <Plus
                size={16}
                strokeWidth={2.5}
                className="group-hover:rotate-90 transition-transform"
              />
              Add Lead
            </button>
          </div>
        </div>

        {/* Control Bar */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-nowrap gap-2 w-full items-center overflow-x-auto no-scrollbar">
            {/* 1. Search Bar */}
            <div className="relative min-w-[200px] flex-[1.5] shrink-0">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder={`Search leads...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-[38px] pl-11 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary transition-all"
              />
            </div>

            <div className="min-w-[160px] flex-1 shrink-0 relative z-50">
              <button
                ref={tierButtonRef}
                onClick={() => setIsTierDropdownOpen(!isTierDropdownOpen)}
                className="w-full h-[38px] flex items-center justify-between gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold  tracking-widest text-[#18254D] hover:bg-white hover:border-slate-200 transition-all shadow-sm shadow-slate-200/50 group"
              >
                <span>
                  {leadTypeFilter === "All"
                    ? "All Lead Status"
                    : leadTypeFilter}
                </span>
                <ChevronDown
                  size={16}
                  strokeWidth={2.5}
                  className={`transition-transform duration-300 ${isTierDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isTierDropdownOpen &&
                createPortal(
                  <>
                    <div
                      className="fixed inset-0 z-[9998]"
                      onClick={() => setIsTierDropdownOpen(false)}
                    />
                    <div
                      className="tier-dropdown bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[9999] animate-fade-in-up origin-top"
                      style={tierDropdownStyle}
                    >
                      {["All", "Hot", "Warm", "Cold"].map((tier) => (
                        <button
                          key={tier}
                          onClick={() => {
                            setLeadTypeFilter(tier);
                            setIsTierDropdownOpen(false);
                          }}
                          className={`w-full text-left px-5 py-4 text-[10px] font-bold  tracking-wider transition-colors ${
                            tier === "All"
                              ? "bg-[#18254D] text-white"
                              : leadTypeFilter === tier
                                ? "bg-slate-100 text-[#18254D]"
                                : "text-[#18254D] hover:bg-slate-50"
                          }`}
                        >
                          {tier === "All" ? "All Tiers" : tier}
                        </button>
                      ))}
                    </div>
                  </>,
                  document.body,
                )}
            </div>

            {/* Category Dropdown */}
            <div className="min-w-[160px] flex-1 shrink-0 relative z-50">
              <button
                ref={categoryButtonRef}
                onClick={() =>
                  setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                }
                className="w-full h-[38px] flex items-center justify-between gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold  tracking-widest text-[#18254D] hover:bg-white hover:border-slate-200 transition-all shadow-sm shadow-slate-200/50 group"
              >
                <span>
                  {categoryFilter === "All"
                    ? "All Categories"
                    : CATEGORY_MAP[categoryFilter]}
                </span>
                <ChevronDown
                  size={16}
                  strokeWidth={2.5}
                  className={`transition-transform duration-300 ${isCategoryDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isCategoryDropdownOpen &&
                createPortal(
                  <>
                    <div
                      className="fixed inset-0 z-[9998]"
                      onClick={() => setIsCategoryDropdownOpen(false)}
                    />
                    <div
                      className="category-dropdown bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[9999] animate-fade-in-up origin-top"
                      style={categoryDropdownStyle}
                    >
                      {["All", 1, 2, 3].map((catId) => (
                        <button
                          key={catId}
                          onClick={() => {
                            setCategoryFilter(catId);
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-[10px] font-bold  tracking-wider transition-colors ${
                            catId === "All"
                              ? categoryFilter === "All"
                                ? "bg-[#18254D] text-white"
                                : "text-[#18254D] hover:bg-slate-50"
                              : categoryFilter === catId
                                ? "bg-slate-100 text-[#18254D]"
                                : "text-[#18254D] hover:bg-slate-50"
                          }`}
                        >
                          {catId === "All"
                            ? "All Categories"
                            : CATEGORY_MAP[catId]}
                        </button>
                      ))}
                    </div>
                  </>,
                  document.body,
                )}
            </div>

            {/* Date Filters */}
            <div className="min-w-[140px] flex-1 shrink-0 relative z-50">
              <DatePicker
                label="From"
                value={startDate}
                onChange={setStartDate}
              />
            </div>

            <div className="min-w-[140px] flex-1 shrink-0 relative z-50">
              <DatePicker label="To" value={endDate} onChange={setEndDate} />
            </div>
          </div>
        </div>

        {/* Lead View Toggles */}
        <div className="flex justify-center my-4 overflow-x-auto">
          <div className="inline-flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200 shadow-sm leading-none h-[42px] items-center gap-1 whitespace-nowrap">
            {["Pending", "Converted", "Dismissed"].map((view) => {
              const colors = {
                Pending: {
                  active: "text-blue-600 border-blue-100 bg-white",
                  hover: "hover:text-blue-500 hover:bg-white/50",
                },
                Converted: {
                  active: "text-emerald-600 border-emerald-100 bg-white",
                  hover: "hover:text-emerald-500 hover:bg-white/50",
                },
                Dismissed: {
                  active: "text-rose-600 border-rose-100 bg-white",
                  hover: "hover:text-rose-500 hover:bg-white/50",
                },
              };
              const activeColor = colors[view].active;
              const hoverColor = colors[view].hover;

              return (
                <button
                  key={view}
                  onClick={() => setLeadView(view)}
                  className={`px-5 h-full rounded-xl text-[10px] font-bold  tracking-wider transition-all flex items-center justify-center min-w-[100px] border border-transparent whitespace-nowrap ${
                    leadView === view
                      ? `${activeColor} shadow-md`
                      : `text-slate-400 ${hoverColor}`
                  }`}
                >
                  {view}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main List */}
        <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400  tracking-widest border-b border-slate-100">
                    Lead Name
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400  tracking-widest border-b border-slate-100">
                    Contact Details
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400  tracking-widest border-b border-slate-100">
                    Lead Category
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400  tracking-widest border-b border-slate-100">
                    Control
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => {
                  const status = getStatusBadge(lead);
                  return (
                    <tr
                      key={lead.id}
                      onClick={() =>
                        lead.status !== "Dismissed" && onSelectLead(lead)
                      }
                      className={`group transition-all ${
                        lead.status === "Dismissed"
                          ? "bg-slate-50/30 opacity-80 cursor-default"
                          : "hover:bg-slate-50/50 cursor-pointer"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-6">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl border-2 border-slate-50 shadow-lg shrink-0">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex items-center gap-4">
                            <div className="font-bold text-sm text-primary tracking-tight leading-none group-hover:text-secondary transition-colors">
                              {lead.name}
                            </div>
                            {lead.status === "Lead" ? (
                              <span
                                className={`px-3 py-1 rounded-xl text-[9px] font-bold border flex items-center gap-2 shadow-sm transition-all shrink-0 ${status.className}`}
                              >
                                {status.icon}
                                {status.label}
                              </span>
                            ) : (
                              <span
                                className={`px-2 py-0.5 rounded-lg text-[9px] font-bold tracking-widest shrink-0 ${lead.status === "Active" ? "bg-success/10 text-success border border-success/20" : "bg-slate-100 text-slate-400 border border-slate-200"}`}
                              >
                                {lead.status || "Active"}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {renderContactDetails(lead)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${lead.projectCategory === 1 ? "bg-secondary" : lead.projectCategory === 2 ? "bg-blue-400" : lead.projectCategory === 3 ? "bg-purple-400" : "bg-slate-300"}`}
                          />
                          <span className="text-sm font-bold text-primary">
                            {CATEGORY_MAP[lead.projectCategory] ||
                              lead.industry ||
                              "Other"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div
                          className="flex justify-end gap-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {leadView === "Converted" ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditConvertedClick(lead);
                              }}
                              className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 transition-all active:scale-90 shadow-sm"
                              title="Edit Details"
                            >
                              <Pencil size={18} />
                            </button>
                          ) : (
                            <>
                              {onOnboardLead && lead.status === "Lead" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOnboardingLeadId(lead.id);
                                    setOnboardingData({
                                      name: lead.name,
                                      email: lead.email,
                                      phone: lead.phone,
                                      clientType: "New",
                                      status: "Active",
                                      projectName: "",
                                      projectCategory: 1,
                                      projectPriority: "High",
                                      projectDescription: "",
                                      onboardingDate: new Date()
                                        .toISOString()
                                        .split("T")[0],
                                      deadline: "",
                                      scopeDocument: "",
                                      projectStatus: "Planning",
                                      clientStatus: "Active",
                                    });
                                    setShowOnboardModal(true);
                                  }}
                                  className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-50 transition-all active:scale-90 shadow-sm"
                                  title="Convert to Client"
                                >
                                  <UserCheck size={18} />
                                </button>
                              )}
                              {onDismissLead &&
                                (lead.status === "Lead" || lead.isConverted) &&
                                lead.status !== "Dismissed" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDismissLead(lead.id);
                                    }}
                                    className="p-2.5 bg-amber-50/50 border border-amber-200/50 rounded-lg text-amber-500/70 hover:text-amber-600 hover:border-amber-500 hover:bg-amber-50 transition-all active:scale-90 shadow-sm"
                                    title="Dismiss Lead"
                                  >
                                    <UserX size={18} />
                                  </button>
                                )}
                              {onRestoreLead && lead.status === "Dismissed" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRestoreLead(lead.id);
                                  }}
                                  className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 transition-all active:scale-90 shadow-sm"
                                  title="Restore Lead"
                                >
                                  <RotateCcw size={18} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-10 py-32 text-center">
                      <div className="w-14 h-14 bg-slate-50 text-slate-200 p-4 rounded-xl mb-4 shadow-inner flex items-center justify-center mx-auto">
                        <Search size={32} />
                      </div>
                      <p className="text-[11px] font-bold text-primary  tracking-[0.4em]">
                        Zero Results
                      </p>
                      <p className="text-sm font-medium text-slate-400 mt-2">
                        No matching records detected in this segment.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card List View */}
        <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLeads.map((lead) => {
            const status = getStatusBadge(lead);
            return (
              <div
                key={lead.id}
                onClick={() =>
                  lead.status !== "Dismissed" && onSelectLead(lead)
                }
                className={`bg-white p-4 rounded-2xl border transition-all ${
                  lead.status === "Dismissed"
                    ? "border-slate-100 opacity-80 shadow-none cursor-default"
                    : "border-slate-200 shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg border-2 border-slate-50 shadow-md shrink-0">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-primary truncate">
                        {lead.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`px-2 py-0.5 text-[8px] font-bold tracking-widest border rounded-md ${lead.projectCategory === 1 ? "bg-secondary/10 text-secondary border-secondary/30" : lead.projectCategory === 2 ? "bg-warning/10 text-warning border-warning/30" : "bg-purple-500/10 text-purple-500 border-purple-500/30"}`}
                        >
                          {CATEGORY_MAP[lead.projectCategory] ||
                            lead.projectCategory ||
                            "Tech"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-lg text-[9px] font-bold border flex items-center gap-1.5 shadow-sm ${status.className}`}
                  >
                    {status.icon}
                    {status.label}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  {lead.status === "Lead" ? (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-xs text-primary/80 font-medium italic line-clamp-2">
                        "{lead.notes || lead.industry || "No notes available"}"
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {renderContactDetails(lead)}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLead(lead);
                      }}
                      className="flex items-center gap-1 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-secondary/80 transition-colors"
                    >
                      View Details
                      <ChevronRight size={14} />
                    </button>
                  </div>
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {leadView === "Converted" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditConvertedClick(lead);
                        }}
                        className="p-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-100 transition-all active:scale-90"
                      >
                        <Pencil size={16} />
                      </button>
                    ) : (
                      <>
                        {onOnboardLead && lead.status === "Lead" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOnboardingLeadId(lead.id);
                              setOnboardingData({
                                name: lead.name,
                                email: lead.email,
                                phone: lead.phone,
                                clientType: "New",
                                status: "Active",
                                projectName: "",
                                projectDescription: "",
                                onboardingDate: new Date()
                                  .toISOString()
                                  .split("T")[0],
                                deadline: "",
                                scopeDocument: "",
                                projectStatus: "Planning",
                                clientStatus: "Active",
                              });
                              setShowOnboardModal(true);
                            }}
                            className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-all active:scale-90"
                          >
                            <UserCheck size={16} />
                          </button>
                        )}
                        {onDismissLead &&
                          (lead.status === "Lead" || lead.isConverted) &&
                          lead.status !== "Dismissed" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDismissLead(lead.id);
                              }}
                              className="p-2 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg hover:bg-amber-100 transition-all active:scale-90"
                            >
                              <UserX size={16} />
                            </button>
                          )}
                        {onRestoreLead && lead.status === "Dismissed" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRestoreLead(lead.id);
                            }}
                            className="p-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-100 transition-all active:scale-90"
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredLeads.length === 0 && (
            <div className="col-span-full text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <p className="text-sm font-bold text-slate-400">
                No leads found matching your filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in my-auto flex flex-col">
            <div className="bg-primary p-4 text-white relative">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={18} strokeWidth={3} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-secondary/10 rounded-xl flex items-center justify-center shadow-lg border border-secondary/20">
                  <UserPlus
                    size={18}
                    className="text-secondary"
                    strokeWidth={3}
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tighter leading-none">
                    New Lead
                  </h3>
                  <p className="text-slate-400 text-[9px] font-bold  tracking-widest mt-0.5">
                    Lead Details
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-4 md:p-5 space-y-4 max-h-[65vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* ADD LEAD FIELDS */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    LEAD NAME
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    EMAIL ID
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="rahul.sharma@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <SearchableDropdown
                  label="COUNTRY"
                  options={countries}
                  value={formData.country}
                  onChange={(val) => setFormData({ ...formData, country: val })}
                  placeholder="Select Country"
                />

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    PHONE NUMBER
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    WEBSITE URL (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. www.company.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1 uppercase">
                    LEAD CATEGORY
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setIsAddCategoryDropdownOpen(!isAddCategoryDropdownOpen)
                      }
                      className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:border-secondary transition-all"
                    >
                      <span className="text-primary truncate">
                        {CATEGORY_MAP[formData.projectCategory] ||
                          "Select Category"}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 transition-transform ${
                          isAddCategoryDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isAddCategoryDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-[80]"
                          onClick={() => setIsAddCategoryDropdownOpen(false)}
                        />
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[90] animate-fade-in-up origin-top">
                          <div className="bg-[#18254D] px-4 py-3 border-b border-white/10">
                            <p className="text-[9px] font-bold text-white/50  tracking-widest">
                              Select Category
                            </p>
                          </div>
                          {[1, 2, 3].map((catId) => (
                            <button
                              key={catId}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  projectCategory: catId,
                                });
                                setIsAddCategoryDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-[10px] font-bold  tracking-widest transition-colors ${
                                formData.projectCategory === catId
                                  ? "bg-slate-100 text-secondary"
                                  : "text-[#18254D] hover:bg-slate-50"
                              }`}
                            >
                              {CATEGORY_MAP[catId]}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1 uppercase">
                    LEAD STATUS
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setIsAddStatusDropdownOpen(!isAddStatusDropdownOpen)
                      }
                      className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:border-secondary transition-all"
                    >
                      <span className="text-primary truncate">
                        {formData.leadType || "Select Status"}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 transition-transform ${
                          isAddStatusDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isAddStatusDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-[80]"
                          onClick={() => setIsAddStatusDropdownOpen(false)}
                        />
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[90] animate-fade-in-up origin-top">
                          <div className="bg-[#18254D] px-4 py-3 border-b border-white/10">
                            <p className="text-[9px] font-bold text-white/50  tracking-widest">
                              Select Status
                            </p>
                          </div>
                          {["Hot", "Warm", "Cold"].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  leadType: status,
                                });
                                setIsAddStatusDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-[10px] font-bold  tracking-widest transition-colors ${
                                formData.leadType === status
                                  ? "bg-slate-100 text-secondary"
                                  : "text-[#18254D] hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {status === "Hot" && (
                                  <Flame size={12} className="text-error" />
                                )}
                                {status === "Warm" && (
                                  <Sun size={12} className="text-warning" />
                                )}
                                {status === "Cold" && (
                                  <Snowflake size={12} className="text-info" />
                                )}
                                <span>{status}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    MESSAGE
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Interested in cloud migration services..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium resize-none shadow-sm"
                    value={formData.notes || formData.industry}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        notes: e.target.value,
                        industry: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#18254D] text-white rounded-2xl text-[11px] font-bold  tracking-[0.25em] shadow-xl active:scale-[0.97] transition-all hover:bg-[#1e2e5e] hover:shadow-2xl flex items-center justify-center gap-3 group/btn"
                >
                  <UserPlus
                    size={20}
                    className="group-hover/btn:translate-x-1 transition-transform"
                  />
                  <span>ADD LEAD</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Onboard Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in my-auto flex flex-col">
            <div className="bg-primary p-4 text-white relative">
              <button
                onClick={() => setShowOnboardModal(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={18} strokeWidth={3} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-secondary/10 rounded-xl flex items-center justify-center shadow-lg border border-secondary/20">
                  <UserCheck
                    size={18}
                    className="text-secondary"
                    strokeWidth={3}
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tighter leading-none">
                    Convert to Client
                  </h3>
                  <p className="text-secondary text-[9px] font-bold  tracking-widest mt-0.5">
                    Onboard Lead to Active Status
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleOnboardSubmit} className="p-5 space-y-4">
              {/* CLIENT DETAILS HEADING */}
              <div className="flex items-center gap-3 pt-2">
                <div className="h-[2px] w-8 bg-secondary rounded-full" />
                <h4 className="text-[14px] font-bold text-[#18254D]  tracking-[0.2em]">
                  Client Details
                </h4>
                <div className="h-[2px] flex-1 bg-slate-100 rounded-full" />
              </div>

              <div className="space-y-3 pb-2">
                <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                  CLIENT TYPE
                </label>
                <div className="grid grid-cols-1 gap-4">
                  <label className="flex-1 flex items-center gap-3 p-4 bg-white border-2 border-[#18254D] rounded-xl cursor-default transition-all group shadow-sm">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        checked={true}
                        readOnly
                        className="peer appearance-none w-6 h-6 border-2 border-[#18254D] rounded-full transition-all"
                      />
                      <div className="absolute w-3 h-3 bg-[#18254D] rounded-full" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#18254D] leading-none">
                        New Client
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold mt-1">
                        First-time engagement
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    CLIENT NAME
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Anand Kumar"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium"
                    value={onboardingData.name}
                    onChange={(e) =>
                      setOnboardingData({
                        ...onboardingData,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    EMAIL ID
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="e.g. anand.kumar@fintech.in"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium"
                    value={onboardingData.email}
                    onChange={(e) =>
                      setOnboardingData({
                        ...onboardingData,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    PHONE NUMBER
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium"
                    value={onboardingData.phone}
                    onChange={(e) =>
                      setOnboardingData({
                        ...onboardingData,
                        phone: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    ORGANISATION NAME
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium"
                    value={onboardingData.organisationName}
                    onChange={(e) =>
                      setOnboardingData({
                        ...onboardingData,
                        organisationName: e.target.value,
                      })
                    }
                  />
                </div>

                <SearchableDropdown
                  label="CLIENT COUNTRY"
                  options={countries.map((c) => ({
                    name: c.name,
                    code: c.name,
                  }))}
                  value={onboardingData.country}
                  onChange={(val) => {
                    const countryCurrency = countryToCurrency[val];
                    setOnboardingData({
                      ...onboardingData,
                      country: val,
                      currency: countryCurrency
                        ? countryCurrency.code
                        : onboardingData.currency,
                      state: "", // Reset state when country changes
                    });
                  }}
                  placeholder="Select Country"
                />

                {onboardingData.country === "India" ? (
                  <SearchableDropdown
                    label="CLIENT STATE"
                    options={indianStates}
                    value={onboardingData.state}
                    onChange={(val) =>
                      setOnboardingData({ ...onboardingData, state: val })
                    }
                    placeholder="Select State"
                  />
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                      CLIENT STATE
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. California"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium"
                      value={onboardingData.state}
                      onChange={(e) =>
                        setOnboardingData({
                          ...onboardingData,
                          state: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <SearchableDropdown
                  label="CLIENT CURRENCY"
                  options={commonCurrencies.map((c) => ({
                    name: `${c.code} (${c.symbol})`,
                    code: c.code,
                  }))}
                  value={onboardingData.currency}
                  onChange={(val) =>
                    setOnboardingData({ ...onboardingData, currency: val })
                  }
                  placeholder="Select Currency"
                />

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1 uppercase">
                    CLIENT STATUS
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setIsOnboardClientStatusDropdownOpen(
                          !isOnboardClientStatusDropdownOpen,
                        )
                      }
                      className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:border-secondary transition-all"
                    >
                      <span className="text-primary truncate">
                        {onboardingData.clientStatus}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 transition-transform ${
                          isOnboardClientStatusDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOnboardClientStatusDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-[80]"
                          onClick={() =>
                            setIsOnboardClientStatusDropdownOpen(false)
                          }
                        />
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[90] animate-fade-in-up origin-top">
                          <div className="bg-[#18254D] px-4 py-3 border-b border-white/10">
                            <p className="text-[9px] font-bold text-white/50  tracking-widest">
                              Select Status
                            </p>
                          </div>
                          {["Active", "Inactive"].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => {
                                setOnboardingData({
                                  ...onboardingData,
                                  clientStatus: status,
                                });
                                setIsOnboardClientStatusDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-[10px] font-bold  tracking-widest transition-colors ${
                                onboardingData.clientStatus === status
                                  ? "bg-slate-100 text-secondary"
                                  : "text-[#18254D] hover:bg-slate-50"
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* PROJECT DETAILS HEADING */}
              <div className="flex items-center gap-3 pt-6">
                <div className="h-[2px] w-8 bg-secondary rounded-full" />
                <h4 className="text-[14px] font-bold text-[#18254D]  tracking-[0.2em]">
                  Project Details
                </h4>
                <div className="h-[2px] flex-1 bg-slate-100 rounded-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    PROJECT NAME
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Route Optimization Platform"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium"
                    value={onboardingData.projectName}
                    onChange={(e) =>
                      setOnboardingData({
                        ...onboardingData,
                        projectName: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    PROJECT DESCRIPTION
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Focus on UI/UX redesign and performance optimization..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium resize-none shadow-sm"
                    value={onboardingData.projectDescription}
                    onChange={(e) =>
                      setOnboardingData({
                        ...onboardingData,
                        projectDescription: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    PROJECT CATEGORY
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((catId) => (
                      <button
                        key={catId}
                        type="button"
                        onClick={() =>
                          setOnboardingData({
                            ...onboardingData,
                            projectCategory: catId,
                          })
                        }
                        className={`flex-1 flex items-center justify-center p-2.5 border-2 rounded-xl transition-all font-bold  text-[10px] tracking-widest ${
                          onboardingData.projectCategory === catId
                            ? "border-primary bg-primary/5 text-primary shadow-sm"
                            : "border-slate-100 text-slate-400 hover:border-slate-200"
                        }`}
                      >
                        {CATEGORY_MAP[catId]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    PROJECT STATUS
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setIsOnboardStatusDropdownOpen(
                          !isOnboardStatusDropdownOpen,
                        )
                      }
                      className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium shadow-sm hover:border-secondary transition-all"
                    >
                      <span className="text-primary">
                        {onboardingData.projectStatus}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 transition-transform ${
                          isOnboardStatusDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOnboardStatusDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-[80]"
                          onClick={() => setIsOnboardStatusDropdownOpen(false)}
                        />
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[90] animate-fade-in-up origin-top">
                          <div className="bg-[#18254D] px-4 py-3 border-b border-white/10">
                            <p className="text-[9px] font-bold text-white/50  tracking-widest">
                              Select Status
                            </p>
                          </div>
                          {["Hold", "In Progress", "Completed"].map(
                            (status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => {
                                  setOnboardingData({
                                    ...onboardingData,
                                    projectStatus: status,
                                  });
                                  setIsOnboardStatusDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-[10px] font-bold  tracking-widest transition-colors ${
                                  onboardingData.projectStatus === status
                                    ? "bg-slate-100 text-secondary"
                                    : "text-[#18254D] hover:bg-slate-50"
                                }`}
                              >
                                {status}
                              </button>
                            ),
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    PROJECT PRIORITY
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setIsOnboardPriorityDropdownOpen(
                          !isOnboardPriorityDropdownOpen,
                        )
                      }
                      className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium shadow-sm hover:border-secondary transition-all"
                    >
                      <span className="text-primary">
                        {onboardingData.projectPriority}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 transition-transform ${
                          isOnboardPriorityDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOnboardPriorityDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-[80]"
                          onClick={() =>
                            setIsOnboardPriorityDropdownOpen(false)
                          }
                        />
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[90] animate-fade-in-up origin-top">
                          <div className="bg-[#18254D] px-4 py-3 border-b border-white/10">
                            <p className="text-[9px] font-bold text-white/50  tracking-widest">
                              Select Priority
                            </p>
                          </div>
                          {["High", "Medium", "Low"].map((level) => (
                            <button
                              key={level}
                              type="button"
                              onClick={() => {
                                setOnboardingData({
                                  ...onboardingData,
                                  projectPriority: level,
                                });
                                setIsOnboardPriorityDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-[10px] font-bold  tracking-widest transition-colors ${
                                onboardingData.projectPriority === level
                                  ? "bg-slate-100 text-secondary"
                                  : "text-[#18254D] hover:bg-slate-50"
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1 flex items-center gap-1.5">
                    PROJECT BUDGET (
                    {onboardingData.currency === "USD" ? "USD" : "INR"})
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      {onboardingData.currency === "USD" ? "$" : "₹"}
                    </div>
                    <input
                      type="text"
                      placeholder={
                        onboardingData.currency === "USD"
                          ? "e.g. 5,000"
                          : "e.g. 5,00,000"
                      }
                      className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium shadow-sm"
                      value={onboardingData.projectBudget}
                      onChange={(e) =>
                        setOnboardingData({
                          ...onboardingData,
                          projectBudget: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#18254D] tracking-widest ml-1">
                    ONBOARDING DATE
                  </label>
                  <DatePicker
                    value={onboardingData.onboardingDate}
                    onChange={(val) =>
                      setOnboardingData({
                        ...onboardingData,
                        onboardingDate: val,
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#18254D] tracking-widest ml-1 whitespace-nowrap">
                    DEADLINE (TENTATIVE)
                  </label>
                  <DatePicker
                    value={onboardingData.deadline}
                    onChange={(val) =>
                      setOnboardingData({
                        ...onboardingData,
                        deadline: val,
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    SCOPE DOCUMENT
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setOnboardingData({
                            ...onboardingData,
                            scopeDocument: file,
                          });
                        }
                      }}
                    />
                    <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl group-hover:border-secondary group-hover:bg-secondary/5 transition-all flex items-center gap-3 shadow-sm">
                      <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <Upload size={16} className="text-secondary" />
                      </div>
                      <span
                        className={`text-sm font-bold ${onboardingData.scopeDocument ? "text-[#18254D]" : "text-slate-400"}`}
                      >
                        {onboardingData.scopeDocument instanceof File
                          ? onboardingData.scopeDocument.name
                          : typeof onboardingData.scopeDocument === "string" &&
                              onboardingData.scopeDocument
                            ? onboardingData.scopeDocument
                            : "Upload scope document (PDF)"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#18254D] text-white rounded-2xl text-[11px] font-bold  tracking-[0.25em] shadow-xl active:scale-[0.97] transition-all hover:bg-[#1e2e5e] hover:shadow-2xl flex items-center justify-center gap-3 group/btn"
                >
                  <UserCheck
                    size={20}
                    className="group-hover/btn:translate-x-1 transition-transform"
                  />
                  <span>CONVERT TO CLIENT</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Converted Lead Modal */}
      {showEditConvertedModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in my-auto flex flex-col">
            <div className="bg-primary p-4 text-white relative">
              <button
                onClick={() => setShowEditConvertedModal(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={18} strokeWidth={3} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-secondary/10 rounded-xl flex items-center justify-center shadow-lg border border-secondary/20">
                  <Pencil
                    size={18}
                    className="text-secondary"
                    strokeWidth={3}
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tighter leading-none">
                    Edit Lead
                  </h3>
                  <p className="text-slate-400 text-[9px] font-bold  tracking-widest mt-0.5">
                    Lead Details
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleEditConvertedSubmit}
              className="p-4 md:p-5 space-y-4 max-h-[65vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* EDIT LEAD FIELDS (MATCHING NEW LEAD MODAL) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    LEAD NAME
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium"
                    value={editConvertedData.name}
                    onChange={(e) =>
                      setEditConvertedData({
                        ...editConvertedData,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    EMAIL ID
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="rahul.sharma@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium"
                    value={editConvertedData.email}
                    onChange={(e) =>
                      setEditConvertedData({
                        ...editConvertedData,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                <SearchableDropdown
                  label="COUNTRY"
                  options={countries}
                  value={editConvertedData.country}
                  onChange={(val) =>
                    setEditConvertedData({ ...editConvertedData, country: val })
                  }
                  placeholder="Select Country"
                />

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    PHONE NUMBER
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium"
                    value={editConvertedData.phone}
                    onChange={(e) =>
                      setEditConvertedData({
                        ...editConvertedData,
                        phone: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    WEBSITE URL (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. www.company.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium"
                    value={editConvertedData.website}
                    onChange={(e) =>
                      setEditConvertedData({
                        ...editConvertedData,
                        website: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1 uppercase">
                    LEAD CATEGORY
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setIsEditCategoryDropdownOpen(
                          !isEditCategoryDropdownOpen,
                        )
                      }
                      className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:border-secondary transition-all"
                    >
                      <span className="text-primary truncate">
                        {CATEGORY_MAP[editConvertedData.projectCategory] ||
                          "Select Category"}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 transition-transform ${
                          isEditCategoryDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isEditCategoryDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-[80]"
                          onClick={() => setIsEditCategoryDropdownOpen(false)}
                        />
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[90] animate-fade-in-up origin-top edit-category-dropdown">
                          <div className="bg-[#18254D] px-4 py-3 border-b border-white/10">
                            <p className="text-[9px] font-bold text-white/50  tracking-widest">
                              Select Category
                            </p>
                          </div>
                          {[1, 2, 3].map((catId) => (
                            <button
                              key={catId}
                              type="button"
                              onClick={() => {
                                setEditConvertedData({
                                  ...editConvertedData,
                                  projectCategory: catId,
                                });
                                setIsEditCategoryDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-[10px] font-bold  tracking-widest transition-colors ${
                                editConvertedData.projectCategory === catId
                                  ? "bg-slate-100 text-secondary"
                                  : "text-[#18254D] hover:bg-slate-50"
                              }`}
                            >
                              {CATEGORY_MAP[catId]}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1 uppercase">
                    LEAD STATUS
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setIsEditStatusDropdownOpen(!isEditStatusDropdownOpen)
                      }
                      className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:border-secondary transition-all"
                    >
                      <span className="text-primary truncate">
                        {editConvertedData.leadType || "Select Status"}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 transition-transform ${
                          isEditStatusDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isEditStatusDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-[80]"
                          onClick={() => setIsEditStatusDropdownOpen(false)}
                        />
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[90] animate-fade-in-up origin-top edit-status-dropdown">
                          <div className="bg-[#18254D] px-4 py-3 border-b border-white/10">
                            <p className="text-[9px] font-bold text-white/50  tracking-widest">
                              Select Status
                            </p>
                          </div>
                          {["Converted"].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => {
                                setEditConvertedData({
                                  ...editConvertedData,
                                  leadType: status,
                                });
                                setIsEditStatusDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-[10px] font-bold  tracking-widest transition-colors ${
                                editConvertedData.leadType === status
                                  ? "bg-slate-100 text-secondary"
                                  : "text-[#18254D] hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {status === "Hot" && (
                                  <Flame size={12} className="text-error" />
                                )}
                                {status === "Warm" && (
                                  <Sun size={12} className="text-warning" />
                                )}
                                {status === "Cold" && (
                                  <Snowflake size={12} className="text-info" />
                                )}
                                {status === "Converted" && (
                                  <UserCheck
                                    size={12}
                                    className="text-success"
                                  />
                                )}
                                <span>{status}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    MESSAGE
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Interested in cloud migration services..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium resize-none shadow-sm"
                    value={editConvertedData.projectDescription}
                    onChange={(e) =>
                      setEditConvertedData({
                        ...editConvertedData,
                        projectDescription: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#18254D] text-white rounded-2xl text-[11px] font-bold  tracking-[0.25em] shadow-xl active:scale-[0.97] transition-all hover:bg-[#1e2e5e] hover:shadow-2xl flex items-center justify-center gap-3 group/btn"
                >
                  <Check size={20} />
                  <span>SAVE CHANGES</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFollowUpModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in my-auto flex flex-col">
            <div className="bg-primary p-4 text-white relative">
              <button
                onClick={() => setShowFollowUpModal(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={18} strokeWidth={3} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-400/20 rounded-xl flex items-center justify-center shadow-lg border border-indigo-400/30">
                  <MessageSquare
                    size={18}
                    className="text-indigo-300"
                    strokeWidth={2.5}
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tighter leading-none">
                    Follow Up
                  </h3>
                  <p className="text-slate-400 text-[9px] font-bold  tracking-widest mt-0.5">
                    {followUpLeadName}
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (followUpData.description && followUpLeadId) {
                  if (onAddActivity) {
                    const combinedDateTime = new Date(
                      `${followUpData.date}T${followUpData.time}`,
                    );
                    onAddActivity({
                      clientId: followUpLeadId,
                      type: followUpData.type,
                      description: followUpData.description,
                      date: combinedDateTime.toISOString(),
                    });
                  }
                  setShowFollowUpModal(false);
                  const lead = clients.find((c) => c.id === followUpLeadId);
                  if (lead) {
                    onSelectClient(lead, "activity");
                  }
                }
              }}
              className="p-5 space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary  tracking-widest ml-1">
                    Date
                  </label>
                  <DatePicker
                    value={followUpData.date}
                    onChange={(val) =>
                      setFollowUpData({
                        ...followUpData,
                        date: val,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary  tracking-widest ml-1">
                    Time
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="time"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 focus:outline-none text-sm font-medium"
                      value={followUpData.time}
                      onChange={(e) =>
                        setFollowUpData({
                          ...followUpData,
                          time: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary  tracking-widest ml-1">
                  Interaction Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["call", "email", "meeting"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setFollowUpData({
                          ...followUpData,
                          type: type,
                        })
                      }
                      className={`py-2.5 px-3 rounded-xl border text-[10px] font-bold  tracking-widest transition-all ${
                        followUpData.type === type
                          ? "bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-200"
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary  tracking-widest ml-1">
                  Follow Up Message
                </label>
                <textarea
                  required
                  placeholder="e.g. Discussed budget constraints and finalized timeline..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 focus:outline-none text-sm font-medium min-h-[100px] resize-none"
                  value={followUpData.description}
                  onChange={(e) =>
                    setFollowUpData({
                      ...followUpData,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-white rounded-2xl hover:bg-slate-800 text-[11px] font-bold  tracking-[0.3em] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
                >
                  <MessageSquare size={18} />
                  Save & View Conversations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadList;
