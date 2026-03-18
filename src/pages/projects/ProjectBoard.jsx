import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
// MOCK_PROJECTS and MOCK_CLIENTS are now passed as props
import {
  Calendar,
  IndianRupee,
  MoreVertical,
  Plus,
  Clock,
  UserPlus,
  X,
  Upload,
  ChevronDown,
  Tag,
  AlertCircle,
  CheckCircle,
  Zap,
  Monitor,
  Film,
  Search,
} from "lucide-react";
import DatePicker from "../../components/ui/DatePicker";
import {
  CATEGORY_MAP,
  REVERSE_CATEGORY_MAP,
} from "../../constants/categoryConstants";
import { countries } from "../../utils/countries";
import {
  indianStates,
  commonCurrencies,
  countryToCurrency,
} from "../../utils/locationData";
import SearchableDropdown from "../../components/common/SearchableDropdown";

const TECH_COLUMNS = [
  {
    id: "In Progress",
    title: "In Progress",
    color: "text-info",
    dotColor: "bg-info",
    activeTabBg: "bg-info/10",
    activeTabText: "text-info",
  },
  {
    id: "Hold",
    title: "Hold",
    color: "text-warning",
    dotColor: "bg-warning",
    activeTabBg: "bg-warning/10",
    activeTabText: "text-warning",
  },
  {
    id: "Completed",
    title: "Completed",
    color: "text-success",
    dotColor: "bg-success",
    activeTabBg: "bg-success/10",
    activeTabText: "text-success",
  },
];

const MEDIA_COLUMNS = [
  {
    id: "In Progress",
    title: "In Progress",
    color: "text-info",
    dotColor: "bg-info",
    activeTabBg: "bg-info/10",
    activeTabText: "text-info",
  },
  {
    id: "Hold",
    title: "Hold",
    color: "text-warning",
    dotColor: "bg-warning",
    activeTabBg: "bg-warning/10",
    activeTabText: "text-warning",
  },
  {
    id: "Completed",
    title: "Completed",
    color: "text-success",
    dotColor: "bg-success",
    activeTabBg: "bg-success/10",
    activeTabText: "text-success",
  },
];

const ALL_COLUMNS = [
  {
    id: "In Progress",
    title: "In Progress",
    color: "text-info",
    dotColor: "bg-info",
    activeTabBg: "bg-info/10",
    activeTabText: "text-info",
  },
  {
    id: "Hold",
    title: "Hold",
    color: "text-warning",
    dotColor: "bg-warning",
    activeTabBg: "bg-warning/10",
    activeTabText: "text-warning",
  },
  {
    id: "Completed",
    title: "Completed",
    color: "text-success",
    dotColor: "bg-success",
    activeTabBg: "bg-success/10",
    activeTabText: "text-success",
  },
];

