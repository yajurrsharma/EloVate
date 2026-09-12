import React from 'react';

const AVATAR_PALETTE = [
  'from-purple-600 to-indigo-600',
  'from-emerald-600 to-teal-600',
  'from-pink-600 to-rose-600',
  'from-amber-600 to-orange-600',
  'from-blue-600 to-cyan-600',
  'from-violet-600 to-purple-600',
  'from-teal-600 to-emerald-600',
  'from-rose-600 to-pink-600',
];

export function getAvatarGradient(name = 'User') {
  const safeName = String(name || 'User');
  const idx = (safeName.charCodeAt(0) + (safeName.charCodeAt(1) || 0)) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

export function getInitials(name = 'User') {
  const safeName = String(name || 'User').trim();
  const parts = safeName.split(' ');
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U';
  return ((parts[0][0] || '') + (parts[parts.length - 1][0] || '')).toUpperCase() || 'U';
}

export default function UserAvatar({ name = 'User', size = 'w-10 h-10', textSize = 'text-sm', className = '' }) {
  const gradient = getAvatarGradient(name);
  const initials = getInitials(name);
  return (
    <div className={`${size} rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white ${textSize} flex-shrink-0 select-none ${className}`}>
      {initials}
    </div>
  );
}

export { UserAvatar };
