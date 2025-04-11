import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, RefreshControl, Modal, TextInput} from 'react-native';
import { Text, Card, Button, DataTable, Chip, ActivityIndicator, Searchbar, Snackbar, Portal, Dialog, TextInput as PaperTextInput  } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

// Sample inventory data
const inventoryData = [
  { id: 1, name: "Chicken thigh", current: 5, recommended: 20, status: "low", lastRestocked: "2 days ago" },
  { id: 2, name: "Jasmine rice", current: 3, recommended: 15, status: "low", lastRestocked: "3 days ago" },
  { id: 3, name: "Egg", current: 12, recommended: 15, status: "medium", lastRestocked: "1 day ago" },
  { id: 4, name: "Ginger", current: 25, recommended: 20, status: "good", lastRestocked: "Today" },
  { id: 5, name: "Garlic", current: 30, recommended: 25, status: "good", lastRestocked: "Today" },
  { id: 6, name: "Cucumber", current: 8, recommended: 15, status: "medium", lastRestocked: "2 days ago" },
  { id: 7, name: "Chili sauce", current: 4, recommended: 20, status: "low", lastRestocked: "4 days ago" },
  { id: 8, name: "Soy sauce", current: 18, recommended: 20, status: "medium", lastRestocked: "Yesterday" },
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function InventoryScreen() {
  const [inventory, setInventory] = useState(inventoryData);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('ascending');
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [restockModalVisible, setRestockModalVisible] = useState(false);
  const [restockQuantity, setRestockQuantity] = useState('');
  const [currentlyRestockingItem, setCurrentlyRestockingItem] = useState(null);


  const onChangeSearch = query => setSearchQuery(query);

  const refreshInventory = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setRefreshing(false);
      showSnackbar('Inventory refreshed');
    }, 1000);
  };

  const scheduleLowStockNotification = async (items) => {
    const itemNames = items.map(item => item.name).join(', ');
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Low Stock Alert',
        body: `The following items are low on stock: ${itemNames}`,
        data: { screen: 'Inventory' },
      },
      trigger: null, // Send immediately
    });
  };

  // Check for notifications permission on component mount
  useEffect(() => {
    const requestNotificationPermission = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Please enable notifications for low stock alerts');
      }
    };

    requestNotificationPermission();
  }, []);

  const checkLowStockAndNotify = async () => {
    const lowStockItems = inventory.filter(item => item.status === 'low');
    
    if (lowStockItems.length > 0) {
      await scheduleLowStockNotification(lowStockItems);
    }
  };

  // Check for low stock whenever inventory changes
  useEffect(() => {
    checkLowStockAndNotify();
  }, [inventory]);

  const onRefresh = () => {
    setRefreshing(true);
    refreshInventory();
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleRestock = (item) => {
    setSelectedItem(item);
    setCurrentlyRestockingItem(item);
    setRestockQuantity('');
    setRestockModalVisible(true);
  };

  const confirmRestock = () => {
    if (!restockQuantity || isNaN(restockQuantity)) {
      showSnackbar('Please enter a valid quantity');
      return;
    }

    const quantity = parseInt(restockQuantity, 10);
    if (quantity <= 0) {
      showSnackbar('Quantity must be greater than 0');
      return;
    }

    // Update the inventory
    const updatedInventory = inventory.map(item => {
      if (item.id === currentlyRestockingItem.id) {
        const newQuantity = item.current + quantity;
        let newStatus = item.status;
        
        // Determine new status based on restocked quantity
        if (newQuantity >= item.recommended * 0.7) {
          newStatus = 'good';
        } else if (newQuantity >= item.recommended * 0.3) {
          newStatus = 'medium';
        } else {
          newStatus = 'low';
        }

        return {
          ...item,
          current: newQuantity,
          status: newStatus,
          lastRestocked: 'Today'
        };
      }
      return item;
    });

    setInventory(updatedInventory);
    showSnackbar(`Successfully restocked ${quantity} ${currentlyRestockingItem.name}`);
    setRestockModalVisible(false);
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'low':
        return '#ffebee';
      case 'medium':
        return '#fff8e1';
      case 'good':
        return '#e8f5e9';
      default:
        return '#f5f5f5';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'low':
        return '#d32f2f';
      case 'medium':
        return '#f57c00';
      case 'good':
        return '#388e3c';
      default:
        return '#757575';
    }
  };

  const sortInventory = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'ascending' ? 'descending' : 'ascending');
    } else {
      setSortBy(field);
      setSortDirection('ascending');
    }
  };

  const filteredInventory = inventory
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'current') {
        comparison = a.current - b.current;
      } else if (sortBy === 'status') {
        const statusOrder = { low: 0, medium: 1, good: 2 };
        comparison = statusOrder[a.status] - statusOrder[b.status];
      }
      
      return sortDirection === 'ascending' ? comparison : -comparison;
    });

  // Calculate summary stats dynamically
  const summaryStats = inventory.reduce((acc, item) => {
    if (item.status === 'low') acc.low++;
    if (item.status === 'medium') acc.medium++;
    if (item.status === 'good') acc.good++;
    return acc;
  }, { low: 0, medium: 0, good: 0 });

  return (
    <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#10B981']}
            tintColor="#10B981"
          />
        }
      >
    <ScrollView  style={styles.container}>
      
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>Track and manage your stock levels</Text>
        </View>

        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Inventory Summary</Text>
              <Button 
                mode="text" 
                onPress={refreshInventory} 
                disabled={isLoading}
                style={styles.refreshButton}
                labelStyle={{
                  color: '#10B981',
                }}
              >
                {isLoading ? (
                  <ActivityIndicator size={13} color="#10B981" />
                ) : (
                  <Ionicons name="refresh" size={13} color="#10B981" />
                )}
                {' '}Refresh
              </Button>
            </View>
            
            <View style={styles.statsRow}>
              <View style={[styles.statItem, styles.lowStat]}>
                <Text style={styles.statValue}>{summaryStats.low}</Text>
                <Text style={styles.statLabel}>Low Stock</Text>
              </View>
              <View style={[styles.statItem, styles.mediumStat]}>
                <Text style={styles.statValue}>{summaryStats.medium}</Text>
                <Text style={styles.statLabel}>Medium Stock</Text>
              </View>
              <View style={[styles.statItem, styles.goodStat]}>
                <Text style={styles.statValue}>{summaryStats.good}</Text>
                <Text style={styles.statLabel}>Good Stock</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Inventory Table Card */}
        <Card style={styles.inventoryCard}>
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
                        sortDirection={sortBy === 'name' ? sortDirection : null}
                        onPress={() => sortInventory('name')}
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
                          sortDirection={sortBy === 'current' ? sortDirection : null}
                          onPress={() => sortInventory('current')}
                          style={styles.numberColumn}
                        >
                          <Text style={styles.columnHeaderText}>Current</Text>
                        </DataTable.Title>
                        <DataTable.Title 
                          numeric
                          style={styles.numberColumn}
                        >
                          <Text style={styles.columnHeaderText}>Recommended</Text>
                        </DataTable.Title>
                        <DataTable.Title 
                          sortDirection={sortBy === 'status' ? sortDirection : null}
                          onPress={() => sortInventory('status')}
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
                            <Text style={[
                              styles.stockText,
                              item.current < item.recommended * 0.3 ? styles.lowStockText : null,
                              item.current >= item.recommended * 0.7 ? styles.goodStockText : null
                            ]}>
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
                                fontWeight: 'bold',
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
          onPress={() => setRestockQuantity(Math.max(1, (parseInt(restockQuantity) || 0) - 1).toString())}
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
          onPress={() => setRestockQuantity(((parseInt(restockQuantity) || 0) + 1).toString())}
          style={[styles.circleButton, styles.incrementButton]}
          activeOpacity={0.5}
        >
          <Ionicons name="add" size={40} color="#fff" />
        </TouchableOpacity>
      </View>
            <Text style={styles.recommendedText}>
              Recommended stock level: {currentlyRestockingItem?.recommended}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRestockModalVisible(false)}>
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={confirmRestock}
              style={styles.confirmRestockButton}
            >
              Confirm Restock
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
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    borderColor: '#10B981',
    borderRadius: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    position: 'relative',
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
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
    textAlign:'center',
  },
  statIcon: {
    position: 'absolute',
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
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1,
  },
  searchInput: {
    fontSize: 14,
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableWrapper: {
    flexDirection: 'row',
  },
  stickyColumn: {
    width: 140,
    backgroundColor: '#f5f5f5',
    zIndex: 10,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  stickyHeader: {
    height: 48,
    backgroundColor: '#f7f7f7',
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
    flexDirection: 'row',
    alignItems: 'center',
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
    justifyContent: 'center',
  },
  stockText: {
    fontSize: 16,
    color: '#333',
  },
  lowStockText: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  goodStockText: {
    color: '#388e3c',
  },
  statusColumn: {
    width: 120,
    paddingHorizontal: 8,
    justifyContent: 'center',
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
    color: '#666',
    marginTop: 8,
  },
  confirmRestockButton: {
    backgroundColor: '#10B981',
  },
  quantityInput: {
    flex: 1,
    marginHorizontal: 0,
    textAlign: 'center',
  },

  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  circleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  decrementButton: {
    backgroundColor: '#AFACE1', 
  },
  incrementButton: {
    backgroundColor: '#AFACE1', 
  },
  quantityInput: {
    flex: 1,
    marginHorizontal: 15,
    textAlign: 'center',
    fontSize: 27,
  },
});