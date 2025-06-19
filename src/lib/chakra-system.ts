import { createSystem, defaultConfig } from "@chakra-ui/react";

// Create a minimal Chakra system that doesn't interfere with existing Tailwind styles
const customSystem = createSystem({
  ...defaultConfig,
  // Disable Chakra's CSS reset to preserve existing styles
  cssVarsRoot: ":where([data-theme])",
  // Keep global styles minimal
  globalCss: {
    // Only apply minimal theme styles
    "[data-theme]": {
      colorScheme: "light dark",
    },
  },
});

export default customSystem;
