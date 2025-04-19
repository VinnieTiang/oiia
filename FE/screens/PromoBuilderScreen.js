"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {
  generatePromoContent,
  fetchForecast,
  getMerchantItems,
  generateImage,
  fetchBundleSuggestions,
} from "../api";

export default function PromoBuilderScreen({ navigation }) {
  // Promo details
  const [promoName, setPromoName] = useState("");
  const [promoDescription, setPromoDescription] = useState("");
  const [discountType, setDiscountType] = useState("percentage"); // percentage, fixed, bundle
  const [discountValue, setDiscountValue] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ); // Default 1 week
  const [isStartDatePickerVisible, setStartDatePickerVisibility] =
    useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [optimalTimes, setOptimalTimes] = useState(null);
  const [useOptimalTimes, setUseOptimalTimes] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [bundleSuggestions, setBundleSuggestions] = useState([]);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const items = await getMerchantItems();
      setMenuItems(items);
    };

    fetchData();
  }, []);

  // Sample bundle suggestions
  const sampleBundleSuggestions = [
    {
      id: 1,
      name: "Nasi Lemak Combo",
      description: "Nasi Lemak with Teh Tarik at a special price",
      items: [
        { id: 1, name: "Nasi Lemak", price: 8.5 },
        { id: 4, name: "Teh Tarik", price: 3.0 },
      ],
      discount: 15,
      originalPrice: 11.5,
      discountedPrice: 9.78,
      popularity: 85,
    },
    {
      id: 2,
      name: "Breakfast Special",
      description: "Roti Canai with Teh Tarik - perfect morning combo",
      items: [
        { id: 5, name: "Roti Canai", price: 4.5 },
        { id: 4, name: "Teh Tarik", price: 3.0 },
      ],
      discount: 10,
      originalPrice: 7.5,
      discountedPrice: 6.75,
      popularity: 92,
    },
    {
      id: 3,
      name: "Mee Goreng Set",
      description: "Mee Goreng with Ayam Goreng - hearty meal combo",
      items: [
        { id: 3, name: "Mee Goreng", price: 7.5 },
        { id: 2, name: "Ayam Goreng", price: 10.0 },
      ],
      discount: 20,
      originalPrice: 17.5,
      discountedPrice: 14.0,
      popularity: 78,
    },
  ];

  useEffect(() => {
    const loadBundleData = async () => {
      setIsLoading(true);
      try {
        // Fetch bundle suggestions from API
        const result = await fetchBundleSuggestions();
        if (result.status === "success" && result.suggestions) {
          setBundleSuggestions(result.suggestions);
        } else {
          // Fall back to sample data if API call fails
          console.warn(
            "Using sample bundle suggestions due to API error:",
            result.message
          );
          setBundleSuggestions(sampleBundleSuggestions);
        }

        // Load optimal times
        await loadOptimalTimes();
      } catch (error) {
        console.error("Error loading bundle suggestions:", error);
        // Fall back to sample data
        setBundleSuggestions(sampleBundleSuggestions);
      } finally {
        setIsLoading(false);
      }
    };

    loadBundleData();
  }, []);

  const loadOptimalTimes = async () => {
    setIsLoading(true);
    try {
      const forecastData = await fetchForecast();

      // Process forecast data to find optimal times
      // This is a simplified example - in a real app, you would analyze the forecast data
      const optimal = {
        days: [
          {
            day: "Monday",
            score: 85,
            reason: "High foot traffic between 12-2 PM",
          },
          {
            day: "Friday",
            score: 92,
            reason: "Payday increases spending by 25%",
          },
          { day: "Saturday", score: 88, reason: "Weekend family dining trend" },
        ],
        times: [
          { time: "12:00 PM - 2:00 PM", score: 95, reason: "Lunch rush hour" },
          { time: "6:00 PM - 8:00 PM", score: 90, reason: "Dinner peak time" },
          {
            time: "9:00 AM - 11:00 AM",
            score: 75,
            reason: "Breakfast/brunch period",
          },
        ],
      };

      setOptimalTimes(optimal);
    } catch (error) {
      console.error("Error loading optimal times:", error);
      Alert.alert(
        "Error",
        "Failed to load optimal promotion times. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!generatedContent?.imagePrompt) {
      Alert.alert("Missing Prompt", "No image prompt available.");
      return;
    }

    setIsGeneratingImage(true);
    try {
      const result = await generateImage(generatedContent.imagePrompt);
      if (result.success && result.image_data) {
        setGeneratedImage(`data:image/png;base64,${result.image_data}`);
      } else {
        Alert.alert("Error", "Failed to generate image. Please try again.");
      }
      // await new Promise(resolve => setTimeout(resolve, 3000));
      // const imageUri = require('../assets/image-placeholder.png');
      // setGeneratedImage(Image.resolveAssetSource(imageUri).uri);
    } catch (error) {
      console.error("Error generating image:", error);
      Alert.alert("Error", "Failed to generate image. Please try again.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleStartDateConfirm = (date) => {
    setStartDate(date);
    setStartDatePickerVisibility(false);
  };

  const handleEndDateConfirm = (date) => {
    setEndDate(date);
    setEndDatePickerVisibility(false);
  };

  const toggleItemSelection = (item) => {
    if (selectedItems.some((i) => i.id === item.id)) {
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const selectBundle = (bundle) => {
    setSelectedBundle(bundle);
    setDiscountType("bundle");
    setDiscountValue(bundle.discount.toString());
    setSelectedItems(bundle.items);
    setPromoName(bundle.name);
    setPromoDescription(bundle.description);
  };

  const cleanJSON = (text) => {
    const jsonText = text
      .replace(/```json\n?/gi, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(jsonText);
  };

  const generateContent = async () => {
    if (!promoName || selectedItems.length === 0) {
      Alert.alert(
        "Missing Information",
        "Please provide a promotion name and select at least one item."
      );
      return;
    }

    setIsGenerating(true);
    try {
      const itemNames = selectedItems.map((item) => item.name).join(", ");
      const discountInfo =
        discountType === "percentage"
          ? `${discountValue}% off`
          : discountType === "fixed"
          ? `RM${discountValue} off`
          : `Special bundle price`;

      const prompt = `Create a food promotion for ${promoName} featuring ${itemNames}. 
        The promotion offers ${discountInfo}. 
        This is the promotion description: ${promoDescription}.
        Generate a catchy tagline, a short description, 3 hashtags for social media .
        And also a prompt to be fed to AI model to generate a catchy promotion poster. After the prompt is generated,
        Add this line behind the image prompt: 'Dont include any text in the image'.
        
        Generate the result in the following JSON format with a tagline of string, a description of string, a hastags of array of string and an imagePrompt of string
        `;

      const rawReply = await generatePromoContent(prompt);
      const content = cleanJSON(rawReply);

      // Parse the response
      setGeneratedContent({
        tagline: content.tagline,
        description: content.description,
        hashtags: content.hashtags,
        imagePrompt: content.imagePrompt,
      });
      console.log("Tagline:", content.tagline);
      console.log("Description:", content.description);
      console.log("Hashtags:", content.hashtags);
      console.log("Image Prompt:", content.imagePrompt);

      // Move to next step
      setCurrentStep(3);
    } catch (error) {
      console.error("Error generating content:", error);
      Alert.alert(
        "Error",
        "Failed to generate promotion content. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const savePromotion = () => {
    Alert.alert("Success", "Your promotion has been created and scheduled!", [
      {
        text: "OK",
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 1: Choose Promotion Type</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Discount Type</Text>
        <View style={styles.discountTypeContainer}>
          <TouchableOpacity
            style={[
              styles.discountTypeButton,
              discountType === "percentage" && styles.discountTypeButtonActive,
            ]}
            onPress={() => setDiscountType("percentage")}
          >
            <Text
              style={[
                styles.discountTypeText,
                discountType === "percentage" && styles.discountTypeTextActive,
              ]}
            >
              Percentage
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.discountTypeButton,
              discountType === "fixed" && styles.discountTypeButtonActive,
            ]}
            onPress={() => setDiscountType("fixed")}
          >
            <Text
              style={[
                styles.discountTypeText,
                discountType === "fixed" && styles.discountTypeTextActive,
              ]}
            >
              Fixed Amount
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.discountTypeButton,
              discountType === "bundle" && styles.discountTypeButtonActive,
            ]}
            onPress={() => setDiscountType("bundle")}
          >
            <Text
              style={[
                styles.discountTypeText,
                discountType === "bundle" && styles.discountTypeTextActive,
              ]}
            >
              Bundle
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {discountType !== "bundle" && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Discount Value</Text>
          <View style={styles.inputWithPrefix}>
            <Text style={styles.inputPrefix}>
              {discountType === "percentage" ? "%" : "RM"}
            </Text>
            <TextInput
              style={styles.discountInput}
              value={discountValue}
              onChangeText={setDiscountValue}
              keyboardType="numeric"
              placeholder={
                discountType === "percentage" ? "e.g. 15" : "e.g. 5.00"
              }
            />
          </View>
        </View>
      )}

      {discountType === "bundle" && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Recommended Bundles</Text>
          <Text style={styles.helperText}>
            Based on your sales data and customer preferences
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.bundleContainer}
          >
            {bundleSuggestions.map((bundle) => (
              <TouchableOpacity
                key={bundle.id}
                style={[
                  styles.bundleCard,
                  selectedBundle?.id === bundle.id && styles.bundleCardSelected,
                ]}
                onPress={() => selectBundle(bundle)}
              >
                <View style={styles.bundlePopularity}>
                  <Ionicons name="star" size={12} color="#FFD700" />
                  <Text style={styles.bundlePopularityText}>
                    {bundle.popularity}%
                  </Text>
                </View>

                <Text style={styles.bundleName}>{bundle.name}</Text>
                <Text style={styles.bundleDescription} numberOfLines={2}>
                  {bundle.description}
                </Text>

                <View style={styles.bundleItems}>
                  {bundle.items.map((item) => (
                    <Text key={item.id} style={styles.bundleItemText}>
                      • {item.name}
                    </Text>
                  ))}
                </View>

                <View style={styles.bundlePricing}>
                  <Text style={styles.bundleOriginalPrice}>
                    RM{bundle.originalPrice.toFixed(2)}
                  </Text>
                  <Text style={styles.bundleDiscountedPrice}>
                    RM{bundle.discountedPrice.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.bundleDiscount}>
                  <Text style={styles.bundleDiscountText}>
                    {bundle.discount}% OFF
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>Select Items for Promotion</Text>
        <ScrollView style={styles.itemsContainer} nestedScrollEnabled={true}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.itemCard,
                selectedItems.some((i) => i.id === item.id) &&
                  styles.itemCardSelected,
              ]}
              onPress={() => toggleItemSelection(item)}
            >
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <Text style={styles.itemPrice}>RM{item.price.toFixed(2)}</Text>
              </View>
              <View style={styles.itemCheckbox}>
                {selectedItems.some((i) => i.id === item.id) && (
                  <Ionicons name="checkmark-circle" size={24} color="#2FAE60" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={[
          styles.nextButton,
          selectedItems.length === 0 && styles.nextButtonDisabled,
        ]}
        onPress={() => setCurrentStep(2)}
        disabled={selectedItems.length === 0}
      >
        <Text style={styles.nextButtonText}>Next: Promotion Details</Text>
        <Ionicons name="arrow-forward" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 2: Promotion Details</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Promotion Name</Text>
        <TextInput
          style={styles.input}
          value={promoName}
          onChangeText={setPromoName}
          placeholder="e.g. Weekend Special, Lunch Combo"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={promoDescription}
          onChangeText={setPromoDescription}
          placeholder="Describe your promotion"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Promotion Period</Text>

        <View style={styles.dateRow}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setStartDatePickerVisibility(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.dateButtonText}>
              {startDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          <Text style={styles.dateToText}>to</Text>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setEndDatePickerVisibility(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.dateButtonText}>
              {endDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>

        <DateTimePickerModal
          isVisible={isStartDatePickerVisible}
          mode="date"
          onConfirm={handleStartDateConfirm}
          onCancel={() => setStartDatePickerVisibility(false)}
          minimumDate={new Date()}
          display="spinner"
          // Add these styling properties to improve visibility
          textColor="#000000"
          backgroundColor="white"
          isDarkModeEnabled={false}
          pickerContainerStyleIOS={{ backgroundColor: "white" }}
        />

        <DateTimePickerModal
          isVisible={isEndDatePickerVisible}
          mode="date"
          onConfirm={handleEndDateConfirm}
          onCancel={() => setEndDatePickerVisibility(false)}
          minimumDate={startDate}
          display="spinner"
          // Add these styling properties to improve visibility
          textColor="#000000"
          backgroundColor="white"
          isDarkModeEnabled={false}
          pickerContainerStyleIOS={{ backgroundColor: "white" }}
        />
      </View>

      {optimalTimes && (
        <View style={styles.formGroup}>
          {useOptimalTimes && (
            <View style={styles.optimalTimesContainer}>
              <View style={styles.optimalTimesSection}>
                <Text style={styles.optimalTimesTitle}>Best Days</Text>
                {optimalTimes.days.map((day, index) => (
                  <View key={index} style={styles.optimalTimeItem}>
                    <View style={styles.optimalTimeScore}>
                      <Text style={styles.optimalTimeScoreText}>
                        {day.score}
                      </Text>
                    </View>
                    <View style={styles.optimalTimeDetails}>
                      <Text style={styles.optimalTimeDay}>{day.day}</Text>
                      <Text style={styles.optimalTimeReason}>{day.reason}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.optimalTimesSection}>
                <Text style={styles.optimalTimesTitle}>Best Hours</Text>
                {optimalTimes.times.map((time, index) => (
                  <View key={index} style={styles.optimalTimeItem}>
                    <View
                      style={[
                        styles.optimalTimeScore,
                        { backgroundColor: "#E8F5FF" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.optimalTimeScoreText,
                          { color: "#2D9CDB" },
                        ]}
                      >
                        {time.score}
                      </Text>
                    </View>
                    <View style={styles.optimalTimeDetails}>
                      <Text style={styles.optimalTimeDay}>{time.time}</Text>
                      <Text style={styles.optimalTimeReason}>
                        {time.reason}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(1)}
        >
          <Ionicons name="arrow-back" size={20} color="#666" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextButton, !promoName && styles.nextButtonDisabled]}
          onPress={generateContent}
          disabled={!promoName || isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>Generate Content</Text>
              <Ionicons name="sparkles-outline" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 3: Review & Publish</Text>

      {generatedContent && (
        <View style={styles.generatedContentContainer}>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>{promoName}</Text>
              <View style={styles.previewBadge}>
                <Text style={styles.previewBadgeText}>
                  {discountType === "percentage"
                    ? `${discountValue}% OFF`
                    : discountType === "fixed"
                    ? `RM${discountValue} OFF`
                    : "BUNDLE DEAL"}
                </Text>
              </View>
            </View>

            <Text style={styles.previewTagline}>
              {generatedContent.tagline}
            </Text>

            <View style={styles.previewItems}>
              {selectedItems.map((item) => (
                <View key={item.id} style={styles.previewItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#2FAE60" />
                  <Text style={styles.previewItemText}>{item.name}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.previewDescription}>
              {generatedContent.description}
            </Text>

            <View style={styles.previewDates}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.previewDateText}>
                {startDate.toLocaleDateString()} -{" "}
                {endDate.toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.previewHashtags}>
              {generatedContent.hashtags.map((hashtag, index) => (
                <View key={index} style={styles.previewHashtag}>
                  <Text style={styles.previewHashtagText}>{hashtag}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>AI Generated Poster</Text>
            <View style={styles.imagePromptContainer}>
              <Text style={styles.imagePromptText}>
                Create a personalized AI-generated poster to boost your
                promotion.
              </Text>
              <TouchableOpacity
                style={styles.generateImageButton}
                onPress={handleGenerateImage}
                disabled={isGeneratingImage}
              >
                {isGeneratingImage ? (
                  <ActivityIndicator size="small" color="#2FAE60" />
                ) : (
                  <>
                    <Text style={styles.generateImageButtonText}>
                      Generate Image
                    </Text>
                    <Ionicons name="image-outline" size={16} color="#2FAE60" />
                  </>
                )}
              </TouchableOpacity>
            </View>
            {generatedImage && (
              <View style={styles.generatedImageContainer}>
                <Image
                  source={{ uri: generatedImage }}
                  style={styles.generatedImage}
                  resizeMode="contain"
                />
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(2)}
        >
          <Ionicons name="arrow-back" size={20} color="#666" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.publishButton} onPress={savePromotion}>
          <Text style={styles.publishButtonText}>Publish Promotion</Text>
          <Ionicons name="checkmark-circle" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(currentStep / 3) * 100}%` },
            ]}
          />
        </View>
        <View style={styles.stepsIndicator}>
          <View
            style={[
              styles.stepIndicator,
              currentStep >= 1 && styles.stepIndicatorActive,
            ]}
          >
            <Text
              style={[
                styles.stepIndicatorText,
                currentStep >= 1 && styles.stepIndicatorTextActive,
              ]}
            >
              1
            </Text>
          </View>
          <View style={styles.stepConnector} />
          <View
            style={[
              styles.stepIndicator,
              currentStep >= 2 && styles.stepIndicatorActive,
            ]}
          >
            <Text
              style={[
                styles.stepIndicatorText,
                currentStep >= 2 && styles.stepIndicatorTextActive,
              ]}
            >
              2
            </Text>
          </View>
          <View style={styles.stepConnector} />
          <View
            style={[
              styles.stepIndicator,
              currentStep >= 3 && styles.stepIndicatorActive,
            ]}
          >
            <Text
              style={[
                styles.stepIndicatorText,
                currentStep >= 3 && styles.stepIndicatorTextActive,
              ]}
            >
              3
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButtonHeader: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  headerRight: {
    width: 40,
  },
  progressContainer: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    marginBottom: 16,
  },
  progressFill: {
    height: 4,
    backgroundColor: "#2FAE60",
    borderRadius: 2,
  },
  stepsIndicator: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  stepIndicatorActive: {
    backgroundColor: "#2FAE60",
    borderColor: "#2FAE60",
  },
  stepIndicatorText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#999",
  },
  stepIndicatorTextActive: {
    color: "white",
  },
  stepConnector: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 8,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  stepContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: -4,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  inputWithPrefix: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  inputPrefix: {
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#666",
  },
  discountInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  discountTypeContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  discountTypeButton: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginRight: 8,
    borderRadius: 8,
  },
  discountTypeButtonActive: {
    backgroundColor: "#e6f7ef",
    borderColor: "#2FAE60",
  },
  discountTypeText: {
    fontSize: 14,
    color: "#666",
  },
  discountTypeTextActive: {
    color: "#2FAE60",
    fontWeight: "600",
  },
  itemsContainer: {
    maxHeight: 300,
    marginBottom: 16,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  itemCardSelected: {
    borderColor: "#2FAE60",
    backgroundColor: "#f0f9f4",
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2FAE60",
  },
  itemCheckbox: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  bundleContainer: {
    marginVertical: 8,
  },
  bundleCard: {
    width: 200,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    position: "relative",
  },
  bundleCardSelected: {
    borderColor: "#2FAE60",
    backgroundColor: "#f0f9f4",
  },
  bundlePopularity: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  bundlePopularityText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#F2994A",
    marginLeft: 2,
  },
  bundleName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  bundleDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    height: 32,
  },
  bundleItems: {
    marginBottom: 8,
  },
  bundleItemText: {
    fontSize: 12,
    color: "#333",
    marginBottom: 2,
  },
  bundlePricing: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  bundleOriginalPrice: {
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
    marginRight: 8,
  },
  bundleDiscountedPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2FAE60",
  },
  bundleDiscount: {
    backgroundColor: "#ffebee",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  bundleDiscountText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#d32f2f",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    flex: 1,
  },
  dateButtonText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
  dateToText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: "#666",
  },
  optimalTimesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  optimalTimesContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  optimalTimesSection: {
    marginBottom: 16,
  },
  optimalTimesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  optimalTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  optimalTimeScore: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f9f4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optimalTimeScoreText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2FAE60",
  },
  optimalTimeDetails: {
    flex: 1,
  },
  optimalTimeDay: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  optimalTimeReason: {
    fontSize: 12,
    color: "#666",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  backButtonText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2FAE60",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    flex: 1,
    marginLeft: 12,
  },
  nextButtonDisabled: {
    backgroundColor: "#a7e9c3",
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    marginRight: 8,
  },
  publishButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2FAE60",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    flex: 1,
    marginLeft: 12,
  },
  publishButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    marginRight: 8,
  },
  generatedContentContainer: {
    marginBottom: 16,
  },
  previewCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  previewBadge: {
    backgroundColor: "#ffebee",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  previewBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#d32f2f",
  },
  previewTagline: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2FAE60",
    marginBottom: 12,
    fontStyle: "italic",
  },
  previewItems: {
    marginBottom: 12,
  },
  previewItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  previewItemText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
  previewDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  previewDates: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  previewDateText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  previewHashtags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  previewHashtag: {
    backgroundColor: "#e8f5ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  previewHashtagText: {
    fontSize: 12,
    color: "#2D9CDB",
  },
  imagePromptContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  imagePromptText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    fontStyle: "italic",
  },
  generateImageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2FAE60",
  },
  generateImageButtonText: {
    fontSize: 14,
    color: "#2FAE60",
    marginRight: 8,
  },
  channelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  channelButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    flex: 1,
    marginHorizontal: 4,
  },
  channelButtonText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  generatedImageContainer: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  generatedImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
  },
});
