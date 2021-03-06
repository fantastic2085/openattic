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

var helpers = require("../../common.js");
var SettingsForm = require("./SettingsForm");

describe("settings inputs validations", function () {

  var form = new SettingsForm();

  beforeAll(function () {
    helpers.login();
    helpers.setLocation("settings");
  });

  it("should disable object gateway fields", function () {
    browser.refresh();

    form.checkManagedByDeepSea(true);
    expect(form.rgwHost.isEnabled()).toBe(false);
    expect(form.rgwPort.isEnabled()).toBe(false);
    expect(form.rgwAccessKey.isEnabled()).toBe(false);
    expect(form.rgwSecretKey.isEnabled()).toBe(false);
    expect(form.rgwAdminUser.isEnabled()).toBe(false);
    expect(form.rgwAdminResourcePath.isEnabled()).toBe(false);
    expect(form.rgwUseSSL.isEnabled()).toBe(false);

    form.checkManagedByDeepSea(false);
    expect(form.rgwHost.isEnabled()).toBe(true);
    expect(form.rgwPort.isEnabled()).toBe(true);
    expect(form.rgwAccessKey.isEnabled()).toBe(true);
    expect(form.rgwSecretKey.isEnabled()).toBe(true);
    expect(form.rgwAdminUser.isEnabled()).toBe(true);
    expect(form.rgwAdminResourcePath.isEnabled()).toBe(true);
    expect(form.rgwUseSSL.isEnabled()).toBe(true);
  });

  it("should disable ceph config file", function () {
    expect(form.cephClusterConfigFile.isEnabled()).toBe(false);
  });

  it("should validate ceph keyring file path", function () {
    form.cephClusterKeyringFile.clear();
    expect(form.cephClusterKeyringFileRequired.isDisplayed()).toBe(true);

    form.cephClusterKeyringFile.sendKeys("/e2e-path");
    expect(form.cephClusterKeyringFileRequired.isDisplayed()).toBe(false);
  });

  it("should validate ceph keyring user", function () {
    form.cephClusterKeyringUser.clear();
    expect(form.cephClusterKeyringUserRequired.isDisplayed()).toBe(true);

    form.cephClusterKeyringUser.sendKeys("e2e-user");
    expect(form.cephClusterKeyringUserRequired.isDisplayed()).toBe(false);
  });

  it("should check salt api connection", function () {
    browser.refresh();

    helpers.waitForElementVisible(form.saltApiConnectionSuccess);
    expect(form.saltApiConnectionSuccess.isDisplayed()).toBe(true);
    expect(form.saltApiConnectionFail.isDisplayed()).toBe(false);

    form.saltApiHost.clear().sendKeys("e2e-host");
    helpers.waitForElementInvisible(form.saltApiConnectionSuccess);
    expect(form.saltApiConnectionSuccess.isDisplayed()).toBe(false);
    helpers.waitForElementVisible(form.saltApiConnectionFail);
    expect(form.saltApiConnectionFail.isDisplayed()).toBe(true);
  });

  it("should check object gateway connection", function () {
    browser.refresh();

    form.checkManagedByDeepSea(true);
    helpers.waitForElementVisible(form.rgwConnectionSuccess);
    expect(form.rgwConnectionSuccess.isDisplayed()).toBe(true);
    expect(form.rgwConnectionFail.isDisplayed()).toBe(false);

    form.checkManagedByDeepSea(false);
    helpers.waitForElementVisible(form.rgwConnectionSuccess);
    expect(form.rgwConnectionSuccess.isDisplayed()).toBe(true);
    expect(form.rgwConnectionFail.isDisplayed()).toBe(false);

    form.rgwHost.clear().sendKeys("e2e-host");
    helpers.waitForElementVisible(form.rgwConnectionFail);
    expect(form.rgwConnectionSuccess.isDisplayed()).toBe(false);
    expect(form.rgwConnectionFail.isDisplayed()).toBe(true);
  });

  it("should check grafana connection", function () {
    expect(form.grafanaConnectionSuccess.isDisplayed()).toBe(true);
    expect(form.grafanaConnectionFail.isDisplayed()).toBe(false);

    form.grafanaHost.clear().sendKeys("e2e-host");
    helpers.waitForElementVisible(form.grafanaConnectionFail);
    expect(form.grafanaConnectionSuccess.isDisplayed()).toBe(false);
    expect(form.grafanaConnectionFail.isDisplayed()).toBe(true);
  });

  it("should check ceph connection", function () {
    browser.refresh();

    helpers.waitForElementVisible(form.cephClusterConnectionSuccess);
    expect(form.cephClusterConnectionSuccess.isDisplayed()).toBe(true);
    expect(form.cephClusterConnectionFail.isDisplayed()).toBe(false);

    form.cephClusterKeyringUser.clear().sendKeys("e2e-keyring-user");
    helpers.waitForElementVisible(form.cephClusterConnectionFail);
    expect(form.cephClusterConnectionSuccess.isDisplayed()).toBe(false);
    expect(form.cephClusterConnectionFail.isDisplayed()).toBe(true);
  });

  afterAll(function () {
    browser.refresh();
    console.log("settings -> settings_valid.e2e.js");
  });

});
