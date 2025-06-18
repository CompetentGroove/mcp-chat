import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useToc } from '../../contexts/TocContext';
import TocToggleButton from '../ChatView/TocToggleButton';
import Logo from '../Logo';
import SearchWindow from '../SearchWindow';


const Header: React.FC = () => {
        const { toggleToc } = useToc();
        const navigate = useNavigate();
	const [selectedBot, setSelectedBot] = useState<string | null>(null);

	// Get the current path
	const currentPath = window.location.pathname;

	// Get the localStorage key based on current path
	const storageKey = currentPath === '/'
		? 'home_page_selected_bot'
		: `chat_${currentPath.split('/').pop()}_selectedBot`;

	// Watch for changes in localStorage
	useEffect(() => {
		// Initial load
		setSelectedBot(localStorage.getItem(storageKey));

		// Create storage event listener
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === storageKey) {
				setSelectedBot(e.newValue);
			}
		};

		// Add event listener
		window.addEventListener('storage', handleStorageChange);

		// Cleanup
		return () => {
			window.removeEventListener('storage', handleStorageChange);
		};
	}, [storageKey]);

	// Watch for direct changes to localStorage
	useEffect(() => {
		const checkLocalStorage = () => {
			const currentValue = localStorage.getItem(storageKey);
			if (currentValue !== selectedBot) {
				setSelectedBot(currentValue);
			}
		};

		// Check every 100ms for changes
		const interval = setInterval(checkLocalStorage, 100);

		return () => clearInterval(interval);
	}, [storageKey, selectedBot]);
	const location = useLocation();
        const { isDarkMode } = useTheme();
        const [showSearchWindow, setShowSearchWindow] = useState(false);

	// Close SearchWindow on ESC key press
	useEffect(() => {
		if (showSearchWindow) {
			const handleKeyDown = (event: KeyboardEvent) => {
				if (event.key === 'Escape') {
					setShowSearchWindow(false);
				}
			};

			window.addEventListener('keydown', handleKeyDown);

			return () => {
				window.removeEventListener('keydown', handleKeyDown);
			};
		}
	}, [showSearchWindow]);

	return (
		<header className={`fixed top-0 z-40 w-screen h-16 sm:h-0 ${isDarkMode ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-100'} `}>
			<div className="flex items-center justify-between mx-4 mt-2 sm:mx-6 2xl:mx-8">
				<div className="flex items-center space-x-8">
                                        <a
                                                className="flex items-center cursor-pointer"
                                                onClick={() => navigate('/')}
                                        >
                                                <img
                                                        src="https://urva.co/wp-content/uploads/2022/02/urva_logo_outline.png"
                                                        alt="URVA logo"
                                                        className="h-8"
                                                />
                                        </a>
				</div>

				{/* Right side icons and dropdown */}
				<div className="flex items-center space-x-3">
					{/* Table of Contents toggle - only visible on chat pages */}
					{location.pathname.includes('/chat/') && (
						<div className="sm:hidden">
							<TocToggleButton onClick={toggleToc} isDarkMode={isDarkMode} />
						</div>
					)}
					{/* History button */}
					<button
						onClick={() => setShowSearchWindow(true)}
						className={`${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} p-2 rounded-full transition-colors flex items-center`}
						aria-label="Search History"
					>
						<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</button>
                                        <button
                                                onClick={() => navigate('/settings/bots')}
                                                className={`${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} p-2 rounded-full transition-colors flex items-center`}
                                                aria-label="Settings"
                                        >
                                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                </svg>
                                        </button>
				</div>
			</div>

			{/* Search Window */}
			<SearchWindow isOpen={showSearchWindow} onClose={() => setShowSearchWindow(false)} />
		</header>
	);
};

export default Header;
