import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { CachedPhotosProvider } from "@/providers/CachedPhotosProvider";
import { GalleryUISettingsProvider } from "@/providers/GalleryUISettingsProvider";
import { MediaLibraryPhotosProvider } from "@/providers/MediaLibraryPhotosProvider";
import { ScreenDimensionsProvider } from "@/providers/ScreenDimensionsProvider";
import "@/utils/logger";
import { FocusRefProvider } from "@/providers/FocusRefProvider";
import "../../global.css";

import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { GestureHandlerRootView } from "react-native-gesture-handler";

/**
 * We call `SplashScreen.hide` in the `index.tsx` file once the app layout is ready.
 */
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 200,
  fade: true,
});

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
};

export default function RootLayout() {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <FocusRefProvider>
      <ScreenDimensionsProvider>
        <GalleryUISettingsProvider>
          <MediaLibraryPhotosProvider>
            <CachedPhotosProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <ThemeProvider
                  value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}
                >
                  <Stack screenOptions={{ headerShown: false }} />
                </ThemeProvider>
              </GestureHandlerRootView>
            </CachedPhotosProvider>
          </MediaLibraryPhotosProvider>
        </GalleryUISettingsProvider>
      </ScreenDimensionsProvider>
    </FocusRefProvider>
  );
}
