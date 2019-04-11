/**
 * @author Znak Adnrii
 * @date 1 March, 2019
 *
 * @description interface for classes, which will be used as handlers for server search.
 */
public interface MultiselectHandlerInterface {
    /**
     * @description method for server search, returns list of data, filtered through conditions
     * @param word search word, which is used to specify search filter
     * @param listOffset specifies the starting row offset into the result, returned by search
     * @param listLimit specifies the maximum number of records to return
     * @return list of data, filtered through conditions
     */
    List<SelectItem> searchRecord(String word, Integer listOffset, Integer listLimit);
}
