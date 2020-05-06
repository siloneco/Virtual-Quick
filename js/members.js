
const memberMap = new Map();

function changeDisplayMember(memberName) {
    const data = memberMap.get(memberName);
    if (data === undefined) {
        return;
    }

    $(".extra-link").remove();

    $("#members-body-img").attr("src", escape(data.bodySource))
    $("#member-display-name-top").text(escape(data.name));
    $("#member-display-name-top").append(
        $("<span>", {
            id: "member-display-name-alphabet",
            text: escape(data.nameAlphabet)
        })
    );
    $("#member-display-name-alphabet").text(escape(data.nameAlphabet));

    $("#member-display-yt-link").attr("href", escape(data.link.youtube));
    $("#member-display-twitter-link").attr("href", escape(data.link.twitter));

    $("#member-display-description").text(escape(data.description));

    $("#member-display-debut-date").text(escape(data.debutDate));
    $("#member-display-birthday").text(escape(data.birthday));
    $("#member-display-height").text(escape(data.height));
    $("#member-display-illustrator").attr("href", escape(data.illustrator.link));
    $("#member-display-illustrator").text(escape(data.illustrator.name));

    $("#member-display-suggest-vid").attr("src", "https://www.youtube.com/embed/" + escape(data.suggestVideoID));

    if (data.link.extra !== undefined) {
        for (linkData of data.link.extra) {
            $("<a>", {
                class: "waves-effect waves-light btn blue darken-3 extra-link",
                style: "text-transform: none;",
                onClick: "event.preventDefault(); openUrl(this.href);",
                href: escape(linkData.url),
                text: escape(linkData.name)
            }).appendTo($("#member-display-link"));
        }
    }

    $("#member-display").css("display", "block");
}

function addMember(data) {
    memberMap.set(data.name, data);

    const elem = $("<a>", {
        class: "waves-effect btn-flat member-choose-button",
        onclick: "changeDisplayMember(this.text);",
        priority: data.priority
    }).append(
        $("<img>", {
            src: data.iconSource,
            alt: data.name,
            class: "member-choose-button-icon",
            style: "float: left;"
        })
    ).append(
        $("<span>", {
            style: "float: left;",
            text: data.name
        })
    );

    elem.clone().appendTo($("#holo-members-all"));
    elem.clone().appendTo($("#holo-members-" + data.category));
}


ipcRenderer.on('add-member', (event, arg) => {
    const categories = ["all"];
    if (Array.isArray(arg)) {
        for (const data of arg) {
            addMember(data);
            categories.push(data.category);
        }
    } else {
        addMember(arg);
        categories.push(arg.category);
    }

    for (const category of categories) {
        sortMembers("holo-members-" + category);
    }
});

ipcRenderer.send("request-members-data");

function escape(text) {
    return text.replace(/&/g, '&amp').replace(/"/g, '&quot').replace(/'/g, '&#39').replace(/</g, '&lt').replace(/>/g, '&gt');
}

function sortMembers(id) {
    //ソートを行う
    const sorted = $('#' + id).children().sort(function (a, b) {
        return ($(a).attr("priority") < $(b).attr("priority") ? 1 : -1);  //ソート条件
    });

    $("#" + id).children().remove();
    $("#" + id).append(sorted);
}