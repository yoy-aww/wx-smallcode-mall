# UserHeader Component

A WeChat Mini Program component that displays user profile information in the header section of the profile page.

## Features

- **Login/Logout State Handling**: Displays different UI based on user authentication status
- **Avatar Display**: Shows user avatar with fallback image support
- **Membership Level Badge**: Displays user membership level with styled badge
- **Login Prompt**: Shows call-to-action for non-authenticated users
- **Responsive Design**: Adapts to different screen sizes
- **Accessibility**: Follows WeChat Mini Program accessibility guidelines

## Usage

### Basic Usage

```xml
<user-header 
  isLoggedIn="{{isLoggedIn}}"
  userInfo="{{userInfo}}"
  bind:login="onLogin"
  bind:avatarTap="onAvatarTap"
/>
```

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `isLoggedIn` | Boolean | `false` | Whether the user is currently logged in |
| `userInfo` | Object | `null` | User information object (see UserInfo structure below) |

### UserInfo Structure

```javascript
{
  avatar: "string",        // User avatar URL
  nickname: "string",      // User display name
  membershipLevel: "string" // One of: 'regular', 'silver', 'gold', 'platinum'
}
```

### Events

| Event | Description | Parameters |
|-------|-------------|------------|
| `login` | Triggered when login button is tapped | None |
| `avatarTap` | Triggered when avatar is tapped (logged in users only) | None |

### Example Implementation

```javascript
// In your page
Page({
  data: {
    isLoggedIn: false,
    userInfo: null
  },

  onLoad() {
    this.checkLoginStatus();
  },

  async checkLoginStatus() {
    // Check if user is logged in
    const user = await userService.getCurrentUser();
    if (user) {
      this.setData({
        isLoggedIn: true,
        userInfo: {
          avatar: user.avatar,
          nickname: user.nickname,
          membershipLevel: user.membershipLevel
        }
      });
    }
  },

  onLogin() {
    // Handle login action
    wx.navigateTo({
      url: '/pages/login/index'
    });
  },

  onAvatarTap() {
    // Handle avatar tap (e.g., navigate to profile edit)
    wx.navigateTo({
      url: '/pages/profile-edit/index'
    });
  }
});
```

## Styling

The component uses SCSS and follows the design system defined in `styles/variables.scss`. Key styling features:

- **Responsive Layout**: Adapts to different screen sizes
- **Membership Badge**: Gradient background based on membership level
- **Touch Feedback**: Visual feedback for interactive elements
- **Accessibility**: Minimum touch target sizes and proper contrast

### CSS Classes

- `.user-header`: Main container
- `.user-header__logged-in`: Container for logged-in state
- `.user-header__logged-out`: Container for logged-out state
- `.user-header__avatar`: Avatar image styling
- `.user-header__membership-badge`: Membership level badge
- `.user-header__login-button`: Login call-to-action button

## Testing

The component includes comprehensive unit tests covering:

- Component initialization
- Membership level display logic
- Login functionality
- Avatar interaction handling
- Data validation and error handling

Run tests from the project root:
```bash
npm test
# or specifically for this component
npm run test:user-header
```

## Dependencies

- WeChat Mini Program Component framework
- Profile constants (`constants/profile.ts`)
- Design system variables (`styles/variables.scss`)

## Browser Support

- WeChat Mini Program runtime environment
- iOS and Android WeChat clients
- WeChat Developer Tools

## Accessibility

- Minimum touch target size of 44rpx × 44rpx
- Proper color contrast ratios
- Support for WeChat's built-in accessibility features
- Semantic HTML structure where possible

## Performance

- Optimized image loading with fallback support
- Efficient state management
- Minimal re-renders through proper data binding
- Lazy loading compatible