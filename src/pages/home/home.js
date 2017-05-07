"use strict";

import ko from "knockout";
import plugins from "../../app.js";

/**
 * ViewModel class for the home page.
 */
class HomePage {
    constructor() {
        this.simpleValue = "This is a simple value";
        this.observableValue = ko.observable("This is an observable value");
        plugins["Router"].page_name("The Home Page");
    }
}

ko.components.register("home-page", {
    viewModel: HomePage,
    template: require("./home.html"),
});

export { HomePage };
