"use strict";

import ko from "knockout";
import plugins from "../../app.js";

/**
 * ViewModel class for the list of users page.
 */
class UserListPage {
    constructor() {
        plugins["Router"].page_name("List of users");
    }
}

ko.components.register("user-list-page", {
    viewModel: UserListPage,
    template: require("./user-list.html"),
});

export { UserListPage };
