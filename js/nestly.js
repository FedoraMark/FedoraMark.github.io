/*
 * data object variable: listObject
 *
 */

// MOBILE HEIGHT FIX
function mobileHeightFix() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

mobileHeightFix();

window.addEventListener('resize', () => {
    mobileHeightFix();
});
// -----------------

// Verify that jQuery is loaded
if (typeof jQuery !== "function") {
    console.error("ERROR: jQuery not loaded!");
} // else { console.log("jQuery loaded"); }

// VARIABLES
// -- sorting
const COUNTRY_TO_TOP = "United_States";

// -- show/hide statuses
const ACTIVE_LEVEL = "active-level";
const ACTIVE_PANEL = "active-panel";
const INACTIVE_LEVEL = "active-level--inactive";

// -- animate.css classes
const anim = "animate__animated";
const animIn = "animate__slideInRight";
const animOut = "animate__slideOutRight";

// -- used for detecting end of CSS animations
const animationEndList = "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd";

// COMMON FUNCTIONS
// get a list of values by key
getListOfUniqueValuesByKey = (array, key) => {
    return [...new Set(array.map(obj => obj[key]))]
}

// get a list of objects by key
getListOfUniqueObjectsByKey = (array, key) => {
    return [...new Map(array.map(obj => [obj[key], obj])).values()];
}

// replace _'s and trim whitespace
cleanUpText = text => {
    return text.replaceAll('_', " ").trim();
}

