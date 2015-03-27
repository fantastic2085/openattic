/*
 Copyright (C) 2011-2014, it-novum GmbH <community@open-attic.org>

 openATTIC is free software; you can redistribute it and/or modify it
 under the terms of the GNU General Public License as published by
 the Free Software Foundation; version 2.

 This package is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
*/

Ext.namespace("Ext.oa");


Ext.define('volumes__zfs_Zfs_model', {
  extend: 'Ext.data.TreeModel',
  requires: [
    'Ext.data.NodeInterface'
  ],
  fields: [
    'id', '__unicode__', 'name', 'type', 'megs', 'status', 'usedmegs', 'percent',
    'fswarning', 'fscritical', 'host', 'path', 'poolname', 'ownername'
  ],
  createNode: function(record){
    var rootNode;
    record.set("leaf", true);
    rootNode = this.callParent(arguments);
    rootNode.set("icon",      MEDIA_URL + '/icons2/16x16/apps/database.png');
    rootNode.set("host",      toUnicode(record.raw.host));
    rootNode.set("poolname",  toUnicode(record.raw.pool));
    rootNode.set("ownername", toUnicode(record.raw.owner));
    rootNode.set("type",      toUnicode(record.raw.volume_type));
    if( record.data.usedmegs !== null )
      rootNode.set("percent",    (record.data.usedmegs / record.data.megs * 100).toFixed(2));
    else
      rootNode.set("percent",    null);
    if( rootNode.get("name") === '' )
      rootNode.set("__unicode__", toUnicode(record.raw.pool) + ' ' + gettext('[zpool root volume]'));
    rootNode.commit();
    return rootNode;
  }
});


// kate: space-indent on; indent-width 2; replace-tabs on;