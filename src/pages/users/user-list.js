"use strict";

import ko from "knockout";

/**
 * ViewModel class for the list of users page.
 */
class UserListPage {
    constructor() {
    }
}

ko.components.register("user-list-page", {
    viewModel: UserListPage,
    template: require("./user-list.html"),
});

export { UserListPage };
