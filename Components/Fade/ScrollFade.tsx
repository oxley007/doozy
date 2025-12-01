import React, { useRef, useState, useEffect } from "react";
import { Animated, ViewStyle, StyleProp, LayoutChangeEvent, Dimensions } from "react-native";

interface ScrollFadeProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  threshold?: number;
  duration?: number;
  scrollY: number;
}

export default function ScrollFade({
  children,
  style,
  threshold = 100,
  duration = 200,
  scrollY,
}: ScrollFadeProps) {
  const fade = useRef(new Animated.Value(0)).current;
  const [layoutY, setLayoutY] = useState<number | null>(null);
  const [hasFaded, setHasFaded] = useState(false);

  const windowHeight = Dimensions.get("window").height;

  const handleLayout = (e: LayoutChangeEvent) => {
    setLayoutY(e.nativeEvent.layout.y);
  };

  useEffect(() => {
    if (layoutY === null || hasFaded) return;

    // If top of element < bottom of viewport + threshold
    if (layoutY < scrollY + windowHeight - threshold) {
      Animated.timing(fade, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
      setHasFaded(true);
    }
  }, [scrollY, layoutY]);

  return (
    <Animated.View style={[style, { opacity: fade }]} onLayout={handleLayout}>
      {children}
    </Animated.View>
  );
}
