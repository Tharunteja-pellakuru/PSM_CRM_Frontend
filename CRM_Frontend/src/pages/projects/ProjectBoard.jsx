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

const TECH_COLUMNS = [
  {
    id: "Planning",
    title: "Planning",
    color: "text-info",
    dotColor: "bg-info",
    activeTabBg: "bg-info/10",
    activeTabText: "text-info",
  },
  {
    id: "In Progress",
    title: "In Progress",
    color: "text-warning",
    dotColor: "bg-warning",
    activeTabBg: "bg-warning/10",
    activeTabText: "text-warning",
  },
  {
    id: "Testing",
    title: "Testing",
    color: "text-secondary",
    dotColor: "bg-secondary",
    activeTabBg: "bg-secondary/10",
    activeTabText: "text-secondary",
  },
  {
    id: "Live",
    title: "Live",
    color: "text-success",
    dotColor: "bg-success",
    activeTabBg: "bg-success/10",
    activeTabText: "text-success",
  },
];

const MEDIA_COLUMNS = [
  {
    id: "Planning",
    title: "Planning",
    color: "text-info",
    dotColor: "bg-info",
    activeTabBg: "bg-info/10",
    activeTabText: "text-info",
  },
  {
    id: "In Progress",
    title: "In Progress",
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
    id: "Planning",
    title: "Planning",
    color: "text-info",
    dotColor: "bg-info",
    activeTabBg: "bg-info/10",
    activeTabText: "text-info",
  },
  {
    id: "In Progress",
    title: "In Progress",
    color: "text-warning",
    dotColor: "bg-warning",
    activeTabBg: "bg-warning/10",
    activeTabText: "text-warning",
  },
  {
    id: "Testing",
    title: "Testing",
    color: "text-secondary",
    dotColor: "bg-secondary",
    activeTabBg: "bg-secondary/10",
    activeTabText: "text-secondary",
  },
  {
    id: "Completed",
    title: "Completed",
    color: "text-success",
    dotColor: "bg-success",
    activeTabBg: "bg-success/10",
    activeTabText: "text-success",
  },
  {
    id: "Live",
    title: "Live",
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
    switch (category?.toLowerCase()) {
      case "tech":
        return "bg-secondary/10 text-secondary border-secondary/30";
      case "media":
        return "bg-warning/10 text-warning border-warning/30";
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
      className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-secondary/50 hover:shadow-lg transition-all cursor-pointer animate-fade-in flex flex-col h-full relative"
    >
      {/* Header with Company and Menu */}
      <div className="flex justify-between items-start mb-3">
        <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[8px] font-bold text-slate-400  tracking-widest">
          {client?.company || "N/A"}
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className={`p-1.5 transition-colors rounded-lg ${isMenuOpen ? "bg-slate-100 text-primary" : "text-slate-300 hover:text-primary hover:bg-slate-50"}`}
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
                className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[70] animate-fade-in origin-top-right py-2"
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

      {/* Project Name */}
      <h4 className="font-bold text-primary text-sm tracking-tight mb-2 group-hover:text-secondary transition-colors line-clamp-2">
        {project.name}
      </h4>

      {/* Project Description */}
      {project.description && (
        <p className="text-[12px] text-slate-600 mb-3 line-clamp-2 leading-relaxed">
          {project.description}
        </p>
      )}

      {/* Status & Category Badges */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <span
          className={`px-2.5 py-1 text-[8px] font-bold  tracking-widest border rounded-md ${getStatusColor(project.status)}`}
        >
          {project.status?.replace("_", " ") || "Planning"}
        </span>
        <span
          className={`px-2.5 py-1 text-[8px] font-bold  tracking-widest border rounded-md ${getCategoryColor(project.category)}`}
        >
          {project.category || "Tech"}
        </span>
      </div>

      {/* Priority Badge */}
      <div className="mb-3">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[8px] font-bold  tracking-widest border rounded-md ${priorityStyle.badge}`}
        >
          <PriorityIcon size={10} />
          {project.priority?.toUpperCase() || "MEDIUM"}
        </span>
      </div>

      {/* Progress Section */}
      <div className="space-y-2 mb-4 flex-1">
        <div className="flex justify-between items-center text-[9px] font-bold  tracking-widest">
          <span className="text-slate-400">Progress</span>
          <span className="text-primary">{project.progress}%</span>
        </div>
        <div className="w-full bg-slate-100 border border-slate-150 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-secondary h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Footer with Deadline */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[9px] font-bold  tracking-widest text-slate-500">
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="text-secondary" />
          <span>
            {project.deadline
              ? new Date(project.deadline).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })
              : "No deadline"}
          </span>
        </div>
        {project.budget && (
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
            <IndianRupee size={10} className="text-success" />
            <span className="text-primary">
              {(project.budget / 1000).toFixed(0)}k
            </span>
          </div>
        )}
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
  const [selectedCategory, setSelectedCategory] = useState("Tech");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const categoryButtonRef = useRef(null);
  const [categoryDropdownStyle, setCategoryDropdownStyle] = useState({});

  useEffect(() => {
    if (isCategoryDropdownOpen && categoryButtonRef.current) {
      const rect = categoryButtonRef.current.getBoundingClientRect();
      setCategoryDropdownStyle({
        position: 'fixed',
        top: `${rect.bottom + 8}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: 9999
      });
    }
  }, [isCategoryDropdownOpen]);

  useEffect(() => {
    const handleScrollResize = (e) => {
      if (isCategoryDropdownOpen) {
        if (e.type === 'scroll' && e.target.closest && e.target.closest('.category-dropdown')) {
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
  const [activeStage, setActiveStage] = useState("Planning");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Active",
    projectName: "",
    projectStatus: "Planning",
    projectCategory: "Tech",
    projectPriority: "Medium",
    projectDescription: "",
    onboardingDate: new Date().toISOString().split("T")[0],
    deadline: "",
    budget: 0,
    scopeDocument: "",
  });

  const COLUMNS = selectedCategory === "Tech" ? TECH_COLUMNS : MEDIA_COLUMNS;

  const getAvailableStatuses = (currentStatus) => {
    return COLUMNS.filter((col) => col.id !== currentStatus).map(
      (col) => col.id,
    );
  };
  const activeColumn = COLUMNS.find((c) => c.id === activeStage) || COLUMNS[0];
  const filteredProjects = projects.filter((p) => {
    const matchesStatus = p.status === activeStage;
    const matchesCategory = (p.category || "Tech") === selectedCategory;
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Create client first (or link to existing, though form is simplified to 'New' for now)
    const clientId = `c-${Date.now()}`;
    if (onAddClient) {
      onAddClient({
        id: clientId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
        projectName: formData.projectName,
        projectStatus: formData.projectStatus,
        projectCategory: formData.projectCategory,
        projectPriority: formData.projectPriority,
        projectDescription: formData.projectDescription,
        onboardingDate: formData.onboardingDate,
        deadline: formData.deadline,
        scopeDocument: formData.scopeDocument,
      });
    }

    // 2. Create project entry
    if (onAddProject) {
      onAddProject({
        clientId: clientId,
        name: formData.projectName,
        status: formData.projectStatus,
        budget: formData.budget,
        deadline: formData.deadline,
        progress:
          formData.projectStatus === "Live" ||
            formData.projectStatus === "Completed"
            ? 100
            : formData.projectStatus === "Testing"
              ? 75
              : formData.projectStatus === "In Progress"
                ? 40
                : 10,
        category: formData.projectCategory,
        priority: formData.projectPriority,
        description: formData.projectDescription,
      });
    }

    setShowAddModal(false);
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      status: "Active",
      projectName: "",
      projectStatus: "Planning",
      projectCategory: "Tech",
      projectPriority: "Medium",
      projectDescription: "",
      onboardingDate: new Date().toISOString().split("T")[0],
      deadline: "",
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
          <div className="flex flex-nowrap gap-2 w-full items-center overflow-x-auto no-scrollbar">
            <div className="relative min-w-[200px] flex-[1.5] shrink-0">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary transition-all"
              />
            </div>

            <div className="flex items-center justify-end gap-2 shrink-0">
              <div className="relative shrink-0">
                <button
                  ref={categoryButtonRef}
                  onClick={() =>
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                  }
                  className="w-full lg:w-auto flex items-center justify-between gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold  tracking-widest text-primary hover:bg-white hover:border-slate-200 transition-all min-w-[160px] shadow-sm shadow-slate-200/50 group"
                >
                  <span>
                    {selectedCategory === "Tech"
                      ? "Tech Projects"
                      : "Media Projects"}
                  </span>
                  <ChevronDown
                    size={16}
                    strokeWidth={2.5}
                    className={`text-slate-400 transition-transform duration-300 ${isCategoryDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isCategoryDropdownOpen && createPortal(
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
                          Select Category
                        </p>
                      </div>
                      {["Tech", "Media"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => handleCategoryChange(cat)}
                          className={`w-full text-left px-5 py-3.5 text-[10px] font-bold  tracking-widest transition-colors ${selectedCategory === cat
                            ? "bg-slate-100 text-secondary"
                            : "text-[#18254D] hover:bg-slate-50"
                            }`}
                        >
                          {cat} Projects
                        </button>
                      ))}
                    </div>
                  </>,
                  document.body
                )}
              </div>
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
                  (p.category || "Tech") === selectedCategory,
              ).length;
              const isActive = activeStage === column.id;
              return (
                <button
                  key={column.id}
                  onClick={() => setActiveStage(column.id)}
                  className={`px-3 md:px-5 h-full rounded-xl text-[10px] font-bold  tracking-wider transition-all flex items-center justify-center min-w-[90px] md:min-w-[100px] border border-transparent whitespace-nowrap gap-2 ${isActive
                    ? "text-primary bg-white shadow-md border-slate-100"
                    : "text-slate-400 hover:text-slate-500 hover:bg-white/50"
                    }`}
                >
                  <span>{column.title}</span>
                  <span
                    className={`min-w-[20px] h-5 px-1.5 rounded-full text-[9px] font-bold flex items-center justify-center ${isActive
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
                    const date = project.deadline ? new Date(project.deadline) : new Date();
                    const month = date.toLocaleString("default", { month: "long", year: "numeric" });
                    if (!groups[month]) groups[month] = [];
                    groups[month].push(project);
                    return groups;
                  }, {})
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
                          availableStatuses={getAvailableStatuses(project.status)}
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
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in my-auto flex flex-col">
            <div className="bg-primary px-5 py-4 text-white relative">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={20} strokeWidth={3} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center shadow-lg border border-secondary/20">
                  <UserPlus
                    size={18}
                    className="text-secondary"
                    strokeWidth={2.5}
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight leading-none">
                    Add New Project
                  </h3>
                  <p className="text-slate-400 text-[9px] font-bold  tracking-widest mt-0.5">
                    Project and Client Details
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-4 md:p-5 space-y-4 max-h-[65vh] overflow-y-auto"
            >
              {/* CLIENT DETAILS HEADING */}
              <div className="flex items-center gap-2 pt-1">
                <div className="h-[2px] w-6 bg-secondary rounded-full" />
                <h4 className="text-[11px] font-bold text-[#18254D]  tracking-widest">
                  Client Details
                </h4>
                <div className="h-[2px] flex-1 bg-slate-100 rounded-full" />
              </div>

              {/* CLIENT TYPE (Simplified version as per image) */}
              <div className="space-y-2 pb-1">
                <label className="text-[9px] font-bold text-[#18254D]  tracking-widest ml-1">
                  CLIENT TYPE
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2.5 p-3 bg-white border-2 border-[#18254D] rounded-xl cursor-pointer transition-all group shadow-sm">
                    <div className="relative flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-[#18254D] rounded-full flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-[#18254D] rounded-full" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#18254D] leading-none">
                        New Client
                      </p>
                      <p className="text-[8px] text-slate-400 font-bold mt-0.5">
                        First-time engagement
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* NAME & EMAIL */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    CLIENT NAME
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Anand Kumar"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium shadow-sm"
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
                    placeholder="anand.kumar@fintech.in"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium shadow-sm"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                {/* PHONE & STATUS */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    PHONE NUMBER
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium shadow-sm"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

              </div>

              {/* PROJECT DETAILS HEADING */}
              <div className="flex items-center gap-2 pt-3">
                <div className="h-[2px] w-6 bg-secondary rounded-full" />
                <h4 className="text-[11px] font-bold text-[#18254D]  tracking-widest">
                  Project Details
                </h4>
                <div className="h-[2px] flex-1 bg-slate-100 rounded-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* PROJECT NAME & STATUS */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    PROJECT NAME
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Website Redesign"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium shadow-sm"
                    value={formData.projectName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        projectName: e.target.value,
                      })
                    }
                  />
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
                            <p className="text-[9px] font-black text-white/50  tracking-widest">
                              Select Status
                            </p>
                          </div>
                          {(formData.projectCategory === "Tech"
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
                              className={`w-full text-left px-5 py-3.5 text-[10px] font-bold  tracking-widest transition-colors ${formData.projectStatus === status
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
                  <label className="text-[10px] font-black text-[#18254D]  tracking-widest ml-1">
                    PROJECT CATEGORY
                  </label>
                  <div className="flex gap-2">
                    {["Tech", "Media"].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            projectCategory: cat,
                            projectStatus: "Planning",
                          })
                        }
                        className={`flex-1 flex items-center justify-center p-2.5 border-2 rounded-xl transition-all font-bold  text-[10px] tracking-widest ${formData.projectCategory === cat
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
                            <p className="text-[9px] font-black text-white/50  tracking-widest">
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
                              className={`w-full text-left px-5 py-3.5 text-[10px] font-black  tracking-widest transition-colors ${formData.projectPriority === level
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

                {/* PROJECT DESCRIPTION */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1">
                    PROJECT DESCRIPTION
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief overview of the project scope..."
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

                {/* PROJECT BUDGET */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-[#18254D]  tracking-widest ml-1 flex items-center gap-1.5">
                    PROJECT BUDGET (INR)
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      ₹
                    </div>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium shadow-sm"
                      value={formData.budget || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          budget: parseInt(e.target.value) || 0,
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
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-[#18254D]  tracking-widest ml-1">
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
                            scopeDocument: file.name,
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
                        {formData.scopeDocument ||
                          "Click to upload scope document (PDF, DOCX)"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-14 bg-[#18254D] text-white rounded-2xl text-[11px] font-bold  tracking-widest shadow-xl active:scale-[0.97] transition-all hover:bg-[#1e2e5e] hover:shadow-2xl flex items-center justify-center gap-3 group/btn"
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
