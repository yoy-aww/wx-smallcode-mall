/**
 * 商品服务
 * 变动频率：高（随时增删改）
 * 数据来源：上线后走接口，开发阶段用本地 mock
 */
import { getImageUrl } from '../images/image-mapping';

// ==================== 类型定义 ====================

export interface ProductItem {
  id: string;
  name: string;
  image: string;
  originalPrice: number;
  discountedPrice?: number;
  categoryId: string;
  description?: string;
  stock: number;
  tags?: string[];
  specs?: any[];
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
}

// ==================== 环境开关 ====================

/** 开发模式：false = 走后端 API；true = 本地 mock */
const IS_DEV_MODE = false;
/** 后端 API 基础地址 */
const API_BASE_URL = 'http://43.153.148.187:3000';

// ==================== Mock 数据 ====================

const MOCK_PRODUCTS: ProductItem[] = [
  { id: 'welfare_1', name: '惠民降压茶',     image: getImageUrl('tea_background_5.jpg'),     originalPrice: 89, discountedPrice: 59,  categoryId: 'welfare',     description: '政府补贴惠民产品，有效降血压', stock: 100, tags: ['惠民', '降压'] },
  { id: 'welfare_2', name: '惠民养胃粉',     image: getImageUrl('powder_elements_3.png'),   originalPrice: 128, discountedPrice: 88, categoryId: 'welfare',     description: '惠民专供，温和养胃',         stock: 80,  tags: ['惠民', '养胃'] },
  { id: 'welfare_3', name: '惠民安神茶',     image: getImageUrl('tea_decoration_3.jpg'),    originalPrice: 68, discountedPrice: 45,  categoryId: 'welfare',     description: '改善睡眠质量，含酸枣仁',   stock: 120, tags: ['惠民', '安神'] },
  { id: 'tea_1',     name: '网红柠檬蜂蜜茶', image: getImageUrl('tea_background_7.jpg'),    originalPrice: 58, discountedPrice: 39,  categoryId: 'tea',        description: '清香柠檬配天然蜂蜜',       stock: 200, tags: ['爆款', '柠檬'] },
  { id: 'tea_2',     name: '玫瑰花茶礼盒',   image: getImageUrl('gift_box_5.jpg'),           originalPrice: 168, discountedPrice: 128, categoryId: 'tea',        description: '精选玫瑰花瓣，美容养颜',   stock: 50,  tags: ['爆款', '玫瑰'] },
  { id: 'tea_3',     name: '薄荷清凉茶',     image: getImageUrl('green_plants_3.jpg'),      originalPrice: 45, categoryId: 'tea',        description: '天然薄荷叶，清热解暑',     stock: 150, tags: ['爆款', '薄荷'] },
  { id: 'activity_1', name: '限时秒杀养生套装', image: getImageUrl('gift_box_0.jpg'),        originalPrice: 299, discountedPrice: 199, categoryId: 'activity',  description: '养生三件套超值优惠',       stock: 30,  tags: ['秒杀', '套装'] },
  { id: 'activity_2', name: '买二送一枸杞',   image: getImageUrl('herb_ingredients_0.jpg'),  originalPrice: 88, discountedPrice: 66,  categoryId: 'activity',  description: '宁夏枸杞，明目养肝',       stock: 80,  tags: ['活动', '枸杞'] },
  { id: 'activity_3', name: '新用户专享礼包', image: getImageUrl('gift_box_8.jpg'),          originalPrice: 158, discountedPrice: 98,  categoryId: 'activity',  description: '多种中药材体验装',       stock: 100, tags: ['新用户', '礼包'] },
  { id: 'herbs_1',   name: '野生人参片',     image: getImageUrl('herb_ingredients_3.jpg'),   originalPrice: 588, discountedPrice: 488, categoryId: 'herbs',      description: '长白山野生人参，大补元气', stock: 15,  tags: ['人参', '野生'] },
  { id: 'herbs_2',   name: '优质当归片',     image: getImageUrl('medicine_collage_2.jpg'),   originalPrice: 128, categoryId: 'herbs',      description: '甘肃岷县当归，补血调经', stock: 60,  tags: ['当归', '补血'] },
  { id: 'herbs_3',   name: '精选黄芪',       image: getImageUrl('herb_ingredients_5.jpeg'),  originalPrice: 98, discountedPrice: 78,  categoryId: 'herbs',      description: '内蒙古黄芪，补气固表',   stock: 90,  tags: ['黄芪', '补气'] },
  { id: 'herbs_4',   name: '川贝母',         image: getImageUrl('medicine_collage_7.jpg'),   originalPrice: 268, discountedPrice: 228, categoryId: 'herbs',      description: '四川川贝母，润肺止咳',   stock: 25,  tags: ['川贝', '润肺'] },
  { id: 'health_1',  name: '灵芝孢子粉胶囊', image: getImageUrl('product_jars_7.jpg'),       originalPrice: 368, discountedPrice: 298, categoryId: 'health',     description: '破壁灵芝孢子粉',         stock: 40,  tags: ['灵芝', '孢子粉'] },
  { id: 'health_2',  name: '蜂胶软胶囊',     image: getImageUrl('product_jars_3.jpg'),       originalPrice: 188, discountedPrice: 158, categoryId: 'health',     description: '天然蜂胶，抗菌消炎',     stock: 70,  tags: ['蜂胶', '抗菌'] },
  { id: 'health_3',  name: '虫草花胶囊',     image: getImageUrl('product_jars_4.jpg'),       originalPrice: 288, categoryId: 'health',     description: '人工培育虫草花',         stock: 35,  tags: ['虫草花', '滋补'] },
  { id: 'supplements_1', name: '复合维生素片',  image: getImageUrl('product_jars_8.jpg'),    originalPrice: 128, discountedPrice: 98,  categoryId: 'supplements', description: '多种维生素矿物质',       stock: 100, tags: ['维生素', '营养'] },
  { id: 'supplements_2', name: '钙铁锌硒片',  image: getImageUrl('powder_elements_6.jpg'),   originalPrice: 88, discountedPrice: 68,  categoryId: 'supplements', description: '四合一微量元素补充',     stock: 80,  tags: ['钙', '铁'] },
  { id: 'supplements_3', name: '深海鱼油胶囊',image: getImageUrl('powder_elements_8.jpg'),   originalPrice: 198, discountedPrice: 168, categoryId: 'supplements', description: '深海鱼油，保护心血管',    stock: 60,  tags: ['鱼油', '深海'] },
];

