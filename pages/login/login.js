const REQUEST_URL = getApp().globalData.REQUEST_URL

Page({
  toRegister() {
    wx.redirectTo({
      url: '/pages/register/register',
    })
  },
  toFindpwd() {
    wx.redirectTo({
      url: '/pages/findpwd/findpwd',
    })
  },
  checkForm: function () {
    let valid = true
    if (!this.data.form.username) {
      wx.showToast({
        title: '请输入手机号',
        duration: 2000,
        icon: 'none'
      })
      valid = false
    } else if (this.data.form.username.length !== 11) {
      wx.showToast({
        title: '手机号必须为11位',
        duration: 2000,
        icon: 'none'
      })
      valid = false
    } else if (!this.data.form.password) {
      wx.showToast({
        title: '请输入密码',
        duration: 2000,
        icon: 'none'
      })
      valid = false
    }
    return valid
  },
  login: function () {
    let valid = this.checkForm();
    if (valid) {
      wx.showLoading({
        title: '正在登陆...',
      })
      wx.request({
        url: `${REQUEST_URL}/login?username=${this.data.form.username}&password=${this.data.form.password}`,
        method: 'post',
        success: function (res) {
          console.log(res);
          wx.hideLoading()
          if (res.data.code === 500) {
            wx.showToast({
              title: res.data.message,
              duration: 2000,
              icon: 'none'
            })   
          } else {
            wx.setStorageSync('userInfo', res.data)
            wx.setStorageSync('cookie', res.header['Set-Cookie']);
            wx.reLaunch({
              url: '../index/index',
            })
          }
        },
        fail () {
          wx.hideLoading()
          wx.showToast({
            title: '登录时出错，请重试',
            icon: 'none',
            duration: 2000
          })
        }
      })
    }
  },
  inputChange: function (e) {
    let { field } = e.currentTarget.dataset
    this.setData({
      [`form.${field}`]: e.detail.value
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
    form: {
      username: '',
      password: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('cookie')
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
    wx.hideHomeButton()
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