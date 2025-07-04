import React from 'react';
import { SvgProps } from 'react-native-svg';

// Import all tab SVGs using direct imports
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

type TabIconType = React.FC<SvgProps>;

interface TabIconsType {
  [key: string]: {
    default: TabIconType;
    focused: TabIconType;
  };
}

const TabIcons: TabIconsType = {
  focus: {
    default: FocusIcon,
    focused: FocusFocusedIcon,
  },
  plan: {
    default: PlanIcon,
    focused: PlanFocusedIcon,
  },
  journal: {
    default: JournalIcon,
    focused: JournalFocusedIcon,
  },
  insights: {
    default: InsightsIcon,
    focused: InsightsFocusedIcon,
  },
  settings: {
    default: SettingsIcon,
    focused: SettingsFocusedIcon,
  },
};

export type TabName = keyof typeof TabIcons;

export const getTabIcon = (name: TabName, isFocused: boolean): React.FC<SvgProps> => {
  return isFocused ? TabIcons[name].focused : TabIcons[name].default;
};
