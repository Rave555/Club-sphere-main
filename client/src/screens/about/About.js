import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Animated,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { colors, spacing, typography } from '../../utils/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const TanmayImage = require(`../../assets/TanmayPic.jpg`);


const developers = [
  {
    id: 1,
    name: 'Raghu',
    role: 'Frontend Developer',
    description: 'Focuses on simplicity & usability.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    skills: ['UI/UX Design', 'React Native', 'Zustand'],
    color: '#6C5CE7',
  },
  {
    id: 2,
    name: 'Tanmay Gosavi',
    role: 'Full Stack Developer',
    description: 'Creates beautiful user experiences.',
    image: TanmayImage,
    skills: ['React Native', 'NodeJs', 'MongoDB' , "Expo"] ,
    color: '#74B9FF',
  },
  {
    id: 3,
    name: 'Shubham Tomar',
    role: 'Vibe Coder',
    description: 'Masters the prompt engineering.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    skills: ['Node.js', 'MongoDB', 'JavaScript'],
    color: '#55A3FF',
  },
  {
    id: 4,
    name: 'Aastha Thakkar',
    role: 'Moral Support Developer',
    description: 'Masters both frontend and backend.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    skills: ['Express', 'NodeJs'],
    color: '#FD79A8',
  },
  {
    id: 5,
    name: 'Ankit Bhati',
    role: 'PPT Maker',
    description: 'Specializes in cross-platform apps.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    skills: ['Figma'],
    color: '#FDCB6E',
  }
];

const DeveloperCard = ({ developer, index, scrollX }) => {
  const inputRange = [
    (index - 1) * screenWidth,
    index * screenWidth,
    (index + 1) * screenWidth,
  ];

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.8, 1, 0.8],
    extrapolate: 'clamp',
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.6, 1, 0.6],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [{ scale }],
          opacity,
        },
      ]}
    >
      <LinearGradient
        colors={[developer.color + '20', developer.color + '10']}
        style={styles.card}
      >
        <View style={styles.cardContent}>
          {/* Profile Image */}
          <View style={[styles.imageContainer, { borderColor: developer.color }]}>
            <Image 
              source={typeof developer.image === 'string' ? { uri: developer.image } : developer.image} 
              style={styles.profileImage} 
            />
            <View style={[styles.statusIndicator, { backgroundColor: developer.color }]}>
              <Ionicons name="checkmark" size={12} color="white" />
            </View>
          </View>

          {/* Developer Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.developerName}>{developer.name}</Text>
            <Text style={[styles.developerRole, { color: developer.color }]}>
              {developer.role}
            </Text>
            <Text style={styles.developerDescription}>
              {developer.description}
            </Text>

            {/* Skills */}
            <View style={styles.skillsContainer}>
              {developer.skills.map((skill, skillIndex) => (
                <View
                  key={skillIndex}
                  style={[styles.skillChip, { backgroundColor: developer.color + '20' }]}
                >
                  <Text style={[styles.skillText, { color: developer.color }]}>
                    {skill}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const Pagination = ({ scrollX }) => {
  return (
    <View style={styles.paginationContainer}>
      {developers.map((_, index) => {
        const inputRange = [
          (index - 1) * screenWidth,
          index * screenWidth,
          (index + 1) * screenWidth,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.paginationDot,
              {
                width: dotWidth,
                opacity,
                backgroundColor: developers[index].color,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const About = ({ navigation }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % developers.length;
        scrollViewRef.current?.scrollTo({
          x: nextIndex * screenWidth,
          animated: true,
        });
        return nextIndex;
      });
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const slideIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
        setCurrentIndex(slideIndex);
      },
    }
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animatable.View animation="fadeInDown" duration={1000} style={styles.header}>
          <LinearGradient
            colors={colors.gradient.primary}
            style={styles.headerGradient}
          >
            <Text style={styles.headerTitle}>Meet Our Team</Text>
            <Text style={styles.headerSubtitle}>
              The talented people behind ClubSphere
            </Text>
          </LinearGradient>
        </Animatable.View>

        {/* Developer Carousel */}
        <Animatable.View animation="fadeInUp" duration={1000} delay={300}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            snapToInterval={screenWidth}
            snapToAlignment="center"
            style={styles.carousel}
          >
            {developers.map((developer, index) => (
              <DeveloperCard
                key={developer.id}
                developer={developer}
                index={index}
                scrollX={scrollX}
              />
            ))}
          </ScrollView>

          {/* Pagination */}
          <Pagination scrollX={scrollX} />
        </Animatable.View>

        {/* App Info */}
        <Animatable.View animation="fadeInUp" duration={1000} delay={600} style={styles.appInfo}>
          <View style={styles.infoCard}>
            <LinearGradient
              colors={[colors.primary + '15', colors.secondary + '10']}
              style={styles.infoCardGradient}
            >
              <Ionicons name="rocket-outline" size={32} color={colors.primary} />
              <Text style={styles.appTitle}>ClubSphere</Text>
              <Text style={styles.appDescription}>
                A comprehensive platform for managing college clubs and events.
                Built with passion by our amazing development team.
              </Text>
              <Text style={styles.version}>Version 1.0.0</Text>
            </LinearGradient>
          </View>
        </Animatable.View>

        {/* Contact Section */}
        <Animatable.View animation="fadeInUp" duration={1000} delay={900} style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Get In Touch</Text>
          <View style={styles.contactCards}>
            <TouchableOpacity style={styles.contactCard} onPress={() => {
                    Linking.openURL('mailto:help@clubsphere.com');
                }}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.contactCardGradient}
              >
                <Ionicons name="mail-outline" size={24} color="white" />
                <Text style={styles.contactText}>Email Us</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactCard} onPress={() => {
                    Linking.openURL('https://github.com/Rave555/Club-sphere-main');
                }}
            >
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={styles.contactCardGradient}
              >
                <Ionicons name="logo-github" size={24} color="white" />
                <Text style={styles.contactText}>GitHub</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.xl,
  },
  headerGradient: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.background,
    marginBottom: spacing.xs,
    textAlign: "center"
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.background,
    opacity: 0.9,
    textAlign: "center"
  },
  carousel: {
    marginBottom: spacing.lg,
  },
  cardContainer: {
    width: screenWidth,
    paddingHorizontal: spacing.lg,
  },
  card: {
    borderRadius: 24,
    padding: spacing.lg,
    minHeight: 480,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  cardContent: {
    alignItems: 'center',
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  infoContainer: {
    alignItems: 'center',
    flex: 1,
  },
  developerName: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  developerRole: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  developerDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  skillChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginBottom: spacing.xs,
  },
  skillText: {
    ...typography.caption,
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
  },
  appInfo: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  infoCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  infoCardGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  appTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  appDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  version: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  contactSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  contactCards: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  contactCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  contactCardGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  contactText: {
    ...typography.body,
    color: 'white',
    fontWeight: '600',
    marginTop: spacing.sm,
  },
});

export default About;