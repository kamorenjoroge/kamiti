'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { 
  MdMenu, 
  MdNotifications, 
  MdAccountCircle, 
  MdExpandMore,
  MdLogout,
  MdSettings,
  MdPerson
} from 'react-icons/md';

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

  // Mock notifications data
  const notifications = [
    { id: 1, message: 'New order received', time: '2 min ago', unread: true },
    { id: 2, message: 'Product stock low', time: '1 hour ago', unread: true },
    { id: 3, message: 'User registered', time: '3 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

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
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 rounded-md hover:bg-gray-100 text-gray-600 hover:text-primary transition-colors"
            >
              <MdNotifications size={24} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-danger text-light text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-light rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-dark">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${
                        notification.unread ? 'bg-secondary' : ''
                      }`}
                    >
                      <p className="text-sm text-dark">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-gray-200">
                  <button className="text-sm text-primary hover:underline">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <MdAccountCircle size={32} className="text-gray-600" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-dark">John Doe</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <MdExpandMore size={20} className="text-gray-600" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-light rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-2">
                  <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    <MdPerson size={16} className="mr-3" />
                    Profile
                  </button>
                  <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    <MdSettings size={16} className="mr-3" />
                    Settings
                  </button>
                  <hr className="my-1 border-gray-200" />
                  <button className="w-full flex items-center px-3 py-2 text-sm text-danger hover:bg-gray-100 rounded-md">
                    <MdLogout size={16} className="mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
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