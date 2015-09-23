'use strict'

window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
window.storageInfo = window.storageInfo || navigator.webkitPersistentStorage;


var Updater = function(){
  var self = this;
  this.type = window.PERSISTENT;
  this.fs = null;
  this.allocated = false;
  this.urls = [];

  this.allocate = function(size, success){
    window.storageInfo.requestQuota(size, function(gb){
      window.requestFileSystem(self.type, size, function(fs){
        self.fs = fs;
        self.allocated = true;

        success(fs);
      }, self.errorHandler);
    }, self.errorHandler);
  };


  this.saveFile = function(data, path, index, callback) {
    if (!self.fs) return;

    console.log("Saving "+path);

    self.fs.root.getFile(path, {create: true}, function(fileEntry) {
      fileEntry.createWriter(function(writer) {
        writer.write(data);
        callback(index);
      }, self.errorHandler);
    }, self.errorHandler);
  };

  this.update = function(url, callback){
    self.getUpdateList(url, function(ret){

      if(!ret) {
        callback();
      }
      else {

        if(!localStorage.getItem('version') || localStorage.getItem('version') < ret.version) {
          var list = ret.list;

          for(var i = 0; i < list.length; i++) {
            var curr = list[i];
            self.download(url+''+curr, curr, i, function(blob, name, index) {
              self.saveFile(blob, name, index, function(index){
                if(index == list.length-1) {
                  localStorage.setItem('version', ret.version);
                  callback();
                }
              });
            });
          }
        }
        else {
          callback();
        }
      }
    });
  };

  this.getUpdateList = function(url, callback){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url+'updateList.json', true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if(xhr.status == 200) callback(JSON.parse(xhr.responseText));
        else                  callback({});
      }
    };

    xhr.onerror = function(){
      callback();
    };

    xhr.send(null);
  };


  this.download = function(url, name, index, success) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = "blob";
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if (success) success(xhr.response, name, index);
      }
    };
    xhr.send(null);
  }


  this.readDirectory = function(callback){
    var entries = [];
    var reader = self.fs.root.createReader();

    var readDir = function(){
      reader.readEntries (function(results) {
        if (!results.length) {
          callback(entries.sort());
        } else {
          entries = entries.concat(Array.prototype.slice.call(results || [], 0));
          readDir();
        }
      }, self.errorHandler);
    };
    readDir();
  };

  this.appendFiles = function(list){
    for (var i = 0; i < list.length; i++) {
      var url = list[i].toURL();
      var id = self.getFolder();
      id += list[i].fullPath.substring(1);

      self.urls[id] = url;
      var ext = url.split('.').pop();


      if(ext == "css") {
        var css = document.createElement("style");
        css.type = "text/css";
        css.src = url;
        document.body.appendChild(css);
      }
      else if (ext == "js") {
        var js = document.createElement("script");
        js.type = "text/javascript";
        js.src = url;
        document.body.appendChild(js);
      }
    }
  };


  this.errorHandler = function(e){
    var msg = '';

    switch (e.code) {
      case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
      case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
      case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
      case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
      case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
      default:
      msg = 'Unknown Error';
      break;
    }

    console.log('FS Error: ' + msg);
  };

  this.getFolder = function(){
    var url = window.location.href;
    url = url.split('#')[0].split('?')[0];
    var matches = url.split('/');

    url = "";
    for(var i = 0; i < matches.length - 1; i++)  url += matches[i]+'/';

    return url;
  };



  this.url = function(name){
    var url = self.getFolder() + name.replace(/\.\//g, "");

    console.log("Getting "+name+" "+url);


    if(self.urls[url])  return self.urls[url];
    else                return url;
  };

  return this;
}
