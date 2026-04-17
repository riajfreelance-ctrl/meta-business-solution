import React from 'react';

export const MetaIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
     <path fill="#0668E1" d="M17.42 6.72c-1.37 0-2.45.64-3.5 1.76l-.42.47c-.55.62-1.12 1.25-1.5 1.62-.38-.37-.95-1-1.5-1.62l-.42-.47c-1.05-1.12-2.13-1.76-3.5-1.76C4.1 6.72 2 8.87 2 11.5s2.1 4.78 4.58 4.78c1.37 0 2.45-.64 3.5-1.76l.42-.47c.55-.62 1.12-1.25 1.5-1.62.38.37.95 1 1.5 1.62l.42.47c1.05 1.12 2.13 1.76 3.5 1.76 2.48 0 4.58-2.15 4.58-4.78s-2.1-4.78-4.58-4.78zm0 7.42c-.85 0-1.55-.42-2.2-1.1l-.42-.47c-.45-.52-.95-1.05-1.3-1.4.35-.35.85-.88 1.3-1.4l.42-.47c.65-.68 1.35-1.1 2.2-1.1 1.34 0 2.42 1.17 2.42 2.62s-1.08 2.62-2.42 2.62zM6.58 14.14c-.85 0-1.55-.42-2.2-1.1l-.42-.47c-.45-.52-.95-1.05-1.3-1.4.35-.35.85-.88 1.3-1.4l.42-.47c.65-.68 1.35-1.1 2.2-1.1 1.34 0 2.42 1.17 2.42 2.62s-1.08 2.62-2.42 2.62z"/>
  </svg>
);

export const FacebookIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-[#1877F2]">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export const InstagramIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="instaIconGrad" x1="12" y1="0" x2="12" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#833AB4"/>
        <stop offset="0.5" stopColor="#FD1D1D"/>
        <stop offset="1" stopColor="#FCB045"/>
      </linearGradient>
    </defs>
    <path fill="url(#instaIconGrad)" d="M12 0C8.74 0 8.33.015 7.05.073 5.77.132 4.9.336 4.14.63c-.78.3-1.45.71-2.12 1.38-.67.67-1.08 1.34-1.38 2.12-.3.76-.5 1.63-.56 2.91C.015 8.33 0 8.74 0 12c0 3.26.015 3.67.073 4.95.059 1.28.261 2.15.56 2.91.3.78.71 1.45 1.38 2.12.67.67 1.34 1.08 2.12 1.38.76.3 1.63.5 2.91.56 1.28.058 1.69.073 4.95.073 3.26 0 3.67-.015 4.95-.073 1.28-.059 2.15-.261 2.91-.56.78-.3 1.45-.71 2.12-1.38.67-.67 1.08-1.34 1.38-2.12.3-.76.5-1.63.56-2.91.058-1.28.073-1.69.073-4.95 0-3.26-.015-3.67-.073-4.95-.059-1.28-.261-2.15-.56-2.91-.3-.78-.71-1.45-1.38-2.12-.67-.67-1.34-1.08-2.12-1.38-.76-.3-1.63-.5-2.91-.56C15.67.015 15.26 0 12 0zm0 2.16c3.2 0 3.58.012 4.85.07 1.17.054 1.8.249 2.22.412.56.216.96.474 1.38.894.42.42.678.82.894 1.38.163.42.358 1.05.412 2.22.058 1.27.07 1.65.07 4.85s-.012 3.58-.07 4.85c-.054 1.17-.249 1.8-.412 2.22-.216.56-.474.96-.894 1.38-.42.42-.82.678-1.38.894-.42.163-1.05.358-2.22.412-1.27.058-1.65.07-4.85.07s-3.58-.012-4.85-.07c-1.17-.054-1.8-.249-2.22-.412-.56-.216-.96-.474-1.38-.894-.42-.42-.678-.82-.894-1.38-.163-.42-.358-1.05-.412-2.22C2.172 15.58 2.16 15.2 2.16 12s.012-3.58.07-4.85c.054-1.17.249-1.8.412-2.22.216-.56.474-.96.894-1.38.42-.42.82-.678 1.38-.894.42-.163 1.05-.358 2.22-.412 1.27-.058 1.65-.07 4.85-.07zM12 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zm0 10.16a4 4 0 110-8 4 4 0 010 8zm6.4-10.42a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/>
  </svg>
);

