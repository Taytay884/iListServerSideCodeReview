const ListDal = require('./ListDal');
const ListItemDal = require('./ListItemDal');
const InvitationDal = require('./InvitationDal');
const UserDal = require('./UserDal');

module.exports = {
    // List
    addListToDatabase: ListDal.addListToDatabase.bind(ListDal),
    getListFromDatabase: ListDal.getListFromDatabase.bind(ListDal),
    getListsFromDatabase: ListDal.getListsFromDatabase.bind(ListDal),
    deleteListFromDatabase: ListDal.deleteListFromDatabase.bind(ListDal),
    removeUserFromList: ListDal.removeUserFromList.bind(ListDal),
    // ListItem
    getListItemsFromDatabase: ListItemDal.getListItemsFromDatabase.bind(ListItemDal),
    getListItemFromDatabase: ListItemDal.getListItemFromDatabase.bind(ListItemDal),
    addListItemToDatabase: ListItemDal.addListItemToDatabase.bind(ListItemDal),
    removeListItemFromDatabase: ListItemDal.removeListItemFromDatabase.bind(ListItemDal),
    updateListItem: ListItemDal.updateListItem.bind(ListItemDal),
    // User
    createUser: UserDal.createUser.bind(UserDal),
    login: UserDal.login.bind(UserDal),
    logout: UserDal.logout.bind(UserDal),
    checkIsUserLoggedIn: UserDal.checkIsUserLoggedIn.bind(UserDal),
    updateUserSessionId: UserDal.updateUserSessionId.bind(UserDal),
    getUserByUsername: UserDal.getUserByUsername.bind(UserDal),
    // Invitation
    addInvitationToDatabase: InvitationDal.addInvitationToDatabase.bind(InvitationDal),
    getInvitationsFromDatabase: InvitationDal.getInvitationsFromDatabase.bind(InvitationDal),
    acceptInvitation: InvitationDal.acceptInvitation.bind(InvitationDal),
    declineInvitation: InvitationDal.declineInvitation.bind(InvitationDal)
};
