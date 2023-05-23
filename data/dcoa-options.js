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