const MOCK_CATEGORIES: CategoryItem[] = [
  { id: 'welfare',     name: '惠民专区',     icon: '', sortOrder: 1 },
  { id: 'tea',         name: '爆款茶饮',     icon: '', sortOrder: 2 },
  { id: 'activity',    name: '活动专区',     icon: '', sortOrder: 3 },
  { id: 'herbs',       name: '中药材',       icon: '', sortOrder: 4 },
  { id: 'health',      name: '保健品',       icon: '', sortOrder: 5 },
  { id: 'supplements', name: '营养补充',     icon: '', sortOrder: 6 },
];

// ==================== 服务实现 ====================

export class ProductApi {
  /** 获取全部分类（按 sortOrder 排序） */
  static async getCategories(): Promise<CategoryItem[]> {
    if (IS_DEV_MODE) {
      return this._mockCategories();
    }
    return this._apiCategories();
  }

  /** 获取所有商品（按分类 ID 分组） */
  static async getProductsByCategory(): Promise<Map<string, ProductItem[]>> {
    if (IS_DEV_MODE) {
      return this._mockProductsByCategory();
    }
    return this._apiProductsByCategory();
  }

  /** 获取全部商品列表 */
  static async getAllProducts(): Promise<ProductItem[]> {
    if (IS_DEV_MODE) {
      return this._mockProducts();
    }
    return this._apiProducts();
  }

  // ---- 本地 mock ----

  private static async _mockProducts(): Promise<ProductItem[]> {
    await new Promise(r => setTimeout(r, 100));
    return MOCK_PRODUCTS;
  }

  private static async _mockCategories(): Promise<CategoryItem[]> {
    await new Promise(r => setTimeout(r, 100));
    return MOCK_CATEGORIES.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  private static async _mockProductsByCategory(): Promise<Map<string, ProductItem[]>> {
    const products = await this._mockProducts();
    const map = new Map<string, ProductItem[]>();
    for (const p of products) {
      if (!map.has(p.categoryId)) map.set(p.categoryId, []);
      map.get(p.categoryId)!.push(p);
    }
    return map;
  }

  // ---- API 接口 ----

  private static async _apiProducts(): Promise<ProductItem[]> {
    try {
      const res = await wx.request({ url: `${API_BASE_URL}/api/products`, method: 'GET' });
      return (res.data.data || []).map(p => ({
        id: p.id,
        name: p.name,
        image: p.image,
        originalPrice: p.originalPrice,
        discountedPrice: p.discountedPrice,
        categoryId: p.categoryId,
        description: p.description,
        stock: p.stock,
        tags: p.tags,
      }));
    } catch (e) {
      console.warn('[ProductApi] API 不可用，回退 mock:', e);
      return this._mockProducts();
    }
  }

  private static async _apiCategories(): Promise<CategoryItem[]> {
    try {
      const res = await wx.request({ url: `${API_BASE_URL}/api/categories`, method: 'GET' });
      return (res.data.data || []).map(c => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        sortOrder: c.sortOrder,
      }));
    } catch (e) {
      console.warn('[ProductApi] 分类 API 不可用，回退 mock:', e);
      return this._mockCategories();
    }
  }

  private static async _apiProductsByCategory(): Promise<Map<string, ProductItem[]>> {
    const products = await this._apiProducts();
    const map = new Map<string, ProductItem[]>();
    for (const p of products) {
      if (!map.has(p.categoryId)) map.set(p.categoryId, []);
      map.get(p.categoryId)!.push(p);
    }
    return map;
  }
}
