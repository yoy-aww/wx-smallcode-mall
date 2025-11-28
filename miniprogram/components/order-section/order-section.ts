import { OrderCounts, OrderStatus, OrderStatusInfo } from '../../models/order';
import { ORDER_STATUS_LABELS, ORDER_STATUS_ICONS } from '../../constants/profile';

interface OrderSectionData {
  orderStatusItems: OrderStatusInfo[];
}

Component({
  /**
   * Component properties
   */
  properties: {
    orderCounts: {
      type: Object,
      value: {
        pending_payment: 0,
        pending_shipment: 0,
        pending_receipt: 0,
        pending_review: 0,
        refund_aftersales: 0,
        total: 0
      } as OrderCounts
    },
    loading: {
      type: Boolean,
      value: false
    }
  },

  /**
   * Component initial data
   */
  data: {
    orderStatusItems: []
  } as OrderSectionData,

  /**
   * Component lifecycle methods
   */
  lifetimes: {
    attached() {
      this._updateOrderStatusItems();
    }
  },

  /**
   * Property observers
   */
  observers: {
    'orderCounts, loading'() {
      this._updateOrderStatusItems();
    }
  },

  /**
   * Component methods
   */
  methods: {
    /**
     * Handle "View All Orders" tap
     */
    onViewAllOrders() {
      this.triggerEvent('viewAllOrders', {}, {});
    },

    /**
     * Handle individual order status tap
     */
    onOrderStatusTap(event: WechatMiniprogram.TouchEvent) {
      const { status } = event.currentTarget.dataset;
      if (status && !this.data.loading) {
        this.triggerEvent('orderStatusTap', { status: status as OrderStatus }, {});
      }
    },

    /**
     * Update order status items based on current order counts
     */
    _updateOrderStatusItems() {
      const orderCounts = this.data.orderCounts as OrderCounts;
      const loading = this.data.loading;

      // Handle null or undefined orderCounts
      const safeOrderCounts = orderCounts || {
        pending_payment: 0,
        pending_shipment: 0,
        pending_receipt: 0,
        pending_review: 0,
        refund_aftersales: 0,
        total: 0
      };

      const statusOrder: OrderStatus[] = [
        'pending_payment',
        'pending_shipment', 
        'pending_receipt',
        'pending_review',
        'refund_aftersales'
      ];

      const orderStatusItems: OrderStatusInfo[] = statusOrder.map(status => ({
        status,
        title: ORDER_STATUS_LABELS[status],
        icon: ORDER_STATUS_ICONS[status],
        count: loading ? 0 : (safeOrderCounts[status] || 0)
      }));

      this.setData({
        orderStatusItems
      });
    }
  }
});