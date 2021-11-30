const REQUEST_URL = getApp().globalData.REQUEST_URL

Page({
  abortAutoRefreshChapterState() {
    if (this.data.timer) {
      clearInterval(this.data.timer)
      this.setData({
        timer: null
      })
    }
  },
  autoRefreshChapterState() {
    const timer = setInterval(() => {
      const chapters = this.data.chapters
       chapters.forEach((chapter, index) => {
        if (chapter.status==='PUBLISH') {
          return chapter
        }
        if ((chapter.scope === 'GLOBAL') || chapter.canAttend) {
          const now = Date.now()
          if ((Date.parse(chapter.startTime) <= now) && (now <= Date.parse(chapter.endTime))) {
            this.setData({
              [`chapters[${index}].status`]:'PUBLISH'
            })
          }
        }
      })
    }, 1000);
    return timer
  },
  getRealExamTimeByMin(endTimeMill, examTimeMin) {
    const examTimeMill = examTimeMin * 60 * 1000// 考试总时间为多少毫秒
    const overflowExamTimeMill = (Date.now() + examTimeMill) - endTimeMill
    if (overflowExamTimeMill > 0) {
      return (examTimeMill - overflowExamTimeMill) / 1000 / 60
    } else {
      return examTimeMin
    }
  },
  toExam(e) {
    const index = e.currentTarget.dataset.index
    const chapter = this.data.chapters[index]
    const { cid, examTime: time, totalSize: total, totalScore } = chapter.examChapterData
    if (this.isPublished(chapter)) {
      if (this.isOverLimited(chapter)) {
        wx.showModal({
          title: '提示',
          content: '很抱歉，您的答题次数已经超过限制了',
          showCancel: false,
          confirmText: '我知道了'
        })
        return
      }
      const realExamTime = this.getRealExamTimeByMin(Date.parse(chapter.endTime), time)
      wx.reLaunch({
        url: `/pages/exam/exam?cid=${cid}&time=${time}&name=${chapter.name}&total=${total}&totalScore=${totalScore}&realTime=${realExamTime}&type=${chapter.type}`,
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '很抱歉，您暂时无法参与该竞赛。该竞赛可能不在开放时间内，或您不在该竞赛名单内',
        showCancel: false,
        confirmText: '我知道了'
      })
    }
  },
  isOverLimited(chapter) {
    const { total, used } = chapter
    return used >= total
  },
  isPublished(chapter) {
    return ((chapter.status === 'PUBLISH' ) && (chapter.scope === 'GLOBAL' || chapter.canAttend ))
  },
  listCarousel: function () {
    let that = this
    wx.request({
      url: `${REQUEST_URL}/user/banners`,
      method: 'get',
      header: {
        Cookie: wx.getStorageSync('cookie')
      },
      success: function (res) {
        if (res.data.code === 200) {
          that.setData({
            carousels: res.data.data
          })
        }
      }
    })
  },
  listChapter: function () {
    wx.showLoading({
      title: '加载章节中...',
    })
    let that = this
    wx.request({
      url: `${REQUEST_URL}/user/chapters`,
      method: 'get',
      header: {
        Cookie: wx.getStorageSync('cookie')
      },
      success: function ({ data }) {
        wx.hideLoading()
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
          that.setData({
            chapters: data.data
          })
        } else {
          wx.showToast({
            title: data.message,
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function () {
        wx.hideLoading()
        wx.showToast({
          title: '获取章节失败，请重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
    chapters: [],
    carousels: [],
    timer: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.listCarousel();
    // this.listChapter()
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
    this.listChapter()
    this.autoRefreshChapterState()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.abortAutoRefreshChapterState()
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