// pages/file/file.js
Page({

  /** 
   * 页面的初始数据
   */
  data: { 
    id: "",
    file: "",
    fileId:"",
    type: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    this.setData({
      id: options.id,
      file: options.file,
      type: options.type
    })
    wx.setNavigationBarTitle({
      title: options.name
    });
    wx.cloud.database().collection("File").doc(this.data.id).get().then(res =>{
      console.log(res)
      this.setData({
        fileId:res.data.fileId
      })
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
  download: function(event) {
    const db = wx.cloud.database();
    db.collection("File").doc(this.data.id).get().then(res => {
      wx.cloud.downloadFile({
        fileID: res.data.fileId, // 文件 ID
        success: res1 => {
          // 返回临时文件路径
          console.log(res1.tempFilePath)
          if (this.data.type == "2image") {
            wx.saveImageToPhotosAlbum({
              filePath: res1.tempFilePath,
              success(res) {}
            })
          }
          if (this.data.type == "3audio") {

          }
          if (this.data.type == "4video") {
            wx.saveVideoToPhotosAlbum({
              filePath: res1.tempFilePath,
              success(res) {
                console.log(res.errMsg)
              }
            })
          }
          if (this.data.type == "5else") {
            
          }
        },
        fail: console.error
      })
    })
  },
  share: function() {
    
  }
})