// FadeInOnScroll.tsx
import React, { useEffect, useState, useRef } from "react";
import { View, Animated, Dimensions } from "react-native";

export default function createFadeInOnScroll(scrollY: Animated.Value) {
  return function FadeInOnScroll({ children, threshold = 100, duration = 600 }) {
    const fade = useRef(new Animated.Value(0)).current;
    const [layoutY, setLayoutY] = useState<number | null>(null);
    const windowHeight = Dimensions.get("window").height;
    const [hasFaded, setHasFaded] = useState(false);

    useEffect(() => {
      if (layoutY === null) return;

      const listenerId = scrollY.addListener(({ value }) => {
        const isVisible = value + windowHeight - threshold > layoutY;

        if (isVisible && !hasFaded) {
          Animated.timing(fade, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }).start(() => setHasFaded(true));
        }
      });

      return () => scrollY.removeListener(listenerId);
    }, [layoutY, hasFaded]);

    return (
      <View
        onLayout={(e) => {
          const node = e.target;
          node.measure((x, y, width, height, pageX, pageY) => {
            setLayoutY(pageY);
          });
        }}
      >
        <Animated.View style={{ opacity: fade }}>
          {children}
        </Animated.View>
      </View>
    );
  };
}
