import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import { getAuthHeaders, isAuthenticated, logout } from "./utils/auth";
import Layout from "./layouts/Layout";
import Dashboard from "./pages/dashboard/Dashboard";
import ClientList from "./pages/clients/ClientList";
import ClientDetail from "./pages/clients/ClientDetail";
import LeadList from "./pages/leads/LeadList";
import ProjectBoard from "./pages/projects/ProjectBoard";
import ProjectOverview from "./pages/projects/ProjectOverview";
import EnquiryList from "./pages/enquiries/EnquiryList";
import FollowUpList from "./pages/followups/FollowUpList";
import Settings from "./pages/settings/Settings";
import LoginPage from "./pages/auth/LoginPage";
import {
  MOCK_CLIENTS,
  MOCK_ENQUIRIES,
  MOCK_FOLLOW_UPS,
  MOCK_ACTIVITIES,
  MOCK_PROJECTS,
} from "./constants/mockData";
import { BASE_URL } from "./constants/config";

// Simple wrapper for client detail pages
function ClientDetailWrapper({ clients, type, activities, followUps, onUpdateClient, onAddActivity, onSelectProject }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const client = clients.find((c) => c.id == id);

  if (!client) return <Navigate to={`/${type}`} replace />;

  return (
    <ClientDetail
      client={client}
      onBack={() => navigate(`/${type}`)}
      onUpdateClient={onUpdateClient}
      onAddActivity={onAddActivity}
      activities={activities}
      followUps={followUps}
      initialTab={location.state?.tab || "overview"}
      onSelectProject={onSelectProject}
    />
  );
}

// Simple wrapper for project overview
function ProjectOverviewWrapper({ projects, clients, followUps, onUpdateProject }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projects.find((p) => p.id == id);

  if (!project) return <Navigate to="/projects" replace />;

  return (
    <ProjectOverview
      project={project}
      client={clients.find((c) => c.id === project.clientId)}
      onBack={() => navigate("/projects")}
      onUpdateProject={onUpdateProject}
      followUps={followUps}
    />
  );
}

