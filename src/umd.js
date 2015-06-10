/*       
## 通用模块定义
Universal Module Definition
兼容 AMD KISSY CMD
Author @释剑

这里在非AMD的环境里面会重新定义一份符合AMD而且兼容CMD or KMD的define和require。
你可以放心按照AMD的规范来编写代码，它可以跑再任意的*MD环境里。

*/

var UMD = {
    packages : [],
    start : function(){
        /**
         *检查包是否在集合中
         */
        function checkInBackages(id) {
            var packages = UMD.packages;
            if (packages.length > 0) {
                for (var i = 0, l = packages.length; i < l; i++) {
                    if (id.indexOf(packages[i].name) == 0) {
                        return true
                    }
                }
            }
        }

        function isArray(obj){
            return (obj.constructor.toString().indexOf("Array") != -1)
        }

        if (!window.define) {
            if(KISSY){
                window.define = function define(id, dependencies, factory) {
                    // KISSY.add(name?, factory?, deps)
                    function proxy() {
                        var args = [].slice.call(arguments, 1, arguments.length);
                        return factory.apply(window, args)
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

                window.define.kmd = {}

                if(!window.require){
                    window.require = function( deps , hander ){
                        function proxy() {
                            var args = [].slice.call(arguments, 1, arguments.length);
                            return hander.apply(window, args)
                        }
                        KISSY.use( isArray(deps) ? deps.join(",") : deps , proxy );
                    };
                }
            }
        } 
        if( typeof define == "function" && define.cmd ){
            var cmdDefine = define;
            window.define = function( id , deps , factory ){

                //只有固定的一些包是按照amd规范写的才需要转换。
                //比如canvax项目，是按照amd规范的，但是这个包是给业务项目中去使用的。
                //而这个业务使用seajs规范，所以业务中自己的本身的module肯定是按照seajs来编写的不需要转换
                
                if( typeof id == "string" && checkInBackages(id) ){
                    //只有canvax包下面的才需要做转换，因为canvax的module是安装amd格式编写的
                    return cmdDefine(id , deps , function( require, exports, module ){
                        var depList = [];
                        for( var i = 0 , l = deps.length ; i<l ; i++ ){
                            depList.push( require(deps[i]) );
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
            if( !window.require ){
                window.require = seajs.use;
            }
        }    
        if( typeof define == "function" && define.amd ){
            //额，本来就是按照amd规范来开发的，就不需要改造了。
        }
    },
    /*
     *@packages 需要UMD重新定义的 包集合[{name:,path:},]
     **/
    config: function (packages) {
        UMD.packages = packages || [];
        packages = UMD.packages;

        for (var i = 0, l = packages.length; i < l; i++) {
            var name = packages[i].name.toString();
            var path = packages[i].path;
            var debug= packages[i].debug ? true : false;
            var combine = packages[i].combine ? true : false;
            window.KISSY && KISSY.config({ packages: [{
                name: name,
                path: path,
                debug: debug,
                combine: combine
            }]
            });

            var packageObj = {};
            packageObj[name] = path;
            if (window.seajs) {
                packageObj[name] = path + name;
                
                //在seajs中，如果包配置的是本地资源../../ , ../ 这样的路径，会有问题需要手动修正
                if( path.indexOf("../")>=0 ){
                    var si = path.split("../").length;
                    packageObj[name] = window.location.origin+window.location.pathname.split("/").slice(0 , -si).join("/")+"/"+name
                }
                
                seajs.config({ paths: packageObj });
            }
            if (window.requirejs) {
                packageObj[name] = path + name;
                requirejs.config({ paths: packageObj });
            }
        }
    }
};
UMD.start();
