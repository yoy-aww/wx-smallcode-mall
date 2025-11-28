// pages/login/index.ts
Page({
  data: {
    phone: '',
    code: '',
    countdown: 0,
    canSendCode: true,
    loading: false
  },

  onLoad(options: { redirect?: string }) {
    console.log('Login page loaded with options:', options);
    
    // Store redirect URL if provided
    if (options.redirect) {
      this.setData({
        redirectUrl: decodeURIComponent(options.redirect)
      });
    }
  },

  // Phone input handler
  onPhoneInput(e: any) {
    this.setData({
      phone: e.detail.value
    });
  },

  // Verification code input handler
  onCodeInput(e: any) {
    this.setData({
      code: e.detail.value
    });
  },

  // Send verification code
  async onSendCode() {
    const { phone, canSendCode } = this.data;
    
    if (!canSendCode) return;
    
    if (!phone || phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    try {
      this.setData({ loading: true });
      
      // Simulate sending verification code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      wx.showToast({
        title: '验证码已发送',
        icon: 'success'
      });

      // Start countdown
      this.startCountdown();
      
    } catch (error) {
      wx.showToast({
        title: '发送失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // Start countdown timer
  startCountdown() {
    let countdown = 60;
    this.setData({
      countdown,
      canSendCode: false
    });

    const timer = setInterval(() => {
      countdown--;
      this.setData({ countdown });
      
      if (countdown <= 0) {
        clearInterval(timer);
        this.setData({
          canSendCode: true,
          countdown: 0
        });
      }
    }, 1000);
  },

  // Login handler
  async onLogin() {
    const { phone, code } = this.data;
    
    if (!phone || phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    if (!code || code.length !== 6) {
      wx.showToast({
        title: '请输入6位验证码',
        icon: 'none'
      });
      return;
    }

    try {
      this.setData({ loading: true });
      
      // Simulate login process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store user info
      wx.setStorageSync('userInfo', {
        phone,
        nickname: `用户${phone.slice(-4)}`,
        avatar: '/images/default-avatar.png',
        isLoggedIn: true
      });

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });

      // Navigate back or to redirect URL
      setTimeout(() => {
        const redirectUrl = (this.data as any).redirectUrl;
        if (redirectUrl) {
          wx.redirectTo({
            url: redirectUrl
          });
        } else {
          wx.navigateBack();
        }
      }, 1500);
      
    } catch (error) {
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  }
});