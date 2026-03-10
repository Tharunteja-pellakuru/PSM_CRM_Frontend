import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Settings,
  Inbox,
  UserPlus,
  BellRing,
  LogOut,
  X,
  ChevronDown,
} from "lucide-react";
import Logo from "../components/ui/Logo";
import anandImg from "../assets/Anand.png";

const Sidebar = ({
  activeTab,
  setActiveTab,
  onLogout,
  enquiryCount = 0,
  followUpCount = 0,
  clientFollowUpCount = 0,
  leadFollowUpCount = 0,
  isCollapsed = false,
  onCloseMobile,
}) => {
  const [expandedItems, setExpandedItems] = useState(["followups"]);

  useEffect(() => {
    const isFollowUpRelated =
      activeTab === "followups" || activeTab.startsWith("followups-");

    if (!isFollowUpRelated) {
      setExpandedItems((prev) => prev.filter((id) => id !== "followups"));
    }
  }, [activeTab]);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      id: "enquiries",
      label: "Enquiries",
      icon: <Inbox size={20} />,
      badge: enquiryCount,
    },
    {
      id: "followups",
      label: "Follow-ups",
      icon: <BellRing size={20} />,
      badge: followUpCount,
      subItems: [
        {
          id: "followups-clients",
          label: "Reference Follow-ups",
          icon: <Users size={16} />,
          badge: clientFollowUpCount,
        },
        {
          id: "followups-leads",
          label: "New Follow-ups",
          icon: <UserPlus size={16} />,
          badge: leadFollowUpCount,
        },
      ],
    },
    { id: "leads", label: "Leads", icon: <UserPlus size={20} /> },
    { id: "clients", label: "Clients", icon: <Users size={20} /> },
    { id: "projects", label: "Projects", icon: <FolderKanban size={20} /> },
    { id: "settings", label: "Settings", icon: <Settings size={20} /> },
    {
      id: "logout",
      label: "Log Out",
      icon: <LogOut size={20} />,
      isLogout: true,
    },
  ];

  return (
    <aside
      className={`${isCollapsed ? "w-20" : "w-72"} bg-[#18254D] text-slate-300 flex flex-col h-screen border-r border-white/5 shadow-2xl overflow-hidden select-none transition-all duration-300 relative`}
    >
      <div className="p-6 pb-4 relative shrink-0 flex items-center justify-between">
        {!isCollapsed && (
          <Logo size={260} showText={false} className="!gap-3" />
        )}
        {isCollapsed && (
          <div className="mx-auto flex items-center justify-center w-full">
            <Logo size={44} showText={false} />
          </div>
        )}
        <button
          onClick={onCloseMobile}
          className="min-[1201px]:hidden text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-xl transition-all"
        >
          <X size={24} strokeWidth={2.5} />
        </button>
      </div>

      <nav
        className={`flex-1 ${isCollapsed ? "px-2" : "px-3"} py-4 space-y-1 overflow-y-auto no-scrollbar`}
      >
        {menuItems.map((item) => {
          const isActive =
            activeTab === item.id ||
            (item.subItems &&
              item.subItems.some((sub) => activeTab === sub.id));
          const isExpanded = expandedItems.includes(item.id);

          const toggleExpand = (e) => {
            if (item.subItems) {
              e.stopPropagation();
              setExpandedItems((prev) =>
                prev.includes(item.id)
                  ? prev.filter((id) => id !== item.id)
                  : [...prev, item.id],
              );
            }
          };

          return (
            <div key={item.id} className="space-y-1">
              <button
                onClick={() => {
                  if (item.isLogout) {
                    onLogout();
                  } else if (item.subItems) {
                    setExpandedItems((prev) => {
                      const exists = prev.includes(item.id);
                      return exists
                        ? prev.filter((id) => id !== item.id)
                        : [...prev, item.id];
                    });
                  } else {
                    setActiveTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }
                }}
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-0 py-3.5" : "justify-between px-5 py-3"} rounded-xl transition-all ${isActive ? "bg-black/20 text-white shadow-sm" : "hover:bg-white/5 hover:text-white"}`}
                title={isCollapsed ? item.label : ""}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-white" : "text-slate-500"}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="text-sidebar-nav font-medium tracking-wide">
                      {item.label}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <div className="flex items-center gap-2.5">
                    {item.badge !== undefined &&
                      item.badge > 0 &&
                      !isExpanded && (
                        <span className="bg-white text-secondary text-sidebar-badge font-bold px-2 h-5 min-w-[1.25rem] rounded-md flex items-center justify-center shadow-lg shadow-black/10">
                          {item.badge}
                        </span>
                      )}
                    <div className="w-4 flex items-center justify-center">
                      {item.subItems && (
                        <ChevronDown
                          size={14}
                          className={`text-slate-500 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                          onClick={toggleExpand}
                        />
                      )}
                    </div>
                  </div>
                )}
                {isCollapsed && item.badge > 0 && !isExpanded && (
                  <div className="absolute top-1 right-1">
                    <div className="w-2 h-2 bg-secondary rounded-full shadow-sm" />
                  </div>
                )}
              </button>

              {item.subItems && isExpanded && !isCollapsed && (
                <div className="ml-10 space-y-2.5 py-2">
                  {item.subItems.map((sub) => {
                    const isSubActive = activeTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveTab(sub.id);
                          if (onCloseMobile) onCloseMobile();
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${isSubActive ? "bg-black/20 text-white shadow-sm" : "text-slate-300 hover:text-white hover:bg-white/5"}`}
                      >
                        <span
                          className={isSubActive ? "text-white" : "text-white"}
                        >
                          {sub.icon}
                        </span>
                        <div className="flex-1 flex items-center justify-between gap-2.5">
                          <span>{sub.label}</span>
                          {sub.badge !== undefined && sub.badge > 0 && (
                            <span className="bg-white text-secondary text-sidebar-badge font-bold px-2 h-4.5 min-w-[1.125rem] rounded-md flex items-center justify-center shadow-lg shadow-black/10">
                              {sub.badge}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
