# ServiceMenu Component

A reusable service menu component for the WeChat Mini Program mall application that displays a list of service options with navigation and action capabilities.

## Features

- **List Layout**: Clean list-based layout with consistent spacing
- **Service Items**: Supports Task Center, Delivery Address, Call Merchant, Personal Information, and Account Security
- **Navigation**: Handles page navigation for different services
- **Phone Call**: Integrated phone call functionality for merchant contact
- **Touch Feedback**: Hover states and visual feedback for better user experience
- **Customizable**: Configurable merchant phone number

## Usage

```xml
<service-menu 
  merchantPhone="{{merchantPhone}}"
  bind:serviceTap="onServiceTap"
/>
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| merchantPhone | String | '400-123-4567' | Merchant phone number for call functionality |

## Events

| Event | Description | Event Detail |
|-------|-------------|--------------|
| serviceTap | Triggered when a service item is tapped | `{ serviceId: string, service: object }` |

## Service Items

The component displays the following service items:

1. **任务中心 (Task Center)** - Navigates to task center page
2. **收货地址 (Delivery Address)** - Navigates to address management page
3. **拨打商家电话 (Call Merchant)** - Initiates phone call to merchant
4. **个人信息 (Personal Information)** - Navigates to personal info page
5. **账号与安全 (Account & Security)** - Navigates to account security page

## Styling

The component uses SCSS for styling with the following key features:

- Rounded corners and clean white background
- Consistent spacing and typography
- Icon support with SVG-based icons
- Hover states for better touch feedback
- Separator lines between items
- Right arrow indicators

## Methods

### Public Methods

None. The component handles all interactions internally and communicates through events.

### Private Methods

- `_handleCallMerchant()` - Handles phone call functionality with confirmation modal
- `_navigateToPage(page)` - Handles navigation to specified pages
- `_getIconClass(iconName)` - Returns appropriate icon class for service items

## Error Handling

The component includes comprehensive error handling for:

- Missing service data
- Navigation failures
- Phone call failures
- Missing phone numbers
- Unknown service actions

## Testing

Run the component tests using:

```bash
node test-runner-simple.js
```

The test suite covers:

- Component definition and structure
- Service item tap handling
- Call merchant functionality
- Navigation functionality
- Error handling scenarios
- Lifecycle methods

## Dependencies

- WeChat Mini Program API
- Constants from `../../constants/profile`
- SCSS for styling

## Browser Support

This component is designed specifically for WeChat Mini Program environment and requires WeChat Mini Program runtime.

## Accessibility

The component follows WeChat Mini Program accessibility guidelines:

- Appropriate touch target sizes (minimum 44rpx)
- Visual feedback for interactions
- Semantic HTML structure
- Color contrast compliance

## Performance

- Lightweight implementation with minimal dependencies
- Efficient event handling
- Optimized for WeChat Mini Program runtime
- SVG icons for crisp display on all screen densities