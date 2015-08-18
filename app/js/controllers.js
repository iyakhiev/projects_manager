'use strict';

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

var checkUser = function($http, $cookieStore, $location, $rootScope, auth, callback) {
    postFunction($http, '/getuser', {"mail": auth.mail}, function (data) {
        callback(data);
    });
};

projectsManagerCtrls.controller('NavCtrl', ['$scope', '$rootScope', '$cookieStore', '$location',
    function($scope, $rootScope, $cookieStore, $location) {
        $scope.user = $rootScope.globals;

        $scope.$on('login', function() {
            $scope.user = $rootScope.globals;
        });

        $scope.logout = function() {
            $scope.user = {};
            $rootScope.globals = {};
            $cookieStore.remove("globals");
            $location.path('/login');
        }
    }]);

projectsManagerCtrls.controller('LoginCtrl', ['$scope', '$http', '$cookieStore', '$location', '$rootScope',
    function($scope, $http, $cookieStore, $location, $rootScope) {
        $scope.auth = {
            loading: false,
            wrongPass: false,
            notRegistered: false
        };

        $scope.login = function () {
            $scope.auth.loading = true;
            checkUser($http, $cookieStore, $location, $rootScope, $scope.auth, function(data) {
                if(data.rows && data.rows.length == 1) {
                    $scope.auth.notRegistered = false;
                    if($scope.auth.password == data.rows[0].password) {
                        $cookieStore.put("globals", {
                            id: data.rows[0].id,
                            name: data.rows[0].name
                        });
                        $rootScope.globals = $cookieStore.get('globals') || {};
                        $rootScope.$broadcast('login');
                        $scope.auth.wrongPass = false;
                        $location.path('/projects');
                    } else {
                        $scope.auth.wrongPass = true;
                    }
                } else {
                    $scope.auth.notRegistered = true;
                }
                $scope.auth.loading = false;
            });
        };
    }]);

projectsManagerCtrls.controller('RegisterCtrl', ['$scope', '$http', '$cookieStore', '$location', '$rootScope',
    function($scope, $http, $cookieStore, $location, $rootScope) {
        $scope.userInfo = {
            loading: false,
            "mailRegistered": false
        };

        $scope.register = function () {
            $scope.userInfo.loading = true;
            checkUser($http, $cookieStore, $location, $rootScope, $scope.userInfo, function(data) {
                if(data.rows && data.rows.length == 0) {
                    $scope.userInfo.mailRegistered = false;
                    postFunction($http, '/adduser', $scope.userInfo, function (data) {
                        $cookieStore.put("globals", {
                            id: data.id,
                            name: $scope.userInfo.userName
                        });
                        $rootScope.globals = $cookieStore.get('globals') || {};
                        $rootScope.$broadcast('login');
                        $location.path('/projects');
                    });
                } else {
                    $scope.userInfo.mailRegistered = true;
                    $scope.userInfo.loading = false;
                }
            });
        };
    }]);

projectsManagerCtrls.controller('ProjectsBoardCtrl', ['$scope', '$http', '$rootScope',
    function($scope, $http, $rootScope) {
        postFunction($http, '/getproject', {"userId": $rootScope.globals.id, "id": "0"}, function (data) {
            console.log("projects:", data);
            $scope.projects = data.rows;
        });
    }]);

projectsManagerCtrls.controller('NewProjectCtrl', ['$scope', '$location', '$http', '$rootScope',
    function($scope, $location, $http, $rootScope) {
        $scope.project = {
            loading: false
        };
        $scope.save = function () {
            $scope.project.loading = true;
            postFunction($http, '/newproject', {
                "title": $scope.project.title,
                "description": ($scope.project.description || ""),
                "creatorId": $rootScope.globals.id
            }, function (data) {
                $location.path('/projects');
            });
        };
    }]);

projectsManagerCtrls.controller('EditProjectCtrl', ['$scope', '$routeParams', '$http', '$location', '$rootScope',
    function($scope, $routeParams, $http, $location, $rootScope) {
        $scope.project = {
            loading: false
        };
        postFunction($http, '/getproject', {"userId": $rootScope.globals.id, "id": $routeParams["projectID"]}, function (data) {
            if (data.rows.length == 1) {
                $scope.project = data.rows[0];
            } else {
                $location.path('/projects')
            }
        });

        $scope.save = function () {
            $scope.project.loading = true;
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
            $scope.project.loading = true;
            postFunction($http, '/deleteproject', {"id": $routeParams["projectID"]}, function (data) {
                if (data.id == "-1") {
                    console.log(data);
                } else {
                    $location.path('/projects')
                }
            });
        };
    }]);

projectsManagerCtrls.controller('NewTaskCtrl', ['$scope', '$http', '$routeParams', '$location', '$rootScope',
    function($scope, $http, $routeParams, $location, $rootScope) {
        $scope.priority = [{color: 'normal'}, {color: 'green'}, {color: 'blue'}, {color: 'red'}];
        $scope.projectID = $routeParams['projectID'] || "";
        $scope.title = $routeParams['projectTitle'] || "";
        $scope.task = {
            loading: false,
            plannedCapacity: 0,
            actualCapacity: 0,
            priority: $scope.priority[0].color
        };
        $scope.users = [];

        postFunction($http, '/getuser', {}, function (data) {
            $scope.users = data.rows;
        });

        $scope.save = function () {
            $scope.task.loading = true;
            $scope.task.creatorId = $rootScope.globals.id;
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
        $scope.task = {
            loading: false
        };

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
            $scope.task.loading = true;
            postFunction($http, '/updatetask', $scope.task, function (data) {
                $location.path('/' + $scope.title + '/' + $scope.projectID + '/tasks');
            });
        };

        $scope.delete = function () {
            $scope.task.loading = true;
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