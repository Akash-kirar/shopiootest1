
import React, { useState } from 'react';
import { Role } from './types';
import Header from './components/Header';
import ShopperView from './components/ShopperView';
import CustomerView from './components/CustomerView';

const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<Role>(Role.SHOPPER);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <Header currentRole={currentRole} onRoleChange={setCurrentRole} />
      <main className="container mx-auto p-4 md:p-6">
        {currentRole === Role.SHOPPER ? <ShopperView /> : <CustomerView />}
      </main>
      <footer className="text-center py-4 mt-8 text-xs text-gray-500">
        <p>Local Lens &copy; {new Date().getFullYear()}. An AI-powered local shopping assistant.</p>
        <p className="mt-1">Note: This is a demo application. Shop and product data is stored in your browser's local storage.</p>
      </footer>
    </div>
  );
};

export default App;
