import { colors } from "@/config/colors";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

type LoaderProps = {
  size?: number;
  color?: string;
};

export const Loader = ({ size = 40, color = colors.white }: LoaderProps) => {
  return (
    <View style={styles.container} testID="loader">
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

export const LoaderPlaceholder = ({ size = 40 }: Pick<LoaderProps, "size">) => {
  return <View style={[styles.container, { width: size, height: size }]} />;
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
