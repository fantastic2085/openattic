/**
 *
 * @source: http://bitbucket.org/openattic/openattic
 *
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * Copyright (C) 2011-2016, it-novum GmbH <community@openattic.org>
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

var app = angular.module("openattic");
app.controller("VolumeNfsSharesCtrl", function ($scope, $state, NfsSharesService, $uibModal) {
  $scope.nfsData = {};

  $scope.nfsFilter = {
    page: 0,
    entries: null,
    search: "",
    sortfield: null,
    sortorder: null,
    volume: null
  };

  $scope.nfsSelection = {};

  $scope.$watch("selection.item", function (selitem) {
    $scope.nfsFilter.volume = selitem;
  });

  $scope.$watch("nfsFilter", function (newVal) {
    if (newVal.entries === null) {
      return;
    }
    if (!$scope.nfsFilter.volume) {
      return;
    }
    NfsSharesService.filter({
      page: $scope.nfsFilter.page + 1,
      pageSize: $scope.nfsFilter.entries,
      search: $scope.nfsFilter.search,
      ordering: ($scope.nfsFilter.sortorder === "ASC" ? "" : "-") + $scope.nfsFilter.sortfield,
      volume: $scope.nfsFilter.volume.id
    })
        .$promise
        .then(function (res) {
          $scope.nfsData = res;
        });
  }, true);

  $scope.addNfsAction = function () {
    $state.go("volumes.detail.nfs-add", {"#": "more"});
  };

  $scope.deleteNfsAction = function () {
    var modalInstance = $uibModal.open({
      windowTemplateUrl: "templates/messagebox.html",
      templateUrl: "templates/volumes/delete-nfs-share.html",
      controller: "NfsShareDeleteCtrl",
      resolve: {
        share: function () {
          return $scope.nfsSelection.item;
        }
      }
    });

    modalInstance.result.then(function () {
      $scope.nfsFilter.refresh = new Date();
    });
  };
});
