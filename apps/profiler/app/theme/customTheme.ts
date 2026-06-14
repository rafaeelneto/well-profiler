import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import type { ComponentsDesignTokens } from '@primeuix/themes/types';

// Cool-slate surface scale (blue-tinted neutrals, light → dark)
const surfaceLight = {
  0: '#ffffff',
  50: '#f7f8fa',
  100: '#eef0f3',
  200: '#d8dde3',
  300: '#b9c0c8',
  400: '#7888a0',
  500: '#4f5d75',
  600: '#3d4a60',
  700: '#2a3344',
  800: '#1a2230',
  900: '#131922',
  950: '#0d1218',
};

// Mirror scale: same hue/chroma, inverted lightness (step N = surfaceLight[950-N])
const contentLight = {
  0: '#0d1218',
  50: '#131922',
  100: '#1a2230',
  200: '#2a3344',
  300: '#3d4a60',
  400: '#4f5d75',
  500: '#7888a0',
  600: '#b9c0c8',
  700: '#d8dde3',
  800: '#eef0f3',
  900: '#f7f8fa',
  950: '#ffffff',
};

// Dark mode: both scales fully inverted so {surface.0} stays the ground
// and {content.0} stays the primary text — same token references work in both modes
const surfaceDark = {
  0: '#0d1218',
  50: '#131922',
  100: '#1a2230',
  200: '#2a3344',
  300: '#3d4a60',
  400: '#4f5d75',
  500: '#7888a0',
  600: '#b9c0c8',
  700: '#d8dde3',
  800: '#eef0f3',
  900: '#f7f8fa',
  950: '#ffffff',
};

const contentDark = {
  0: '#ffffff',
  50: '#f7f8fa',
  100: '#eef0f3',
  200: '#d8dde3',
  300: '#b9c0c8',
  400: '#7888a0',
  500: '#4f5d75',
  600: '#3d4a60',
  700: '#2a3344',
  800: '#1a2230',
  900: '#131922',
  950: '#0d1218',
};

