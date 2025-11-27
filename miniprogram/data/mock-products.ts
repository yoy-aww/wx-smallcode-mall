/**
 * 产品模拟数据
 * 包含所有分类的产品信息，使用本项目的静态图片资源
 */

// 产品模拟数据
export const MOCK_PRODUCTS: { [key: string]: Product } = {
  // 惠民专区产品
  'welfare_1': {
    id: 'welfare_1',
    name: '惠民降压茶',
    image: '/images/imgs/tea_background_5.jpg',
    originalPrice: 89.00,
    discountedPrice: 59.00,
    categoryId: 'welfare',
    description: '政府补贴惠民产品，有效降血压，精选山楂、决明子等天然草本',
    stock: 100,
    tags: ['惠民', '降压', '政府补贴']
  },
  'welfare_2': {
    id: 'welfare_2',
    name: '惠民养胃粉',
    image: '/images/imgs/powder_elements_3.png',
    originalPrice: 128.00,
    discountedPrice: 88.00,
    categoryId: 'welfare',
    description: '惠民专供，温和养胃护胃，采用传统工艺研磨而成',
    stock: 80,
    tags: ['惠民', '养胃', '温和']
  },
  'welfare_3': {
    id: 'welfare_3',
    name: '惠民安神茶',
    image: '/images/imgs/tea_decoration_3.jpg',
    originalPrice: 68.00,
    discountedPrice: 45.00,
    categoryId: 'welfare',
    description: '改善睡眠质量，惠民价格，含酸枣仁、茯苓等安神成分',
    stock: 120,
    tags: ['惠民', '安神', '助眠']
  },

  // 爆款茶饮产品
  'tea_1': {
    id: 'tea_1',
    name: '网红柠檬蜂蜜茶',
    image: '/images/imgs/tea_background_7.jpg',
    originalPrice: 58.00,
    discountedPrice: 39.00,
    categoryId: 'tea',
    description: '清香柠檬配天然蜂蜜，酸甜可口，富含维生素C',
    stock: 200,
    tags: ['爆款', '柠檬', '蜂蜜', '网红']
  },
  'tea_2': {
    id: 'tea_2',
    name: '玫瑰花茶礼盒',
    image: '/images/imgs/gift_box_5.jpg',
    originalPrice: 168.00,
    discountedPrice: 128.00,
    categoryId: 'tea',
    description: '精选玫瑰花瓣，美容养颜，精美礼盒包装',
    stock: 50,
    tags: ['爆款', '玫瑰', '美容', '礼盒']
  },
  'tea_3': {
    id: 'tea_3',
    name: '薄荷清凉茶',
    image: '/images/imgs/green_plants_3.jpg',
    originalPrice: 45.00,
    categoryId: 'tea',
    description: '天然薄荷叶，清热解暑，夏日必备饮品',
    stock: 150,
    tags: ['爆款', '薄荷', '清凉', '解暑']
  },

  // 活动专区产品
  'activity_1': {
    id: 'activity_1',
    name: '限时秒杀养生套装',
    image: '/images/imgs/gift_box_0.jpg',
    originalPrice: 299.00,
    discountedPrice: 199.00,
    categoryId: 'activity',
    description: '限时秒杀，养生三件套超值优惠，包含人参、枸杞、红枣',
    stock: 30,
    tags: ['秒杀', '套装', '限时', '超值']
  },
  'activity_2': {
    id: 'activity_2',
    name: '买二送一枸杞',
    image: '/images/imgs/herb_ingredients_0.jpg',
    originalPrice: 88.00,
    discountedPrice: 66.00,
    categoryId: 'activity',
    description: '宁夏枸杞，买二送一活动进行中，明目养肝佳品',
    stock: 80,
    tags: ['活动', '枸杞', '买二送一', '宁夏']
  },
  'activity_3': {
    id: 'activity_3',
    name: '新用户专享礼包',
    image: '/images/imgs/gift_box_8.jpg',
    originalPrice: 158.00,
    discountedPrice: 98.00,
    categoryId: 'activity',
    description: '新用户专享，多种中药材体验装，让您体验传统中医魅力',
    stock: 100,
    tags: ['新用户', '专享', '体验装', '礼包']
  },

  // 中药材产品
  'herbs_1': {
    id: 'herbs_1',
    name: '野生人参片',
    image: '/images/imgs/herb_ingredients_3.jpg',
    originalPrice: 588.00,
    discountedPrice: 488.00,
    categoryId: 'herbs',
    description: '长白山野生人参，大补元气，滋阴补阳，珍贵药材',
    stock: 15,
    tags: ['人参', '野生', '长白山', '大补']
  },
  'herbs_2': {
    id: 'herbs_2',
    name: '优质当归片',
    image: '/images/imgs/medicine_collage_2.jpg',
    originalPrice: 128.00,
    categoryId: 'herbs',
    description: '甘肃岷县当归，补血调经，妇科圣药，品质上乘',
    stock: 60,
    tags: ['当归', '补血', '调经', '甘肃']
  },
  'herbs_3': {
    id: 'herbs_3',
    name: '精选黄芪',
    image: '/images/imgs/herb_ingredients_5.jpeg',
    originalPrice: 98.00,
    discountedPrice: 78.00,
    categoryId: 'herbs',
    description: '内蒙古黄芪，补气固表，提升免疫力，道地药材',
    stock: 90,
    tags: ['黄芪', '补气', '固表', '内蒙古']
  },
  'herbs_4': {
    id: 'herbs_4',
    name: '川贝母',
    image: '/images/imgs/medicine_collage_7.jpg',
    originalPrice: 268.00,
    discountedPrice: 228.00,
    categoryId: 'herbs',
    description: '四川川贝母，润肺止咳，化痰平喘，珍贵川药',
    stock: 25,
    tags: ['川贝', '润肺', '止咳', '四川']
  },

  // 保健品产品
  'health_1': {
    id: 'health_1',
    name: '灵芝孢子粉胶囊',
    image: '/images/imgs/product_jars_7.jpg',
    originalPrice: 368.00,
    discountedPrice: 298.00,
    categoryId: 'health',
    description: '破壁灵芝孢子粉，增强免疫力，延缓衰老，现代工艺提取',
    stock: 40,
    tags: ['灵芝', '孢子粉', '免疫力', '破壁']
  },
  'health_2': {
    id: 'health_2',
    name: '蜂胶软胶囊',
    image: '/images/imgs/product_jars_3.jpg',
    originalPrice: 188.00,
    discountedPrice: 158.00,
    categoryId: 'health',
    description: '天然蜂胶，抗菌消炎，提高机体抵抗力，纯天然提取',
    stock: 70,
    tags: ['蜂胶', '抗菌', '消炎', '天然']
  },
  'health_3': {
    id: 'health_3',
    name: '虫草花胶囊',
    image: '/images/imgs/product_jars_4.jpg',
    originalPrice: 288.00,
    categoryId: 'health',
    description: '人工培育虫草花，滋补强身，补肺益肾，现代养生佳品',
    stock: 35,
    tags: ['虫草花', '滋补', '强身', '培育']
  },

  // 营养补充产品
  'supplements_1': {
    id: 'supplements_1',
    name: '复合维生素片',
    image: '/images/imgs/product_jars_8.jpg',
    originalPrice: 128.00,
    discountedPrice: 98.00,
    categoryId: 'supplements',
    description: '多种维生素矿物质，均衡营养，科学配比，日常保健必备',
    stock: 100,
    tags: ['维生素', '矿物质', '营养', '复合']
  },
  'supplements_2': {
    id: 'supplements_2',
    name: '钙铁锌硒片',
    image: '/images/imgs/powder_elements_6.jpg',
    originalPrice: 88.00,
    discountedPrice: 68.00,
    categoryId: 'supplements',
    description: '四合一微量元素补充，促进骨骼发育，增强体质',
    stock: 80,
    tags: ['钙', '铁', '锌', '硒', '微量元素']
  },
  'supplements_3': {
    id: 'supplements_3',
    name: '深海鱼油胶囊',
    image: '/images/imgs/powder_elements_8.jpg',
    originalPrice: 198.00,
    discountedPrice: 168.00,
    categoryId: 'supplements',
    description: '深海鱼油，保护心血管健康，富含DHA和EPA，进口原料',
    stock: 60,
    tags: ['鱼油', '深海', '心血管', '健康']
  }
};

