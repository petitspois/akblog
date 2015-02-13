/**
 * Created by qingdou on 15/2/11.
 */

module.exports = function(){
    var fusion = {};

    //index
    fusion.getHome = function* (){
        //signed
        if(this.session.user){
            this.body = yield this.render('index',{
                title:'首页',
                secondtitle:'最新文章',
                user:this.session.user
            });
        }else{
            this.body = yield this.render('index',{title:'首页',secondtitle:'最新文章'});
        }
    }
    //signup
    fusion.getSignup = function* (){
        this.body = yield this.render('register',{title:'注册',secondtitle:'新用户注册'});
    }
    //signin
    fusion.getSignin = function* (){
        this.body = yield this.render('login',{title:'登陆',secondtitle:'立即登陆'});
    }
    //logout
    fusion.logout = function* (){
        if(this.session.user){
            this.session.user = null;
        }
        this.body = {
            msg:'退出成功',
            status:1
        }
    }






    return fusion;

}