import React, { useEffect, useRef, useState } from "react";
import { Animated, View, Dimensions } from "react-native";

export default function FadeOnScrollAndMount({
  scrollY,
  children,
  threshold = 100,
  duration = 600,
}: {
  scrollY: number;
  children: React.ReactNode;
  threshold?: number;
  duration?: number;
}) {
  const fade = useRef(new Animated.Value(0)).current;
  const [layoutY, setLayoutY] = useState<number | null>(null);
  const windowHeight = Dimensions.get("window").height;
  const [hasFaded, setHasFaded] = useState(false);

  const fadeIn = () => {
    if (!hasFaded) {
      Animated.timing(fade, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
      setHasFaded(true);
    }
  };

  // Trigger fade shortly after mount if already in view
  useEffect(() => {
    if (layoutY !== null && !hasFaded) {
      const isInitiallyVisible = layoutY < windowHeight;
      if (isInitiallyVisible) {
        // Delay a tiny bit so animation actually plays
        const timeout = setTimeout(() => fadeIn(), 50);
        return () => clearTimeout(timeout);
      }
    }
  }, [layoutY]);

  // Fade on scroll
  useEffect(() => {
    if (layoutY === null || hasFaded) return;

    const isVisible = scrollY + windowHeight - threshold > layoutY;
    if (isVisible) fadeIn();
  }, [scrollY, layoutY]);

  return (
    <View
      onLayout={(e) => setLayoutY(e.nativeEvent.layout.y)}
      style={{ overflow: "hidden" }} // optional: hides any weird flashes
    >
      <Animated.View style={{ opacity: fade }}>{children}</Animated.View>
    </View>
  );
}
