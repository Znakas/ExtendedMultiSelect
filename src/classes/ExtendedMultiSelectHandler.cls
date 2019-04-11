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
