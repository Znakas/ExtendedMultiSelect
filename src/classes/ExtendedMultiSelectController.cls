/**
 * @author Znak Adnrii
 * @date 1 March, 2019
 *
 * @description Controller class that realizes server search
 */
public with sharing class ExtendedMultiSelectController {
    /**
     * @description method for server search, creates instance of search class,
     * and returns list of data, filtered to contitions
     * @param searchParams object, which contains seach params
     * @return returns list of data, filtered to contitions
     */
    @AuraEnabled(Cacheable=true)
    public static List<SelectItem> searchRecord(String searchParams) {
        String handlerClassParam = 'handlerClassName';

        Map<String, Object> searchParamsMap = (Map<String, Object>) JSON.deserializeUntyped(searchParams);
        String handlerClassName = String.valueOf(searchParamsMap.get(handlerClassParam));

        List<SelectItem> options = new List<SelectItem>();

        // create handler instanse to process custom seach
        if(handlerClassName != null){

            Type handlerClass = Type.forName(handlerClassName);
            ExtendedMultiSelectHandlerInterface handlerInstance =
                    (ExtendedMultiSelectHandlerInterface) handlerClass.newInstance();

            String searchValueParam = 'searchValue';
            String offsetParam = 'listOffset';
            String limitParam = 'listLimit';

            options = handlerInstance.searchRecord(
                String.valueOf(searchParamsMap.get(searchValueParam)),
                Integer.valueOf(searchParamsMap.get(offsetParam)),
                Integer.valueOf(searchParamsMap.get(limitParam))
            );
        }

        return options;
    }
}
