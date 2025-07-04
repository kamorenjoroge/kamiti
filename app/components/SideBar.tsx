'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  MdDashboard, 
  MdShoppingCart, 
  MdInventory, 
  MdPeople, 
  MdSettings,
  MdClose 
} from 'react-icons/md';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: MdDashboard },
  { name: 'Products', href: '/products', icon: MdInventory },
  { name: 'Orders', href: '/orders', icon: MdShoppingCart },
  { name: 'Users', href: '/users', icon: MdPeople },
  { name: 'Settings', href: '/settings', icon: MdSettings },
];

interface SideBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SideBar = ({ isOpen, onClose }: SideBarProps) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-light shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-dark">JBN TOOLS</h1>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 text-dark"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      // Close sidebar on mobile when link is clicked
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                    className={`
                      flex items-center px-4 py-3 rounded-lg transition-colors duration-200
                      ${isActive 
                        ? 'bg-primary text-light shadow-md' 
                        : 'text-gray-700 hover:bg-secondary hover:text-primary'
                      }
                    `}
                  >
                    <Icon size={20} className="mr-3" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Admin Dashboard v1.0
          </div>
        </div>
      </div>
    </>
  );
};

export default SideBar;