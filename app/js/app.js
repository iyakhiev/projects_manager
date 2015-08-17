'use strict';

var projectsManager = angular.module('projectsManager', [
    'ngRoute',
    'ngCookies',
    'projectsManagerCtrls'
]);

projectsManager.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/login', {
            templateUrl: 'partials/login.html',
            controller: 'LoginCtrl'
        }).
        when('/register', {
            templateUrl: 'partials/register.html',
            controller: 'RegisterCtrl'
        }).
        when('/projects', {
            templateUrl: 'partials/projects-board.html',
            controller: 'ProjectsBoardCtrl'
        }).
        when('/newproject', {
            templateUrl: 'partials/project-detail.html',
            controller: 'NewProjectCtrl'
        }).
        when('/editproject/:projectID', {
            templateUrl: 'partials/project-detail.html',
            controller: 'EditProjectCtrl'
        }).
        when('/:projectTitle/:projectID/tasks', {
            templateUrl: 'partials/tasks-board.html',
            controller: 'TasksBoardCtrl'
        }).
        when('/:projectTitle/:projectID/newtask', {
            templateUrl: 'partials/task-detail.html',
            controller: 'NewTaskCtrl'
        }).
        when('/:projectTitle/:projectID/edittask/:taskID', {
            templateUrl: 'partials/task-detail.html',
            controller: 'EditTaskCtrl'
        }).
        otherwise({
            redirectTo: '/projects'
        });
}]);

projectsManager.run(['$rootScope', '$location', '$cookieStore', '$http', function($rootScope, $location, $cookieStore, $http) {
    $cookieStore.put("globals", {
        id: 2,
        currentUser: "isa"
    });

    $rootScope.globals = $cookieStore.get('globals') || {};
    if ($rootScope.globals.currentUser) {
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser; // jshint ignore:line
    }

    $rootScope.$on('$locationChangeStart', function (event, next, current) {
        var restrictedPage = $.inArray($location.path(), ['/login', '/register']) === -1;
        var loggedIn = $rootScope.globals.currentUser;

        if (restrictedPage && !loggedIn) {
            $location.path('/login');
        }
        if(!restrictedPage && loggedIn) {
            $location.path('/projects');
        }
    });
}]);