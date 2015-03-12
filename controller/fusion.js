/**
 * Created by qingdou on 15/2/11.
 */

var userModel = require('../model/').user,

    postModel = require('../model/').post,

    commentModel = require('../model/').comment,

    formatDate = require('../lib/format');

//get request

module.exports = function(){

    var fusion = {};

    //index
    fusion.getHome = function* (){

        var page = parseInt(this.query.p) ? Math.abs(parseInt(this.query.p)) : 1,
            posts = yield postModel.getAll({},'-createtime',page, 10),
            total = Math.ceil((yield postModel.querycount({}))/10);

        for(var i = 0;i<posts.length;i++){
            posts[i].avatar = (yield postModel.getAvatar({name:posts[i].name})).author.avatar;
            posts[i].createtime = formatDate(posts[i].createtime, true);
            posts[i].updatetime = formatDate(posts[i].updatetime, true);
            posts[i].flag = posts[i]['_id'].toString();
        }

        //signed
        if(this.session.user){
            this.body = yield this.render('index',{
                title:'首页',
                user:yield userModel.get({email:this.session.user.email}),
                posts:posts,
                page:{
                    total:total,
                    page:page
                }
            });
        }else{
            this.body = yield this.render('index',{
                title:'首页',
                posts:posts,
                page:{
                    total:total,
                    page:page
                }
            });
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
    //forgot
    fusion.forgat = function* (){
        this.body = yield this.render('forgat',{title:'忘记密码',secondtitle:'找回密码？'});
    }
    //profile
    fusion.profile = function* (){
        if(this.session.user){
            this.body = yield this.render('profile',{
                title:'个人中心',
                user:yield userModel.get({email:this.session.user.email})
            });
        }
    }
    //publish
    fusion.publish = function* (){
        if(this.session.user){
            this.body = yield this.render('publish',{
                title:'发布文章',
                secondtitle:'发布文章',
                user:yield userModel.get({email:this.session.user.email})
            });
        }
    }

    fusion.user = function* (){
        var data = {},
            username = this.params.name,
            oppositeUser = yield userModel.get({nickname:username},'-password'),
            page = parseInt(this.request.body && this.request.body.page) ? Math.abs(parseInt(this.request.body.page)) : 1,
            posts = yield postModel.getAll({author:oppositeUser._id},'-createtime',page, 10),
            poststotal = yield postModel.querycount({author:oppositeUser._id}),
            remain = poststotal-page*10;

            //title
            data.title = username;


            //user
            if(this.session.user){
                data.user = yield userModel.get({email:this.session.user.email}, '-password');
            }

            data.opposite = oppositeUser;


             //posts
            for(var i = 0;i<posts.length;i++){
                posts[i].avatar = (yield postModel.getAvatar({name:posts[i].name})).author.avatar;
                posts[i].createtime = formatDate(posts[i].createtime, true);
                posts[i].url = '/'+(posts[i].type ||'post')+'/'+posts[i]._id;
            }

            data.poststotal = poststotal;
            data.oppositeposts = posts;


        if(this.request.body && this.request.body.page){
            this.body = {
                data:data.oppositeposts,
                extra:remain
            };
        }else{
            this.body = yield this.render('user',data);
        }

    }

    fusion.reply = function* (){

        var data = {},
            username = this.params.name,
            oppositeUser = yield userModel.get({nickname:username},'-password'),
            page = parseInt(this.request.body && this.request.body.page) ? Math.abs(parseInt(this.request.body.page)) : 1,
            comments = yield commentModel.getAll({author:oppositeUser._id},'-createtime',page, 10),
            poststotal = yield commentModel.querycount({author:oppositeUser._id}),
            remain = poststotal-page*10;

        //title
        data.title = username;


        //user
        if(this.session.user){
            data.user = yield userModel.get({email:this.session.user.email}, '-password');
        }

        data.opposite = oppositeUser;


        //posts
        for(var i = 0;i<comments.length;i++){
            if(comments[i].reply){
                comments[i].avatar = (yield userModel.get({nickname:comments[i].reply},'avatar')).avatar;
                comments[i].obj = comments[i].reply;
                comments[i].url = ('/'+(yield postModel.get({_id:comments[i].pid})).type ||'/post')+ '/'+comments[i].pid+'/#'+comments[i]._id;
            }else{
                comments[i].avatar = (yield postModel.getAvatar({_id:comments[i].pid})).author.avatar;
                comments[i].obj = (yield postModel.get({_id:comments[i].pid})).title;
                comments[i].url = ('/'+(yield postModel.get({_id:comments[i].pid})).type ||'/post')+ '/'+comments[i].pid;
            }
            comments[i].description = comments[i].comment;
            comments[i].createtime = formatDate(comments[i].createtime, true);
        }

        data.poststotal = poststotal;
        data.oppositeposts = comments;


        if(this.request.body && this.request.body.page){
            this.body = {
                data:data.oppositeposts,
                extra:remain
            };
        }else{
            this.body = yield this.render('userreply',data);
        }
    }

    return fusion;

}