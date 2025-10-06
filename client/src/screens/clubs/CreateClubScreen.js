import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-toast-message';

import useClubStore from '../../stores/clubStore';
import useAuthStore from '../../stores/authStore';
import { colors, spacing, typography } from '../../utils/theme';

const CreateClubScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    clubName: '',
    clubDescription: '',
    category: '',
    location: '',
  });
  const [errors, setErrors] = useState({});

  const { createClub, loading } = useClubStore();
  const { token } = useAuthStore();

  const categories = [
    'Technology',
    'Sports',
    'Arts',
    'Music',
    'Literature',
    'Science',
    'Business',
    'Social Service',
    'Photography',
    'Gaming',
    'Dance',
    'Drama',
    'Other',
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.clubName.trim()) {
      newErrors.clubName = 'Club name is required';
    } else if (formData.clubName.length < 3) {
      newErrors.clubName = 'Club name must be at least 3 characters';
    }

    if (!formData.clubDescription.trim()) {
      newErrors.clubDescription = 'Description is required';
    } else if (formData.clubDescription.length < 10) {
      newErrors.clubDescription = 'Description must be at least 10 characters';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateClub = async () => {
    if (!validateForm()) return;

    Alert.alert(
      'Create Club',
      'Are you sure you want to create this club? It will need admin approval.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async () => {
            const result = await createClub(formData, token);
            
            if (result.success) {
              Toast.show({
                type: 'success',
                text1: 'Club Created!',
                text2: 'Your club has been submitted for approval.',
              });
              navigation.goBack();
            } else {
              Toast.show({
                type: 'error',
                text1: 'Creation Failed',
                text2: result.error || 'Failed to create club',
              });
            }
          },
        },
      ]
    );
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const renderCategorySelector = () => (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryLabel}>Select Category</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              formData.category === category && styles.selectedCategoryChip,
            ]}
            onPress={() => updateFormData('category', category)}
          >
            <Text
              style={[
                styles.categoryText,
                formData.category === category && styles.selectedCategoryText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {errors.category && (
        <Text style={styles.errorText}>{errors.category}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animatable.View 
            animation="fadeInDown" 
            duration={800}
            style={styles.header}
          >
            <LinearGradient
              colors={colors.gradient.primary}
              style={styles.headerGradient}
            >
              <Text style={styles.title}>Create New Club</Text>
              <Text style={styles.subtitle}>
                Start building your community
              </Text>
            </LinearGradient>
          </Animatable.View>

          {/* Form */}
          <Animatable.View 
            animation="fadeInUp" 
            delay={300}
            style={styles.form}
          >
            {/* Club Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Club Name</Text>
              <View style={[styles.inputWrapper, errors.clubName && styles.inputError]}>
                <Ionicons 
                  name="people-outline" 
                  size={20} 
                  color={colors.textSecondary} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter club name"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.clubName}
                  onChangeText={(text) => updateFormData('clubName', text)}
                />
              </View>
              {errors.clubName && (
                <Text style={styles.errorText}>{errors.clubName}</Text>
              )}
            </View>

            {/* Description */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <View style={[styles.inputWrapper, styles.textAreaWrapper, errors.clubDescription && styles.inputError]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe your club's purpose and activities"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.clubDescription}
                  onChangeText={(text) => updateFormData('clubDescription', text)}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              {errors.clubDescription && (
                <Text style={styles.errorText}>{errors.clubDescription}</Text>
              )}
            </View>

            {/* Category */}
            {renderCategorySelector()}

            {/* Location */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Location</Text>
              <View style={[styles.inputWrapper, errors.location && styles.inputError]}>
                <Ionicons 
                  name="location-outline" 
                  size={20} 
                  color={colors.textSecondary} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Meeting location or campus"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.location}
                  onChangeText={(text) => updateFormData('location', text)}
                />
              </View>
              {errors.location && (
                <Text style={styles.errorText}>{errors.location}</Text>
              )}
            </View>

            {/* Create Button */}
            <TouchableOpacity
              style={[styles.createButton, loading && styles.disabledButton]}
              onPress={handleCreateClub}
              disabled={loading}
            >
              <LinearGradient
                colors={colors.gradient.secondary}
                style={styles.buttonGradient}
              >
                <Ionicons 
                  name="add-circle-outline" 
                  size={24} 
                  color={colors.background} 
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>
                  {loading ? 'Creating Club...' : 'Create Club'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Info */}
            <View style={styles.infoContainer}>
              <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                Your club will be reviewed by administrators before appearing publicly.
              </Text>
            </View>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerGradient: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    ...typography.h1,
    color: colors.background,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.background,
    opacity: 0.9,
  },
  form: {
    paddingHorizontal: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  categoryContainer: {
    marginBottom: spacing.lg,
  },
  categoryLabel: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  categoryScroll: {
    marginBottom: spacing.sm,
  },
  categoryChip: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  selectedCategoryChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    ...typography.body,
    color: colors.text,
  },
  selectedCategoryText: {
    color: colors.background,
    fontWeight: '600',
  },
  createButton: {
    marginTop: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },
  buttonText: {
    ...typography.h3,
    color: colors.background,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceVariant,
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.lg,
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    marginLeft: spacing.sm,
  },
});

export default CreateClubScreen;