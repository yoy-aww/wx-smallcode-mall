# OrderSection Component

A WeChat Mini Program component that displays order management interface with status categories and navigation options.

## Features

- **Order Status Display**: Shows 5 order status categories with Chinese labels
- **Badge System**: Displays order counts with badges (shows "99+" for counts > 99)
- **Horizontal Scrolling**: Scrollable layout for order status icons
- **Loading States**: Skeleton loading animation during data fetch
- **Navigation**: "View All Orders" link and individual status navigation
- **Responsive Design**: Adapts to different screen sizes

## Usage

### Basic Implementation

```xml
<!-- In your page WXML -->
<order-section 
  orderCounts="{{orderCounts}}"
  loading="{{loading}}"
  bind:viewAllOrders="onViewAllOrders"
  bind:orderStatusTap="onOrderStatusTap"
/>
```

### Page Logic

```typescript
// In your page TypeScript file
Page({
  data: {
    orderCounts: {
      pending_payment: 2,
      pending_shipment: 1,
      pending_receipt: 3,
      pending_review: 0,
      refund_aftersales: 1,
      total: 7
    },
    loading: false
  },

  onViewAllOrders() {
    wx.navigateTo({
      url: '/pages/orders/index'
    });
  },

  onOrderStatusTap(event) {
    const { status } = event.detail;
    wx.navigateTo({
      url: `/pages/orders/index?status=${status}`
    });
  }
});
```

### Component Registration

```json
{
  "usingComponents": {
    "order-section": "/components/order-section/order-section"
  }
}
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `orderCounts` | `OrderCounts` | `{pending_payment: 0, pending_shipment: 0, pending_receipt: 0, pending_review: 0, refund_aftersales: 0, total: 0}` | Order counts for each status |
| `loading` | `Boolean` | `false` | Loading state indicator |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `viewAllOrders` | `{}` | Triggered when "View All Orders" is tapped |
| `orderStatusTap` | `{status: OrderStatus}` | Triggered when an order status item is tapped |

## Order Status Types

The component supports 5 order status categories:

- `pending_payment` - 待付款 (Pending Payment)
- `pending_shipment` - 待发货 (Pending Shipment)  
- `pending_receipt` - 待收货 (Pending Receipt)
- `pending_review` - 待评价 (Pending Review)
- `refund_aftersales` - 退款售后 (Refund/After-sales)

## Data Types

```typescript
interface OrderCounts {
  pending_payment: number;
  pending_shipment: number;
  pending_receipt: number;
  pending_review: number;
  refund_aftersales: number;
  total: number;
}

type OrderStatus = 
  | 'pending_payment' 
  | 'pending_shipment' 
  | 'pending_receipt' 
  | 'pending_review' 
  | 'refund_aftersales';
```

## Styling

The component uses SCSS with the following key classes:

- `.order-section` - Main container
- `.order-section__header` - Section header with title and "View All" link
- `.order-section__status-list` - Horizontal scrollable status list
- `.order-section__status-item` - Individual status item
- `.order-section__badge` - Order count badge
- `.order-section__loading-skeleton` - Loading animation

## Icons

The component expects order status icons to be located at:
```
/images/icons/order-{icon}.svg
```

Where `{icon}` corresponds to:
- `payment` - for pending_payment
- `shipment` - for pending_shipment
- `receipt` - for pending_receipt
- `review` - for pending_review
- `refund` - for refund_aftersales

## Testing

Run the component tests:

```bash
cd components/order-section
node test-runner-simple.js
```

The test suite covers:
- Component initialization
- Order status items generation
- Event handling
- Loading states
- Data validation
- Error handling

## Requirements Fulfilled

This component fulfills the following requirements from the user profile page specification:

- **2.1**: Display "我的订单" (My Orders) section
- **2.2**: Navigate to complete order list when "查看全部订单" is tapped
- **2.3**: Display order status categories with Chinese labels
- **2.4**: Navigate to filtered order lists when status categories are tapped
- **2.5**: Display badge with order counts for each status

## Browser Support

Compatible with WeChat Mini Program runtime environment.