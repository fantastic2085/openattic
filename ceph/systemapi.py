# -*- coding: utf-8 -*-
# kate: space-indent on; indent-width 4; replace-tabs on;

"""
 *  Copyright (C) 2011-2014, it-novum GmbH <community@open-attic.org>
 *
 *  openATTIC is free software; you can redistribute it and/or modify it
 *  under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; version 2.
 *
 *  This package is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
"""

import os
import os.path
import json

from systemd       import invoke, logged, LockingPlugin, method, deferredmethod

@logged
class SystemD(LockingPlugin):
    dbus_path = "/ceph"

    @method(in_signature="i", out_signature="s")
    def osd_crush_dump(self, cluster):
        ret, out, err = invoke(["ceph", "--format", "json", "--cluster", cluster, "osd", "crush", "dump"], log=False, return_out_err=True)
        return out

    @method(in_signature="i", out_signature="s")
    def osd_dump(self, cluster):
        ret, out, err = invoke(["ceph", "--format", "json", "--cluster", cluster, "osd", "dump"], log=False, return_out_err=True)
        return out

    @method(in_signature="i", out_signature="s")
    def mds_stat(self, cluster):
        ret, out, err = invoke(["ceph", "--format", "json", "--cluster", cluster, "mds", "stat"], log=False, return_out_err=True)
        return out

    @method(in_signature="i", out_signature="s")
    def mon_status(self, cluster):
        ret, out, err = invoke(["ceph", "--format", "json", "--cluster", cluster, "mon_status"], log=False, return_out_err=True)
        return out

    @method(in_signature="i", out_signature="s")
    def auth_list(self, cluster):
        ret, out, err = invoke(["ceph", "--format", "json", "--cluster", cluster, "auth", "list"], log=False, return_out_err=True)
        return out

    @method(in_signature="i", out_signature="s")
    def status(self, cluster):
        ret, out, err = invoke(["ceph", "--format", "json", "--cluster", cluster, "status"], log=False, return_out_err=True)
        return out

    @method(in_signature="i", out_signature="s")
    def df(self, cluster):
        ret, out, err = invoke(["ceph", "--format", "json", "--cluster", cluster, "df"], log=False, return_out_err=True)
        return out

    @deferredmethod(in_signature="sssi")
    def rbd_create(self, cluster, pool, image, megs, sender):
        invoke(["rbd", "-c", "/etc/ceph/%s.conf" % cluster, "-p", pool, "create", image, "--size", str(megs)])

    @deferredmethod(in_signature="sss")
    def rbd_rm(self, cluster, pool, image, sender):
        invoke(["rbd", "-c", "/etc/ceph/%s.conf" % cluster, "-p", pool, "rm", image])

    @deferredmethod(in_signature="sss")
    def format_volume_as_osd(self, cluster, fspath, journaldev, sender):
        # run "ceph osd create" to get an ID
        ret, out, err = invoke(["ceph", "--format", "json", "--cluster", cluster, "osd", "create"], return_out_err=True)
        osdid = json.loads(out)["osdid"]
        # symlink the file system to /var/lib/ceph/osd/<cluster>-<id>
        osdpath = "/var/lib/ceph/osd/%s-%d" % (cluster, osdid)
        os.symlink(fspath, osdpath)
        # symlink the journal device to .../journal if we have one, otherwise use a file
        if journaldev:
            os.symlink(journaldev, os.path.join(osdpath, "journal"))
        else:
            open(os.path.join(osdpath, "journal"), "w").close()
        try:
            # create the OSD's file system
            invoke(["ceph-osd", "-c", "/etc/ceph/%s.conf" % cluster, "-i", str(osdid), "--mkfs", "--mkkey"])
            # create .../sysvinit so the OSD starts on boot
            open(os.path.join(osdpath, "sysvinit"), "w").close()
            # create auth entity with the keyring generated by ceph-osd
            invoke(["ceph", "--format", "json", "--cluster", cluster, "auth", "add", "osd.%d" % osdid,
                    "osd", "allow *", "mon", "allow rwx",
                    "-i", os.path.join(osdpath, "keyring")])
            # ogo
            invoke(["service", "ceph", "start", "osd.%d" % osdid])
        except SystemError:
            # some error occurred. make sure we can re-run this command safely and don't
            # leave any stale OSD IDs in ceph by `rm -rf`ing the OSD directory and deleting
            # the OSD from ceph.
            # see https://docs.python.org/2/library/os.html#os.walk
            for root, dirs, files in os.walk(fspath, topdown=False):
                for name in files:
                    os.remove(os.path.join(root, name))
                for name in dirs:
                    os.rmdir(os.path.join(root, name))
            os.unlink(osdpath)
            invoke(["ceph", "--format", "json", "--cluster", cluster, "osd", "rm", str(osdid)])
