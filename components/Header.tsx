
import React from 'react';
import { Role } from '../types';

interface HeaderProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
}

const Header: React.FC<HeaderProps> = ({ currentRole, onRoleChange }) => {
  const roles = [Role.SHOPPER, Role.CUSTOMER];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <svg className="w-10 h-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Local <span className="text-blue-600">Lens</span>
            </h1>
        </div>
        
        <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => onRoleChange(role)}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 focus:outline-none ${
                currentRole === role
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              I am a {role}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
