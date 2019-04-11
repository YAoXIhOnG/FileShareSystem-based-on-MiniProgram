// pages/folder/folder.js
const app = getApp();
 
Page({
  /**
   * 页面的初始数据 
   */
  data: {
    //窗口传入值
    options:{id:""},
    //弹出层参数
    searchShow: false,
    actionShow: false,
    toolShow: false,
    count: 0,
    //滑动窗口高度
    height: "1120rpx",
    //查询所得数据
    file: [],
    fileSearch: [],
    //选择框参数
    result: [],
    resultAll: [],
    chooseAll: "全选",
    //当前目录
    currentFolder: '',
    //新文件夹参数
    showCreateFile: false,
    showRename: false,
    fileName: "",
    fileId: '',
    reNameAble: false,
    //删除文件参数
    child: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //设置标题栏文字
    wx.setNavigationBarTitle({
      title: " "
    })
    console.log("currentFloderId:" + options.id)
    app.globalData.currentFolderId = options.id
    console.log(app.globalData.openid)
    this.setData({
      options:{
        id:options.id
      }
    })
    console.log(this.data.options.id)
    const db = wx.cloud.database()
    db.collection("File").where({
      _openid: app.globalData.openid,
      father: options.id
    }).orderBy('fileType', 'asc').orderBy('fileName', 'asc').get({
      success: res => {
        for (let i = 0; i < res.data.length; i++) {
          var time = new Date(res.data[i].upLoadTime).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
          res.data[i].upLoadTime = time
          this.setData({
            resultAll: this.data.resultAll.concat(res.data[i]._id)
          })
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
    app.globalData.currentFolderId = this.data.options.id
    app.globalData.currentFolder = this.data.currentFolder
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
  onChange(event) {
    this.setData({
      result: event.detail,
      count: event.detail.length
    });
  },
  backToindex(event) {
    wx.reLaunch({
      url: '../user/user',
    })
  },
  onSearchClose() {
    this.setData({
      searchShow: false,
      fileSearch: [],
      resultAll: [],
      count: 0
    });
    var options = {
      id: app.globalData.currentFolderId
    }
    this.onLoad(options);
  },
  onSearchShow() {
    this.setData({
      searchShow: true
    });
  },
  onActionClose() {
    this.setData({
      actionShow: false,
      height: "1120rpx"
    });
  },
  onActionShow() {
    this.setData({
      actionShow: true,
      height: "1000rpx"
    });
  },
  onToolClose() {
    this.setData({
      toolShow: false
    });
  },
  onToolShow() {
    this.setData({
      toolShow: true
    });
  },
  choose(event) {
    if (this.data.count == 0) {
      this.onActionClose();
    } else {
      this.onActionShow();
    }
  },
  chooseCancel(event) {
    this.setData({
      result: event.detail,
      count: 0
    });
    this.onActionClose();
  },
  //dialog
  onshowCreateFile(event) {
    this.setData({
      showCreateFile: true
    })
  },
  oncloseCreateFile(event) {
    this.setData({
      showCreateFile: false
    });
  },
  onconfirmCreateFile(event) {
    this.setData({
      fileName: event.detail,
    })
  },
  onshowRename(event) {
    this.setData({
      showRename: true
    })
  },
  oncloseRename(event) {
    this.setData({
      showRename: false
    });
  },
  onconfirmRename(event) {
    this.setData({
      fileName: event.detail,
    })
  },
  //创建功能
  createFolder(event) {
    if (this.data.fileName === "") {
      wx.showToast({
        title: '文件名不能为空',
        icon: 'none'
      })
      this.setData({
        showCreateFile: false
      })
    } else {
      const db = wx.cloud.database();
      db.collection("File").where({
        fileName: this.data.fileName,
        father: app.globalData.currentFolderId
      }).get({
        success: res => {
          console.log(res)
          if (res.data[0] == null) {
            db.collection("File").add({
              data: {
                child: "",
                father: app.globalData.currentFolderId,
                fileIcon: "https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=3710180907,1493414966&fm=26&gp=0.jpg",
                fileId: "",
                fileName: this.data.fileName,
                fileSize: 1,
                fileType: "1folder",
                upLoadTime: new Date(),
              },
            })
            db.collection("userInfo").where({
              _openid: app.globalData.openid
            }).get({
              success: res => {
                this.setData({
                  fileId: res.data[0]._id
                })
                db.collection("userInfo").doc(res.data[0]._id).update({
                  data: {
                    spaceUsed: db.command.inc(1)
                  },
                  success: res1 => {
                    this.setData({
                      toolShow: false
                    })
                    var options = {
                      id: app.globalData.currentFolderId
                    }
                    this.onLoad(options);
                  }
                })
              }
            })
          } else {
            console.log("exist")
          }
        }
      })
    }
  },
  //上传功能
  uploadImage() {
    this.onToolClose();
    const db = wx.cloud.database();
    var name = Math.random() * 100000000;
    wx.chooseImage({
      success: function(res) {
        console.log(res)
        wx.getImageInfo({
          src: res.tempFilePaths[0],
          success: res2 => {
            console.log(res2)
            wx.cloud.uploadFile({
              cloudPath: app.globalData.openid + '/image/' + name + '.' + res2.type, // 上传至云端的路径
              filePath: res.tempFilePaths[0],// 小程序临时文件路径
            }).then(res1 =>{
              // 返回文件 ID
              console.log(res1.fileID)
              var size = res.tempFiles[0].size
              db.collection("userInfo").where({
                _openid: app.globalData.openid
              }).get().then(res => {
                db.collection("userInfo").doc(res.data._id).update({
                  data: {
                    spaceUsed: db.command.inc(size)
                  },
                  success: res => {
                    console.log(res)
                  }
                })
              })
              db.collection("File").add({
                data: {
                  child: null,
                  father: app.globalData.currentFolderId,
                  fileIcon: res.tempFiles[0].path,
                  fileId: res1.fileID,
                  fileName: name + res2.type,
                  fileSize: res.tempFiles[0].size,
                  fileType: "2image",
                  upLoadTime: new Date(),
                }
              }).then(res => {
                console.log("addImage")
                var options = {
                  id: app.globalData.currentFolderId
                }
                this.onLoad(options);
              })
            })
          }
        })
      },
    })
  },
  uploadVideo() {
    this.onToolClose();
    const db = wx.cloud.database();
    var name = Math.random() * 100000000;
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 240,
      camera: 'back',
      success: res => {
        console.log(res)
        var type = ''
        for (var j = res.tempFilePath.length; j >= 0; j--) {
          if (res.tempFilePath[j] == '.') {
            for (; j < res.tempFilePath.length; j++) {
              type = type + res.tempFilePath[j]
            }
            break;
          }
        }
        wx.cloud.uploadFile({
          cloudPath: app.globalData.openid + '/video/' + name + type, // 上传至云端的路径
          filePath: res.tempFilePath, // 小程序临时文件路径
        }).then(res1 => {
          console.log(res1)
          var size = res.size
          db.collection("userInfo").where({
            _openid: app.globalData.openid
          }).get().then(res => {
            db.collection("userInfo").doc(res.data._id).update({
              data: {
                spaceUsed: db.command.inc(size)
              },
              success: res => {
                console.log(res)
              }
            })
          })
          db.collection("File").add({
            data: {
              child: null,
              father: app.globalData.currentFolderId,
              fileIcon: res.thumbTempFilePath,
              fileId: res1.fileID,
              fileName: name+type,
              fileSize: res.size,
              fileType: "4video",
              upLoadTime: new Date(),
            }
          }).then(res => {
            console.log("addVideo")
          })
          var options = {
            id: app.globalData.currentFolderId
          }
          this.onLoad(options);
          console.log(res1.fileID)
        })
      }
    })
  },
  uploadFile() { //待定
    // const db = wx.cloud.database();
    // var name = Math.random() * 100000000
    // wx.cloud.uploadFile({
    //   cloudPath: app.globalData.openid + '/else/' + name, // 上传至云端的路径
    //   filePath: '', // 小程序临时文件路径
    //   success: res => {
    //     // 返回文件 ID
    //     console.log(res.fileID)
    //     db.collection("File").add({
    //       data: {
    //         child: null,
    //         father: app.globalData.currentFolderId,
    //         fileIcon: "",
    //         fileId: res.fileID,
    //         fileName: name,
    //         fileSize: 0,
    //         fileType: "5else",
    //         upLoadTime: new Date(),
    //       }
    //     }).then(res => {

    //     })
    //   },
    //   fail: console.error
    // })
  },
  //文件夹管理功能
  move() {
    const db = wx.cloud.database();
    for (var i = 0; i < this.data.result.length; i++) {
      db.collection("File").doc(this.data.result[i]).get().then(res => {
        db.collection("File").doc(res.data.father).get().then(res1 => {
          var newchild = res1.data.child
          for (var i = 0; i < newchild.length; i++) {
            if (newchild[i] == res.data._id) {
              for (var j = 0; j < newchild.length - 1; j++) {
                newchild[j] = newchild[j + 1]
              }
              newchild[newchild.length - 1] = ""
              break;
            }
          }
          db.collection("File").doc(res.data.father).update({
            data: {
              child: newchild
            }
          })
        }).then(res => {
          console.log("fatherchanged")
        })
        db.collection("File").doc(res.data._id).update({
          data: {
            father: app.globalData.currentFolderId
          }
        }).then(res2 => {
          console.log("move success")
        })
        console.log(app.globalData.currentFolderId)
      })
    }
  },
  copy() {
    const db = wx.cloud.database();
    for (var i = 0; i < this.data.result.length; i++) {
      db.collection("File").doc(this.data.result[i]).get().then(res => {
        db.collection("File").add({
          data: {

          }
        }).then(res => {

        })
      })
    }
  },
  remove() {
    const db = wx.cloud.database();
    this.findChild(this.data.result);
    this.setData({
      count: 0,
      result: []
    })
  },
  findChild: function(father) {
    const db = wx.cloud.database();
    if (father == null) {
      return 0;
    }
    for (var j = 0; j < father.length; j++) {
      db.collection("File").doc(father[j]).get().then(res => {
        console.log(res)
        if (res.data.fileId != null) {
          wx.cloud.deleteFile({
            fileList: [res.data.fileId],
            success: res => {
              // handle success
              console.log("delete file")
            },
            fail: console.error
          })
        }
        db.collection("File").doc(res.data._id).get({
          success: res1 => {
            db.collection("File").doc(res.data._id).remove().then(res2 => {
              console.log(res2)
              console.log("delete")
            })
            db.collection("userInfo").where({
              _openid: app.globalData.openid
            }).get({
              success: res => {
                db.collection("userInfo").doc(res.data._id).update({
                  data: {
                    spaceUsed: db.command.inc(-res1.data.fileSize)
                  },
                  success: res2 => {
                    console.log("update")
                    console.log(res2)
                    this.onActionClose();
                    var options = {
                      id: app.globalData.currentFolderId
                    }
                    this.onLoad(options);
                  }
                })
              }
            })
          },
          fail: err => {
            console.log(err)
          }
        })
      })
    }
    for (var i = 0; i < father.length; i++) {
      db.collection("File").where({
        father: father[i]
      }).get().then(res => {
        var tmp = []
        for (var j = 0; j < res.data.length; j++) {
          tmp = tmp.concat(res.data[j]._id)
        }
        this.setData({
          child: tmp
        })
        console.log(tmp)
        this.findChild(this.data.child)
      })
    }
  },
  rename() {
    const db = wx.cloud.database();
    db.collection("File").where({
      fileName: this.data.fileName
    }).get({
      success: res => {
        if (res.data[0] == null) {
          db.collection("File").doc(this.data.result[0]).update({
            data: {
              fileName: this.data.fileName
            },
            success: res1 => {
              this.onActionClose();
              this.setData({
                result: [],
                count: 0
              })

              var options = {
                id: app.globalData.currentFolderId
              }
              this.onLoad(options);
            }
          })
        } else {
          console.log("exist")
        }
      }
    })
  },
  //全选功能
  onChooseAll(event) {
    if (this.data.chooseAll === "全选") {
      this.setData({
        result: this.data.resultAll,
        chooseAll: "取消",
        count: this.data.resultAll.length
      })
    } else if (this.data.chooseAll === "取消") {
      this.setData({
        result: [],
        chooseAll: "全选",
        actionShow: false,
        count: 0
      })
    }
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
      fail:console.err
    })
  },
  f5(event){
    var options = {
      id: app.globalData.currentFolderId
    }
    this.onLoad(options);
  }
})