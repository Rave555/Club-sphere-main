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

import useEventStore from '../../stores/eventStore';
import useAuthStore from '../../stores/authStore';
import { colors, spacing, typography } from '../../utils/theme';

const CreateEventScreen = ({ route, navigation }) => {
  const { clubId } = route.params;
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: '',
  });
  const [errors, setErrors] = useState({});

  const { createEvent, loading } = useEventStore();
  const { token } = useAuthStore();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.date.trim()) {
      newErrors.date = 'Event date is required';
    }

    if (!formData.time.trim()) {
      newErrors.time = 'Event time is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateEvent = async () => {
    if (!validateForm()) return;

    Alert.alert(
      'Create Event',
      'Are you sure you want to create this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async () => {
            // Combine date and time into a single Date object
            const eventDateTime = new Date(`${formData.date}T${formData.time}`);
            
            const eventData = {
              ...formData,
              date: eventDateTime,
              clubId,
              capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
            };

            const result = await createEvent(eventData, token);
            
            if (result.success) {
              Toast.show({
                type: 'success',
                text1: 'Event Created!',
                text2: 'Your event has been created successfully.',
              });
              navigation.goBack();
            } else {
              Toast.show({
                type: 'error',
                text1: 'Creation Failed',
                text2: result.error || 'Failed to create event',
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

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMinTime = () => {
    const now = new Date();
    const today = new Date().toISOString().split('T')[0];
    
    if (formData.date === today) {
      return now.toTimeString().split(' ')[0].slice(0, 5);
    }
    return '';
  };

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
              colors={colors.gradient.secondary}
              style={styles.headerGradient}
            >
              <Text style={styles.title}>Create New Event</Text>
              <Text style={styles.subtitle}>
                Bring your community together
              </Text>
            </LinearGradient>
          </Animatable.View>

          {/* Form */}
          <Animatable.View 
            animation="fadeInUp" 
            delay={300}
            style={styles.form}
          >
            {/* Event Title */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Event Title</Text>
              <View style={[styles.inputWrapper, errors.title && styles.inputError]}>
                <Ionicons 
                  name="calendar-outline" 
                  size={20} 
                  color={colors.textSecondary} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter event title"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.title}
                  onChangeText={(text) => updateFormData('title', text)}
                />
              </View>
              {errors.title && (
                <Text style={styles.errorText}>{errors.title}</Text>
              )}
            </View>

            {/* Description */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <View style={[styles.inputWrapper, styles.textAreaWrapper, errors.description && styles.inputError]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe your event"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.description}
                  onChangeText={(text) => updateFormData('description', text)}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              {errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}
            </View>

            {/* Date and Time Row */}
            <View style={styles.rowContainer}>
              {/* Date */}
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Date</Text>
                <View style={[styles.inputWrapper, errors.date && styles.inputError]}>
                  <Ionicons 
                    name="calendar-outline" 
                    size={20} 
                    color={colors.textSecondary} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.date}
                    onChangeText={(text) => updateFormData('date', text)}
                  />
                </View>
                {errors.date && (
                  <Text style={styles.errorText}>{errors.date}</Text>
                )}
              </View>

              {/* Time */}
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Time</Text>
                <View style={[styles.inputWrapper, errors.time && styles.inputError]}>
                  <Ionicons 
                    name="time-outline" 
                    size={20} 
                    color={colors.textSecondary} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="HH:MM"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.time}
                    onChangeText={(text) => updateFormData('time', text)}
                  />
                </View>
                {errors.time && (
                  <Text style={styles.errorText}>{errors.time}</Text>
                )}
              </View>
            </View>

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
                  placeholder="Event location"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.location}
                  onChangeText={(text) => updateFormData('location', text)}
                />
              </View>
              {errors.location && (
                <Text style={styles.errorText}>{errors.location}</Text>
              )}
            </View>

            {/* Capacity (Optional) */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Capacity (Optional)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons 
                  name="people-outline" 
                  size={20} 
                  color={colors.textSecondary} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Maximum attendees"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.capacity}
                  onChangeText={(text) => updateFormData('capacity', text)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Create Button */}
            <TouchableOpacity
              style={[styles.createButton, loading && styles.disabledButton]}
              onPress={handleCreateEvent}
              disabled={loading}
            >
              <LinearGradient
                colors={colors.gradient.primary}
                style={styles.buttonGradient}
              >
                <Ionicons 
                  name="add-circle-outline" 
                  size={24} 
                  color={colors.background} 
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>
                  {loading ? 'Creating Event...' : 'Create Event'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Info */}
            <View style={styles.infoContainer}>
              <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                All club members will be notified about this event.
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
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
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

export default CreateEventScreen;