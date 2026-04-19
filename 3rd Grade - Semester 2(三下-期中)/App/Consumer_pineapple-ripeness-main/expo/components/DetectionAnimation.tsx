import React, { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PineappleIcon } from '@/components/PineappleIcon';
import { PineappleTriviaCard } from '@/components/PineappleTriviaCard';
import { useLanguage } from '@/contexts/LanguageContext';

const PARTICLE_COUNT = 9;

type LedPhase = 'ready' | 'sensing' | 'analysing';

interface DetectionAnimationProps {
  countdown: number;
  factText: string;
  progressText: string;
  isCountdownRunning?: boolean;
}

const particleOffsets = [-42, -30, -18, -8, 0, 10, 20, 32, 44] as const;

function DetectionAnimationComponent({ countdown, factText, progressText, isCountdownRunning = false }: DetectionAnimationProps) {
  const { t } = useLanguage();
  const ringScale = useRef(new Animated.Value(0.9)).current;
  const ringOpacity = useRef(new Animated.Value(0.4)).current;
  const sensorGlow = useRef(new Animated.Value(0.35)).current;
  const factOpacity = useRef(new Animated.Value(0)).current;
  const ledPrimary = useRef(new Animated.Value(0.6)).current;
  const ledSecondary = useRef(new Animated.Value(0.6)).current;
  const particles = useMemo(
    () => Array.from({ length: PARTICLE_COUNT }).map(() => ({
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.8),
    })),
    []
  );

  const phase: LedPhase = countdown >= 8 ? 'ready' : countdown >= 4 ? 'sensing' : 'analysing';

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ringScale, {
            toValue: 1.18,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ringScale, {
            toValue: 0.9,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(ringOpacity, {
            toValue: 0.14,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0.4,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(sensorGlow, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(sensorGlow, {
            toValue: 0.35,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [ringOpacity, ringScale, sensorGlow]);

  useEffect(() => {
    const animations = particles.map((particle, index) => {
      const delay = index * 140;
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(particle.opacity, {
              toValue: 0.65,
              duration: 280,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 1.15,
              duration: 2200,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(particle.translateY, {
              toValue: -180,
              duration: 2200,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: 240,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 0.8,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(particle.translateY, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    });

    const composite = Animated.stagger(120, animations);
    composite.start();

    return () => {
      composite.stop();
      particles.forEach((particle) => {
        particle.opacity.stopAnimation();
        particle.scale.stopAnimation();
        particle.translateY.stopAnimation();
      });
    };
  }, [particles]);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(factOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(factOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [factOpacity, factText]);

  useEffect(() => {
    const isBlinking = phase !== 'sensing';
    const primaryTo = phase === 'ready' ? 1 : phase === 'sensing' ? 0.92 : 1;
    const secondaryTo = phase === 'ready' ? 0.35 : phase === 'sensing' ? 0.4 : 0.32;

    const animation = Animated.loop(
      isBlinking
        ? Animated.sequence([
            Animated.parallel([
              Animated.timing(ledPrimary, {
                toValue: primaryTo,
                duration: 380,
                useNativeDriver: true,
              }),
              Animated.timing(ledSecondary, {
                toValue: secondaryTo,
                duration: 380,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(ledPrimary, {
                toValue: 0.3,
                duration: 380,
                useNativeDriver: true,
              }),
              Animated.timing(ledSecondary, {
                toValue: 0.18,
                duration: 380,
                useNativeDriver: true,
              }),
            ]),
          ])
        : Animated.sequence([
            Animated.parallel([
              Animated.timing(ledPrimary, {
                toValue: primaryTo,
                duration: 900,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(ledSecondary, {
                toValue: secondaryTo,
                duration: 900,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(ledPrimary, {
                toValue: 0.45,
                duration: 900,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(ledSecondary, {
                toValue: 0.18,
                duration: 900,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
          ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [ledPrimary, ledSecondary, phase]);

  const ledColors = phase === 'ready'
    ? ['#5DFF8B', '#2ECC71', '#0F8A45']
    : phase === 'sensing'
      ? ['#8FD4FF', '#2F8FFF', '#1646C7']
      : ['#FFD089', '#FF9D2E', '#CC5A00'];

  const phaseLabel = phase === 'ready'
    ? t('sensorReady')
    : phase === 'sensing'
      ? t('sensorSensing')
      : t('sensorAnalysing');

  return (
    <View style={styles.wrapper} testID="detection-animation">
      <View style={styles.sensorHeader}>
        <View style={styles.ledRow}>
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              style={[
                styles.led,
                {
                  backgroundColor: ledColors[index],
                  opacity: index === 1 ? ledPrimary : ledSecondary,
                  transform: [{ scale: index === 1 ? ledPrimary : ledSecondary }],
                },
              ]}
            />
          ))}
        </View>
        <Text style={styles.phaseLabel}>{phaseLabel}</Text>
        <Animated.View style={[styles.sensorAura, { opacity: sensorGlow }]} />
        <LinearGradient
          colors={['#233046', '#171E2C', '#0D121D']}
          style={styles.sensorModule}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.sensorTitle}>{t('sensorModuleTitle')}</Text>
          <View style={styles.sensorBar}>
            <View style={styles.sensorPort} />
            <View style={styles.sensorPort} />
            <View style={styles.sensorPortWide} />
          </View>
        </LinearGradient>
      </View>

      <View style={styles.animationStage}>
        {particles.map((particle, index) => (
          <Animated.View
            key={`particle-${index}`}
            style={[
              styles.particle,
              {
                left: '50%',
                marginLeft: particleOffsets[index] ?? 0,
                transform: [
                  { translateY: particle.translateY },
                  { scale: particle.scale },
                ],
                opacity: particle.opacity,
              },
            ]}
          />
        ))}

        <Animated.View
          style={[
            styles.ringOuter,
            {
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.ringInner,
            {
              opacity: ringOpacity.interpolate({
                inputRange: [0.14, 0.4],
                outputRange: [0.22, 0.5],
              }),
              transform: [{ scale: ringScale.interpolate({ inputRange: [0.9, 1.18], outputRange: [0.96, 1.08] }) }],
            },
          ]}
        />

        <View style={styles.pineappleCore}>
          <LinearGradient
            colors={['#FFFCEE', '#FFF6C7']}
            style={styles.pineappleCoreGradient}
          >
            <PineappleIcon size={92} />
          </LinearGradient>
        </View>
      </View>

      {isCountdownRunning ? (
        <View style={styles.triviaArea}>
          <PineappleTriviaCard active={isCountdownRunning} variant="light" />
          <Text style={styles.progressText}>{progressText}</Text>
        </View>
      ) : (
        <Animated.View style={[styles.factCard, { opacity: factOpacity }]}>
          <Text style={styles.factLabel}>{t('scanTipsLabel')}</Text>
          <Text style={styles.factText}>{factText}</Text>
          <Text style={styles.progressText}>{progressText}</Text>
        </Animated.View>
      )}
    </View>
  );
}

export const DetectionAnimation = memo(DetectionAnimationComponent);

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: '100%',
  },
  sensorHeader: {
    alignItems: 'center',
    marginBottom: 14,
  },
  ledRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  led: {
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  phaseLabel: {
    color: '#7A8494',
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 1.6,
    marginBottom: 10,
  },
  sensorAura: {
    position: 'absolute',
    top: 42,
    width: 180,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(82, 171, 255, 0.18)',
  },
  sensorModule: {
    width: 200,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 8,
  },
  sensorTitle: {
    color: '#DDE7F5',
    fontSize: 13,
    fontWeight: '800' as const,
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 12,
  },
  sensorBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  sensorPort: {
    width: 30,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A566D',
  },
  sensorPortWide: {
    width: 42,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#69758B',
  },
  animationStage: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    bottom: 72,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(107, 198, 255, 0.9)',
    shadowColor: '#7DD3FC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
  },
  ringOuter: {
    position: 'absolute',
    width: 212,
    height: 212,
    borderRadius: 106,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.55)',
    backgroundColor: 'rgba(110, 231, 183, 0.05)',
  },
  ringInner: {
    position: 'absolute',
    width: 176,
    height: 176,
    borderRadius: 88,
    borderWidth: 1,
    borderColor: 'rgba(255, 214, 0, 0.65)',
  },
  pineappleCore: {
    width: 144,
    height: 144,
    borderRadius: 72,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  pineappleCoreGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  factCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#E7EEF7',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  factLabel: {
    fontSize: 11,
    fontWeight: '800' as const,
    letterSpacing: 1.4,
    color: '#6F7A8A',
    marginBottom: 10,
  },
  factText: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#667085',
  },
  triviaArea: {
    width: '100%',
  },
});
