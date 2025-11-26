/**
 * Product data service for loading and managing product data
 */

import { validateProductImages, fixInvalidImagePaths } from '../utils/image-validator';

/**
 * Mock product data based on the design requirements
 * In a real application, this would come from an API
 */
const MOCK_PRODUCTS: Product[] = [
  // 惠民专区产品
  {
    id: 'welfare-001',
    name: '黄芪党参茶',
    image: '/images/imgs/herb_ingredients_0.jpg',
    originalPrice: 89.00,
    discountedPrice: 59.00,
    categoryId: 'welfare',
    description: '精选优质黄芪党参，补气养血，增强免疫力',
    stock: 25,
    tags: ['热销', '补气']
  },
  {
    id: 'welfare-002',
    name: '枸杞菊花茶',
    image: '/images/imgs/herb_ingredients_3.jpg',
    originalPrice: 68.00,
    discountedPrice: 45.00,
    categoryId: 'welfare',
    description: '清肝明目，滋阴补肾，办公室必备',
    stock: 18,
    tags: ['明目', '养肝']
  },
  {
    id: 'welfare-003',
    name: '红枣桂圆茶',
    image: '/images/imgs/herb_ingredients_5.jpeg',
    originalPrice: 78.00,
    discountedPrice: 52.00,
    categoryId: 'welfare',
    description: '补血安神，美容养颜，女性首选',
    stock: 32,
    tags: ['补血', '美容']
  },

  // 爆款茶饮产品
  {
    id: 'tea-001',
    name: '陈皮普洱茶',
    image: '/images/imgs/tea_decoration_3.jpg',
    originalPrice: 128.00,
    discountedPrice: 98.00,
    categoryId: 'tea',
    description: '十年陈皮配优质普洱，理气健脾，消食化痰',
    stock: 15,
    tags: ['爆款', '消食']
  },
  {
    id: 'tea-002',
    name: '玫瑰花茶',
    image: '/images/imgs/tea_decoration_7.png',
    originalPrice: 88.00,
    discountedPrice: 66.00,
    categoryId: 'tea',
    description: '精选平阴玫瑰，疏肝解郁，美容养颜',
    stock: 28,
    tags: ['美容', '解郁']
  },
  {
    id: 'tea-003',
    name: '柠檬蜂蜜茶',
    image: '/images/imgs/tea_background_5.jpg',
    originalPrice: 58.00,
    categoryId: 'tea',
    description: '天然柠檬配野生蜂蜜，清热解毒，润肺止咳',
    stock: 42,
    tags: ['清热', '润肺']
  },

  // 活动专区产品
  {
    id: 'activity-001',
    name: '三七粉胶囊',
    image: '/images/imgs/gift_box_8.jpg',
    originalPrice: 198.00,
    discountedPrice: 138.00,
    categoryId: 'activity',
    description: '云南文山三七，活血化瘀，降血脂血压',
    stock: 12,
    tags: ['限时', '活血']
  },
  {
    id: 'activity-002',
    name: '灵芝孢子粉',
    image: '/images/imgs/medicine_collage_2.jpg',
    originalPrice: 288.00,
    discountedPrice: 199.00,
    categoryId: 'activity',
    description: '破壁灵芝孢子粉，增强免疫，抗疲劳',
    stock: 8,
    tags: ['特价', '免疫']
  },

  // 中药材产品
  {
    id: 'herbs-001',
    name: '当归片',
    image: '/images/imgs/product_jars_3.jpg',
    originalPrice: 45.00,
    categoryId: 'herbs',
    description: '甘肃岷县当归，补血调经，润肠通便',
    stock: 35,
    tags: ['补血', '调经']
  },
  {
    id: 'herbs-002',
    name: '川贝母',
    image: '/images/imgs/product_jars_4.jpg',
    originalPrice: 168.00,
    discountedPrice: 148.00,
    categoryId: 'herbs',
    description: '四川优质川贝，清热润肺，化痰止咳',
    stock: 22,
    tags: ['润肺', '止咳']
  },
  {
    id: 'herbs-003',
    name: '人参片',
    image: '/images/imgs/product_jars_8.jpg',
    originalPrice: 298.00,
    discountedPrice: 258.00,
    categoryId: 'herbs',
    description: '长白山人参，大补元气，复脉固脱',
    stock: 6,
    tags: ['大补', '元气']
  },

  // 保健品产品
  {
    id: 'health-001',
    name: '维生素C片',
    image: '/images/imgs/product_jars_7.jpg',
    originalPrice: 39.00,
    discountedPrice: 29.00,
    categoryId: 'health',
    description: '天然维生素C，增强免疫力，抗氧化',
    stock: 58,
    tags: ['免疫', '抗氧化']
  },
  {
    id: 'health-002',
    name: '钙片',
    image: '/images/imgs/medicine_collage_7.jpg',
    originalPrice: 68.00,
    discountedPrice: 48.00,
    categoryId: 'health',
    description: '高钙配方，强健骨骼，预防骨质疏松',
    stock: 45,
    tags: ['补钙', '骨骼']
  },

  // 营养补充产品
  {
    id: 'supplements-001',
    name: '蛋白粉',
    image: '/images/imgs/powder_elements_3.png',
    originalPrice: 158.00,
    discountedPrice: 128.00,
    categoryId: 'supplements',
    description: '优质乳清蛋白，增强体质，促进肌肉生长',
    stock: 24,
    tags: ['蛋白', '健身']
  },
  {
    id: 'supplements-002',
    name: '胶原蛋白肽',
    image: '/images/imgs/powder_elements_6.jpg',
    originalPrice: 188.00,
    discountedPrice: 148.00,
    categoryId: 'supplements',
    description: '小分子胶原蛋白肽，美容养颜，延缓衰老',
    stock: 16,
    tags: ['美容', '抗衰']
  },

  // 更多惠民专区产品
  {
    id: 'welfare-004',
    name: '山楂决明子茶',
    image: '/images/imgs/tea_background_7.jpg',
    originalPrice: 56.00,
    discountedPrice: 38.00,
    categoryId: 'welfare',
    description: '山楂决明子，降脂明目，消食健胃',
    stock: 42,
    tags: ['降脂', '明目']
  },
  {
    id: 'welfare-005',
    name: '薏米红豆茶',
    image: '/images/imgs/tea_background_9.jpg',
    originalPrice: 48.00,
    discountedPrice: 32.00,
    categoryId: 'welfare',
    description: '薏米红豆，祛湿健脾，美容养颜',
    stock: 36,
    tags: ['祛湿', '健脾']
  },

  // 更多茶饮产品
  {
    id: 'tea-004',
    name: '茉莉花茶',
    image: '/images/imgs/tea_decoration_8.png',
    originalPrice: 78.00,
    discountedPrice: 58.00,
    categoryId: 'tea',
    description: '优质茉莉花茶，清香怡人，安神助眠',
    stock: 24,
    tags: ['清香', '安神']
  },
  {
    id: 'tea-005',
    name: '龙井绿茶',
    image: '/images/imgs/green_plants_1.jpg',
    originalPrice: 168.00,
    discountedPrice: 128.00,
    categoryId: 'tea',
    description: '西湖龙井，清香甘醇，提神醒脑',
    stock: 18,
    tags: ['龙井', '提神']
  },

  // 更多活动专区产品
  {
    id: 'activity-003',
    name: '养生礼盒套装',
    image: '/images/imgs/gift_box_0.jpg',
    originalPrice: 388.00,
    discountedPrice: 268.00,
    categoryId: 'activity',
    description: '精选养生产品组合，送礼佳品',
    stock: 15,
    tags: ['礼盒', '养生']
  },
  {
    id: 'activity-004',
    name: '新年特惠装',
    image: '/images/imgs/gift_box_5.jpg',
    originalPrice: 298.00,
    discountedPrice: 198.00,
    categoryId: 'activity',
    description: '新年特惠，多种中药材组合装',
    stock: 20,
    tags: ['新年', '特惠']
  },

  // 更多中药材产品
  {
    id: 'herbs-004',
    name: '枸杞子',
    image: '/images/imgs/medicine_collage_9.jpg',
    originalPrice: 68.00,
    discountedPrice: 48.00,
    categoryId: 'herbs',
    description: '宁夏枸杞，滋阴补肾，明目养肝',
    stock: 58,
    tags: ['滋阴', '明目']
  },
  {
    id: 'herbs-005',
    name: '黄芪片',
    image: '/images/imgs/warm_background_1.jpg',
    originalPrice: 52.00,
    categoryId: 'herbs',
    description: '内蒙古黄芪，补气固表，利水消肿',
    stock: 45,
    tags: ['补气', '固表']
  },

  // 更多保健品产品
  {
    id: 'health-003',
    name: '复合维生素',
    image: '/images/imgs/warm_background_5.jpg',
    originalPrice: 89.00,
    discountedPrice: 68.00,
    categoryId: 'health',
    description: '多种维生素矿物质，全面营养补充',
    stock: 32,
    tags: ['维生素', '营养']
  },
  {
    id: 'health-004',
    name: '鱼油软胶囊',
    image: '/images/imgs/warm_background_7.jpg',
    originalPrice: 128.00,
    discountedPrice: 98.00,
    categoryId: 'health',
    description: '深海鱼油，保护心血管，增强记忆',
    stock: 28,
    tags: ['鱼油', '心血管']
  },

  // 更多营养补充产品
  {
    id: 'supplements-003',
    name: '螺旋藻片',
    image: '/images/imgs/green_plants_3.jpg',
    originalPrice: 98.00,
    discountedPrice: 78.00,
    categoryId: 'supplements',
    description: '天然螺旋藻，增强免疫，抗疲劳',
    stock: 22,
    tags: ['螺旋藻', '免疫']
  },
  {
    id: 'supplements-004',
    name: '益生菌粉',
    image: '/images/imgs/green_plants_6.jpg',
    originalPrice: 158.00,
    discountedPrice: 118.00,
    categoryId: 'supplements',
    description: '多种益生菌，调节肠道，促进消化',
    stock: 35,
    tags: ['益生菌', '肠道']
  }
];

