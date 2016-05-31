// waku2 leaderboard RT controllers

// sign up/sign in用コントローラ
app.controller('SignupController', ['$rootScope', '$scope', 'SharedData', function($rootScope, $scope, SharedData) {
    var APPLICATION_KEY = "42c162d547749a093652b567136cc365e9d3f012d9287e84ae6081369607f634";
    var CLIENT_KEY = "dbd61adf008ecf519984328560753b606dcf707083feca7cf10dc13afacc78f5";
    var ncmb = SharedData.getNCMB();
    if (ncmb == null) {
        ncmb = new NCMB(APPLICATION_KEY, CLIENT_KEY);  // mobile backendの初期化
        SharedData.setNCMB(ncmb);
    }

    modal.show();
    var userName = SharedData.getAuthInfo().userName;
    var currentUser = SharedData.getCurrentUser();
    if (!userName) {
        // ユーザーを作成したことがない
        modal.hide();
        // サインアップ
        ons.createDialog('login.html'/*signup.html'*/, {parentScope: $scope}).then(function(dialog) {
            dialog.on('posthide', function(e) {
                var ma = $('#mailAddress').val();
                var pw = $('#password').val();
                // $scope.signup(ma, pw);
                $scope.login(ma, pw);
            });
            dialog.show();
        });
    } else if (!currentUser) {
        // ログアウトされている
        modal.hide();
        // 認証情報入力
        //$roorScope.$broadcast('inputLoginInfo');
        ons.createDialog('login.html', { parentScope: $scope }).then(function(dialog) {
            dialog.on('postshow', function(e) {
                $('#mailAddress').val(SharedData.getAuthInfo().userName);
            });
            dialog.on('posthide', function(e) {
                var ma = $('#mailAddress').val();
                var pw = $('#password').val();
                $scope.login(ma, pw);
            });
            dialog.show();
        });
    } else {
        // ログアウトしていない（前のログインデータが残っている）
        modal.hide();
        currentUser = ncmb.User.getCurrentUser();

        // userオブジェクトを使用してログイン
        ncmb.User.login(currentUser)
            .then(function(user){
                // ログイン後：ユーザーデータの更新
//                alert('再ログイン完了');
                console.log('re-login succeed.');
                SharedData.setCurrentUser(user);
            })
            .catch(function(err){
                // セッション切れの場合はログアウトして再ログイン
                console.log(err);
                ncmb.User.logout();  // ログアウト
                SharedData.setCurrentUser(null);
                $scope.inputAuthInfo();      // 再ログイン
            });
    }
    $scope.signup = function(mailAddress, password) {
        if (mailAddress && mailAddress !== "" && password && password != null) {
            //Userのインスタンスを作成
            var user = new ncmb.User();
            //ユーザー名・パスワードを設定
            user.set("userName", mailAddress)
                .set("password", password);
            // 新規登録
            user.signUpByAccount()
                .then(function(){
                    // 登録後処理
                    SharedData.setAuthInfo(mailAddress);
                    alert('ユーザー登録が完了しました');
                    console.log('sign-up succeed.');
                    $scope.login(mailAddress, password);
                })
                .catch(function(err){
                    // エラー処理
                    SharedData.setAuthInfo(mailAddress);
                    alert('既に登録されている可能性があります:' + err);
                    console.error('sign-up failed:' + err);
                    $scope.inputAuthInfo();
                });
        }
    };
    
    $scope.inputAuthInfo = function() {
        ons.createDialog('login.html', { parentScope: $scope, postshow: $scope.postShow }).then(function(dialog) {
            dialog.on('postshow', function(e) {
                $('#mailAddress').val(SharedData.getAuthInfo().userName);
            });
            dialog.on('posthide', function(e) {
                var ma = $('#mailAddress').val();
                var pw = $('#password').val();
                $scope.login(ma, pw);
            });
            dialog.show();
        });
    };
    $scope.postShow = function(e) {
        var ma = SharedData.getAuthInfo().mailAddress;
        $('mailAddress').val(ma);
    };
    $scope.login = function(mailAddress, password) {
        if (mailAddress && mailAddress !== "" &&
            password && password !== "") {
            SharedData.setAuthInfo(mailAddress, password);
            //$rootScope.$broadcast('doSignup');
            // ログイン実行
            ncmb.User.login(mailAddress, password)
                .then(function(user) {
                    // ログイン成功
                    // カレントユーザー設定
//                    alert('ログイン成功');
                    console.log('login succeed.');
                    SharedData.setCurrentUser(user);
                })
                .catch(function(err) {
                    // ログイン失敗
//                    alert('ログイン失敗:' + err);
                    console.log('login failed:' + err);
                    $scope.inputAutoInfo();
                });
        }
    };
    $scope.logout = function() {
        ncmb.User.logout();
        SharedData.setCurrentUser(null);
    };
}]);
var W2LB_CLIENT_KEY = "24541135cd46ed3db7472fc5b9b6c372c70a08b8406a5045c967517f9fec286c042e84ff4e2905ce19d5f6d36d3f733882faf4f6c88fbac0d077d22d0c929394";
var scheme = 'http://';
var hostname = 'w2lbrt.herokuapp.com';
var port = 80;
var url = scheme + hostname + ":" + port;
// 
app.controller('W2LBController', ['$scope', '$http', 'SharedData', function($scope, $http, SharedData) {
    $scope.courseList = [];
    $scope.roundList = [];
    $scope.selectedRoundInfo = null;
    $scope.userInfo = null;
    $scope.playerInfo = null;
    $scope.courseInfo = null;
    $scope.$watch('courseList', function(newValue, oldValue) {
        $scope.courseList = $scope.courseList;
    });
    
    // ユーザー情報取得
//     $scope.getUserInfo = function() {
//         var authInfo = SharedData.getAuthInfo();
//         if (authInfo.userName) {
//             $.ajax({
//                 type: 'get',
//                 url: url + '/users',
//                 beforeSend: function(xhr) {
//                     xhr.setRequestHeader("X-W2LBKey", W2LB_CLIENT_KEY);
//                 },
//                 scriptCharset: 'utf-8',
//                 success: function(data) {
//                     for (var i = 0; i < data.length; i++) {
//                         if (data[i].mail == authInfo.userName) {
//                             console.log('userInfo:' + data[i].uname + ',' + authInfo.userName);
//                             $scope.userInfo = data[i];
//                             $scope.$apply();
//                             $scope.getPlayerInfo();
//                             break;
//                         }
//                     }
//                 },
//                 error: function(data) {
//                     // Error
//                     console.log(data);
//                 }
//             });
//         }
//     };
//     
//     // プレーヤー情報取得
//     $scope.getPlayerInfo = function() {
//         if ($scope.userInfo) {
//             $.ajax({
//                 type: 'get',
//                 url: url + '/players',
//                 beforeSend: function(xhr) {
//                     xhr.setRequestHeader("X-W2LBKey", W2LB_CLIENT_KEY);
//                 },
//                 scriptCharset: 'utf-8',
//                 success: function(data) {
//                     for (var i = 0; i < data.length; i++) {
// //                        console.log('player-data:' + data[i].uid + ',' + $scope.userInfo.uid);
//                         if (data[i].uid == $scope.userInfo.uid) {
//                             console.log('playerInfo:' + data[i].plid + ',' + $scope.userInfo.uname);
//                             $scope.playerInfo = data[i];
//                             $scope.$apply();
//                             $scope.getCourseInfo($scope.selectedRoundInfo.cid);
//                             break;
//                         }
//                     }
//                 },
//                 error: function(data) {
//                     // Error
//                     console.log(data);
//                 }
//             });
//         }
//     };
    
    // ラウンド情報取得
    // $scope.getRoundInfoList = function() {
    //     modal.show();
    //     $.ajax({
    //         type: 'get',
    //         url : url + '/rounds',
    //         beforeSend : function( xhr ) {
    //             xhr.setRequestHeader("X-W2LBKey", W2LB_CLIENT_KEY);
    //         },
    //         scriptCharset: 'utf-8',
    //         success: function(data) {
    //             for (var i = 0; i < data.length; i++) {
    //                 console.log(data[i].rname);
    //                 var included = false;
    //                 for (var j = 0; j < $scope.roundList.length; j++) {
    //                     if ($scope.roundList[j].rid == data[i].rid) {
    //                         included = true;
    //                         break;
    //                     }
    //                 }
    //                 if (!included) {
    //                     $scope.roundList.push(data[i]);
    //                 }
    //             }
    //             $scope.$apply();
    //             modal.hide();
    //         },
    //         error: function(XMLHttpRequest, textStatus, errorThrown) {
    //             // Error
    //             console.log(XMLHttpRequest.status + ':' + textStatus + ':' + errorThrown.message);
    //             modal.hide();
    //         }
    //     });
    // };
    // ラウンド情報選択
//     $scope.selectRound = function(index) {
//         console.log('selectRound:' + $scope.roundList[index].rname);
//         $scope.selectedRoundInfo = $scope.roundList[index];
// //        $scope.$apply();
//         $scope.getUserInfo();
// //        $scope.getCourseInfo($scope.selectedRoundIndo.cid);
//     };
    
    // コース情報取得
//     $scope.getCouseInfoList = function() {
//         $.ajax({
//             type : 'get',
//             url : url + '/courses',
//             beforeSend: function( xhr ) {
//                 xhr.setRequestHeader("X-W2LBKey", W2LB_CLIENT_KEY);
//             },
//             scriptCharset: 'utf-8',
//             success : function(data) {
//                 // Success
// //                console.log(data);
// //                var gotList = JSON.parse(data);
//                 for (var i = 0; i < data.length; i++) {
// //                    console.log(data[i]);
//                     var included = false;
//                     for (var j = 0; j < $scope.courseList.length; j++) {
//                         if ($scope.courseList[j].cid == data[i].cid) {
//                             included = true;
//                             break;
//                         }
//                     }
//                     if (!included) {
//                         $scope.courseList.push(data[i]);
//                     }
//                 }
//             },
//             error : function(XMLHttpRequest, textStatus, errorThrown) {
//                 // Error
//                 console.log('err:' + XMLHttpRequest.status + ':' + textStatus + ':' + errorThrown.message);
//             }
//         });
//     };
//     $scope.getCourseInfo = function(cid) {
//         $.ajax({
//             type: 'get',
//             url: url + '/courses/' + cid,
//             beforeSend: function(xhr) {
//                 xhr.setRequestHeader("X-W2LBKey", W2LB_CLIENT_KEY);
//             },
//             scriptCharset: 'utf-8',
//             success: function(data) {
//                 // Success
//                 console.log('courseInfo:' + data.cname);
//                 $scope.courseInfo = data;
//                 SharedData.setCourseInfo(data);
//                 $scope.$apply();
//                 $scope.getHoleInfo();
//             },
//             error: function(XMLHttpRequest, textStatus, errorThrown) {
//                 // Error
//                 console.log('cid:' + cid + ':' + XMLHttpRequest.status + ':' + textStatus + ':' + errorThrown.message);
//             }
//         });
//     };
//     // ホール情報取得
//     $scope.getHoleInfo = function() {
//         if ($scope.courseInfo && $scope.playerInfo) {
//             $scope.outHoleInfo = null;
//             $scope.inHoleInfo = null;
//             for (var i = 0; i < $scope.playerInfo.csubids.length; i++) {
//                 console.log('getHoleInfo:' + $scope.playerInfo.csubids[i]);
//                 $.ajax({
//                     type: 'get',
//                     url: url + '/holes/' + $scope.playerInfo.csubids[i],
//                     beforeSend: function(xhr) {
//                         xhr.setRequestHeader("X-W2LBKey", W2LB_CLIENT_KEY);
//                     },
//                     scriptCharset: 'utf-8',
//                     success: function(data) {
//                         // Success
//                         if (!$scope.outHoleInfo) {
//                             // OUT
//                             console.log('outHoleInfo:' + data.csubname);
//                             $scope.outHoleInfo = data;
//                             var outInfo = [];
//                             for (var outindex = 0; outindex < data.names.length; outindex++) {
//                                 outInfo.push(data.names[outindex] + ' Par.' + data.pars[outindex]);
//                             }
// //                            SharedData.setOutHoleInfo(data);
//                             SharedData.setOutHoleInfo(outInfo);
//                         } else {
//                             // IN
//                             console.log('inHoleInfo:' + data.csubname);
//                             $scope.inHoleInfo = data;
//                             var inInfo = [];
//                             for (var inindex = 0; inindex < data.names.length; inindex++) {
//                                 inInfo.push(data.names[inindex] + ' Par.' + data.pars[inindex]);
//                             }
//                             SharedData.setInHoleInfo(inInfo);
// //                            SharedData.setInHoleInfo(data);
// //                            console.log('ons:' + $scope.ons);
//                         }
//                         $scope.$apply();
//                         // if ($scope.outHoleInfo !== null && $scope.inHoleInfo !== null)
//                         // {
//                         //     console.log('to score.html');
//                         //     console.log('navi=' + navi);
//                         //     navi.pushPage('score.html');
//                         // }
//                     },
//                     error: function(data) {
//                         // Error
//                         console.log('err:' + data);
//                     }
//                 });
//             }
//         }
//     };

    $scope.$on('getUserInfo', function(event, data) {
        console.log('WLBController:scope.on:getUserInfo');
        $scope.getUserInfo();
    });
}]);
// ons.ready(function() {
//     console.log("Onsen UI is ready!");
// });
