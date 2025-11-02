import { Image as ExpoImage } from "expo-image";
import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { ImageViewProps } from "./types";
import { useColorScheme } from "@/hooks/useColorScheme";
const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export const ImageComponent = memo(function ExpoImageComponent({
  uri,
  itemSize,
}: ImageViewProps) {
  const { colorScheme } = useColorScheme();

  return (
    <ExpoImage
      source={{ uri }}
      decodeFormat="rgb"
      // Disable caching to have reproducible results
      cachePolicy="memory-disk"
      recyclingKey={uri}
      placeholder={{ blurhash }}
      transition={1000}
      style={[
        {
          borderRadius: 25,
          width: itemSize,
          height: itemSize,
          backgroundColor: colorScheme === "dark" ? "#000" : "#d1d5db",
          flex: 1,
        },
      ]}
    />
  );
});
