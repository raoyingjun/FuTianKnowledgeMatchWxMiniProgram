const REQUEST_URL = getApp().globalData.REQUEST_URL

Page({
  confirmLogout: function (e) {
    wx.showLoading({
      title: '正在登出...',
    })
    wx.request({
      url: `${REQUEST_URL}/logout`,
      method: 'get',
      success: function ({ data }) {
        wx.hideLoading()
        if (data.code === 200) {
          wx.reLaunch({
            url: '../login/login',
          })
        } else {
          wx.showToast({
            title: data.message,
            duration: 2000,
            icon: 'none'
          })   
        }
      },
      fail () {
        wx.hideLoading()
        wx.showToast({
          title: '退出登录时出错，请重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  logout: function () {
    this.setData({
      actionSheetVisible: true
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
    actionSheetVisible: false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      uImg: wx.getStorageSync('userInfo').uimg
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})