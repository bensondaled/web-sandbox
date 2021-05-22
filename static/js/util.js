
function openNav() {
  document.getElementById("sideMenu").style.width = "250px";
}

function closeNav() {
  document.getElementById("sideMenu").style.width = "0";
}

class Sidebar {
    
    constructor(opts) {

        this.menuOptions = opts.menu_options;
        
        // menu div
        var menuDiv = document.createElement("div");
        menuDiv.setAttribute("id", "sideMenu");
        menuDiv.className = "sidenav";
        document.body.appendChild(menuDiv);

        // menu options
        for (const [title, url] of Object.entries(this.menuOptions)) {
              var menuOption = document.createElement("a");
                menuOption.setAttribute("href", url);
                menuOption.innerHTML = title;
                menuDiv.appendChild(menuOption);
            }
        
        // close "x"
        var closeX = document.createElement("a")
        closeX.setAttribute("href", "javascript:void(0)");
        closeX.className = "closebtn";
        closeX.setAttribute("onclick", "closeNav()");
        closeX.innerHTML = "&times;";
        menuDiv.appendChild(closeX);
        
        // hamburger button, first make space bc fixed burger won't act as if it occupies space (due to position:fixed)
        var topDiv = document.createElement("div");
        topDiv.className = 'toppad';
        document.body.appendChild(topDiv);

        var menuBut = document.createElement("input");
        menuBut.setAttribute("type", "image");
        var imgUrl = "/static/images/hamburger.png"; //"{{ url_for('static', filename='images/hamburger.png') }}";
        menuBut.setAttribute("src", imgUrl);
        menuBut.className = "hamburger";
        menuBut.setAttribute("onclick", "openNav()");
        document.body.appendChild(menuBut);
    }

}
