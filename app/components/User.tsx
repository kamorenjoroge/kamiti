"use client"
import { useState } from 'react';
import { 
  MdAccountCircle, 
  MdExpandMore,
  MdLogout,
  MdSettings,
  MdPerson
} from 'react-icons/md';
import { useUser, useClerk } from '@clerk/nextjs';
import Image from 'next/image';

const User = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  

  const handleSignOut = async () => {
    try {
      await signOut();
      // This will force a full page reload which will trigger your layout's SignedOut redirect
      window.location.href = '/';
    } catch (err) {
      console.error('Error during sign out:', err);
    }
  };

  if (!isSignedIn) {
    return null; // Return null as the SignedOut redirect in layout will handle this
  }

  return (
    <div className="">
      {/* Profile Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          {user?.imageUrl ? (
            <Image
              width={90}
              height={90}
              src={user.imageUrl} 
              alt="Profile" 
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <MdAccountCircle size={32} className="text-gray-600" />
          )}
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-dark">
              {user?.fullName || 'User'}
            </p>
            <p className="text-xs text-gray-500">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
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
              <button 
                className="w-full flex items-center px-3 py-2 text-sm text-danger hover:bg-gray-100 rounded-md"
                onClick={handleSignOut}
              >
                <MdLogout size={16} className="mr-3" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default User;