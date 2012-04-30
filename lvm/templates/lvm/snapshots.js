/*
 Copyright (C) 2011-2012, it-novum GmbH <community@open-attic.org>

 openATTIC is free software; you can redistribute it and/or modify it
 under the terms of the GNU General Public License as published by
 the Free Software Foundation; version 2.

 This package is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
*/

Ext.namespace("Ext.oa");

Ext.oa.Lvm__Snapshot_Panel = Ext.extend(Ext.grid.GridPanel, {
  initComponent: function(){
    "use strict";
    var lvmSnapPanel = this;
    Ext.apply(this, Ext.apply(this.initialConfig, {
      id: "lvm__snapshot_panel_inst",
      title: gettext('Volume Snapshots'),
      buttons: [{
        text: "",
        icon: MEDIA_URL + "/icons2/16x16/actions/reload.png",
        tooltip: gettext('Reload'),
        handler: function(self){
          lvmSnapPanel.store.reload();
        }
      }, {
        text: gettext('Mount'),
        icon: MEDIA_URL + "/oxygen/16x16/emblems/emblem-mounted.png",
        handler: function(self){
          var sm = lvmSnapPanel.getSelectionModel();
          if( sm.hasSelection() ){
            var sel = sm.selections.items[0];
            if( !sel.data.filesystem ){
              Ext.Msg.alert('Mounted',
                interpolate(
                  gettext('Volume %s does not have a file system and therefore cannot be mounted.'),
                  [sel.data.name] ));
              return;
            }
            lvm__LogicalVolume.is_mounted( sel.data.id, function(provider, response){
              if( response.result ){
                Ext.Msg.alert('Mounted', interpolate( gettext('Volume %s is already mounted.'), [sel.data.name] ));
                return;
              }
              lvm__LogicalVolume.is_in_standby( sel.data.id, function(provider, response){
                if( response.result ){
                  Ext.Msg.alert('Mounted',
                    interpolate( gettext('Volume %s cannot be mounted at the current time.'), [sel.data.name] ));
                  return;
                }
                lvm__LogicalVolume.mount( sel.data.id, function(provider, response){
                  if( response.type === "exception" ){
                    Ext.Msg.alert('Mounted', interpolate(
                      gettext('Volume %s could not be mounted, please check the logs.'), [sel.data.name] ));
                  }
                  else{
                    Ext.Msg.alert('Mounted', interpolate(
                      gettext('Volume %s has been mounted.'), [sel.data.name] ));
                    lvmSnapPanel.store.reload();
                  }
                } );
              } );
            } );
          }
        }
      }, {
        text: gettext('Unmount'),
        icon: MEDIA_URL + "/oxygen/16x16/emblems/emblem-unmounted.png",
        handler: function(self){
          var sm = lvmSnapPanel.getSelectionModel();
          if( sm.hasSelection() ){
            var sel = sm.selections.items[0];
            lvm__LogicalVolume.is_mounted( sel.data.id, function(provider, response){
              if( !response.result ){
                Ext.Msg.alert('Unmount', interpolate( gettext('Volume %s is not mounted.'),
                                                          [sel.data.name] ));
              }
              else{
                Ext.Msg.confirm(
                  gettext('Unmount'),
                  interpolate(
                    gettext('Do you really want to umount %s?'),
                    [sel.data.name]),
                  function(btn){
                    if(btn === 'yes'){
                      lvm__LogicalVolume.unmount( sel.data.id, function(provider, response){
                        if( response.type === "exception" ){
                          Ext.Msg.alert('Unmount', interpolate(
                            gettext('Volume %s could not be unmounted, please check the logs.'),
                            [sel.data.name] ));
                        }
                        else{
                          Ext.Msg.alert('Unmount', interpolate(
                            gettext('Volume %s has been unmounted.'),
                            [sel.data.name] ));
                          lvmSnapPanel.store.reload();
                        }
                      });
                    }
                } );
              }
            } );
          }
        }
      }, {
        text: gettext('Shares'),
        icon: MEDIA_URL + "/oxygen/16x16/emblems/emblem-unmounted.png",
        handler: function(self){
          var sm = lvmSnapPanel.getSelectionModel();
          if( sm.hasSelection() ){
            var sel = sm.selections.items[0];
            var shareswin = new Ext.Window({
              title: gettext('Add Volume'),
              layout: "fit",
              height: 300,
              width: 500,
              items: {
                xtype: "grid",
                store: {
                  xtype: 'directstore',
                  autoLoad: true,
                  fields: ['id', 'app', 'obj'],
                  directFn: lvm__LogicalVolume.get_shares,
                  baseParams: {id: sel.data.id}
                },
                colModel: new Ext.grid.ColumnModel({
                  defaults: {
                    sortable: true
                  },
                  columns: [ {
                    header: gettext('App'),
                    width: 350,
                    dataIndex: "app"
                  }, {
                    header: gettext('Object'),
                    width: 100,
                    dataIndex: "obj"
                  } ]
                })
              }
            } );
            shareswin.show();
          }
        }
      }, {
        text: gettext('Add Snapshot'),
        icon: MEDIA_URL + "/icons2/16x16/actions/add.png",
        handler: function(){
          var addwin = new Ext.Window({
            title: gettext('Add Snapshot'),
            layout: "fit",
            height: 300,
            width: 500,
            items: [{
              xtype: "form",
              bodyStyle: 'padding:5px 5px;',
              defaults: {
                xtype: "textfield",
                anchor: '-20px'
              },
              items: [{
                  fieldLabel: gettext('Name'),
                  name: "name",
                  allowBlank: false,
                  ref: 'namefield'
                }, {
                  xtype:      'combo',
                  allowBlank: false,
                  fieldLabel: gettext('Original Volume'),
                  name:       'volume',
                  hiddenName: 'volume_id',
                  store: new Ext.data.DirectStore({
                    fields: ["id", "name", "megs", "vg"],
                    baseParams: {
                      kwds: {
                        "snapshot__isnull": true,
                        "__exclude__": {
                          "filesystem": "zfs"
                        },
                        "__fields__": ["name", "megs", "vg"]
                      }
                    },
                    paramOrder: ["kwds"],
                    directFn: lvm__LogicalVolume.filter
                  }),
                  typeAhead:     true,
                  triggerAction: 'all',
                  emptyText:     gettext('Select...'),
                  selectOnFocus: true,
                  displayField:  'name',
                  valueField:    'id',
                  ref:      'volfield',
                  listeners: {
                    select: function(self, record, index){
                      if( self.ownerCt.volume_id === null || typeof self.ownerCt.volume_id === "undefined" ||
                        self.ownerCt.volume_id !== record.data.vg
                       ){
                        self.ownerCt.volume_free_megs = null;
                        self.ownerCt.volume_id = null;
                        self.ownerCt.sizelabel.setText( gettext('Querying data...') );
                        self.ownerCt.sizefield.disable();
                        lvm__VolumeGroup.get_free_megs( record.data.vg, function( provider, response ){
                          self.ownerCt.volume_id = record.data.vg;
                          self.ownerCt.volume_free_megs = response.result;
                          self.ownerCt.sizelabel.setText( String.format( "Max. {0} MB", response.result ) );
                          if( record.data.megs <= self.ownerCt.volume_free_megs ){
                            self.ownerCt.sizefield.setValue( record.data.megs );
                            self.ownerCt.sizefield.enable();
                          }
                        } );
                      }
                      else{
                        if( record.data.megs <= self.ownerCt.volume_free_megs ){
                          self.ownerCt.sizefield.setValue( record.data.megs );
                          self.ownerCt.sizefield.enable();
                        }
                      }
                    }
                  }
                }, tipify({
                  fieldLabel: gettext('Size in MB'),
                  allowBlank: false,
                  name: "megs",
                  ref: 'sizefield'
                },gettext('Please consider, that the size of your snapshot depends on the kind and frequency of change.')), {
                  xtype: "label",
                  ref:   "sizelabel",
                  text:  gettext('Waiting for volume selection...'),
                  cls:   "form_hint_label"
              }],
              buttons: [{
                text: gettext('Create Snapshot'),
                icon: MEDIA_URL + "/oxygen/16x16/actions/dialog-ok-apply.png",
                handler: function(self){
                  if( !self.ownerCt.ownerCt.getForm().isValid() ){
                    return;
                  }
                  var free = self.ownerCt.ownerCt.volume_free_megs;
                  if( free === null || typeof free === "undefined" ){
                    Ext.Msg.alert(gettext('Error'),
                      gettext('Please wait for the query for available space to complete.'));
                    return;
                  }
                  if( free < self.ownerCt.ownerCt.sizefield.getValue() ){
                    Ext.Msg.alert(gettext('Error'),
                      interpolate(gettext('Your volume exceeds the available capacity of %s MB.'), [free]));
                    return;
                  }
                  lvm__LogicalVolume.filter({
                    "name":self.ownerCt.ownerCt.namefield.getValue()
                  }, function(provider, response){
                    if( response.result.length !== 0 ){
                       Ext.Msg.alert(gettext('Error'),
                         gettext('The name you entered already exists. Please enter another one.'));
                       return;
                    }
                    else{
                      lvm__LogicalVolume.create({
                        'snapshot': {
                          'app': 'lvm',
                          'obj': 'LogicalVolume',
                          'id': self.ownerCt.ownerCt.volfield.getValue()
                        },
                        'name':       self.ownerCt.ownerCt.namefield.getValue(),
                        'megs':       self.ownerCt.ownerCt.sizefield.getValue()
                      }, function(provider, response){
                        if( response.result ){
                          lvmSnapPanel.store.reload();
                          addwin.hide();
                        }
                      });
                    }
                  });
                }
              }, {
                text: gettext('Cancel'),
                icon: MEDIA_URL + "/icons2/16x16/actions/gtk-cancel.png",
                handler: function(self){
                  addwin.hide();
                }
              }]
            }]
          });
          addwin.show();
        }
      }, {
        text: gettext('Delete Snapshot'),
        icon: MEDIA_URL + "/icons2/16x16/actions/remove.png",
        handler: function(self){
          var sm = lvmSnapPanel.getSelectionModel();
          if( sm.hasSelection() ){
            var sel = sm.selections.items[0];
            Ext.Msg.confirm(
              gettext('Confirm delete'),
              interpolate(
                gettext('Really delete snapshot %s and all its shares?<br /><b>There is no undo and you will lose all data.</b>'),
                [sel.data.name] ),
              function(btn, text){
                if( btn === 'yes' ){
                  lvm__LogicalVolume.remove( sel.data.id, function(provider, response){
                    lvmSnapPanel.store.reload();
                  } );
                }
                else{
                  alert(gettext('Aborted.'));
                }
              }
            );
          }
        }
      }],
      store: (function(){
        // Anon function that is called immediately to set up the store's DefaultSort
        var store = new Ext.data.DirectStore({
          fields: ['name', 'megs', 'filesystem',  'snapshot', 'formatted', 'id', 'state',
            'fs', 'fswarning', 'fscritical',
            {
              name: 'origvolid',
              mapping: 'snapshot',
              convert: function( val, row ){
                if( val === null ){
                  return null;
                }
                return val.id;
              }
            }, {
              name: 'origvolname',
              mapping: 'snapshot',
              convert: function( val, row ){
                if( val === null ){
                  return null;
                }
                return val.name;
              }
            }, 'LVM2_SNAP_PERCENT' ],
          listeners: {
            load: function(self){
              var i;
              var mkUpdateHandler = function(idx){
                return function(provider, response){
                  self.data.items[idx].set("LVM2_SNAP_PERCENT", response.result.LVM2_SNAP_PERCENT);
                  self.commitChanges();
                };
              };
              for (i = 0; i < self.data.length; i++){
                lvm__LogicalVolume.lvm_info( self.data.items[i].id, mkUpdateHandler(i) );
              }
            }
          },
          baseParams: { 'snapshot__isnull': false },
          directFn: lvm__LogicalVolume.filter
        });
        store.setDefaultSort("name");
        return store;
      }()),
      viewConfig: { forceFit: true },
      colModel:  new Ext.grid.ColumnModel({
        defaults: {
          sortable: true
        },
        columns: [{
          header: gettext('LV'),
          dataIndex: "name"
        }, {
          header: gettext('Size'),
          dataIndex: "megs",
          align: 'right',
          renderer: function( val, x, store ){
            if( val >= 1000 ){
              return String.format("{0} GB", (val / 1000).toFixed(2));
            }
            return String.format("{0} MB", val);
          }
        }, {
          header: gettext('Usage (%)'),
          dataIndex: "LVM2_SNAP_PERCENT",
          align: "right",
          renderer: function( val, x, store ){
            if( !val || val === -1 ){
              return '♻';
            }
            var id = Ext.id();
            (function(){
              if( Ext.get(id) === null ){
                return;
              }
              new Ext.ProgressBar({
                renderTo: id,
                value: val/100.0,
                text:  String.format("{0}%", val),
                cls:   ( val > store.data.fscritical ? "lv_used_crit" :
                        (val > store.data.fswarning  ? "lv_used_warn" : "lv_used_ok"))
              });
            }).defer(25);
            return '<span id="' + id + '"></span>';
          }
        }, {
          header: gettext('Original Volume'),
          width: 200,
          dataIndex: "origvolname"
        }]
      })
    }));
    Ext.oa.Lvm__Snapshot_Panel.superclass.initComponent.apply(this, arguments);
  },
  onRender: function(){
    "use strict";
    Ext.oa.Lvm__Snapshot_Panel.superclass.onRender.apply(this, arguments);
    this.store.reload();
  }
});

Ext.reg("lvm__snapshot_panel", Ext.oa.Lvm__Snapshot_Panel);

Ext.oa.Lvm__Snapshot_Module = Ext.extend(Object, {
  panel: "lvm__snapshot_panel",
  prepareMenuTree: function(tree){
    "use strict";
    tree.appendToRootNodeById("menu_storage", {
      text: gettext('Volume Snapshots'),
      leaf: true,
      icon: MEDIA_URL + '/icons2/22x22/apps/snapshot.png',
      panel: "lvm__snapshot_panel_inst",
      href: '#'
    });
  }
});


window.MainViewModules.push( new Ext.oa.Lvm__Snapshot_Module() );

// kate: space-indent on; indent-width 2; replace-tabs on;
