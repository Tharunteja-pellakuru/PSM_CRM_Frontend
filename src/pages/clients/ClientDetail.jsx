import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Send,
  Clock,
  FileText,
  Plus,
  MessageSquare,
  Briefcase,
  Calendar,
  X,
  ChevronRight,
  Zap,
  Target,
  Pencil,
  Flame,
  Sun,
  Snowflake,
} from "lucide-react";
import { MOCK_PROJECTS, MOCK_ACTIVITIES } from "../../constants/mockData";
import {
  generateClientSummary,
  suggestNextAction,
} from "../../services/aiService";
import DatePicker from "../../components/ui/DatePicker";

const ClientDetail = ({
  client,
  onBack,
  onUpdateClient,
  onAddActivity,
  activities,
  initialTab = "overview",
  onSelectProject,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [nextAction, setNextAction] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    leadType: "Warm",
    notes: "",
    website: "",
    projectCategory: "Tech",
  });

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Update form data when modal opens or client changes
  useEffect(() => {
    if (showEditModal && client) {
      setEditFormData({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        leadType: client.leadType || "Warm",
        notes: client.notes || "",
        website: client.website || "",
        projectCategory: client.projectCategory || client.industry || "Tech",
      });
    }
  }, [showEditModal, client]);

  const [isLogging, setIsLogging] = useState(false);
  const [logData, setLogData] = useState({
    type: "call",
    description: "",
    projectName: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().split(" ")[0].substring(0, 5),
  });

  const clientProjects = MOCK_PROJECTS.filter((p) => p.clientId === client.id);
  const clientActivities = activities.filter((a) => a.clientId === client.id);

  const handleLogInteraction = (e) => {
    e.preventDefault();
    if (onAddActivity && logData.description) {
      const combinedDateTime = new Date(`${logData.date}T${logData.time}`);
      onAddActivity({
        clientId: client.id,
        type: logData.type,
        description: logData.description,
        date: combinedDateTime.toISOString(),
      });
      setLogData({
        type: "call",
        description: "",
        projectName: "",
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().split(" ")[0].substring(0, 5),
      });
      setIsLogging(false);
    }
  };

  return (
    <div className="w-full relative h-full">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[calc(100vh-8rem)] animate-fade-in relative">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col lg:flex-row items-start lg:items-center justify-between bg-white gap-4">
          <div className="flex items-center gap-5 w-full lg:w-auto">
            <button
              onClick={onBack}
              className="p-3.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-primary transition-all border border-slate-100 shadow-sm"
            >
              <ArrowLeft size={20} strokeWidth={3} />
            </button>
            <div className="flex items-center gap-5 overflow-hidden">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl border-2 border-slate-50 shadow-lg shrink-0">
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg md:text-xl font-bold text-primary tracking-tight truncate leading-none mb-1.5">
                  {client.name}
                </h2>
                <div className="flex items-center gap-2.5 text-[11px] text-textMuted font-bold  tracking-widest truncate">
                  <span className="truncate">
                    {client.status === "Lead"
                      ? client.company || "Independent"
                      : client.projectName ||
                      client.company ||
                      "Global Project"}
                  </span>
                  <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-lg text-[9px] font-bold tracking-widest border border-secondary/20">
                    {client.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 w-full lg:w-auto">
            {client.status === "Lead" && (
              <button
                onClick={() => {
                  setShowEditModal(true);
                }}
                className="flex-shrink-0 p-3.5 bg-slate-50 text-primary border border-slate-200 rounded-xl hover:bg-white hover:border-primary transition-all shadow-sm"
                title="Edit Lead Details"
              >
                <Pencil size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Edit Lead Modal */}
          {showEditModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-fade-in overflow-y-auto py-10">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-zoom-in my-auto border border-slate-200">
                <div className="bg-primary p-4 text-white relative">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <X size={18} strokeWidth={3} />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary/10 rounded-xl flex items-center justify-center shadow-lg border border-secondary/20">
                      <Pencil
                        size={18}
                        className="text-secondary"
                        strokeWidth={2.5}
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-bold tracking-tighter leading-none">
                        Edit Lead Details
                      </h3>
                      <p className="text-secondary text-[9px] font-bold  tracking-widest mt-0.5">
                        Update primary contact information
                      </p>
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (onUpdateClient) {
                      try {
                        // Ensure we have the latest values
                        const formDataToSubmit = {
                          name: editFormData.name,
                          email: editFormData.email,
                          phone: editFormData.phone,
                          leadType: editFormData.leadType,
                          notes: editFormData.notes,
                          website: editFormData.website,
                          projectCategory: editFormData.projectCategory,
                        };
                        console.log("=== FORM SUBMISSION DEBUG ===");
                        console.log("Submitting edit form with data:", formDataToSubmit);
                        console.log("Website value being sent:", formDataToSubmit.website);
                        
                        await onUpdateClient(client.id, formDataToSubmit);
                        
                        console.log("Lead updated successfully!");
                        console.log("=== END DEBUG ===");
                        setShowEditModal(false);
                      } catch (error) {
                        console.error("Failed to update lead:", error);
                        alert("Failed to update lead. Please try again.");
                      }
                    }
                  }}
                  className="p-5 space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary  tracking-widest ml-1">
                      Full Name
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Anand Kumar"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium"
                      value={editFormData.name}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary  tracking-widest ml-1">
                      Email ID
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="e.g. anand.kumar@fintech.in"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium"
                      value={editFormData.email}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary  tracking-widest ml-1">
                      Phone Number
                    </label>
                    <input
                      required
                      type="tel"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium"
                      value={editFormData.phone}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary  tracking-widest ml-1">
                      Website Url
                    </label>
                    <input
                      type="url"
                      placeholder="e.g. https://www.company.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium"
                      value={editFormData.website}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          website: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary  tracking-widest ml-1">
                      Lead Category
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {["Tech", "Social Media"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() =>
                            setEditFormData({
                              ...editFormData,
                              projectCategory: cat,
                            })
                          }
                          className={`py-3 px-4 rounded-xl border-2 text-[10px] font-bold tracking-widest transition-all ${
                            editFormData.projectCategory === cat
                              ? cat === "Tech"
                                ? "bg-secondary/10 border-secondary text-secondary shadow-md"
                                : "bg-blue-500/10 border-blue-500 text-blue-500 shadow-md"
                              : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                          }`}
                        >
                          {cat.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary  tracking-widest ml-1">
                      Lead Status
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {["Hot", "Warm", "Cold"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            setEditFormData({
                              ...editFormData,
                              leadType: type,
                            })
                          }
                          className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${editFormData.leadType === type
                            ? type === "Hot"
                              ? "bg-error/5 border-error text-error shadow-lg shadow-error/10 scale-[1.02]"
                              : type === "Warm"
                                ? "bg-warning/5 border-warning text-warning shadow-lg shadow-warning/10 scale-[1.02]"
                                : "bg-info/5 border-info text-info shadow-lg shadow-info/10 scale-[1.02]"
                            : "bg-slate-50 border-slate-100 text-slate-400 grayscale opacity-60 hover:opacity-100 hover:grayscale-0"
                            }`}
                        >
                          {type === "Hot" ? (
                            <Flame size={18} strokeWidth={2.5} />
                          ) : type === "Warm" ? (
                            <Sun size={18} strokeWidth={2.5} />
                          ) : (
                            <Snowflake size={18} strokeWidth={2.5} />
                          )}
                          <span className="text-[10px] font-bold  tracking-widest">
                            {type}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary  tracking-widest ml-1">
                      Note
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Add any additional context..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-bold resize-none"
                      value={editFormData.notes}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          notes: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-[#18254D] text-white rounded-xl text-[11px] font-bold  tracking-[0.25em] shadow-xl active:scale-[0.97] transition-all hover:bg-[#1e2e5e] hover:shadow-2xl flex items-center justify-center gap-3"
                    >
                      Update Lead
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Log Activity Modal */}
          {isLogging && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-fade-in overflow-y-auto py-10">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-zoom-in my-auto border border-slate-200">
                <div className="bg-primary p-4 text-white relative">
                  <button
                    onClick={() => setIsLogging(false)}
                    className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <X size={18} strokeWidth={3} />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary/10 rounded-xl flex items-center justify-center shadow-lg border border-secondary/20">
                      <MessageSquare
                        size={18}
                        className="text-secondary"
                        strokeWidth={2.5}
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-bold tracking-tighter leading-none">
                        Log Conversation
                      </h3>
                      <p className="text-secondary text-[9px] font-bold  tracking-widest mt-0.5">
                        Record interaction details
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleLogInteraction} className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-primary  tracking-widest ml-1">
                        Date
                      </label>
                      <DatePicker
                        value={logData.date}
                        onChange={(val) =>
                          setLogData({ ...logData, date: val })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-primary  tracking-widest ml-1">
                        Time
                      </label>
                      <input
                        required
                        type="time"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium"
                        value={logData.time}
                        onChange={(e) =>
                          setLogData({ ...logData, time: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {client.status !== "Lead" && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-primary  tracking-widest ml-1">
                        Project Name
                      </label>
                      <select
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium appearance-none cursor-pointer"
                        value={logData.projectName}
                        onChange={(e) =>
                          setLogData({
                            ...logData,
                            projectName: e.target.value,
                          })
                        }
                      >
                        <option value="" disabled>
                          Select a project...
                        </option>
                        {clientProjects.length > 0 ? (
                          clientProjects.map((project) => (
                            <option key={project.id} value={project.name}>
                              {project.name}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="Website Redesign">
                              Website Redesign
                            </option>
                            <option value="SEO Optimization">
                              SEO Optimization
                            </option>
                            <option value="Brand Identity">
                              Brand Identity
                            </option>
                          </>
                        )}
                      </select>
                    </div>
                  )}

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
                            setLogData({
                              ...logData,
                              type: type,
                            })
                          }
                          className={`py-2 px-3 rounded-xl border text-[10px] font-bold  tracking-widest transition-all ${logData.type === type
                            ? "bg-secondary border-secondary text-white shadow-md shadow-secondary/20"
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
                      Conversation Details
                    </label>
                    <textarea
                      required
                      placeholder="Summary of the discussion..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-bold min-h-[100px] resize-none"
                      value={logData.description}
                      onChange={(e) =>
                        setLogData({ ...logData, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-[#18254D] text-white rounded-xl text-[11px] font-bold  tracking-[0.25em] shadow-xl active:scale-[0.97] transition-all hover:bg-[#1e2e5e] hover:shadow-2xl flex items-center justify-center gap-3"
                    >
                      Save Entry
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Side Panel */}
          <div className="w-full lg:w-[280px] border-b lg:border-b-0 lg:border-r border-slate-100 p-4 md:p-6 overflow-y-auto bg-slate-50/20 no-scrollbar shrink-0">
            <div className="space-y-8">
              <div>
                <h3 className="text-[9px] font-bold text-primary  tracking-widest mb-4 opacity-40">
                  Contact Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm group hover:border-secondary">
                    <Mail
                      size={14}
                      className="text-slate-400 group-hover:text-secondary shrink-0"
                    />
                    <span className="text-xs font-bold text-primary truncate">
                      {client.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm group">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <span className="text-xs font-bold text-primary truncate">
                      {client.phone}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-[9px] font-bold text-primary  tracking-widest mb-4 opacity-40">
                  Brief Message
                </h3>
                <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-inner italic text-xs md:text-sm text-primary leading-relaxed font-medium">
                  {client.notes}
                </div>
              </div>
            </div>
          </div>

          {/* Content View */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            <div className="bg-white p-2 border-b border-slate-100">
              <div className="flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar h-[42px] items-center gap-1">
                {[
                  { id: "overview", label: "Overview" },
                  {
                    id: "activity",
                    label:
                      client.status === "Lead"
                        ? "Conversations"
                        : "Conversations",
                  },
                  ...(client.status !== "Lead"
                    ? [{ id: "projects", label: "Projects" }]
                    : []),
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-5 h-full rounded-xl text-[10px] font-bold  tracking-wider transition-all flex items-center justify-center min-w-[100px] border border-transparent whitespace-nowrap ${activeTab === tab.id ? "bg-white text-primary shadow-md border-slate-100" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar bg-white">
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  {client.status === "Lead" ? (
                    <>
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 group relative overflow-hidden hover:shadow-md hover:border-secondary/30 transition-all">
                        <div className="w-8 h-8 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center mb-3 group-hover:bg-secondary group-hover:text-white transition-all border border-secondary/20">
                          <Zap size={16} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-[9px] font-bold text-slate-400  tracking-widest mb-1">
                          Lead Status
                        </h3>
                        <p
                          className={`text-lg font-bold tracking-tight  ${client.leadType === "Hot"
                            ? "text-error"
                            : client.leadType === "Warm"
                              ? "text-warning"
                              : "text-info"
                            }`}
                        >
                          {client.leadType || "Warm"}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 group relative overflow-hidden hover:shadow-md hover:border-secondary/30 transition-all">
                        <div className="w-8 h-8 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-all border border-primary/20">
                          <MessageSquare size={16} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-[9px] font-bold text-slate-400  tracking-widest mb-1">
                          Recent Context
                        </h3>
                        <p className="text-sm font-bold text-primary truncate">
                          {client.notes?.split("\n")[0].substring(0, 40) ||
                            "No interaction logged"}
                          ...
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 group relative overflow-hidden hover:shadow-md hover:border-secondary/30 transition-all">
                        <div className="w-8 h-8 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-all border border-primary/20">
                          <Target size={16} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-[9px] font-bold text-slate-400  tracking-widest mb-1">
                          Project Category
                        </h3>
                        <p className="text-lg font-bold text-primary tracking-tight ">
                          {client.projectCategory || client.industry || "Tech"}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 group relative overflow-hidden hover:shadow-md hover:border-secondary/30 transition-all">
                        <div className="w-8 h-8 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center mb-3 group-hover:bg-secondary group-hover:text-white transition-all border border-secondary/20">
                          <Zap size={16} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-[9px] font-bold text-slate-400  tracking-widest mb-1">
                          Project Priority
                        </h3>
                        <p className="text-lg font-bold text-primary tracking-tight ">
                          {client.projectPriority || "Medium"}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 group relative overflow-hidden md:col-span-2 hover:shadow-md hover:border-secondary/30 transition-all">
                        <div className="w-8 h-8 bg-info/10 text-info rounded-xl flex items-center justify-center mb-3 group-hover:bg-info group-hover:text-white transition-all border border-info/20">
                          <Calendar size={16} strokeWidth={2.5} />
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <h3 className="text-[9px] font-bold text-slate-400  tracking-widest mb-1">
                              Current Deadline
                            </h3>
                            <p className="text-lg font-bold text-primary tracking-tighter ">
                              {client.deadline
                                ? new Date(client.deadline).toLocaleDateString(
                                  [],
                                  {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )
                                : "Not Set"}
                            </p>
                          </div>
                          <div className="text-right">
                            <h3 className="text-[9px] font-bold text-slate-400  tracking-widest mb-1">
                              Status
                            </h3>
                            <p className="text-xs font-bold text-secondary  tracking-widest">
                              {client.projectStatus || "Active"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
              {activeTab === "activity" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-primary tracking-tight">
                      Lead Conversations
                    </h3>
                    <button
                      onClick={() => setIsLogging(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#18254D] text-white rounded-xl text-[10px] font-bold  tracking-widest hover:bg-[#1e2e5e] transition-all shadow-lg active:scale-95"
                    >
                      <Plus size={14} /> Log Entry
                    </button>
                  </div>

                  {client.status === "Lead" ? (
                    /* Lead: Simple flat timeline, no project grouping */
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="p-4">
                        <div className="relative border-l-2 border-slate-100 ml-3 space-y-4">
                          {clientActivities.length === 0 ? (
                            <p className="ml-6 text-[10px] font-bold text-slate-300  tracking-widest py-4">
                              No conversations logged yet
                            </p>
                          ) : (
                            clientActivities.map((conv) => (
                              <div key={conv.id} className="ml-6 relative">
                                <div
                                  className={`absolute -left-[33px] w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-sm z-10 ${conv.type === "email"
                                    ? "bg-info"
                                    : conv.type === "call"
                                      ? "bg-success"
                                      : conv.type === "meeting"
                                        ? "bg-secondary"
                                        : "bg-slate-400"
                                    }`}
                                >
                                  {conv.type === "call" ? (
                                    <Phone size={11} strokeWidth={2.5} />
                                  ) : conv.type === "meeting" ? (
                                    <Calendar size={11} strokeWidth={2.5} />
                                  ) : (
                                    <Mail size={11} strokeWidth={2.5} />
                                  )}
                                </div>
                                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[9px] font-bold text-slate-400  tracking-widest">
                                      {new Date(conv.date).toLocaleDateString(
                                        [],
                                        {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        },
                                      )}
                                    </span>
                                    <span
                                      className={`text-[8px] font-bold  tracking-widest px-2 py-0.5 rounded-md ${conv.type === "call"
                                        ? "bg-success/10 text-success"
                                        : conv.type === "meeting"
                                          ? "bg-secondary/10 text-secondary"
                                          : "bg-info/10 text-info"
                                        }`}
                                    >
                                      {conv.type}
                                    </span>
                                  </div>
                                  <p className="text-[12px] font-medium text-primary leading-relaxed">
                                    {conv.description}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Client: Project-wise conversations */
                    (() => {
                      const projectConversations = [
                        {
                          projectName: client.projectName || "Website Redesign",
                          projectStatus: "Active",
                          conversations: [
                            {
                              id: "pc1",
                              type: "meeting",
                              date: "2026-03-01T10:00:00",
                              description:
                                "Discussed new landing page wireframes and finalized color scheme. Client approved the hero section layout.",
                            },
                            {
                              id: "pc2",
                              type: "call",
                              date: "2026-02-25T14:30:00",
                              description:
                                "Follow-up call regarding mobile responsiveness. Client requested tablet breakpoint adjustments.",
                            },
                            {
                              id: "pc3",
                              type: "email",
                              date: "2026-02-20T09:15:00",
                              description:
                                "Shared updated design mockups for review. Awaiting feedback on the navigation structure.",
                            },
                          ],
                        },
                        {
                          projectName: "SEO Optimization",
                          projectStatus: "In Progress",
                          conversations: [
                            {
                              id: "pc4",
                              type: "call",
                              date: "2026-02-28T11:00:00",
                              description:
                                "Reviewed keyword strategy and content plan for Q2. Agreed on targeting 15 high-priority keywords.",
                            },
                            {
                              id: "pc5",
                              type: "email",
                              date: "2026-02-22T16:45:00",
                              description:
                                "Sent monthly SEO performance report. Organic traffic up 23% from last month.",
                            },
                          ],
                        },
                        {
                          projectName: "Brand Identity",
                          projectStatus: "Completed",
                          conversations: [
                            {
                              id: "pc6",
                              type: "meeting",
                              date: "2026-02-15T10:00:00",
                              description:
                                "Final brand guideline presentation. Client signed off on all deliverables.",
                            },
                          ],
                        },
                      ];

                      // Merge real activities into the first project
                      if (clientActivities.length > 0) {
                        projectConversations[0].conversations = [
                          ...clientActivities.map((a) => ({
                            id: a.id,
                            type: a.type,
                            date: a.date,
                            description: a.description,
                          })),
                          ...projectConversations[0].conversations,
                        ];
                      }

                      return projectConversations.map((project, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
                        >
                          {/* Project Header */}
                          <div className="flex items-center justify-between p-4 bg-slate-50/50 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-sm ${project.projectStatus === "Active"
                                  ? "bg-secondary"
                                  : project.projectStatus === "Completed"
                                    ? "bg-success"
                                    : "bg-info"
                                  }`}
                              >
                                <Briefcase size={14} strokeWidth={2.5} />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-primary tracking-tight">
                                  {project.projectName}
                                </h4>
                                <p className="text-[9px] font-bold text-slate-400  tracking-widest">
                                  {project.conversations.length} conversations
                                </p>
                              </div>
                            </div>
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[8px] font-bold  tracking-widest border ${project.projectStatus === "Active"
                                ? "bg-secondary/10 text-secondary border-secondary/20"
                                : project.projectStatus === "Completed"
                                  ? "bg-success/10 text-success border-success/20"
                                  : "bg-info/10 text-info border-info/20"
                                }`}
                            >
                              {project.projectStatus}
                            </span>
                          </div>

                          {/* Conversations Timeline */}
                          <div className="p-4">
                            <div className="relative border-l-2 border-slate-100 ml-3 space-y-4">
                              {project.conversations.map((conv) => (
                                <div key={conv.id} className="ml-6 relative">
                                  <div
                                    className={`absolute -left-[33px] w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-sm z-10 ${conv.type === "email"
                                      ? "bg-info"
                                      : conv.type === "call"
                                        ? "bg-success"
                                        : conv.type === "meeting"
                                          ? "bg-secondary"
                                          : "bg-slate-400"
                                      }`}
                                  >
                                    {conv.type === "call" ? (
                                      <Phone size={11} strokeWidth={2.5} />
                                    ) : conv.type === "meeting" ? (
                                      <Calendar size={11} strokeWidth={2.5} />
                                    ) : (
                                      <Mail size={11} strokeWidth={2.5} />
                                    )}
                                  </div>
                                  <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className="text-[9px] font-bold text-slate-400  tracking-widest">
                                        {new Date(conv.date).toLocaleDateString(
                                          [],
                                          {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                          },
                                        )}
                                      </span>
                                      <span
                                        className={`text-[8px] font-bold  tracking-widest px-2 py-0.5 rounded-md ${conv.type === "call"
                                          ? "bg-success/10 text-success"
                                          : conv.type === "meeting"
                                            ? "bg-secondary/10 text-secondary"
                                            : "bg-info/10 text-info"
                                          }`}
                                      >
                                        {conv.type}
                                      </span>
                                    </div>
                                    <p className="text-[12px] font-medium text-primary leading-relaxed">
                                      {conv.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ));
                    })()
                  )}
                </div>
              )}
              {activeTab === "projects" && (
                <div className="space-y-4 animate-fade-in">
                  {clientProjects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() =>
                        onSelectProject && onSelectProject(project)
                      }
                      className="p-4 bg-white border border-slate-200 rounded-xl hover:border-secondary hover:shadow-lg cursor-pointer transition-all flex items-center gap-5"
                    >
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-primary truncate mb-1">
                          {project.name}
                        </h4>
                        <div className="w-full bg-slate-50 border border-slate-100 rounded-full h-2 overflow-hidden mt-3">
                          <div
                            className="bg-secondary h-full rounded-full transition-all duration-1000"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] font-bold text-primary">
                          ${(project.budget / 1000).toFixed(0)}k
                        </p>
                        <p className="text-[8px] font-bold text-slate-400  tracking-widest mt-1">
                          {project.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;
