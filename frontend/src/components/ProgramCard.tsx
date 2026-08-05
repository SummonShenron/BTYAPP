import React from 'react';
import btyLogo from '../assets/logo.jpg';
import './__styles__/ProgramCard.css';

export interface ProgramCardProps {
  title: string;
  description: string;
  price?: string;
  features?: string[];
  onSelect?: () => void;
}

export const ProgramCard = ({
  title,
  description,
  price = 'Custom Pricing',
  features = [],
  onSelect,
}: ProgramCardProps) => {
  return (
    <div className="glass-card-interactive flex flex-col justify-between space-y-6">
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-white group-hover:text-[#38C2DE] transition-colors">
          {title}
        </h3>
        <p className="text-[#A0A5AA] text-sm leading-relaxed">
          {description}
        </p>
      </div>

      <button 
        onClick={onSelect}
        className="btn-neon-outline w-full text-center text-sm py-2.5"
      >
        Select Program
      </button>
    </div>
  );
}

export default ProgramCard;