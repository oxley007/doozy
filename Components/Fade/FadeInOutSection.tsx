// FadeInOutSection.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ViewStyle, Easing, StyleProp } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

interface FadeInOutSectionProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  easing?: (value: number) => number;
  visible?: boolean;
}

export default function FadeInOutSection({
  children,
  delay = 0,
  duration = 500,
  style,
  easing = Easing.out(Easing.cubic),
  visible = true,
}: FadeInOutSectionProps) {
  const isFocused = useIsFocused();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  // Local state to control mounting
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (!isFocused) return;

    if (visible) {
      // Mount first, then fade in
      setMounted(true);
      opacity.setValue(0);
      translateY.setValue(20);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          delay,
          easing,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          delay,
          easing,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Fade out, then unmount
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration,
          easing,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 20,
          duration,
          easing,
          useNativeDriver: true,
        }),
      ]).start(() => setMounted(false)); // unmount after fade-out
    }
  }, [isFocused, visible, delay, duration, easing]);

  if (!mounted) return null;

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}
