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
function ClientDetailWrapper({ clients, type, activities, onUpdateClient, onAddActivity, onSelectProject }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const client = clients.find((c) => c.id === id);

  if (!client) return <Navigate to={`/${type}`} replace />;

  return (
    <ClientDetail
      client={client}
      onBack={() => navigate(`/${type}`)}
      onUpdateClient={onUpdateClient}
      onAddActivity={onAddActivity}
      activities={activities}
      initialTab={location.state?.tab || "overview"}
      onSelectProject={onSelectProject}
    />
  );
}

// Simple wrapper for project overview
function ProjectOverviewWrapper({ projects, clients, followUps, onUpdateProject }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projects.find((p) => p.id === id);

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
    fetch(`${BASE_URL}/api/ai-models`)
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
  }, []);

  // Fetch leads from API on mount
  useEffect(() => {
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
        // Extract leads array from response
        const leadsArray = Array.isArray(data) ? data : data.leads || [];
        
        // Transform API data to match component expected format
        // Only include fields that exist in the database schema
        const transformedLeads = leadsArray.map((lead) => ({
          id: lead.id?.toString() || lead.uuid,
          name: lead.full_name || "Unknown",
          company: lead.website_url?.replace(/^https?:\/\//, "").split("/")[0] || "Independent",
          email: lead.email || "",
          phone: lead.phone_number || "",
          status: lead.lead_status === "Dismissed" ? "Dismissed" : "Lead",  // ← Use actual status from DB
          leadType: lead.lead_status || "Warm",
          projectCategory: lead.lead_category || "Tech",
          industry: lead.lead_category || "Tech",
          website: lead.website_url || "",
          notes: lead.message || "",
          joinedDate: lead.created_at ? lead.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
          lastContact: lead.updated_at ? lead.updated_at.split("T")[0] : new Date().toISOString().split("T")[0],
          avatar: `https://picsum.photos/100/100?random=${lead.id || Math.floor(Math.random() * 100)}`,
        }));
        
        setLeads(transformedLeads);
        setLeadsLoading(false);
      })
      .catch(() => {
        console.log("Failed to fetch leads");
        setLeads([]);
        setLeadsLoading(false);
      });
  }, []);

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
    const route = client.status === "Lead" ? "leads" : "clients";
    navigate(`/${route}/${client.id}`, { state: { tab } });
  }

  function handleDeleteClient(id) {
    setClients((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleDeleteLead(id) {
    try {
      // Find the lead to get its ID
      const leadToDelete = leads.find((l) => l.id === id);
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
        setLeads((prev) => prev.filter((l) => l.id !== id));
        
        // Also update clients array to keep them in sync
        setClients((prev) => prev.filter((c) => c.id !== id));
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

  function handleAddClient(data) {
    const newClient = {
      id: `c-${Date.now()}`,
      ...data,
      avatar: `https://picsum.photos/100/100?random=${clients.length + 10}`,
      joinedDate: data.onboardingDate || new Date().toISOString().split("T")[0],
      lastContact: new Date().toISOString().split("T")[0],
      industry: data.projectCategory || data.industry || "Unknown",
      company: data.projectName || data.company || "Independent",
      notes: data.status === "Lead" 
        ? data.notes 
        : `${data.notes || ""}\n\n[Project] ${data.projectName} | ${data.projectStatus}`,
    };
    setClients([newClient, ...clients]);
  }

  function handleOnboardClient(id, data) {
    setClients((prev) => prev.map((c) => 
      c.id === id 
        ? { ...c, ...data, status: data.status, isConverted: true }
        : c
    ));
  }

  function handleUpdateClient(updated) {
    setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  async function handleDismissLead(id) {
    try {
      // Find the lead to update
      const leadToUpdate = leads.find((l) => l.id === id);
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
          email: result.lead?.email || leadToUpdate.email,
          phone: result.lead?.phone_number || leadToUpdate.phone,
          status: "Dismissed",
          leadType: result.lead?.lead_status || "Warm",  // Update from API
          projectCategory: result.lead?.lead_category || leadToUpdate.projectCategory,
          website: result.lead?.website_url || leadToUpdate.website,
          notes: result.lead?.message || leadToUpdate.notes,
        };
        
        console.log("Transformed dismissed lead:", dismissedLead);
        
        // Update local state after successful API call with complete data
        setLeads((prev) => prev.map((l) => (l.id === id ? dismissedLead : l)));
        
        // Also update clients array to keep them in sync
        setClients((prev) => prev.map((c) => (c.id === id ? dismissedLead : c)));
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
      const leadToUpdate = leads.find((l) => l.id === id);
      if (!leadToUpdate) return;

      console.log("Restoring lead:", id);

      // Call API to update lead status back to Warm (Pending)
      // Send all required fields to preserve lead data
      const res = await fetch(`${BASE_URL}/api/update-lead/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json" 
        },
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
        
        // Update local state after successful API call
        setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: "Lead", leadType: "Warm", isConverted: false } : l)));
        
        // Also update clients array to keep them in sync
        setClients((prev) => prev.map((c) => (c.id === id ? { ...c, status: "Lead", leadType: "Warm", isConverted: false } : c)));
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
      // Find the lead to get current data
      const leadToUpdate = leads.find((l) => l.id === id);
      if (!leadToUpdate) {
        console.error("Lead not found:", id);
        throw new Error("Lead not found");
      }

      console.log("=== EDIT LEAD DEBUG ===");
      console.log("Lead ID:", id);
      console.log("Editing lead - Received data:", editData);
      console.log("Original lead data:", leadToUpdate);

      // Map frontend data to backend schema - ensure all fields are sent
      const updatePayload = {
        id: id,
        full_name: editData.name !== undefined && editData.name !== null ? editData.name : leadToUpdate.name,
        phone_number: editData.phone !== undefined && editData.phone !== null ? editData.phone : leadToUpdate.phone,
        email: editData.email !== undefined && editData.email !== null ? editData.email : leadToUpdate.email,
        lead_status: editData.leadType !== undefined && editData.leadType !== null ? editData.leadType : leadToUpdate.leadType,
        website_url: editData.website !== undefined && editData.website !== null ? editData.website : (leadToUpdate.website || ""),
        message: editData.notes !== undefined && editData.notes !== null ? editData.notes : leadToUpdate.notes,
        lead_category: editData.projectCategory !== undefined && editData.projectCategory !== null ? editData.projectCategory : (leadToUpdate.projectCategory || "Tech"),
      };

      console.log("Update payload being sent to API:", JSON.stringify(updatePayload, null, 2));

      // Call API to update the lead - ID is in the URL path
      const res = await fetch(`${BASE_URL}/api/update-lead/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updatePayload),
      });

      console.log("API Response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("API Error Response:", errorData);
        throw new Error(errorData.message || "Failed to update lead");
      }

      const updatedLead = await res.json();
      console.log("Updated lead from API:", updatedLead);
      
      // Transform API response to match frontend format - use actual data from API
      const transformedLead = {
        ...leadToUpdate,
        id: updatedLead.lead?.id?.toString() || id,
        name: updatedLead.lead?.full_name || editData.name,
        company: updatedLead.lead?.website_url?.replace(/^https?:\/\//, "").split("/")[0] || editData.company || leadToUpdate.company,
        email: updatedLead.lead?.email || editData.email,
        phone: updatedLead.lead?.phone_number || editData.phone,
        status: "Lead",
        leadType: updatedLead.lead?.lead_status || editData.leadType,
        projectCategory: updatedLead.lead?.lead_category || editData.projectCategory,
        industry: updatedLead.lead?.lead_category || editData.projectCategory,
        website: updatedLead.lead?.website_url !== undefined ? updatedLead.lead.website_url : editData.website,
        notes: updatedLead.lead?.message || editData.notes,
        joinedDate: updatedLead.lead?.created_at ? updatedLead.lead.created_at.split("T")[0] : leadToUpdate.joinedDate,
        lastContact: updatedLead.lead?.updated_at ? updatedLead.lead.updated_at.split("T")[0] : new Date().toISOString().split("T")[0],
        avatar: `https://picsum.photos/100/100?random=${updatedLead.lead?.id || id}`,
      };

      console.log("Transformed lead for frontend:", transformedLead);
      console.log("=== END DEBUG ===");

      // Update local state after successful API call
      setLeads((prev) => prev.map((l) => (l.id === id ? transformedLead : l)));
      
      // Also update clients array if this lead exists there
      setClients((prev) => prev.map((c) => (c.id === id ? transformedLead : c)));
      
      console.log("✅ Lead updated successfully in both leads and clients arrays!");
      
      return transformedLead;
    } catch (error) {
      console.error("Error updating lead:", error);
      throw error;
    }
  }

  function handleProjectSelect(project) {
    navigate(`/projects/${project.id}`);
  }

  function handleUpdateProject(updated) {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  function handleAddActivity(data) {
    setActivities([{ id: `a-${Date.now()}`, ...data }, ...activities]);
  }

  function handleAddFollowUp(data) {
    setFollowUps([{ id: `f-${Date.now()}`, status: "pending", ...data }, ...followUps]);
  }

  function handleEditFollowUp(updated) {
    setFollowUps((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  }

  function handleDeleteFollowUp(id) {
    setFollowUps((prev) => prev.filter((f) => f.id !== id));
  }

  function handleToggleFollowUpStatus(id) {
    setFollowUps((prev) => prev.map((f) => 
      f.id === id ? { ...f, status: f.status === "completed" ? "pending" : "completed" } : f
    ));
  }

  // Enquiry handlers
  function handlePromoteEnquiry(enquiry, type) {
    const newClient = {
      id: `c-${Date.now()}`,
      name: enquiry.name,
      company: enquiry.website ? enquiry.website.replace(/^https?:\/\//, "").split("/")[0] : "Independent",
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
    setEnquiries((prev) => prev.filter((e) => e.id !== enquiry.id));
    navigate("/leads");
  }

  function handleUpdateEnquiry(updated) {
    setEnquiries((prev) => prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e)));
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
        setAiModels(aiModels.map((m) => (m.id === updated.id ? updated : m)));
      }
    } catch (e) {
      console.log("Failed to update AI model");
    }
  }

  async function handleDeleteAiModel(id) {
    try {
      const res = await fetch(`${BASE_URL}/api/ai-models/${id}`, { method: "DELETE" });
      if (res.ok) setAiModels(aiModels.filter((m) => m.id !== id));
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
              enquiries={enquiries}
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
              onDismiss={(id) => setEnquiries((prev) => prev.map((e) => e.id === id ? { ...e, status: "dismissed" } : e))}
              onHold={(id) => setEnquiries((prev) => prev.map((e) => e.id === id ? { ...e, status: "hold" } : e))}
              onRestore={(id) => setEnquiries((prev) => prev.map((e) => e.id === id ? { ...e, status: "new" } : e))}
              onDelete={(id) => setEnquiries((prev) => prev.filter((e) => e.id !== id))}
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
