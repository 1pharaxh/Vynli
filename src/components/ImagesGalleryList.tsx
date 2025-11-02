import { IS_WIDE_SCREEN } from "@/config/constants";
import { useCachedPhotos, Cache } from "@/providers/CachedPhotosProvider";
import { useGalleryUISettings } from "@/providers/GalleryUISettingsProvider";
import { useMediaLibraryPhotos } from "@/providers/MediaLibraryPhotosProvider";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions as d } from "@/providers/ScreenDimensionsProvider";
import { BlurView } from "expo-blur";
import { styled } from "nativewind";

const StyledBlurView = styled(BlurView, { className: "style" });

import {
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { ImageComponent } from "./image/ImageComponent";
import { NoPhotosMessage } from "./NoPhotosMessage";
import { EmptyGalleryList } from "./EmptyGalleryList";
import { Link, SplashScreen } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { getHandle, useFocusRefs } from "@/providers/FocusRefProvider";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  EntryAnimationsValues,
  Extrapolation,
  FadeIn,
  FadeOut,
  interpolate,
  LinearTransition,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";
import EdgeFade from "./EdgeFade";
import { Image } from "expo-image";
import { useColorScheme } from "@/hooks/useColorScheme";
import { CachedPhotoType } from "@/providers/CachedPhotosProvider/cache-service";
import { IconButton } from "./IconButton";

const { width, height } = Dimensions.get("screen");
const layoutMap: Record<
  number,
  { x: number; y: number; width: number; height: number; depth: number }
> = {
  0: { x: 0.05, y: 0.2, width: 0.16, height: 0.16, depth: 4 },
  1: { x: 0.3, y: 0.13, width: 0.3, height: 0.13, depth: 1 },
  2: { x: 0.6, y: 0.25, width: 0.14, height: 0.18, depth: 2 },
  3: { x: 0.85, y: 0.1, width: 0.2, height: 0.28, depth: 5 },
  4: { x: 0.9, y: 0.35, width: 0.16, height: 0.16, depth: 1 },
  5: { x: 0.72, y: 0.55, width: 0.18, height: 0.16, depth: 6 },
  6: { x: -0.05, y: 0.38, width: 0.28, height: 0.12, depth: 12 },
  7: { x: 0.02, y: 0.55, width: 0.25, height: 0.25, depth: 1 },
  8: { x: 0.25, y: 0.73, width: 0.16, height: 0.18, depth: 32 },
  9: { x: 0.9, y: 0.7, width: 0.15, height: 0.16, depth: 21 },
  10: { x: 0.4, y: 0.6, width: 0.2, height: 0.18, depth: 26 },
  11: { x: 0.75, y: 0.87, width: 0.2, height: 0.18, depth: 18 },
};
const headerHeight = height / 1.8;

/**
 * Helper definitions - images gallery list props
 */
export type ImagesGalleryListProps = {
  dimensions: d;
  numberOfColumns: number;
  galleryGap: number;
};

/**
 * Images list component
 *
 * @param dimensions - The target screen dimensions within which to display the list.
 */
export const ImagesGalleryList = ({
  dimensions,
  numberOfColumns,
  galleryGap,
}: ImagesGalleryListProps) => {
  // Obtain data from providers
  const focusRefs = useFocusRefs();
  const settingsButtonHandle = getHandle(focusRefs["settings"]);
  const [showTopEdgeFade, setshowTopEdgeFade] = useState(false);

  const { cachedPhotos, cachedPhotosLoadingState } = useCachedPhotos();
  const { mediaLibraryPhotos, mediaLibraryLoadingState } =
    useMediaLibraryPhotos();
  const { offscreenDrawDistanceWindowSize } = useGalleryUISettings();

  /**
   * Helper functions - properties calculation
   */
  const calculateSingleImageSize = useCallback(() => {
    const effectiveWidth =
      dimensions.width - (numberOfColumns + 1) * galleryGap;
    return IS_WIDE_SCREEN
      ? (effectiveWidth - dimensions.width * 0.1) / numberOfColumns
      : effectiveWidth / numberOfColumns;
  }, [dimensions, numberOfColumns, galleryGap]);

  const calculateOffscreenDrawDistanceFromWindowSize = useCallback(
    () => Math.round(dimensions.height * offscreenDrawDistanceWindowSize),
    [dimensions, offscreenDrawDistanceWindowSize],
  );

  /**
   * List properties - a dynamically updated values based on gallery settings and screen dimensions
   */
  const properties = useMemo(
    () => ({
      singleImageSize: calculateSingleImageSize(),
      listOffscreenDrawDistance: calculateOffscreenDrawDistanceFromWindowSize(),
    }),
    [calculateSingleImageSize, calculateOffscreenDrawDistanceFromWindowSize],
  );

  const Image = ImageComponent;

  // Determine if we should show the "No Photos" message
  const shouldShowNoPhotosMessage =
    mediaLibraryLoadingState === "COMPLETED" && mediaLibraryPhotos.length === 0;

  // Determine if we should show loading skeletons
  const shouldShowLoadingSkeletons =
    mediaLibraryLoadingState !== "COMPLETED" ||
    (mediaLibraryPhotos.length > 0 && cachedPhotosLoadingState !== "COMPLETED");

  /**
   * Helper components - empty list placeholder
   */
  const ListEmptyComponent = useCallback(() => {
    if (shouldShowNoPhotosMessage) {
      return <NoPhotosMessage />;
    }

    if (shouldShowLoadingSkeletons) {
      return (
        <EmptyGalleryList
          itemSize={properties.singleImageSize}
          numberOfColumns={numberOfColumns}
          numberOfItems={100}
        />
      );
    }

    return null;
  }, [
    shouldShowNoPhotosMessage,
    shouldShowLoadingSkeletons,
    properties,
    numberOfColumns,
  ]);

  /**
   * Helper components - list render items
   */
  const renderItem = useCallback(
    ({
      item,
      index,
    }: {
      item: (typeof cachedPhotos)[number];
      index: number;
    }) => {
      return (
        <Image
          uri={item.cachedPhotoUri}
          itemSize={properties.singleImageSize}
        />
      );
    },
    [properties, settingsButtonHandle, Image, numberOfColumns],
  );

  const ItemSeparator = useCallback(() => {
    return <View style={{ height: galleryGap }} />;
  }, [galleryGap]);

  const keyExtractor = useCallback(
    (item: (typeof cachedPhotos)[number]) => item.originalPhotoUri,
    [],
  );

  const handleLoad = useCallback(() => {
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 100);
  }, []);
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollYOffset.set(e.nativeEvent.contentOffset.y);
      if (e.nativeEvent.contentOffset.y > headerHeight - 100) {
        setshowTopEdgeFade(true);
      } else {
        setshowTopEdgeFade(false);
      }
    },
    [],
  );

  const [selectedImage, setSelectedImage] = useState<
    | {
        x: number;
        y: number;
        depth: number;
        width: number;
        height: number;
        image: CachedPhotoType;
      }
    | undefined
  >(undefined);

  const imagesArr = useMemo(() => {
    if (cachedPhotosLoadingState !== "COMPLETED") return [];
    return cachedPhotos
      .filter((e) => e.isFavorite)
      .map((e, idx) => {
        const layout = layoutMap[idx % Object.keys(layoutMap).length];
        return {
          x: layout.x * width,
          y: layout.y * headerHeight,
          depth: layout.depth,
          width: layout.width * width,
          height: layout.height * headerHeight,
          image: e,
        };
      });
  }, [cachedPhotos, layoutMap, width, headerHeight, cachedPhotosLoadingState]);

  const gestureHandler = Gesture.Tap().onEnd((e) => {
    const tapX = e.x;
    const tapY = e.y;
    if (tapY > headerHeight * 0.9 && tapX < width * 0.5) return;

    let closestImage = null;
    let minDistance = Infinity;

    for (const img of imagesArr) {
      const centerX = img.x + img.width / 2;
      const centerY = img.y + img.height / 2;

      const dx = centerX - tapX;
      const dy = centerY - tapY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance) {
        minDistance = distance;
        closestImage = img;
      }
    }

    if (closestImage) {
      runOnJS(setSelectedImage)(closestImage);
    }
  });
  const scrollYOffset = useSharedValue<number>(0);
  const { colorScheme } = useColorScheme();

  const HeaderAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollYOffset.value,
      [0, headerHeight],
      [0, -headerHeight],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ translateY }],
    };
  }, []);

  const textEntering = (_targetValues: EntryAnimationsValues) => {
    "worklet";
    const animations = {
      opacity: withDelay(800, withTiming(1, { duration: 880 })),
      transform: [
        { translateY: withDelay(800, withTiming(0, { duration: 880 })) },
      ],
    };
    const initialValues = {
      opacity: 0,
      transform: [{ translateY: 0 }],
    };
    return {
      initialValues,
      animations,
    };
  };

  /**
   * Main list structure
   *
   * We wrap the list inside an additional View to enable styling the list
   */
  return (
    <View className="flex-1">
      <Animated.View
        layout={LinearTransition}
        entering={FadeIn.duration(1000)}
        exiting={FadeOut.duration(1000)}
        style={[{ flex: 1, position: "relative" }]}
      >
        {showTopEdgeFade ? (
          <EdgeFade position="top" width={width} height={100} />
        ) : (
          <></>
        )}
        <GestureDetector gesture={gestureHandler}>
          <Animated.View
            className=""
            style={[
              {
                height: headerHeight,
                position: "absolute",
                width: width,
                top: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                overflow: "hidden",
              },
              HeaderAnimatedStyle,
            ]}
          >
            <View className="relative flex-1 w-full flex items-center justify-center">
              <EdgeFade height={200} width={width} position="top" />
              <EdgeFade
                height={200}
                width={width}
                style={{ bottom: -2, borderRadius: 0 }}
                position="bottom"
              />
              <EdgeFade
                height={headerHeight}
                width={50}
                darkOverride={["black", "rgba(0,0,0,0.5)", "transparent"]}
                position="left"
                style={{ borderRadius: 0 }}
              />
              <EdgeFade
                height={headerHeight}
                width={50}
                darkOverride={["transparent", "rgba(0,0,0,0.5)", "black"]}
                style={{ borderRadius: 0 }}
                position="right"
              />

              <Animated.View
                className="z-50 text-center space-y-4 items-center flex flex-col"
                entering={textEntering}
              >
                <Text className="text-base text-black/70 dark:text-white text-center">
                  Recent
                </Text>

                <Text className="text-5xl md:text-7xl text-black/70 dark:text-white font-calendas italic text-center">
                  favorites.
                </Text>
              </Animated.View>

              {imagesArr.map((props, idx) => (
                <GalleryImage
                  key={idx}
                  {...props}
                  colorScheme={colorScheme}
                  scrollYOffset={scrollYOffset}
                />
              ))}
            </View>
          </Animated.View>
        </GestureDetector>
        <FlashList
          bounces={false}
          key={mediaLibraryLoadingState} // Temporary solution to prevent empty list crash
          data={cachedPhotos}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          onScroll={handleScroll}
          numColumns={numberOfColumns}
          contentContainerStyle={{
            paddingLeft: galleryGap,
            paddingTop: headerHeight - 2,
            paddingBottom: 50,
            ...(IS_WIDE_SCREEN && {
              paddingLeft: galleryGap + dimensions.width * 0.05,
              paddingRight: dimensions.width * 0.05,
            }),
          }}
          /**
           * @see https://shopify.github.io/flash-list/docs/usage#drawdistance
           */
          drawDistance={properties.listOffscreenDrawDistance}
          ItemSeparatorComponent={ItemSeparator}
          ListEmptyComponent={ListEmptyComponent}
          onLoad={handleLoad}
          showsVerticalScrollIndicator={false}
          CellRendererComponent={(props) => {
            const { style, children, ...rest } = props;
            return (
              <View style={style} {...rest}>
                {children}
              </View>
            );
          }}
        />

        <StyledBlurView
          className="h-10 w-28 rounded-full absolute top-16 left-5 overflow-hidden flex items-center justify-center z-9999"
          intensity={60}
          tint={colorScheme === "light" ? "dark" : "light"}
        >
          <Text className="text-base text-center text-white">Your photos</Text>
        </StyledBlurView>

        <StyledBlurView
          className="h-10 w-auto rounded-full absolute top-16 right-5 overflow-hidden flex items-end justify-center z-9999 px-2"
          intensity={60}
          tint={colorScheme === "light" ? "dark" : "light"}
        >
          <View className="flex flex-row items-center justify-center gap-2">
            <Text className="text-base text-center text-white">
              {`${cachedPhotos.length} items`}
            </Text>
            {Cache.isLoading(cachedPhotosLoadingState) && ( // Simplified conditional rendering
              <ActivityIndicator size={"small"} color={"#fff"} />
            )}
          </View>
        </StyledBlurView>

        <StyledBlurView
          className="h-10 w-10 rounded-full absolute top-16 right-40 overflow-hidden flex items-center justify-center z-9999"
          intensity={60}
          tint={colorScheme === "light" ? "dark" : "light"}
        >
          <Link href="/settings" asChild>
            <IconButton
              iconSource={require("@/assets/images/settings-icon.png")}
              ref={focusRefs["settings"]}
            />
          </Link>
        </StyledBlurView>

        <EdgeFade position="bottom" width={width} height={100} />
      </Animated.View>
    </View>
  );
};

