/*
 * jsonURL
 *
 * String
 *
 * URL of the JSON file of list data
 */
const jsonURL = "./data-file.json";

/*
 * homeURL
 *
 * String
 *
 * URL to be used as the back button of the top level's header (back button)
 */
const homeURL = "https://atthespeedofsight.com/vo_app_folder/dcoa/index.html";

/*
 * structureArray
 *
 * Array of objects
 *
 * Object array of the structure of the nested list where each {} object sets the rules for that level
 *  - title - Override title shown in the header; if blank, it will show the item's value for the category.
 *  - category - What column will be shown on that level. E.g. "State" will show a list of states.
 *  - section - The column used for the superheaders. E.g. "Country" will group items by the same country.
 */
const structureArray = [
    {
        "title":    "Locations",
        "category": "State",
        "section":  "Country"
    },
    {
        "title":    "",
        "category": "LastName",
        "section":  ""
    }
];

/*
 * function generateLinkItem
 *
 * Function to return a string that will be placed in the HTML at the end of the recursion. I.e., a list item that is a link
 * 
 * PARAMETERS
 * row - the data object passed in for that item. E.g., row.LastName will show what's in the column LastName
 *
 * RETURN
 * Template string formated as HTML
 */
generateLinkItem = row => {
    // location of liwebpagesnks
    const locationsUrl = "https://atthespeedofsight.com/vo_app_folder/dcoa/content/Locations/";

    // NOTE: no space before TitlePost
    const fullName = `${row.TitlePre} ${row.FirstName} ${row.LastName}${row.TitlePost}`;
    // .../State/ID_LastName/index.html
    const fullUrl = `${locationsUrl}${row.State.trim()}/${row.ID.trim()}_${row.LastName.trim()}/`
    
    // RETURN
    return `
        <a class="item_button item_button--link" href="${fullUrl}">
            <span class="item_button_name">
                <span class="item_button_name_super">${cleanUpText(row.City)}</span>
                ${cleanUpText(fullName)}
            </span>
        </a>
    `;
}