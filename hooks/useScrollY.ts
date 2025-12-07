import { useRef, useEffect, useState } from "react";
import { NativeSyntheticEvent, NativeScrollEvent } from "react-native";

export function useScrollY() {
  const [scrollY, setScrollY] = useState(0);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollY(event.nativeEvent.contentOffset.y);
  };

  return { scrollY, onScroll };
}
