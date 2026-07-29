// components/cart-item/index.ts

Component({
  properties: {
    item: {
      type: Object,
      value: null,
      observer: 'onItemChange'
    },
    selected: {
      type: Boolean,
      value: false
    },
    editMode: {
      type: Boolean,
      value: false
    }
  },

  data: {
    stockStatus: 'normal' as 'normal' | 'low' | 'out'
  },

  lifetimes: {
    attached() {
      this.updateStockStatus();
    }
  },

  methods: {
    onItemChange(item: any) {
      if (item) {
        this.updateStockStatus();
      }
    },

    updateStockStatus() {
      const { item } = this.properties;
      if (!item || !item.product) return;

      let status: 'normal' | 'low' | 'out' = 'normal';
      if (item.product.stock <= 0) {
        status = 'out';
      } else if (item.product.stock <= 5) {
        status = 'low';
      }

      this.setData({ stockStatus: status });
    },

    onSelectToggle() {
      const { item, editMode } = this.properties;
      if (!item) return;

      this.triggerEvent('select', {
        productId: item.productId,
        selected: !this.properties.selected
      }, { bubbles: true, composed: true });
    },

    onQuantityChange(e: WechatMiniprogram.TouchEvent) {
      const { item } = this.properties;
      if (!item || !item.product) return;

      const type = e.currentTarget.dataset.type;
      let newQuantity = item.quantity;

      if (type === 'minus' && newQuantity > 1) {
        newQuantity--;
      } else if (type === 'plus' && newQuantity < item.product.stock) {
        newQuantity++;
      } else {
        return;
      }

      this.triggerEvent('quantitychange', {
        productId: item.productId,
        quantity: newQuantity
      }, { bubbles: true, composed: true });
    },

    onDeleteTap() {
      const { item } = this.properties;
      if (!item) return;

      wx.showModal({
        title: '提示',
        content: '确定要删除该商品吗？',
        confirmText: '删除',
        confirmColor: '#FF4D4F',
        success: (res) => {
          if (res.confirm) {
            this.triggerEvent('delete', {
              productId: item.productId,
              productName: item.product?.name
            }, { bubbles: true, composed: true });
          }
        }
      });
    },

    onProductTap() {
      const { item } = this.properties;
      if (!item) return;

      this.triggerEvent('producttap', {
        productId: item.productId,
        product: item.product
      }, { bubbles: true, composed: true });
    },

    onSpecTap() {
      const { item } = this.properties;
      if (!item || !item.product.specs || item.product.specs.length === 0) return;

      this.triggerEvent('spectap', {
        productId: item.productId,
        currentSpec: item.selectedSpec || null,
        availableSpecs: item.product.specs
      }, { bubbles: true, composed: true });
    },

    getSelectedSpecText(): string {
      const { item } = this.properties;
      if (!item || !item.selectedSpec) return '请选择规格';

      const parts: string[] = [];
      if (item.selectedSpec.size) parts.push(item.selectedSpec.size);
      if (item.selectedSpec.package) parts.push(item.selectedSpec.package);
      if (item.selectedSpec.count && item.selectedSpec.count > 1) {
        parts.push(`${item.selectedSpec.count}${item.selectedSpec.unit || '件'}`);
      }
      return parts.join('*') || '默认规格';
    },

    getDisplayPrice(): string {
      const { item } = this.properties;
      if (!item || !item.product) return '¥0.00';
      const price = item.product.discountedPrice || item.product.originalPrice;
      return `¥${price.toFixed(2)}`;
    },

    getOriginalPrice(): string {
      const { item } = this.properties;
      if (!item || !item.product) return '¥0.00';
      return `¥${item.product.originalPrice.toFixed(2)}`;
    },

    hasDiscount(): boolean {
      const { item } = this.properties;
      return !!(item && item.product && item.product.discountedPrice &&
                item.product.discountedPrice < item.product.originalPrice);
    },

    onImageLoad() {
      // 图片加载完成
    },

    onImageError() {
      // 图片加载失败
    }
  }
});