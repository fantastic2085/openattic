��    ,      |      �      �     �     �     �  (        -  B   <       '   �     �     �     �     �  %      ^   &  S   �  H   �  I   "     l  J   �     �  P   �     7     G  _   O     �  "   �     �     �     �     
  S        g     u     �     �  	   �  ,   �     �     �     �     �            �       �	     �	     �	  "   �	     
     
      �
  *   �
     �
     �
            (   *  }   S  z   �  l   L  X   �       H   *     s  {   �     �       f        �  -   �     �     �     �  	   �  X   �     W     g     w     }  
   �  )   �  	   �  	   �     �     �             A: Asynchronous Add Connection Address B: Memory Synchronous (Semi-Synchronous) C: Synchronous Call the fence-peer handler, which outdates or STONITHes the peer. Call the fence-peer handler. Call the local-io-error handler script. Connection settings Connection state DRBD Delete Connection Detach and continue in diskless mode. Discard secondary if it would have also been discarded without any primaries, else disconnect. Discard the node who has not written any changes. If both have changes, disconnect. Discard the node with the least changes and sync from the one with most. Discard the older Primary and sync from the host who last became primary. Discard the secondarys data. Discard the younger Primary and sync from the host who was primary before. Disk state (here) Do what we would do if there were no primaries, even if we risk corrupting data. Edit Connection Fencing If the current secondary has the right data, call the pri-lost-after-sb handler on the primary. No Primaries No fencing actions are undertaken. On I/O Error One Primary Parent connection Protocol Report the I/O error to the file system on the primary, ignore it on the secondary. Resource Name Resource name Role Secret Select... Simply disconnect without resynchronization. Syncer Rate Timeout Timeout when degraded Timeout when outdated Two Primaries Volume Project-Id-Version: PACKAGE VERSION
Report-Msgid-Bugs-To: 
POT-Creation-Date: 2012-07-24 09:36+0200
PO-Revision-Date: 2012-07-24 09:38
Last-Translator: Michael Ziegler <michael.ziegler@it-novum.com>
Language-Team: LANGUAGE <LL@li.org>
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: 
Plural-Forms: nplurals=2; plural=(n != 1)
X-Translated-Using: django-rosetta 0.6.6
 A: Asynchron Verbindung hinzufügen Adresse B: Speichersynchron (Halbsynchron) C: Synchron Friere E/A ein bis der Fence-Peer-Handler die Gegenstelle entweder auf veraltet gesetzt, oder per STONITH offline genommen hat. Rufe den Fence-Peer-Handler auf. Rufe das local-io-error Handler-Script auf Verbindungseinstellungen Verbindungsstatus DRBD Verbindung löschen Trennen und im diskless-Modus fortfahren Verwerfe die Daten des Secondary wenn dies auch passiert wäre wenn kein Node Primary wäre, ansonsten trenne die Verbindung. Lösche den Node, der keine Änderungen geschrieben hat. Wenn beide Nodes Veränderungen aufzeigen, trenne die Verbindung. Verwerfe den Node mit den wenigsten Änderungen und synchronisiere von dem, der die meisten Änderungen hat. Verwerfe den alten Primary und synchronisieren von dem Host, der als letztes Primary war Verwerfe den Secondary. Verwerfe den jüngeren Primary und synchronisiere vom vorherigen Primary Disk-Status  Führe dieselbe Aktion aus wie wenn kein Node Primary wäre, auch wenn wir dabei riskieren, sämtliche Daten zu zerstören. Verbindung bearbeiten Fencing Wenn der aktuelle Secondary die richtigen Daten hat, rufe den pri-lost-sb-Handler auf dem Primary auf. Keine Primaries Es wurden keine Fencing-Aktionen unternommen  Bei E/A-Fehler Ein Primary Übergeordnete Verbindung Protokoll Melde den E/A-Fehler dem Dateisystem des Primary, ignoriere den Fehler auf dem Secondary Ressourcen-Name Ressourcen-Name Rolle Passwort Auswahl... Verbindung trennen ohne Resynchronisation Sync-Rate Zeitlimit Zeitlimit wenn inkonsistent Zeitlimit wenn veraltet Zwei Primaries Volume 