/**
 * Service response interface for product operations
 */
interface ProductServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
  hasMore?: boolean;
}

/**
 * Product filter options
 */
interface ProductFilterOptions {
  /** Category ID to filter by */
  categoryId?: string;
  /** Search keyword */
  keyword?: string;
  /** Price range */
  priceRange?: {
    min: number;
    max: number;
  };
  /** Tags to filter by */
  tags?: string[];
  /** Sort options */
  sortBy?: 'price' | 'name' | 'stock' | 'popularity';
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
  /** Pagination */
  page?: number;
  /** Page size */
  pageSize?: number;
}

/**
 * Product service class for handling product-related operations
 */
export class ProductService {
  /**
   * 验证并修复产品图片路径
   */
  private static validateAndFixImages(products: Product[]): Product[] {
    const validation = validateProductImages(products);
    
    if (!validation.valid) {
      console.warn('Found invalid image paths:', validation.invalidPaths);
      return fixInvalidImagePaths(products);
    }
    
    return products;
  }
  /**
   * Load products by category
   */
  static async loadProductsByCategory(categoryId: string): Promise<ProductServiceResponse<Product[]>> {
    try {
      console.log('Loading products for category:', categoryId);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Filter products by category
      const categoryProducts = MOCK_PRODUCTS.filter(product => product.categoryId === categoryId);
      
      // Validate and fix image paths
      const validatedProducts = this.validateAndFixImages(categoryProducts);
      
      // Sort by stock (available first) and then by name
      const sortedProducts = validatedProducts.sort((a, b) => {
        if (a.stock === 0 && b.stock > 0) return 1;
        if (a.stock > 0 && b.stock === 0) return -1;
        return a.name.localeCompare(b.name);
      });
      
      return {
        success: true,
        data: sortedProducts,
        total: sortedProducts.length
      };
    } catch (error) {
      console.error('Failed to load products by category:', error);
      return {
        success: false,
        error: '加载产品失败，请重试'
      };
    }
  }

