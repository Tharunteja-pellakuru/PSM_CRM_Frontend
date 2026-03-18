import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  IndianRupee,
  Edit2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Zap,
  Tag,
  Clock,
  User,
  FileText,
  ChevronDown,
  Mail,
  Phone,
  Monitor,
  MessageSquare,
  Eye,
  Download,
  Upload,
} from "lucide-react";
import DatePicker from "../../components/ui/DatePicker";
import {
  CATEGORY_MAP,
  REVERSE_CATEGORY_MAP,
} from "../../constants/categoryConstants";
import { BASE_URL } from "../../constants/config";

const ProjectOverview = ({
  project,
  client,
  onBack,
  onUpdateProject,
  followUps,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: project?.name || "",
    status: project?.status || "Pending",
    category: project?.category || 1,
    priority: project?.priority || "Medium",
    progress: project?.progress || 0,
    onboardingDate: project?.onboardingDate || "",
    deadline: project?.deadline || "",
    budget: project?.budget || 0,
    description: project?.description || "",
    scopeFile: null,
  });

  // Sync formData with project prop when it changes
  React.useEffect(() => {
    if (project && !isEditing) {
      setFormData({
        name: project.name || "",
        status: project.status || "Pending",
        category: project.category || 1,
        priority: project.priority || "Medium",
        progress: project.progress || 0,
        onboardingDate: project.onboardingDate || "",
        deadline: project.deadline || "",
        budget: project.budget || 0,
        description: project.description || "",
        scopeFile: null,
      });
    }
  }, [project, isEditing]);

  // State for custom dropdowns
  const [activeDropdown, setActiveDropdown] = useState(null); // 'status', 'priority', 'category'

  const handleSave = () => {
    if (onUpdateProject && project?.id) {
      onUpdateProject({
        ...project,
        ...formData,
      });
    }
    setIsEditing(false);
  };

  const handleDownload = async (filename) => {
    try {
      const response = await fetch(`${BASE_URL}/uploads/${filename}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback to direct link if fetch fails
      window.open(`${BASE_URL}/uploads/${filename}`, "_blank");
    }
  };

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
      case "live":
      case "completed":
        return "bg-success/10 text-success border-success/30";
      case "testing":
        return "bg-secondary/10 text-secondary border-secondary/30";
      case "in progress":
      case "in_progress":
        return "bg-warning/10 text-warning border-warning/30";
      case "pending":
      case "planning":
        return "bg-info/10 text-info border-info/30";
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

  const priorityStyle = getPriorityStyles(formData.priority);
  const PriorityIcon = priorityStyle.icon;

  const CustomDropdown = ({ label, value, options, field, icon: Icon }) => (
    <div className="space-y-2 relative">
      <label className="text-[10px] font-bold text-primary  tracking-widest ml-1 opacity-50">
        {label}
      </label>
      <button
        type="button"
        onClick={() =>
          setActiveDropdown(activeDropdown === field ? null : field)
        }
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white hover:border-secondary transition-all text-sm font-bold text-[#18254D]"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={16} className="text-secondary" />}
          <span>{CATEGORY_MAP[value] || value}</span>
        </div>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform ${activeDropdown === field ? "rotate-180" : ""}`}
        />
      </button>

      {activeDropdown === field && (
        <>
          <div
            className="fixed inset-0 z-[110]"
            onClick={() => setActiveDropdown(null)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[120] animate-fade-in origin-top py-2">
            <div className="bg-[#18254D] px-4 py-2 border-b border-white/10 -mt-2 mb-1">
              <p className="text-[9px] font-bold text-white/50  tracking-widest">
                Select {label}
              </p>
            </div>
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setFormData({ ...formData, [field]: opt });
                  setActiveDropdown(null);
                }}
                className={`w-full text-left px-5 py-3 text-[10px] font-bold  tracking-widest transition-colors ${
                  value === opt
                    ? "bg-slate-50 text-secondary"
                    : "text-[#18254D] hover:bg-slate-50"
                }`}
              >
                {CATEGORY_MAP[opt] || opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="w-full h-full relative space-y-6">
      {/* Page Title & Tagline */}
      <div className="max-w-2xl">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-primary tracking-tight mb-2">
          Project Overview
        </h2>
        <p className="text-sm text-textMuted font-medium leading-relaxed">
          Get a complete overview of all your projects, including progress,
          timelines, and current status.
        </p>
      </div>

      {/* Premium Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between gap-5 animate-fade-in">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-all shrink-0"
            title="Back to Board"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h2 className="text-lg md:text-xl font-bold text-[#18254D] tracking-tight leading-none">
            {formData.name}
          </h2>
        </div>

        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-bold  tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-primary text-white rounded-xl text-[10px] font-bold  tracking-widest shadow-lg shadow-primary/20 hover:bg-[#1e2e5e] transition-all flex items-center justify-center gap-2"
              >
                <Save size={14} /> Save
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-5 py-2 bg-white border border-slate-200 text-[#18254D] rounded-xl text-[10px] font-bold  tracking-widest hover:border-secondary hover:text-secondary transition-all shadow-sm flex items-center justify-center gap-2 group"
            >
              <Edit2
                size={14}
                className="group-hover:rotate-12 transition-transform"
              />
              Edit Project
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pb-12">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-5">
          {/* Overview & Progress */}

          {/* Configuration Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <Zap size={18} className="text-warning" />
              <h3 className="text-sm font-bold text-[#18254D]  tracking-widest">
                Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary  tracking-widest ml-1 opacity-50">
                  Project Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-bold text-[#18254D]"
                  />
                ) : (
                  <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#18254D]">
                    {formData.name}
                  </div>
                )}
              </div>

              {isEditing ? (
                <CustomDropdown
                  label="Current Status"
                  value={formData.status}
                  field="status"
                  options={["Hold", "In Progress", "Completed"]}
                  icon={Zap}
                />
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary  tracking-widest ml-1 opacity-50">
                    Current Status
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#18254D]">
                    <Zap size={16} className="text-secondary" />
                    <span>{formData.status}</span>
                    <span
                      className={`ml-auto px-2 py-0.5 text-[8px] border rounded-md ${getStatusColor(formData.status)}`}
                    >
                      {formData.status}
                    </span>
                  </div>
                </div>
              )}

              {isEditing ? (
                <CustomDropdown
                  label="Priority Level"
                  value={formData.priority}
                  field="priority"
                  options={["Low", "Medium", "High"]}
                  icon={AlertCircle}
                />
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary  tracking-widest ml-1 opacity-50">
                    Priority Level
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#18254D]">
                    <AlertCircle size={16} className="text-secondary" />
                    <span>{formData.priority}</span>
                    <span
                      className={`ml-auto inline-flex items-center gap-1.5 px-2 py-0.5 text-[8px] border rounded-md ${getPriorityStyles(formData.priority).badge}`}
                    >
                      {formData.priority}
                    </span>
                  </div>
                </div>
              )}

              {isEditing ? (
                <CustomDropdown
                  label="Project Category"
                  value={formData.category}
                  field="category"
                  options={[1, 2, 3]}
                  icon={Tag}
                />
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary  tracking-widest ml-1 opacity-50">
                    Project Category
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#18254D]">
                    <Tag size={16} className="text-secondary" />
                    <span>
                      {CATEGORY_MAP[formData.category] || formData.category}
                    </span>
                    <span
                      className={`ml-auto px-2 py-0.5 text-[8px] border rounded-md ${getCategoryColor(formData.category)}`}
                    >
                      {CATEGORY_MAP[formData.category] || formData.category}
                    </span>
                  </div>
                </div>
              )}

              {/* Project Description Block */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-primary  tracking-widest ml-1 opacity-50">
                  Project Description
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-bold text-[#18254D] min-h-[100px] resize-none"
                    placeholder="Brief overview of the project scope..."
                  />
                ) : (
                  <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#18254D] min-h-[100px]">
                    {formData.description ||
                      "No specific objectives defined for this project yet."}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Project Documents */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-fade-in-up">
            <div className="bg-slate-50/50 px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#18254D]  tracking-widest flex items-center gap-3">
                <FileText size={18} className="text-secondary" />
                Documents
              </h3>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group hover:border-secondary transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-secondary border border-slate-100 shadow-sm">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">
                      Project Scope Document
                    </p>
                    <p className="text-[10px] font-bold text-slate-400  tracking-widest">
                      {project?.scopeDocument
                        ? project.scopeDocument
                        : "No document uploaded"}
                    </p>
                  </div>
                </div>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".pdf"
                      id="scope-upload"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setFormData({ ...formData, scopeFile: file });
                        }
                      }}
                    />
                    <label
                      htmlFor="scope-upload"
                      className="px-3 py-2 bg-secondary text-white rounded-lg text-[10px] font-bold tracking-widest hover:bg-secondary/90 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Upload size={14} />
                      {formData.scopeFile ? "File Selected" : "Upload New PDF"}
                    </label>
                    {formData.scopeFile && (
                      <span className="text-[10px] font-bold text-secondary truncate max-w-[100px]">
                        {formData.scopeFile.name}
                      </span>
                    )}
                  </div>
                ) : project?.scopeDocument ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={`${BASE_URL}/uploads/${project.scopeDocument}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-white border border-slate-200 text-[#18254D] rounded-lg text-[10px] font-bold tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                      title="View Document"
                    >
                      <Eye size={14} className="text-secondary" />
                      View
                    </a>
                    <button
                      onClick={() => handleDownload(project.scopeDocument)}
                      className="px-3 py-2 bg-white border border-slate-200 text-[#18254D] rounded-lg text-[10px] font-bold tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                      title="Download Document"
                    >
                      <Download size={14} className="text-secondary" />
                      Download
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 tracking-widest bg-slate-100/50 px-3 py-1 rounded-md border border-slate-100">
                    No Document
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Client Follow-up History */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-fade-in-up">
            <div className="bg-slate-50/50 px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#18254D]  tracking-widest flex items-center gap-3">
                <MessageSquare size={18} className="text-secondary" />
                Follow-ups
              </h3>
            </div>
            <div className="p-5 space-y-4">
              {followUps?.filter((f) => f.projectId === project.id).length >
              0 ? (
                followUps
                  .filter((f) => f.projectId === project.id)
                  .map((f) => (
                    <div
                      key={f.id}
                      className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 group hover:border-secondary transition-all"
                    >
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-secondary border border-slate-100 shadow-sm shrink-0">
                        <Clock size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-bold text-primary truncate">
                            {f.title}
                          </p>
                          <span className="text-[9px] font-bold text-slate-400  tracking-widest ml-2 shrink-0">
                            {new Date(f.dueDate).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-2 leading-relaxed italic">
                          "{f.follow_brief}"
                        </p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-[8px] font-bold  tracking-widest rounded-md border ${
                              f.status === "completed"
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-warning/10 text-warning border-warning/20"
                            }`}
                          >
                            {f.status}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400  tracking-widest">
                            Mode: {f.followup_mode}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                    <MessageSquare size={24} />
                  </div>
                  <p className="text-xs font-bold text-slate-400  tracking-widest">
                    No follow-up messages linked to this project
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Financials */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm group hover:border-success/30 transition-all animate-fade-in-right">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-success/10 text-success rounded-2xl flex items-center justify-center">
                <IndianRupee size={20} />
              </div>
              <label className="text-[10px] font-bold text-slate-400  tracking-[0.2em]">
                Project Budget
              </label>
            </div>
            {isEditing ? (
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-success font-bold text-lg">
                  ₹
                </div>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      budget: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-success text-2xl font-black text-primary tracking-tighter"
                />
              </div>
            ) : (
              <p className="text-2xl font-bold text-[#18254D] tracking-tight shrink-0">
                {formData.budget > 0
                  ? `₹${formData.budget.toLocaleString("en-IN")}`
                  : "₹0.00"}
              </p>
            )}
          </div>

          {/* Timeline Card */}
          <div className="bg-[#18254D] rounded-2xl p-5 text-white shadow-xl animate-fade-in-right relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-all duration-700" />
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <Calendar size={18} className="text-secondary" />
              <h3 className="text-[10px] font-bold  tracking-[0.2em] opacity-60">
                Timeline
              </h3>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-white/40  tracking-widest">
                  Onboarding Date
                </p>
                {isEditing ? (
                  <DatePicker
                    value={formData.onboardingDate}
                    onChange={(val) =>
                      setFormData({
                        ...formData,
                        onboardingDate: val,
                      })
                    }
                  />
                ) : (
                  <p className="text-sm font-bold">
                    {formData.onboardingDate
                      ? new Date(formData.onboardingDate).toLocaleDateString(
                          [],
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )
                      : "No date set"}
                  </p>
                )}
              </div>

              <div className="h-px bg-white/10 w-full" />

              <div className="space-y-2">
                <p className="text-[9px] font-bold text-secondary  tracking-widest">
                  Final Deadline
                </p>
                {isEditing ? (
                  <DatePicker
                    value={formData.deadline}
                    onChange={(val) =>
                      setFormData({
                        ...formData,
                        deadline: val,
                      })
                    }
                  />
                ) : (
                  <p className="text-base font-bold tracking-tight leading-none">
                    {formData.deadline
                      ? new Date(formData.deadline).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "No deadline set"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Client Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm animate-slide-up">
            <h3 className="text-[10px] font-bold text-slate-400  tracking-widest mb- border-b border-slate-50 pb-3">
              Client Details
            </h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center font-bold text-lg border-4 border-slate-50 shadow-md">
                {client?.name?.charAt(0) || "C"}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400  tracking-widest mt-0.5">
                  {client?.name || ""}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-secondary transition-all cursor-pointer">
                <Mail
                  size={14}
                  className="text-slate-400 group-hover:text-secondary"
                />
                <span className="text-[10px] font-bold text-primary truncate">
                  {client?.email || "No email documented"}
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-secondary transition-all cursor-pointer">
                <Phone
                  size={14}
                  className="text-slate-400 group-hover:text-secondary"
                />
                <span className="text-[10px] font-bold text-primary">
                  {client?.phone || "No phone documented"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;
