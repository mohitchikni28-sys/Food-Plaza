/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface VegBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const VegBadge: React.FC<VegBadgeProps> = ({ size = 'md', showLabel = false }) => {
  const boxSizes = {
    sm: 'w-3.5 h-3.5 p-[2px]',
    md: 'w-4 h-4 p-[2.5px]',
    lg: 'w-5 h-5 p-[3px]',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <div className="inline-flex items-center gap-1.5 shrink-0" title="100% Pure Vegetarian">
      <div
        className={`border-1.5 border-emerald-700 rounded-[3px] flex items-center justify-center bg-white ${boxSizes[size]}`}
      >
        <div className={`rounded-full bg-emerald-700 ${dotSizes[size]}`} />
      </div>
      {showLabel && (
        <span className="text-[11px] font-semibold tracking-wide text-emerald-800 uppercase">
          Pure Veg
        </span>
      )}
    </div>
  );
};