const MyPreset = definePreset(Aura, {
  primitive: {
    surface: surfaceLight,
    content: contentLight,
  },

  semantic: {
    primary: {
      50: '#f0f5fc',
      100: '#dde9f8',
      200: '#bdd1f1',
      300: '#92b1e6',
      400: '#5d86d2',
      500: '#2f5fae',
      600: '#29539b',
      700: '#22427d',
      800: '#1a325f',
      900: '#112343',
      950: '#0a172e',
    },
    error: {
      50: 'oklch(97% 0.02 25)',
      100: 'oklch(94% 0.05 25)',
      200: 'oklch(85% 0.11 25)',
      300: 'oklch(72% 0.17 25)',
      400: 'oklch(61% 0.19 25)',
      500: 'oklch(50% 0.20 25)',
      600: 'oklch(43% 0.19 25)',
      700: 'oklch(36% 0.17 25)',
      800: 'oklch(29% 0.14 25)',
      900: 'oklch(23% 0.11 25)',
      950: 'oklch(17% 0.08 25)',
    },
    warning: {
      50: 'oklch(97% 0.02 75)',
      100: 'oklch(94% 0.05 75)',
      200: 'oklch(85% 0.11 75)',
      300: 'oklch(72% 0.17 75)',
      400: 'oklch(61% 0.19 75)',
      500: 'oklch(50% 0.20 75)',
      600: 'oklch(43% 0.19 75)',
      700: 'oklch(36% 0.17 75)',
      800: 'oklch(29% 0.14 75)',
      900: 'oklch(23% 0.11 75)',
      950: 'oklch(17% 0.08 75)',
    },
    success: {
      50: 'oklch(97% 0.02 145)',
      100: 'oklch(94% 0.05 145)',
      200: 'oklch(85% 0.11 145)',
      300: 'oklch(72% 0.17 145)',
      400: 'oklch(61% 0.19 145)',
      500: 'oklch(50% 0.20 145)',
      600: 'oklch(43% 0.19 145)',
      700: 'oklch(36% 0.17 145)',
      800: 'oklch(29% 0.14 145)',
      900: 'oklch(23% 0.11 145)',
      950: 'oklch(17% 0.08 145)',
    },
    info: {
      50: 'oklch(97% 0.02 235)',
      100: 'oklch(94% 0.05 235)',
      200: 'oklch(85% 0.11 235)',
      300: 'oklch(72% 0.17 235)',
      400: 'oklch(61% 0.19 235)',
      500: 'oklch(50% 0.20 235)',
      600: 'oklch(43% 0.19 235)',
      700: 'oklch(36% 0.17 235)',
      800: 'oklch(29% 0.14 235)',
      900: 'oklch(23% 0.11 235)',
      950: 'oklch(17% 0.08 235)',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.600}',
          inverseColor: '{content.0}',
          hoverColor: '{primary.500}',
          activeColor: '{primary.600}',
        },
        surface: surfaceLight,
        content: contentLight,
        text: {
          color: '{content.0}',
          hoverColor: '{content.50}',
          mutedColor: '{content.400}',
          hoverMutedColor: '{content.300}',
        },
        formField: {
          focusBorderColor: 'none',
          color: '{content.0}',
          background: '{surface.0}',
          borderColor: 'none',
          filledBackground: 'transparent',
          filledHoverBackground: 'transparent',
          filledFocusBackground: 'transparent',
          disabledBackground: '{surface.50}',
          disabledColor: '{content.500}',
          hoverBorderColor: 'none',
          invalidBorderColor: '{error.500}',
          invalidPlaceholderColor: '{content.500}',
          placeholderColor: '{content.500}',
          floatLabelColor: '{content.200}',
          floatLabelFocusColor: '{primary.500}',
          floatLabelInvalidColor: '{red.400}',
          iconColor: '{content.50}',
          shadow: '0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgba(18, 18, 23, 0.05)',
        },
      },
      dark: {
        primary: {
          color: '{primary.500}',
          inverseColor: '{content.0}',
          hoverColor: '{primary.600}',
          activeColor: '{primary.500}',
        },
        surface: surfaceDark,
        content: contentDark,
        text: {
          color: '{content.0}',
          hoverColor: '{content.50}',
          mutedColor: '{content.400}',
          hoverMutedColor: '{content.300}',
        },
        formField: {
          focusBorderColor: 'none',
          color: '{content.0}',
          background: '{surface.0}',
          borderColor: 'none',
          filledBackground: 'transparent',
          filledHoverBackground: '{surface.200}',
          filledFocusBackground: '{surface.100}',
          disabledBackground: '{surface.50}',
          disabledColor: '{content.400}',
          hoverBorderColor: 'none',
          invalidBorderColor: 'none',
          invalidPlaceholderColor: '{content.0}',
          placeholderColor: '{content.400}',
          floatLabelColor: '{content.200}',
          floatLabelFocusColor: '{primary.500}',
          floatLabelInvalidColor: '{red.400}',
          iconColor: '{content.50}',
          shadow: '0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgba(18, 18, 23, 0.05)',
        },
      },
    },
  },

  components: {
    dialog: {
      borderRadius: '1rem',
      header: {
        padding: '1.25rem 1.5rem 1rem',
      },
      title: {
        fontSize: '1.25rem',
        fontWeight: '700',
      },
      content: {
        padding: '0 1.5rem 1.5rem',
      },
      colorScheme: {
        light: {
          root: {
            background: 'color-mix(in srgb, {surface.50} 88%, transparent)',
            borderColor: 'color-mix(in srgb, {content.700} 50%, transparent)',
            color: '{content.0}',
            shadow:
              '0 24px 64px -8px rgba(14, 30, 51, 0.18), 0 2px 16px -2px rgba(14, 30, 51, 0.08)',
          },
        },
        dark: {
          root: {
            background: 'color-mix(in srgb, {surface.50} 88%, transparent)',
            borderColor: 'color-mix(in srgb, {content.700} 60%, transparent)',
            color: '{content.0}',
            shadow:
              '0 24px 64px -8px rgba(0, 0, 0, 0.60), 0 2px 16px -2px rgba(0, 0, 0, 0.40)',
          },
        },
      },
    },
    drawer: {
      header: {
        padding: '1rem 1.25rem',
      },
      title: {
        fontSize: '0.9375rem',
        fontWeight: '600',
      },
      content: {
        padding: '0.5rem 1.25rem 1.25rem',
      },
      footer: {
        padding: '1rem 1.25rem',
      },
      colorScheme: {
        light: {
          root: {
            background: 'rgba(255, 255, 255, 0.92)',
            borderColor: '{surface.200}',
            color: '{content.0}',
            shadow:
              '-20px 0 48px -8px rgba(14, 30, 51, 0.14), -2px 0 8px -2px rgba(14, 30, 51, 0.06)',
          },
        },
        dark: {
          root: {
            background: 'rgba(13, 18, 24, 0.88)',
            borderColor: '{surface.200}',
            color: '{content.0}',
            shadow:
              '-20px 0 48px -8px rgba(0, 0, 0, 0.60), -2px 0 8px -2px rgba(0, 0, 0, 0.40)',
          },
        },
      },
    },
    tabs: {
      tablist: {
        borderWidth: '0 0 1px 0',
        borderColor: '{surface.200}',
        background: 'transparent',
      },
      tab: {
        background: 'transparent',
        hoverBackground: 'transparent',
        activeBackground: 'transparent',
        borderWidth: '0',
        borderColor: 'transparent',
        hoverBorderColor: 'transparent',
        activeBorderColor: 'transparent',
        color: '{content.400}',
        hoverColor: '{content.200}',
        activeColor: '{content.0}',
        padding: '0.875rem 0.25rem',
        fontWeight: '500',
        margin: '0 1.25rem 0 0',
        focus: {
          ring: {
            width: '2px',
            style: 'solid',
            color: '{primary.color}',
            offset: '-2px',
            shadow: 'none',
          },
        },
      },
      tabpanel: {
        background: 'transparent',
        color: '{content.0}',
        padding: '0',
      },
      activeBar: {
        height: '2px',
        bottom: '0px',
        background: '{primary.500}',
      },
      colorScheme: {
        light: {
          activeBar: {
            background: '{primary.600}',
          },
          navButton: {
            background: 'rgba(247, 248, 250, 0.80)',
            color: '{content.400}',
            shadow:
              '0 0 0 1px rgba(216, 221, 227, 0.60), 0 2px 8px rgba(216, 221, 227, 0.40)',
          },
        },
        dark: {
          activeBar: {
            background: '{primary.400}',
          },
          navButton: {
            background: 'rgba(13, 18, 24, 0.80)',
            color: '{content.400}',
            shadow:
              '0 0 0 1px rgba(42, 51, 68, 0.60), 0 2px 8px rgba(42, 51, 68, 0.40)',
          },
        },
      },
    },
    selectbutton: {
      border: {
        radius: '999px',
      },
    },
    select: {
      overlay: {
        borderRadius: '0.75rem',
      },
      colorScheme: {
        light: {
          overlay: {
            background: '{surface.0}',
            borderColor: '{surface.200}',
            color: '{content.0}',
            shadow:
              '0 8px 32px -4px rgba(14,30,51,0.14), 0 1px 6px -1px rgba(14,30,51,0.07)',
          },
          option: {
            color: '{content.0}',
            focusBackground: '{surface.100}',
            focusColor: '{content.0}',
            selectedBackground: '{primary.50}',
            selectedColor: '{primary.700}',
            selectedFocusBackground: '{primary.100}',
            selectedFocusColor: '{primary.700}',
          },
        },
        dark: {
          overlay: {
            background: '{surface.100}',
            borderColor: '{surface.200}',
            color: '{content.0}',
            shadow:
              '0 8px 32px -4px rgba(0,0,0,0.45), 0 1px 6px -1px rgba(0,0,0,0.28)',
          },
          option: {
            color: '{content.0}',
            focusBackground: '{surface.200}',
            focusColor: '{content.0}',
            selectedBackground: '{surface.200}',
            selectedColor: '{content.0}',
            selectedFocusBackground: '{surface.300}',
            selectedFocusColor: '{content.0}',
          },
        },
      },
    },
    checkbox: {
      root: {
        borderColor: '{content.600}',
      },
    },
    datepicker: {
      panel: {
        borderRadius: '0.75rem',
        padding: '0.5rem',
      },
      header: {
        padding: '0.5rem 0.75rem 0.25rem',
      },
      title: {
        fontWeight: '600',
      },
      colorScheme: {
        light: {
          panel: {
            background: '{surface.0}',
            borderColor: '{surface.200}',
            color: '{content.0}',
            shadow:
              '0 8px 32px -4px rgba(14,30,51,0.14), 0 1px 6px -1px rgba(14,30,51,0.07)',
          },
          header: {
            background: '{surface.0}',
            borderColor: '{surface.100}',
            color: '{content.0}',
          },
          selectMonth: {
            color: '{content.0}',
            hoverBackground: '{surface.100}',
            hoverColor: '{content.0}',
          },
          selectYear: {
            color: '{content.0}',
            hoverBackground: '{surface.100}',
            hoverColor: '{content.0}',
          },
          weekDay: {
            color: '{content.400}',
          },
          date: {
            color: '{content.0}',
            hoverColor: '{content.0}',
            hoverBackground: '{surface.100}',
            selectedBackground: '{primary.600}',
            selectedColor: '{content.950}',
            rangeSelectedBackground: '{primary.100}',
            rangeSelectedColor: '{primary.700}',
          },
          today: {
            background: '{surface.100}',
            color: '{primary.600}',
          },
          buttonbar: {
            borderColor: '{surface.100}',
          },
        },
        dark: {
          panel: {
            background: '{surface.100}',
            borderColor: '{surface.200}',
            color: '{content.0}',
            shadow:
              '0 8px 32px -4px rgba(0,0,0,0.45), 0 1px 6px -1px rgba(0,0,0,0.28)',
          },
          header: {
            background: '{surface.100}',
            borderColor: '{surface.200}',
            color: '{content.0}',
          },
          selectMonth: {
            color: '{content.0}',
            hoverBackground: '{surface.200}',
            hoverColor: '{content.0}',
          },
          selectYear: {
            color: '{content.0}',
            hoverBackground: '{surface.200}',
            hoverColor: '{content.0}',
          },
          weekDay: {
            color: '{content.400}',
          },
          date: {
            color: '{content.0}',
            hoverColor: '{content.0}',
            hoverBackground: '{surface.200}',
            selectedBackground: '{primary.500}',
            selectedColor: '{content.950}',
            rangeSelectedBackground: '{primary.900}',
            rangeSelectedColor: '{primary.200}',
          },
          today: {
            background: '{surface.200}',
            color: '{primary.400}',
          },
          buttonbar: {
            borderColor: '{surface.200}',
          },
        },
      },
    },
    button: {
      root: {
        borderRadius: '999px',
        paddingX: '1.125rem',
        paddingY: '0.5625rem',
      },
      colorScheme: {
        light: {
          root: {
            primary: {
              background:
                'linear-gradient(180deg, {primary.400}, {primary.600})',
              hoverBackground:
                'linear-gradient(180deg, {primary.300}, {primary.500})',
              activeBackground:
                'linear-gradient(180deg, {primary.500}, {primary.700})',
              borderColor: 'none',
              hoverBorderColor: 'none',
              activeBorderColor: 'none',
              color: '{content.950}',
              hoverColor: '{content.950}',
              activeColor: '{content.950}',
            },
          },
        },
        dark: {
          root: {
            primary: {
              background:
                'linear-gradient(180deg, {primary.300}, {primary.500})',
              hoverBackground:
                'linear-gradient(180deg, {primary.200}, {primary.400})',
              activeBackground:
                'linear-gradient(180deg, {primary.400}, {primary.600})',
              borderColor: 'transparent',
              hoverBorderColor: 'transparent',
              activeBorderColor: 'transparent',
              color: '{content.0}',
              hoverColor: '{content.0}',
              activeColor: '{content.0}',
            },
          },
        },
      },
    },
  } as ComponentsDesignTokens,
});

export default {
  preset: MyPreset,
  options: {
    prefix: 'w',
    darkModeSelector: '.dark-mode',
    cssLayer: {
      name: 'primevue',
      order: 'theme, base, primevue',
    },
  },
};
