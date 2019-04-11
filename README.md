Main config attributes:

*isDisabled*

Determine, enable or disable component. If disabled = true, we even cannot expand it:
 
*isInputEnabled*

If true, enables input, which provides search in list of select options using JS(client search) or apex (server search)

*isAllEnabled*
If true, enables additional  ‘All’ option. It can select/or deselect all available items. Only for JS(Client search)
To make this work, isLazyLoadingEnabled param should be false

*isLazyLoadingEnabled*

If true, enables lazy loading through items in dropdown on mousescroll or wheel, and server search, using apex. 
To start using server search, you should define handlerClass param. 
It should contain name of apex class, which provides server search logic.
See example.

*isShowSelectedEnabled*
If true, shows ‘Selected’ button on input. 
On click, it shows only selected items

*isUsingCustomLabelsAsOption*
This option will be useful, if you want to set an array of custom labels as options. If true, all values will be fetched from custom labels. 
Use it only for JS(client search), for server search define logic in controller.
Labels must be in format /$Label.namespace.labelName/

*outputComponent*
This attribute allows you to use your own custom components to replace standard menu items.
To make this work, your options must contain ‘params’ populated.

Attribute dependency:
|   | Attribute name        | isAllEnabled  | isLazyLoadingEnabled | isShowSelectedEnabled | isInputEnabled |
|---|-----------------------|---------------|----------------------|-----------------------|----------------|
| 1 | isAllEnabled          | required true | required false       | not required          | not required   |
| 2 | isLazyLoadingEnabled  | not required  | required true        | not required          | not required   |
| 3 | isShowSelectedEnabled | not required  | required true        | required true         | not required   |
| 4 | isInputEnabled        | not required  | not required         | not required          | required true  |

