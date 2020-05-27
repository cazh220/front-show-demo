var API_URL = "http://laravel2.cc/";
var logintoken = '';
//GET
function apiget(url, data, successCallBack) {
    const REQUESTURL = API_URL+url
	$.ajax({
		headers: { logintoken: logintoken },
		type: "GET",
		url: REQUESTURL,
		data: data,
		async: true,
		datatype: "json",
		/*******CORS cookie*******/
		xhrFields: {
			withCredentials: true
		},
		/***************/
		success: function (response) {
            if (response.code == 200) {
                if (successCallBack) {
                    successCallBack(response);
                }
            } else {
                console.log(response)
            }
		},
		error: function (e) {
			console.log("err:"+e);
		}
	});
}

//POST
function apipost(url, data, successCallBack) {
    const REQUESTURL = API_URL+url
    
	$.ajax({
		headers: { logintoken: logintoken },
		type: "POST",
		url: REQUESTURL,
		data: data,
		async: true,
		datatype: "json",
		/*******CORS cookie*******/
		xhrFields: {
			withCredentials: true
		},
		/***************/
		success: function (response) {
            if (response.code == 200) {
                if (successCallBack) {
                    successCallBack(response);
                }
            } else {
                console.log(response)
            }
		},
		error: function (e) {
			console.log("err:"+e);
		}
	});
}

//图片上传
function uploadPic(url, data, successCallBack) {
    const REQUESTURL = API_URL+url
	$.ajax({
		headers: { logintoken: logintoken },
		type: "POST",
		url: REQUESTURL,
		data: data,
		async: false,
		contentType: false,
		processData: false,
		/*******CORS cookie*******/
		xhrFields: {
			withCredentials: true
		},
		/***************/
		success: function (response) {
			if (response.code == 200) {
                if (successCallBack) {
                    successCallBack(response);
                }
            } else {
                console.log(response)
            }
		},
		error: function (e) {
			console.log("err:"+e);
		}
	});
}
