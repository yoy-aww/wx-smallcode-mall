/**
 * Category data service for loading and managing category data
 */

/**
 * Mock category data based on the design requirements
 * In a real application, this would come from an API
 */
const MOCK_CATEGORIES: Category[] = [
  {
    id: 'welfare',
    name: '惠民专区',
    icon: '',
    productCount: 15,
    sortOrder: 1
  },
  {
    id: 'tea',
    name: '爆款茶饮',
    icon: '',
    productCount: 8,
    sortOrder: 2
  },
  {
    id: 'activity',
    name: '活动专区',
    icon: '',
    productCount: 12,
    sortOrder: 3
  },
  {
    id: 'herbs',
    name: '中药材',
    icon: '',
    productCount: 25,
    sortOrder: 4
  },
  {
    id: 'health',
    name: '保健品',
    icon: '',
    productCount: 18,
    sortOrder: 5
  },
  {
    id: 'supplements',
    name: '营养补充',
    icon: '',
    productCount: 10,
    sortOrder: 6
  }
];

/**
 * Service response interface for category operations
 */
interface CategoryServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Category service class for handling category-related operations
 */
export class CategoryService {
  /**
   * Load all categories
   * Simulates network request with delay
   */
  static async loadCategories(): Promise<CategoryServiceResponse<Category[]>> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Sort categories by sortOrder
      const sortedCategories = [...MOCK_CATEGORIES].sort((a, b) => a.sortOrder - b.sortOrder);
      
      return {
        success: true,
        data: sortedCategories
      };
    } catch (error) {
      console.error('Failed to load categories:', error);
      return {
        success: false,
        error: '加载分类失败，请重试'
      };
    }
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(categoryId: string): Promise<CategoryServiceResponse<Category>> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const category = MOCK_CATEGORIES.find(cat => cat.id === categoryId);
      
      if (!category) {
        return {
          success: false,
          error: '分类不存在'
        };
      }
      
      return {
        success: true,
        data: category
      };
    } catch (error) {
      console.error('Failed to get category:', error);
      return {
        success: false,
        error: '获取分类信息失败'
      };
    }
  }

  /**
   * Refresh categories (for pull-to-refresh functionality)
   */
  static async refreshCategories(): Promise<CategoryServiceResponse<Category[]>> {
    try {
      // Simulate longer network delay for refresh
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // In a real app, this would fetch fresh data from the server
      const sortedCategories = [...MOCK_CATEGORIES].sort((a, b) => a.sortOrder - b.sortOrder);
      
      return {
        success: true,
        data: sortedCategories
      };
    } catch (error) {
      console.error('Failed to refresh categories:', error);
      return {
        success: false,
        error: '刷新分类失败，请重试'
      };
    }
  }

  /**
   * Get default category (first category in the list)
   */
  static getDefaultCategory(): Category | null {
    const sortedCategories = [...MOCK_CATEGORIES].sort((a, b) => a.sortOrder - b.sortOrder);
    return sortedCategories.length > 0 ? sortedCategories[0] : null;
  }
}