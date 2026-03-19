import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { createPortal } from "react-dom";
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
  Search,
  Check,
  CheckCircle2,
  ChevronDown,
  Globe,
  UserCheck,
} from "lucide-react";
import { MOCK_ACTIVITIES } from "../../constants/mockData";
import {
  generateClientSummary,
  suggestNextAction,
} from "../../services/aiService";
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

const ClientDetail = ({
  client,
  onBack,
  onUpdateClient,
  onAddActivity,
  activities,
  followUps = [],
  initialTab = "overview",
  onSelectProject,
  projects = [],
}) => {
  const isLead = client.status === "Lead" || client.status === "Dismissed";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [nextAction, setNextAction] = useState("");
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "",
    leadType: "Warm",
    notes: "",
    website: "",
    projectCategory: 1,
    country: "",
    state: "",
    currency: "",
    organisationName: "",
    clientStatus: "Active",
  });

  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditCategoryDropdownOpen, setIsEditCategoryDropdownOpen] =
    useState(false);
  const [isEditStatusDropdownOpen, setIsEditStatusDropdownOpen] =
    useState(false);
  const countryButtonRef = useRef(null);
  const [countryDropdownStyle, setCountryDropdownStyle] = useState({});

  useEffect(() => {
    if (isCountryDropdownOpen && countryButtonRef.current) {
      const rect = countryButtonRef.current.getBoundingClientRect();
      setCountryDropdownStyle({
        position: "fixed",
        top: `${rect.bottom + 8}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: 9999,
      });
    }
  }, [isCountryDropdownOpen]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Update form data when modal opens or client changes
  useEffect(() => {
    if (showEditModal && client) {
      let localPhone = client.phone || "";
      let usedCountryCode = "";

      // Try to extract country code from the phone number
      if (localPhone.startsWith("+")) {
        // Find the matching country code from countries list
        const matchingCountry = [...countries]
          .sort((a, b) => b.code.length - a.code.length) // Sort by length descending to match longest code first (e.g., +1-242 before +1)
          .find((c) => localPhone.startsWith(c.code));

        if (matchingCountry) {
          usedCountryCode = matchingCountry.code;
          localPhone = localPhone.substring(usedCountryCode.length).trim();
        }
      }

      // If no country code found from phone, try to derive from client.country
      if (!usedCountryCode && client.country) {
        // Check if client.country is itself a country code (e.g., "+91")
        const countryByCode = countries.find((c) => c.code === client.country);
        if (countryByCode) {
          usedCountryCode = countryByCode.code;
        } else {
          // Check if client.country is a country name (e.g., "India")
          const countryByName = countries.find(
            (c) => c.name.toLowerCase() === client.country.toLowerCase()
          );
          if (countryByName) {
            usedCountryCode = countryByName.code;
          }
        }
      }

      setEditFormData({
        name: client.name || "",
        email: client.email || "",
        phone: localPhone,
        countryCode: usedCountryCode,
        leadType: client.leadType || "Warm",
        notes: client.notes || "",
        website: client.website || "",
        projectCategory:
          client.projectCategory || REVERSE_CATEGORY_MAP[client.industry] || 1,
        country: client.country || "",
        state: client.state || "",
        currency: client.currency || "",
        organisationName: client.organisationName || "",
        clientStatus: client.clientStatus || "Active",
      });
    }
  }, [showEditModal, client]);

  const [isLogging, setIsLogging] = useState(false);
  const [logData, setLogData] = useState({
    type: "call",
    description: "",
    projectId: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().split(" ")[0].substring(0, 5),
  });

  const [clientFollowUps, setClientFollowUps] = useState([]);

  useEffect(() => {
    if (client && client.id) {
       fetchClientFollowups();
    }
  }, [client]);

  const fetchClientFollowups = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/client-followups/${client.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setClientFollowUps(data);
      }
    } catch (error) {
      console.error("Error fetching client followups:", error);
    }
  };

  const clientProjects = projects.filter((p) => p.clientId == client.id);
  const clientActivities = activities.filter(
    (a) => a.clientId == client.id || (client.lead_id && a.clientId == client.lead_id),
  );
  const completedFollowUps = clientFollowUps.filter(
    (f) => f.status === "completed",
  );

  const handleLogInteraction = (e) => {
    e.preventDefault();
    if (onAddActivity && logData.description) {
      const combinedDateTime = new Date(`${logData.date}T${logData.time}`);
      onAddActivity({
        clientId: client.id,
        type: logData.type,
        description: logData.description,
        projectName: clientProjects.find(p => p.id === logData.projectId)?.name || "",
        projectId: logData.projectId,
        date: combinedDateTime.toISOString(),
      });
      setLogData({
        ...logData,
        description: "",
        projectId: "",
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().split(" ")[0].substring(0, 5),
      });
      setIsLogging(false);
    }
  };

  return (
    <div className="w-full relative h-full">
      <div className="max-w-2xl">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-primary tracking-tight mb-2">
          {isLead ? "Lead Overview" : "Client Overview"}
        </h2>
        <p className="text-sm text-textMuted font-medium leading-relaxed mb-5">
          {isLead
            ? "Get a complete overview of lead details."
            : "Get a complete overview of client details."}
        </p>
      </div>
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
                    {isLead
                      ? client.company || ""
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
            {isLead && (
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
                        Edit {isLead ? "Lead" : "Client"} Details
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
                          phone: `${editFormData.countryCode}${editFormData.phone}`,
                          leadType: editFormData.leadType,
                          notes: editFormData.notes,
                          website: editFormData.website,
                          projectCategory: editFormData.projectCategory,
                          country: editFormData.country,
                          state: editFormData.state,
                          currency: editFormData.currency,
                          organisationName: editFormData.organisationName,
                          clientStatus: editFormData.clientStatus,
                        };
                        console.log("=== FORM SUBMISSION DEBUG ===");
                        console.log(
                          "Submitting edit form with data:",
                          formDataToSubmit,
                        );
                        console.log(
                          "Website value being sent:",
                          formDataToSubmit.website,
                        );

                        await onUpdateClient(client.id, formDataToSubmit);

                        toast.success("Details updated successfully!");
                        console.log("=== END DEBUG ===");
                        setShowEditModal(false);
                      } catch (error) {
                        console.error("Failed to update lead:", error);
                        toast.error("Failed to update lead. Please try again.");
                      }
                    }
                  }}
                  className="p-5 space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary  tracking-widest ml-1 uppercase">
                      FULL NAME
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Sameer Kapoor"
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
                    <label className="text-[10px] font-bold text-primary  tracking-widest ml-1 uppercase">
                      EMAIL ID
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="sameer@fintech.com"
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
                    <SearchableDropdown
                      label="Country Code"
                      options={countries.map((c) => ({
                        name: `${c.name} (${c.code})`,
                        code: c.code,
                      }))}
                      value={editFormData.countryCode}
                      onChange={(val) => {
                        const selectedCountry = countries.find(
                          (c) => c.code === val,
                        );
                        setEditFormData({
                          ...editFormData,
                          countryCode: val,
                          country: selectedCountry
                            ? selectedCountry.name
                            : editFormData.country,
                        });
                      }}
                      placeholder="Select Country Code"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary  tracking-widest ml-1 uppercase">
                      PHONE NUMBER
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="e.g. 98765 43210"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium"
                      value={editFormData.phone}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          phone: e.target.value.replace(/\D/g, ""),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary  tracking-widest ml-1 uppercase">
                      WEBSITE URL (OPTIONAL)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. www.fintech.com"
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

                  {!isLead && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-primary  tracking-widest ml-1 uppercase">
                        ORGANISATION NAME
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Corp"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium"
                        value={editFormData.organisationName}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            organisationName: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}

                  {!isLead &&
                    (editFormData.country === "India" ? (
                      <SearchableDropdown
                        label="CLIENT STATE"
                        options={indianStates}
                        value={editFormData.state}
                        onChange={(val) =>
                          setEditFormData({ ...editFormData, state: val })
                        }
                        placeholder="Select State"
                      />
                    ) : (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-primary  tracking-widest ml-1 uppercase">
                          CLIENT STATE
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. California"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium"
                          value={editFormData.state}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              state: e.target.value,
                            })
                          }
                        />
                      </div>
                    ))}

                  {!isLead && (
                    <>
                      <SearchableDropdown
                        label="CLIENT CURRENCY"
                        options={commonCurrencies.map((c) => ({
                          name: `${c.code} (${c.symbol})`,
                          code: c.code,
                        }))}
                        value={editFormData.currency}
                        onChange={(val) =>
                          setEditFormData({ ...editFormData, currency: val })
                        }
                        placeholder="Select Currency"
                      />

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-primary  tracking-widest ml-1 uppercase">
                          CLIENT STATUS
                        </label>
                        <select
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-bold"
                          value={editFormData.clientStatus}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              clientStatus: e.target.value,
                            })
                          }
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary  tracking-widest ml-1 uppercase">
                      {isLead ? "Lead" : "Client"} Category
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
                          {CATEGORY_MAP[editFormData.projectCategory] ||
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
                                  setEditFormData({
                                    ...editFormData,
                                    projectCategory: catId,
                                  });
                                  setIsEditCategoryDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-[10px] font-bold  tracking-widest transition-colors ${
                                  editFormData.projectCategory === catId
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

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary  tracking-widest ml-1 uppercase">
                      {isLead ? "Lead Status" : "Project Status"}
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
                          {editFormData.leadType || "Select Status"}
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
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[90] animate-fade-in-up origin-top">
                            <div className="bg-[#18254D] px-4 py-3 border-b border-white/10">
                              <p className="text-[9px] font-bold text-white/50  tracking-widest">
                                Select Status
                              </p>
                            </div>
                            {(client.isConverted
                              ? ["Hot", "Warm", "Cold", "Converted"]
                              : ["Hot", "Warm", "Cold"]
                            ).map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => {
                                  setEditFormData({
                                    ...editFormData,
                                    leadType: status,
                                  });
                                  setIsEditStatusDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-[10px] font-bold  tracking-widest transition-colors ${
                                  editFormData.leadType === status
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
                                    <Snowflake
                                      size={12}
                                      className="text-info"
                                    />
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

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary  tracking-widest ml-1 uppercase">
                      MESSAGE
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Additional details about the project requirements or client background..."
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
                      Update {isLead ? "Lead" : "Client"}
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

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary  tracking-widest ml-1">
                      {isLead ? "Subject" : "Project Name"}
                    </label>
                    {!isLead && (
                      <select
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:outline-none text-sm font-medium appearance-none cursor-pointer"
                        value={logData.projectId}
                        onChange={(e) =>
                          setLogData({
                            ...logData,
                            projectId: e.target.value,
                          })
                        }
                      >
                        <option value="" disabled>
                          Select a project...
                        </option>
                        {clientProjects.length > 0 ? (
                          clientProjects.map((project) => (
                            <option key={project.id} value={project.id}>
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
                    )}
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
                            setLogData({
                              ...logData,
                              type: type,
                            })
                          }
                          className={`py-2 px-3 rounded-xl border text-[10px] font-bold  tracking-widest transition-all ${
                            logData.type === type
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
                      placeholder="e.g. Discussed new service package and finalized onboarding steps..."
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
                  {client.organisationName && (
                    <div className="flex items-center gap-4 p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm group">
                      <Briefcase
                        size={14}
                        className="text-slate-400 shrink-0"
                      />
                      <span className="text-xs font-bold text-primary truncate">
                        {client.organisationName}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm group">
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
                      {client.country ? `${client.country} ` : ""}
                      {client.phone}
                    </span>
                  </div>
                  {!isLead && (client.state || client.country) && (
                    <div className="flex items-center gap-4 p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm group">
                      <MapPin size={14} className="text-slate-400 shrink-0" />
                      <span className="text-xs font-bold text-primary truncate">
                        {client.state ? `${client.state}, ` : ""}
                        {client.country}
                      </span>
                    </div>
                  )}
                  {client.website && (
                    <a
                      href={
                        client.website.startsWith("http")
                          ? client.website
                          : `https://${client.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm group hover:border-secondary transition-all"
                    >
                      <Globe
                        size={14}
                        className="text-slate-400 group-hover:text-secondary shrink-0"
                      />
                      <span className="text-xs font-bold text-primary truncate group-hover:text-secondary">
                        {client.website.replace(/^https?:\/\//, "")}
                      </span>
                    </a>
                  )}
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
                    label: "Conversations",
                  },
                  ...(!isLead ? [{ id: "projects", label: "Projects" }] : []),
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
                  {isLead ? (
                    <>
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 group relative overflow-hidden hover:shadow-md hover:border-secondary/30 transition-all">
                        <div className="w-8 h-8 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center mb-3 group-hover:bg-secondary group-hover:text-white transition-all border border-secondary/20">
                          <Zap size={16} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-[9px] font-bold text-slate-400  tracking-widest mb-1">
                          Lead Status
                        </h3>
                        <p
                          className={`text-lg font-bold tracking-tight  ${
                            client.leadType === "Hot"
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
                          {CATEGORY_MAP[client.projectCategory] ||
                            client.industry ||
                            "Tech"}
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
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 group relative overflow-hidden hover:shadow-md hover:border-secondary/30 transition-all">
                        <div className="w-8 h-8 bg-green-500/10 text-green-600 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-600 group-hover:text-white transition-all border border-green-500/20">
                          <span className="text-xs font-bold leading-none">
                            {commonCurrencies.find(c => c.code === client.currency)?.symbol || "$"}
                          </span>
                        </div>
                        <h3 className="text-[9px] font-bold text-slate-400  tracking-widest mb-1">
                          Billing Currency
                        </h3>
                        <p className="text-lg font-bold text-primary tracking-tight ">
                          {client.currency || ""}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 group relative overflow-hidden hover:shadow-md hover:border-secondary/30 transition-all">
                        <div className="w-8 h-8 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-all border border-blue-500/20">
                          <CheckCircle2 size={16} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-[9px] font-bold text-slate-400  tracking-widest mb-1">
                          Client Status
                        </h3>
                        <p className="text-lg font-bold text-primary tracking-tight ">
                          {client.clientStatus || "Active"}
                        </p>
                      </div>
                      {/* <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 group relative overflow-hidden md:col-span-2 hover:shadow-md hover:border-secondary/30 transition-all">
                        <div className="w-8 h-8 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-all border border-primary/20">
                          <Briefcase size={16} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-[9px] font-bold text-slate-400  tracking-widest mb-3 uppercase">
                          Recent Projects
                        </h3>
                        <div className="space-y-3">
                          {clientProjects.length > 0 ? (
                            clientProjects.map((project) => (
                              <div
                                key={project.id}
                                className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100 group-hover:border-secondary/20 transition-all"
                              >
                                <div>
                                  <h4 className="text-sm font-bold text-primary tracking-tight">
                                    {project.name}
                                  </h4>
                                  <p className="text-[9px] font-bold text-slate-400  tracking-widest">
                                    {project.status} • {project.progress}%
                                    Complete
                                  </p>
                                </div>
                                <button
                                  onClick={() => setActiveTab("projects")}
                                  className="p-2 hover:bg-white rounded-lg text-slate-300 hover:text-secondary transition-all"
                                >
                                  <ChevronRight size={16} />
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs font-medium text-slate-400 italic">
                              No projects associated with this client.
                            </p>
                          )}
                        </div>
                      </div> */}
                    </>
                  )}
                </div>
              )}
              {activeTab === "activity" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-primary tracking-tight">
                      {isLead ? "Lead Conversations" : "Client Conversations"}
                    </h3>
                  </div>

                  {isLead ? (
                    /* Lead: Simple flat timeline, no project grouping */
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="p-4">
                        <div className="relative border-l-2 border-slate-100 ml-3 space-y-4">
                          {clientActivities.length === 0 &&
                          completedFollowUps.length === 0 ? (
                            <p className="ml-6 text-[10px] font-bold text-slate-300  tracking-widest py-4">
                              No conversations logged yet
                            </p>
                          ) : (
                            <>
                              {completedFollowUps.map((fu) => (
                                <div
                                  key={`fu-${fu.id}`}
                                  className="ml-6 relative"
                                >
                                  <div
                                    className={`absolute -left-[33px] w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-sm z-10 ${
                                      fu.followup_mode?.toLowerCase() === "call"
                                        ? "bg-success"
                                        : fu.followup_mode?.toLowerCase() ===
                                            "email"
                                          ? "bg-info"
                                          : fu.followup_mode?.toLowerCase() ===
                                              "meeting"
                                            ? "bg-secondary"
                                            : fu.followup_mode?.toLowerCase() ===
                                                "whatsapp"
                                              ? "bg-[#25D366]"
                                              : "bg-success"
                                    }`}
                                  >
                                    {fu.followup_mode?.toLowerCase() ===
                                    "call" ? (
                                      <Phone size={11} strokeWidth={2.5} />
                                    ) : fu.followup_mode?.toLowerCase() ===
                                      "email" ? (
                                      <Mail size={11} strokeWidth={2.5} />
                                    ) : fu.followup_mode?.toLowerCase() ===
                                      "meeting" ? (
                                      <Calendar size={11} strokeWidth={2.5} />
                                    ) : fu.followup_mode?.toLowerCase() ===
                                      "whatsapp" ? (
                                      <MessageSquare
                                        size={11}
                                        strokeWidth={2.5}
                                      />
                                    ) : (
                                      <Phone size={11} strokeWidth={2.5} />
                                    )}
                                  </div>
                                  <div className="bg-success/5 p-3 rounded-xl border border-success/20 hover:border-success/40 transition-all">
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className="text-[9px] font-bold text-slate-400  tracking-widest">
                                        {fu.completed_at
                                          ? new Date(
                                              fu.completed_at,
                                            ).toLocaleDateString([], {
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric",
                                            })
                                          : fu.dueDate
                                            ? new Date(
                                                fu.dueDate,
                                              ).toLocaleDateString([], {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                              })
                                            : ""}
                                        {fu.completed_at &&
                                          " · " +
                                            new Date(
                                              fu.completed_at,
                                            ).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                              hour12: true,
                                            })}
                                      </span>
                                      <span className="text-[8px] font-bold  tracking-widest px-2 py-0.5 rounded-md bg-success/10 text-success">
                                        Follow-Up Completed
                                      </span>
                                    </div>
                                    <p className="text-[11px] font-bold text-primary tracking-tight mb-1">
                                      {fu.title}
                                    </p>
                                    <p className="text-[12px] font-medium text-primary/80 leading-relaxed">
                                      {fu.follow_brief}
                                    </p>
                                    {(fu.completed_by || fu.completed_at) && (
                                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2">
                                        {fu.completed_by && (
                                          <p className="text-[9px] font-bold text-slate-400 tracking-widest">
                                            Completed by: {fu.completed_by}
                                          </p>
                                        )}
                                        {fu.completed_at && (
                                          <p className="text-[9px] font-bold text-slate-400 tracking-widest">
                                            Completed At:{" "}
                                            {new Date(
                                              fu.completed_at,
                                            ).toLocaleDateString([], {
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric",
                                            })}
                                            {" · "}
                                            {new Date(
                                              fu.completed_at,
                                            ).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                              hour12: true,
                                            })}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {clientActivities.map((conv) => (
                                <div key={conv.id} className="ml-6 relative">
                                  <div
                                    className={`absolute -left-[33px] w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-sm z-10 ${
                                      conv.type === "email"
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
                                        className={`text-[8px] font-bold  tracking-widest px-2 py-0.5 rounded-md ${
                                          conv.type === "call"
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
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Client: Project-wise conversations */
                    (() => {
                      // 1. Initialize result with actual projects for this client
                      const projectGroups = clientProjects.map(p => ({
                        id: p.id,
                        projectName: p.name,
                        projectStatus: p.status,
                        interactions: []
                      }));

                      // 2. Add an "Other / General" group for interactions without a project
                      const generalInteractions = [];

                      // 3. Helper to find or add to group
                      const addToGroup = (interaction) => {
                        const targetProject = projectGroups.find(
                          (p) => 
                            (interaction.projectId && p.id == interaction.projectId) ||
                            (interaction.projectName && p.projectName === interaction.projectName)
                        );
                        if (targetProject) {
                           targetProject.interactions.push(interaction);
                        } else {
                           generalInteractions.push(interaction);
                        }
                      };

                      // 4. Distribute real activities
                      clientActivities.forEach(a => addToGroup({
                        id: a.id,
                        type: a.type,
                        date: a.date,
                        description: a.description,
                        projectName: a.projectName,
                        projectId: a.projectId,
                        source: 'activity'
                      }));

                      // 5. Distribute completed follow-ups (Summaries)
                      completedFollowUps.forEach(f => addToGroup({
                        id: `fu-${f.id}`,
                        type: (f.followup_mode || 'call').toLowerCase(),
                        date: f.completed_at || f.dueDate,
                        description: f.follow_brief || "No summary provided",
                        originalDescription: f.description,
                        title: f.title,
                        completedBy: f.completed_by,
                        projectName: f.projectName,
                        projectId: f.projectId,
                        source: 'followup'
                      }));

                      const allGroups = [
                        ...projectGroups,
                        ...(generalInteractions.length > 0 ? [{
                          projectName: "General / Other",
                          projectStatus: "N/A",
                          interactions: generalInteractions
                        }] : [])
                      ];

                      return (
                        <div className="space-y-4">
                          {allGroups.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-8 text-center">
                              <p className="text-[10px] font-bold text-slate-300 tracking-widest uppercase">
                                No conversations logged yet
                              </p>
                            </div>
                          ) : (
                            allGroups.map((group, groupIdx) => (
                              <div
                                key={`group-${groupIdx}`}
                                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-6"
                              >
                                {/* Project Header */}
                                <div className="flex items-center justify-between p-4 bg-slate-50/50 border-b border-slate-100">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-sm ${
                                        group.projectStatus === "Active" || group.projectStatus === "Planning"
                                          ? "bg-secondary"
                                          : group.projectStatus === "Completed"
                                            ? "bg-success"
                                            : "bg-slate-400"
                                      }`}
                                    >
                                      <Briefcase size={14} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-bold text-primary tracking-tight">
                                        {group.projectName}
                                      </h4>
                                      <p className="text-[9px] font-bold text-slate-400  tracking-widest">
                                        {group.interactions.length} conversations
                                      </p>
                                    </div>
                                  </div>
                                  {group.projectStatus !== "N/A" && (
                                    <span
                                      className={`px-2.5 py-1 rounded-lg text-[8px] font-bold  tracking-widest border ${
                                        group.projectStatus === "Active" || group.projectStatus === "Planning"
                                          ? "bg-secondary/10 text-secondary border-secondary/20"
                                          : group.projectStatus === "Completed"
                                            ? "bg-success/10 text-success border-success/20"
                                            : "bg-info/10 text-info border-info/20"
                                      }`}
                                    >
                                      {group.projectStatus}
                                    </span>
                                  )}
                                </div>

                                {/* Conversations Timeline */}
                                <div className="p-4">
                                  <div className="relative border-l-2 border-slate-100 ml-3 space-y-4">
                                    {group.interactions
                                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                                      .map((conv) => (
                                        <div key={conv.id} className="ml-6 relative">
                                          <div
                                            className={`absolute -left-[33px] w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-sm z-10 ${
                                              conv.source === 'followup' ? "bg-success" :
                                              conv.type === "email" ? "bg-info" : 
                                              conv.type === "call" ? "bg-success" : 
                                              conv.type === "meeting" ? "bg-secondary" : 
                                              "bg-slate-400"
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
                                          <div className={`${conv.source === 'followup' ? 'bg-success/5 border-success/20 shadow-sm shadow-success/5' : 'bg-slate-50/50 border-slate-100'} p-3 rounded-xl border transition-all`}>
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
                                                {" · "}
                                                {new Date(conv.date).toLocaleTimeString([], {
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                                  hour12: true
                                                })}
                                              </span>
                                              <span
                                                className={`text-[8px] font-bold  tracking-widest px-2 py-0.5 rounded-md ${
                                                  conv.source === 'followup' ? 'bg-success/10 text-success' :
                                                  conv.type === "call"
                                                    ? "bg-success/10 text-success"
                                                    : conv.type === "meeting"
                                                      ? "bg-secondary/10 text-secondary"
                                                      : "bg-info/10 text-info"
                                                }`}
                                              >
                                                {conv.source === 'followup' ? 'FOLLOW-UP COMPLETED' : conv.type.toUpperCase()}
                                              </span>
                                            </div>
                                            {conv.title && (
                                              <p className="text-[10px] font-bold text-primary tracking-tight mb-1 opacity-70">
                                                {conv.title}
                                              </p>
                                            )}
                                            <div className="space-y-3">
                                              {conv.source === 'followup' && conv.originalDescription && (
                                                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                                                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                    Planned Follow-up
                                                  </p>
                                                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium capitalize">
                                                    {conv.originalDescription}
                                                  </p>
                                                </div>
                                              )}
                                              <div>
                                                {conv.source === 'followup' && (
                                                  <p className="text-[8px] font-bold text-success uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                                                    Completion Summary
                                                  </p>
                                                )}
                                                <p className="text-[12px] font-medium text-primary leading-relaxed">
                                                  {conv.description}
                                                </p>
                                              </div>
                                            </div>
                                            {conv.completedBy && (
                                              <p className="text-[9px] font-bold text-slate-400 tracking-widest mt-2">
                                                Completed by: {conv.completedBy}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      );
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
                        {/* <div className="w-full bg-slate-50 border border-slate-100 rounded-full h-2 overflow-hidden mt-3">
                          <div
                            className="bg-secondary h-full rounded-full transition-all duration-1000"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div> */}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] font-bold text-primary">
                          {commonCurrencies.find(c => c.code === client.currency)?.symbol || "$"} {(project.budget / 1000).toFixed(0)}
                          k
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
