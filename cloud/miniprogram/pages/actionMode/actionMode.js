// pages/actionMode/actionMode.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //当前目录
    currentFolder: "我的文件",
    nowaId: "root",
    //查询所得数据
    file: [],
    fileSearch: [],
    //弹出层参数
    searchShow: false,
    //被操作文件夹ID
    operateId: [],
    //操作类型
    operateType: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    if (options.operateType == "移动") {
      this.setData({
        operateType: "移动"
      })
    } else if (options.operateType == "复制") {
      this.setData({
        operateType: "复制"
      })
    }
    this.setData({
      operateId: options.operateId.split(","),
      nowaId: options.id
    })
    //设置标题栏文字
    wx.setNavigationBarTitle({
      title: " "
    })
    console.log("currentFloderId:" + options.id)
    console.log(app.globalData.currentFolderId)
    const db = wx.cloud.database()
    db.collection("File").where({
      _openid: app.globalData.openid,
      father: options.id,
      fileType : "1folder"
    }).orderBy('fileType', 'asc').orderBy('fileName', 'asc').get({
      success: res => {
        for (let i = 0; i < res.data.length; i++) {
          var time = new Date(res.data[i].upLoadTime).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
          res.data[i].upLoadTime = time
        }
        this.setData({
          file: res.data
        })
      }
    })
    db.collection("File").where({
      _openid: app.globalData.openid,
      _id: options.id
    }).get({
      success: res => {
        this.setData({
          currentFolder: res.data[0].fileName
        })
        app.globalData.currentFolder = this.data.currentFolder
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
  operateCancel: function() {
    if (app.globalData.currentFolderId == "root") {
      wx.redirectTo({
        url: '../user/user',
      })
    } else {
      wx.redirectTo({
        url: '../folder/folder?id=' + app.globalData.currentFolderId,
        url: '../user/user',
      })
    }
  },
  onSearchClose() {
    this.setData({
      searchShow: false,
      fileSearch: [],
    });
  },
  onSearchShow() {
    this.setData({
      searchShow: true
    });
  },
  //搜素功能
  onSearch(event) {
    this.setData({
      resultAll: []
    })
    const db = wx.cloud.database();
    db.collection("File").where({
      _openid: app.globalData.currentFolderId,
      fileName: {
        $regex: '.*' + event.detail,
        $options: 'i' //不区分大小写  
      }
    }).orderBy('fileType', 'asc').orderBy('fileName', 'asc').get({
      success: res => {
        for (let i = 0; i < res.data.length; i++) {
          var time = res.data[i].upLoadTime.getTime() - res.data[i].upLoadTime.getTimezoneOffset() * 60000
          res.data[i].upLoadTime = new Date(time).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
          this.setData({
            resultAll: this.data.resultAll.concat(res.data[i]._id)
          })
        }
        this.setData({
          fileSearch: res.data
        })
      },
      fail: console.err
    })
  },
  do: function(event) {
    console.log(this.data.nowaId)
    if (this.data.operateType == "移动") {
      this.move();
    } else if (this.data.operateType == "复制") {
      this.copy();
    }
  },
  move: function() {
    const db = wx.cloud.database();
    var newchild = []
    try{
    for (var i = 0; i < this.data.operateId.length; i++) {
      db.collection("File").doc(this.data.operateId[i]).get().then(res => {
          //删除father的child对应的id
          db.collection("File").doc(res.data.father).get().then(res1 => {
            var length = res1.data.child.length
            newchild = res1.data.child
            for (var i = 0; i < res1.data.child.length; i++) {
              for (var j = 0; j < this.data.operateId.length; j++) {
                if (newchild[i] == this.data.operateId[j]) {
                  newchild.splice(i, 1)
                }
                if (length == newchild.length + this.data.operateId.length) {
                  //更新father中的child
                  db.collection("File").doc(res.data.father).update({
                    data: {
                      child: newchild
                    }
                  }).then(res2 => {
                    console.log("fatherchanged")
                    console.log(res)
                    //更改father
                  })
                }
              }
            }
          })
        db.collection("File").doc(res.data._id).update({
          data: {
            father: this.data.nowaId
          }
        }).then(res3 => {
          console.log("move success")
        })
      })
      //更新newfather的child
      db.collection("File").doc(this.data.nowaId).get().then(res => {
        var newchild = res.data.child
        for (var i = 0; i < newchild.length; i++) {
          if (newchild[i] == null) {
            newchild.splice(i, 1)
            i--
            continue;
          }
          for (var j = 0; j < this.data.operateId.length; j++) {
            if (newchild[i] == this.data.operateId[j]) {
              newchild.splice(i, 1)
              i--
              continue
            }
          }
        }
        newchild = newchild.concat(this.data.operateId)
        db.collection("File").doc(this.data.nowaId).update({
          data: {
            child: db.command.set(newchild)
          }
        }).then(res => {
          console.log(res)
          console.log("newfatherchanged")
        })
      })
    }
    }catch(error){
      console.log(error)
    }
    wx.redirectTo({
      url: '../user/user',
    })
  },
  copy: function() {

  },
})