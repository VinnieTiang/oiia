import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, Button, DataTable, Chip, ActivityIndicator, Searchbar, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Sample inventory data
const inventoryData = [
  { id: 1, name: "Chicken Rice", current: 5, recommended: 20, status: "low", lastRestocked: "2 days ago" },
  { id: 2, name: "Nasi Lemak", current: 3, recommended: 15, status: "low", lastRestocked: "3 days ago" },
  { id: 3, name: "Mee Goreng", current: 12, recommended: 15, status: "medium", lastRestocked: "1 day ago" },
  { id: 4, name: "Roti Canai", current: 25, recommended: 20, status: "good", lastRestocked: "Today" },
  { id: 5, name: "Teh Tarik", current: 30, recommended: 25, status: "good", lastRestocked: "Today" },
  { id: 6, name: "Satay", current: 8, recommended: 15, status: "medium", lastRestocked: "2 days ago" },
  { id: 7, name: "Curry Puff", current: 4, recommended: 20, status: "low", lastRestocked: "4 days ago" },
  { id: 8, name: "Iced Coffee", current: 18, recommended: 20, status: "medium", lastRestocked: "Yesterday" },
];

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
    // In a real app, this would open a restock modal or navigation
    showSnackbar(`Restock initiated for ${item.name}`);
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
    <SafeAreaView style={styles.container}>
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
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Inventory Management</Text>
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
                      <DataTable.Header>
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
                              labelStyle={{
                                color: item.status === 'low' ? '#d32f2f' : '#10B981',
                                fontSize: 12,
                              }}
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

        {/* Quick Actions Card */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Text style={styles.actionsTitle}>Quick Actions</Text>
            <View style={styles.actionButtons}>
              <Button 
                mode="contained" 
                onPress={() => showSnackbar('Order supplies action')}
                style={[styles.actionButton, styles.primaryAction]}
                labelStyle={styles.actionButtonLabel}
                icon="cart"
              >
                Order Supplies
              </Button>
              <Button 
                mode="contained-tonal" 
                onPress={() => showSnackbar('Export report action')}
                style={[styles.actionButton, styles.secondaryAction]}
                labelStyle={styles.actionButtonLabel}
                icon="download"
              >
                Export Report
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

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
    </SafeAreaView>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    borderColor: '#10B981',
    borderRadius: 20,
  },
  refreshButtonLabel: {
    fontSize: 13,
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
    backgroundColor: '#ffebee',
  },
  mediumStat: {
    backgroundColor: '#fff8e1',
  },
  goodStat: {
    backgroundColor: '#e8f5e9',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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
    backgroundColor: '#fff',
    zIndex: 10,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  stickyHeader: {
    height: 48,
    backgroundColor: '#f7f7f7',
  },
  stickyCell: {
    minHeight: 60,
    backgroundColor: '#fff',
  },
  nameColumnHeader: {
    paddingLeft: 16,
  },
  nameColumnCell: {
    paddingLeft: 16,
  },
  itemNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemStatusIcon: {
    marginRight: 8,
  },
  itemNameText: {
    fontSize: 14,
    color: '#333',
  },
  columnHeaderText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#555',
  },
  scrollableTable: {
    minWidth: 520, 
  },
  dataRow: {
    minHeight: 60,
  },
  numberColumn: {
    width: 100,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  stockText: {
    fontSize: 14,
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
    width: 120,
    paddingHorizontal: 8,
  },
  dateText: {
    fontSize: 13,
    color: '#555',
  },
  actionColumn: {
    width: 140,
    paddingHorizontal: 8,
  },
  actionButton: {
    borderRadius: 6,
    paddingVertical: 2,
    backgroundColor: 'transparent', // Make background transparent
  },
  actionButtonLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  restockButton: {
    borderColor: '#e04652', // Border color for restock
  },
  restockButtonLabel: {
    color: '#e04652', // Text color for Restock Now button
  },
  orderButton: {
    borderColor: '#1cb861', // Border color for order
  },
  orderButtonLabel: {
    color: '#1cb861', // Text color for Order More button
  },
  actionsCard: {
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryAction: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#10B981',
  },
  secondaryAction: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#e0e0e0',
  },
  snackbar: {
    backgroundColor: '#333',
  },
});