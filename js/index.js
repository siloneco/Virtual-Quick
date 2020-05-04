$("#left-bar").hover(function () {
    leftBarOpen();
}, function () {
    leftBarClose();
})

$("#left-bar-img").dblclick(function () {
    M.Modal.getInstance($("#sidebar-img-popup")[0]).open();
});

function leftBarClose() {
    $("#left-bar").css("width", "65px");
    $("#black-cover").css("opacity", 0);
    $("#holo-tips-card-and-link").css("opacity", 0);
    $("#left-bar-img").css("opacity", 0);
}

function leftBarOpen() {
    $("#left-bar").css("width", "300px");
    $("#black-cover").css("opacity", 0.7);
    $("#holo-tips-card-and-link").css("opacity", 1);
    $("#left-bar-img").css("opacity", 1);
    // $("#left-bar-img").css("background-image", "url(img/image.jpg)");
}