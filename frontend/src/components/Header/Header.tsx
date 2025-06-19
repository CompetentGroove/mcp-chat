import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useToc } from '../../contexts/TocContext';
import TocToggleButton from '../ChatView/TocToggleButton';
import SearchWindow from '../SearchWindow';


const Header: React.FC = () => {
        const { toggleToc } = useToc();
        const navigate = useNavigate();
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
                <header className="fixed top-0 z-40 w-screen h-16 bg-[#182144]">
			<div className="flex items-center justify-between mx-4 mt-2 sm:mx-6 2xl:mx-8">
				<div className="flex items-center space-x-8">
                                        <a
                                                className="flex items-center cursor-pointer h-full"
                                                onClick={() => navigate('/')}
                                        >
                                                <img
                                                        src="https://feetport-ssd.s3.ap-south-1.amazonaws.com/v2/678/fm/general/docs/urva%201.png"
                                                        alt="URVA Logo"
                                                        className="h-full w-auto"
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
                                                onClick={() => navigate('/settings/integrations')}
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
