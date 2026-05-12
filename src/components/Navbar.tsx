import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import type { Driver } from '../services/dataService';
import logo from '../assets/logo.png';

interface NavbarProps {
  driver: Driver | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ driver, onLogout }) => {
  const navigate = useNavigate();

  const handleAdminClick = (e: React.MouseEvent) => {
    if (e.detail === 2) {
      // Double click to go to admin
      navigate('/admin');
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={handleAdminClick}>
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center mr-3 shadow-lg p-1">
                <img src={logo} alt="Logo da Empresa" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-xl text-slate-800 hidden sm:block tracking-tight">
                TransManá <span className="text-primary">Onboarding</span>
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {driver ? (
              <>
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded-full">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 hidden sm:block">
                    {driver.name.split(' ')[0]}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="text-sm text-slate-500 font-medium">Acesso Restrito</div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
