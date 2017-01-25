/**
 *
 * @source: http://bitbucket.org/openattic/openattic
 *
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * Copyright (c) 2016 SUSE LLC
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License as published by the Free Software
 * Foundation; version 2.
 *
 * This package is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * As additional permission under GNU GPL version 2 section 3, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 1, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */
"use strict";

var app = angular.module("openattic.drbd");
app.directive("drbdAdd", function () {
  return {
    restrict: "E",
    scope: {
      validation: "=",
      masterData: "=",
      wizard: "="
    },
    templateUrl: "components/drbd/templates/add-drbd.html",
    controller: function ($scope, PoolService, drbdService, toasty) {
      // Default values.
      $scope.data = {
        remote_pool: null,
        volume_mirroring: false,
        syncer_rate: "30M",
        protocol: "C"
      };

      // Listen to Pool selections. Reload and filter the remote pool list
      // if a pool has been selected.
      $scope.$watch("masterData.source_pool", function (pool) {
        if (!pool)
          return;
        PoolService.query({ excl_host: pool.host })
          .$promise
          .then(function (res) {
            $scope.remote_pools = res;
          }, function (error) {
            console.log("An error occurred", error);
            toasty.error({
              title: "Pool list couldn't be loaded",
              msg: "Server failure."
            });
            $scope.validation.remote_pool.$setValidity("loading", false);
          })
      });

      // Listen to the event that is fired when a volume has been created.
      $scope.$on("volumecreate", function (event, volume) {
        if (!$scope.data.volume_mirroring)
          return;
        // Create the mirror connection.
        drbdService.save({
            source_volume: {
              id: volume.id
            },
            protocol: $scope.data.protocol,
            syncer_rate: $scope.data.syncer_rate,
            filesystem: $scope.masterData.filesystem
          })
          .$promise
          .then(function (res) {
            // Create the mirror volume.
            drbdService.save({
                connection_id: connection.id,
                source_volume: {
                  id: volume.id
                },
                remote_pool: {
                  id: $scope.data.remote_pool.id
                }
              })
              .$promise
              .then(function (res) {
                toasty.success({
                  title: "xxxx",
                  msg: "Successfully created the volume mirror."
                });
              }, function (error) {
                console.log("An error occured while creating the mirror volume", error);
                toasty.error({
                  title: "xxxx",
                  msg: "Failed to create the mirror volume."
                });
              });
          }, function (error) {
            console.log("An error occured while creating the mirror connection", error);
            toasty.error({
              title: "xxxx",
              msg: "Failed to create the mirror connection."
            });
          });
      });
    }
  };
});
