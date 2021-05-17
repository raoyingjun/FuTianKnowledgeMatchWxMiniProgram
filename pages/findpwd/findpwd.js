const REQUEST_URL = getApp().globalData.REQUEST_URL
Page({
  findpwd() {
    let valid = this.checkForm();
    let that = this
    if (valid) {
      wx.showLoading({
        title: '正在找回...',
      })
      wx.request({
        url: `${REQUEST_URL}/user/retrieve/pwd`,
        method: 'put',
        data: this.data.form,
        success: function ({ data }) {
          console.log(data);
          wx.hideLoading()
          wx.showToast({
            title: data.message,
            duration: 2000,
            icon: 'none'
          })
          if (data.code === 200) {
            wx.showModal({
              title: '提示',
              content: data.message,
              confirmText: '去登录',
              cancelText: '关闭',
              success (res) {
                if (res.confirm) {
                  that.toLogin()
                }
              }
            })
          }
        },
        fail () {
          wx.hideLoading()
          wx.showToast({
            title: '找回时出错，请重试',
            icon: 'none',
            duration: 2000
          })
        }
      })
    }
  },
  toLogin() {
    wx.redirectTo({
      url: '../login/login',
    })
  },
  checkForm: function () {
    let valid = true
    if (!this.data.form.username){
      wx.showToast({
        title: '请输入原账户的姓名',
        duration: 2000,
        icon: 'none'
      })
      valid = false
    } else if (!this.data.form.account) {
      wx.showToast({
        title: '请输入原账户的手机号',
        duration: 2000,
        icon: 'none'
      })
      valid = false
    } else if (this.data.form.account.length !== 11) {
      wx.showToast({
        title: '手机号必须为11位',
        duration: 2000,
        icon: 'none'
      })
      valid = false
    } else if (this.data.selected[0] === 0) {
      wx.showToast({
        title: '请选择部门',
        duration: 2000,
        icon: 'none'
      })
      valid = false
    }
    return valid
  },
  listDept() {
    let that = this
    wx.request({
      url: `${REQUEST_URL}/user/department`,
      method: 'get',
      success: function ({ data }) {
        if (data.code === 200) {
          that.data.depts[0].push.apply(that.data.depts[0], data.data)
          that.setData({
            depts: that.data.depts
          })
        } else {
          that.setData({
            depts: [{
              name: data.message
            }]
          })
        }
      },
      fail: function () {
        that.setData({
          depts: [
            [{name: '获取部门失败'}],
            [{name: '请重试'}]
          ]
        })
      }
    })
  },
  pickerColumnChange: function(e) {
    if (e.detail.column === 0) {
      this.setSubDept(e.detail.value)
    }
  },
  pickerChange: function (e) {
    console.log('e', e);
    console.log(e);
    this.setData({
      selected: e.detail.value,
      // 有子部门则优先选择子部门，否则回退仅选择部门
      'form.departmentId': this.data.depts[1][e.detail.value[1]].did || this.data.depts[0][e.detail.value[0]].did
    })
    console.log(this.data.form);
  },
  setSubDept(index) {
    const depts = this.data.depts;
    if (index === 0) {
      depts[1].splice(1)
    } else {
      depts[1].splice(1, depts[1].length - 1, ...depts[0][index].departments)
    }
    this.setData({
      subDeptIndex: index,
      depts
    })
  },
  inputChange: function (e) {
    let {field} = e.currentTarget.dataset
    this.setData({
      [`form.${field}`]: e.detail.value
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
    form: {
      account: '',
      username: '',
      departmentId: ''
    },
    depts: [
      [{name: '原账户党组织'}],
      [{name: '原账户子党组织'}]
    ],
    selected: [0, 0]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.listDept()
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