//EXAMPLE: Handler class for Account, it is used as parameter for ExtendedMultiSelect component
// for processing server search
public with sharing class ExtendedMultiSelectHandler implements ExtendedMultiSelectHandlerInterface {

    //Custom method for server search
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
                    //value = custom setting record id.
                    acc.Id,
                    //NAME OF CUSTOM LABEL for activity type alias: e.g. "Journey SMS".
                    acc.Name,
                    //define params
                    params
                )
            );
        }

        return options;
    }
}