const ProjectCard = ({
  project,
  clients,
  onEdit,
  onUpdateProject,
  availableStatuses,
  onSelectProject,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const client = clients.find((c) => c.id === project.clientId);

  const getPriorityStyles = (priority) => {
    switch (priority?.toLowerCase()) {
      case "critical":
        return {
          badge: "bg-error/10 text-error border-error/30",
          icon: AlertCircle,
          color: "text-error",
        };
      case "high":
        return {
          badge: "bg-warning/10 text-warning border-warning/30",
          icon: Zap,
          color: "text-warning",
        };
      case "medium":
        return {
          badge: "bg-secondary/10 text-secondary border-secondary/30",
          icon: CheckCircle,
          color: "text-secondary",
        };
      case "low":
        return {
          badge: "bg-info/10 text-info border-info/30",
          icon: Tag,
          color: "text-info",
        };
      default:
        return {
          badge: "bg-slate-100 text-slate-600 border-slate-200",
          icon: Tag,
          color: "text-slate-400",
        };
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-success/10 text-success border-success/30";
      case "in_progress":
      case "in progress":
        return "bg-warning/10 text-warning border-warning/30";
      case "on_hold":
      case "on hold":
      case "planning":
      case "pending":
        return "bg-info/10 text-info border-info/30";
      case "testing":
        return "bg-secondary/10 text-secondary border-secondary/30";
      case "live":
        return "bg-success/10 text-success border-success/30";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 1:
      case "tech":
        return "bg-secondary/10 text-secondary border-secondary/30";
      case 2:
      case "social media":
        return "bg-warning/10 text-warning border-warning/30";
      case 3:
      case "both":
        return "bg-purple-500/10 text-purple-500 border-purple-500/30";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const handleStatusUpdate = (newStatus) => {
    if (onUpdateProject) {
      // Calculate new progress based on status if needed
      let newProgress = project.progress;
      if (newStatus === "Live" || newStatus === "Completed") newProgress = 100;
      else if (newStatus === "Testing") newProgress = 75;
      else if (newStatus === "In Progress") newProgress = 40;
      else if (newStatus === "Planning" || newStatus === "Pending")
        newProgress = 10;

      onUpdateProject({
        ...project,
        status: newStatus,
        progress: newProgress,
      });
    }
    setIsMenuOpen(false);
  };

  const priorityStyle = getPriorityStyles(project.priority);
  const PriorityIcon = priorityStyle.icon;

  return (
    <div
      onClick={() => onSelectProject && onSelectProject(project)}
      className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-secondary/50 hover:shadow-xl transition-all cursor-pointer animate-fade-in flex flex-col h-full relative"
    >
      {/* Header with Category */}
      <div className="flex items-start mb-4">
        <span
          className={`px-2 py-0.5 text-[8px] font-bold tracking-widest border rounded-md ${getCategoryColor(project.category)}`}
        >
          {CATEGORY_MAP[project.category] || project.category || "Tech"}
        </span>
      </div>

      {/* Project Title & Description */}
      <div className="mb-4 flex-grow">
        <h4 className="font-bold text-[#18254D] text-sm tracking-tight mb-2 group-hover:text-secondary transition-colors line-clamp-2">
          {project.name}
        </h4>
        {project.description && (
          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">
            {project.description}
          </p>
        )}
      </div>

      {/* Status & Priority Row */}
      <div className="flex items-center justify-between mb-4 mt-auto pt-4 border-t border-slate-50">
        <div className="flex flex-col gap-1.5">
          <span className="text-[8px] font-black text-slate-300 tracking-widest uppercase">Status</span>
          <span
            className={`px-2 py-0.5 text-[8px] font-bold tracking-widest border rounded-md w-fit ${getStatusColor(project.status)}`}
          >
            {project.status?.replace("_", " ") || "Planning"}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-[8px] font-black text-slate-300 tracking-widest uppercase text-right">Priority</span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-bold tracking-widest border rounded-md ${priorityStyle.badge}`}
          >
            <PriorityIcon size={10} />
            {project.priority?.toUpperCase() || "MEDIUM"}
          </span>
        </div>
      </div>

      {/* Action Menu (Floating top-right) */}
      <div className="absolute top-5 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className={`p-1.5 transition-colors rounded-lg ${isMenuOpen ? "bg-slate-100 text-primary" : "bg-white border border-slate-100 text-slate-300 hover:text-primary hover:border-slate-300 shadow-sm"}`}
          >
            <MoreVertical size={14} />
          </button>

          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-[60]"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                }}
              />
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[70] animate-fade-in origin-top-right py-2 scale-90 -translate-y-2 translate-x-2"
                style={{ transform: 'scale(1) translate(0, 0)' }}
              >
                <div className="px-4 py-2 border-b border-slate-50 mb-1">
                  <p className="text-[9px] font-black text-slate-400  tracking-widest">
                    Quick Actions
                  </p>
                </div>
                {availableStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    className="w-full text-left px-4 py-2.5 text-[10px] font-bold  tracking-widest text-[#18254D] hover:bg-slate-50 hover:text-secondary transition-colors"
                  >
                    Move to {status}
                  </button>
                ))}
                <div className="border-t border-slate-50 mt-1 pt-1">
                  <button
                    onClick={() => {
                      onEdit && onEdit(project);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-[10px] font-bold  tracking-widest text-slate-400 hover:bg-slate-50 hover:text-primary transition-colors"
                  >
                    Edit Details
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer with Budget & Deadline */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-black text-slate-300 tracking-widest uppercase">Budget</span>
          <span className="text-[10px] font-bold text-primary flex items-center gap-0.5">
            <IndianRupee size={10} strokeWidth={3} />
            {project.budget?.toLocaleString("en-IN") || "0"}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[8px] font-black text-slate-300 tracking-widest uppercase text-right">Deadline</span>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
            <Calendar size={12} className="text-secondary" />
            <span>
              {project.deadline
                ? new Date(project.deadline).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectBoard = ({
  projects,
  clients,
  onAddProject,
  onAddClient,
  onSelectProject,
  onUpdateProject,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(3);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const categoryButtonRef = useRef(null);
  const [categoryDropdownStyle, setCategoryDropdownStyle] = useState({});

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
      if (isCategoryDropdownOpen) {
        if (
          e.type === "scroll" &&
          e.target.closest &&
          e.target.closest(".category-dropdown")
        ) {
          return;
        }
        setIsCategoryDropdownOpen(false);
      }
    };
    if (isCategoryDropdownOpen) {
      window.addEventListener("scroll", handleScrollResize, true);
      window.addEventListener("resize", handleScrollResize, true);
    }
    return () => {
      window.removeEventListener("scroll", handleScrollResize, true);
      window.removeEventListener("resize", handleScrollResize, true);
    };
  }, [isCategoryDropdownOpen]);
  const COLUMNS =
    selectedCategory === 1
      ? TECH_COLUMNS
      : selectedCategory === 2
        ? MEDIA_COLUMNS
        : ALL_COLUMNS;

  const [activeStage, setActiveStage] = useState(COLUMNS[0].id);

  // Sync activeStage when selectedCategory changes if current activeStage is not in new COLUMNS
  useEffect(() => {
    if (!COLUMNS.find((c) => c.id === activeStage)) {
      setActiveStage(COLUMNS[0].id);
    }
  }, [selectedCategory, COLUMNS, activeStage]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [isClientStatusDropdownOpen, setIsClientStatusDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    projectName: "",
    projectStatus: "Planning",
    projectCategory: 1,
    projectPriority: "Medium",
    projectDescription: "",
    country: "",
    state: "",
    currency: "",
    organisationName: "",
    clientStatus: "Active",
    onboardingDate: new Date().toISOString().split("T")[0],
    deadline: "",
    budget: 0,
    scopeDocument: "",
  });

  const getAvailableStatuses = (currentStatus) => {
    return COLUMNS.filter((col) => col.id !== currentStatus).map(
      (col) => col.id,
    );
  };
  const activeColumn = COLUMNS.find((c) => c.id === activeStage) || COLUMNS[0];
  const filteredProjects = projects.filter((p) => {
    const matchesStatus = p.status === activeStage;
    const matchesCategory =
      selectedCategory === 3 ? true : (p.category || 1) === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      p.name?.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query) ||
      clients
        .find((c) => c.id === p.clientId)
        ?.company?.toLowerCase()
        .includes(query);
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setActiveStage("Planning");
    setIsCategoryDropdownOpen(false);
  };

  const handleEditProject = (project) => {
    if (onSelectProject) {
      onSelectProject(project);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Create client first
    if (onAddClient) {
      const newClient = await onAddClient({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        state: formData.state,
        currency: formData.currency,
        organisationName: formData.organisationName,
        clientStatus: formData.clientStatus,
        status: "Active",
      });

      if (newClient && newClient.id && onAddProject) {
        // 2. Create project entry using the real client ID
        await onAddProject({
          clientId: newClient.id,
          name: formData.projectName,
          description: formData.projectDescription,
          projectCategory: formData.projectCategory,
          projectStatus: formData.projectStatus,
          projectPriority: formData.projectPriority,
          budget: formData.budget,
          onboardingDate: formData.onboardingDate,
          deadline: formData.deadline,
          scopeDocument: formData.scopeDocument,
        });
      }
    }

    setShowAddModal(false);
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      projectName: "",
      projectStatus: "Planning",
      projectCategory: 1,
      projectPriority: "Medium",
      projectDescription: "",
      country: "",
      state: "",
      currency: "",
      organisationName: "",
      clientStatus: "Active",
      onboardingDate: new Date().toISOString().split("T")[0],
      deadline: "",
      budget: 0,
      scopeDocument: "",
    });
  };

  return (
    <div className="w-full h-full relative">
      <div className="space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="max-w-2xl">
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-primary tracking-tight mb-2">
              Projects
            </h2>
            <p className="text-sm text-textMuted font-medium leading-relaxed">
              Manage and track all your projects and their delivery status.
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
              Add New Project
            </button>
          </div>
        </div>

        {/* Category Dropdown & Search Bar */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-nowrap justify-between w-full items-center gap-4 overflow-x-auto no-scrollbar">
            <div className="relative min-w-[200px] max-w-md flex-1">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[38px] pl-11 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary transition-all"
              />
            </div>

            <div className="relative shrink-0">
              <button
                ref={categoryButtonRef}
                onClick={() =>
                  setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                }
                className="w-full lg:w-auto h-[38px] flex items-center justify-between gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold  tracking-widest text-primary hover:bg-white hover:border-slate-200 transition-all min-w-[200px] shadow-sm shadow-slate-200/50 group"
              >
                <span>{CATEGORY_MAP[selectedCategory]} Projects</span>
                <ChevronDown
                  size={16}
                  strokeWidth={2.5}
                  className={`text-slate-400 transition-transform duration-300 ${isCategoryDropdownOpen ? "rotate-180" : ""}`}
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
                        className="category-dropdown bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[9999] animate-fade-in origin-top"
                        style={categoryDropdownStyle}
                      >
                        <div className="bg-[#18254D] px-4 py-3 border-b border-white/10">
                          <p className="text-[9px] font-black text-white/50  tracking-widest">
                            Select Project Category
                          </p>
                        </div>
                        {[1, 2, 3].map((catId) => (
                          <button
                            key={catId}
                            onClick={() => handleCategoryChange(catId)}
                            className={`w-full text-left px-5 py-3.5 text-[10px] font-bold  tracking-widest transition-colors ${
                              selectedCategory === catId
                                ? "bg-slate-100 text-secondary"
                                : "text-[#18254D] hover:bg-slate-50"
                            }`}
                          >
                            {CATEGORY_MAP[catId]} Projects
                          </button>
                        ))}
                      </div>
                    </>,
                    document.body,
                  )}
              </div>
          </div>
        </div>

        {/* Stage Toggle Tabs */}
        <div className="flex lg:justify-center my-1 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
          <div className="inline-flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200 shadow-sm leading-none h-[42px] items-center gap-1 whitespace-nowrap">
            {COLUMNS.map((column) => {
              const count = projects.filter(
                (p) =>
                  p.status === column.id &&
                  (selectedCategory === 3 || (p.category || 1) === selectedCategory),
              ).length;
              const isActive = activeStage === column.id;
              return (
                <button
                  key={column.id}
                  onClick={() => setActiveStage(column.id)}
                  className={`px-3 md:px-5 h-full rounded-xl text-[10px] font-bold  tracking-wider transition-all flex items-center justify-center min-w-[90px] md:min-w-[100px] border border-transparent whitespace-nowrap gap-2 ${
                    isActive
                      ? "text-primary bg-white shadow-md border-slate-100"
                      : "text-slate-400 hover:text-slate-500 hover:bg-white/50"
                  }`}
                >
                  <span>{column.title}</span>
                  <span
                    className={`min-w-[20px] h-5 px-1.5 rounded-full text-[9px] font-bold flex items-center justify-center ${
                      isActive
                        ? "bg-primary text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Stage Content */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6 min-h-[300px]">
          {/* Stage Header */}
          <div className="flex justify-between items-center mb-4 px-1">
            <div className="flex items-center gap-4">
              <div
                className={`w-3 h-3 rounded-full ${activeColumn.dotColor}`}
              ></div>
              <h3 className="text-sm font-bold text-primary  tracking-[0.25em]">
                {activeColumn.title}
              </h3>
            </div>
            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-200  tracking-widest">
              {filteredProjects.length}{" "}
              {filteredProjects.length === 1 ? "Project" : "Projects"}
            </span>
          </div>

          {/* Project Cards Grid */}
          {filteredProjects.length > 0 ? (
            activeStage === "Live" || activeStage === "Completed" ? (
              <div className="space-y-10">
                {Object.entries(
                  filteredProjects.reduce((groups, project) => {
                    const date = project.deadline
                      ? new Date(project.deadline)
                      : new Date();
                    const month = date.toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    });
                    if (!groups[month]) groups[month] = [];
                    groups[month].push(project);
                    return groups;
                  }, {}),
                ).map(([month, monthProjects]) => (
                  <div key={month} className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-slate-100" />
                      <h4 className="text-[11px] font-bold text-slate-400 tracking-[0.3em] uppercase bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100 shadow-sm flex items-center gap-2">
                        <span>{month}</span>
                        <span className="text-[9px] text-secondary font-black bg-secondary/10 px-2 py-0.5 rounded-md border border-secondary/20 tracking-normal">
                          {monthProjects.length}
                        </span>
                      </h4>
                      <div className="h-px flex-1 bg-slate-100" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {monthProjects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          clients={clients}
                          onEdit={handleEditProject}
                          onUpdateProject={onUpdateProject}
                          availableStatuses={getAvailableStatuses(
                            project.status,
                          )}
                          onSelectProject={onSelectProject}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    clients={clients}
                    onEdit={handleEditProject}
                    onUpdateProject={onUpdateProject}
                    availableStatuses={getAvailableStatuses(project.status)}
                    onSelectProject={onSelectProject}
                  />
                ))}
                <button
                  onClick={() => setShowAddModal(true)}
                  className="py-6 border-2 border-dashed border-slate-100 rounded-2xl text-slate-300 text-[10px] font-bold  tracking-widest hover:border-secondary hover:text-secondary hover:bg-secondary/[0.02] transition-all group flex flex-col items-center justify-center gap-2 min-h-[100px]"
                >
                  <Plus
                    size={16}
                    strokeWidth={3}
                    className="group-hover:scale-125 transition-transform"
                  />
                  Initiate Project
                </button>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full max-w-sm py-6 border-2 border-dashed border-slate-100 rounded-2xl text-slate-300 text-[10px] font-bold  tracking-widest hover:border-secondary hover:text-secondary hover:bg-secondary/[0.02] transition-all group flex flex-col items-center justify-center gap-2"
              >
                <Plus
                  size={18}
                  strokeWidth={2.5}
                  className="group-hover:scale-125 transition-transform"
                />
                Initiate Project
              </button>
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
                    Add New Project
                  </h3>
                  <p className="text-secondary text-[9px] font-bold  tracking-widest mt-0.5">
                    Project and Client Details
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5 space-y-4"
            >
              {/* CLIENT DETAILS HEADING */}
              <div className="flex items-center gap-3 pt-2">
                <div className="h-[2px] w-8 bg-secondary rounded-full" />
                <h4 className="text-[14px] font-bold text-[#18254D]  tracking-[0.2em]">
                  Client Details
                </h4>
                <div className="h-[2px] flex-1 bg-slate-100 rounded-full" />
              </div>

              {/* CLIENT TYPE (Simplified version as per image) */}
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
                {/* NAME & EMAIL */}
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    CLIENT NAME
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Anand Kumar"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
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
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
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
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
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
                    value={formData.organisationName || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
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
                  value={formData.country}
                  onChange={(val) => {
                    const countryCurrency = countryToCurrency[val];
                    setFormData({
                      ...formData,
                      country: val,
                      currency: countryCurrency
                        ? countryCurrency.code
                        : formData.currency,
                      state: "", // Reset state when country changes
                    });
                  }}
                  placeholder="Select Country"
                />

                {formData.country === "India" ? (
                  <SearchableDropdown
                    label="CLIENT STATE"
                    options={indianStates}
                    value={formData.state}
                    onChange={(val) => setFormData({ ...formData, state: val })}
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
                      value={formData.state || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
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
                  value={formData.currency}
                  onChange={(val) =>
                    setFormData({ ...formData, currency: val })
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
                        setIsClientStatusDropdownOpen(
                          !isClientStatusDropdownOpen,
                        )
                      }
                      className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:border-secondary transition-all"
                    >
                      <span className="text-primary truncate">
                        {formData.clientStatus || "Active"}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 transition-transform ${
                          isClientStatusDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isClientStatusDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-[80]"
                          onClick={() =>
                            setIsClientStatusDropdownOpen(false)
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
                                setFormData({
                                  ...formData,
                                  clientStatus: status,
                                });
                                setIsClientStatusDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-[10px] font-bold  tracking-widest transition-colors ${
                                formData.clientStatus === status
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
                {/* PROJECT NAME */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    PROJECT NAME
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Route Optimization Platform"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium"
                    value={formData.projectName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        projectName: e.target.value,
                      })
                    }
                  />
                </div>

                {/* PROJECT DESCRIPTION */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    PROJECT DESCRIPTION
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Focus on UI/UX redesign and performance optimization..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium resize-none shadow-sm"
                    value={formData.projectDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        projectDescription: e.target.value,
                      })
                    }
                  />
                </div>

                {/* PROJECT CATEGORY */}
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
                          setFormData({
                            ...formData,
                            projectCategory: catId,
                            projectStatus: "Planning",
                          })
                        }
                        className={`flex-1 flex items-center justify-center p-2.5 border-2 rounded-xl transition-all font-bold  text-[10px] tracking-widest ${
                          formData.projectCategory === catId
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
                        setIsStatusDropdownOpen(!isStatusDropdownOpen)
                      }
                      className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium shadow-sm hover:border-secondary transition-all"
                    >
                      <span className="text-primary">
                        {formData.projectStatus}
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
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[90] animate-fade-in-up origin-top">
                          <div className="bg-[#18254D] px-4 py-3 border-b border-white/10">
                            <p className="text-[9px] font-bold text-white/50  tracking-widest">
                              Select Status
                            </p>
                          </div>
                          {(formData.projectCategory === 1
                            ? ["Planning", "In Progress", "Testing", "Live"]
                            : ["Planning", "In Progress", "Completed"]
                          ).map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  projectStatus: status,
                                });
                                setIsStatusDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-[10px] font-bold  tracking-widest transition-colors ${
                                formData.projectStatus === status
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


                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    PROJECT PRIORITY
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setIsPriorityDropdownOpen(!isPriorityDropdownOpen)
                      }
                      className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium shadow-sm hover:border-secondary transition-all"
                    >
                      <span className="text-primary">
                        {formData.projectPriority}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 transition-transform ${isPriorityDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isPriorityDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-[80]"
                          onClick={() => setIsPriorityDropdownOpen(false)}
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
                                setFormData({
                                  ...formData,
                                  projectPriority: level,
                                });
                                setIsPriorityDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-[10px] font-bold  tracking-widest transition-colors ${
                                formData.projectPriority === level
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
                    {formData.currency === "USD" ? "USD" : "INR"})
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      {formData.currency === "USD" ? "$" : "₹"}
                    </div>
                    <input
                      type="text"
                      placeholder={
                        formData.currency === "USD"
                          ? "e.g. 5,000"
                          : "e.g. 5,00,000"
                      }
                      className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium shadow-sm"
                      value={formData.budget || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          budget: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* DATES */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    ONBOARDING DATE
                  </label>
                  <DatePicker
                    value={formData.onboardingDate}
                    onChange={(val) =>
                      setFormData({
                        ...formData,
                        onboardingDate: val,
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    DEADLINE (TENTATIVE)
                  </label>
                  <DatePicker
                    value={formData.deadline}
                    onChange={(val) =>
                      setFormData({
                        ...formData,
                        deadline: val,
                      })
                    }
                  />
                </div>

                {/* SCOPE DOCUMENT */}
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
                          setFormData({
                            ...formData,
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
                        className={`text-sm font-bold ${formData.scopeDocument ? "text-[#18254D]" : "text-slate-400"}`}
                      >
                        {formData.scopeDocument instanceof File
                          ? formData.scopeDocument.name
                          : typeof formData.scopeDocument === "string" &&
                              formData.scopeDocument
                            ? formData.scopeDocument
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
                  <UserPlus
                    size={20}
                    className="group-hover/btn:translate-x-1 transition-transform"
                  />
                  <span>ADD PROJECT</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectBoard;
