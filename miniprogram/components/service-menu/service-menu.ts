import { SERVICE_MENU_ITEMS } from '../../constants/profile';

interface ServiceMenuItem {
  id: string;
  title: string;
  icon: string;
  page?: string;
  action?: string;
}

interface ServiceMenuData {
  services: ServiceMenuItem[];
  merchantPhone: string;
}

Component({
  /**
   * Component properties
   */
  properties: {
    merchantPhone: {
      type: String,
      value: '400-123-4567' // Default merchant phone number
    }
  },

  /**
   * Component initial data
   */
  data: {
    services: SERVICE_MENU_ITEMS,
    merchantPhone: '400-123-4567'
  } as ServiceMenuData,

  /**
   * Component lifecycle methods
   */
  lifetimes: {
    attached() {
      this.setData({
        merchantPhone: this.properties.merchantPhone
      });
    }
  },

  /**
   * Component methods
   */
  methods: {
    /**
     * Handle service item tap
     */
    onServiceTap(event: WechatMiniprogram.TouchEvent) {
      const { service } = event.currentTarget.dataset;
      
      if (!service) {
        console.warn('Service data not found');
        return;
      }

      // Handle different service actions
      switch (service.id) {
        case 'call-merchant':
          this._handleCallMerchant();
          break;
        case 'task-center':
          this._navigateToPage(service.page);
          break;
        case 'delivery-address':
          this._navigateToPage(service.page);
          break;
        case 'personal-info':
          this._navigateToPage(service.page);
          break;
        case 'account-security':
          this._navigateToPage(service.page);
          break;
        default:
          console.warn('Unknown service action:', service.id);
      }

      // Trigger event for parent component
      this.triggerEvent('serviceTap', {
        serviceId: service.id,
        service: service
      });
    },

    /**
     * Handle call merchant functionality
     */
    _handleCallMerchant() {
      const phone = this.data.merchantPhone;
      
      if (!phone) {
        wx.showToast({
          title: '商家电话不可用',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      wx.showModal({
        title: '拨打电话',
        content: `确定要拨打商家电话 ${phone} 吗？`,
        confirmText: '拨打',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            wx.makePhoneCall({
              phoneNumber: phone,
              success: () => {
                console.log('Phone call initiated successfully');
              },
              fail: (error) => {
                console.error('Failed to make phone call:', error);
                wx.showToast({
                  title: '拨打失败',
                  icon: 'none',
                  duration: 2000
                });
              }
            });
          }
        },
        fail: (error) => {
          console.error('Failed to show modal:', error);
        }
      });
    },

    /**
     * Navigate to specified page
     */
    _navigateToPage(page: string) {
      if (!page) {
        wx.showToast({
          title: '页面不可用',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      wx.navigateTo({
        url: page,
        fail: (error) => {
          console.error('Navigation failed:', error);
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none',
            duration: 2000
          });
        }
      });
    },

    /**
     * Get icon class for service item
     */
    _getIconClass(iconName: string): string {
      return `service-menu__icon service-menu__icon--${iconName}`;
    }
  }
});