# front-show-demo
前端表单展示demo


> FAQ

> 1、远程图片读取压缩，canvas等，出现跨域；需要在服务端nginx图片读取跨域配置

        location ~ .*\.(gif|jpg|jpeg|png|bmp|swf|flv|mp4|ico)$ {
            #允许跨域请求
            add_header Access-Control-Allow-Origin '*';
            add_header Access-Control-Allow-Headers X-Requested-With;
            add_header Access-Control-Allow-Methods GET,POST,OPTIONS;

            expires 30d;
            access_log off;
        }

>2、