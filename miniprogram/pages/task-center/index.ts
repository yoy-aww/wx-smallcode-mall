// pages/task-center/index.ts
Page({
  data: {
    tasks: [] as any[],
    loading: true
  },

  onLoad() {
    this.loadTasks();
  },

  async loadTasks() {
    try {
      this.setData({ loading: true });
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockTasks = [
        { id: '1', name: '每日签到', reward: '10积分', status: 'available', completed: false },
        { id: '2', name: '分享商品', reward: '5积分', status: 'available', completed: false },
        { id: '3', name: '完善资料', reward: '20积分', status: 'completed', completed: true }
      ];
      
      this.setData({ tasks: mockTasks, loading: false });
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  onTaskTap(e: any) {
    const taskId = e.currentTarget.dataset.taskId;
    const task = this.data.tasks.find(t => t.id === taskId);
    
    if (task && !task.completed) {
      wx.showModal({
        title: '完成任务',
        content: `确定完成任务"${task.name}"吗？`,
        success: (res) => {
          if (res.confirm) {
            wx.showToast({
              title: '任务完成，获得' + task.reward,
              icon: 'success'
            });
            this.loadTasks();
          }
        }
      });
    }
  }
});