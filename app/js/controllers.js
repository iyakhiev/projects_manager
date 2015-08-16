'use strict'

var userID = 1;
var projectsManagerCtrls = angular.module('projectsManagerCtrls', []);

var postFunction = function($http, url, data, successCallback, errorCallback) {
    $http.post(url, data).
        success(function (data, status, headers, config) {
            if (successCallback != undefined) {
                successCallback(data, status, headers, config);
            } else {
                console.log("success:", data, status);
            }
        }).
        error(function (data, status, headers, config) {
            if (errorCallback != undefined) {
                errorCallback(data, status, headers, config);
            } else {
                console.log("error:", data, status);
            }
        });
};

projectsManagerCtrls.controller('SignInCtrl', ['$scope', '$http',
    function($scope, $http) {
        $scope.signin = {};
        $scope.signin = function () {

        };
    }]);

projectsManagerCtrls.controller('ProjectsBoardCtrl', ['$scope', '$http',
    function($scope, $http) {
        postFunction($http, '/getproject', {"userId": userID, "id": "0"}, function (data) {
            console.log(data);
            $scope.projects = data.rows;
        });
    }]);

projectsManagerCtrls.controller('NewProjectCtrl', ['$scope', '$location', '$http',
    function($scope, $location, $http) {
        $scope.save = function () {
            postFunction($http, '/newproject', {
                "title": $scope.project.title,
                "description": ($scope.project.description || ""),
                "creatorId": userID
            }, function (data) {
                $location.path('/projects');
                //$location.path('/' + data.id + '/tasks')
            });
        };
    }]);

projectsManagerCtrls.controller('EditProjectCtrl', ['$scope', '$routeParams', '$http', '$location',
    function($scope, $routeParams, $http, $location) {
        postFunction($http, '/getproject', {"userId": userID, "id": $routeParams["projectID"]}, function (data) {
            if (data.rows.length == 1) {
                $scope.project = data.rows[0];
            } else {
                $location.path('/projects')
            }
        });

        $scope.save = function () {
            postFunction($http, '/updateproject', {
                    "title": $scope.project.title,
                    "description": $scope.project.description || "",
                    "id": $routeParams["projectID"]
                },
                function (data) {
                    $location.path('/projects')
                });
        };

        $scope.delete = function () {
            postFunction($http, '/deleteproject', {"id": $routeParams["projectID"]}, function (data) {
                if (data.id == "-1") {
                    console.log(data);
                } else {
                    $location.path('/projects')
                }
            });
        };
    }]);

projectsManagerCtrls.controller('NewTaskCtrl', ['$scope', '$http', '$routeParams', '$location',
    function($scope, $http, $routeParams, $location) {
        $scope.priority = [{color: 'normal'}, {color: 'green'}, {color: 'blue'}, {color: 'red'}];
        $scope.projectID = $routeParams['projectID'] || "";
        $scope.title = $routeParams['projectTitle'] || "";
        $scope.task = {
            plannedCapacity: 0,
            actualCapacity: 0,
            priority: $scope.priority[0].color
        };
        $scope.users = [];

        postFunction($http, '/getuser', {}, function (data) {
            $scope.users = data.rows;
        });

        $scope.save = function () {
            $scope.task.creatorId = userID;
            $scope.task.projectId = $scope.projectID;
            $scope.task.description = $scope.task.description || "";
            $scope.task.status = 'planned';

            postFunction($http, '/newtask', $scope.task, function (data) {
                $location.path('/' + $scope.title + '/' + $scope.projectID + '/tasks');
            });
        };
    }]);

projectsManagerCtrls.controller('EditTaskCtrl', ['$scope', '$http', '$routeParams', '$location',
    function($scope, $http, $routeParams, $location) {
        $scope.priority = [{color: 'normal'}, {color: 'green'}, {color: 'blue'}, {color: 'red'}];
        $scope.projectID = $routeParams['projectID'] || "";
        $scope.title = $routeParams['projectTitle'] || "";
        $scope.taskID = $routeParams['taskID'] || "";
        $scope.users = [];

        postFunction($http, '/getuser', {}, function (data) {
            $scope.users = data.rows;
        });

        postFunction($http, '/gettask', {"projectId": $routeParams['projectID'], id: $scope.taskID}, function (data) {
            if (data.rows.length == 1) {
                $scope.task = data.rows[0];
            } else {
                $location.path('/' + $scope.title + '/' + $scope.projectID + '/tasks');
            }
        });

        $scope.save = function () {
            postFunction($http, '/updatetask', $scope.task, function (data) {
                $location.path('/' + $scope.title + '/' + $scope.projectID + '/tasks');
            });
        };

        $scope.delete = function () {
            postFunction($http, '/deletetask', {id: $scope.taskID}, function (data) {
                $location.path('/' + $scope.title + '/' + $scope.projectID + '/tasks');
            });
        };
    }]);

projectsManagerCtrls.controller('TasksBoardCtrl', ['$scope', '$http', '$routeParams',
    function($scope, $http, $routeParams) {
        $scope.title = $routeParams['projectTitle'] || "";
        $scope.projectID = $routeParams['projectID'] || "";
        $scope.tasks = [];
        $scope.checked = {};
        $scope.checkedN = 0;

        postFunction($http, '/gettask', {"projectId": $routeParams['projectID'], id: "0"}, function (data) {
            for (var t in data.rows) {
                data.rows[t].progress = data.rows[t].actualCapacity == 0 ? 0 : Math.round(100 * (data.rows[t].actualCapacity / data.rows[t].plannedCapacity));
                data.rows[t].checked = false;
            }

            $scope.tasks = data.rows;
        });

        $scope.click = function (task) {
            if ($scope.checked[task.id] == undefined) {
                $scope.checkedN++;
                task.checked = true;
                $scope.checked[task.id] = task;
            } else {
                $scope.checkedN--;
                task.checked = false;
                delete $scope.checked[task.id];
            }
        };

        $scope.status = function (task, status) {
            task.status = status;
            postFunction($http, '/updatetask', {id: task.id, status: task.status});
        };
    }]);