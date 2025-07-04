import React from 'react';
import { SvgProps } from 'react-native-svg';

// Import all SVGs statically
import FocusIcon from '@/assets/svg/tabs/focus.svg';
import FocusFocusedIcon from '@/assets/svg/tabs/focus-focused.svg';
import PlanIcon from '@/assets/svg/tabs/plan.svg';
import PlanFocusedIcon from '@/assets/svg/tabs/plan-focused.svg';
import JournalIcon from '@/assets/svg/tabs/journal.svg';
import JournalFocusedIcon from '@/assets/svg/tabs/journal-focused.svg';
import InsightsIcon from '@/assets/svg/tabs/insights.svg';
import InsightsFocusedIcon from '@/assets/svg/tabs/insights-focused.svg';
import SettingsIcon from '@/assets/svg/tabs/settings.svg';
import SettingsFocusedIcon from '@/assets/svg/tabs/settings-focused.svg';

type TabName = 'focus' | 'plan' | 'journal' | 'insights' | 'settings';

interface TabIconProps extends SvgProps {
  name: TabName;
  focused?: boolean;
}

const iconMap = {
  focus: FocusIcon,
  'focus-focused': FocusFocusedIcon,
  plan: PlanIcon,
  'plan-focused': PlanFocusedIcon,
  journal: JournalIcon,
  'journal-focused': JournalFocusedIcon,
  insights: InsightsIcon,
  'insights-focused': InsightsFocusedIcon,
  settings: SettingsIcon,
  'settings-focused': SettingsFocusedIcon,
} as const;

export const TabIcon: React.FC<TabIconProps> = ({ name, focused = false, ...props }) => {
  try {
    const iconKey = focused ? `${name}-focused` : name;
    const Icon = iconMap[iconKey as keyof typeof iconMap];
    
    if (!Icon) {
      console.warn(`Icon not found: ${iconKey}`);
      return null;
    }
    
    return <Icon width={24} height={24} {...props} />;
  } catch (error) {
    console.error(`Error rendering icon ${name}:`, error);
    return null;
  }
};
