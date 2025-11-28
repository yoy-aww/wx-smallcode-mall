# Data Services Implementation

This directory contains the data services for the user profile page, implementing caching, error handling, and retry mechanisms as specified in the requirements.

## Services Overview

### UserService
Handles user authentication and profile management with the following features:
- **Authentication**: Login/logout functionality with token management
- **Profile Management**: Get and update user profile information
- **Caching**: 5-minute cache duration for user data
- **Error Handling**: Retry mechanism with exponential backoff
- **Offline Support**: Returns cached data when network is unavailable

**Key Methods:**
- `isLoggedIn()`: Check if user is currently logged in
- `getCurrentUser()`: Get current user information with caching
- `login(phone, code)`: Authenticate user and store session
- `logout()`: Clear authentication data
- `getUserProfile(userId)`: Get user profile details
- `updateUserProfile(userId, profile)`: Update user profile

### AccountService
Manages account balance, points, cards, and coupons data:
- **Metrics Retrieval**: Get account metrics with caching
- **Balance Management**: Update account balance
- **Points Management**: Update user points
- **Caching**: 2-minute cache duration for account data
- **Error Handling**: Retry mechanism with fallback to cached data
- **Offline Support**: Returns cached or default values when offline

**Key Methods:**
- `getAccountMetrics(userId)`: Get account metrics (balance, points, cards, coupons)
- `getAccount(userId)`: Get full account information
- `updateBalance(userId, amount)`: Update account balance
- `updatePoints(userId, points)`: Update user points
- `refreshAccountData(userId)`: Force refresh from server

### OrderService
Handles order count retrieval and management:
- **Order Counts**: Get order counts by status
- **Order Retrieval**: Get orders by status or all orders
- **Caching**: 3-minute cache duration for order data
- **Error Handling**: Retry mechanism with fallback to cached data
- **Offline Support**: Returns cached or empty arrays when offline

**Key Methods:**
- `getOrderCounts(userId)`: Get order counts by status
- `getOrdersByStatus(userId, status)`: Get orders filtered by status
- `getAllOrders(userId)`: Get all orders for user
- `refreshOrderCounts(userId)`: Force refresh order counts from server

## Architecture Features

### Singleton Pattern
All services implement the singleton pattern to ensure single instances throughout the application lifecycle.

### Caching Strategy
- **Local Storage**: Uses WeChat Mini Program's `wx.getStorageSync/setStorageSync`
- **Cache Duration**: Different durations for different data types
- **Cache Validation**: Timestamp-based cache expiration
- **Cache Fallback**: Returns cached data when network requests fail

### Error Handling
- **Retry Mechanism**: Up to 3 retry attempts with exponential backoff
- **Graceful Degradation**: Returns cached or default data on failures
- **Error Logging**: Comprehensive error logging for debugging
- **Network Error Handling**: Specific handling for network failures

### Offline Support
- **Cached Data**: Returns cached data when offline
- **Default Values**: Provides sensible defaults when no cache exists
- **Graceful Failures**: Never throws errors for missing data

## Usage Examples

### Basic Usage
```typescript
import { ServiceFactory } from './services';

// Get service instances
const userService = ServiceFactory.getUserService();
const accountService = ServiceFactory.getAccountService();
const orderService = ServiceFactory.getOrderService();

// Check login status
const isLoggedIn = userService.isLoggedIn();

// Get account metrics
const metrics = await accountService.getAccountMetrics('user123');

// Get order counts
const orderCounts = await orderService.getOrderCounts('user123');
```

### Error Handling
```typescript
try {
  const user = await userService.getCurrentUser();
  if (user) {
    const metrics = await accountService.getAccountMetrics(user.id);
    // Use metrics...
  }
} catch (error) {
  console.error('Failed to load user data:', error);
  // Handle error gracefully
}
```

### Cache Management
```typescript
// Force refresh data
await accountService.refreshAccountData('user123');
await orderService.refreshOrderCounts('user123');
```

## Testing

### Unit Tests
Comprehensive unit tests are provided for all services:
- **Mock Implementation**: Uses Jest mocks for WeChat APIs
- **Error Scenarios**: Tests error handling and retry mechanisms
- **Cache Testing**: Validates caching behavior
- **Edge Cases**: Tests various edge cases and error conditions

### Running Tests
```bash
# Run with Jest (if available)
npm test

# Run with simple test runner
node tests/test-runner.js
```

### Test Coverage
- ✅ Authentication flows
- ✅ Data retrieval with caching
- ✅ Error handling and retries
- ✅ Cache validation and expiration
- ✅ Offline behavior
- ✅ API response handling

## Configuration

### API Base URL
Update the API base URL in each service:
```typescript
// Replace with actual API base URL
url: `https://api.example.com${url}`
```

### Cache Durations
Cache durations can be adjusted in each service:
```typescript
private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

### Retry Configuration
Retry behavior can be customized:
```typescript
private readonly MAX_RETRIES = 3;
private readonly RETRY_DELAY = 1000; // 1 second
```

## Requirements Mapping

This implementation addresses the following requirements:

**Requirement 1.1, 1.2**: User authentication and profile display
- ✅ UserService handles login/logout and profile management
- ✅ Caching ensures quick access to user data

**Requirement 1.3, 1.4**: Account metrics display
- ✅ AccountService provides balance, points, cards, and coupons data
- ✅ Caching and error handling ensure reliable data access

**Requirement 2.1-2.5**: Order management
- ✅ OrderService provides order counts and order retrieval
- ✅ Supports all order status categories
- ✅ Caching ensures quick access to order data

## Performance Considerations

- **Minimal Network Requests**: Aggressive caching reduces API calls
- **Fast Response Times**: Cached data provides immediate responses
- **Memory Efficiency**: Uses WeChat's built-in storage APIs
- **Error Recovery**: Graceful handling prevents app crashes

## Security Considerations

- **Token Management**: Secure storage and handling of authentication tokens
- **Data Validation**: Input validation for all API requests
- **Error Information**: Careful error message handling to avoid information leakage
- **Cache Security**: Sensitive data is properly managed in local storage