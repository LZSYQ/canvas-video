changeAnim = function (s) {
  processor.animFun = s
}


var processor = {};

processor.doLoad = function doLoad() {
  this.video = document.getElementById('video');

  // this.c1 = document.getElementById('c1');
  // this.ctx1 = this.c1.getContext('2d');

  this.c2 = document.getElementById('c2');
  this.ctx2 = this.c2.getContext('2d');

  let self = this;

  this.animFun = this.animFun ? this.animFun : this.reverseColor

  this.video.addEventListener('play', function () {
    self.width = self.video.videoWidth;
    self.height = self.video.videoHeight;

    // this.ctx1.width = self.video.videoWidth / 2;
    // this.ctx1.height = self.video.videoHeight / 2;

    self.timerCallback();
  }, false);
}

processor.timerCallback = function timerCallback() {
  if (this.video.paused || this.video.ended) {
    return;
  }
  this.computeFrame();
  let self = this;
  // setTimeout(function () {
  //   self.timerCallback();
  // }, 0);
  window.requestAnimationFrame(function () {
    self.timerCallback();
  })
}

processor.computeFrame = function computeFrame() {
  this.ctx2.drawImage(this.video, 0, 0, this.width, this.height);
  this.frame = this.ctx2.getImageData(0, 0, this.width, this.height);
  let frame = this.ctx2.getImageData(0, 0, this.width, this.height);
  let l = frame.data.length / 4;

  this.animFun(frame, l)
  // 反色
  // this.reverseColor(frame, l)
  // 去色
  // this.delColor(frame, l)
  // 单色
  // this.singleColor(frame, l)
  // 中国版画
  // this.chinaColor(frame, l)
  // 高斯模糊
  // this.gaussBlur(frame, l)
  // 浮雕
  // this.reliefProcess(frame)

  // for (let i = 0; i < l; i++) {
  //   let r = frame.data[i * 4 + 0];
  //   let g = frame.data[i * 4 + 1];
  //   let b = frame.data[i * 4 + 2];
  //   if (g > 100 && r > 100 && b < 43)
  //     frame.data[i * 4 + 3] = 0;
  // }
  // this.ctx2.putImageData(frame, 0, 0);
  // return;
}

// https: //www.cnblogs.com/st-leslie/p/8317850.html?utm_source=debugrun&utm_medium=referral#china


// 反色
processor.reverseColor = function reverseColor(frame, l) {
  for (var i = 0; i < l; i++) {
    frame.data[i * 4] = 255 - frame.data[i * 4];
    frame.data[i * 4 + 1] = 255 - frame.data[i * 4 + 1];
    frame.data[i * 4 + 2] = 255 - frame.data[i * 4 + 2];
  }
  this.ctx2.putImageData(frame, 0, 0);
}

// 去色
processor.delColor = function delColor(frame, l) {
  // 解析之后进行算法运算
  for (var i = 0; i < l; i++) {
    var red = frame.data[i * 4];
    var green = frame.data[i * 4 + 1];
    var blue = frame.data[i * 4 + 2];
    var gray = 0.3 * red + 0.59 * green + 0.11 * blue;
    frame.data[i * 4] = gray;
    frame.data[i * 4 + 1] = gray;
    frame.data[i * 4 + 2] = gray;
  }
  this.ctx2.putImageData(frame, 0, 0);
}

// 单色
processor.singleColor = function singleColor(frame, l) {
  // 解析之后进行算法运算
  for (var i = 0; i < l; i++) {
    frame.data[i * 4 + 1] = 0;
    frame.data[i * 4 + 2] = 0;
  }
  this.ctx2.putImageData(frame, 0, 0);
}

// 中国版画（黑白色）
processor.chinaColor = function chinaColor(frame, l) {
  // 解析之后进行算法运算
  for (var i = 0; i < l; i++) {
    var red = frame.data[i * 4];
    var green = frame.data[i * 4 + 1];
    var blue = frame.data[i * 4 + 2];
    var gray = 0.3 * red + 0.59 * green + 0.11 * blue;
    var new_black;
    if (gray > 126) {
      new_black = 255;
    } else {
      new_black = 0;
    }
    frame.data[i * 4] = new_black;
    frame.data[i * 4 + 1] = new_black;
    frame.data[i * 4 + 2] = new_black;
  }
  this.ctx2.putImageData(frame, 0, 0);
}

