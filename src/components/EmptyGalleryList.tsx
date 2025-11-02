import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { PlaceholderProps } from "./placeholder/types";
import { PlaceholderSkeleton } from "./placeholder/PlaceholderSkeleton";

type EmptyGalleryListProps = {
  itemSize: number;
  numberOfColumns: number;
  numberOfItems: number;
  PlaceholderComponent?: React.ComponentType<PlaceholderProps>;
};

export const EmptyGalleryList = ({
  itemSize,
  numberOfColumns,
  PlaceholderComponent = PlaceholderSkeleton,
  numberOfItems,
}: EmptyGalleryListProps) => {
  const skeletons = useMemo(
    () =>
      Array.from({ length: numberOfItems }, (_, index) => (
        <PlaceholderComponent
          key={index}
          size={itemSize}
          index={
            (index % numberOfColumns) + 2 * Math.floor(index / numberOfColumns)
          }
        />
      )),
    [numberOfColumns, PlaceholderComponent, itemSize, numberOfItems],
  );

  return <View style={styles.container}>{skeletons}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 1,
  },
});
