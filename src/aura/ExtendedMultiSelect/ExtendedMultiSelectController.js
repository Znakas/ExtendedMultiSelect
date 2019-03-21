({
    init : function(component, event, helper) {
        helper.setPlaceHolder(component);// to refresh placeholder on init for
    },

    //populates options, when callback from parent component fires on init
    onchange : function(component, event, helper) {
        helper.extractSelectedOptions(component);
        helper.setPlaceHolder(component);
    },

    onMenuExpand: function(component, event, helper) {
        helper.backupSelectedOptions(component);/*backup selected options, to have ability to check, if they`re different*/
        helper.closeDropdownWhileScrolling(component);
        helper.applyOverAll(component, event);/*css fix: toggle styling over all*/

        if(helper.isLazyLoadingEnabled(component)){
            helper.clearOffset(component);
            component.set('v.privateOptions', helper.getOptionLoading(component));
            helper.processServerSearch(component);

        } else{
            helper.processClientSearch(component);
        }
    },

    onMenuCollapse : function(component, event, helper) {
        helper.processPicklistChanges(component);/*fire event, if selected options are changed*/
        helper.clearInput(component);/*reset input*/
        helper.removeOverAll(component, event);/*css fix: toggle styling*/

        if(helper.isShowSelectedEnabled(component)){
            helper.showSelectedButtonSetPressed(component, false);/*set isShowOnlySelected Button unpressed*/
        }
    },

    onSelectItemClick: function(component, event, helper) {
        event.preventDefault();
        event.stopPropagation();

        //elegant way to get index
        var index = event.getSource().get('v.body')[0].getElement().dataset.index;
        var itemClicked = component.get("v.privateOptions")[index];

        //prevent from processing click on 'not found item'
        if (itemClicked && itemClicked.value != null) {

            //handle click
            if (helper.isLazyLoadingEnabled(component)) {
                helper.handleOnSelectClickServer( component, itemClicked );/*perform click*/

            } else {//handle client click
                helper.handleOnSelectClickClient(component, itemClicked);
            }
        }
        return false;
    },

    onInputFocus : function(component, event, helper) {
        //toggle showSelected to false, if it is enabled
        if(helper.isShowSelectedEnabled(component) && component.get('v.isShowSelectedPressed')){
            helper.clearOffset(component);
            helper.processServerSearch(component, '');
            helper.showSelectedButtonSetPressed(component, false);
        }
    },

    //handle change of input
    onInputChange : function(component, event, helper) {
        //prevent from search when press dummy buttons(arrows, tabs, etc)
        var keyCode = event.getParam('keyCode');

        if(helper.isPressedInputKeyIsValid(keyCode)){
            var inputValue = component.get('v.inputValue').toLowerCase();

            if( helper.isLazyLoadingEnabled(component)){
                //server
                helper.showSelectedButtonSetPressed(component, false);
                component.set('v.inputIcon', 'spinner');
                // is user types text in during server seach, we should process delay on type
                var timer = component.get('v.timer');
                var delay = component.get('v.delay');
                clearTimeout(timer);
                timer = setTimeout(function(){
                    // process empty callback, to make delay on type
                    var action = component.get("c.searchRecord");
                    action.setCallback(this, function(response) {
                        //if input sets to initial expand
                        helper.clearOffset(component);/*reset offset*/
                        helper.processServerSearch(component, inputValue);
                        clearTimeout(timer);
                        component.set('v.timer', null);
                    });

                    $A.getCallback(function() {
                        $A.enqueueAction(action);
                    })();

                }, delay);
                component.set('v.timer', timer);
                component.set('v.privateOptions', helper.getOptionLoading(component));
            } else{
                //if input sets to initial expand
                helper.processClientSearch(component, inputValue);
            }
        }
    },

    onInputIconClick : function(component, event, helper) {
        //if clear was pressed
        if(component.get('v.inputIcon') === 'clear'){
            component.set('v.inputValue', '');

            if(helper.isLazyLoadingEnabled(component)){
                helper.clearOffset(component);
                helper.processServerSearch(component);

            } else {
                helper.processClientSearch(component);
            }
        }
    },

    onButtonShowSelectedClick : function(component, event, helper) {
        helper.toggleShowOnlySelected(component, event);
    },

    getSelectedOptions : function(component, event, helper) {
        return helper.getSelectedValues(component);
    },

    onScroll : function(component, event, helper){
        if(helper.isLazyLoadingEnabled(component)){
            helper.processAdditionalValues(component);
        }
    },

    onMouseWeel : function(component, event, helper){
        if(helper.isLazyLoadingEnabled(component)) {
            helper.processAdditionalValues(component);
        }
    },
    onKeyDown : function(component, event, helper) {
        event.stopPropagation();//prevent from setFocus() undefined
    }
})