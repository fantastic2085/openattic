'use strict';

angular.module('openattic').config(function ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/dashboard');

  $stateProvider
    .state('dashboard', {
      url: '/dashboard',
      views: {
        'main': {templateUrl: 'templates/dashboard.html'}
      }
    })
    .state('pools', {
      url: '/pools',
      controller: 'PoolCtrl',
      views: {
        'main': {templateUrl: 'templates/pools.html'}
      }
    })
    .state('pools.detail', {
      url: '/:pool',
      views: {
        'tab': {templateUrl: 'templates/pools/tab.html'}
      }
    })
    .state('pools.detail.status', {
      url: '/status',
      views: {
        'tab-content': {templateUrl: 'templates/pools/status.html'}
      }
    })
    .state('pools.detail.storage', {
      url: '/storage',
      views: {
        'tab-content': {templateUrl: 'templates/pools/storage.html'}
      }
    })
    .state('pools.detail.cephpool', {
      url: '/cephpool',
      views: {
        'tab-content': {templateUrl: 'templates/pools/cephpool.html'}
      }
    })
    .state('disks', {
      url: '/disks',
      views: {
        'main': {
          templateUrl: 'templates/disks.html'
        }
      }
    })
    .state('volumes', {
      url: '/volumes',
      views: {
        'main': {templateUrl: 'templates/volumes.html'}
      }
    })
    .state('volumes.detail', {
      url: '/:volume',
      views: {
        'tab': {templateUrl: 'templates/volumes/tab.html'}
      }
    })
    .state('volumes.detail.status', {
      url: '/status',
      views: {
        'tab-content': {templateUrl: 'templates/volumes/status.html'}
      }
    })
    .state('volumes.detail.statistics', {
      url: '/statistics',
      views: {
        'tab-content': {templateUrl: 'templates/volumes/statistics.html'}
      }
    })
    .state('volumes.detail.cifs', {
      url: '/cifs',
      views: {
        'tab-content': {templateUrl: 'templates/volumes/cifs.html'}
      }
    })
    .state('volumes.detail.cifs-add', {
      url: '/cifs/add',
      views: {
        'tab-content': {templateUrl: 'templates/volumes/cifs-form.html'}
      }
    })
    .state('volumes.detail.cifs-edit', {
      url: '/cifs/edit/:share',
      views: {
        'tab-content': {templateUrl: 'templates/volumes/cifs-form.html'}
      }
    })
    .state('volumes.detail.nfs', {
      url: '/nfs',
      views: {
        'tab-content': {templateUrl: 'templates/volumes/nfs.html'}
      }
    })
    .state('volumes.detail.nfs-add', {
      url: '/nfs/add',
      views: {
        'tab-content': {templateUrl: 'templates/volumes/nfs-form.html'}
      }
    })
    .state('volumes.detail.luns', {
      url: '/luns',
      views: {
        'tab-content': {templateUrl: 'templates/volumes/luns.html'}
      }
    })
    .state('volumes.detail.luns-add', {
      url: '/luns/add',
      views: {
        'tab-content': {templateUrl: 'templates/volumes/lun-form.html'}
      }
    })
    .state('volumes.detail.http', {
      url: '/http',
      views: {
        'tab-content': {templateUrl: 'templates/volumes/http.html'}
      }
    })
    .state('volumes.detail.http-add', {
      url: '/http/add',
      views: {
        'tab-content': {templateUrl: 'templates/volumes/http-form.html'}
      }
    })
    .state('volumes.detail.storage', {
      url: '/storage',
      views: {
        'tab-content': {templateUrl: 'templates/volumes/storage.html'}
      }
    })
    .state('volumes.detail.snapshots', {
      url: '/snapshots',
      views: {
        'tab-content': {templateUrl: 'templates/volumes/snapshots.html'}
      }
    })
    .state('volumes.detail.snapshots-add', {
      url: '/snapshots/add',
      views: {
        'tab-content': {templateUrl: 'templates/volumes/snapshot-form.html'}
      }
    })
    .state('volumes-add', {
      url: '/volumes/add',
      views: {
        'main': {templateUrl: 'templates/volumes/wizard.html'}
      }
    })
    .state('hosts', {
      url: '/hosts',
      views: {
        'main': {
          templateUrl: 'templates/hosts.html'
        }
      }
    })
    .state('hosts-add', {
      url: '/hosts/add',
      views: {
        'main': {
          templateUrl: 'templates/hosts/form.html'
        }
      }
    })
    .state('hosts-edit', {
      url: '/hosts/edit/:host',
      views: {
        'main': {
          templateUrl: 'templates/hosts/form.html'
        }
      }
    })
    .state('hosts.attributes', {
      url: '/:host',
      views: {
        'detail': {
          templateUrl: 'templates/hosts/attributes.html'
        }
      }
    })
    .state('users', {
      url: '/users',
      views: {
        'main': {
          templateUrl: 'templates/users.html'
        }
      }
    })
    .state('users.list', {
      url: '/list',
      views: {
        'usersview': {
          templateUrl: 'templates/users/list.html'
        }
      }
    })
    .state('users.add', {
      url: '/add',
      views: {
        'usersview': {
          templateUrl: 'templates/users/userform.html'
        }
      }
    })
    .state('users.edit', {
      url: '/edit/:user',
      views: {
        'usersview': {
          templateUrl: 'templates/users/userform.html'
        }
      }
    })
    .state('apikeys', {
      url: '/apikeys',
      views: {
        'main': {
          templateUrl: 'templates/apikeys.html'
        }
      }
    })
    .state('cmdlogs', {
      url: '/cmdlogs',
      views: {
        'main': {
          templateUrl: 'templates/cmdlogs.html'
        }
      }
    })
    .state('crushmap', {
      url: '/crushmap',
      views: {
        'main': {
          templateUrl: 'templates/crushmap.html'
        }
      }
    });
});

// kate: space-indent on; indent-width 2; replace-tabs on;