'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { 
  MdMenu, 
} from 'react-icons/md';
import User from './User';
import Notification from './Notification';

interface HeaderProps {
  onMenuClick: () => void;
}

const getPageTitle = (pathname: string) => {
  const titles: { [key: string]: string } = {
    '/': 'Dashboard',
    '/orders': 'Orders',
    '/products': 'Products',
    '/users': 'Users',
    '/settings': 'Settings',
  };
  return titles[pathname] || 'Admin';
};

const Header = ({ onMenuClick }: HeaderProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);



  return (
    <header className="bg-light shadow-sm border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left Side - Menu Button & Page Title */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 text-dark mr-3"
          >
            <MdMenu size={24} />
          </button>
          <h1 className="text-2xl font-semibold text-dark">{pageTitle}</h1>
        </div>

        {/* Right Side - Notifications & Profile */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
        <Notification/>
          {/* Profile Dropdown */}
         <User/>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(isProfileOpen || isNotificationOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsProfileOpen(false);
            setIsNotificationOpen(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;