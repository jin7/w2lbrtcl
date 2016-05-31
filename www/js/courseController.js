// CourseController
app.controller('CourseController', ['$rootScope', '$scope', '$http', 'SharedData', function($rootScope, $scope, $http, SharedData) {
    $scope.courseList = [];
    $scope.courseInfo = null;

    // コース情報取得
    $scope.getCouseInfoList = function() {
        $.ajax({
            type : 'get',
            url : url + '/courses',
            beforeSend: function( xhr ) {
                xhr.setRequestHeader("X-W2LBKey", W2LB_CLIENT_KEY);
            },
            scriptCharset: 'utf-8',
            success : function(data) {
                // Success
//                console.log(data);
//                var gotList = JSON.parse(data);
                for (var i = 0; i < data.length; i++) {
//                    console.log(data[i]);
                    var included = false;
                    for (var j = 0; j < $scope.courseList.length; j++) {
                        if ($scope.courseList[j].cid == data[i].cid) {
                            included = true;
                            break;
                        }
                    }
                    if (!included) {
                        $scope.courseList.push(data[i]);
                    }
                }
            },
            error : function(XMLHttpRequest, textStatus, errorThrown) {
                // Error
                console.log('err:' + XMLHttpRequest.status + ':' + textStatus + ':' + errorThrown.message);
            }
        });
    };
    $scope.getCourseInfo = function(cid) {
        $.ajax({
            type: 'get',
            url: url + '/courses/' + cid,
            beforeSend: function(xhr) {
                xhr.setRequestHeader("X-W2LBKey", W2LB_CLIENT_KEY);
            },
            scriptCharset: 'utf-8',
            success: function(data) {
                // Success
                console.log('courseInfo:' + data.cname);
                $scope.courseInfo = data;
                SharedData.setCourseInfo(data);
                $scope.$apply();
                $scope.getHoleInfo();
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                // Error
                console.log('cid:' + cid + ':' + XMLHttpRequest.status + ':' + textStatus + ':' + errorThrown.message);
            }
        });
    };
    // ホール情報取得
    $scope.getHoleInfo = function() {
        if ($scope.courseInfo && $scope.playerInfo) {
            $scope.outHoleInfo = null;
            $scope.inHoleInfo = null;
            for (var i = 0; i < $scope.playerInfo.csubids.length; i++) {
                console.log('getHoleInfo:' + $scope.playerInfo.csubids[i]);
                $.ajax({
                    type: 'get',
                    url: url + '/holes/' + $scope.playerInfo.csubids[i],
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader("X-W2LBKey", W2LB_CLIENT_KEY);
                    },
                    scriptCharset: 'utf-8',
                    success: function(data) {
                        // Success
                        if (!$scope.outHoleInfo) {
                            // OUT
                            console.log('outHoleInfo:' + data.csubname);
                            $scope.outHoleInfo = data;
                            var outInfo = [];
                            for (var outindex = 0; outindex < data.names.length; outindex++) {
                                outInfo.push(data.names[outindex] + ' Par.' + data.pars[outindex]);
                            }
//                            SharedData.setOutHoleInfo(data);
                            SharedData.setOutHoleInfo(outInfo);
                        } else {
                            // IN
                            console.log('inHoleInfo:' + data.csubname);
                            $scope.inHoleInfo = data;
                            var inInfo = [];
                            for (var inindex = 0; inindex < data.names.length; inindex++) {
                                inInfo.push(data.names[inindex] + ' Par.' + data.pars[inindex]);
                            }
                            SharedData.setInHoleInfo(inInfo);
//                            SharedData.setInHoleInfo(data);
//                            console.log('ons:' + $scope.ons);
                        }
                        $scope.$apply();
                        // if ($scope.outHoleInfo !== null && $scope.inHoleInfo !== null)
                        // {
                        //     console.log('to score.html');
                        //     console.log('navi=' + navi);
                        //     navi.pushPage('score.html');
                        // }
                    },
                    error: function(data) {
                        // Error
                        console.log('err:' + data);
                    }
                });
            }
        }
    };
}]);
