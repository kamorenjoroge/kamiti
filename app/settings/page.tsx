'use client';
import React from 'react';
import UserManager from '../components/Modal/UserManager';


const Page = () => {
  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-4">
        <UserManager type="create" />
        <UserManager type="view" />
      </div>
    </div>
  );
};

export default Page;