// 高斯模糊
processor.gaussBlur = function gaussBlur(frame, l) {
  // console.log(frame);
  var pixes = frame.data;
  var width = frame.width;
  var height = frame.height;
  var gaussMatrix = [],
    gaussSum = 0,
    x, y,
    r, g, b, a,
    i, j, k, len;

  var radius = 30;
  var sigma = 5;

  a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
  b = -1 / (2 * sigma * sigma);
  //生成高斯矩阵
  for (i = 0, x = -radius; x <= radius; x++, i++) {
    g = a * Math.exp(b * x * x);
    gaussMatrix[i] = g;
    gaussSum += g;

  }
  //归一化, 保证高斯矩阵的值在[0,1]之间
  for (i = 0, len = gaussMatrix.length; i < len; i++) {
    gaussMatrix[i] /= gaussSum;
  }
  //x 方向一维高斯运算
  for (y = 0; y < height; y++) {
    for (x = 0; x < width; x++) {
      r = g = b = a = 0;
      gaussSum = 0;
      for (j = -radius; j <= radius; j++) {
        k = x + j;
        if (k >= 0 && k < width) { //确保 k 没超出 x 的范围
          //r,g,b,a 四个一组
          i = (y * width + k) * 4;
          r += pixes[i] * gaussMatrix[j + radius];
          g += pixes[i + 1] * gaussMatrix[j + radius];
          b += pixes[i + 2] * gaussMatrix[j + radius];
          // a += pixes[i + 3] * gaussMatrix[j];
          gaussSum += gaussMatrix[j + radius];
        }
      }
      i = (y * width + x) * 4;
      // 除以 gaussSum 是为了消除处于边缘的像素, 高斯运算不足的问题
      // console.log(gaussSum)
      pixes[i] = r / gaussSum;
      pixes[i + 1] = g / gaussSum;
      pixes[i + 2] = b / gaussSum;
      // pixes[i + 3] = a ;
    }
  }
  //y 方向一维高斯运算
  for (x = 0; x < width; x++) {
    for (y = 0; y < height; y++) {
      r = g = b = a = 0;
      gaussSum = 0;
      for (j = -radius; j <= radius; j++) {
        k = y + j;
        if (k >= 0 && k < height) { //确保 k 没超出 y 的范围
          i = (k * width + x) * 4;
          r += pixes[i] * gaussMatrix[j + radius];
          g += pixes[i + 1] * gaussMatrix[j + radius];
          b += pixes[i + 2] * gaussMatrix[j + radius];
          // a += pixes[i + 3] * gaussMatrix[j];
          gaussSum += gaussMatrix[j + radius];
        }
      }
      i = (y * width + x) * 4;
      pixes[i] = r / gaussSum;
      pixes[i + 1] = g / gaussSum;
      pixes[i + 2] = b / gaussSum;
    }
  }
  // console.log(frame);
  this.ctx2.putImageData(frame, 0, 0);
  // return frame;
}

// 浮雕
processor.reliefProcess = function reliefProcess(canvasData) {
  //caontext 画布对象  document.querySelector().getContext("2d");
  // conavas document.querySelector().getContext("2d").getImageData();
  // console.log("Canvas Filter - relief process");
  let staticCount = 128
  var tempCanvasData = this.copyImageData(canvasData);
  for (var x = 0; x < tempCanvasData.width - 1; x++) {
    for (var y = 0; y < tempCanvasData.height - 1; y++) {

      // Index of the pixel in the array    
      var idx = (x + y * tempCanvasData.width) * 4;
      var bidx = ((x - 1) + y * tempCanvasData.width) * 4;
      var aidx = ((x + 1) + y * tempCanvasData.width) * 4;

      // calculate new RGB value
      var nr = tempCanvasData.data[aidx + 0] - tempCanvasData.data[bidx + 0] + staticCount;
      var ng = tempCanvasData.data[aidx + 1] - tempCanvasData.data[bidx + 1] + staticCount;
      var nb = tempCanvasData.data[aidx + 2] - tempCanvasData.data[bidx + 2] + staticCount;
      nr = (nr < 0) ? 0 : ((nr > 255) ? 255 : nr);
      ng = (ng < 0) ? 0 : ((ng > 255) ? 255 : ng);
      nb = (nb < 0) ? 0 : ((nb > 255) ? 255 : nb);

      // assign new pixel value    
      canvasData.data[idx + 0] = nr; // Red channel    
      canvasData.data[idx + 1] = ng; // Green channel    
      canvasData.data[idx + 2] = nb; // Blue channel    
      canvasData.data[idx + 3] = 255; // Alpha channel    
    }
  }
  this.ctx2.putImageData(canvasData, 0, 0);
}
processor.copyImageData = function copyImageData(imagedata) {
  // console.log(imagedata.width, imagedata.height);

  return imagedata && new ImageData(new Uint8ClampedArray(imagedata.data), imagedata.width, imagedata.height);
}