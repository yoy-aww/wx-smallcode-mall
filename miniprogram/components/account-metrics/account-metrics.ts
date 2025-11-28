import { AccountMetrics, AccountMetricType } from '../../models/account';

interface MetricItem {
  type: AccountMetricType;
  label: string;
  value: number;
  displayValue: string;
}

interface AccountMetricsData {
  metricItems: MetricItem[];
}

Component({
  /**
   * Component properties
   */
  properties: {
    metrics: {
      type: Object,
      value: {
        balance: 0,
        points: 0,
        cards: 0,
        coupons: 0
      } as AccountMetrics
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
    metricItems: []
  } as AccountMetricsData,

  /**
   * Component lifecycle methods
   */
  lifetimes: {
    attached() {
      this._updateMetricItems();
    }
  },

  /**
   * Property observers
   */
  observers: {
    'metrics, loading'() {
      this._updateMetricItems();
    }
  },

  /**
   * Component methods
   */
  methods: {
    /**
     * Handle metric item tap
     */
    onMetricTap(event: WechatMiniprogram.TouchEvent) {
      const { type } = event.currentTarget.dataset;
      if (type && !this.data.loading) {
        this.triggerEvent('metricTap', { type: type as AccountMetricType }, {});
      }
    },

    /**
     * Update metric items based on current metrics data
     */
    _updateMetricItems() {
      const metrics = this.data.metrics as AccountMetrics;
      const loading = this.data.loading;

      const metricItems: MetricItem[] = [
        {
          type: 'balance',
          label: '余额',
          value: metrics.balance,
          displayValue: loading ? '' : this._formatNumber(metrics.balance, 'currency')
        },
        {
          type: 'points',
          label: '积分',
          value: metrics.points,
          displayValue: loading ? '' : this._formatNumber(metrics.points)
        },
        {
          type: 'cards',
          label: '卡',
          value: metrics.cards,
          displayValue: loading ? '' : this._formatNumber(metrics.cards)
        },
        {
          type: 'coupons',
          label: '优惠券',
          value: metrics.coupons,
          displayValue: loading ? '' : this._formatNumber(metrics.coupons)
        }
      ];

      this.setData({
        metricItems
      });
    },

    /**
     * Format number for display
     */
    _formatNumber(value: number, type?: 'currency'): string {
      if (typeof value !== 'number' || isNaN(value)) {
        return '0';
      }

      // Handle currency formatting
      if (type === 'currency') {
        if (value === 0) {
          return '¥0';
        }
        
        // Format with 2 decimal places for currency
        const formatted = value.toFixed(2);
        
        // Add thousand separators for large amounts
        if (value >= 1000) {
          const parts = formatted.split('.');
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          return `¥${parts.join('.')}`;
        }
        
        return `¥${formatted}`;
      }

      // Handle regular number formatting
      if (value >= 10000) {
        // Format as "万" for numbers >= 10,000
        const wanValue = value / 10000;
        if (wanValue >= 10) {
          return `${Math.floor(wanValue)}万`;
        } else {
          return `${wanValue.toFixed(1)}万`;
        }
      } else if (value >= 1000) {
        // Add thousand separators
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }

      return value.toString();
    }
  }
});