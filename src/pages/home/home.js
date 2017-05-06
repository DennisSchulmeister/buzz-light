"use strict";

import ko from "knockout";

/**
 * ViewModel class for the home page.
 */
class HomePage {
    constructor() {
        this.simpleValue = "This is a simple value";
        this.observableValue = ko.observable("This is an observable value");
    }
}

ko.components.register("home-page", {
    viewModel: HomePage,
    template: require("./home.html"),
});

export { HomePage };
