<!------------------------>
<!-- NAME				-->
<!------------------------>
<table width="940" cellpadding="2" cellspacing="0" border="0">
    <tr>
        <td width="50%" class="has_bottom_border">
             <h2 id="fileName"></h2>
        </td>
        <td width="50%" class="right_align has_bottom_border">
        	<span class="action-button" data-dropdown="#action-dropdown-more">
                <span ><i class="icon-cog"></i> More</span>
                <i class="icon-caret-down"></i>
            </span>
        	<a id="fullEdit" class="action-button"><i class="icon-edit"></i> FullScreen</a>
        	<!--<a id="download" class="action-button"><i class="icon-cloud-download"></i> Download</a>-->
        	<div id="action-dropdown-more" class="action-dropdown anchor-right">
        	</div>
        </td>
    </tr>
</table>

<!------------------------>
<!-- INFO				-->
<!------------------------>
<table class="ticket_info" cellspacing="0" cellpadding="0" width="940" border="0">
    <tr>
        <td width="50" rowspan="4">
           <table border="0" cellspacing="" cellpadding="4" width="100%">
                <tr>
                    <td id="thumbNailCell" rowspan="4"></td>
                </tr>
            </table>
        </td>
        <td width="50%">
            <table border="0" cellspacing="" cellpadding="4" width="100%">
                <tr>
                    <th width="100">Owner:</th>
                    <td id="owner"></td>
                </tr>
                <tr>
                    <th>Created:</th>
                    <td id="created"></td>
                </tr>
                <tr>
                    <th>Modified By:</th>
                    <td id="modifiedBy"></td>
                </tr>
                <tr>
                    <th>Last Modified:</th>
                    <td id="lastModified"></td>
                </tr>
            </table>
        </td>
    </tr>
</table>
<div class="clear"></div>
<h2 id="quickViewHeader" style="padding:10px 0 5px 0; font-size:11pt;">QuickView</h2>
<iframe id="quickViewFrame" width="940" height="700"></iframe>
<br />
<br />
<input type="button" id="authorizeButton" class="btn_sm" style="float:right;margin: 10px 50px 20px auto;" value="Authorize" />
<div style="clear:both"></div>
