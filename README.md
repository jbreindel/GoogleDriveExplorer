GoogleDriveExplorer
===================

This is a simple project intended to allow you to put a drive explorer on your website. It also builds a comments section that allows you to see comments on the file.

You need to supply a <code>header.inc.php</code> and <code>footer.inc.php</code> in order for the page to look good. Also remember to load the drive sdk and call the callback handler with this line in your <head> section:

<script src="https://apis.google.com/js/client.js?onload=handleClientLoad"></script>
