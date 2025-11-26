// index.ts - 首页逻辑文件
// 获取应用实例
const app = getApp<IAppOption>()

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
    // 品牌信息
    brandInfo: {
      logo: '/images/brand-logo.png',
      slogan: '道地选材 匠求品质 出品即精品',
      backgroundImage: '/images/brand-bg.jpg'
    } as BrandInfo,

    // 主横幅信息
    mainBanner: {
      title: '道地溯源',
      subtitle: '枸益补枸',
      backgroundImage: '/images/main-banner-bg.jpg',
      audioUrl: '/audio/intro.mp3'
    } as MainBanner,

    // 搜索配置
    searchConfig: {
      placeholder: '陈皮',
      hotKeywords: ['陈皮', '枸杞', '人参', '当归', '黄芪']
    } as SearchConfig,

    // 快捷功能
    quickActions: [
      {
        id: 'member',
        title: '加入会员',
        icon: '/images/icon-member.png',
        path: '/pages/member/member'
      },
      {
        id: 'checkin',
        title: '去签到',
        icon: '/images/icon-checkin.png',
        path: '/pages/checkin/checkin'
      }
    ] as QuickActionItem[],

    // 商品分类
    categories: [
      {
        id: 'welfare',
        title: '惠民专区',
        subtitle: '款款都划算',
        backgroundImage: '/images/category-welfare-bg.jpg',
        products: [],
        actionText: 'GO',
        path: '/pages/category/category?type=welfare'
      },
      {
        id: 'quality',
        title: '品质自营',
        subtitle: '道地选材 精益求精',
        backgroundImage: '/images/category-quality-bg.jpg',
        products: [],
        actionText: 'GO',
        path: '/pages/category/category?type=quality'
      },
      {
        id: 'tea',
        title: '爆款茶饮',
        subtitle: '精选茶品',
        backgroundImage: '/images/category-tea-bg.jpg',
        products: [],
        actionText: 'GO',
        path: '/pages/category/category?type=tea'
      },
      {
        id: 'activity',
        title: '活动专区',
        subtitle: '限时优惠',
        backgroundImage: '/images/category-activity-bg.jpg',
        products: [],
        actionText: 'GO',
        path: '/pages/category/category?type=activity'
      }
    ] as CategoryItem[]
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

    // 搜索功能
    onSearch(e: any) {
      const keyword = e.detail.value || e.currentTarget.dataset.keyword;
      if (keyword) {
        wx.navigateTo({
          url: `/pages/search/search?keyword=${encodeURIComponent(keyword)}`
        });
      }
    },

    // 搜索框聚焦
    onSearchFocus() {
      wx.navigateTo({
        url: '/pages/search/search'
      });
    },

    // 快捷功能点击
    onQuickActionTap(e: any) {
      const { id, path } = e.currentTarget.dataset;
      
      if (id === 'member') {
        // 会员功能
        this.handleMemberAction();
      } else if (id === 'checkin') {
        // 签到功能
        this.handleCheckinAction();
      } else if (path) {
        wx.navigateTo({
          url: path
        });
      }
    },

    // 处理会员功能
    handleMemberAction() {
      // 检查用户登录状态
      wx.showToast({
        title: '会员功能开发中',
        icon: 'none'
      });
    },

    // 处理签到功能
    handleCheckinAction() {
      wx.showToast({
        title: '签到功能开发中',
        icon: 'none'
      });
    },

    // 分类卡片点击
    onCategoryTap(e: any) {
      const { id, path } = e.currentTarget.dataset;
      
      if (path) {
        wx.navigateTo({
          url: path
        });
      } else {
        wx.showToast({
          title: `${id}功能开发中`,
          icon: 'none'
        });
      }
    },

    // 主横幅点击 - 播放语音
    onMainBannerTap() {
      const { audioUrl } = this.data.mainBanner;
      
      if (!audioUrl) {
        wx.showToast({
          title: '暂无语音介绍',
          icon: 'none'
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
          duration: 2000
        });
      });
      
      // 播放结束事件
      audioContext.onEnded(() => {
        console.log('音频播放结束');
        audioContext.destroy();
      });
      
      // 播放错误事件
      audioContext.onError((error) => {
        console.error('音频播放失败:', error);
        wx.showToast({
          title: '语音播放失败，请稍后重试',
          icon: 'none',
          duration: 2000
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
          icon: 'none'
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
          duration: 2000
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
        imageUrl: '/images/share-image.jpg'
      };
    }
  }
})