const getRandomVector = (x: number, y: number, depth: number) => {
  "worklet";
  const seedX = Math.sin(x * 0.134 + y * 0.345 + depth * 0.678) * 10000;
  const seedY = Math.sin(x * 0.984 + y * 0.123 + depth * 0.456) * 10000;

  // Values between -1 and 1, scaled for movement range
  const randomX = ((seedX - Math.floor(seedX)) * 2 - 1) * 5; // tweak 1.5 for spread
  const randomY = ((seedY - Math.floor(seedY)) * 2 - 1) * 5;

  return { randomX, randomY };
};

const useBreathing = (x: number, y: number, depth: number) => {
  const breath = useSharedValue(0);

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(Math.random() * 0.15 * 50, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true, // reverse
    );
  }, []);

  return breath;
};
function GalleryImage({
  x,
  y,
  width,
  height,
  depth,
  image,
  scrollYOffset,
  colorScheme,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  image: CachedPhotoType;
  scrollYOffset: SharedValue<number>;
  colorScheme: "dark" | "light";
}) {
  const breath = useBreathing(x, y, depth);

  const animatedStyle = useAnimatedStyle(() => {
    const { randomX, randomY } = getRandomVector(x, y, depth);

    const scrollFactor = interpolate(
      scrollYOffset.value,
      [0, headerHeight],
      [0, 50],
      Extrapolation.CLAMP,
    );

    return {
      position: "absolute",
      top: y,
      left: x,
      width: width,
      height: height,
      borderRadius: "12px",

      transform: [
        {
          translateX: withSpring(
            scrollFactor * randomX * depth + breath.value,
            {
              damping: 10 + Math.abs(randomX) * depth * 5,
            },
          ),
        },
        {
          translateY: withSpring(
            scrollFactor * randomY * depth + breath.value,
            {
              damping: 10 + Math.abs(randomY) * depth * 5,
            },
          ),
        },
      ],
    };
  });
  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

  return (
    <Animated.View
      style={[animatedStyle]}
      className="rounded-xl overflow-hidden"
    >
      <Image
        style={{
          backgroundColor: colorScheme === "dark" ? "#000" : "#d1d5db",
          flex: 1,
        }}
        source={image.cachedPhotoUri}
        contentFit="cover"
        placeholder={blurhash}
        transition={1000}
      />
    </Animated.View>
  );
}
