const {
  getTimeBySecond
} = require('../../utils/util.js')
const REQUEST_URL = getApp().globalData.REQUEST_URL
const OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
Page({
  back() {
    wx.disableAlertBeforeUnload()
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },
  showResult(title, userScore, usedTime) {
    const that = this
    let msg = ''
    usedTime = (usedTime / 60).toFixed(1)
    if (userScore === this.data.totalScore) {
      msg = `恭喜您，您的竞赛成绩为满分${userScore}分！`
    } else {
      msg = `该竞赛满分为${this.data.totalScore}分，您的成绩为${userScore}分。`
    }
    msg += `用时${usedTime}分钟`
    wx.showModal({
      title,
      content: msg,
      showCancel: false,
      confirmText: '返回',
      success(res) {
        that.back()
      }
    })
  },
  startTimer() {
    if (this.data.currentTime <= 0) return
    if (!this.data.timer) {
      this.setData({
        timer: setInterval(() => {
          this.setData({
            currentTime: --this.data.currentTime,
            currentTimeMsg: getTimeBySecond(this.data.currentTime)
          })
          if (this.data.currentTime <= 0) {
            this.endTimer()
            this.timeoutSubmit()
          }
        }, 1000)
      })
    }
  },
  timeoutSubmit() {
    const that = this
    wx.showModal({
      title: '提示',
      content: '很抱歉，已经没有剩余时间了',
      showCancel: false,
      confirmText: '提交',
      success(res) {
        that.submit()
      }
    })
  },
  confirmSubmit() {
    const that = this
    wx.showModal({
      title: '提示',
      content: '确认提交吗？',
      confirmText: '确认提交',
      cancelText: '我再想想',
      success(res) {
        if (res.confirm) {
          that.submit()
        }
      }
    })
  },
  endTimer() {
    clearInterval(this.data.timer)
    this.setData({
      timer: null
    })
  },
  data: {
    currentTime: 0, // 当前时间，
    current: 0, // 当前所在的题目的索引
    total: 0, // 总题数
    currentTimeMsg: '00:00:00', // 格式化后的已用时
    cid: 0, // 章节编号
    questions: [], // 所有的题目
    question: {}, // 当前题目
    progress: 0 // 当前请求的进度，分三步。0->单选题，1->多选题，2->判断题 
  },
  /** 处理返回的数据 */
  handleData(data) {
    this.data.questions.push.apply(this.data.questions, data)
    this.setData({
      question: this.data.questions[this.data.current],
      questions: this.data.questions,
      progress: this.data.progress + 1
    })
    this.startTimer()
  },
  isRight() {
    var items = this.data.question.answers
    for (var i = 0, len = items.length; i < len; i++) {
      if ((items[i].checked && (items[i].status === 'ERROR')) || (!items[i].checked && (items[i].status === 'RIGHT'))) return false
    }
    console.log('g')
    return true
  },
  getChoosedSize() {
    const items = this.data.question.answers
    var choosedLen = 0 // 选中的题数量
    for (var i = 0, len = items.length; i < len; i++) {
      if (items[i].checked) choosedLen++
    }
    return choosedLen;
  },
  // 对所有题目格式化成提交到服务器所需的格式
  transformQuestionsToForm() {
    const questions = this.data.questions
    const form = []
    for (let i = 0, iLen = questions.length; i < iLen; i++) {
      const question = questions[i]
      const data = {
        questionId: question.qid,
        answers: []
      }
      question.answers.forEach((answer, index) => {
        if (answer.checked) data.answers.push(index)
      })
      form.push(data)
    }
    return form
  },
  failedSubmit() {
    const that = this
    wx.showModal({
      title: '提示',
      content: '提交时出错，原因可能是由于网络网络较差，请重试',
      confirmText: '重试',
      showCancel: false,
      success(res) {
        that.submit()
      }
    })
  },
  submit() {
    const that = this
    wx.showLoading({
      title: '正在提交...',
      mask: true
    })
    this.endTimer()
    const usedTime = this.data.time * 60 - this.data.currentTime // 单位：秒
    wx.request({
      url: `${REQUEST_URL}/user/sheet/${this.data.cid}/${usedTime}`,
      method: 'post',
      data: this.transformQuestionsToForm(),
      header: {
        Cookie: wx.getStorageSync('cookie')
      },
      success: function ({
        data
      }) {
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
          that.showResult(data.message, data.data.log.score, data.data.log.time)
          wx.disableAlertBeforeUnload()
        } else {
          wx.showToast({
            title: data.message,
            duration: 2000,
            icon: 'none'
          })
        }
      },
      fail() {
        console.log('failed');
        wx.hideLoading()
        that.failedSubmit()
      }
    })
  },
  prev() {
    this.setData({
      question: this.data.questions[this.data.current - 1],
      current: this.data.current - 1
    })
  },
  /** 下一题 */
  next() {
    this.setData({
      question: this.data.questions[this.data.current + 1],
      current: this.data.current + 1
    })
  },
  singleChange(e) {
    const radioItems = this.data.question.answers;
    for (var i = 0, len = radioItems.length; i < len; ++i) {
      radioItems[i].checked = radioItems[i].aid == e.detail.value;
    }
    this.setData({
      'question.answers': radioItems
    });
  },
  multiChange(e) {
    const checkboxItems = this.data.question.answers,
      values = e.detail.value;
    console.log(values);
    for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
      checkboxItems[i].checked = false;
      for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (checkboxItems[i].aid == values[j]) {
          checkboxItems[i].checked = true;
          break;
        }
      }
    }
    this.setData({
      'question.answers': checkboxItems
    });
  },
  formatRightAnswer() {
    var msg = []
    var items = this.data.question.answers
    for (var i = 0, len = items.length; i < len; i++) {
      if (items[i].status === 'RIGHT') msg.push(OPTIONS[i])
    }
    return msg.join('、')
  },
  /** 判断是否选择了答案，没选择则进行提示 */
  isSelected() {
    const choosedSize = this.getChoosedSize()
    if (this.data.question.type === 'MULTI') {
      if (choosedSize < 2) {
        wx.showToast({
          title: '请至少选择两个答案',
          icon: 'none',
          duration: 2000
        })
        return false
      }
      return true
    } else {
      if (choosedSize < 1) {
        wx.showToast({
          title: '请至少选择一个答案',
          icon: 'none',
          duration: 2000
        })
        return false
      }
      return true
    }
  },
  confirm() {
    if (!this.isSelected()) {
      return
    }
    let note = ''
    if (this.isRight()) {
      note += '恭喜你答对啦。'
    } else {
      note += '很抱歉，你答错了。'
    }
    console.log(this.formatRightAnswer());
    note += '正确答案为' + this.formatRightAnswer()
    this.setData({
      'question.confirmed': true,
      'question.note': note
    })
    if ((this.data.total !== this.data.current + 1) && (!this.data.questions[this.data.current + 1])) {
      this.appendQA()
    }
  },
  getType() {
    switch (this.data.progress) {
      case 0:
        return 'SINGLE'
      case 1:
        return 'MULTI'
      case 2:
        return 'TF'
      default:
        break
    }
  },
  /** 显示答案 */
  appendQA() {
    const that = this
    wx.showLoading({
      title: '正在加载题目...',
      mask: true
    })
    this.endTimer()
    wx.request({
      url: `${REQUEST_URL}/user/exam/list/${this.getType()}/${this.data.cid}`,
      method: 'get',
      header: {
        Cookie: wx.getStorageSync('cookie')
      },
      success: function ({
        data
      }) {
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
          that.handleData(data.data)
        } else {
          wx.showToast({
            title: data.message,
            icon: 'none',
            duration: 2000
          })
          that.setData({
            'question.confirmed': false
          })
        }
      },
      fail() {
        wx.hideLoading()
        wx.showToast({
          title: '加载题目失败，可能是网络较差，请点击【确认】重试',
          icon: 'none',
          duration: 2000
        })
        that.setData({
          'question.confirmed': false
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function ({
    cid,
    time,
    name,
    total,
    totalScore
  }) {
    cid = Number(cid)
    total = Number(total)
    time = Number(time)
    totalScore = Number(totalScore)
    const currentTime = time * 60
    wx.setNavigationBarTitle({
      title: name
    })
    wx.enableAlertBeforeUnload({
      message: '您还未提交竞赛成绩。如果返回，您的答题记录不会自动保存，下次需要重新开始答题。确认返回吗？'
    })
    this.setData({
      cid,
      currentTime,
      total,
      time,
      totalScore,
      currentTimeMsg: getTimeBySecond(currentTime)
    })
    this.appendQA()
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
    this.startTimer()
    wx.hideHomeButton()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.endTimer()
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