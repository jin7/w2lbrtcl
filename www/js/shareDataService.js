//var app = ons.bootstrap('myApp', ['onsen']);
var app = angular.module('myApp', ['onsen']);

// コントローラ間データ共有サービス
app.factory('SharedData', function() {
    var sharedData = {};
    sharedData.authInfo = {};
    
    var userName = localStorage.getItem('userName');
    if (userName) {
        sharedData.authInfo.userName = userName;
    }
    var mailAddress = localStorage.getItem('mailAddress');
    if (mailAddress) {
        sharedData.authInfo.mailAddress = mailAddress;
    }
    var currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        sharedData.currentUser = currentUser;
    }
    
    sharedData.setNCMB = function(ncmb) {
        sharedData.ncmb = ncmb;
    };
    sharedData.getNCMB = function() {
        return sharedData.ncmb;
    };
    sharedData.setAuthInfo = function(userName, password) {
        sharedData.authInfo.userName = userName;
        sharedData.authInfo.password = password;
        localStorage.setItem('userName', userName);
    };
    sharedData.getAuthInfo = function() {
        return sharedData.authInfo;
    };
    sharedData.setCurrentUser = function(user) {
        sharedData.currentUser = user;
        if (user != null) {
            localStorage.setItem('currentUser', user);
        } else {
            localStorage.removeItem('currentUser');
        }
    };
    sharedData.getCurrentUser = function() {
        return sharedData.currentUser;
    };
    
    sharedData.setCourseInfo = function(courseInfo) {
        sharedData.courseInfo = courseInfo;
    };
    sharedData.getCourseInfo = function() {
        return sharedData.courseInfo;
    };
    sharedData.setOutHoleInfo = function(holeInfo) {
        sharedData.outHoleInfo = holeInfo;
    };
    sharedData.getOutHoleInfo = function() {
        return sharedData.outHoleInfo;
    };
    sharedData.setInHoleInfo = function(holeInfo) {
        sharedData.inHoleInfo = holeInfo;
    };
    sharedData.getInHoleInfo = function() {
        return sharedData.inHoleInfo;
    };
    return sharedData;
});
