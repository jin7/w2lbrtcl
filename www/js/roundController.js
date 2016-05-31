// RoundController
app.controller('RoundController', ['$rootScope', '$scope', '$http', 'SharedData', function($rootScope, $scope, $http, SharedData) {
    $scope.roundList = [];
    $scope.selectedRoundInfo = null;

    modal.show();
    // ラウンド情報取得
    $.ajax({
        type: 'get',
        url : url + '/rounds',
        beforeSend : function( xhr ) {
            xhr.setRequestHeader("X-W2LBKey", W2LB_CLIENT_KEY);
        },
        scriptCharset: 'utf-8',
        success: function(data) {
            for (var i = 0; i < data.length; i++) {
                console.log(data[i].rname);
                var included = false;
                for (var j = 0; j < $scope.roundList.length; j++) {
                    if ($scope.roundList[j].rid == data[i].rid) {
                        included = true;
                        break;
                    }
                }
                if (!included) {
                    $scope.roundList.push(data[i]);
                }
            }
            $scope.$apply();
            $scope.getMyRoundInfo();
            modal.hide();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            // Error
            console.log(XMLHttpRequest.status + ':' + textStatus + ':' + errorThrown.message);
            modal.hide();
        }
    });

    $scope.getMyRoundInfo = function() {
        if ($scope.roundList.length > 0) {
            for (var i = 0; i < $scope.roundList.length; i++) {
                
            }
        }
    };
    
    // ラウンド情報選択
    $scope.selectRound = function(index) {
        console.log('selectRound:' + $scope.roundList[index].rname);
        $scope.selectedRoundInfo = $scope.roundList[index];
        // requestRoundInfo($scope.selectedRoundInfo.rid);
        $rootScope.$broadcast('requestRoundInfo', $scope.selectedRoundInfo.rid);
    };
}]);

