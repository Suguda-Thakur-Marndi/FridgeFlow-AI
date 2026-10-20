import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { CulinaryColors, Typography, Radii, Spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');
const RETICLE_SIZE = Math.min(width - 64, 300);

export const ViewfinderReticle: React.FC = () => {
  const laserAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, {
          toValue: RETICLE_SIZE - 20,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(laserAnim, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [laserAnim]);

  const third = RETICLE_SIZE / 3;
  const twoThirds = (RETICLE_SIZE / 3) * 2;

  return (
    <View style={styles.container}>
      <View style={[styles.reticleBox, { width: RETICLE_SIZE, height: RETICLE_SIZE }]}>
        {/* SVG Alignment Grid & Corner Brackets */}
        <Svg width={RETICLE_SIZE} height={RETICLE_SIZE} style={StyleSheet.absoluteFill}>
          {/* 3x3 Dashed Alignment Grid */}
          <Line
            x1={third}
            y1={0}
            x2={third}
            y2={RETICLE_SIZE}
            stroke="#99d2b5"
            strokeWidth={1}
            strokeDasharray="4, 4"
            strokeOpacity={0.3}
          />
          <Line
            x1={twoThirds}
            y1={0}
            x2={twoThirds}
            y2={RETICLE_SIZE}
            stroke="#99d2b5"
            strokeWidth={1}
            strokeDasharray="4, 4"
            strokeOpacity={0.3}
          />
          <Line
            x1={0}
            y1={third}
            x2={RETICLE_SIZE}
            y2={third}
            stroke="#99d2b5"
            strokeWidth={1}
            strokeDasharray="4, 4"
            strokeOpacity={0.3}
          />
          <Line
            x1={0}
            y1={twoThirds}
            x2={RETICLE_SIZE}
            y2={twoThirds}
            stroke="#99d2b5"
            strokeWidth={1}
            strokeDasharray="4, 4"
            strokeOpacity={0.3}
          />

          {/* Top-Left Bracket */}
          <Path
            d={`M 6 36 L 6 14 C 6 9.58 9.58 6 14 6 L 36 6`}
            stroke="#99d3b6"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
          {/* Top-Right Bracket */}
          <Path
            d={`M ${RETICLE_SIZE - 36} 6 L ${RETICLE_SIZE - 14} 6 C ${RETICLE_SIZE - 9.58} 6 ${RETICLE_SIZE - 6} 9.58 ${RETICLE_SIZE - 6} 14 L ${RETICLE_SIZE - 6} 36`}
            stroke="#99d3b6"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
          {/* Bottom-Left Bracket */}
          <Path
            d={`M 6 ${RETICLE_SIZE - 36} L 6 ${RETICLE_SIZE - 14} C 6 ${RETICLE_SIZE - 9.58} 9.58 ${RETICLE_SIZE - 6} 14 ${RETICLE_SIZE - 6} L 36 ${RETICLE_SIZE - 6}`}
            stroke="#99d3b6"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
          {/* Bottom-Right Bracket */}
          <Path
            d={`M ${RETICLE_SIZE - 36} ${RETICLE_SIZE - 6} L ${RETICLE_SIZE - 14} ${RETICLE_SIZE - 6} C ${RETICLE_SIZE - 9.58} ${RETICLE_SIZE - 6} ${RETICLE_SIZE - 6} ${RETICLE_SIZE - 9.58} ${RETICLE_SIZE - 6} ${RETICLE_SIZE - 14} L ${RETICLE_SIZE - 6} ${RETICLE_SIZE - 36}`}
            stroke="#99d3b6"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        </Svg>

        {/* Animated Laser Sweep Beam */}
        <Animated.View
          style={[
            styles.laserBeam,
            {
              transform: [{ translateY: laserAnim }],
            },
          ]}
        />

        {/* Floating Detection Anchors (Moment of Delight) */}
        <View style={styles.floatingAnchorTopLeft}>
          <View style={styles.pulseDot} />
          <Text style={styles.anchorText}>Red Bell Pepper</Text>
        </View>

        <View style={styles.floatingAnchorBottomRight}>
          <View style={[styles.pulseDot, { backgroundColor: CulinaryColors.secondaryFixed }]} />
          <Text style={styles.anchorText}>Organic Oat Milk</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.sm,
  },
  reticleBox: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  laserBeam: {
    position: 'absolute',
    top: 10,
    left: 8,
    right: 8,
    height: 4,
    backgroundColor: '#99d3b6',
    borderRadius: Radii.full,
    shadowColor: '#99d3b6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  floatingAnchorTopLeft: {
    position: 'absolute',
    top: 24,
    left: 20,
    backgroundColor: 'rgba(41, 51, 44, 0.88)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  floatingAnchorBottomRight: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: 'rgba(41, 51, 44, 0.88)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#99d3b6',
    marginRight: 6,
  },
  anchorText: {
    ...Typography.labelSm,
    color: '#ffffff',
  },
});
