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

import os.path

from datetime import datetime
from StringIO import StringIO
from systemd.procutils import invoke
from systemd.plugins   import logged, BasePlugin, method
from ifconfig.models import NetDevice

def cidr2mask(len):
    """Convert a bit length to a dotted netmask (aka. CIDR to netmask)"""
    mask = ''
    if not isinstance(len, int) or len < 0 or len > 32:
        print "Illegal subnet length: %s (which is a %s)" % (str(len), type(len).__name__)
        return None

    for t in range(4):
        if len > 7:
            mask += '255.'
        else:
            dec = 255 - (2**(8 - len) - 1)
            mask += str(dec) + '.'
        len -= 8
        if len < 0:
            len = 0

    return mask[:-1]


@logged
class SystemD(BasePlugin):
    dbus_path = "/ifconfig"

    @method(in_signature="", out_signature="i")
    def ifdown(self):
        return invoke(["/sbin/ifdown", "-a", "--exclude=lo"])

    @method(in_signature="", out_signature="i")
    def ifup(self):
        return invoke(["/sbin/ifup", "-a"])

    @method(in_signature="", out_signature="")
    def write_interfaces(self):
        out = StringIO()
        out.writelines([
            "# THIS FILE HAS BEEN GENERATED BY openATTIC\n",
            "# Do not edit directly, configure via the openATTIC GUI instead.\n",
            "# Last updated " + str(datetime.now()) + "\n",
            "\n"
            ])

        try:
            depends = {}
            autoifs = []

            for interface in NetDevice.objects.all():
                depends[interface.devname] = []

                if interface.dhcp:
                    out.write("iface %s inet dhcp\n" % interface.devname)

                elif interface.ipaddress_set.filter(configure=True).count() > 0:
                    addrs = list(interface.ipaddress_set.filter(configure=True))

                    if addrs[0].is_loopback:
                        out.write("iface %s inet loopback\n" % interface.devname)
                    else:
                        addr = addrs[0].address.split("/")
                        out.write("iface %s inet static\n" % interface.devname)
                        out.write("\taddress %s\n" % addr[0])
                        if len(addr) > 1:
                            try:
                                out.write("\tnetmask %s\n" % cidr2mask(int(addr[1])))
                            except ValueError:
                                out.write("\tnetmask %s\n" % addr[1])
                        if addrs[0].gateway:
                            out.write("\tgateway %s\n" % addrs[0].gateway)
                        if addrs[0].domain:
                            out.write("\tdns-search %s\n" % addrs[0].domain)
                        if addrs[0].nameservers:
                            out.write("\tdns-nameservers %s\n" % addrs[0].nameservers)

                    for address in addrs[1:]:
                        out.write("\tpost-up ip addr add %s dev $IFACE\n" % address.address)

                else:
                    out.write("iface %s inet manual\n" % interface.devname)

                if interface.vlanrawdev:
                    base = interface.vlanrawdev
                    depends[interface.devname].append(base)
                    out.write("\tvlan-raw-device %s\n" % base.devname)

                if interface.brports.all().count():
                    depends[interface.devname].extend(list(interface.brports.all()))
                    out.write("\tbridge-ports %s\n" % " ".join([p.devname for p in interface.brports.all()]))

                if interface.slaves.count():
                    depends[interface.devname].extend(list(interface.slaves.all()))
                    out.write("\tslaves %s\n"  % ' '.join( [p.devname for p in interface.slaves.all()] ))
                    out.write("\tbond_mode %s\n"      % interface.bond_mode)
                    out.write("\tbond_miimon %s\n"    % interface.bond_miimon)
                    out.write("\tbond_downdelay %s\n" % interface.bond_downdelay)
                    out.write("\tbond_updelay %s\n"   % interface.bond_updelay)

                if interface.jumbo:
                    out.write("\tmtu 9000\n")

                if interface.auto:
                    autoifs.append(interface)

                out.write("\n")

            out.write( "# Interface Dependency Tree:\n" )
            out.write( "# " + str(depends) + "\n" )
            out.write( "\n" )

            while autoifs:
                for interface in autoifs:
                    if not depends[interface.devname]:
                        out.write("auto %s\n" % interface.devname)
                        autoifs.remove(interface)
                        for depiface in depends:
                            if interface in depends[depiface]:
                                depends[depiface].remove(interface)

            out.seek(0)
            fd = open( "/etc/network/interfaces", "wb" )
            fd.write( out.read() )

        finally:
            fd.close()

    @method(in_signature="s", out_signature="i")
    def get_speed(self, devname):
        dev = NetDevice.objects.get(devname=unicode(devname))
        try:
            spd = dev.speed
        except ValueError:
            return -1
        else:
            if spd is not None:
                return spd
            return -1

    @method(in_signature="", out_signature="a{sas}")
    def get_vconfig(self):
        if os.path.exists("/proc/net/vlan/config"):
            with open("/proc/net/vlan/config") as vlanconf:
                vlans = [ [ field.strip() for field in line.split('|') ] for line in vlanconf ]
                vlans = dict( [ ( vln[0], vln[1:] ) for vln in vlans[2:] ] )
        else:
            vlans = {}
        return vlans

