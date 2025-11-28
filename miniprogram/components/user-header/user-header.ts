import { MEMBERSHIP_LEVELS, LOGIN_PROMPT_MESSAGE, DEFAULT_AVATAR } from '../../constants/profile';

interface UserHeaderData {
  membershipLabel: string;
  loginPromptMessage: string;
  defaultAvatar: string;
}

Component({
  /**
   * Component properties
   */
  properties: {
    isLoggedIn: {
      type: Boolean,
      value: false
    },
    userInfo: {
      type: Object,
      value: null
    }
  },

  /**
   * Component initial data
   */
  data: {
    membershipLabel: '',
    loginPromptMessage: LOGIN_PROMPT_MESSAGE,
    defaultAvatar: DEFAULT_AVATAR
  } as UserHeaderData,

  /**
   * Component lifecycle methods
   */
  lifetimes: {
    attached() {
      this._updateMembershipLabel();
    }
  },

  /**
   * Property observers
   */
  observers: {
    'userInfo.membershipLevel'(membershipLevel: string) {
      this._updateMembershipLabel();
    }
  },

  /**
   * Component methods
   */
  methods: {
    /**
     * Handle login button tap
     */
    onLoginTap() {
      this.triggerEvent('login', {}, {});
    },

    /**
     * Handle avatar tap (for logged in users)
     */
    onAvatarTap() {
      if (this.data.isLoggedIn) {
        this.triggerEvent('avatarTap', {}, {});
      }
    },

    /**
     * Handle avatar load error - use fallback image
     */
    onAvatarError() {
      console.warn('Avatar image failed to load, using fallback');
      // The fallback is handled in WXML template
    },

    /**
     * Update membership level label based on current user info
     */
    _updateMembershipLabel() {
      const userInfo = this.data.userInfo;
      if (userInfo && userInfo.membershipLevel) {
        const membershipLevel = userInfo.membershipLevel as keyof typeof MEMBERSHIP_LEVELS;
        this.setData({
          membershipLabel: MEMBERSHIP_LEVELS[membershipLevel] || MEMBERSHIP_LEVELS.regular
        });
      } else {
        this.setData({
          membershipLabel: MEMBERSHIP_LEVELS.regular
        });
      }
    }
  }
});