export const WhatsAppIcon = ({ size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className="text-[#25D366]"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export const MessengerIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="msgGradient" x1="12" y1="0" x2="12" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#00B2FF"/>
        <stop offset="0.5" stopColor="#006AFF"/>
        <stop offset="1" stopColor="#A033FF"/>
      </linearGradient>
    </defs>
    <path fill="url(#msgGradient)" d="M12 0C5.373 0 0 4.974 0 11.111c0 3.491 1.745 6.608 4.473 8.564V24l4.091-2.245c1.103.306 2.27.467 3.436.467 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.255 14.821l-3.085-3.292-6.023 3.292 6.623-7.031 3.161 3.292 5.947-3.292-6.623 7.031z"/>
  </svg>
);

export const IGDirectIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="instaIconGradDirect" x1="12" y1="0" x2="12" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#833AB4"/>
        <stop offset="0.5" stopColor="#FD1D1D"/>
        <stop offset="1" stopColor="#FCB045"/>
      </linearGradient>
    </defs>
    <path fill="url(#instaIconGradDirect)" d="M12 0C5.373 0 0 4.974 0 11.111c0 3.491 1.745 6.608 4.473 8.564V24l4.091-2.245c1.103.306 2.27.467 3.436.467 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.255 14.821l-3.085-3.292-6.023 3.292 6.623-7.031 3.161 3.292 5.947-3.292-6.623 7.031z"/>
  </svg>
);

export const FBCommentIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    <path fill="white" d="M18 10h-8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2zm-2 4h-6a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2z" />
  </svg>
);

export const IGCommentIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="instaIconGradComment" x1="12" y1="0" x2="12" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#833AB4"/>
        <stop offset="0.5" stopColor="#FD1D1D"/>
        <stop offset="1" stopColor="#FCB045"/>
      </linearGradient>
    </defs>
    <path fill="url(#instaIconGradComment)" d="M12 0C15.26 0 15.67.015 16.95.073c1.28.059 2.15.263 2.91.557.78.3 1.45.71 2.12 1.38.67.67 1.08 1.34 1.38 2.12.3.76.5 1.63.56 2.91C23.985 8.33 24 8.74 24 12s-.015 3.67-.073 4.95c-.059 1.28-.263 2.15-.557 2.91-.3.78-.71 1.45-1.38 2.12-.67.67-1.34 1.08-2.12 1.38-.76.3-1.63.5-2.91.56-1.28.058-1.69.073-4.95.073s-3.67-.015-4.95-.073c-1.28-.059-2.15-.263-2.91-.557-.78-.3-1.45-.71-2.12-1.38-.67-.67-1.08-1.34-1.38-2.12-.3-.76-.5-1.63-.56-2.91C.015 15.67 0 15.26 0 12s.015-3.67.073-4.95c.059-1.28.263-2.15.557-2.91.3-.78.71-1.45 1.38-2.12.67-.67 1.34-1.08 2.12-1.38.76-.3 1.63-.5 2.91-.56C8.33.015 8.74 0 12 0z"/>
    <path fill="white" d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

export const SocialHubIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="hubIconGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#006AFF"/>
        <stop offset="1" stopColor="#A033FF"/>
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="11" fill="url(#hubIconGrad)" fillOpacity="0.2" stroke="url(#hubIconGrad)" strokeWidth="2"/>
    <path d="M12 7l-1 2h2l-1-2zm-3 4l-2 1v-2l2 1zm6 0l2 1v-2l-2 1zm-3 4l1-2h-2l1 2z" fill="white" />
    <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" fill="white" />
  </svg>
);

export const HomeIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3B82F6]">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

export const ProductHubIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#F59E0B]">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

export const DataEngineIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10B981]">
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);

export const AdminIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#6366F1]">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

export const SettingIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9CA3AF]">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1-2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

export const DraftIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"></path>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
  </svg>
);

export const GapIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

export const KnowledgeIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);

export const ArchitectIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
    <polyline points="21 8 21 21 3 21 3 8"></polyline>
    <rect x="1" y="3" width="22" height="5"></rect>
    <line x1="10" y1="12" x2="14" y2="12"></line>
  </svg>
);

export const SocialSuiteIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="suiteGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#006AFF"/>
        <stop offset="1" stopColor="#A033FF"/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#suiteGradient)" fillOpacity="0.1" stroke="url(#suiteGradient)" strokeWidth="2"/>
    <path d="M12 6c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6z" fill="url(#suiteGradient)" fillOpacity="0.2"/>
    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" fill="url(#suiteGradient)"/>
    <circle cx="12" cy="12" r="1.5" fill="white"/>
  </svg>
);
