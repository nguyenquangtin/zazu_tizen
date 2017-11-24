/*jshint unused: vars*/

(function() {
    var RETURN_BUTTON = 10009,
        LEFT_ARROW_BUTTON = 37,
        RIGHT_ARROW_BUTTON = 39,
        XML_ADDRESS = "https://www.tizen.org/blogs/feed",
        XML_METHOD = "GET",
        MSG_ERR_NODATA = "There is no news from tizen.org",
        MSG_ERR_NOTCONNECTED = "Connection aborted. Check your internet connection.",
        NUM_MAX_NEWS = 5,
        NUM_MAX_LENGTH_SUBJECT = 64,
        arrayNews = [],
        indexDisplay = 0,
        lengthNews = 0;

    /**
     * Removes all child of the element.
     * @private
     * @param {Object} elm - The object to be emptied
     * @return {Object} The emptied element
     */
    function emptyElement(elm) {
        while (elm.firstChild) {
            elm.removeChild(elm.firstChild);
        }

        return elm;
    }

    /**
     * Handles the hardware key events.
     * @private
     * @param {Object} event - The object contains data of key event
     */
    function keyEventHandler(event) {
        if (event.keyCode === LEFT_ARROW_BUTTON) {
            showPrevNews();
        } else if (event.keyCode === RIGHT_ARROW_BUTTON) {
            showNextNews();
        } else if (event.keyCode === RETURN_BUTTON) {
            try {
                tizen.application.getCurrentApplication().exit();
            } catch (ignore) {}
        }
    }

    /**
     * Adds a text node with specific class to an element.
     * @private
     * @param {Object} objElm - The target element to be added the text
     * @param {string} textClass - The class to be applied to the text
     * @param {string} textContent - The text string to add
     */
    function addTextElement(objElm, textClass, textContent) {
        var newElm = document.createElement("p");

        newElm.className = textClass;
        newElm.appendChild(document.createTextNode(textContent));
        objElm.appendChild(newElm);
    }

    /**
     * Cuts the text by length and put ellipsis marks at the end if needed.
     * @private
     * @param {string} text - The original string to be cut
     * @param {number} maxLength - The maximum length of the string
     */
    function trimText(text, maxLength) {
        var trimmedString;

        if (text.length > maxLength) {
            trimmedString = text.substring(0, maxLength - 3) + "...";
        } else {
            trimmedString = text;
        }

        return trimmedString;
    }

    /**
     * Displays a news and page number of the selected index.
     * @private
     * @param {number} index - The index of the news to be displayed
     */
    function showNews(index) {
        var objNews = document.querySelector("#area-news"),
            objPagenum = document.querySelector("#area-pagenum");

        emptyElement(objNews);
        addTextElement(objNews, "subject", arrayNews[index].title);
        emptyElement(objPagenum);
        addTextElement(objPagenum, "pagenum", "Page " + (index + 1) + "/" + lengthNews);
    }

    /**
     * Displays a news of the next index.
     * @private
     */
    function showNextNews() {
        if (lengthNews > 0) {
            indexDisplay = (indexDisplay + 1) % lengthNews;
            showNews(indexDisplay);
        }
    }

    /**
     * Displays a news of the previous index.
     * @private
     */
    function showPrevNews() {
        if (lengthNews > 0) {
            indexDisplay = (lengthNews + (indexDisplay - 1)) % lengthNews;
            showNews(indexDisplay);
        }
    }


    /**
     * Reads data from internet by XMLHttpRequest, and store received data to the local array.
     * @private
     */
    function getDataFromXML() {
        var objNews = document.querySelector("#area-news"),
            xmlhttp = new XMLHttpRequest(),
            xmlDoc,
            dataItem,
            i;

        arrayNews = [];
        lengthNews = 0;
        indexDisplay = 0;
        emptyElement(objNews);

        xmlhttp.open(XML_METHOD, XML_ADDRESS, false);
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                xmlDoc = xmlhttp.responseXML;
                dataItem = xmlDoc.getElementsByTagName("item");

                if (dataItem.length > 0) {
                    lengthNews = (dataItem.length > NUM_MAX_NEWS) ? NUM_MAX_NEWS : dataItem.length;
                    for (i = 0; i < lengthNews; i++) {
                        arrayNews.push({
                            title: dataItem[i].getElementsByTagName("title")[0].childNodes[0].nodeValue,
                            link: dataItem[i].getElementsByTagName("link")[0].childNodes[0].nodeValue
                        });
                        arrayNews[i].title = trimText(arrayNews[i].title, NUM_MAX_LENGTH_SUBJECT);
                    }

                    showNews(indexDisplay);
                } else {
                    addTextElement(objNews, "subject", MSG_ERR_NODATA);
                }

                xmlhttp = null;
            } else {
                addTextElement(objNews, "subject", MSG_ERR_NOTCONNECTED);
            }
        };

        xmlhttp.send();
    }

    /**
     * Sets default event listeners.
     * @private
     */
    function setDefaultEvents() {
        document.addEventListener("keydown", keyEventHandler);
        document.querySelector("#area-news").addEventListener("click", showNextNews);
    }

    /**
     * Initiates the application.
     * @private
     */
    function init() {
        setDefaultEvents();
        getDataFromXML();
    }

    window.onload = init;
}());
