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
				</div>
			</div>

			{/* Search Window */}
			<SearchWindow isOpen={showSearchWindow} onClose={() => setShowSearchWindow(false)} />
		</header>
	);
};

export default Header;
