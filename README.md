# 把用AMD规范编写的module适配到KISSY AND SEAJS 规范中的适配器

* 现在js的module规范里面，很大一部分都是遵循AMD规范，但是还有很多一部分在使用seajs的CMD规范，以及阿里系的KISSY的module规范（我们对其简称KMD）。

* 那么，其实我们可以用遵循AMD规范的module，然后把它适配到能在CMD，KMD的规范中都能跑。

* 这就是adaptdefine.js 要做的事情。

我们要用标准的AMD定义module的方式：id deps factory

```js
define(id , deps ,factory(){
    
});
```

然后加上适配器adaptdefine.js

```js
/*       
兼容 AMD CMD KISSY
For KISSY 1.4
http://docs.kissyui.com/1.4/docs/html/guideline/kmd.html

Author @释剑
注 ：本适配器的kissy适配部分来自 大神 @墨智  
*/

if (!window.define) {
    if(KISSY){
        window.define = function define(id, dependencies, factory) {
            // KISSY.add(name?, factory?, deps)
            function proxy() {
                var slice = [].slice;
                var args = slice.call(arguments, 1, arguments.length);
                return factory.apply(window, args);
            }
            switch (arguments.length) {
                case 2:
                    factory = dependencies;
                    dependencies = id;
                    KISSY.add(proxy, {
                        requires: dependencies
                    });
                    break;
                case 3:
                    KISSY.add(id, proxy, {
                        requires: dependencies
                    });
                    break;
            }
        };
        window.define.kmd = {};
    }
} 
if( typeof define == "function" && define.cmd ){
    var cmdDefine = define;
    window.define = function( id , deps , factory ){

        //只有固定的一些包是按照amd规范写的才需要转换。
        //比如canvax项目，是按照amd规范的，但是这个包是给业务项目中去使用的。
        //而这个业务使用seajs规范，所以业务中自己的本身的module肯定是按照seajs来编写的不需要转换
        //下边已经canvas 图形渲染引擎 canvax为例。
        if( typeof id == "string" && id.indexOf("canvax/") >= 0 ){
            return cmdDefine(id , deps , function( require, exports, module ){
                var depList = []
                for( var i = 0 , l = deps.length ; i<l ; i++ ){
                    depList.push( require(deps[i]) )
                }
                //return factory.apply(window , depList);

                //其实用上面的直接return也是可以的
                //但是为了遵循cmd的规范，还是给module的exports赋值
                module.exports = factory.apply(window , depList);
            });
        } else {
            return cmdDefine.apply(window , arguments);
        }
    }
}    
if( typeof define == "function" && define.amd ){
    //额，本来就是按照amd规范来开发的，就不需要改造了。
}

var baseUrl = "../";
var configs = {
    packages : [
        {
            name : "canvax",
            path : baseUrl 
        }
    ],
    alias : {
        "canvax" : baseUrl
    },
    paths : {
        "canvax" : baseUrl
    }

}

window.KISSY && KISSY.config( {packages : configs.packages} );
window.seajs && seajs.config( {alias    : configs.alias} );
window.requirejs && requirejs.config( {paths : configs.paths} );
```

然后你编写的模块既可以在seajs环境中跑，又可以在KISSY环境中跑。是不是很过瘾

具体可以看demo文件夹中的两demo。
