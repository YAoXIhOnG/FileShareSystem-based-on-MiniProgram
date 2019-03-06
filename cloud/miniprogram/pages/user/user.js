// pages/user/user.js
import Toast from '../../vant-weapp/toast/toast';
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    seachShow:false,
    actionShow:false,

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
  onLoad: function(optins) {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                logged: true,
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
          var that=this;
          this.onGetOpenid();
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
          wx.navigateTo({
            url: '../add/add',
          })
        } else {
          Toast('用户未登陆，请先登陆');
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
        // app.globalData.openid = res.result.openid
        this.setData({
          openId: res.result.openid
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },
  onChange(event) {
    this.setData({
      result: event.detail
    });
  },
  onSeachClose() {
    this.setData({ seachShow: false });
  },
  onSeachShow() {
    this.setData({ seachShow: true });
  },
  onActionClose() {
    this.setData({ actionShow: false });
  },
  onActionShow() {
    this.setData({ actionShow: true });
  }
})