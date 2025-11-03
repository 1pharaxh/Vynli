import "../../global.css";

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { CachedPhotosProvider } from "@/providers/CachedPhotosProvider";
import { GalleryUISettingsProvider } from "@/providers/GalleryUISettingsProvider";
import { MediaLibraryPhotosProvider } from "@/providers/MediaLibraryPhotosProvider";
import { ScreenDimensionsProvider } from "@/providers/ScreenDimensionsProvider";
import "@/utils/logger";
import { FocusRefProvider } from "@/providers/FocusRefProvider";

import { ThemeProvider } from "@react-navigation/native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { NAV_THEME } from "@/lib/theme";
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

/**
 * We call `SplashScreen.hide` in the `index.tsx` file once the app layout is ready.
 */
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 200,
  fade: true,
});

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <FocusRefProvider>
      <ScreenDimensionsProvider>
        <GalleryUISettingsProvider>
          <MediaLibraryPhotosProvider>
            <CachedPhotosProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
                  <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
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
