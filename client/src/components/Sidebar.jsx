import React, { useState, useRef } from 'react';
import { GripVertical, ChevronDown, ChevronRight, Activity, Building2, Store, AlertTriangle, ShieldCheck } from 'lucide-react';
import { MetaIcon } from './Icons';
import { useBrand } from '../context/BrandContext';

const Tooltip = ({ text, show, top }) => {
  if (!show) return null;
  return (
    <div 
      style={{ top: `${top}px` }}
      className="fixed left-20 ml-4 px-3 py-1.5 bg-prime-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-xl whitespace-nowrap z-[1000] animate-in fade-in zoom-in-95 slide-in-from-left-2 duration-200"
    >
      <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-prime-600 rotate-45" />
      {text}
    </div>
  );
};

const SubmenuPopover = ({ item, show, t, handleTabChange, activeTab, top, onMouseEnter, onMouseLeave }) => {
  if (!show || !item.sub) return null;
  return (
    <div 
      style={{ top: `${top}px` }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="fixed left-20 ml-2 z-[1000] group/popover"
    >
      {/* Hover Bridge - invisible connection to maintain hover state while moving across the gap */}
      <div className="absolute left-[-20px] top-0 bottom-0 w-[20px]" />
      
      <div className="p-2 bg-[#0a0f1d]/90 border border-white/10 text-white rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] min-w-[240px] backdrop-blur-3xl animate-in fade-in zoom-in-95 slide-in-from-left-4 duration-500 relative overflow-hidden">
        {/* Decorative Glossy Highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        {/* Decorative Arrow */}
        <div className="absolute left-[-6px] top-8 w-3 h-3 bg-[#0a0f1d] border-l border-b border-white/10 rotate-45 z-0 outline-none" />
        
        <div className="relative z-10 p-2">
          <div className="px-4 py-3 border-b border-white/5 mb-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-prime-400 bg-prime-500/10 px-3 py-1.5 rounded-lg inline-block">{t(item.label)}</p>
          </div>
          <div className="space-y-1">
            {item.sub.map(sub => (
              <button
                key={sub.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabChange(sub.id);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  activeTab === sub.id 
                    ? 'bg-gradient-to-r from-prime-600 to-purple-600 text-white shadow-lg shadow-prime-500/20' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                }`}
              >
                <div className={`p-2 rounded-lg transition-colors ${activeTab === sub.id ? 'bg-white/20' : 'bg-white/5'}`}>
                  {sub.icon && <sub.icon size={14} className={activeTab === sub.id ? 'text-white' : 'text-prime-400/60'} />}
                </div>
                <span>{t(sub.label)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MagneticButton = ({ children, onClick, isActive, isDarkMode, className, isCollapsed, label, t, hasSub, subItems, handleTabChange, activeTab, onHover, onLeave }) => {
  const buttonRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - (left + width / 2);
    const y = e.clientY - (top + height / 2);
    setPos({ x: x * 0.2, y: y * 0.2 });
  };

  const handleMouseEnter = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    onHover(rect);
  };

  const handleMouseLeave = () => {
    setPos({ x: 0, y: 0 });
    onLeave();
  };

  return (
    <div className="relative flex items-center group/btn">
      <button
        ref={buttonRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        className={`relative flex-1 transition-all duration-300 ease-out ${className}`}
      >
        {/* Glow Effect for Active/Hover */}
        {isActive && (
          <div className="absolute -inset-1 bg-gradient-to-r from-prime-600 to-purple-600 rounded-2xl blur-lg opacity-25 animate-pulse" />
        )}
        <div className={`relative flex items-center ${isCollapsed ? 'justify-center p-3.5' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all duration-500 ${
          isActive
            ? (isDarkMode ? 'bg-white/10 text-prime-400 font-bold border border-white/10 shadow-[0_10px_30px_-5px_rgba(139,92,246,0.3)]' : 'bg-prime-500 text-white font-bold shadow-xl shadow-prime-500/30')
            : (isDarkMode ? 'text-gray-400 hover:bg-white/[0.03] hover:text-white' : 'text-gray-600 hover:bg-black/5 hover:text-gray-900')
        }`}>
          {children}
        </div>
      </button>
    </div>
  );
};
const Sidebar = ({ 
  mainNav, 
  activeTab, 
  isDarkMode, 
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  language, 
  t, 
  handleTabChange, 
  expandedMenus, 
  setExpandedMenus,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
  handleDrop,
  brandData,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isFlat = false,
  onOpenBrandOnboarding
}) => {
  const { brands, activeBrandId, setActiveBrandId, user, role, logout } = useBrand();
  const [popoverData, setPopoverData] = useState({ show: false, item: null, top: 0, type: null });
  const [isBrandSwitcherOpen, setIsBrandSwitcherOpen] = useState(false);

  const toggleMenu = (menuId) => {
    if (isSidebarCollapsed) {
      handleTabChange(menuId);
      return;
    }
    setExpandedMenus(prev => 
      prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId]
    );
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[85] animate-in fade-in duration-500"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    <div className={`fixed lg:relative inset-y-0 left-0 flex flex-col overflow-visible transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) z-[90] group/sidebar ${
      isSidebarCollapsed ? 'w-24' : 'w-72'
    } ${
      isMobileMenuOpen ? 'translate-x-0' : '-translate-x-[calc(100%+2rem)] lg:translate-x-0'
    } ${
      isFlat 
        ? 'm-0 rounded-none border-y-0 border-l-0 border-r shadow-none' 
        : 'm-4 rounded-[2.5rem] border shadow-[0_25px_80px_-15px_rgba(0,0,0,0.5)]'
    } ${
      isDarkMode ? 'bg-[#020617]/80 border-white/5 backdrop-blur-3xl' : 'bg-white/90 border-black/5 backdrop-blur-xl'
    }`}>
      
      {/* Scrollable Content Container */}
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-visible p-6 pb-32 lg:pb-6 scrollbar-thin relative z-10">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-prime-500/5 to-transparent pointer-events-none" />
        
        {/* Brand Logo & Switcher */}
        <div 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`mb-12 relative z-20 cursor-pointer transition-all duration-500 ${isSidebarCollapsed ? 'hover:scale-105' : ''}`}
        >
          <div className="flex flex-col items-center w-full pt-4">
            <button 
              onClick={() => handleTabChange('home')}
              className={`relative group/logo mb-4 transition-all duration-500 hover:scale-105 active:scale-95 cursor-pointer ${isSidebarCollapsed ? 'scale-75' : ''}`}
            >
              <div className="absolute -inset-4 bg-prime-500 rounded-full blur-3xl opacity-20 group-hover/logo:opacity-40 transition-opacity duration-1000" />
              <div className={`relative p-4 rounded-3xl border transition-all duration-500 group-hover/logo:rotate-6 ${
                isDarkMode ? 'bg-white/5 border-white/10 shadow-2xl shadow-prime-500/20' : 'bg-white border-black/5 shadow-xl'
              }`}>
                <MetaIcon size={isSidebarCollapsed ? 24 : 40} />
              </div>
            </button>
            
          </div>

          {!isSidebarCollapsed && (
            <div className="relative px-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsBrandSwitcherOpen(!isBrandSwitcherOpen);
                }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-black/5 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${role === 'super-admin' ? 'bg-purple-600 animate-pulse' : 'bg-prime-500'}`}>
                    <Building2 size={16} />
                  </div>
                  <div className="text-left">
                    <p className={`text-[11px] font-black tracking-tight truncate w-32 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {brandData?.name ? brandData.name.toUpperCase() : 'META BIZ'}
                    </p>
                    <p className={`text-[8px] font-black uppercase tracking-widest ${role === 'super-admin' ? 'text-purple-500' : 'text-gray-500'}`}>
                      {role === 'super-admin' ? 'SYSTEM MASTER' : t('certified_brand')}
                    </p>
                  </div>
                </div>
                <ChevronDown size={14} className={`text-gray-500 transition-transform ${isBrandSwitcherOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Brand Dropdown */}
              {isBrandSwitcherOpen && (
                <div className="absolute top-full left-2 right-2 mt-2 p-2 rounded-2xl border bg-[#0a0f1d] border-white/10 shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200">
                  <div className="space-y-1">
                    {brands.length > 0 ? brands.map(b => (
                      <button
                        key={b.id}
                        onClick={() => {
                          setActiveBrandId(b.id);
                          setIsBrandSwitcherOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                          activeBrandId === b.id ? 'bg-prime-500/20 text-prime-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Store size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{b.name}</span>
                        {activeBrandId === b.id && <Activity size={10} className="ml-auto" />}
                      </button>
                    )) : (
                      <p className="p-4 text-[10px] text-gray-500 text-center uppercase tracking-widest italic">No other brands</p>
                    )}
                    <button 
                      onClick={() => {
                        setIsBrandSwitcherOpen(false);
                        onOpenBrandOnboarding();
                      }}
                      className="w-full mt-2 p-3 rounded-xl border border-dashed border-white/10 text-gray-500 text-[9px] font-black uppercase tracking-widest hover:text-white hover:border-white/30 transition-all"
                    >
                      + Add New Brand
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
       
        <nav className={`space-y-3 flex-1 transition-all duration-500 ${isSidebarCollapsed ? 'px-0' : ''}`}>
          {mainNav.map((item, index) => {
            const hasSub = item.sub && item.sub.length > 0;
            const isExpanded = expandedMenus.includes(item.id);
            const isParentActive = activeTab === item.id || (hasSub && item.sub.some(s => s.id === activeTab));

            return (
              <div 
                key={item.id} 
                className="space-y-2"
                draggable={!item.fixed}
                onDragStart={(e) => handleDragStart(e, 'main', index)}
                onDragOver={(e) => handleDragOver(e, 'main', index)}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
              >
                <MagneticButton
                  isActive={isParentActive}
                  isDarkMode={isDarkMode}
                  isCollapsed={isSidebarCollapsed}
                  label={item.label}
                  t={t}
                  hasSub={hasSub}
                  subItems={item.sub}
                  handleTabChange={handleTabChange}
                  activeTab={activeTab}
                  onHover={(rect) => setPopoverData({ 
                    show: true, 
                    item, 
                    top: rect.top, 
                    type: hasSub ? 'submenu' : 'tooltip' 
                  })}
                  onLeave={() => setPopoverData(prev => ({ ...prev, show: false }))}
                  onClick={() => {
                    handleTabChange(item.id); // Navigate to Hub
                    if (hasSub && !isSidebarCollapsed) toggleMenu(item.id); // Toggle submenu
                  }}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`p-2.5 rounded-2xl transition-all duration-500 ${
                      isParentActive ? 'bg-prime-500/20 text-prime-400 font-bold' : 'bg-white/5 group-hover:bg-prime-500/10'
                    }`}>
                      <item.icon size={18} className="shrink-0" />
                    </div>
                    {!isSidebarCollapsed && (
                      <span className={`truncate text-[10px] uppercase font-black tracking-[0.1em] ${hasSub ? 'opacity-100' : 'opacity-80'}`}>
                        {t(item.label)}
                      </span>
                    )}
                  </div>
                  {!isSidebarCollapsed && (
                    <div className="flex items-center gap-3">
                      {hasSub && (
                         <div className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
                            <ChevronDown size={14} className="opacity-40" />
                         </div>
                      )}
                      {!item.fixed && (
                        <GripVertical size={14} className="opacity-0 group-hover/btn:opacity-20 transition-opacity cursor-grab" />
                      )}
                    </div>
                  )}
                </MagneticButton>
                
                {hasSub && isExpanded && !isSidebarCollapsed && (
                  <div className="ml-12 space-y-2 animate-in slide-in-from-top-4 duration-500 pr-2">
                    {item.sub.map((subItem, subIndex) => (
                      <div 
                        key={subItem.id}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          handleDragStart(e, 'sub', index, subIndex);
                        }}
                        onDragOver={(e) => {
                          e.stopPropagation();
                          handleDragOver(e, 'sub', index, subIndex);
                        }}
                        onDragEnd={handleDragEnd}
                        onDrop={handleDrop}
                      >
                        <button
                          onClick={() => handleTabChange(subItem.id)}
                          className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all relative group/sub ${
                            activeTab === subItem.id 
                              ? 'text-prime-400 bg-prime-500/5 shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]'
                              : 'text-gray-500 hover:text-white hover:translate-x-1'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg transition-all duration-300 ${activeTab === subItem.id ? 'bg-prime-500/10 text-prime-500 scale-110' : 'bg-white/5 text-gray-700 group-hover/sub:text-gray-400'}`}>
                              {subItem.icon && <subItem.icon size={12} />}
                            </div>
                            <span className="truncate">{t(subItem.label)}</span>
                          </div>
                          {activeTab === subItem.id && <Activity size={10} className="text-prime-400 animate-pulse" />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Subscription Health Banner */}
        {!isSidebarCollapsed && brandData && (
          <div className="mx-2 mt-4 p-4 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 group/sub shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-prime-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/50 group-hover/sub:text-prime-400 transition-colors">Plan Health</span>
              </div>
              <span className="text-[8px] font-black px-2 py-0.5 rounded-lg bg-prime-500/20 text-prime-400 uppercase">
                {brandData?.plan?.replace('_', ' ') || 'Free Starter'}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter opacity-40 text-white">
                  <span>Order Capacity</span>
                  <span>{Math.round(((brandData?.usageStats?.ordersThisMonth || 0) / (brandData?.usageLimits?.maxOrders || 50)) * 100)}%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      ((brandData?.usageStats?.ordersThisMonth || 0) / (brandData?.usageLimits?.maxOrders || 50)) > 0.9 ? 'bg-rose-500' : 'bg-prime-500'
                    }`}
                    style={{ width: `${Math.min(100, ((brandData?.usageStats?.ordersThisMonth || 0) / (brandData?.usageLimits?.maxOrders || 50)) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[7px] font-black uppercase tracking-[0.2em] text-gray-500 italic">
                <span>Expires</span>
                <span>
                  {(() => {
                    try {
                      const exp = brandData.planExpiry;
                      if (!exp) return 'Active';
                      const date = exp?.seconds ? new Date(exp.seconds * 1000) : new Date(exp);
                      return isNaN(date.getTime()) ? 'Active' : date.toLocaleDateString();
                    } catch (e) {
                      return 'Active';
                    }
                  })()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Branding */}
        <div className={`mt-6 pt-6 border-t border-white/5 transition-all duration-500 ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-xl bg-prime-500 flex items-center justify-center text-white font-black text-xs">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[10px] font-black truncate text-gray-400">{user?.email}</p>
              <button 
                onClick={logout}
                className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline block mt-1"
              >
                Logout Engine
              </button>
            </div>
          </div>
          <div className="h-20 lg:hidden" />
        </div>
      </div>

      {/* Global Popover / Tooltip Rendering (at root to escape scroll container) */}
      {isSidebarCollapsed && popoverData.show && (
        popoverData.type === 'submenu' ? (
          <SubmenuPopover 
            item={popoverData.item} 
            show={true} 
            t={t} 
            handleTabChange={handleTabChange} 
            activeTab={activeTab} 
            top={popoverData.top} 
            onMouseEnter={() => setPopoverData(prev => ({ ...prev, show: true }))}
            onMouseLeave={() => setPopoverData(prev => ({ ...prev, show: false }))}
          />
        ) : (
          <Tooltip 
            text={t(popoverData.item.label)} 
            show={true} 
            top={popoverData.top} 
          />
        )
      )}
    </div>
    </>
  );
};

export default Sidebar;
