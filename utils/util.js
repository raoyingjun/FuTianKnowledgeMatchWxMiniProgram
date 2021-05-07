const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const getTimeBySecond= sec => {
  var resultH = Math.floor(sec / 60 / 60),
      resultM = Math.floor(sec / 60),
      h = (resultH % 24) === 0 ? '00' : (resultH % 24) < 10 ? '0' + (resultH % 24) : (resultM % 24),
      m = (resultM % 60) === 0 ? '00' : (resultM % 60) < 10 ? '0' + (resultM % 60) : (resultM % 60),
      s = (sec % 60) === 0 ? '00' : (sec % 60) < 10 ? '0' + (sec % 60) : (sec % 60)
  return h + ':' + m + ':' + s
}

module.exports = {
  formatTime: formatTime,
  getTimeBySecond: getTimeBySecond
}
