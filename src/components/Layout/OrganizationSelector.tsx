import { useOrganization } from "@/contexts/OrganizationContext";
import { Organization } from "@/types/organization";
import {
  Check,
  ChevronDown,
  Search,
  Settings
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { OrganizationManagement } from './OrganizationManagement';

export function OrganizationSelector() {
  const {
    organizations,
    currentOrganization,
    setCurrentOrganization,
    isLoading,
  } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showManagementModal, setShowManagementModal] = useState(false);

  const filteredOrganizations = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOrganizationSelect = (org: Organization) => {
    setCurrentOrganization(org);
    setIsOpen(false);
    setSearchTerm("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-secondary-200 rounded-xl animate-pulse"></div>
        <div className="h-4 bg-secondary-200 rounded w-32 animate-pulse"></div>
      </div>
    );
  }

  if (!currentOrganization) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-secondary-200 rounded-xl flex items-center justify-center">
          <span className="text-text-muted text-xs">?</span>
        </div>
        <span className="text-text-muted">No organization selected</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-bg-muted transition-all duration-200 group border border-transparent hover:border-border-secondary cursor-pointer"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-text-inverse font-bold text-sm"
          style={{ backgroundColor: currentOrganization.color }}
        >
          {currentOrganization.avatar ||
            currentOrganization.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 text-left">
          <div className="font-semibold text-text-primary truncate max-w-48">
            {currentOrganization.name}
          </div>
          <div className="text-xs text-text-secondary">
            {currentOrganization.memberCount}{" "}
            {currentOrganization.memberCount === 1 ? "member" : "members"}
          </div>
        </div>

        <ChevronDown
          className={`w-5 h-5 text-text-muted transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-bg-primary rounded-2xl border border-border-primary py-3 z-50 min-w-80 shadow-lg">
          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-border-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
              />
            </div>
          </div>

          {/* Organizations List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOrganizations.map((org) => (
              <button
                key={org.id}
                onClick={() => handleOrganizationSelect(org)}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-bg-muted transition-all duration-200 cursor-pointer"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-text-inverse font-bold text-sm"
                  style={{ backgroundColor: org.color }}
                >
                  {org.avatar || org.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 text-left">
                  <div className="font-semibold text-text-primary truncate">
                    {org.name}
                  </div>
                  <div className="text-xs text-text-secondary truncate">
                    {org.description || `${org.memberCount} members`}
                  </div>
                </div>

                {currentOrganization.id === org.id && (
                  <Check className="w-5 h-5 text-accent" />
                )}
              </button>
            ))}
          </div>

          {filteredOrganizations.length === 0 && (
            <div className="px-4 py-6 text-center text-text-muted">
              No organizations found
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-border-primary mt-3 pt-3">
            <button
              onClick={() => {
                setShowManagementModal(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-bg-muted transition-all duration-200 text-text-primary font-medium cursor-pointer"
            >
              <Settings className="w-5 h-5 text-accent" />
              <span>Manage Organizations</span>
            </button>
          </div>
        </div>
      )}

      {/* OrganizationManagement Modal */}
      {showManagementModal && (
        <OrganizationManagement
          isOpen={showManagementModal}
          onClose={() => setShowManagementModal(false)}
        />
      )}
    </div>
  );
}
