$(function () {
    //初始化下拉多选选择框
    $('.multiple-select').multipleSelect({
        selectAll: false,
        placeholder: '请选择品类',
        ellipsis: true,
        minimumCountSelected: 5
    })

    //表单
    layui.use('form', function () {
        var form = layui.form;
        var layer = layui.layer;

        //获取参数
        var id = getQueryVariable('id');
        if (id) {
            //编辑页面
            //获取数据详情
            getMarketDetail(id);
        }

        //监听提交
        form.on('submit(uploadpic)', function (data) {
            layui.use('jquery', function () {
                var $ = layui.$;
                // 创建FormData根据form
                var uploaddata = new FormData($("#formdata")[0]);
                // 遍历图片数组把图片添加到FormData中
                // var files = document.getElementById("file").files;
                files.reverse()
                var maxsize = 0;
                uploaddata.append("file", files[0]);
                maxsize = maxsize + files[0].size;
                // console.log('uploaddata', uploaddata.getAll("file"))
                if (maxsize > 52428800) {
                    layer.msg('上传的文件总大小不能超过50MB，请重新上传！');
                    return;
                }
                uploadPic("api/picture", uploaddata, function (response) {
                    console.log('response', response)
                    if (response.code == 200) {
                        $("#" + md5(files[0].name)).attr('name', files[0].name)
                        $("#" + md5(files[0].name)).attr('id', response.data)
                    } else {
                        layer.msg(response.msg);
                    }
                });
            });
            return false;//禁止跳转，否则会提交两次，且页面会刷新

        });


        //表单提交
        $("#form_save").click(function () {
            var img = []
            $(".delete").each(function (i, v) {
                img.push(v.id)
            })

            var good_category = $("#good_category").val() || []

            var param = {
                'good_category': good_category,
                'img': img
            }

            //获取资源id
            var id = $("#resource_market_id").val()
            if (id) {
                //编辑
                param['id'] = id
                requrl = '/update'
            } else {
                //新增
                requrl = '/create'
            }

            //请求接口
            console.log(requrl, param)
            // apipost(requrl, param, function (response) {
            //     layer.msg(response.msg)
            // });

        });
    });
})

/**
 * 图片上传
 */
function upload() {
    $("#uploadpic").click();
}

/**
 * 获取传参
 * @param {url} variable 
 */
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) { return pair[1]; }
    }
    return (false);
}

/**
 * 获取信息
 * @param {*}} id 
 */
function getMarketDetail(id = 0) {
    $.getJSON('data/detail.json?id='+id, function(response){
        resdata = response.data
        if (response.code == 200 && resdata) {
            //填充回收品类
            $('#good_category').multipleSelect('setSelects', resdata.good_category)

            //图片填充回显
            img = resdata.img
            if (img && Array.isArray(img)) {
                for (var i = 0; i < img.length; i++) {
                    pic_addr = img[i]
                    fillReady(pic_addr, img[i])
                }
            }

        }
    });
    $("#resource_market_id").val(id)
}

/**
 * 图片处理并显示
 * @param {file} obj 
 */
function preView(obj) {
    var pimg = obj;
    // var pimg = document.querySelector("img");
    var oImg = document.querySelector(".box img");
    var oBox = document.querySelector(".box");
    oBox.style = "display:flex;width:600px;height:600px;margin-left:400px; margin-top:300px"
    // oBox.style.display="flex"
    oImg.src = pimg.src
    oBox.onclick = function () {
        oBox.style.display = "none"
        oImg.src = ''
    }

    var hammer = new Hammer(oImg);//hammer实例化
    hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });//激活pan(移动)功能
    hammer.get('pinch').set({ enable: true });//激活pinch(双指缩放)功能
    hammer.on("panstart", function (event) {
        var left = oImg.offsetLeft;
        var tp = oImg.offsetTop;
        hammer.on("panmove", function (event) {
            oImg.style.left = left + event.deltaX + 'px';
            oImg.style.top = tp + event.deltaY + 'px';
        });
    })

    hammer.on("pinchstart", function (e) {
        hammer.on("pinchout", function (e) {
            oImg.style.transition = "-webkit-transform 300ms ease-out";
            oImg.style.webkitTransform = "scale(2.5)";
        });
        hammer.on("pinchin", function (e) {
            oImg.style.transition = "-webkit-transform 300ms ease-out";
            oImg.style.webkitTransform = "scale(1)";
        });
    })
}

// 创建数组保存图片
var files = new Array();
var id = 0;
// 选择图片按钮隐藏input[file]
$("#btn-upload").click(function () {
    $("#file").trigger("click");
});

/**
 * 点击选择图片
 */
