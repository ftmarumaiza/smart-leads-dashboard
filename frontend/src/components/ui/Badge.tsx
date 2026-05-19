import React from 'react';
import { LeadStatus, LeadSource } from '../../types';
import { STATUS_COLORS, SOURCE_COLORS } from '../../utils';

interface StatusBadgeProps {
  status: LeadStatus;
}

interface SourceBadgeProps {
  source: LeadSource;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
    {status}
  </span>
);

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${SOURCE_COLORS[source]}`}>
    {source}
  </span>
);
