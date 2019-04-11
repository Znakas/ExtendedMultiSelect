({
    //***Server methods***

    handleOnSelectClickServer : function (component, itemClicked) {
        if (itemClicked && itemClicked.value != null) {
            //click on usual value
            itemClicked.selected = !itemClicked.selected;
            var privateOptions = component.get('v.privateOptions');
            var selectedOptions = this.specifySelection(component, itemClicked);

            // on isShowSelectedPressed click
            if(component.get('v.isShowSelectedPressed')){
                component.set("v.selectedOptions", selectedOptions);
                component.set("v.isShowSelectedPressed", false);
                privateOptions = this.toggleShowOnlySelected(component, event);
            }

            component.set("v.privateOptions", privateOptions);
            this.setPlaceHolder(component);
        }
    },

    // process search on server side, if LazyLoading == true. Uses apex controller
    processServerSearch : function(component, inputValue){
        if(!inputValue){
            inputValue = '';
        }
        component.set('v.inputIcon', 'spinner');

        var chunk = component.get('v.chunkSize');
        var offsetRecordsNum = component.get('v.offsetRecordsNum');
        var limitNum = chunk;
        var handlerClass = component.get('v.handlerClass');

        if(!handlerClass){
            console.log('define handlerClass ');
        }

        var searchParams = JSON.stringify({
            'handlerClassName' : handlerClass,
            'searchValue' : inputValue,
            'listOffset' : offsetRecordsNum + '',
            'listLimit' : limitNum +''
        });

        var action = component.get("c.searchRecord");
        action.setParams({
            'searchParams' : searchParams
        });

        // Add callback behavior for when response is received
        action.setCallback(this, function(response) {
            var state = response.getState();

            if (state === "SUCCESS") {
                var newOptions = response.getReturnValue();
                // if it is the end of scrolling
                /*if (newOptions && newOptions.length === 0 && offsetRecordsNum > 0) {
                    console.log("end of scrolling! Do nothing, but you can put your own logic here");
                }*/

                // If offsetRecordsNum > 0, than, this if lazy loading
                if (offsetRecordsNum > 0) {
                    var privateOptions = component.get("v.privateOptions");
                    newOptions = privateOptions.concat(newOptions);
                }
                newOptions = this.applySelectedOptions(component, newOptions);
                component.set("v.privateOptions", newOptions);

                // If records were not found
                newOptions = this.placeNotFoundOption(component, newOptions);

                // update offset, to get next values by lazy loading next time
                component.set("v.offsetRecordsNum", offsetRecordsNum + chunk);

                //revert inputIcon value to search
                this.setProperInputIcon(component);

            } else {
                console.log("processServerSearch Failed with state: " + state);
            }
        });
        // Send action off to be executed
        $A.getCallback(function() {
            $A.enqueueAction(action);
        })();
    },

    /*only for server search, mark items as selected, after succesful response*/
    applySelectedOptions : function(component, newOptions){

        if (newOptions.length > 0){
            var selectedOptions = component.get('v.selectedOptions');
            var selectedValues = selectedOptions.map(function(selectedOption){
                return selectedOption.value;
            });

            if(selectedValues.length > 0){
                newOptions.forEach(function(newOption) {

                    if(selectedValues.includes(newOption.value)){
                        newOption.selected = true;
                    }
                });
            }
        }
        return newOptions;
    },

    // process LazyLoad for new values on scroll or wheel
    processAdditionalValues : function(component){
        var inputIcon = component.get('v.inputIcon');

        if( !component.get('v.isShowSelectedPressed') && inputIcon !== 'spinner'){

            var isReachedBottom = this.hasReachedEndOfScrolling(component, "scrollableRecordsArea");//

            if (isReachedBottom){
                var inputValue = component.get('v.inputValue').toLowerCase();

                if(inputValue.length === 0){
                    inputValue = '';
                }
                this.processServerSearch(component, inputValue);
            }
        }
        return false;
    },

    hasReachedEndOfScrolling : function(component, scrollableId) {
        var scrollableComponentElement = this.findElement(component, scrollableId);

        // quick exit if provided scrollable component element not found
        if ($A.util.isEmpty(scrollableComponentElement) && !scrollableComponentElement) {
            return false;
        }
        return (
            (scrollableComponentElement.scrollTop + scrollableComponentElement.clientHeight)
            >=
            scrollableComponentElement.scrollHeight
        );
    },

    findElement : function(component, childComponentId) {

        var childComponent = component.find(childComponentId);

        // quick exit if provided child component not found
        if ($A.util.isEmpty(childComponent)) {
            return null;
        }

        return childComponent.getElement();
    },

    //Add isAllSelectedButton
    toggleShowOnlySelected : function(component, event){
        var isShowSelectedPressed = component.get('v.isShowSelectedPressed');
        var privateOptions = [];
        this.clearInput(component);
        this.setProperInputIcon(component);

        if(isShowSelectedPressed){
            //unpress
            privateOptions = this.getOptionLoading(component);
            component.set('v.privateOptions', privateOptions);

            this.clearOffset(component);
            this.processServerSearch(component, '');
            this.showSelectedButtonSetPressed(component, false);

        } else{
            // show only selected
            var selectedOptions = component.get('v.selectedOptions');

            if($A.util.isEmpty(selectedOptions)){
                privateOptions = this.getOptionNotFound(component);

            } else{
                privateOptions =  selectedOptions;
            }

            component.set('v.privateOptions', privateOptions);
            // change showOnlySelected button label
            this.showSelectedButtonSetPressed(component, true);

            return privateOptions;
        }
    },

    //Set AllSelected pressed or unpressed
    showSelectedButtonSetPressed : function(component, isPressed){

        if(this.isShowSelectedEnabled(component)){
            component.set('v.isShowSelectedPressed', isPressed);

            if (isPressed){
                $A.util.addClass(component.find('showSelectedButton'), 'showSelectedButton-pressed');

            } else{
                $A.util.removeClass(component.find('showSelectedButton'), 'showSelectedButton-pressed');
            }
        }
    },

    //*** Client methods ***

    // process this search, if LazyLoading == false. Uses js search
    processClientSearch : function(component, inputValue){
        var options = component.get('v.options');
        if(!inputValue){
            inputValue = '';
        }
        //can copy values, instead of iterating for whole list
        var newOptions = options.filter(function(newOption) {
            var searchWord = newOption.label.toLowerCase();
            return searchWord.indexOf(inputValue) !== -1;
        });

        newOptions = this.addIsAllOption(component, newOptions, inputValue);
        component.set('v.privateOptions', newOptions);
        newOptions = this.placeNotFoundOption(component, newOptions);

        //revert inputIcon value to search
        this.setProperInputIcon(component);
    },

    //Add isAllSelectedButton
    addIsAllOption : function(component, newOptions, inputValue){

        if(this.isAllOptionEnabled(component) && inputValue.length === 0 ){
            var selectedOptions = component.get('v.selectedOptions');
            var areAllSelected = false;

            if(selectedOptions){
                areAllSelected = ( newOptions.length === selectedOptions.length );
            }
            var allLabel = component.get('v.allLabel');
            var allSelectedOption = [{
                value : allLabel,
                label : allLabel,
                selected : areAllSelected,
                isAll : true
            }];
            newOptions = allSelectedOption.concat(newOptions);
        }
        return newOptions;
    },

    handleOnSelectClickClient : function(component, itemClicked){
        // if click on isAllSelected
        var privateOptions = component.get('v.privateOptions');
        var allLabel = component.get('v.allLabel');

        if(this.isAllOptionEnabled(component) && itemClicked.value === allLabel){
            var selectedOptions = this.onAllOptionsClick(allLabel, privateOptions, itemClicked.selected);
            component.set('v.selectedOptions', selectedOptions);

        } else{
            //click on usual item
            itemClicked.selected = !itemClicked.selected;

            //determine seleted options, and refresh
            selectedOptions = this.specifySelection(component, itemClicked);

            //change isAll selection state, if enabled
            if(this.isAllOptionEnabled(component)){
                if (privateOptions[0].value === allLabel){
                    privateOptions[0].selected = (selectedOptions.length === component.get('v.options').length);
                }
            }
        }

        component.set("v.privateOptions", privateOptions);
        this.setPlaceHolder(component);
    },

    // Click on All
    onAllOptionsClick : function (allLabel, privateOptions, isAllOptionSelected) {
        var selectedOptions = privateOptions.filter(function(option) {
            option.selected = !isAllOptionSelected;
            return !isAllOptionSelected && option.value !== allLabel;
        });
        return selectedOptions;
    },

    //*** Service methods ***/

    //check selected options, and get selected after click
    specifySelection : function (component, itemClicked) {
        var selectedOptions = component.get('v.selectedOptions');
        var selectedValues = selectedOptions.map(function(selectedOption) {
            return selectedOption.value;
        });

        if(selectedValues.includes(itemClicked.value)){
            //remove
            var index = selectedValues.indexOf(itemClicked.value);
            selectedOptions.splice(index, 1);

        } else{
            //add
            selectedOptions.push(itemClicked);
        }

        component.set('v.selectedOptions', selectedOptions);
        return selectedOptions;
    },

    //Add addNotFoundOption, if there is necessity
    placeNotFoundOption : function(component, newOptions){
        if($A.util.isEmpty(newOptions) && $A.util.isEmpty(component.get('v.privateOptions'))){
            component.set("v.privateOptions", this.getOptionNotFound(component));
        }
        return newOptions;
    },

    //get selected Items from income options, and set to internal array
    extractSelectedOptions : function(component) {
        var options = component.get('v.options');
        var selectedOptions = options.filter(function(element) {
            return element.selected;
        });

        component.set('v.selectedOptions', selectedOptions);
    },

    setPlaceHolder : function (component) {
        //resetPlaceholder for Server search
        var placeHolderText = component.get('v.initialPlaceholderLabel');
        var selectedOptions = component.get("v.selectedOptions");
        if (selectedOptions.length > 0){
            placeHolderText = selectedOptions.length  + " " + component.get('v.optionsSelectedLabel');
        }
        component.set('v.placeholderValue', placeHolderText);
    },

    //change inputIcon value to correct value
    setProperInputIcon : function (component) {
        var iconName = 'search';

        if(component.get('v.inputValue').length > 0){
            iconName = 'clear';
        }
        component.set('v.inputIcon', iconName);
    },

    clearOffset : function (component) {
        component.set('v.offsetRecordsNum', 0);
    },

    //validation on input, prevent from excessive search
    isPressedInputKeyIsValid : function(keyCode) {
        switch (keyCode){
            case 16:/*Shift*/
            case 17:/*Ctrl*/
            case 37:/*Arrow left*/
            case 38:/*Arrow up*/
            case 39:/*Arrow right*/
                return false;
        }
        return true;
    },

    //closes dropdown while scroll is not within in picklist
    closeDropdownWhileScrolling : function(component){
        function mouseUpHandler(){
            document.removeEventListener("scroll", mouseUpHandler);
            component.find('menuList').get("e.doClose").fire();
        }
        document.addEventListener("scroll", mouseUpHandler);
    },

    clearInput : function(component) {
        component.set('v.inputValue', "");
    },

    // fire an event with selected items
    processPicklistChanges : function(component) {
        //validate smth was changed
        if (this.hasPicklistChanged(component)) {
            //fire change event
            component.getEvent('selectOptionChanged').setParams({
                name : component.get("v.name"),
                selectedValues: this.getSelectedValues(component),
                isAllSelected: this.isAllOptionSelected(component)
            }).fire();
            this.setPlaceHolder(component);
        }
    },

    hasPicklistChanged : function (component) {
        return this.areDifferent(
            component.get('v.selectedOptions'),
            component.get('v.maintainSelectedOptions')
        );
    },

    areDifferent : function(a, b) {
        var valA = a.sort().join(';');
        var valB = b.sort().join(';');
        return ( valA !== valB );
    },

    isAllOptionSelected : function (component) {
        if ( this.isAllOptionEnabled(component) ){
            var allOptionItem  = this.getAllOptionItem(component);

            if (allOptionItem){
                return ( !!allOptionItem.selected );
            }
        }
        return false;
    },

    applyOverAll: function(component, event) {
        $A.util.addClass(component.find('www'), 'filters-dropdown-menu-over-all');
    },

    removeOverAll: function(component, event) {
        $A.util.removeClass(component.find('www'), 'filters-dropdown-menu-over-all');
    },

    //backupSelectedOptions Items on expand, to compare later
    backupSelectedOptions : function(component) {
        component.set('v.maintainSelectedOptions', component.get('v.selectedOptions'));
    },

    getAllOptionItem : function (component) {
        if ( this.isAllOptionEnabled(component) ) {
            var options = component.get("v.privateOptions");
            var allItem = options.filter(function (item) {
                return ( item.isAll === true );
            })[0];
            return allItem;
        }
        return null;
    },

    getSelectedValues : function (component) {
        return component.get("v.selectedOptions");
    },

    //if isAllEnabled == true & if islazyLoadingEnabled == false
    isAllOptionEnabled : function (component) {
        return component.get("v.isAllEnabled") &&  !component.get("v.isLazyLoadingEnabled");
    },

    //if islazyLoadingEnabled == true
    isLazyLoadingEnabled : function (component) {
        return component.get("v.isLazyLoadingEnabled");
    },

    //if isShowSelectedEnabled == true & if isLazyLoadingEnabled == false
    isShowSelectedEnabled : function (component) {
        return component.get("v.isShowSelectedEnabled") && component.get("v.isLazyLoadingEnabled");
    },

    /*** Labels ***/
    getOptionNotFound : function(component) {
        return {"label": component.get('v.noRecordsFoundLabel'), value:null};
    },
    getOptionLoading : function(component) {
        return {"label": component.get('v.loadingLabel'), value:null};
    }
})
