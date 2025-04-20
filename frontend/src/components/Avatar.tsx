import React from 'react';

interface AvatarProps {
  username: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ username, className = "w-8 h-8 text-sm" }) => {
  const nameParts = username.trim().split(' ');

  const initials =
    nameParts.length === 1
      ? nameParts[0].slice(0, 2)
      : nameParts.map(name => name[0]).join('');

  const backgroundColors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
    'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
    'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
    'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
    'bg-rose-500'
  ];

  // Generate a hash value based on the username
  const hash = username.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // Use the hash value to select a color from the backgroundColors array
  const randomColor = backgroundColors[Math.abs(hash % backgroundColors.length)];

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white ${randomColor} ${className}`}
    >
      {initials}
    </div>
  );
};

export default Avatar;