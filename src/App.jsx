import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import Layout from "./layouts/Layout";
import Dashboard from "./pages/dashboard/Dashboard";
import ClientList from "./pages/clients/ClientList";
import ClientDetail from "./pages/clients/ClientDetail";
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

// Wrappers to extract ID from URL params and pass to detail components
const ClientDetailWrapper = ({
  clients,
  type,
  activities,
  onUpdateClient,
  onAddActivity,
  onSelectProject,
}) => {
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
};

const ProjectOverviewWrapper = ({
  projects,
  clients,
  followUps,
  onUpdateProject,
}) => {
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
};

// Main Routing Component
const AppRoutes = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check localStorage on initial load
    const user = localStorage.getItem("user");
    return !!user;
  });

  // State management for data
  const [clients, setClients] = useState(MOCK_CLIENTS);
  const [enquiries, setEnquiries] = useState(MOCK_ENQUIRIES);
  const [followUps, setFollowUps] = useState(MOCK_FOLLOW_UPS);
  const [activities, setActivities] = useState(MOCK_ACTIVITIES);
  const [projects, setProjects] = useState(MOCK_PROJECTS);

  // AI Models state (shared between Settings and EnquiryList)
  const [aiModels, setAiModels] = useState([]);
  const [loadingAiModels, setLoadingAiModels] = useState(true);

  // Fetch AI models from API
  useEffect(() => {
    const fetchAiModels = async () => {
      try {
        console.log("Fetching AI models from:", `${BASE_URL}/api/ai-models`);
        const response = await fetch(`${BASE_URL}/api/ai-models`);
        console.log("AI models response status:", response.status);
        if (response.ok) {
          const data = await response.json();
          console.log("AI models fetched:", data);
          // Transform to match frontend format
          const transformed = data.map((model) => ({
            id: model.id,
            name: model.name,
            provider: model.provider,
            modelId: model.model_id,
            isDefault: model.is_default,
          }));
          setAiModels(transformed);
        } else {
          console.error("Failed to fetch AI models:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching AI models:", error);
      } finally {
        setLoadingAiModels(false);
      }
    };

    fetchAiModels();
  }, []);

  const handleAddAiModel = async (model) => {
    try {
      const response = await fetch(`${BASE_URL}/api/ai-models`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: model.name,
          provider: model.provider,
          modelId: model.modelId,
          apiKey: model.apiKey,
          isDefault: model.isDefault,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newModel = { ...model, id: data.id };
        setAiModels([...aiModels, newModel]);
      }
    } catch (error) {
      console.error("Error adding AI model:", error);
    }
  };

  const handleUpdateAiModel = async (updatedModel) => {
    try {
      const response = await fetch(`${BASE_URL}/api/ai-models/${updatedModel.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updatedModel.name,
          provider: updatedModel.provider,
          modelId: updatedModel.modelId,
          isDefault: updatedModel.isDefault,
        }),
      });

      if (response.ok) {
        setAiModels(
          aiModels.map((m) => (m.id === updatedModel.id ? updatedModel : m)),
        );
      }
    } catch (error) {
      console.error("Error updating AI model:", error);
    }
  };

  const handleDeleteAiModel = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/api/ai-models/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAiModels(aiModels.filter((m) => m.id !== id));
      }
    } catch (error) {
      console.error("Error deleting AI model:", error);
    }
  };

  const handleClearNotifications = () => {
    setEnquiries((prev) =>
      prev.map((e) => (e.status === "new" ? { ...e, status: "read" } : e)),
    );
  };

  const handleLogin = (data) => {
    localStorage.setItem("user", JSON.stringify(data.user));
    setIsLoggedIn(true);
    navigate("/dashboard");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("user");
  };

  const handleClientSelect = (client, tab = "overview") => {
    const routeType = client.status === "Lead" ? "leads" : "clients";
    navigate(`/${routeType}/${client.id}`, { state: { tab } });
  };

  const handleDeleteClient = (id) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddClient = (data) => {
    const newClient = {
      id: `c-${Date.now()}`,
      ...data,
      avatar: `https://picsum.photos/100/100?random=${clients.length + 10}`,
      joinedDate: data.onboardingDate || new Date().toISOString().split("T")[0],
      lastContact: new Date().toISOString().split("T")[0],
      industry: data.projectCategory || data.industry || "Unknown",
      company: data.projectName || data.company || "Independent",
      notes:
        data.status === "Lead"
          ? data.notes
          : `${data.notes || ""}\n\n[Project Details]\nProject: ${data.projectName}\nStatus: ${data.projectStatus}\nDescription: ${data.projectDescription}\nDeadline: ${data.deadline}\nScope: ${data.scopeDocument}`,
    };
    setClients([newClient, ...clients]);
  };

  const handleOnboardClient = (id, onboardingData) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              ...onboardingData,
              status: onboardingData.status,
              isConverted: true,
              joinedDate: onboardingData.onboardingDate,
              industry: onboardingData.projectCategory || c.industry,
              company: onboardingData.projectName || c.company,
              notes: `${c.notes}\n\n[Project Onboarding]\nProject: ${onboardingData.projectName}\nStatus: ${onboardingData.projectStatus}\nDescription: ${onboardingData.projectDescription}\nDeadline: ${onboardingData.deadline}\nScope: ${onboardingData.scopeDocument}`,
            }
          : c,
      ),
    );
  };

  const handleUpdateClient = (updatedClient) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? updatedClient : c)),
    );
  };

  const handleDismissLead = (id) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "Dismissed" } : c)),
    );
  };

  const handleRestoreLead = (id) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "Lead", isConverted: false } : c,
      ),
    );
  };

  const handleProjectSelect = (project) => {
    navigate(`/projects/${project.id}`);
  };

  const handleUpdateProject = (updatedProject) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)),
    );
  };

  const handleNavigateFollowUp = (tab, subTab = "All") => {
    // In follow-ups page it sets sub tab directly, but React route will match typeFilter
    // For cross-tab navigation
    if (tab === "followups") navigate(`/${tab}`);
    else navigate(`/${tab}`);
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage onLogin={handleLogin} />
          )
        }
      />

      <Route
        element={
          isLoggedIn ? (
            <Layout
              onLogout={handleLogout}
              enquiries={enquiries}
              followUps={followUps}
              clients={clients}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        {/* Main Pages */}
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
              onPromote={(enquiry, type) => {
                const newClient = {
                  id: `c-${Date.now()}`,
                  name: enquiry.name,
                  company: enquiry.website
                    ? enquiry.website.replace(/^https?:\/\//, "").split("/")[0]
                    : "Independent",
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
              }}
              onDismiss={(id) =>
                setEnquiries((prev) =>
                  prev.map((e) =>
                    e.id === id ? { ...e, status: "dismissed" } : e,
                  ),
                )
              }
              onHold={(id) =>
                setEnquiries((prev) =>
                  prev.map((e) => (e.id === id ? { ...e, status: "hold" } : e)),
                )
              }
              onRestore={(id) =>
                setEnquiries((prev) =>
                  prev.map((e) =>
                    e.id === id
                      ? {
                          ...e,
                          status: "new",
                          aiAnalysis: e.aiAnalysis
                            ? { ...e.aiAnalysis, isRelevant: true }
                            : null,
                        }
                      : e,
                  ),
                )
              }
              onDelete={(id) =>
                setEnquiries((prev) => prev.filter((e) => e.id !== id))
              }
              onDeleteAll={() =>
                setEnquiries((prev) =>
                  prev.filter((e) => e.status !== "dismissed"),
                )
              }
              onUpdate={(updated) =>
                setEnquiries((prev) =>
                  prev.map((e) =>
                    e.id === updated.id ? { ...e, ...updated } : e,
                  ),
                )
              }
              onAdd={(data) => {
                const newEnquiry = {
                  id: `e-${Date.now()}`,
                  ...data,
                  date: new Date().toISOString(),
                  status: "new",
                };
                setEnquiries([newEnquiry, ...enquiries]);
              }}
              aiModels={aiModels}
            />
          }
        />

        {/* Follow Ups */}
        <Route
          path="/followups"
          element={
            <FollowUpList
              followUps={followUps}
              clients={clients}
              typeFilter="All"
              onToggleStatus={(id) =>
                setFollowUps((prev) =>
                  prev.map((f) =>
                    f.id === id
                      ? {
                          ...f,
                          status:
                            f.status === "completed" ? "pending" : "completed",
                        }
                      : f,
                  ),
                )
              }
              onAddFollowUp={(data) =>
                setFollowUps([
                  { id: `f-${Date.now()}`, status: "pending", ...data },
                  ...followUps,
                ])
              }
              onEditFollowUp={(updated) =>
                setFollowUps((prev) =>
                  prev.map((f) => (f.id === updated.id ? updated : f)),
                )
              }
              onDeleteFollowUp={(id) =>
                setFollowUps((prev) => prev.filter((f) => f.id !== id))
              }
              onSelectClient={handleClientSelect}
              onNavigate={(tab) => navigate(`/${tab}`)}
            />
          }
        />

        <Route
          path="/followups-clients"
          element={
            <FollowUpList
              followUps={followUps}
              clients={clients}
              typeFilter="Active"
              onToggleStatus={(id) =>
                setFollowUps((prev) =>
                  prev.map((f) =>
                    f.id === id
                      ? {
                          ...f,
                          status:
                            f.status === "completed" ? "pending" : "completed",
                        }
                      : f,
                  ),
                )
              }
              onAddFollowUp={(data) =>
                setFollowUps([
                  { id: `f-${Date.now()}`, status: "pending", ...data },
                  ...followUps,
                ])
              }
              onEditFollowUp={(updated) =>
                setFollowUps((prev) =>
                  prev.map((f) => (f.id === updated.id ? updated : f)),
                )
              }
              onDeleteFollowUp={(id) =>
                setFollowUps((prev) => prev.filter((f) => f.id !== id))
              }
              onSelectClient={handleClientSelect}
              onNavigate={(tab) => navigate(`/${tab}`)}
            />
          }
        />

        <Route
          path="/followups-leads"
          element={
            <FollowUpList
              followUps={followUps}
              clients={clients}
              typeFilter="Lead"
              onToggleStatus={(id) =>
                setFollowUps((prev) =>
                  prev.map((f) =>
                    f.id === id
                      ? {
                          ...f,
                          status:
                            f.status === "completed" ? "pending" : "completed",
                        }
                      : f,
                  ),
                )
              }
              onAddFollowUp={(data) =>
                setFollowUps([
                  { id: `f-${Date.now()}`, status: "pending", ...data },
                  ...followUps,
                ])
              }
              onEditFollowUp={(updated) =>
                setFollowUps((prev) =>
                  prev.map((f) => (f.id === updated.id ? updated : f)),
                )
              }
              onDeleteFollowUp={(id) =>
                setFollowUps((prev) => prev.filter((f) => f.id !== id))
              }
              onSelectClient={handleClientSelect}
              onNavigate={(tab) => navigate(`/${tab}`)}
            />
          }
        />

        {/* Clients and Leads */}
        <Route
          path="/leads"
          element={
            <ClientList
              clients={clients.filter(
                (c) =>
                  c.status === "Lead" ||
                  c.status === "Dismissed" ||
                  c.isConverted,
              )}
              onSelectClient={handleClientSelect}
              onDeleteClient={handleDeleteClient}
              onOnboardClient={handleOnboardClient}
              onDismissLead={handleDismissLead}
              onRestoreLead={handleRestoreLead}
              onAddClient={handleAddClient}
              onAddActivity={(data) =>
                setActivities([
                  { id: `a-${Date.now()}`, ...data },
                  ...activities,
                ])
              }
              allClients={clients}
              title="Leads"
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

        {/* Projects */}
        <Route
          path="/projects"
          element={
            <ProjectBoard
              projects={projects}
              clients={clients}
              onAddClient={handleAddClient}
              onAddProject={(projectData) =>
                setProjects([
                  { id: `p-${Date.now()}`, ...projectData },
                  ...projects,
                ])
              }
              onUpdateProject={handleUpdateProject}
              onSelectProject={handleProjectSelect}
            />
          }
        />

        {/* Settings */}
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

        {/* Dynamic Inner Detail Pages */}
        <Route
          path="/clients/:id"
          element={
            <ClientDetailWrapper
              clients={clients}
              type="clients"
              activities={activities}
              onUpdateClient={handleUpdateClient}
              onAddActivity={(data) =>
                setActivities([
                  { id: `a-${Date.now()}`, ...data },
                  ...activities,
                ])
              }
              onSelectProject={handleProjectSelect}
            />
          }
        />
        <Route
          path="/leads/:id"
          element={
            <ClientDetailWrapper
              clients={clients}
              type="leads"
              activities={activities}
              onUpdateClient={handleUpdateClient}
              onAddActivity={(data) =>
                setActivities([
                  { id: `a-${Date.now()}`, ...data },
                  ...activities,
                ])
              }
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

        {/* Fallback routing */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
