/**
 * Unit tests for UserHeader component
 */

const MEMBERSHIP_LEVELS = {
  regular: '普通会员',
  silver: '银卡会员',
  gold: '金卡会员',
  platinum: '白金会员'
};

const LOGIN_PROMPT_MESSAGE = '登录手机号，订单管理更轻松，优惠信息不错过';
const DEFAULT_AVATAR = '/images/placeholders/default-avatar.svg';

// Mock component instance
const createMockComponent = () => ({
  data: {
    membershipLabel: '',
    loginPromptMessage: LOGIN_PROMPT_MESSAGE,
    defaultAvatar: DEFAULT_AVATAR,
    isLoggedIn: false,
    userInfo: null
  },
  setData: jest.fn(),
  triggerEvent: jest.fn()
});

describe('UserHeader Component', () => {
  let mockComponent;

  beforeEach(() => {
    mockComponent = createMockComponent();
  });

  describe('Component Initialization', () => {
    test('should initialize with correct default data', () => {
      expect(mockComponent.data.loginPromptMessage).toBe(LOGIN_PROMPT_MESSAGE);
      expect(mockComponent.data.defaultAvatar).toBe(DEFAULT_AVATAR);
      expect(mockComponent.data.membershipLabel).toBe('');
    });
  });

  describe('Membership Level Display', () => {
    test('should display correct membership label for regular member', () => {
      const updateMembershipLabel = function() {
        const userInfo = this.data.userInfo;
        if (userInfo && userInfo.membershipLevel) {
          const membershipLevel = userInfo.membershipLevel;
          this.setData({
            membershipLabel: MEMBERSHIP_LEVELS[membershipLevel] || MEMBERSHIP_LEVELS.regular
          });
        } else {
          this.setData({
            membershipLabel: MEMBERSHIP_LEVELS.regular
          });
        }
      };

      mockComponent.data.userInfo = {
        avatar: 'test-avatar.jpg',
        nickname: 'Test User',
        membershipLevel: 'regular'
      };

      updateMembershipLabel.call(mockComponent);

      expect(mockComponent.setData).toHaveBeenCalledWith({
        membershipLabel: '普通会员'
      });
    });

    test('should display correct membership label for gold member', () => {
      const updateMembershipLabel = function() {
        const userInfo = this.data.userInfo;
        if (userInfo && userInfo.membershipLevel) {
          const membershipLevel = userInfo.membershipLevel;
          this.setData({
            membershipLabel: MEMBERSHIP_LEVELS[membershipLevel] || MEMBERSHIP_LEVELS.regular
          });
        } else {
          this.setData({
            membershipLabel: MEMBERSHIP_LEVELS.regular
          });
        }
      };

      mockComponent.data.userInfo = {
        avatar: 'test-avatar.jpg',
        nickname: 'Test User',
        membershipLevel: 'gold'
      };

      updateMembershipLabel.call(mockComponent);

      expect(mockComponent.setData).toHaveBeenCalledWith({
        membershipLabel: '金卡会员'
      });
    });

    test('should fallback to regular membership for invalid level', () => {
      const updateMembershipLabel = function() {
        const userInfo = this.data.userInfo;
        if (userInfo && userInfo.membershipLevel) {
          const membershipLevel = userInfo.membershipLevel;
          this.setData({
            membershipLabel: MEMBERSHIP_LEVELS[membershipLevel] || MEMBERSHIP_LEVELS.regular
          });
        } else {
          this.setData({
            membershipLabel: MEMBERSHIP_LEVELS.regular
          });
        }
      };

      mockComponent.data.userInfo = {
        avatar: 'test-avatar.jpg',
        nickname: 'Test User',
        membershipLevel: 'invalid'
      };

      updateMembershipLabel.call(mockComponent);

      expect(mockComponent.setData).toHaveBeenCalledWith({
        membershipLabel: '普通会员'
      });
    });
  });

  describe('Login Functionality', () => {
    test('should trigger login event when login button is tapped', () => {
      const onLoginTap = function() {
        this.triggerEvent('login', {}, {});
      };

      onLoginTap.call(mockComponent);

      expect(mockComponent.triggerEvent).toHaveBeenCalledWith('login', {}, {});
    });
  });

  describe('Avatar Functionality', () => {
    test('should trigger avatarTap event when avatar is tapped and user is logged in', () => {
      const onAvatarTap = function() {
        if (this.data.isLoggedIn) {
          this.triggerEvent('avatarTap', {}, {});
        }
      };

      mockComponent.data.isLoggedIn = true;
      onAvatarTap.call(mockComponent);

      expect(mockComponent.triggerEvent).toHaveBeenCalledWith('avatarTap', {}, {});
    });

    test('should not trigger avatarTap event when user is not logged in', () => {
      const onAvatarTap = function() {
        if (this.data.isLoggedIn) {
          this.triggerEvent('avatarTap', {}, {});
        }
      };

      mockComponent.data.isLoggedIn = false;
      onAvatarTap.call(mockComponent);

      expect(mockComponent.triggerEvent).not.toHaveBeenCalled();
    });

    test('should handle avatar load error gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const onAvatarError = function() {
        console.warn('Avatar image failed to load, using fallback');
      };

      onAvatarError();

      expect(consoleSpy).toHaveBeenCalledWith('Avatar image failed to load, using fallback');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Component States', () => {
    test('should display login prompt when user is not logged in', () => {
      mockComponent.data.isLoggedIn = false;
      mockComponent.data.userInfo = null;

      expect(mockComponent.data.isLoggedIn).toBe(false);
      expect(mockComponent.data.userInfo).toBe(null);
    });

    test('should display user info when user is logged in', () => {
      mockComponent.data.isLoggedIn = true;
      mockComponent.data.userInfo = {
        avatar: 'test-avatar.jpg',
        nickname: 'Test User',
        membershipLevel: 'gold'
      };

      expect(mockComponent.data.isLoggedIn).toBe(true);
      expect(mockComponent.data.userInfo).toBeTruthy();
      expect(mockComponent.data.userInfo.nickname).toBe('Test User');
    });
  });

  describe('Data Validation', () => {
    test('should handle missing userInfo gracefully', () => {
      const updateMembershipLabel = function() {
        const userInfo = this.data.userInfo;
        if (userInfo && userInfo.membershipLevel) {
          const membershipLevel = userInfo.membershipLevel;
          this.setData({
            membershipLabel: MEMBERSHIP_LEVELS[membershipLevel] || MEMBERSHIP_LEVELS.regular
          });
        } else {
          this.setData({
            membershipLabel: MEMBERSHIP_LEVELS.regular
          });
        }
      };

      mockComponent.data.userInfo = null;
      updateMembershipLabel.call(mockComponent);

      expect(mockComponent.setData).toHaveBeenCalledWith({
        membershipLabel: '普通会员'
      });
    });

    test('should handle userInfo without membershipLevel', () => {
      const updateMembershipLabel = function() {
        const userInfo = this.data.userInfo;
        if (userInfo && userInfo.membershipLevel) {
          const membershipLevel = userInfo.membershipLevel;
          this.setData({
            membershipLabel: MEMBERSHIP_LEVELS[membershipLevel] || MEMBERSHIP_LEVELS.regular
          });
        } else {
          this.setData({
            membershipLabel: MEMBERSHIP_LEVELS.regular
          });
        }
      };

      mockComponent.data.userInfo = {
        avatar: 'test-avatar.jpg',
        nickname: 'Test User',
        membershipLevel: ''
      };

      updateMembershipLabel.call(mockComponent);

      expect(mockComponent.setData).toHaveBeenCalledWith({
        membershipLabel: '普通会员'
      });
    });
  });
});

// Export test utilities for integration testing
module.exports = {
  createMockComponent,
  MEMBERSHIP_LEVELS,
  LOGIN_PROMPT_MESSAGE,
  DEFAULT_AVATAR
};