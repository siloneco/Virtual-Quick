let id = "home";

function switchMainContent(newId) {
    leftBarClose();
    M.Modal.getInstance($("#sidebar-img-popup")[0]).close();
    if (id === newId) {
        return;
    }
    if (id !== null) {
        $("#" + id).css("display", "none");
    }

    $("#" + newId).css("display", "block");
    $("#" + newId).css("display", "block");
    $("#left-collection-" + newId).addClass("active");
    $("#left-collection-" + id).removeClass("active");

    id = newId;
}