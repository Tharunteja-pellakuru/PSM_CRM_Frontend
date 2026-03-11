import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import Logo from "../components/ui/Logo";

const Layout = ({ 
  onLogout, enquiries, followUps, clients 
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle active tab from current URL
  // Default to dashboard, or handle nested routes like /followups/clients
  const pathParts = location.pathname.split("/").filter(Boolean);
  const activeTab = pathParts.length > 0 ? pathParts.join("-") : "dashboard";

  return (
    <div className="flex min-h-screen bg-background overflow-x-hidden">
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-primary/30 backdrop-blur-xl z-[105] min-[1201px]:hidden transition-all duration-500"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <div className={`fixed inset-y-0 left-0 transform ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} min-[1201px]:translate-x-0 transition-transform duration-300 z-[110] min-[1201px]:z-20`}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
             navigate(`/${tab}`);
             setIsMobileSidebarOpen(false);
          }}
          onLogout={onLogout}
          enquiryCount={enquiries.filter(e => e.status === "new" || e.status === "read").length}
          followUpCount={followUps.filter(f => f.status === "pending").length}
          clientFollowUpCount={followUps.filter(f => f.status === "pending" && clients.find(c => c.id === f.clientId)?.status === "Active").length}
          leadFollowUpCount={followUps.filter(f => f.status === "pending" && clients.find(c => c.id === f.clientId)?.status === "Lead").length}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-[1201px]:ml-72 w-full transition-all duration-300 min-[1201px]:animate-slide-left">
        <header className="min-[1201px]:hidden flex items-center justify-between bg-[#18254D] text-white p-5 fixed top-0 left-0 right-0 z-[100] shadow-lg h-24">
          <Logo size={200} showText={false} className="!gap-2.5" />
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-all active:scale-95"
          >
            {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Scalable Content Injection */}
        <main className="flex-1 p-4 min-[1201px]:p-8 w-full overflow-x-hidden mt-28 min-[1201px]:mt-4 flex flex-col">
          <div className="max-w-7xl mx-auto pb-20 flex-1 w-full">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default Layout;
