public with sharing class ExtendedMultiSelectController {

    //Method for server search: searchRecord with Handler
    @AuraEnabled
    public static List<SelectItem> searchRecord(String word) {

        Map<String, Object> searchParamsMap = (Map<String, Object>) JSON.deserializeUntyped(word);
        String handlerClassName = String.valueOf(searchParamsMap.get('handlerClassName'));

        List<SelectItem> options = new List<SelectItem>();

        // use handler to set custom seach from handler class
        if(handlerClassName != null){

            Type handlerClass = Type.forName(handlerClassName);
            ExtendedMultiSelectHandlerInterface handlerInstance = (ExtendedMultiSelectHandlerInterface) handlerClass.newInstance();

            options = handlerInstance.searchRecord(
                String.valueOf(searchParamsMap.get('searchValue')),
                Integer.valueOf(searchParamsMap.get('listOffset')),
                Integer.valueOf(searchParamsMap.get('listLimit'))
            );
        }

        return options;
    }
}