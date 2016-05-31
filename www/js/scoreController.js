// ScoreController
app.controller('ScoreController', ['$rootScope', '$scope', '$http', 'SharedData', function($rootScope, $scope, $http, SharedData) {
    $scope.courseInfo = SharedData.getCourseInfo();
    $scope.outHoleInfo = SharedData.getOutHoleInfo();
    $scope.inHoleInfo = SharedData.getInHoleInfo();
    
    
}]);
