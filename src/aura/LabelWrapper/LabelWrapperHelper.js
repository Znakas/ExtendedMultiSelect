({
    prepareLabel : function(component) {
        debugger;
        var label = component.get("v.label");
        console.log('label ' + label);

        var value = component.get("v.value");
        if(this.isReferenceToCustomLabel(component, label) && !$A.util.isEmpty(label) && !$A.util.isEmpty(value)){
            label = $A.get(label);
        }

        var customSelectOption = component.get('v.selectOption');
        // set custom functionality
        if(!$A.util.isEmpty(customSelectOption)){
            //set params object into component
            if(label){
                console.log('@label ' + label);

                customSelectOption[0]['attributes']['values']['label'] = label;
            }
            if(value){
                customSelectOption[0]['attributes']['values']['value'] = value;
            }
            customSelectOption[0]['attributes']['values']['params'] = component.get("v.params");

        } else {
            // set standart functionality
            if (!$A.util.isEmpty(label)) {
                console.log('!$A.util label ' + label);
                component.set("v.label", label);
            }
        }
        console.log('label@ ' + label);
    },

    isReferenceToCustomLabel : function(component, label) {
        return component.get("v.isUsingCustomLabelsAsOption") && label.includes('$Label');
    }
})