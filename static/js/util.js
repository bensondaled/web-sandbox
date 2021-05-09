
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
        
        // hamburger button
        var menuBut = document.createElement("input");
        menuBut.setAttribute("type", "image");
        var imgUrl = "/static/images/hamburger.png"; //"{{ url_for('static', filename='images/hamburger.png') }}";
        menuBut.setAttribute("src", imgUrl);
        menuBut.setAttribute("width", "5%");
        menuBut.setAttribute("height", "5%");
        menuBut.setAttribute("onclick", "openNav()");
        document.body.appendChild(menuBut);
    }

}
