angular.module('openattic.auth')
  .controller('authController', function ($scope, $window, authService) {
    $scope.login = function(){
      var loginData = {'username': $scope.username, 'password': $scope.password};
      authService.login(loginData)
        .$promise
        .then(function(res){
          $scope.user = res.username;
          $window.location.href = '/openattic/angular2/#/dashboard'
        })
        .catch(function(res){
          $window.location.href = '/openattic/angular2/login.html'
        });
    };
  });