function buildNestedList(nestStructureArray) {
    // VARIABLES
    const $list = $("#nestedMenu #listOfLevels");
    const linkFunctionExists = (typeof generateLinkItem !== "undefined"); // checks for custom link function
    const firstCategory = nestStructureArray.slice(1)[0].title; // title of the first list
    const finalCategory = nestStructureArray.slice(-1)[0].category; // category of final list (must be unique)

    // FUNCTIONS
    // generates the level and then all of the panels within that level
    function generateLevelWrapper(array, headerTitle, levelNumber = 0) {
        const structureForLevel = nestStructureArray[levelNumber];
        const levelHeader = generateLevelHeader(structureForLevel.title.trim(), levelNumber === 0);

        // create a new level if needed
        if ($(`.list .list_level[data-level-number='${levelNumber}']`).length === 0) {
            levelWrapper = `
                <div class="list_level suppress-animation" data-level-number="${levelNumber}">
                    ${levelHeader}
                </div>
            `;
            $list.append(levelWrapper); // add to HTML
        }

        // generate panels
        let panels = generatePanelWrapper(array, headerTitle, structureForLevel.category, structureForLevel.section)
        $(`.list .list_level[data-level-number='${levelNumber}']`).append(panels);

        // recursion
        if (nestStructureArray[levelNumber + 1] !== undefined) {
            const categoryList = getListOfUniqueValuesByKey(array, structureForLevel.category);
            categoryList.forEach(function(cat) {
                const categoryArray = array.filter(row => (row[structureForLevel.category] === cat));
                generateLevelWrapper(categoryArray, cat, (levelNumber + 1));
            });
        }
    }

    // generate the header for each level with the given title
    function generateLevelHeader(title, isTopLevel = true) {
        const hasCustomTitle = title === "" ? "false" : "true";
        let backButton = `<button class="back">&#10094;</button>`;
        let topLevelClass = "";

        // check for existing homeURL and if top level to change to the "< Home" link
        if (isTopLevel && typeof homeURL !== "undefined") {
            backButton = `<a class="back" href="${homeURL}">&#10094; Home</a>`
            topLevelClass = "list_level_header--home"
        }

        return `
            <div class="list_level_header ${topLevelClass}">
                <div class="list_level_header_left">${backButton}</div>
                <h1 class="list_level_header_title" data-custom-title="${hasCustomTitle}">${title}</h1>
                <div class="list_level_header_right"><span><!-- empty --></span></div>
            </div>
        `;
    }

    // generate the panel wrapper for a list
    function generatePanelWrapper(array, title, category, section = "") {
        // get list of sections (subheadtins)
        let listOfUniqueSections = section === "" ? [] :
            getListOfUniqueValuesByKey(array, section).sort();

        // move US to start of sections list
        if (listOfUniqueSections.includes(cleanUpText(COUNTRY_TO_TOP))) {
            const usIndex = listOfUniqueSections.indexOf(COUNTRY_TO_TOP);
            const usSection = listOfUniqueSections.splice(usIndex, 1)[0];
            listOfUniqueSections.unshift(usSection);
        }

        // get list of items with valid categories
        let listOfCategoryItems =
            getListOfUniqueObjectsByKey(array, category).sort();

        // -- TBD: US territories to end of US list ?

        let fullPanel = `<ul class="list_level_panel" data-column="${title}">`; // start wrapper

        // generate sections or no sections
        if (listOfUniqueSections.length > 0) {
            listOfUniqueSections.forEach(sh => {
                fullPanel += generatePanelSection(sh); // add section heading

                listOfCategoryItems.forEach(cat => {
                    if (cat[section] === sh) {
                        fullPanel += generatePanelItem(cat, category, (category !== finalCategory));
                    }
                });
            });
        } else {
            listOfCategoryItems.forEach(cat => {
                fullPanel += generatePanelItem(cat, category, (category !== finalCategory));
            });
        }

        fullPanel += `</ul>`; // close wrapper

        return fullPanel;
    }

    // generate a list item that links to a panel
    function generatePanelItem(dataObject, category, goesToPanel = true) {
        let itemString = "";
        if (goesToPanel) {
            // PANEL <BUTTON>
            itemString = `
                <button class="item_button" data-panel="${dataObject[category]}">
                    ${cleanUpText(dataObject[category])}
                </button>
            `;
        } else {
            // LINK <A>
            if (linkFunctionExists) {
                itemString = generateLinkItem(dataObject) // custom function
            } else {
                // fallback item
                itemString = `
                    <span class="item_button item_button--empty">
                        ${cleanUpText(dataObject[category])}
                    </span>
                `;
            }
        }

        return `<li class="item">${itemString}</li>`;
    }

    // add a section heading
    function generatePanelSection(title) {
        return `<li class="section">${cleanUpText(title)}</li>`;
    }

    // *** CODE ***
    // read JSON file at "jsonURL"
    $.getJSON(jsonURL, function(listObject) {
            // SUCCESS - create levels and panels
            const cleanListArray = listObject.filter(row => (row.IsActive.trim() === "1"));
            console.log("cleanListArray: ", cleanListArray);
            generateLevelWrapper(cleanListArray, firstCategory);
        })
        .fail(function() {
            console.error("ERROR: Could not read JSON file at '" + jsonURL + "'.");
        });

}

