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

var helpers = require("../../common.js");
var RbdCommons = require("./cephRbdCommon.js");

describe("ceph rbd creation and deletion", function () {
  var rbdProperties = new RbdCommons();
  var namePrefix = "e2e_rbd";

  var objSizeTests = [
    [4, "KiB"],
    [4, "MiB"],
    [32, "MiB"]
  ];

  /**
   * Will run a full rbd creation test.
   *
   * @param {object} rbdConfig
   * @param {string} rbdConfig.poolName
   * @param {string} rbdConfig.rbdName
   * @param {string} rbdConfig.objSize
   * @param {number[]} rbdConfig.features
   */
  var fullRbdCreation = (rbdConfig) => {
    var desc = [
      'should create "' + rbdConfig.rbdName + '" rbd',
      rbdConfig.features ? 'with the following feature case: "[' + rbdConfig.features + ']" options' : "",
      rbdConfig.objSize ? 'with a object size of "' + rbdConfig.objSize + '"' : "",
      rbdConfig.size ? 'with a size of "' + rbdConfig.size + '"' : "",
      'on pool "' + rbdConfig.poolName + '"'
    ].join(" ");
    it(desc, () => {
      rbdProperties.selectPool(rbdConfig.poolName);
      rbdProperties.createRbd(rbdConfig.rbdName, rbdConfig.size, rbdConfig.objSize, rbdConfig.features);
    });
  };

  /**
   * Will run a full rbd deletion test.
   *
   * @param {object} rbdConfig
   * @param {string} rbdConfig.poolName
   * @param {string} rbdConfig.rbdName
   */
  var fullRbdDeletion = function (rbdConfig) {
    var desc = [
      'should delete "' + rbdConfig.rbdName + '" rbd',
      'on pool "' + rbdConfig.poolName + '"'
    ].join(" ");
    it(desc, function () {
      rbdProperties.deleteRbd(rbdConfig.rbdName);
    });
  };

  beforeAll(function () {
    helpers.login();
    rbdProperties.cephRBDs.click();
    helpers.deleteAllIfExists(namePrefix);
  });

  rbdProperties.useWriteablePools((poolName) => {
    // Use the case with the least, default and the most options.
    const testCases = rbdProperties.expandedFeatureCases;
    [testCases[0], rbdProperties.defaultFeatureCase, testCases[testCases.length - 1]].forEach((features, index) => {
      const objSizeArr = objSizeTests[index];
      const rbdConfig = {
        poolName: poolName,
        rbdName: [namePrefix, index, features.join("")].join("_"),
        objSize: objSizeArr[0] + ".00 " + objSizeArr[1],
        features: features
      };
      if (rbdProperties.convertFeatureArrayToObject(features).striping === 1) {
        rbdConfig.size = objSizeArr[0] * 5 + 1 + ".00 " + objSizeArr[1];
      } else {
        rbdConfig.size = rbdConfig.objSize;
      }
      fullRbdCreation(rbdConfig);
      fullRbdDeletion(rbdConfig);
    });

    /**
     * For this tests at least 2 pool are needed!
     * One replicated pool and another replicated pool or erasure coded pool with ec_overwrites enabled.
     */
    const rbdDataPoolName = namePrefix + "_with_data_pool";
    it("should create RBD with a meta and data pool with the first pools in both lists, named " + rbdDataPoolName,
      () => {
        rbdProperties.addButton.click();
        const firstPoolOption = rbdProperties.poolSelect.all(by.tagName("option")).get(1);
        firstPoolOption.click();
        rbdProperties.useDataPool.click();
        const firstDataPoolOption = rbdProperties.dataPoolSelect.all(by.tagName("option")).get(1);
        firstDataPoolOption.click();
        rbdProperties.createRbd(rbdDataPoolName);
        expect(element(by.cssContainingText("dt", "Meta-Pool")).isDisplayed()).toBe(true);
        expect(element(by.cssContainingText("dt", "Data-Pool")).isDisplayed()).toBe(true);
      });
    fullRbdDeletion({
      rbdName: rbdDataPoolName
    });
  });

  afterAll(function () {
    console.log("ceph_rbd_creation -> ceph_rbd_creation.e2e.js");
  });
});
