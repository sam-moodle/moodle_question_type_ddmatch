/**
 * Javascript for drag-and-drop matching question.
 *
 * @copyright &copy; 2007 Adriane Boyd
 * @author adrianeboyd@gmail.com
 * @license http://www.gnu.org/copyleft/gpl.html GNU Public License
 * @package aab_ddmatch
 */


M.qtype_ddmatch = M.qtype_ddmatch || {};

M.qtype_ddmatch.MoodleDDMatchItem = null;

/**
 * Initalizes the M.qtype_ddmatch.MoodleDDMatchItem
 */
M.qtype_ddmatch.init = function() {
    
    if (M.qtype_ddmatch.MoodleDDMatchItem != null) {
        return;
    }
    
    var Dom = YAHOO.util.Dom;
    var DDM = YAHOO.util.DragDropMgr;

    // Override DDM moveToEl function to prevent it from repositioning items
    // since MoodleDDMatchItem repositions them in the document.
    DDM.moveToEl = function(srcEl, targetEl) {
        return;
    }

    M.qtype_ddmatch.MoodleDDMatchItem = function(id, sGroup, config, dragstring) {

        M.qtype_ddmatch.MoodleDDMatchItem.superclass.constructor.call(this, id, sGroup, config);

        var el = this.getDragEl();
        Dom.setStyle(el, "opacity", 0.67); // The proxy is slightly transparent

        this.sGroup = sGroup;
        this.isTarget = false;
        this.dragstring = dragstring;
    };

    YAHOO.extend(M.qtype_ddmatch.MoodleDDMatchItem, YAHOO.util.DDProxy, {

        startDrag: function(x, y) {
            // make the proxy look like the source element
            var dragEl = this.getDragEl();
            var clickEl = this.getEl();

            dragEl.innerHTML = clickEl.innerHTML;

            Dom.addClass(dragEl, "matchdrag");
        },

        endDrag: function(e) {
            var proxy = this.getDragEl();

            var proxyid = proxy.id;
            var thisid = this.id;

            Dom.setStyle(proxyid, "visibility", "hidden");
            Dom.setStyle(thisid, "visibility", "");
        },

        onDragDrop: function(e, id) {
            // get the drag and drop object that was targeted
            var oDD;

            if ("string" == typeof id) {
                oDD = DDM.getDDById(id);
            } else {
                oDD = DDM.getBestMatch(id);
            }

            var el = this.getEl();

            // move the item into the target, deleting anything already in the slot
            this.moveItem(el, oDD.getEl());

            Dom.replaceClass(oDD.getEl(), "matchover", "matchdefault");
        },

        onDragEnter: function(e, id) {
            // get the drag and drop object that was targeted
            var oDD;

            if ("string" == typeof id) {
                oDD = DDM.getDDById(id);
            } else {
                oDD = DDM.getBestMatch(id);
            }

            Dom.replaceClass(oDD.getEl(), "matchdefault", "matchover");
        },

        onDragOut: function(e, id) {
            // get the drag and drop object that was targeted
            var oDD;

            if ("string" == typeof id) {
                oDD = DDM.getDDById(id);
            } else {
                oDD = DDM.getBestMatch(id);
            }

            Dom.replaceClass(oDD.getEl(), "matchover", "matchdefault");
        },

        onInvalidDrop: function(e, id) {
            var el = this.getEl();
            // if the item was dragged off a target, delete it
            if (el.parentNode.id.match("target")) {
                // add dragstring back to empty box
                var idparts = el.id.split("_");
                var li = document.createElement("li");
                li.setAttribute("id", idparts[0] + "_0");
                li.appendChild(document.createTextNode(this.dragstring));
                el.parentNode.appendChild(li);

                var inputhidden = Dom.get(el.parentNode.getAttribute("name"));
                inputhidden.setAttribute("value", 0);

                // delete the item
                el.parentNode.removeChild(el);
            }
        },

        moveItem: function(eldragged, eltargetul) {
            var eldraggedparent = eldragged.parentNode;

            // remove the item currently in the target
            for (var i = 0; i < eltargetul.childNodes.length; i++) {
                eltargetul.removeChild(eltargetul.childNodes[0]);
            }

            // if the item was moved from the origin, make a copy and move
            if (eldraggedparent.id.match("origin")) {
                var el1copy = eldragged.cloneNode(true);
                el1copy.setAttribute("id", "");
                var el1id = Dom.generateId(el1copy, "_");
                el1copy.setAttribute("id", eldragged.id + el1id);
                eltargetul.appendChild(el1copy);
                new M.qtype_ddmatch.MoodleDDMatchItem(el1copy.id, this.sGroup, '', this.dragstring);            
            }
            // else move item
            else {
                // add dragstring back to empty box
                var idparts = eldragged.id.split("_");
                var li = document.createElement("li");
                li.setAttribute("id", idparts[0] + "_0");
                li.appendChild(document.createTextNode(this.dragstring));
                eldraggedparent.appendChild(li);

                // remove from origin
                eldraggedparent.removeChild(eldragged);

                // add to target
                eltargetul.appendChild(eldragged);

                var inputhidden = Dom.get(eldraggedparent.getAttribute("name"));
                inputhidden.setAttribute("value", 0);
            }

            var inputhidden = Dom.get(eltargetul.getAttribute("name"));
            var idparts = eldragged.id.split("_");
            inputhidden.setAttribute("value", idparts[1]);
        }

    });    
}

// Replace the ablock menus with drag&drop enabled ablock and initialize the draggables
M.qtype_ddmatch.init_draggable = function (Y, vars) {
    
    //Initialize M.qtype_ddmatch.MoodleDDMatchItem only once per page
    if (M.qtype_ddmatch.MoodleDDMatchItem == null) {
        M.qtype_ddmatch.init();
    }
    
    var id = vars.id;
    var stems = vars.stems;
    var choices = vars.choices;
    var selectedids = vars.selectedids;
    var readonly = vars.readonly;
    var dragstring = vars.dragstring;

    var Dom = YAHOO.util.Dom;
    var ablock = Dom.get("ablock_" + id);
    ablock.innerHTML = vars.ablock;
    var innerablock = ablock.firstChild;
    ablock.parentNode.replaceChild(innerablock, ablock);

    if (!readonly) {
        for (var i in stems) {
            new YAHOO.util.DDTarget("ultarget" + id + "_" + stems[i], id);
        }

        for (var i in choices) {
            new M.qtype_ddmatch.MoodleDDMatchItem("drag" + id + "_" + i, id, "", dragstring);
        }
        
        for (var i in selectedids) {
            new M.qtype_ddmatch.MoodleDDMatchItem(selectedids[i], id, "", dragstring);
        }
    }
}
