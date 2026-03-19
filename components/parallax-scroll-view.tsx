import {
  useEffect,
  useState,
  type PropsWithChildren,
  type ReactElement,
} from "react";
import { StyleSheet, useColorScheme } from "react-native";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from "react-native-reanimated";

import { ThemedView } from "@/components/themed-view";

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  backgroundContent?: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
  headerHeight: number;
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
  headerHeight: hH,
  backgroundContent,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    console.log(hH);
    setHeaderHeight(hH);
  }, [hH]);
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [2, 1, 1],
          ),
        },
      ],
    };
  });

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {backgroundContent && (
          <Animated.View
            style={[
              { height: headerHeight, overflow: "hidden" },
              {
                backgroundColor: headerBackgroundColor[colorScheme],
                position: "absolute",
              },
              headerAnimatedStyle,
            ]}
          >
            {backgroundContent}
          </Animated.View>
        )}
        <Animated.View
          style={[
            { height: headerHeight, overflow: "hidden" },
            { backgroundColor: headerBackgroundColor[colorScheme] },
            headerAnimatedStyle,
          ]}
        >
          {headerImage}
        </Animated.View>
        <ThemedView style={[styles.content, styles.footerStyle]}>
          {children}
        </ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 250,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    padding: 0,
    gap: 16,
    overflow: "hidden",
  },
  footerStyle: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    marginTop: -30,
    shadowOpacity: 0.1,
    elevation: 10,
    paddingBottom: 0,
  },
});
