/*       
兼容 AMD CMD KISSY
For KISSY 1.4
http://docs.kissyui.com/1.4/docs/html/guideline/kmd.html

Author @释剑
注 ：本适配器的kissy适配部分来自 大神 @墨智 http://nuysoft.com/ 
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

