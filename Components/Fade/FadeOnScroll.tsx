import React, { useEffect, useState, useRef } from "react";
import { Animated, View, Dimensions, findNodeHandle, UIManager } from "react-native";

export default function FadeOnScroll({ scrollY, children, threshold = 100 }) {
  const fade = useRef(new Animated.Value(0)).current;
  const [viewTop, setViewTop] = useState<number | null>(null);
  const windowHeight = Dimensions.get("window").height;
  const containerRef = useRef(null);
  const wasVisible = useRef(false);

  const measurePosition = () => {
    const handle = findNodeHandle(containerRef.current);
    if (!handle) return;

    UIManager.measureInWindow(handle, (_x, y) => {
      setViewTop(y);
    });
  };

  // measure on mount
  useEffect(() => {
    measurePosition();
  }, []);

  // measure on scroll
  useEffect(() => {
    measurePosition();
  }, [scrollY]);

  useEffect(() => {
    if (viewTop === null) return;

    const isVisible = viewTop < windowHeight - threshold;

    if (!wasVisible.current && isVisible) {
      wasVisible.current = true;

      Animated.timing(fade, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }
  }, [viewTop]);

  return (
    <View ref={containerRef}>
      <Animated.View style={{ opacity: fade }}>
        {children}
      </Animated.View>
    </View>
  );
}