$("#file").change(function () {
    // 获取所有图片
    var images = []
    $(".delete").each(function (i, v) {
        images.push(v.id)
    })

    //限制图片数量
    if (images.length >= 9) {
        layer.msg('最多可以上传9张图片');
        return false;
    }

    //待上传的所有图片
    var img = document.getElementById("file").files;
    //限制图片数量
    if (img.length + images.length > 9) {
        layer.msg('总共最多可以上传9张图片');
        return false;
    }

    // 遍历
    for (var i = 0; i < img.length; i++) {
        // 得到图片
        var file = img[i];
        // 判断是否是图片
        var flag = judgeImgSuffix(file.name);
        if (flag) {

        } else {
            layer.msg("要求图片格式为png,jpg,jpeg,bmp");
            return;
        }
        showPicture(file, img[i].name)
    }
    $("#up").trigger("click");
});

/**
 * 图片处理
 * @param {*} file 
 * @param {*} name 
 */
function showPicture(file, name, flag = 0) {
    // 把图片存到数组中
    files[id] = file;
    id++;
    // 获取图片路径
    var url = URL.createObjectURL(file);
    // 创建img
    var box = document.createElement("img");
    box.setAttribute("src", url);
    box.className = 'img';
    box.onclick = function () {
        preView(this);
    };

    // 创建div
    var imgBox = document.createElement("div");
    imgBox.style.float = 'left';
    imgBox.className = 'img-item';

    // 创建span
    var deleteIcon = document.createElement("span");
    deleteIcon.className = 'delete';
    deleteIcon.innerText = 'x';
    // 把图片名绑定到data里面,md5只是为了把名字规范下，便于作为选择器的id
    name = flag ? name : md5(name)
    deleteIcon.id = name;//名字重新整理
    deleteIcon.name = '';
    // 把img和span加入到div中
    imgBox.appendChild(deleteIcon);
    imgBox.appendChild(box);
    // 获取id=gallery的div
    var body = document.getElementsByClassName("gallery")[0];
    // body.appendChild(imgBox);
    var showPlace = document.getElementsByClassName("img-item")[0];
    body.insertBefore(imgBox, showPlace);
    // 点击span事件
    $(deleteIcon).click(function () {
        // 获取data中的图片名
        var filename = $(this).attr('name');
        // 删除父节点
        $(this).parent().remove();
        var fileList = Array.from(files);
        // 遍历数组
        for (var j = 0; j < fileList.length; j++) {
            // 通过图片名判断图片在数组中的位置然后删除
            if (fileList[j].name == filename) {
                fileList.splice(j, 1);
                id--;
                break;
            }
        }
        files = fileList;
    });
}

/**
 * 判断是否是图片类型
 * @param {*} path 
 */
function judgeImgSuffix(path) {
    var index = path.lastIndexOf('.');
    var suffix = "";
    if (index > 0) {
        suffix = path.substring(index + 1);
    }
    if ("png" == suffix || "jpg" == suffix || "jpeg" == suffix || "bmp" == suffix || "PNG" == suffix || "JPG" == suffix || "JPEG" == suffix || "BMP" == suffix) {
        return true;
    } else {
        return false;
    }
}

/**
 * 图片回显填充
 * @param {*} url 
 * @param {*} name 
 */
function fillReady(url, name) {
    var image = new Image();
    image.crossOrigin = 'Anonymous'; //远端图片跨域，服务端同时需要在nginx中配置图片访问跨域内容
    image.src = url;
    image.onload = function () {
        var base64 = getBase64Image(image);
        var img2 = convertBase64UrlToBlob(base64);
        a = blobToFile(img2, name)
        showPicture(a, name, 1)
    }
}

/**
 * blob转file
 * @param {*} theBlob 
 * @param {*} name 
 */
function blobToFile(theBlob, name) {
    let file = new window.File([theBlob], name, { type: 'image/jpeg' })
    return file;
}

/**  
 * 将以base64的图片url数据转换为Blob  
 * @param urlData  
 * 用url方式表示的base64图片数据  
 */
function convertBase64UrlToBlob(base64) {
    var urlData = base64.dataURL;
    var type = base64.type;
    var bytes = window.atob(urlData.split(',')[1]); //去掉url的头，并转换为byte
    //处理异常,将ascii码小于0的转换为大于0  
    var ab = new ArrayBuffer(bytes.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i);
    }
    return new Blob([ab], { type: type });
}

/* 
* 图片的绝对路径地址 转换成base64编码 如下代码： 
*/
function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
    var dataURL = canvas.toDataURL("image/" + ext);
    return {
        dataURL: dataURL,
        type: "image/" + ext
    };
}
