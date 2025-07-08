import { useState } from "react";
import { MdNotifications } from "react-icons/md";

const Notification = () => {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
      const notifications = [
    { id: 1, message: 'New order received', time: '2 min ago', unread: true },
    { id: 2, message: 'Product stock low', time: '1 hour ago', unread: true },
    { id: 3, message: 'User registered', time: '3 hours ago', unread: false },
  ];
   const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className=''>
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
    </div>
  )
}

export default Notification