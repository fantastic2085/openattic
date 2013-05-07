# -*- coding: utf-8 -*-
# kate: space-indent on; indent-width 4; replace-tabs on;

"""
 *  Copyright (C) 2011-2012, it-novum GmbH <community@open-attic.org>
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

import dbus

try:
    import readline
except ImportError:
    pass

from os.path import exists

from django.contrib.auth.models import User
from django.db.models import signals
from django.conf      import settings

from systemd.helpers import dbus_to_python

import lvm.models
from ifconfig.models  import Host
from lvm              import blockdevices
from lvm.models       import VolumeGroup, LogicalVolume
from lvm.filesystems  import get_by_name as get_fs_by_name

def create_vgs(app, created_models, verbosity, **kwargs):
    try:
        lvm = dbus.SystemBus().get_object(settings.DBUS_IFACE_SYSTEMD, "/lvm")
    except dbus.exceptions.DBusException:
        # apparently systemd is not yet running. oaconfig install will run syncdb a second time, warn and ignore.
        print "WARNING: Could not connect to systemd, skipping initialization of the LVM module."
        return

    vgs = dbus_to_python(lvm.vgs())
    lvs = dbus_to_python(lvm.lvs())
    mounts = blockdevices.get_mounts()
    if exists("/sbin/zfs"):
        zfs = dbus_to_python(lvm.zfs_getspace(""))
    else:
        zfs = []

    for vgname in vgs:
        try:
            vg = VolumeGroup.objects.get(name=vgname)
        except VolumeGroup.DoesNotExist:
            print "Adding Volume Group", vgname
            vg = VolumeGroup(host=Host.objects.get_current(), name=vgname)
            vg.save()
        else:
            print "Volume Group", vgname, "already exists in the database"
            if vg.host != Host.objects.get_current():
                vg.host = Host.objects.get_current()
                vg.save()

    if User.objects.count() == 0:
        print "Can't add LVs, no users have been configured yet"
        return

    try:
        admin = User.objects.get(username="openattic", is_superuser=True)
    except User.DoesNotExist:
        admin = User.objects.filter( is_superuser=True )[0]

    for lvname in lvs:
        vg = VolumeGroup.objects.get(name=lvs[lvname]["LVM2_VG_NAME"])
        try:
            lv = LogicalVolume.objects.get(vg=vg, name=lvname)
        except LogicalVolume.DoesNotExist:
            if "sys" in lvs[lvname]["LVM2_LV_TAGS"].split(','):
                print "Logical Volume %s is tagged as @sys, ignored." % lvname
                continue

            lv = LogicalVolume(name=lvname, megs=float(lvs[lvname]["LVM2_LV_SIZE"]), vg=vg, owner=admin, uuid=lvs[lvname]["LVM2_LV_UUID"])

            for mnt in mounts:
                if mnt[0] in ( "/dev/%s/%s" % ( vg.name, lvname ), "/dev/mapper/%s-%s" % ( vg.name, lvname ) ):
                    try:
                        get_fs_by_name( mnt[2] )
                    except AttributeError:
                        pass
                    else:
                        lv.filesystem = mnt[2]

            for zfsvol in zfs:
                if lvname == zfsvol[0]:
                    lv.filesystem = "zfs"

            if not lv.filesystem:
                fs = lv.detect_fs()
                if fs is not None:
                    lv.filesystem = fs.name

            if lv.filesystem:
                lv.formatted = True

            print lv.name, lv.megs, lv.vg.name, lv.owner.username, lv.filesystem
            lv.save(database_only=True)

        else:
            print "Logical Volume", lvname, "already exists in the database"
            if not lv.uuid:
                lv.uuid = lvs[lvname]["LVM2_LV_UUID"]
                lv.save()


signals.post_syncdb.connect(create_vgs, sender=lvm.models)
