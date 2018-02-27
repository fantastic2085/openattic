/**
 *
 * @source: http://bitbucket.org/openattic/openattic
 *
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * Copyright (c) 2017 SUSE LLC
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

const helpers = require("../../common.js");
const CephNfsManageService = require("./CephNfsManageService");

describe("ceph nfs", () => {

  let manageService = new CephNfsManageService();

  beforeAll(() => {
    helpers.login();
    helpers.setLocation("ceph/nfs");
    manageService.startAllIfStopped();
  });

  it("should stop the NFS service", () => {
    manageService.manageServiceButton.click();
    manageService.stopServiceButton.get(0).click();
    manageService.waitForState("Stopped", 0);
    expect(manageService.state.get(0).getText()).toMatch(/.*Stopped.*/);
    manageService.closeButton.click();
  });

  it("should start the NFS service", () => {
    manageService.manageServiceButton.click();
    manageService.startServiceButton.get(0).click();
    manageService.waitForState("Running", 0);
    expect(manageService.state.get(0).getText()).toMatch(/.*Running.*/);
    manageService.closeButton.click();
  });

  afterAll(() => {
    console.log("ceph_nfs -> ceph_nfs_manage_service.e2e.js");
  });

});