// sets up the listeners for menu navigation
function setUpListeners(wrapperSelector) {
    const $menuWrapper = $(wrapperSelector);

    // activate (show) a level by the given level number; stop showing all other levels
    function activateLevel(levelNumberToActivate, panelToActivate = null, newTitle = null) {
        const $levelToActivate = $(`#nestedMenu .list .list_level[data-level-number='${levelNumberToActivate}']`);

        // update header title
        if (newTitle !== null) {
            $levelToActivate.find(".list_level_header_title:not([data-has-custom-title='true'])").html(newTitle);
        }

        // activate level
        $levelToActivate.addClass(`${ACTIVE_LEVEL} ${anim} ${animIn}`);

        // remove classes after animation completes
        $levelToActivate.one(animationEndList, function() {
            $levelToActivate.removeClass(`${anim} ${animIn}`);
        });

        // activate panel
        if (panelToActivate === null) {
            if (levelNumberToActivate === 0) {
                $(`.${ACTIVE_LEVEL} .list_level_panel`).addClass(ACTIVE_PANEL);
            }
        } else {
            $(`.list_level[data-level-number='${levelNumberToActivate}'] .list_level_panel[data-column='${panelToActivate}']`).addClass(ACTIVE_PANEL);
        }
    }

    // set traversed level to inactive (hide, but known to be a parent)
    function setInactiveLevel(levelNumberToSetInactive) {
        const $levelToSetInactive = $(`#nestedMenu .list .list_level[data-level-number='${levelNumberToSetInactive}']`);
        $levelToSetInactive.addClass(INACTIVE_LEVEL);

    }

    // deactivate (hide completely)
    function deactivateLevel(levelNumberToDeactivate) {
        const $levelToDeactivate = $(`#nestedMenu .list .list_level[data-level-number='${levelNumberToDeactivate}']`);
        $levelToDeactivate.addClass(`${anim} ${animOut}`);

        // remove after animation completes
        $levelToDeactivate.one(animationEndList, function() {
            $levelToDeactivate.find(`.${ACTIVE_PANEL}`).removeClass(ACTIVE_PANEL); // also deactivate panel
            $levelToDeactivate.removeClass(`${ACTIVE_LEVEL} ${INACTIVE_LEVEL} ${anim} ${animOut}`);
        });
    }

    // reactivate level (show, again)
    function reactivateLevel(levelNumberToReactivate) {
        const $levelToReactivate = $(`#nestedMenu .list .list_level[data-level-number='${levelNumberToReactivate}'].${INACTIVE_LEVEL}`);
        $levelToReactivate.removeClass(INACTIVE_LEVEL);
    }

    // activate the top level; fix for initial animation
    function activateTopLevel() {
        deactivateAllLevelsAndPanels();
        activateLevel(0);
        $(".suppress-animation").removeClass(`suppress-animation ${anim} ${animIn}`);
    }

    // deactivate (hide) all levels
    function deactivateAllLevelsAndPanels() {
        $(`.${ACTIVE_LEVEL}`).removeClass(ACTIVE_LEVEL);
        $(`.${ACTIVE_PANEL}`).removeClass(ACTIVE_PANEL);
    }

    // *** CODE ***
    // -- back button listeners
    $menuWrapper.find(".list_level_header_left button.back").on("click", function(event) {
        const currentLevel = $(this).parents(".list_level").data("level-number");

        deactivateLevel(currentLevel);
        reactivateLevel(currentLevel - 1);
    });

    // -- next Level and Panel listners
    const $levels = $menuWrapper.find(".list .list_level[data-level-number]");
    $levels.each(function(index, level) {
        const $currentLevel = $(level);
        const $panelsForCurrentLevel = $currentLevel.find(".list_level_panel");
        const currentLevelNumber = $currentLevel.data("level-number");

        $panelsForCurrentLevel.each(function(index, panel) {
            const $currentPanel = $(panel);
            const $buttonsForCurrentPanel = $currentPanel.find("button.item_button");
            // const $linksForCurrentPanel = $currentPanel.find("a.item_button.item_button--link");

            // NEST TRAVERSE LISTENER
            $buttonsForCurrentPanel.on("click", function(event) {
                const toPanel = $(this).data("panel")

                setInactiveLevel(currentLevelNumber);
                activateLevel(currentLevelNumber + 1, toPanel, cleanUpText(toPanel))
            });
        });
    });

    // Start with the top level of the nested list
    activateTopLevel();
}

// DOCUMENT READY
$(document).ready(function() {
    // Build nested menu lists if structure array is found
    if (typeof structureArray !== "undefined") {
        buildNestedList(structureArray);
    }

    // Hook up listeners for navigation
    setUpListeners('#nestedMenu.menu-wrapper');

    // When done loading, update the loading-message class to hide it
    $('#nestedMenu.menu-wrapper').find('.loading-message').addClass('loading-message--done');
});