### Main config attributes:

#### isDisabled
Determine, enable or disable component. If disabled = true, we even cannot expand it.
 
#### isInputEnabled
If true, enables input, which provides search in list of select options using JS(client search) or apex (server search)

#### isAllEnabled
If true, enables additional  ‘All’ option. It can select/or deselect all available items. Only for **JS**(Client search)
To make this work, isLazyLoadingEnabled param must be **false**

#### isLazyLoadingEnabled
If true, enables lazy loading through items in dropdown **onmousescroll** or **onmousewheel**, and server search, using apex. 
To start using server search, you should define handlerClass param. 
Handler param is **mandatory**. It provides server search logic and implement MultiselectHandlerInterface
Example of class to be set as handler param.

    /**
     * @author Znak Adnrii
     * @date 1 March, 2019
     *
     * @description Example of Handler class for Account records, that realizes server search
     */
    public with sharing class ExtendedMultiSelectHandler implements ExtendedMultiSelectHandlerInterface {
        /**
         * @description method for server search, returns list of data, filtered to contitions
         * @param word search word, which is used to specify search filter
         * @param listOffset specifies the starting row offset into the result, returned by search
         * @param listLimit specifies the maximum number of records to return
         * @return list of data, filtered to contitions
         */
        public static List<SelectItem> searchRecord(String word, Integer listOffset, Integer listLimit) {
    
            List<SelectItem> options = new List<SelectItem>();
    
            List<Account> accList = [
                    SELECT Name, Status__c
                    FROM Account
                    WHERE Name LIKE :word + '%'
                    ORDER BY Name
                    LIMIT :listLimit
                    OFFSET :listOffset
            ];
    
            for (Account acc : accList) {
                Object params = (Object) acc.getPopulatedFieldsAsMap();
    
                options.add(
                        new SelectItem(
                                //value - Should be unique.
                                acc.Id,
                                //label - it is showing on UI
                                acc.Name,
                                //Object - contains params,
                                // which can be used in custom output components
                                params
                        )
                );
            }
    
            return options;
        }
    }

#### isShowSelectedEnabled
If true, shows ‘Selected’ button on input. Works only for **server search**
On click, it shows only selected items

#### isUsingCustomLabelsAsOption
This option will be useful, if you want to set an array of custom labels as options. If true, all values will be fetched from custom labels. 
Use this param only for JS(client search), for server search define logic in controller.
Labels must be in format '$Label.namespace.labelName'

#### outputComponent
This attribute allows you to use your own custom components to replace standard menu items.
To make this work, your options must contain ‘params’ populated.


Attribute dependency:

|   | Attribute name        | isAllEnabled  | isLazyLoadingEnabled | isShowSelectedEnabled | isInputEnabled |
|---|-----------------------|---------------|----------------------|-----------------------|----------------|
| 1 | isAllEnabled          | required true | required false       | not required          | not required   |
| 2 | isLazyLoadingEnabled  | not required  | required true        | not required          | not required   |
| 3 | isShowSelectedEnabled | not required  | required true        | required true         | not required   |
| 4 | isInputEnabled        | not required  | not required         | not required          | required true  |

