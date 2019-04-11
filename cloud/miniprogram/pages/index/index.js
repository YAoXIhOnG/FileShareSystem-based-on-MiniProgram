import Dialog from '../../vant-weapp/dialog/dialog';
const app = getApp()
Page({

  /**
   * 页面的初始数据f
   */
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {
      nickName: "点击头像登陆"
    },
    logged: false,
    openId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          this.setData({
            logged: true
          })
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
          wx.cloud.callFunction({
            name: 'login',
            data: {},
            success: res => {
              // console.log('[云函数] [login] user openid: ', res.result.openid)
              app.globalData.openid=res.result.openid
              wx.redirectTo({
                url: '../user/user',
              })
            },
            fail: err => {
              console.error('[云函数] [login] 调用失败', err)
            }
          })

        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  navigateTo: function(event) {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          var that = this;
          that.onGetOpenid();
          wx.redirectTo({
            url: '../user/user',
          })
        } else {
          Dialog.alert({
            message: '未登陆用户，请先登陆'
          }).then(() => {
            // on close
          });
        }
      }
    })
  },
  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },
  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        this.openId = res.result.openid
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },
})