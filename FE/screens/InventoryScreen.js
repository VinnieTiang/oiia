"use client"

import { useEffect, useState } from "react"
import { StyleSheet, View, ScrollView, TouchableOpacity, RefreshControl, TextInput } from "react-native"
import {Text,Card,Button,DataTable,Chip,ActivityIndicator,Searchbar,Snackbar,Portal,Dialog,} from "react-native-paper"
import { Ionicons } from "@expo/vector-icons"
import * as Notifications from "expo-notifications"
import { FlatList, Image } from "react-native"
import { formatDistanceToNow } from "date-fns";
import { fetchInventoryData, updateInventoryItem } from "../api"; 

// Sample GrabMart vendor data
const grabMartVendors = [
  {
    id: 1,
    name: "FreshMart Grocery",
    rating: 4.8,
    deliveryTime: "15-20 min",
    image: require("../assets/mascot-avatar.png"),
  },
  {
    id: 2,
    name: "SuperValue Store",
    rating: 4.6,
    deliveryTime: "20-30 min",
    image: require("../assets/mascot-avatar2.png"),
  },
  {
    id: 3,
    name: "QuickShop Express",
    rating: 4.7,
    deliveryTime: "10-15 min",
    image: require("../assets/mascot-avatar3.png"),
  },
  {
    id: 4,
    name: "GreenGrocer",
    rating: 4.9,
    deliveryTime: "25-35 min",
    image: require("../assets/mascot-avatar.png"),
  },
  {
    id: 5,
    name: "Metro Minimart",
    rating: 4.5,
    deliveryTime: "15-25 min",
    image: require("../assets/mascot-avatar2.png"),
  },
]

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export default function InventoryScreen() {
  const [inventory, setInventory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [sortDirection, setSortDirection] = useState("ascending")
  const [refreshing, setRefreshing] = useState(false)
  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [selectedItem, setSelectedItem] = useState(null)
  const [restockModalVisible, setRestockModalVisible] = useState(false)
  const [restockQuantity, setRestockQuantity] = useState("")
  const [currentlyRestockingItem, setCurrentlyRestockingItem] = useState(null)
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [paymentModalVisible, setPaymentModalVisible] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("grabpay")
  const [orderDetails, setOrderDetails] = useState(null)
  const [autoRestockVendorModalVisible, setAutoRestockVendorModalVisible] = useState(false);
  const [selectedAutoRestockVendor, setSelectedAutoRestockVendor] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);

  const onChangeSearch = (query) => setSearchQuery(query)

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const formattedData = await fetchInventoryData();
      
      // Process the data, adding the status and formatting dates
      const processedData = formattedData.map(item => {
        // Format the date using formatDistanceToNow
        let formattedLastRestocked = "Never";
        if (item.lastRestocked && item.lastRestocked.parsedDate) {
          formattedLastRestocked = formatDistanceToNow(item.lastRestocked.parsedDate, { addSuffix: true });
        }
        
        return {
          ...item,
          status: getStatus(item.current, item.recommended),
          lastRestocked: formattedLastRestocked
        };
      });
      
      setInventory(processedData);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      showSnackbar("Error fetching inventory data.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const getStatus = (current, recommended) => {
    if (current < recommended * 0.3) return "low";
    if (current < recommended * 0.7) return "medium";
    return "good";
  };

  const refreshInventory = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setRefreshing(false)
      showSnackbar("Inventory refreshed")
    }, 1000)
  }

  const autoRestock = () => {
    const lowStockItemsList = inventory.filter((item) => item.status === "low");
  
    if (lowStockItemsList.length === 0) {
      showSnackbar("No items with low stock to restock.");
      return;
    }
  
    setLowStockItems(lowStockItemsList); // Store low-stock items
    setAutoRestockVendorModalVisible(true); // Show vendor selection modal
  };

  const confirmAutoRestock = () => {
    if (!selectedAutoRestockVendor) {
      showSnackbar("Please select a vendor for auto restock.");
      return;
    }
  
    const lowStockItems = inventory.filter((item) => item.status === "low");
  
    if (lowStockItems.length === 0) {
      showSnackbar("No items with low stock to restock.");
      return;
    }
  
    const restockDetails = lowStockItems.map((item) => {
      const restockQuantity = item.recommended - item.current;
  
      if (restockQuantity > 0) {
        const basePrice = 10 * restockQuantity; // Example: $10 per unit
        const deliveryFee = 5;
        const processingFee = Math.round(basePrice * 0.05 * 100) / 100; // 5% processing fee
        const totalAmount = basePrice + deliveryFee + processingFee;
  
        return {
          item,
          quantity: restockQuantity,
          vendor: selectedAutoRestockVendor,
          basePrice,
          deliveryFee,
          processingFee,
          totalAmount,
        };
      }
      return null;
    }).filter(Boolean); // Remove null entries
  
    if (restockDetails.length === 0) {
      showSnackbar("No restock needed for the selected items.");
      return;
    }
  
    // Set order details for all items and navigate to payment modal
    setOrderDetails(restockDetails);
    setAutoRestockVendorModalVisible(false);
    setPaymentModalVisible(true);
  };

  const scheduleLowStockNotification = async (items) => {
    const itemNames = items.map((item) => item.name).join(", ");
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Low Stock Alert",
        body: `The following items are low on stock: ${itemNames}`,
        data: { screen: "Inventory" },
      },
      trigger: { seconds: 3600 }, // Notify every hour
    });
  };

  // Check for notifications permission on component mount
  useEffect(() => {
    const requestNotificationPermission = async () => {
      const { status } = await Notifications.requestPermissionsAsync()
      if (status !== "granted") {
        alert("Please enable notifications for low stock alerts")
      }
    }

    requestNotificationPermission()
  }, [])

  const checkLowStockAndNotify = async () => {
    const lowStockItems = inventory.filter((item) => item.status === "low")

    if (lowStockItems.length > 0) {
      await scheduleLowStockNotification(lowStockItems)
    }
  }

  // Check for low stock whenever inventory changes
  useEffect(() => {
    checkLowStockAndNotify()
  }, [inventory])

  useEffect(() => {
    fetchInventory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true)
    fetchInventory()
    refreshInventory()
  }

  const showSnackbar = (message) => {
    setSnackbarMessage(message)
    setSnackbarVisible(true)
  }

  const handleRestock = (item) => {
    setSelectedItem(item)
    setCurrentlyRestockingItem(item)
    setRestockQuantity("")
    setSelectedVendor(null)
    setRestockModalVisible(true)
  }

  const confirmRestock = () => {
    if (!restockQuantity || isNaN(restockQuantity)) {
      showSnackbar("Please enter a valid quantity");
      return;
    }
  
    if (!selectedVendor) {
      showSnackbar("Please select a vendor");
      return;
    }
  
    const quantity = Number.parseInt(restockQuantity, 10);
    if (quantity <= 0) {
      showSnackbar("Quantity must be greater than 0");
      return;
    }
  
    // Calculate order details for the specific item
    const basePrice = 10 * quantity; // Example: $10 per unit
    const deliveryFee = 5;
    const processingFee = Math.round(basePrice * 0.05 * 100) / 100; // 5% processing fee
    const totalAmount = basePrice + deliveryFee + processingFee;
  
    const restockDetails = [
      {
        item: currentlyRestockingItem,
        quantity: quantity,
        vendor: selectedVendor,
        basePrice: basePrice,
        deliveryFee: deliveryFee,
        processingFee: processingFee,
        totalAmount: totalAmount,
      },
    ];
  
    // Set order details for payment modal
    setOrderDetails(restockDetails);
  
    // Close restock modal and open payment modal
    setRestockModalVisible(false);
    setPaymentModalVisible(true);
  };

  const confirmPayment = async () => {
    if (!orderDetails || !Array.isArray(orderDetails)) return;
  
    try {
      // Process each order detail
      for (const detail of orderDetails) {
        const item = detail.item;
        const newQuantity = item.current + detail.quantity;
        
        // Update the item in the backend
        await updateInventoryItem(item.id, newQuantity);
      }
      
      // Update the local inventory state
      const updatedInventory = inventory.map((item) => {
        const restockDetail = orderDetails.find((detail) => detail.item.id === item.id);
        if (restockDetail) {
          const newQuantity = item.current + restockDetail.quantity;
          let newStatus = getStatus(newQuantity, item.recommended);
    
          return {
            ...item,
            current: newQuantity,
            status: newStatus,
            lastRestocked: "Today",
          };
        }
        return item;
      });
    
      setInventory(updatedInventory);
      showSnackbar(
        `Payment successful! ${orderDetails.length} items will be delivered by ${orderDetails[0].vendor.name}.`
      );
      
    } catch (error) {
      console.error("Error updating inventory:", error);
      showSnackbar("Error updating inventory. Please try again.");
    } finally {
      setPaymentModalVisible(false);
      setOrderDetails(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "low":
        return "#ffebee"
      case "medium":
        return "#fff8e1"
      case "good":
        return "#e8f5e9"
      default:
        return "#f5f5f5"
    }
  }

  const getStatusTextColor = (status) => {
    switch (status) {
      case "low":
        return "#d32f2f"
      case "medium":
        return "#f57c00"
      case "good":
        return "#388e3c"
      default:
        return "#757575"
    }
  }

  const sortInventory = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "ascending" ? "descending" : "ascending")
    } else {
      setSortBy(field)
      setSortDirection("ascending")
    }
  }

  const filteredInventory = inventory
    .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      let comparison = 0

      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name)
      } else if (sortBy === "current") {
        comparison = a.current - b.current
      } else if (sortBy === "status") {
        const statusOrder = { low: 0, medium: 1, good: 2 }
        comparison = statusOrder[a.status] - statusOrder[b.status]
      }

      return sortDirection === "ascending" ? comparison : -comparison
    })

  // Calculate summary stats dynamically
  const summaryStats = inventory.reduce(
    (acc, item) => {
      if (item.status === "low") acc.low++
      if (item.status === "medium") acc.medium++
      if (item.status === "good") acc.good++
      return acc
    },
    { low: 0, medium: 0, good: 0 },
  )

  const paymentMethods = [
    { id: "grabpay", name: "GrabPay", icon: "wallet-outline" },
    { id: "card", name: "Credit/Debit Card", icon: "card-outline" },
    { id: "cod", name: "Cash on Delivery", icon: "cash-outline" },
  ]

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#10B981"]} tintColor="#10B981" />
      }
    >
      <ScrollView style={styles.container}>
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>Track and manage your stock levels</Text>
        </View>

        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <Card.Content>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Inventory Summary</Text>
            <View style={{ flexDirection: "row" }}>
              <Button
                mode="text"
                onPress={refreshInventory}
                disabled={isLoading}
                style={styles.refreshButton}
                labelStyle={{
                  color: "#10B981",
                }}
              >
                {isLoading ? (
                  <ActivityIndicator size={13} color="#10B981" />
                ) : (
                  <Ionicons name="refresh" size={13} color="#10B981" />
                )}{" "}
                Refresh
              </Button>
            </View>
          </View>

            <View style={styles.statsRow}>
              <View style={[styles.statItem, styles.lowStat]}>
                <Text style={styles.statValue}>
                  {inventory.filter((item) => item.status === "low").length}
                </Text>
                <Text style={styles.statLabel}>Low Stock</Text>
              </View>
              <View style={[styles.statItem, styles.mediumStat]}>
                <Text style={styles.statValue}>
                  {inventory.filter((item) => item.status === "medium").length}
                </Text>
                <Text style={styles.statLabel}>Medium Stock</Text>
              </View>
              <View style={[styles.statItem, styles.goodStat]}>
                <Text style={styles.statValue}>
                  {inventory.filter((item) => item.status === "good").length}
                </Text>
                <Text style={styles.statLabel}>Good Stock</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Inventory Table Card */}
        <Card style={styles.inventoryCard}>
        <Button
          mode="contained"
          onPress={autoRestock}
          style={styles.autoRestockButton}
          labelStyle={{
            color: "white",
          }}
        >
          Auto Restock
        </Button>
                
          <Card.Content>
            <Searchbar
              placeholder="Search by item name..."
              onChangeText={onChangeSearch}
              value={searchQuery}
              style={styles.searchBar}
              inputStyle={styles.searchInput}
              iconColor="#666"
              placeholderTextColor="#999"
            />

            {filteredInventory.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search" size={48} color="#ccc" />
                <Text style={styles.emptyStateText}>No items found</Text>
                <Text style={styles.emptyStateSubtext}>Try adjusting your search query</Text>
              </View>
            ) : (
              <View style={styles.tableContainer}>
                <View style={styles.tableWrapper}>
                  {/* Sticky left column for item names */}
                  <View style={styles.stickyColumn}>
                    <DataTable.Header style={styles.stickyHeader}>
                      <DataTable.Title
                        sortDirection={sortBy === "name" ? sortDirection : null}
                        onPress={() => sortInventory("name")}
                        style={styles.nameColumnHeader}
                      >
                        <Text style={styles.columnHeaderText}>Item</Text>
                      </DataTable.Title>
                    </DataTable.Header>
                    {filteredInventory.map((item) => (
                      <DataTable.Row key={`name-${item.id}`} style={styles.stickyCell}>
                        <DataTable.Cell style={styles.nameColumnCell}>
                          <View style={styles.itemNameContainer}>
                            <Text style={styles.itemNameText}>{item.name}</Text>
                          </View>
                        </DataTable.Cell>
                      </DataTable.Row>
                    ))}
                  </View>

                  {/* Scrollable portion */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <DataTable style={styles.scrollableTable}>

                      <DataTable.Header style ={styles.dataTableHeader}>
                        <DataTable.Title 

                          numeric
                          sortDirection={sortBy === "current" ? sortDirection : null}
                          onPress={() => sortInventory("current")}
                          style={styles.numberColumn}
                        >
                          <Text style={styles.columnHeaderText}>Current</Text>
                        </DataTable.Title>
                        <DataTable.Title numeric style={styles.numberColumn}>
                          <Text style={styles.columnHeaderText}>Recommended</Text>
                        </DataTable.Title>
                        <DataTable.Title
                          sortDirection={sortBy === "status" ? sortDirection : null}
                          onPress={() => sortInventory("status")}
                          style={styles.statusColumn}
                        >
                          <Text style={styles.columnHeaderText}>Status</Text>
                        </DataTable.Title>
                        <DataTable.Title style={styles.dateColumn}>
                          <Text style={styles.columnHeaderText}>Last Restocked</Text>
                        </DataTable.Title>
                        <DataTable.Title style={styles.actionColumn}>
                          <Text style={styles.columnHeaderText}>Action</Text>
                        </DataTable.Title>
                      </DataTable.Header>

                      {filteredInventory.map((item) => (
                        <DataTable.Row key={`data-${item.id}`} style={styles.dataRow}>
                          <DataTable.Cell numeric style={styles.numberColumn}>
                            <Text
                              style={[
                                styles.stockText,
                                item.current < item.recommended * 0.3 ? styles.lowStockText : null,
                                item.current >= item.recommended * 0.7 ? styles.goodStockText : null,
                              ]}
                            >
                              {item.current}
                            </Text>
                          </DataTable.Cell>
                          <DataTable.Cell numeric style={styles.numberColumn}>
                            <Text style={styles.stockText}>{item.recommended}</Text>
                          </DataTable.Cell>
                          <DataTable.Cell style={styles.statusColumn}>
                            <Chip
                              style={{
                                backgroundColor: getStatusColor(item.status),
                                borderColor: getStatusTextColor(item.status),
                                borderWidth: 1,
                              }}
                              textStyle={{
                                color: getStatusTextColor(item.status),
                                fontSize: 12,
                                fontWeight: "bold",
                              }}
                            >
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </Chip>
                          </DataTable.Cell>
                          <DataTable.Cell style={styles.dateColumn}>
                            <Text style={styles.dateText}>{item.lastRestocked}</Text>
                          </DataTable.Cell>
                          <DataTable.Cell style={styles.actionColumn}>

                          <Button
                            mode="text"
                            compact
                            onPress={() => handleRestock(item)}
                            style={[
                              styles.actionButton,
                              item.status === 'low' ? styles.restockNowButton : styles.orderMoreButton
                            ]}
                            labelStyle={[
                              styles.actionButtonLabel,
                              item.status === 'low' ? styles.restockNowLabel : styles.orderMoreLabel
                            ]}
                          >
                            {item.status === 'low' ? 'Restock Now' : 'Order More'}
                          </Button>
                          </DataTable.Cell>
                        </DataTable.Row>
                      ))}
                    </DataTable>
                  </ScrollView>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <Portal>
        <Dialog visible={restockModalVisible} onDismiss={() => setRestockModalVisible(false)}>
          <Dialog.Title>Restock Item</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              {currentlyRestockingItem?.name} (Current: {currentlyRestockingItem?.current})
            </Text>

            {/* Quantity Controls */}
            <View style={styles.quantityRow}>
              <TouchableOpacity
                onPress={() => setRestockQuantity(Math.max(1, (Number.parseInt(restockQuantity) || 0) - 1).toString())}
                style={[styles.circleButton, styles.decrementButton]}
                activeOpacity={0.5}
              >
                <Ionicons name="remove" size={40} color="#fff" />
              </TouchableOpacity>

              <TextInput
                label="Quantity"
                value={restockQuantity}
                onChangeText={setRestockQuantity}
                keyboardType="numeric"
                style={styles.quantityInput}
              />

              <TouchableOpacity
                onPress={() => setRestockQuantity(((Number.parseInt(restockQuantity) || 0) + 1).toString())}
                style={[styles.circleButton, styles.incrementButton]}
                activeOpacity={0.5}
              >
                <Ionicons name="add" size={40} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.recommendedText}>Recommended stock level: {currentlyRestockingItem?.recommended}</Text>

            {/* Vendor Selection */}
            <Text style={styles.vendorSectionTitle}>Select a GrabMart vendor:</Text>

            <FlatList
              data={grabMartVendors}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.vendorList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.vendorCard, selectedVendor?.id === item.id && styles.selectedVendorCard]}
                  onPress={() => setSelectedVendor(item)}
                >
                  <Image source={item.image} style={styles.vendorImage} />
                  <Text style={styles.vendorName}>{item.name}</Text>
                  <View style={styles.vendorRatingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.vendorRating}>{item.rating}</Text>
                  </View>
                  <Text style={styles.vendorDelivery}>{item.deliveryTime}</Text>

                  {selectedVendor?.id === item.id && (
                    <View style={styles.selectedVendorCheck}>
                      <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />

          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRestockModalVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={confirmRestock} style={styles.confirmRestockButton}>
              Confirm Restock
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog
          visible={autoRestockVendorModalVisible}
          onDismiss={() => setAutoRestockVendorModalVisible(false)}
        >
          <Dialog.Title>Select Vendors</Dialog.Title>
          <Dialog.Content>
            {/* Display low-stock items */}
            <Text style={styles.lowStockItemsTitle}>Items to be Restocked:</Text>
            <FlatList
              data={lowStockItems}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.lowStockItem}>
                  <Text style={styles.lowStockItemName}>{item.name}</Text>
                  <Text style={styles.lowStockItemQuantity}>
                    Current: {item.current}, Recommended: {item.recommended}
                  </Text>
                </View>
              )}
              style={styles.lowStockItemsList}
            />

            {/* Vendor selection */}
            <Text style={styles.vendorSectionTitle}>Select a Vendor:</Text>
            <FlatList
              data={grabMartVendors}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.vendorList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.vendorCard,
                    selectedAutoRestockVendor?.id === item.id && styles.selectedVendorCard,
                  ]}
                  onPress={() => setSelectedAutoRestockVendor(item)}
                >
                  <Image source={item.image} style={styles.vendorImage} />
                  <Text style={styles.vendorName}>{item.name}</Text>
                  <View style={styles.vendorRatingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.vendorRating}>{item.rating}</Text>
                  </View>
                  <Text style={styles.vendorDelivery}>{item.deliveryTime}</Text>

                  {selectedAutoRestockVendor?.id === item.id && (
                    <View style={styles.selectedVendorCheck}>
                      <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAutoRestockVendorModalVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={confirmAutoRestock} style={styles.confirmRestockButton}>
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog
          visible={paymentModalVisible}
          onDismiss={() => setPaymentModalVisible(false)}
          style={styles.paymentDialog}
        >
          <Dialog.Title>Payment Details</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={{ maxHeight: 400 }}>
            {orderDetails && Array.isArray(orderDetails) && (
              <>
                <View style={styles.orderSummary}>
                  <Text style={styles.orderSummaryTitle}>Order Summary</Text>
                  {orderDetails.map((detail, index) => (
                    <View key={index} style={styles.orderItem}>
                      <Text style={styles.orderItemName}>{detail.item.name}</Text>
                      <Text style={styles.orderItemQuantity}>x{detail.quantity}</Text>
                      <Text style={styles.orderItemPrice}>RM{detail.basePrice.toFixed(2)}</Text>
                    </View>
                  ))}

                  <View style={styles.vendorInfo}>
                    <Image source={orderDetails[0].vendor.image} style={styles.vendorInfoImage} />
                    <View style={styles.vendorInfoDetails}>
                      <Text style={styles.vendorInfoName}>{orderDetails[0].vendor.name}</Text>
                      <Text style={styles.vendorInfoDelivery}>Est. delivery: {orderDetails[0].vendor.deliveryTime}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.feesContainer}>
                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>Subtotal</Text>
                    <Text style={styles.feeValue}>
                      RM{orderDetails.reduce((sum, detail) => sum + detail.basePrice, 0).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>Delivery Fee</Text>
                    <Text style={styles.feeValue}>
                      RM{orderDetails.reduce((sum, detail) => sum + detail.deliveryFee, 0).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>Processing Fee (5%)</Text>
                    <Text style={styles.feeValue}>
                      RM{orderDetails.reduce((sum, detail) => sum + detail.processingFee, 0).toFixed(2)}
                    </Text>
                  </View>
                  <View style={[styles.feeRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>
                      RM{orderDetails.reduce((sum, detail) => sum + detail.totalAmount, 0).toFixed(2)}
                    </Text>
                  </View>
                </View>

                  <Text style={styles.paymentMethodTitle}>Select Payment Method</Text>
                  <View style={styles.paymentMethodsContainer}>
                    {paymentMethods.map((method) => (
                      <TouchableOpacity
                        key={method.id}
                        style={[
                          styles.paymentMethodCard,
                          selectedPaymentMethod === method.id && styles.selectedPaymentMethod,
                        ]}
                        onPress={() => setSelectedPaymentMethod(method.id)}
                      >
                        <Ionicons
                          name={method.icon}
                          size={24}
                          color={selectedPaymentMethod === method.id ? "#10B981" : "#666"}
                        />
                        <Text
                          style={[
                            styles.paymentMethodName,
                            selectedPaymentMethod === method.id && styles.selectedPaymentMethodText,
                          ]}
                        >
                          {method.name}
                        </Text>
                        {selectedPaymentMethod === method.id && (
                          <Ionicons name="checkmark-circle" size={18} color="#10B981" style={styles.paymentMethodCheck} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPaymentModalVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={confirmPayment} style={styles.confirmPaymentButton}>
              Pay Now
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Snackbar for feedback */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: "OK",
          onPress: () => setSnackbarVisible(false),
        }}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  header: {
    marginBottom: 20,
    paddingHorizontal: 8,
  },

  headerSubtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
  },
  summaryCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    borderColor: "#10B981",
    borderRadius: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    position: "relative",
  },
  lowStat: {
    backgroundColor: '#ffcfd6',
  },
  mediumStat: {
    backgroundColor: '#fae8ac',
  },
  goodStat: {
    backgroundColor: '#cdebb2',

  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
    textAlign:'center',
  },
  statIcon: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  inventoryCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  searchBar: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 1,
  },
  searchInput: {
    fontSize: 14,
    color: "#333",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableWrapper: {
    flexDirection: "row",
  },
  stickyColumn: {
    width: 140,
    backgroundColor: '#f5f5f5',
    zIndex: 10,
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  stickyHeader: {
    height: 48,
    backgroundColor: "#f7f7f7",
  },
  stickyCell: {
    minHeight: 52,
    backgroundColor: '#fff',
  },
  nameColumnHeader: {
    paddingLeft: 16,
    backgroundColor: 'transparent',
  },
  nameColumnCell: {
    paddingLeft: 2,
    alignItems: 'center',
  },
  dataTableHeader: {
    backgroundColor: '#f7f7f7',
    borderBottomWidth: 2,
  },
  itemNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemStatusIcon: {
    marginRight: 8,
  },
  itemNameText: {
    fontSize: 15,
    color: '#333',
  },
  columnHeaderText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#555',
  },
  scrollableTable: {
    minWidth: 520, 
    backgroundColor:'#fffff6',
  },
  dataRow: {
    minHeight: 52,
  },
  numberColumn: {
    width: 100,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  stockText: {
    fontSize: 16,
    color: '#333',
  },
  lowStockText: {
    color: "#d32f2f",
    fontWeight: "bold",
  },
  goodStockText: {
    color: "#388e3c",
  },
  statusColumn: {
    width: 120,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  dateColumn: {
    width: 125,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#555',
  },
  actionColumn: {
    width: 140,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  snackbar: {
    backgroundColor: '#333',
  },
  actionButton: {
    minWidth: 100,
    borderRadius: 6,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  actionButtonLabel: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.25,
  },

  // Status-specific styles
  restockNowButton: {
    backgroundColor: '#ffcfd6', // Light red background
    borderRadius: 20,
  },
  restockNowLabel: {
    color: '#d32f2f',
  },
  orderMoreButton: {
    borderRadius: 20,
  },
  orderMoreLabel: {
    color: '#10B981',

  },
  dialogText: {
    fontSize: 16,
    marginBottom: 16,
  },
  recommendedText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  confirmRestockButton: {
    backgroundColor: "#10B981",
  },
  quantityInput: {
    flex: 1,
    marginHorizontal: 0,
    textAlign: "center",
  },

  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  circleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  decrementButton: {
    backgroundColor: "#AFACE1",
  },
  incrementButton: {
    backgroundColor: "#AFACE1",
  },
  quantityInput: {
    flex: 1,
    marginHorizontal: 15,
    textAlign: "center",
    fontSize: 27,
  },
  confirmButton: {
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingVertical: 5,
  },
  confirmButtonLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  vendorSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 12,
    color: "#333",
  },
  vendorList: {
    paddingVertical: 8,
  },
  vendorCard: {
    width: 140,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    position: "relative",
  },
  selectedVendorCard: {
    borderColor: "#10B981",
    backgroundColor: "#f0fdf4",
  },
  vendorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  vendorName: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  vendorRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  vendorRating: {
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  vendorDelivery: {
    fontSize: 12,
    color: "#666",
  },
  selectedVendorCheck: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "white",
    borderRadius: 12,
    elevation: 2,
  },
  paymentDialog: {
    maxWidth: 400,
    width: "90%",
    alignSelf: "center",
  },
  orderSummary: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  orderSummaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 12,
  },
  orderItemName: {
    flex: 2,
    fontSize: 14,
    fontWeight: "500",
  },
  orderItemQuantity: {
    flex: 1,
    fontSize: 14,
    textAlign: "center",
    color: "#666",
  },
  orderItemPrice: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "right",
  },
  vendorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  vendorInfoImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  vendorInfoDetails: {
    flex: 1,
  },
  vendorInfoName: {
    fontSize: 14,
    fontWeight: "500",
  },
  vendorInfoDelivery: {
    fontSize: 12,
    color: "#666",
  },
  feesContainer: {
    marginBottom: 20,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  feeLabel: {
    fontSize: 14,
    color: "#666",
  },
  feeValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#10B981",
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  paymentMethodsContainer: {
    marginBottom: 16,
  },
  paymentMethodCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  selectedPaymentMethod: {
    borderColor: "#10B981",
    backgroundColor: "#f0fdf4",
  },
  paymentMethodName: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  selectedPaymentMethodText: {
    fontWeight: "500",
    color: "#10B981",
  },
  paymentMethodCheck: {
    marginLeft: 8,
  },
  confirmPaymentButton: {
    backgroundColor: "#10B981",
  },
  autoRestockButton: {
    backgroundColor: "#10B981",
    marginLeft: 8,
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  lowStockItemsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  lowStockItemsList: {
    marginBottom: 16,
  },
  lowStockItem: {
    marginBottom: 8,
  },
  lowStockItemName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  lowStockItemQuantity: {
    fontSize: 12,
    color: "#666",
  },
})

