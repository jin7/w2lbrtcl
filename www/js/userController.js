// UserController
app.controller('UserController', ['$rootScope', '$scope', '$http', 'SharedData', function($rootScope, $scope, $http, SharedData) {
    $scope.userInfo = null;
    $scope.playerInfo = null;
    
    // ユーザー情報取得
    $scope.getUserInfo = function() {
        var authInfo = SharedData.getAuthInfo();
        if (authInfo.userName) {
            $.ajax({
                type: 'get',
                url: url + '/users',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("X-W2LBKey", W2LB_CLIENT_KEY);
                },
                scriptCharset: 'utf-8',
                success: function(data) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].mail == authInfo.userName) {
                            console.log('userInfo:' + data[i].uname + ',' + authInfo.userName);
                            $scope.userInfo = data[i];
                            $scope.$apply();
                            $scope.getPlayerInfo();
                            break;
                        }
                    }
                },
                error: function(data) {
                    // Error
                    console.log(data);
                }
            });
        }
    };
    
    // プレーヤー情報取得
    $scope.getPlayerInfo = function() {
        if ($scope.userInfo) {
            $.ajax({
                type: 'get',
                url: url + '/players',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("X-W2LBKey", W2LB_CLIENT_KEY);
                },
                scriptCharset: 'utf-8',
                success: function(data) {
                    for (var i = 0; i < data.length; i++) {
//                        console.log('player-data:' + data[i].uid + ',' + $scope.userInfo.uid);
                        if (data[i].uid == $scope.userInfo.uid) {
                            console.log('playerInfo:' + data[i].plid + ',' + $scope.userInfo.uname);
                            $scope.playerInfo = data[i];
                            $scope.$apply();
                            $scope.getCourseInfo($scope.selectedRoundInfo.cid);
                            break;
                        }
                    }
                },
                error: function(data) {
                    // Error
                    console.log(data);
                }
            });
        }
    };
    
    $scope.$on('getUserInfo', function(event, data) {
        console.log('scope.on:getUserInfo');
        $scope.getUserInfo();
    });
}]);
