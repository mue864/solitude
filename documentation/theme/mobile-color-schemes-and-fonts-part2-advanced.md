# Mobile App Color Schemes and Fonts - Part 2: Advanced Theory & Accessibility

## Table of Contents

1. [Advanced Color Theory](#advanced-color-theory)
2. [Accessibility and WCAG Guidelines](#accessibility-and-wcag-guidelines)
3. [Platform-Specific Design Guidelines](#platform-specific-design-guidelines)
4. [Brand-Specific Color Systems](#brand-specific-color-systems)
5. [Advanced Typography Techniques](#advanced-typography-techniques)
6. [Performance Optimization](#performance-optimization)

## Advanced Color Theory

### Color Psychology in Mobile Apps

#### Emotional Impact of Colors
```javascript
const colorPsychology = {
  red: {
    emotions: ["urgency", "passion", "energy", "danger"],
    usage: "Call-to-action buttons, error states, notifications",
    industries: ["Food delivery", "Dating apps", "Emergency services"],
    examples: ["YouTube", "Netflix", "Coca-Cola", "Airbnb"]
  },
  blue: {
    emotions: ["trust", "stability", "professionalism", "calm"],
    usage: "Primary actions, business apps, social media",
    industries: ["Finance", "Healthcare", "Social media", "Productivity"],
    examples: ["Facebook", "LinkedIn", "PayPal", "Dropbox"]
  },
  green: {
    emotions: ["growth", "health", "money", "nature"],
    usage: "Success states, financial apps, health apps",
    industries: ["Finance", "Health", "Environment", "Food"],
    examples: ["WhatsApp", "Spotify", "Mint", "Starbucks"]
  },
  orange: {
    emotions: ["enthusiasm", "creativity", "warmth", "affordability"],
    usage: "Secondary actions, promotions, creative apps",
    industries: ["E-commerce", "Creative tools", "Food", "Travel"],
    examples: ["Amazon", "VLC", "SoundCloud", "Home Depot"]
  },
  purple: {
    emotions: ["luxury", "creativity", "mystery", "spirituality"],
    usage: "Premium features, creative apps, beauty apps",
    industries: ["Beauty", "Creative", "Luxury", "Gaming"],
    examples: ["Twitch", "Yahoo", "Hallmark", "Taco Bell"]
  },
  yellow: {
    emotions: ["happiness", "optimism", "attention", "caution"],
    usage: "Highlights, warnings, cheerful apps",
    industries: ["Food", "Children", "Transportation", "Communication"],
    examples: ["Snapchat", "McDonald's", "IKEA", "Best Buy"]
  },
  black: {
    emotions: ["elegance", "sophistication", "power", "mystery"],
    usage: "Luxury apps, text, backgrounds",
    industries: ["Luxury", "Fashion", "Technology", "Photography"],
    examples: ["Nike", "Apple", "Uber", "Chanel"]
  },
  white: {
    emotions: ["purity", "simplicity", "cleanliness", "minimalism"],
    usage: "Backgrounds, text, clean interfaces",
    industries: ["Healthcare", "Minimalist design", "Technology"],
    examples: ["Apple", "Google", "Tesla", "Airbnb"]
  }
};
```

### Advanced Color Harmonies

#### Split-Complementary Schemes
```javascript
const splitComplementarySchemes = {
  redBased: {
    name: "Red Split-Complementary",
    primary: "#FF0000", // Red
    secondary: "#00FF80", // Blue-Green
    tertiary: "#0080FF", // Green-Blue
    usage: "High energy apps, gaming, sports",
    implementation: {
      primary: "#E53E3E",
      secondary: "#38B2AC",
      tertiary: "#3182CE",
      neutral: "#F7FAFC"
    }
  },
  blueBased: {
    name: "Blue Split-Complementary",
    primary: "#0080FF", // Blue
    secondary: "#FF8000", // Red-Orange
    tertiary: "#FF0080", // Orange-Red
    usage: "Professional apps with energy accents",
    implementation: {
      primary: "#3182CE",
      secondary: "#DD6B20",
      tertiary: "#D53F8C",
      neutral: "#F7FAFC"
    }
  }
};
```

#### Tetradic (Rectangle) Schemes
```javascript
const tetradicSchemes = {
  balanced: {
    name: "Balanced Tetradic",
    colors: {
      primary: "#FF6B6B", // Red-Orange
      secondary: "#4ECDC4", // Blue-Green
      tertiary: "#45B7D1", // Blue
      quaternary: "#96CEB4" // Yellow-Green
    },
    usage: "Colorful apps, children's apps, creative platforms",
    balance: "Use one color as dominant, others as accents"
  },
  professional: {
    name: "Professional Tetradic",
    colors: {
      primary: "#2C3E50", // Dark Blue
      secondary: "#E74C3C", // Red
      tertiary: "#F39C12", // Orange
      quaternary: "#27AE60" // Green
    },
    usage: "Dashboard apps, analytics, business tools",
    balance: "Dark blue dominant, others for status indicators"
  }
};
```

### Color Temperature and Context

#### Warm vs Cool Color Applications
```javascript
const colorTemperature = {
  warm: {
    colors: ["#FF6B6B", "#FF8E53", "#FF6B35", "#F7931E", "#FFD93D"],
    characteristics: ["Energetic", "Inviting", "Stimulating", "Attention-grabbing"],
    bestFor: [
      "Food and restaurant apps",
      "Social and dating apps",
      "Entertainment platforms",
      "Call-to-action elements",
      "Promotional content"
    ],
    avoid: [
      "Medical apps (can increase anxiety)",
      "Sleep and meditation apps",
      "Financial apps (may seem unprofessional)"
    ]
  },
  cool: {
    colors: ["#6C5CE7", "#74B9FF", "#00B894", "#00CEC9", "#A29BFE"],
    characteristics: ["Calming", "Professional", "Trustworthy", "Stable"],
    bestFor: [
      "Healthcare and medical apps",
      "Financial and banking apps",
      "Productivity tools",
      "Professional services",
      "Technology platforms"
    ],
    avoid: [
      "Food apps (can reduce appetite)",
      "Emergency or urgent actions",
      "Children's apps (may seem cold)"
    ]
  }
};
```

## Accessibility and WCAG Guidelines

### Color Contrast Requirements

#### WCAG 2.1 Contrast Ratios
```javascript
const contrastRequirements = {
  AA: {
    normalText: {
      minimum: 4.5,
      description: "18px and below, or 14px bold and below"
    },
    largeText: {
      minimum: 3.0,
      description: "18px bold and above, or 24px and above"
    },
    nonTextElements: {
      minimum: 3.0,
      description: "UI components, graphics, icons"
    }
  },
  AAA: {
    normalText: {
      minimum: 7.0,
      description: "Enhanced contrast for better accessibility"
    },
    largeText: {
      minimum: 4.5,
      description: "Enhanced contrast for large text"
    }
  }
};

// Practical implementation
const accessibleColors = {
  // AA Compliant combinations
  darkOnLight: {
    background: "#FFFFFF",
    text: "#212121", // Contrast ratio: 16.1
    secondary: "#757575" // Contrast ratio: 4.6
  },
  lightOnDark: {
    background: "#212121",
    text: "#FFFFFF", // Contrast ratio: 16.1
    secondary: "#BDBDBD" // Contrast ratio: 4.6
  },
  // AAA Compliant combinations
  highContrast: {
    background: "#FFFFFF",
    text: "#000000", // Contrast ratio: 21
    links: "#0000EE" // Contrast ratio: 8.6
  }
};
```

#### Color Contrast Testing Tools
```javascript
const contrastTestingTools = {
  online: [
    "WebAIM Contrast Checker",
    "Colour Contrast Analyser",
    "Stark (Figma/Sketch plugin)",
    "Accessible Colors"
  ],
  libraries: [
    "color-contrast-checker (npm)",
    "wcag-contrast (npm)",
    "tinycolor2 (npm)"
  ],
  implementation: `
    // Example using color-contrast-checker
    import ColorContrastChecker from 'color-contrast-checker';
    
    const ccc = new ColorContrastChecker();
    const isAccessible = ccc.isLevelAA('#FFFFFF', '#212121');
    console.log(isAccessible); // true
  `
};
```

### Color Blindness Considerations

#### Types of Color Blindness
```javascript
const colorBlindnessTypes = {
  protanopia: {
    type: "Red-blind",
    prevalence: "1% of males",
    difficulty: "Distinguishing red from green",
    solutions: [
      "Use patterns or textures in addition to color",
      "Ensure sufficient contrast",
      "Use blue and yellow as primary differentiators"
    ]
  },
  deuteranopia: {
    type: "Green-blind",
    prevalence: "1% of males",
    difficulty: "Distinguishing green from red",
    solutions: [
      "Avoid red-green combinations",
      "Use blue and orange as alternatives",
      "Add icons or labels to color-coded elements"
    ]
  },
  tritanopia: {
    type: "Blue-blind",
    prevalence: "0.003% of population",
    difficulty: "Distinguishing blue from yellow",
    solutions: [
      "Use red and green as primary colors",
      "Avoid blue-yellow combinations",
      "Ensure high contrast ratios"
    ]
  }
};

// Color-blind friendly palettes
const colorBlindFriendlyPalettes = {
  palette1: {
    colors: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"],
    description: "Safe for all types of color blindness"
  },
  palette2: {
    colors: ["#0173b2", "#de8f05", "#029e73", "#cc78bc", "#ca9161"],
    description: "Paul Tol's bright palette"
  },
  palette3: {
    colors: ["#332288", "#88CCEE", "#44AA99", "#117733", "#DDCC77"],
    description: "Paul Tol's muted palette"
  }
};
```

### Accessible Color Implementation

#### React Native Implementation
```javascript
// AccessibleColors.js
export const AccessibleColors = {
  // High contrast combinations
  primary: {
    background: '#FFFFFF',
    onBackground: '#000000', // 21:1 contrast
    surface: '#F5F5F5',
    onSurface: '#212121' // 16.1:1 contrast
  },
  
  // Status colors with sufficient contrast
  success: {
    light: '#1B5E20', // Dark green on light background
    dark: '#4CAF50',  // Light green on dark background
    background: '#E8F5E8'
  },
  
  warning: {
    light: '#E65100', // Dark orange on light background
    dark: '#FF9800',  // Light orange on dark background
    background: '#FFF3E0'
  },
  
  error: {
    light: '#B71C1C', // Dark red on light background
    dark: '#F44336',  // Light red on dark background
    background: '#FFEBEE'
  },
  
  // Color-blind friendly alternatives
  colorBlindSafe: {
    blue: '#0173b2',
    orange: '#de8f05',
    green: '#029e73',
    pink: '#cc78bc',
    brown: '#ca9161'
  }
};

// Usage in components
const AccessibleButton = ({ type = 'primary', children, ...props }) => {
  const getButtonColors = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: AccessibleColors.success.light,
          color: '#FFFFFF'
        };
      case 'warning':
        return {
          backgroundColor: AccessibleColors.warning.light,
          color: '#FFFFFF'
        };
      case 'error':
        return {
          backgroundColor: AccessibleColors.error.light,
          color: '#FFFFFF'
        };
      default:
        return {
          backgroundColor: AccessibleColors.primary.onBackground,
          color: AccessibleColors.primary.background
        };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getButtonColors().backgroundColor }
      ]}
      {...props}
    >
      <Text style={[styles.buttonText, { color: getButtonColors().color }]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};
```

## Platform-Specific Design Guidelines

### iOS Human Interface Guidelines

#### iOS Color System
```javascript
const iosColorSystem = {
  systemColors: {
    // Dynamic colors that adapt to light/dark mode
    label: {
      light: '#000000',
      dark: '#FFFFFF'
    },
    secondaryLabel: {
      light: '#3C3C43',
      dark: '#EBEBF5'
    },
    tertiaryLabel: {
      light: '#3C3C43',
      dark: '#EBEBF5'
    },
    quaternaryLabel: {
      light: '#3C3C43',
      dark: '#EBEBF5'
    },
    
    // Background colors
    systemBackground: {
      light: '#FFFFFF',
      dark: '#000000'
    },
    secondarySystemBackground: {
      light: '#F2F2F7',
      dark: '#1C1C1E'
    },
    tertiarySystemBackground: {
      light: '#FFFFFF',
      dark: '#2C2C2E'
    },
    
    // Grouped background colors
    systemGroupedBackground: {
      light: '#F2F2F7',
      dark: '#000000'
    },
    secondarySystemGroupedBackground: {
      light: '#FFFFFF',
      dark: '#1C1C1E'
    },
    
    // Fill colors
    systemFill: {
      light: '#78788033',
      dark: '#78788066'
    },
    secondarySystemFill: {
      light: '#78788028',
      dark: '#78788051'
    }
  },
  
  // iOS semantic colors
  semanticColors: {
    systemBlue: '#007AFF',
    systemGreen: '#34C759',
    systemIndigo: '#5856D6',
    systemOrange: '#FF9500',
    systemPink: '#FF2D92',
    systemPurple: '#AF52DE',
    systemRed: '#FF3B30',
    systemTeal: '#5AC8FA',
    systemYellow: '#FFCC00'
  }
};

// iOS implementation
const iOSTheme = {
  colors: {
    primary: iosColorSystem.semanticColors.systemBlue,
    background: iosColorSystem.systemColors.systemBackground,
    surface: iosColorSystem.systemColors.secondarySystemBackground,
    text: iosColorSystem.systemColors.label,
    textSecondary: iosColorSystem.systemColors.secondaryLabel
  },
  
  // iOS-specific styling
  components: {
    navigationBar: {
      backgroundColor: 'transparent',
      tintColor: iosColorSystem.semanticColors.systemBlue,
      titleColor: iosColorSystem.systemColors.label
    },
    tabBar: {
      backgroundColor: iosColorSystem.systemColors.systemBackground,
      tintColor: iosColorSystem.semanticColors.systemBlue,
      unselectedTintColor: iosColorSystem.systemColors.secondaryLabel
    }
  }
};
```

### Material Design Guidelines

#### Material Design 3 Color System
```javascript
const materialDesign3Colors = {
  // Primary color roles
  primary: '#6750A4',
  onPrimary: '#FFFFFF',
  primaryContainer: '#EADDFF',
  onPrimaryContainer: '#21005D',
  
  // Secondary color roles
  secondary: '#625B71',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E8DEF8',
  onSecondaryContainer: '#1D192B',
  
  // Tertiary color roles
  tertiary: '#7D5260',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFD8E4',
  onTertiaryContainer: '#31111D',
  
  // Error color roles
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',
  
  // Background color roles
  background: '#FFFBFE',
  onBackground: '#1C1B1F',
  surface: '#FFFBFE',
  onSurface: '#1C1B1F',
  
  // Surface variants
  surfaceVariant: '#E7E0EC',
  onSurfaceVariant: '#49454F',
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
  
  // Other roles
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#313033',
  inverseOnSurface: '#F4EFF4',
  inversePrimary: '#D0BCFF'
};

// Material Design 3 Dark Theme
const materialDesign3Dark = {
  primary: '#D0BCFF',
  onPrimary: '#381E72',
  primaryContainer: '#4F378B',
  onPrimaryContainer: '#EADDFF',
  
  secondary: '#CCC2DC',
  onSecondary: '#332D41',
  secondaryContainer: '#4A4458',
  onSecondaryContainer: '#E8DEF8',
  
  tertiary: '#EFB8C8',
  onTertiary: '#492532',
  tertiaryContainer: '#633B48',
  onTertiaryContainer: '#FFD8E4',
  
  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',
  
  background: '#1C1B1F',
  onBackground: '#E6E1E5',
  surface: '#1C1B1F',
  onSurface: '#E6E1E5',
  
  surfaceVariant: '#49454F',
  onSurfaceVariant: '#CAC4D0',
  outline: '#938F99',
  outlineVariant: '#49454F',
  
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#E6E1E5',
  inverseOnSurface: '#313033',
  inversePrimary: '#6750A4'
};
```

## Brand-Specific Color Systems

### Tech Company Color Palettes

#### Google Material Colors
```javascript
const googleColors = {
  brand: {
    blue: '#4285F4',
    red: '#EA4335',
    yellow: '#FBBC04',
    green: '#34A853'
  },
  extended: {
    blue: {
      50: '#E8F0FE',
      100: '#D2E3FC',
      200: '#AECBFA',
      300: '#8AB4F8',
      400: '#669DF6',
      500: '#4285F4',
      600: '#1A73E8',
      700: '#1557B0',
      800: '#0F4C81',
      900: '#0A3A5C'
    }
  },
  usage: "Clean, modern, trustworthy applications"
};
```

#### Apple Color Palette
```javascript
const appleColors = {
  brand: {
    blue: '#007AFF',
    gray: '#8E8E93',
    black: '#000000',
    white: '#FFFFFF'
  },
  systemColors: {
    red: '#FF3B30',
    orange: '#FF9500',
    yellow: '#FFCC00',
    green: '#34C759',
    mint: '#00C7BE',
    teal: '#5AC8FA',
    cyan: '#32D2FF',
    blue: '#007AFF',
    indigo: '#5856D6',
    purple: '#AF52DE',
    pink: '#FF2D92',
    brown: '#A2845E'
  },
  usage: "Premium, minimalist, user-friendly applications"
};
```

#### Facebook/Meta Color System
```javascript
const facebookColors = {
  brand: {
    primary: '#1877F2',
    secondary: '#42A5F5',
    accent: '#E4E6EA'
  },
  messenger: {
    primary: '#0084FF',
    gradient: ['#0084FF', '#44BDF6']
  },
  instagram: {
    gradient: ['#833AB4', '#FD1D1D', '#FCB045']
  },
  whatsapp: {
    primary: '#25D366',
    secondary: '#128C7E'
  },
  usage: "Social media, communication, community applications"
};
```

### Industry-Specific Color Schemes

#### Healthcare Applications
```javascript
const healthcareColors = {
  primary: {
    blue: '#0066CC',    // Trust and professionalism
    green: '#00A86B',   // Health and wellness
    teal: '#008B8B'     // Calm and healing
  },
  secondary: {
    lightBlue: '#E6F3FF',
    lightGreen: '#E6F7F1',
    gray: '#F5F5F5'
  },
  accent: {
    warning: '#FF6B35',  // Medical alerts
    error: '#DC143C',    // Critical alerts
    success: '#228B22'   // Positive results
  },
  usage: "Medical apps, health tracking, telemedicine"
};
```

#### Financial Applications
```javascript
const financialColors = {
  primary: {
    darkBlue: '#003366',  // Trust and stability
    green: '#006400',     // Money and growth
    gold: '#FFD700'       // Premium and wealth
  },
  secondary: {
    lightBlue: '#E6F2FF',
    lightGreen: '#E6F7E6',
    cream: '#FFF8DC'
  },
  status: {
    profit: '#228B22',    // Positive returns
    loss: '#DC143C',      // Negative returns
    neutral: '#708090'    // No change
  },
  usage: "Banking apps, investment platforms, payment systems"
};
```

## Advanced Typography Techniques

### Font Pairing Strategies

#### Classic Pairings
```javascript
const fontPairings = {
  classic: {
    heading: "Playfair Display",
    body: "Source Sans Pro",
    description: "Elegant serif with clean sans-serif",
    usage: "Editorial apps, luxury brands, content platforms"
  },
  modern: {
    heading: "Montserrat",
    body: "Open Sans",
    description: "Geometric sans-serif with humanist sans-serif",
    usage: "Tech apps, startups, modern interfaces"
  },
  friendly: {
    heading: "Nunito",
    body: "Lato",
    description: "Rounded sans-serif with warm sans-serif",
    usage: "Consumer apps, social platforms, lifestyle apps"
  },
  professional: {
    heading: "Roboto Slab",
    body: "Roboto",
    description: "Slab serif with matching sans-serif family",
    usage: "Business apps, productivity tools, corporate platforms"
  }
};
```

#### Font Hierarchy System
```javascript
const typographyHierarchy = {
  display: {
    fontSize: 57,
    lineHeight: 64,
    fontWeight: '400',
    letterSpacing: -0.25,
    usage: "Large marketing headlines"
  },
  headline: {
    large: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '400',
      letterSpacing: 0
    },
    medium: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '400',
      letterSpacing: 0
    },
    small: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '400',
      letterSpacing: 0
    }
  },
  title: {
    large: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '400',
      letterSpacing: 0
    },
    medium: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '500',
      letterSpacing: 0.15
    },
    small: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500',
      letterSpacing: 0.1
    }
  },
  body: {
    large: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400',
      letterSpacing: 0.5
    },
    medium: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400',
      letterSpacing: 0.25
    },
    small: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400',
      letterSpacing: 0.4
    }
  },
  label: {
    large: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500',
      letterSpacing: 0.1
    },
    medium: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500',
      letterSpacing: 0.5
    },
    small: {
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '500',
      letterSpacing: 0.5
    }
  }
};
```

### Responsive Typography

#### Dynamic Type Scaling
```javascript
const responsiveTypography = {
  // Base sizes for different screen sizes
  breakpoints: {
    small: 320,   // Small phones
    medium: 375,  // Standard phones
    large: 414,   // Large phones
    tablet: 768   // Tablets
  },
  
  // Scaling factors
  scaleFactors: {
    small: 0.875,   // 87.5% of base size
    medium: 1,      // 100% base size
    large: 1.125,   // 112.5% of base size
    tablet: 1.25    // 125% of base size
  },
  
  // Implementation
  getResponsiveSize: (baseSize, screenWidth) => {
    if (screenWidth < 375) return baseSize * 0.875;
    if (screenWidth < 414) return baseSize;
    if (screenWidth < 768) return baseSize * 1.125;
    return baseSize * 1.25;
  }
};

// React Native implementation
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const getResponsiveFontSize = (baseSize) => {
  if (width < 375) return baseSize * 0.875;
  if (width < 414) return baseSize;
  if (width < 768) return baseSize * 1.125;
  return baseSize * 1.25;
};

const ResponsiveText = ({ children, style, baseSize = 16, ...props }) => (
  <Text
    style={[
      {
        fontSize: getResponsiveFontSize(baseSize),
        lineHeight: getResponsiveFontSize(baseSize) * 1.5
      },
      style
    ]}
    {...props}
  >
    {children}
  </Text>
);
```

## Performance Optimization

### Font Loading Optimization

#### Font Loading Strategies
```javascript
const fontLoadingStrategies = {
  systemFonts: {
    advantages: [
      "No download time",
      "Consistent with platform",
      "Automatic fallbacks",
      "Better performance"
    ],
    implementation: {
      ios: "San Francisco",
      android: "Roboto",
      fallback: "system-ui, sans-serif"
    }
  },
  
  customFonts: {
    strategies: [
      "Preload critical fonts",
      "Use font-display: swap",
      "Subset fonts for specific languages",
      "Use variable fonts when possible"
    ],
    implementation: `
      // React Native
      import { useFonts } from 'expo-font';
      
      export default function App() {
        const [fontsLoaded] = useFonts({
          'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
          'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
        });
        
        if (!fontsLoaded) {
          return <AppLoading />;
        }
        
        return <MainApp />;
      }
    `
  }
};
```

### Color Performance Optimization

#### Efficient Color Usage
```javascript
const colorOptimization = {
  // Use color constants to avoid recalculation
  colorConstants: {
    PRIMARY: '#2196F3',
    SECONDARY: '#03DAC6',
    BACKGROUND: '#FFFFFF',
    SURFACE: '#F5F5F5'
  },
  
  // Memoize color calculations
  memoizedColors: `
    import { useMemo } from 'react';
    
    const useThemeColors = (isDark) => {
      return useMemo(() => ({
        background: isDark ? '#121212' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#000000',
        primary: isDark ? '#BB86FC' : '#6200EE'
      }), [isDark]);
    };
  `,
  
  // Optimize for OLED displays
  oledOptimization: {
    darkMode: {
      background: '#000000', // True black saves battery on OLED
      surface: '#121212',    // Near black for surfaces
      primary: '#BB86FC'     // Bright colors pop on OLED
    },
    tips: [
      "Use true black (#000000) for backgrounds",
      "Avoid pure white text on black (use #FFFFFF with opacity)",
      "Bright accent colors work well on OLED",
      "Consider battery impact of color choices"
    ]
  }
};
```

This Part 2 covers advanced color theory, accessibility guidelines, platform-specific considerations, and performance optimization. In Part 3, we'll cover:

- **Part 3**: Dark mode implementation, adaptive color schemes, and dynamic theming
- **Part 4**: Custom font implementation, font loading strategies, and typography animations
- **Part 5**: Real-world case studies and brand-specific implementations
- **Part 6**: Testing, debugging, and maintenance of color and typography systems

Would you like me to continue with Part 3?