  /**
   * Load all products with filtering options
   */
  static async loadProducts(options: ProductFilterOptions = {}): Promise<ProductServiceResponse<Product[]>> {
    try {
      console.log('Loading products with options:', options);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let filteredProducts = [...MOCK_PRODUCTS];
      
      // Filter by category
      if (options.categoryId) {
        filteredProducts = filteredProducts.filter(product => product.categoryId === options.categoryId);
      }
      
      // Filter by keyword
      if (options.keyword) {
        const keyword = options.keyword.toLowerCase();
        filteredProducts = filteredProducts.filter(product => 
          product.name.toLowerCase().includes(keyword) ||
          (product.description && product.description.toLowerCase().includes(keyword)) ||
          (product.tags && product.tags.some(tag => tag.toLowerCase().includes(keyword)))
        );
      }
      
      // Filter by price range
      if (options.priceRange) {
        filteredProducts = filteredProducts.filter(product => {
          const price = product.discountedPrice || product.originalPrice;
          return price >= options.priceRange!.min && price <= options.priceRange!.max;
        });
      }
      
      // Filter by tags
      if (options.tags && options.tags.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
          product.tags && product.tags.some(tag => options.tags!.includes(tag))
        );
      }
      
      // Sort products
      if (options.sortBy) {
        filteredProducts.sort((a, b) => {
          let comparison = 0;
          
          switch (options.sortBy) {
            case 'price':
              const priceA = a.discountedPrice || a.originalPrice;
              const priceB = b.discountedPrice || b.originalPrice;
              comparison = priceA - priceB;
              break;
            case 'name':
              comparison = a.name.localeCompare(b.name);
              break;
            case 'stock':
              comparison = a.stock - b.stock;
              break;
            case 'popularity':
              // Mock popularity based on stock (lower stock = more popular)
              comparison = a.stock - b.stock;
              break;
          }
          
          return options.sortOrder === 'desc' ? -comparison : comparison;
        });
      }
      
      // Pagination
      const page = options.page || 1;
      const pageSize = options.pageSize || 20;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: paginatedProducts,
        total: filteredProducts.length,
        hasMore: endIndex < filteredProducts.length
      };
    } catch (error) {
      console.error('Failed to load products:', error);
      return {
        success: false,
        error: '加载产品失败，请重试'
      };
    }
  }

  /**
   * Get product by ID
   */
  static async getProductById(productId: string): Promise<ProductServiceResponse<Product>> {
    try {
      console.log('Getting product by ID:', productId);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const product = MOCK_PRODUCTS.find(p => p.id === productId);
      
      if (!product) {
        return {
          success: false,
          error: '产品不存在'
        };
      }
      
      return {
        success: true,
        data: product
      };
    } catch (error) {
      console.error('Failed to get product:', error);
      return {
        success: false,
        error: '获取产品信息失败'
      };
    }
  }

  /**
   * Search products by keyword
   */
  static async searchProducts(keyword: string): Promise<ProductServiceResponse<Product[]>> {
    return this.loadProducts({ keyword });
  }

  /**
   * Get featured products (products with discounts)
   */
  static async getFeaturedProducts(): Promise<ProductServiceResponse<Product[]>> {
    try {
      console.log('Getting featured products...');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const featuredProducts = MOCK_PRODUCTS
        .filter(product => product.discountedPrice && product.discountedPrice < product.originalPrice)
        .sort((a, b) => {
          const discountA = (a.originalPrice - (a.discountedPrice || a.originalPrice)) / a.originalPrice;
          const discountB = (b.originalPrice - (b.discountedPrice || b.originalPrice)) / b.originalPrice;
          return discountB - discountA; // Sort by discount percentage descending
        })
        .slice(0, 10); // Top 10 featured products
      
      return {
        success: true,
        data: featuredProducts,
        total: featuredProducts.length
      };
    } catch (error) {
      console.error('Failed to get featured products:', error);
      return {
        success: false,
        error: '获取特色产品失败'
      };
    }
  }

  /**
   * Get products by tags
   */
  static async getProductsByTags(tags: string[]): Promise<ProductServiceResponse<Product[]>> {
    return this.loadProducts({ tags });
  }

  /**
   * Refresh product data (for pull-to-refresh functionality)
   */
  static async refreshProducts(categoryId?: string): Promise<ProductServiceResponse<Product[]>> {
    try {
      console.log('Refreshing products...');
      
      // Simulate longer network delay for refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (categoryId) {
        return this.loadProductsByCategory(categoryId);
      } else {
        return this.loadProducts();
      }
    } catch (error) {
      console.error('Failed to refresh products:', error);
      return {
        success: false,
        error: '刷新产品失败，请重试'
      };
    }
  }
}