# AccountMetrics Component

A WeChat Mini Program component that displays user account metrics (balance, points, cards, coupons) in a responsive grid layout with loading states and tap interactions.

## Features

- **Grid Layout**: Displays 4 metrics in a responsive grid
- **Number Formatting**: Intelligent formatting for different value types
- **Loading States**: Skeleton loading animations
- **Tap Interactions**: Navigation to detail pages
- **Responsive Design**: Adapts to different screen sizes

## Usage

### Basic Usage

```xml
<account-metrics 
  metrics="{{accountMetrics}}"
  loading="{{isLoading}}"
  bind:metricTap="onMetricTap"
/>
```

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `metrics` | `AccountMetrics` | `{balance: 0, points: 0, cards: 0, coupons: 0}` | Account metrics data |
| `loading` | `boolean` | `false` | Loading state for skeleton display |

### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `metricTap` | `{type: AccountMetricType}` | Triggered when a metric item is tapped |

### Data Types

```typescript
interface AccountMetrics {
  balance: number;    // Account balance in currency
  points: number;     // Loyalty points
  cards: number;      // Number of cards
  coupons: number;    // Number of coupons
}

type AccountMetricType = 'balance' | 'points' | 'cards' | 'coupons';
```

## Number Formatting

The component automatically formats numbers based on their type and value:

### Currency (Balance)
- `0` → `¥0`
- `10.50` → `¥10.50`
- `1000` → `¥1,000.00`
- `12345.67` → `¥12,345.67`

### Regular Numbers (Points, Cards, Coupons)
- `0` → `0`
- `100` → `100`
- `1000` → `1,000`
- `10000` → `1.0万`
- `150000` → `15万`

## Styling

The component uses SCSS with the following key features:

- **Grid Layout**: 4-column responsive grid
- **Loading Animation**: Shimmer effect for skeleton states
- **Touch Feedback**: Visual feedback on tap
- **Responsive**: Adapts to screen sizes < 375px

### CSS Classes

- `.account-metrics` - Main container
- `.metrics-grid` - Grid container
- `.metric-item` - Individual metric item
- `.metric-content` - Content wrapper
- `.metric-value` - Value display
- `.metric-skeleton` - Loading skeleton
- `.metric-label` - Label text

## Examples

### Page Integration

```typescript
// In your page
Page({
  data: {
    accountMetrics: {
      balance: 1250.50,
      points: 15000,
      cards: 3,
      coupons: 8
    },
    isLoading: false
  },

  onMetricTap(event: any) {
    const { type } = event.detail;
    
    switch (type) {
      case 'balance':
        wx.navigateTo({ url: '/pages/balance/index' });
        break;
      case 'points':
        wx.navigateTo({ url: '/pages/points/index' });
        break;
      case 'cards':
        wx.navigateTo({ url: '/pages/cards/index' });
        break;
      case 'coupons':
        wx.navigateTo({ url: '/pages/coupons/index' });
        break;
    }
  }
});
```

### Loading State

```typescript
// Show loading while fetching data
this.setData({ isLoading: true });

// Fetch account metrics
try {
  const metrics = await accountService.getMetrics();
  this.setData({ 
    accountMetrics: metrics,
    isLoading: false 
  });
} catch (error) {
  this.setData({ isLoading: false });
  // Handle error
}
```

## Testing

The component includes comprehensive unit tests covering:

- Component initialization
- Number formatting logic
- Metric items update
- Tap event handling
- Loading states
- Edge cases

Run tests:
```bash
# Jest tests
npm test account-metrics

# Simple test runner
node mall/miniprogram/components/account-metrics/test-runner-simple.js
```

## Requirements Fulfilled

This component fulfills the following requirements:

- **1.3**: Display account balance, points, cards, and coupons with counts
- **1.4**: Navigate to corresponding detail page when tapping metrics

## Dependencies

- WeChat Mini Program Component System
- TypeScript support
- SCSS preprocessing
- Account models (`../../models/account`)