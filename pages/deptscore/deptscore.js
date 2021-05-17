const REQUEST_URL = getApp().globalData.REQUEST_URL

Page({
  getScore: function () {
    let that = this
    this.setData({
      loadingMsg: '加载中...',
    })
    wx.request({
      url: `${REQUEST_URL}/user/exam/list/top/${wx.getStorageSync('userInfo').principal.did}/${this.data.cid}`,
      method: 'get',
      header: {
        Cookie: wx.getStorageSync('cookie')
      },
      success: function ({
        data
      }) {
        if (data.code === 400) {
          wx.showModal({
            title: '提示',
            content: data.message,
            showCancel: false,
            confirmText: '重新登陆',
            success(res) {
              if (res.confirm) {
                wx.reLaunch({
                  url: '../login/login',
                })
              }
            }
          })
        } else if (data.code === 200) {
          that.data.list.push.apply(that.data.list, data.data)
          that.setData({
            list: that.data.list,
            loadingMsg: ''
          })
        } else {
          that.setData({
            loadingMsg: '没有更多了'
          })
        }
      },
      fail: function () {
        that.setData({
          loadingMsg: '获取本部门前十名成绩失败，请重试'
        })
      }
    })
  },
  toggleActive: function () {
    this.setData({
      list: []
    })
    this.getScore()
  },
  /**
   * 页面的初始数据
   */
  data: {
    loadingMsg: '',
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function ({
    cid,
    name
  }) {
    wx.setNavigationBarTitle({
      title: '本基层党组织分数榜-' + name,
    })
    this.setData({
      cid
    })
    this.getScore()
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