import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthenticatedSWR } from '../../utils/api';
import { IntegrationSection } from './IntegrationSection';

interface SettingsProps {
}

export const Settings: React.FC<SettingsProps> = ({ }) => {
  const navigate = useNavigate();
  const { section } = useParams<{ section: string }>();
  const { isDarkMode } = useTheme();

  // Validate section parameter and default to 'integrations' if invalid
  const activeSection = section === 'integrations' ? section : 'integrations';

  // Redirect if section is invalid
  useEffect(() => {
    if (section !== activeSection) {
      navigate(`/settings/${activeSection}`, { replace: true });
    }
  }, [section, activeSection, navigate]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch user info
  const { data: userInfo, error: userInfoError, isLoading: userInfoLoading } =
    useAuthenticatedSWR<{sub: string; email: string; picture: string; name: string; userPrefix: string}>('/api/auth/userinfo');


  // Status message state
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  // Clear status message after 5 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);


  return (
    <div className={`max-w-full flex flex-col pt-16 h-screen ${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Mobile header with sections dropdown */}
      <div className="sm:hidden flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-semibold">Settings</h1>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`flex items-center px-4 py-2 rounded-md ${
              isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
            } border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}
          >
            <span>Sections</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {isMobileMenuOpen && (
            <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-10 ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <Link
                to="/settings/integrations"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  activeSection === 'integrations'
                    ? isDarkMode
                      ? 'bg-gray-700 text-white'
                      : 'bg-blue-50 text-blue-600'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Integrations
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Status message */}
      {statusMessage && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          statusMessage.type === 'success'
            ? isDarkMode ? 'bg-green-800 text-white' : 'bg-green-100 text-green-800'
            : isDarkMode ? 'bg-red-800 text-white' : 'bg-red-100 text-red-800'
        }`}>
          {statusMessage.text}
        </div>
      )}


      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on mobile */}
        <div className={`hidden sm:block w-56 ${isDarkMode ? 'bg-[#1a1a1a] border-gray-800' : 'bg-gray-50 border-gray-200'} border-r p-4`}>
          <nav>
            <ul>
              <li className="mb-1">
                <Link
                  to="/settings/integrations"
                  className={`block w-full text-left px-3 py-2 rounded-md ${
                    activeSection === 'integrations'
                      ? isDarkMode
                        ? 'bg-gray-800 text-white font-medium'
                        : 'bg-blue-50 text-blue-600 font-medium'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-800'
                        : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Integrations
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto">



          {/* Integrations settings section */}
          {activeSection === 'integrations' && (
            <IntegrationSection
              isDarkMode={isDarkMode}
              setStatusMessage={setStatusMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
};
