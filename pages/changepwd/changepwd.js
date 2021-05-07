const REQUEST_URL = getApp().globalData.REQUEST_URL

Page({
  login: function () {
    this.selectComponent('#form').validate((valid, errors) => {
      if (!valid) {
        let firstError = Object.keys(errors)
        if (firstError.length) {
          wx.showToast({
            title: errors[firstError[0]].message,
            duration: 2000,
            icon: 'none'
          })
        }
      } else {
        wx.showLoading({
          title: '正在修改...',
        })
        wx.request({
          url: `${REQUEST_URL}/user/pwd`,
          method: 'post',
          header: {
            Cookie: wx.getStorageSync('cookie')
          },
          data: this.data.form,
          success: function (res) {
            wx.hideLoading()
            if (res.data.code === 400) {
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
            } else if (res.data.code === 200) {
              wx.showToast({
                title: res.data.message + '。稍后为您跳转至重新登录',
                icon: 'none',
                duration: 1000,
              })
              setTimeout(() => {
                wx.removeStorageSync('userInfo')
                wx.removeStorageSync('cookie')
                wx.reLaunch({
                  url: '/pages/login/login',
                })
              }, 1000)
            } else {
              wx.showToast({
                title: res.data.message,
                duration: 2000,
                icon: 'none'
              })
            }
          },
          fail: function () {
            wx.hideLoading()
            wx.showToast({
              title: '修改失败，请重试',
              icon: 'none',
              duration: 2000
            })
          }
        })
      }
    })
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
    rules: [
      {
        name: 'oldPassword',
        rules: { required: true, message: '请输入原密码'}
      },
      {
        name: 'newPassword',
        rules: { required: true, message: '请输入新密码' }
      },
      {
        name: 'confirmpassword',
        rules: [
          { required: true, message: '再次填写确认' },
          { equalTo: 'newPassword', message: '两次输入密码不一致'}
        ]
      }
    ],
    form: {}
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