// Main App Routes
function AppRoutes() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check for both user and token
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    return !!(user && token);
  });
  
  // Data states
  const [clients, setClients] = useState(MOCK_CLIENTS);
  const [enquiries, setEnquiries] = useState(MOCK_ENQUIRIES);
  const [followUps, setFollowUps] = useState(MOCK_FOLLOW_UPS);
  const [activities, setActivities] = useState(MOCK_ACTIVITIES);
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [aiModels, setAiModels] = useState([]);
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(true);

  // Fetch AI models on mount
  useEffect(() => {
    if (!isLoggedIn) return;

    fetch(`${BASE_URL}/api/ai-models`, {
      headers: getAuthHeaders(),
    })
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        setAiModels(data.map((m) => ({
          id: m.id,
          name: m.name,
          provider: m.provider,
          modelId: m.model_id,
          isDefault: m.is_default,
        })));
      })
      .catch(() => console.log("Failed to fetch AI models"));
  }, [isLoggedIn]);

  // Fetch leads from API on mount
  useEffect(() => {
    if (!isLoggedIn) {
      setLeads([]);
      setLeadsLoading(false);
      return;
    }

    setLeadsLoading(true);
    fetch(`${BASE_URL}/api/get-leads`, {
      headers: getAuthHeaders(),
    })
      .then((res) => {
        if (res.status === 401) {
          // Token invalid or expired
          handleLogout();
          return null;
        }
        return res.ok ? res.json() : [];
      })
      .then((data) => {
        if (!data) return;
        
        // Extract leads array from response
        const leadsArray = Array.isArray(data) ? data : data.leads || [];
        
        // Transform API data to match component expected format
        const transformedLeads = leadsArray.map((lead) => ({
          id: lead.id?.toString() || lead.uuid,
          name: lead.full_name || "Unknown",
          company: lead.website_url?.replace(/^https?:\/\//, "").split("/")[0] || "",
          email: lead.email || "",
          phone: lead.phone_number || "",
          status: lead.lead_status === "Dismissed" ? "Dismissed" : "Lead",
          leadType: lead.lead_status || "Warm",
          projectCategory: lead.lead_category || "Tech",
          industry: lead.lead_category || "Tech",
          website: lead.website_url || "",
          country: lead.country || "",
          notes: lead.message || "",
          joinedDate: lead.created_at ? lead.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
          lastContact: lead.updated_at ? lead.updated_at.split("T")[0] : new Date().toISOString().split("T")[0],
          avatar: `https://picsum.photos/100/100?random=${lead.id || Math.floor(Math.random() * 100)}`,
        }));
        
        setLeads(transformedLeads);
        
        // Also update clients state with real leads, keeping non-lead clients
        setClients(prev => {
          const nonLeads = prev.filter(c => c.status !== "Lead" && c.status !== "Dismissed");
          return [...nonLeads, ...transformedLeads];
        });
        
        setLeadsLoading(false);
      })
      .catch(() => {
        console.log("Failed to fetch leads");
        setLeads([]);
        setLeadsLoading(false);
      });
  }, [isLoggedIn]);

  // Fetch followups on mount
  useEffect(() => {
    if (!isLoggedIn) {
      setFollowUps([]);
      return;
    }

    fetch(`${BASE_URL}/api/get-followups`, {
      headers: getAuthHeaders(),
    })
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        setFollowUps(data);
      })
      .catch(() => console.log("Failed to fetch followups"));
  }, [isLoggedIn]);

  // Simple handlers
  function handleLogin(data) {
    // Store both user and token
    localStorage.setItem("user", JSON.stringify(data.user));
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    setIsLoggedIn(true);
    navigate("/dashboard");
  }

  function handleLogout() {
    logout(); // Use utility function
  }

  function handleClientSelect(client, tab = "overview") {
    // Both active leads and dismissed leads should use the "leads" route
    const route = (client.status === "Lead" || client.status === "Dismissed") ? "leads" : "clients";
    navigate(`/${route}/${client.id}`, { state: { tab } });
  }

  function handleDeleteClient(id) {
    setClients((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleDeleteLead(id) {
    try {
      // Find the lead to get its ID
      const leadToDelete = leads.find((l) => l.id == id);
      if (!leadToDelete) return;

      console.log("Deleting lead:", id);

      // Call API to delete the lead - use correct endpoint with ID in path
      const res = await fetch(`${BASE_URL}/api/delete-lead/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      console.log("Delete API response status:", res.status);

      if (res.ok) {
        const result = await res.json();
        console.log("Lead deleted successfully:", result);
        
        // Remove from local state after successful API call
        setLeads((prev) => prev.filter((l) => l.id != id));
        
        // Also update clients array to keep them in sync
        setClients((prev) => prev.filter((c) => c.id != id));
      } else {
        const errorData = await res.json();
        console.error("Failed to delete lead:", errorData);
        alert("Failed to delete lead. Please try again.");
      }
    } catch (e) {
      console.error("Error deleting lead:", e);
      alert("An error occurred while deleting lead.");
    }
  }

  async function handleAddClient(data) {
    if (data.status === "Lead") {
      try {
        const payload = {
          full_name: data.name,
          phone_number: data.phone,
          email: data.email,
          lead_status: data.leadType || "Warm",
          message: data.notes || "",
          website_url: data.website || "",
          country: data.country || "",
          lead_category: data.projectCategory || data.industry || "Tech",
        };

        const res = await fetch(`${BASE_URL}/api/add-lead`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const result = await res.json();
          const newLead = {
            id: result.lead?.id?.toString() || result.lead?.uuid || `new-${Date.now()}`,
            name: result.lead?.full_name || data.name,
            company: result.lead?.website_url ? result.lead.website_url.replace(/^https?:\/\//, "").split("/")[0] : "",
            email: result.lead?.email || data.email,
            phone: result.lead?.phone_number || data.phone,
            status: "Lead",
            leadType: result.lead?.lead_status || data.leadType || "Warm",
            projectCategory: result.lead?.lead_category || data.projectCategory || "Tech",
            industry: result.lead?.lead_category || data.industry || "Tech",
            country: result.lead?.country !== undefined ? result.lead.country : (data.country || ""),
            website: result.lead?.website_url || data.website || "",
            notes: result.lead?.message || data.notes || "",
            joinedDate: result.lead?.created_at ? result.lead.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
            lastContact: result.lead?.updated_at ? result.lead.updated_at.split("T")[0] : new Date().toISOString().split("T")[0],
            avatar: `https://picsum.photos/100/100?random=${result.lead?.id || Date.now() % 100}`,
          };
          
          setLeads([newLead, ...leads]);
          setClients([newLead, ...clients]);
        } else {
          console.error("Failed to add lead:", await res.json());
          alert("Failed to add lead. Please try again.");
        }
      } catch (err) {
        console.error("Error adding lead:", err);
        alert("An error occurred while adding lead.");
      }
    } else {
      const newClient = {
        id: `c-${Date.now()}`,
        ...data,
        avatar: `https://picsum.photos/100/100?random=${clients.length + 10}`,
        joinedDate: data.onboardingDate || new Date().toISOString().split("T")[0],
        lastContact: new Date().toISOString().split("T")[0],
        industry: data.projectCategory || data.industry || "Unknown",
        company: data.projectName || data.company || "",
        notes: `${data.notes || ""}\n\n[Project] ${data.projectName} | ${data.projectStatus}`,
      };
      
      setClients([newClient, ...clients]);
    }
  }

  function handleOnboardClient(id, data) {
    setClients((prev) => prev.map((c) => 
      c.id == id 
        ? { ...c, ...data, status: data.status, isConverted: true }
        : c
    ));
  }

  function handleUpdateClient(updated) {
    setClients((prev) => prev.map((c) => (c.id == updated.id ? updated : c)));
  }

  async function handleDismissLead(id) {
    try {
      // Find the lead to update
      const leadToUpdate = leads.find((l) => l.id == id);
      if (!leadToUpdate) return;

      console.log("Dismissing lead:", id);

      // Call API to update lead status - use correct endpoint with ID in path
      const res = await fetch(`${BASE_URL}/api/update-lead/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          full_name: leadToUpdate.name,
          phone_number: leadToUpdate.phone,
          email: leadToUpdate.email,
          lead_status: "Dismissed",
          message: leadToUpdate.notes,
          website_url: leadToUpdate.website || "",
          lead_category: leadToUpdate.projectCategory || "Tech",
        }),
      });

      console.log("Dismiss API response status:", res.status);

      if (res.ok) {
        const result = await res.json();
        console.log("Lead dismissed successfully:", result);
        
        // Transform API response to match frontend format
        const dismissedLead = {
          ...leadToUpdate,
          id: result.lead?.id?.toString() || id,
          name: result.lead?.full_name || leadToUpdate.name,
          company: result.lead?.website_url ? result.lead.website_url.replace(/^https?:\/\//, "").split("/")[0] : "",
          email: result.lead?.email || leadToUpdate.email,
          phone: result.lead?.phone_number || leadToUpdate.phone,
          status: "Dismissed",
          leadType: result.lead?.lead_status || "Warm",
          projectCategory: result.lead?.lead_category || leadToUpdate.projectCategory,
          website: result.lead?.website_url || leadToUpdate.website,
          notes: result.lead?.message || leadToUpdate.notes,
        };
        
        console.log("Transformed dismissed lead:", dismissedLead);
        
        // Update local state after successful API call with complete data
        setLeads((prev) => prev.map((l) => (l.id == id ? dismissedLead : l)));
        
        // Also update clients array to keep them in sync
        setClients((prev) => prev.map((c) => (c.id == id ? dismissedLead : c)));
      } else {
        const errorData = await res.json();
        console.error("Failed to dismiss lead:", errorData);
        alert("Failed to dismiss lead. Please try again.");
      }
    } catch (e) {
      console.error("Error dismissing lead:", e);
      alert("An error occurred while dismissing lead.");
    }
  }

  async function handleRestoreLead(id) {
    try {
      // Find the lead to update
      const leadToUpdate = leads.find((l) => l.id == id);
      if (!leadToUpdate) return;

      console.log("Restoring lead:", id);

      // Call API to update lead status back to Warm (Pending)
      // Send all required fields to preserve lead data
      const res = await fetch(`${BASE_URL}/api/update-lead/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          full_name: leadToUpdate.name,
          phone_number: leadToUpdate.phone,
          email: leadToUpdate.email,
          lead_status: "Warm",
          message: leadToUpdate.notes,
          website_url: leadToUpdate.website || "",
          lead_category: leadToUpdate.projectCategory || "Tech",
        }),
      });

      console.log("Restore API response status:", res.status);

      if (res.ok) {
        const result = await res.json();
        console.log("Lead restored successfully:", result);
        
        const restoredLead = {
          ...leadToUpdate,
          id: result.lead?.id?.toString() || id,
          name: result.lead?.full_name || leadToUpdate.name,
          company: result.lead?.website_url ? result.lead.website_url.replace(/^https?:\/\//, "").split("/")[0] : "",
          email: result.lead?.email || leadToUpdate.email,
          phone: result.lead?.phone_number || leadToUpdate.phone,
          status: "Lead",
          leadType: result.lead?.lead_status || "Warm",
          projectCategory: result.lead?.lead_category || leadToUpdate.projectCategory,
          website: result.lead?.website_url || leadToUpdate.website,
          notes: result.lead?.message || leadToUpdate.notes,
          isConverted: false
        };

        // Update local state after successful API call
        setLeads((prev) => prev.map((l) => (l.id == id ? restoredLead : l)));
        setClients((prev) => prev.map((c) => (c.id == id ? restoredLead : c)));
      } else {
        const errorData = await res.json();
        console.error("Failed to restore lead:", errorData);
        alert("Failed to restore lead. Please try again.");
      }
    } catch (e) {
      console.error("Error restoring lead:", e);
      alert("An error occurred while restoring lead.");
    }
  }

  async function handleEditLead(id, editData) {
    try {
      // Find the lead to update
      const leadToUpdate = leads.find((l) => l.id == id);
      if (!leadToUpdate) return;

      // 1. Calculate the expected new state (Optimistic Update)
      const websiteValue = editData.website !== undefined && editData.website !== null ? editData.website : (leadToUpdate.website || "");
      const newCompany = websiteValue ? websiteValue.replace(/^https?:\/\//, "").split("/")[0] : "";
      
      const optimisticLead = {
        ...leadToUpdate,
        name: editData.name !== undefined && editData.name !== null ? editData.name : leadToUpdate.name,
        company: newCompany,
        email: editData.email !== undefined && editData.email !== null ? editData.email : leadToUpdate.email,
        phone: editData.phone !== undefined && editData.phone !== null ? editData.phone : leadToUpdate.phone,
        leadType: editData.leadType !== undefined && editData.leadType !== null ? editData.leadType : leadToUpdate.leadType,
        projectCategory: editData.projectCategory !== undefined && editData.projectCategory !== null ? editData.projectCategory : (leadToUpdate.projectCategory || "Tech"),
        website: websiteValue,
        notes: editData.notes !== undefined && editData.notes !== null ? editData.notes : leadToUpdate.notes,
        country: editData.country !== undefined && editData.country !== null ? editData.country : (leadToUpdate.country || ""),
      };

      // 2. Update state immediately
      setLeads((prev) => prev.map((l) => (l.id == id ? optimisticLead : l)));
      setClients((prev) => prev.map((c) => (c.id == id ? optimisticLead : c)));

      // Call API to update the lead
      const res = await fetch(`${BASE_URL}/api/update-lead/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          full_name: optimisticLead.name,
          phone_number: optimisticLead.phone,
          email: optimisticLead.email,
          lead_status: optimisticLead.leadType,
          website_url: optimisticLead.website,
          country: optimisticLead.country,
          message: optimisticLead.notes,
          lead_category: optimisticLead.projectCategory,
        }),
      });

      if (!res.ok) {
        // Rollback on failure
        setLeads((prev) => prev.map((l) => (l.id == id ? leadToUpdate : l)));
        setClients((prev) => prev.map((c) => (c.id == id ? leadToUpdate : c)));
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update lead");
      }

      const updatedLead = await res.json();
      
      // Update with final data from API if necessary (e.g. IDs, timestamps)
      const finalLead = {
        ...optimisticLead,
        id: updatedLead.lead?.id?.toString() || id,
        joinedDate: updatedLead.lead?.created_at ? updatedLead.lead.created_at.split("T")[0] : leadToUpdate.joinedDate,
        lastContact: updatedLead.lead?.updated_at ? updatedLead.lead.updated_at.split("T")[0] : optimisticLead.lastContact,
      };

      setLeads((prev) => prev.map((l) => (l.id == id ? finalLead : l)));
      setClients((prev) => prev.map((c) => (c.id == id ? finalLead : c)));
      
      return finalLead;
    } catch (error) {
      console.error("Error updating lead:", error);
      throw error;
    }
  }

  function handleProjectSelect(project) {
    navigate(`/projects/${project.id}`);
  }

  function handleUpdateProject(updated) {
    setProjects((prev) => prev.map((p) => (p.id == updated.id ? updated : p)));
  }

  function handleAddActivity(data) {
    setActivities([{ id: `a-${Date.now()}`, ...data }, ...activities]);
  }

  async function handleAddFollowUp(data) {
    try {
      const res = await fetch(`${BASE_URL}/api/add-followup`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        const newFollowup = {
          ...result.followup,
          id: result.followup.id,
          status: result.followup.followup_status?.toLowerCase() || "pending",
          dueDate: result.followup.followup_date,
        };
        setFollowUps((prev) => [...prev, newFollowup]);
      } else {
        console.error("Failed to add follow-up:", await res.json());
      }
    } catch (err) {
      console.error("Error adding follow-up:", err);
    }
  }

  async function handleEditFollowUp(updated) {
    try {
      const res = await fetch(`${BASE_URL}/api/update-followup/${updated.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        setFollowUps((prev) => prev.map((f) => (f.id == updated.id ? updated : f)));
      } else {
        console.error("Failed to update follow-up:", await res.json());
      }
    } catch (err) {
      console.error("Error updating follow-up:", err);
    }
  }

  async function handleDeleteFollowUp(id) {
    try {
      const res = await fetch(`${BASE_URL}/api/delete-followup/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        setFollowUps((prev) => prev.filter((f) => f.id != id));
      } else {
        console.error("Failed to delete follow-up:", await res.json());
      }
    } catch (err) {
      console.error("Error deleting follow-up:", err);
    }
  }

  async function handleToggleFollowUpStatus(id, brief = "", completed_at = "", completed_by = "") {
    try {
      const followUp = followUps.find(f => f.id == id);
      if (!followUp) return;

      const nextStatus = followUp.status === "completed" ? "pending" : "completed";
      const res = await fetch(`${BASE_URL}/api/toggle-followup-status/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: nextStatus, brief, completed_at, completed_by }),
      });

      if (res.ok) {
        setFollowUps((prev) => prev.map((f) => 
          f.id == id ? { ...f, status: nextStatus, followup_status: nextStatus, follow_brief: brief } : f
        ));
      } else {
        console.error("Failed to toggle follow-up status:", await res.json());
      }
    } catch (err) {
      console.error("Error toggling follow-up status:", err);
    }
  }

  // Enquiry handlers
  function handlePromoteEnquiry(enquiry, type) {
    const newClient = {
      id: `c-${Date.now()}`,
      name: enquiry.name,
      company: enquiry.website ? enquiry.website.replace(/^https?:\/\//, "").split("/")[0] : "",
      email: enquiry.email,
      phone: enquiry.phone,
      status: "Lead",
      leadType: type,
      avatar: `https://picsum.photos/100/100?random=${clients.length + 10}`,
      joinedDate: new Date().toISOString().split("T")[0],
      lastContact: new Date().toISOString().split("T")[0],
      industry: "Unknown",
      notes: enquiry.message,
      website: enquiry.website,
    };
    setClients([newClient, ...clients]);
    setEnquiries((prev) => prev.filter((e) => e.id != enquiry.id));
    navigate("/leads");
  }

  function handleUpdateEnquiry(updated) {
    setEnquiries((prev) => prev.map((e) => (e.id == updated.id ? { ...e, ...updated } : e)));
  }

  function handleAddEnquiry(data) {
    setEnquiries([{ id: `e-${Date.now()}`, ...data, date: new Date().toISOString(), status: "new" }, ...enquiries]);
  }

  function handleClearNotifications() {
    setEnquiries((prev) => prev.map((e) => (e.status === "new" ? { ...e, status: "read" } : e)));
  }

  // AI Model handlers
  async function handleAddAiModel(model) {
    try {
      const res = await fetch(`${BASE_URL}/api/ai-models`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(model),
      });
      if (res.ok) {
        const data = await res.json();
        setAiModels([...aiModels, { ...model, id: data.id }]);
      }
    } catch (e) {
      console.log("Failed to add AI model");
    }
  }

  async function handleUpdateAiModel(updated) {
    try {
      const res = await fetch(`${BASE_URL}/api/ai-models/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setAiModels(aiModels.map((m) => (m.id == updated.id ? updated : m)));
      }
    } catch (e) {
      console.log("Failed to update AI model");
    }
  }

  async function handleDeleteAiModel(id) {
    try {
      const res = await fetch(`${BASE_URL}/api/ai-models/${id}`, { method: "DELETE" });
      if (res.ok) setAiModels(aiModels.filter((m) => m.id != id));
    } catch (e) {
      console.log("Failed to delete AI model");
    }
  }

  // Common props for FollowUpList routes
  const followUpProps = {
    followUps,
    clients,
    onToggleStatus: handleToggleFollowUpStatus,
    onAddFollowUp: handleAddFollowUp,
    onEditFollowUp: handleEditFollowUp,
    onDeleteFollowUp: handleDeleteFollowUp,
    onSelectClient: handleClientSelect,
    onNavigate: (tab) => navigate(`/${tab}`),
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={handleLogin} />}
      />

      <Route
        element={isLoggedIn ? <Layout onLogout={handleLogout} enquiries={enquiries} followUps={followUps} clients={clients} /> : <Navigate to="/login" replace />}
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route
          path="/dashboard"
          element={
            <Dashboard
              followUps={followUps}
              clients={clients}
              leads={leads}
              enquiries={enquiries}
              aiModels={aiModels}
              onSelectFollowUp={handleClientSelect}
              onViewAllFollowUps={() => navigate("/followups")}
              onNavigate={(tab) => navigate(`/${tab}`)}
              onClearNotifications={handleClearNotifications}
            />
          }
        />

        <Route
          path="/enquiries"
          element={
            <EnquiryList
              enquiries={enquiries}
              aiModels={aiModels}
              onPromote={handlePromoteEnquiry}
              onDismiss={(id) => setEnquiries((prev) => prev.map((e) => e.id == id ? { ...e, status: "dismissed" } : e))}
              onHold={(id) => setEnquiries((prev) => prev.map((e) => e.id == id ? { ...e, status: "hold" } : e))}
              onRestore={(id) => setEnquiries((prev) => prev.map((e) => e.id == id ? { ...e, status: "new" } : e))}
              onDelete={(id) => setEnquiries((prev) => prev.filter((e) => e.id != id))}
              onDeleteAll={() => setEnquiries((prev) => prev.filter((e) => e.status !== "dismissed"))}
              onUpdate={handleUpdateEnquiry}
              onAdd={handleAddEnquiry}
            />
          }
        />

        <Route path="/followups" element={<FollowUpList {...followUpProps} typeFilter="All" />} />
        <Route path="/followups-clients" element={<FollowUpList {...followUpProps} typeFilter="Active" />} />
        <Route path="/followups-leads" element={<FollowUpList {...followUpProps} typeFilter="Lead" />} />

        <Route
          path="/leads"
          element={
            <LeadList
              leads={leads}
              loading={leadsLoading}
              onSelectLead={handleClientSelect}
              onDeleteLead={handleDeleteLead}
              onOnboardLead={handleOnboardClient}
              onDismissLead={handleDismissLead}
              onRestoreLead={handleRestoreLead}
              onAddLead={handleAddClient}
              onAddActivity={handleAddActivity}
              allLeads={leads}
              allClients={clients.filter((c) => c.status !== "Lead")}
            />
          }
        />

        <Route
          path="/clients"
          element={
            <ClientList
              clients={clients.filter((c) => c.status === "Active")}
              onSelectClient={handleClientSelect}
              onDeleteClient={handleDeleteClient}
              onAddClient={handleAddClient}
              allClients={clients}
            />
          }
        />

        <Route
          path="/projects"
          element={
            <ProjectBoard
              projects={projects}
              clients={clients}
              onAddClient={handleAddClient}
              onAddProject={(data) => setProjects([{ id: `p-${Date.now()}`, ...data }, ...projects])}
              onUpdateProject={handleUpdateProject}
              onSelectProject={handleProjectSelect}
            />
          }
        />

        <Route
          path="/settings"
          element={
            <Settings
              aiModels={aiModels}
              onAddAiModel={handleAddAiModel}
              onUpdateAiModel={handleUpdateAiModel}
              onDeleteAiModel={handleDeleteAiModel}
            />
          }
        />

        <Route
          path="/clients/:id"
          element={
            <ClientDetailWrapper
              clients={clients}
              type="clients"
              activities={activities}
              onUpdateClient={handleUpdateClient}
              onAddActivity={handleAddActivity}
              onSelectProject={handleProjectSelect}
            />
          }
        />
        
        <Route
          path="/leads/:id"
          element={
            <ClientDetailWrapper
              clients={leads}
              type="leads"
              activities={activities}
              followUps={followUps}
              onUpdateClient={handleEditLead}
              onAddActivity={handleAddActivity}
              onSelectProject={handleProjectSelect}
            />
          }
        />
        
        <Route
          path="/projects/:id"
          element={
            <ProjectOverviewWrapper
              projects={projects}
              clients={clients}
              followUps={followUps}
              onUpdateProject={handleUpdateProject}
            />
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