// 按分类组织的产品数据
export const CATEGORY_PRODUCTS: { [key: string]: Product[] } = {
  'welfare': [
    MOCK_PRODUCTS['welfare_1'],
    MOCK_PRODUCTS['welfare_2'],
    MOCK_PRODUCTS['welfare_3']
  ],
  'tea': [
    MOCK_PRODUCTS['tea_1'],
    MOCK_PRODUCTS['tea_2'],
    MOCK_PRODUCTS['tea_3']
  ],
  'activity': [
    MOCK_PRODUCTS['activity_1'],
    MOCK_PRODUCTS['activity_2'],
    MOCK_PRODUCTS['activity_3']
  ],
  'herbs': [
    MOCK_PRODUCTS['herbs_1'],
    MOCK_PRODUCTS['herbs_2'],
    MOCK_PRODUCTS['herbs_3'],
    MOCK_PRODUCTS['herbs_4']
  ],
  'health': [
    MOCK_PRODUCTS['health_1'],
    MOCK_PRODUCTS['health_2'],
    MOCK_PRODUCTS['health_3']
  ],
  'supplements': [
    MOCK_PRODUCTS['supplements_1'],
    MOCK_PRODUCTS['supplements_2'],
    MOCK_PRODUCTS['supplements_3']
  ]
};

// 搜索用的所有产品列表
export const ALL_PRODUCTS: Product[] = Object.values(MOCK_PRODUCTS);

// 热门产品（用于搜索和推荐）
export const POPULAR_PRODUCTS: Product[] = [
  MOCK_PRODUCTS['welfare_1'],
  MOCK_PRODUCTS['tea_1'],
  MOCK_PRODUCTS['tea_2'],
  MOCK_PRODUCTS['herbs_1'],
  MOCK_PRODUCTS['health_1']
];