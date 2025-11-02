import { ImagesGalleryContainer } from "@/components/ImagesGalleryContainer";
import { ImagesGalleryList } from "@/components/ImagesGalleryList";
import { useGalleryUISettings } from "@/providers/GalleryUISettingsProvider";
import * as Screen from "@/providers/ScreenDimensionsProvider";
import React from "react";

export default function PhotosGalleryLayout() {
  const { dimensions, displayMode } = Screen.useScreenDimensions();
  const { numberOfColumns, galleryGap } = useGalleryUISettings();

  // For mobile devices, we want to change UI a little bit after rotation of the screen
  const rotatedDimensions = Screen.rotate(dimensions);

  const dimensionsPortait =
    displayMode === "PORTRAIT" ? dimensions : rotatedDimensions;
  const dimensionsLandscape =
    displayMode === "PORTRAIT" ? rotatedDimensions : dimensions;

  // Note that we use different number of columns in landscape mode
  return (
    <ImagesGalleryContainer title="Your photos">
      {displayMode === "PORTRAIT" && (
        <ImagesGalleryList
          dimensions={dimensionsPortait}
          numberOfColumns={numberOfColumns}
          galleryGap={galleryGap}
        />
      )}
      {displayMode === "LANDSCAPE" && (
        <ImagesGalleryList
          dimensions={dimensionsLandscape}
          numberOfColumns={Math.floor(
            (numberOfColumns * dimensions.width) / dimensions.height,
          )}
          galleryGap={galleryGap}
        />
      )}
    </ImagesGalleryContainer>
  );
}
