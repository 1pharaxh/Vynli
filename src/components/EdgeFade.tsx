import { useColorScheme } from "@/hooks/useColorScheme";
import { LinearGradient, LinearGradientProps } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { StyleProp, ViewProps, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";

type Props = ViewProps & {
  height: number;
  width: number;
  position: "top" | "bottom" | "left" | "right";
  darkOverride?: readonly [string, string, ...string[]];
};
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const EdgeFade = (props: Props) => {
  const { darkOverride, position, height, width, ...rest } = props;
  const { colorScheme } = useColorScheme();

  const positionStyle = useMemo(() => {
    let baseStyle: StyleProp<ViewStyle> = {
      position: "absolute",
      height,
      width,
      zIndex: 100,
    };
    switch (position) {
      case "top":
        baseStyle = { ...baseStyle, top: 0, left: 0, right: 0 };
        return baseStyle;
      case "left":
        baseStyle = { ...baseStyle, bottom: 0, left: -1, borderRadius: 30 };
        return baseStyle;
      case "right":
        baseStyle = { ...baseStyle, bottom: 0, right: -1, borderRadius: 30 };
        return baseStyle;

      default:
        baseStyle = { ...baseStyle, bottom: 0, left: 0, right: 0 };
        return baseStyle;
    }
  }, [position, height, width]);
  const colors = useMemo(() => {
    if (colorScheme === "dark") {
      switch (position) {
        case "top":
          return ["black", "rgba(0,0,0,0.5)", "transparent"] as const;
        case "left":
          return darkOverride
            ? darkOverride
            : ([
                // #3a3a3c -> transparent
                "rgba(58,58,60,1)",
                "rgba(58,58,60,0.6)",
                "rgba(58,58,60,0.3)",
                "rgba(58,58,60,0)",
              ] as const);
        case "right":
          return darkOverride
            ? darkOverride
            : ([
                "rgba(58,58,60,0)",
                "rgba(58,58,60,0.3)",
                "rgba(58,58,60,0.6)",
                "rgba(58,58,60,1)",
              ] as const);
        default:
          return ["transparent", "rgba(0,0,0,0.5)", "black"] as const;
      }
    } else {
      switch (position) {
        case "top":
          return ["#f9f9f9", "rgba(200,200,200,0.3)", "transparent"] as const;
        case "left":
          return ["#f2f2f7", "rgba(246,246,249,0)"] as const;
        case "right":
          return ["rgba(246,246,249,0)", "#f2f2f7"] as const;
        default:
          return ["transparent", "rgba(200,200,200,0.3)", "#f9f9f9"] as const;
      }
    }
  }, [position, colorScheme]);
  return (
    <AnimatedLinearGradient
      colors={colors}
      style={[positionStyle, rest.style]}
      pointerEvents="none"
      start={["right", "left"].includes(position) ? { x: 0, y: 0 } : undefined}
      end={["right", "left"].includes(position) ? { x: 1, y: 0 } : undefined}
    />
  );
};

export default EdgeFade;
