// index.ts - 首页逻辑文件
// 获取应用实例
const app = getApp<IAppOption>();

// 数据接口定义
interface BrandInfo {
  logo: string;
  slogan: string;
  backgroundImage: string;
}

interface MainBanner {
  title: string;
  subtitle: string;
  backgroundImage: string;
  audioUrl?: string;
}

interface SearchConfig {
  placeholder: string;
  hotKeywords: string[];
}

interface QuickActionItem {
  id: string;
  title: string;
  icon: string;
  path?: string;
}

interface ProductItem {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  tags?: string[];
}

interface CategoryItem {
  id: string;
  title: string;
  subtitle: string;
  backgroundImage: string;
  products: ProductItem[];
  actionText: string;
  path?: string;
}

interface HomePageData {
  brandInfo: BrandInfo;
  mainBanner: MainBanner;
  searchConfig: SearchConfig;
  quickActions: QuickActionItem[];
  categories: CategoryItem[];
}

Component({
  data: {
    // 搜索相关状态
    searchKeyword: '',
    searchDisabled: false,
    showHotKeywords: false,
    searchFocused: false,

    // 品牌信息
    brandInfo: {
      logo: '/images/imgs/seal_logo_7.jpg', // 使用传统印章风格Logo
      slogan: '道地选材 匠求品质 出品即精品',
      backgroundImage: '/images/imgs/warm_background_5.jpg', // 使用暖色调背景
    } as BrandInfo,

    // 主横幅信息
    mainBanner: {
      title: '道地溯源',
      subtitle: '枸益补枸',
      backgroundImage: '/images/imgs/tcm_herbs_banner_3.jpg', // 使用高质量中药材展示背景
      audioUrl: '/audio/intro.wav',
    } as MainBanner,

    // 搜索配置
    searchConfig: {
      placeholder: '陈皮',
      hotKeywords: ['陈皮', '枸杞', '人参', '当归', '黄芪'],
    } as SearchConfig,

    // 快捷功能
    quickActions: [
      {
        id: 'member',
        title: '加入会员',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI0IDEyQzI3LjMxMzcgMTIgMzAgMTQuNjg2MyAzMCAxOEMzMCAyMS4zMTM3IDI3LjMxMzcgMjQgMjQgMjRDMjAuNjg2MyAyNCAzOCAyMS4zMTM3IDE4IDE4QzE4IDE0LjY4NjMgMjAuNjg2MyAxMiAyNCAxMloiIGZpbGw9IiM4QjQ1MTMiLz4KPHBhdGggZD0iTTEyIDM2QzEyIDMwLjQ3NzIgMTYuNDc3MiAyNiAyMiAyNkgyNkMzMS41MjI4IDI2IDM2IDMwLjQ3NzIgMzYgMzZWNDBIMTJWMzZaIiBmaWxsPSIjOEI0NTEzIi8+Cjwvc3ZnPgo=', // 会员图标 SVG base64
        path: '/pages/member/member',
      },
      {
        id: 'checkin',
        title: '去签到',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDhDOC44OTU0MyA4IDggOC44OTU0MyA4IDEwVjM4QzggMzkuMTA0NiA4Ljg5NTQzIDQwIDEwIDQwSDM4QzM5LjEwNDYgNDAgNDAgMzkuMTA0NiA0MCAzOFYxMEM0MCA4Ljg5NTQzIDM5LjEwNDYgOCAzOCA4SDEwWiIgZmlsbD0iIzhCNDUxMyIvPgo8cGF0aCBkPSJNMzQgMThMMjIgMzBMMTQgMjIiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==', // 签到图标 SVG base64
        path: '/pages/checkin/checkin',
      },
    ] as QuickActionItem[],

    // 商品分类
    categories: [
      {
        id: 'welfare',
        title: '惠民专区',
        subtitle: '款款都划算',
        backgroundImage: '/images/imgs/gift_box_5.jpg', // 使用新年主题礼品盒，橙色元素突出
        products: [
          {
            id: 'welfare_001',
            name: '优质陈皮',
            image: '/images/imgs/herb_ingredients_0.jpg', // 使用中药材装饰元素
            price: 29.9,
            originalPrice: 39.9,
            tags: ['特价', '热销'],
          },
          {
            id: 'welfare_002',
            name: '精选枸杞',
            image: '/images/imgs/herb_ingredients_3.jpg', // 使用中药材装饰元素
            price: 19.9,
            originalPrice: 29.9,
            tags: ['限时'],
          },
          {
            id: 'welfare_003',
            name: '当归片',
            image: '/images/imgs/herb_ingredients_5.jpeg', // 使用中药材装饰元素
            price: 24.9,
            originalPrice: 34.9,
            tags: ['优惠'],
          },
        ],
        actionText: 'GO',
        path: '/pages/category/category?type=welfare',
      },
      {
        id: 'quality',
        title: '品质自营',
        subtitle: '道地选材 精益求精',
        backgroundImage: '/images/imgs/product_jars_7.jpg', // 使用精美罐装产品展示
        products: [
          {
            id: 'quality_001',
            name: '野生人参',
            image: '/images/imgs/product_jars_3.jpg', // 使用中药材瓶装包装
            price: 299.9,
            originalPrice: 399.9,
            tags: ['精品', '野生'],
          },
          {
            id: 'quality_002',
            name: '上等黄芪',
            image: '/images/imgs/product_jars_4.jpg', // 使用传统药材罐装展示
            price: 89.9,
            originalPrice: 119.9,
            tags: ['道地'],
          },
          {
            id: 'quality_003',
            name: '优质当归',
            image: '/images/imgs/product_jars_8.jpg', // 使用罐装产品展示
            price: 69.9,
            originalPrice: 89.9,
            tags: ['自营'],
          },
        ],
        actionText: 'GO',
        path: '/pages/category/category?type=quality',
      },
      {
        id: 'tea',
        title: '爆款茶饮',
        subtitle: '精选茶品',
        backgroundImage: '/images/imgs/tea_background_5.jpg', // 使用茶叶背景
        products: [
          {
            id: 'tea_001',
            name: '铁观音',
            image: '/images/imgs/tea_decoration_3.jpg', // 使用茶文化装饰元素
            price: 128.0,
            originalPrice: 168.0,
            tags: ['热销', '香醇'],
          },
          {
            id: 'tea_002',
            name: '普洱茶',
            image: '/images/imgs/tea_decoration_7.png', // 使用茶文化装饰元素
            price: 88.0,
            originalPrice: 118.0,
            tags: ['陈年'],
          },
        ],
        actionText: 'GO',
        path: '/pages/category/category?type=tea',
      },
      {
        id: 'activity',
        title: '活动专区',
        subtitle: '限时优惠',
        backgroundImage: '/images/imgs/gift_box_0.jpg', // 使用中式新年礼品盒设计
        products: [
          {
            id: 'activity_001',
            name: '新年礼盒',
            image: '/images/imgs/gift_box_8.jpg', // 使用节庆主题包装
            price: 199.0,
            originalPrice: 299.0,
            tags: ['限时', '礼盒'],
          },
          {
            id: 'activity_002',
            name: '养生套装',
            image: '/images/imgs/medicine_collage_2.jpg', // 使用中药材拼贴装饰
            price: 158.0,
            originalPrice: 228.0,
            tags: ['特惠'],
          },
        ],
        actionText: 'GO',
        path: '/pages/category/category?type=activity',
      },
    ] as CategoryItem[],
  },

  methods: {
    // 页面生命周期 - 页面加载
    onLoad() {
      console.log('首页加载完成');
      this.initPageData();
    },

    // 页面生命周期 - 页面显示
    onShow() {
      console.log('首页显示');
    },

    // 初始化页面数据
    initPageData() {
      // 这里可以调用API获取动态数据
      // 暂时使用静态数据
    },

    // ==================== 搜索功能相关方法 ====================

    // 搜索输入处理
    onSearchInput(e: any) {
      const value = e.detail.value.trim();
      this.setData({
        searchKeyword: value,
        showHotKeywords: value.length === 0 && this.data.searchFocused,
      });
    },

    // 搜索确认（点击搜索按钮或回车）
    onSearchConfirm(e: any) {
      const keyword = e.detail.value.trim() || this.data.searchKeyword.trim();
      this.performSearch(keyword);
    },

    // 搜索框聚焦事件
    onSearchInputFocus() {
      this.setData({
        searchFocused: true,
        showHotKeywords: this.data.searchKeyword.length === 0,
      });

      // 添加聚焦样式 - WeChat Mini Program doesn't support addClass
      // Use setData to update CSS classes instead
    },

    // 搜索框失焦事件
    onSearchInputBlur() {
      // 延迟隐藏热门关键词，避免点击热门关键词时立即隐藏
      setTimeout(() => {
        this.setData({
          searchFocused: false,
          showHotKeywords: false,
        });

        // 移除聚焦样式 - WeChat Mini Program doesn't support removeClass
        // Use setData to update CSS classes instead
      }, 200);
    },

    // 点击搜索栏聚焦（用于禁用输入时的处理）
    onSearchFocus() {
      if (this.data.searchDisabled) {
        // 如果搜索被禁用，直接跳转到搜索页面
        wx.navigateTo({
          url: '/pages/search/search',
        });
      }
    },

    // 清除搜索内容
    onSearchClear() {
      this.setData({
        searchKeyword: '',
        showHotKeywords: this.data.searchFocused,
      });
    },

    // 热门关键词点击
    onHotKeywordTap(e: any) {
      const keyword = e.currentTarget.dataset.keyword;
      if (keyword) {
        this.setData({
          searchKeyword: keyword,
        });
        this.performSearch(keyword);
      }
    },

    // 执行搜索
    performSearch(keyword: string) {
      if (!keyword) {
        wx.showToast({
          title: '请输入搜索关键词',
          icon: 'none',
          duration: 2000,
        });
        return;
      }

      // 记录搜索历史（可选）
      this.recordSearchHistory(keyword);

      // 跳转到搜索结果页面
      wx.navigateTo({
        url: `/pages/search/search?keyword=${encodeURIComponent(keyword)}`,
        fail: error => {
          console.error('搜索页面跳转失败:', error);
          wx.showToast({
            title: '搜索功能暂时不可用',
            icon: 'none',
            duration: 2000,
          });
        },
      });

      // 清空搜索框并隐藏热门关键词
      this.setData({
        searchKeyword: '',
        showHotKeywords: false,
        searchFocused: false,
      });
    },

    // 记录搜索历史
    recordSearchHistory(keyword: string) {
      try {
        // 获取现有搜索历史
        let searchHistory = wx.getStorageSync('searchHistory') || [];

        // 移除重复项
        searchHistory = searchHistory.filter((item: string) => item !== keyword);

        // 添加到开头
        searchHistory.unshift(keyword);

        // 限制历史记录数量
        if (searchHistory.length > 10) {
          searchHistory = searchHistory.slice(0, 10);
        }

        // 保存到本地存储
        wx.setStorageSync('searchHistory', searchHistory);
      } catch (error) {
        console.error('保存搜索历史失败:', error);
      }
    },

    // 搜索功能
    onSearch(e: any) {
      const keyword = e.detail.value || e.currentTarget.dataset.keyword;
      if (keyword) {
        this.performSearch(keyword);
      }
    },

    // ==================== 快捷功能相关方法 ====================

    // 快捷功能点击处理
    onQuickActionTap(e: any) {
      const { id, path } = e.currentTarget.dataset;

      console.log('快捷功能点击:', { id, path });

      // 添加点击反馈
      wx.vibrateShort({
        type: 'light',
      });

      if (id === 'member') {
        // 会员功能
        this.handleMemberAction();
      } else if (id === 'checkin') {
        // 签到功能
        this.handleCheckinAction();
      } else if (path) {
        // 通用页面跳转
        this.navigateToPage(path, id);
      }
    },

    // 处理会员功能 - 需求 4.2
    handleMemberAction() {
      console.log('处理会员功能');

      // 检查用户登录状态
      const userInfo = wx.getStorageSync('userInfo');

      if (!userInfo) {
        // 用户未登录，先跳转到登录页面
        wx.showModal({
          title: '提示',
          content: '请先登录后再加入会员',
          confirmText: '去登录',
          cancelText: '取消',
          success: res => {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/login/login?redirect=/pages/member/member',
                fail: error => {
                  console.error('登录页面跳转失败:', error);
                  wx.showToast({
                    title: '页面跳转失败',
                    icon: 'none',
                  });
                },
              });
            }
          },
        });
      } else {
        // 用户已登录，直接跳转到会员页面
        this.navigateToPage('/pages/member/member', 'member');
      }
    },

    // 处理签到功能 - 需求 4.3
    handleCheckinAction() {
      console.log('处理签到功能');

      // 检查用户登录状态
      const userInfo = wx.getStorageSync('userInfo');

      if (!userInfo) {
        // 用户未登录，提示登录
        wx.showModal({
          title: '提示',
          content: '请先登录后再进行签到',
          confirmText: '去登录',
          cancelText: '取消',
          success: res => {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/login/login?redirect=/pages/checkin/checkin',
                fail: error => {
                  console.error('登录页面跳转失败:', error);
                  wx.showToast({
                    title: '页面跳转失败',
                    icon: 'none',
                  });
                },
              });
            }
          },
        });
      } else {
        // 用户已登录，检查今日是否已签到
        const today = new Date().toDateString();
        const lastCheckinDate = wx.getStorageSync('lastCheckinDate');

        if (lastCheckinDate === today) {
          // 今日已签到
          wx.showModal({
            title: '签到提示',
            content: '您今日已完成签到，明天再来吧！',
            confirmText: '查看签到记录',
            cancelText: '确定',
            success: res => {
              if (res.confirm) {
                this.navigateToPage('/pages/checkin/checkin', 'checkin');
              }
            },
          });
        } else {
          // 可以签到，跳转到签到页面
          this.navigateToPage('/pages/checkin/checkin', 'checkin');
        }
      }
    },

    // 通用页面跳转方法
    navigateToPage(path: string, actionId: string) {
      console.log('页面跳转:', { path, actionId });

      wx.navigateTo({
        url: path,
        success: () => {
          console.log(`${actionId} 页面跳转成功`);
        },
        fail: error => {
          console.error(`${actionId} 页面跳转失败:`, error);

          // 根据不同的错误类型给出不同的提示
          let errorMessage = '页面跳转失败';

          if (error.errMsg && error.errMsg.includes('page not found')) {
            errorMessage = '页面不存在，功能开发中';
          } else if (error.errMsg && error.errMsg.includes('navigate')) {
            errorMessage = '页面跳转异常，请稍后重试';
          }

          wx.showToast({
            title: errorMessage,
            icon: 'none',
            duration: 2000,
          });
        },
      });
    },

    // 分类卡片点击
    onCategoryTap(e: any) {
      const { id, path } = e.currentTarget.dataset;

      if (path) {
        wx.navigateTo({
          url: path,
        });
      } else {
        wx.showToast({
          title: `${id}功能开发中`,
          icon: 'none',
        });
      }
    },

    // 主横幅点击 - 播放语音
    onMainBannerTap() {
      const { audioUrl } = this.data.mainBanner;

      if (!audioUrl) {
        wx.showToast({
          title: '暂无语音介绍',
          icon: 'none',
        });
        return;
      }

      // 创建音频上下文
      const audioContext = wx.createInnerAudioContext();
      audioContext.src = audioUrl;

      // 设置音频属性
      audioContext.autoplay = false;
      audioContext.loop = false;
      audioContext.volume = 1.0;

      // 播放开始事件
      audioContext.onPlay(() => {
        console.log('音频开始播放');
        wx.showToast({
          title: '正在播放语音介绍',
          icon: 'none',
          duration: 2000,
        });
      });

      // 播放结束事件
      audioContext.onEnded(() => {
        console.log('音频播放结束');
        audioContext.destroy();
      });

      // 播放错误事件
      audioContext.onError(error => {
        console.error('音频播放失败:', error);
        wx.showToast({
          title: '语音播放失败，请稍后重试',
          icon: 'none',
          duration: 2000,
        });
        audioContext.destroy();
      });

      // 音频加载失败事件
      audioContext.onCanplay(() => {
        console.log('音频可以播放');
      });

      // 开始播放
      try {
        audioContext.play();
      } catch (error) {
        console.error('音频播放异常:', error);
        wx.showToast({
          title: '语音播放异常',
          icon: 'none',
        });
        audioContext.destroy();
      }
    },

    // 错误处理 - 图片加载失败
    onImageError(e: any) {
      console.error('图片加载失败:', e.detail);
      const { src } = e.currentTarget.dataset;

      // 根据图片类型设置不同的默认图片
      if (src && src.includes('brand-logo')) {
        // 品牌logo加载失败时的处理
        wx.showToast({
          title: '品牌logo加载失败',
          icon: 'none',
          duration: 2000,
        });
      } else if (src && src.includes('brand-bg')) {
        // 品牌背景图加载失败时的处理
        console.log('品牌背景图加载失败，使用默认样式');
      }
    },

    // 页面分享
    onShareAppMessage() {
      return {
        title: '中医药材商城 - 道地选材 匠求品质',
        path: '/pages/index/index',
        imageUrl: '/images/imgs/tcm_herbs_banner_4.jpg', // 使用传统中药材配木质研钵作为分享图
      };
    },
  },
});
