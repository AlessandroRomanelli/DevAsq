(function(dust){dust.register("error",body_0);function body_0(chk,ctx){return chk.w("<!DOCTYPE html><html><head><title>").f(ctx.get(["title"], false),ctx,"h").w("</title><link rel='stylesheet' href='/stylesheets/style.css' /></head><body>").p("partials/menu",ctx,ctx,{}).w("<h1>").f(ctx.get(["message"], false),ctx,"h").w("</h1><h2>").f(ctx.getPath(false, ["error","status"]),ctx,"h").w("</h2><pre>").f(ctx.getPath(false, ["error","stack"]),ctx,"h").w("</pre></body></html>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("index",body_0);function body_0(chk,ctx){return chk.w("<!DOCTYPE html><html><head><title>").f(ctx.get(["title"], false),ctx,"h").w("</title><link rel='stylesheet' href='/stylesheets/style.css' /></head><body class=\"off\" onload=\"init()\">").p("partials/menu",ctx,ctx,{}).w("<div id=\"content\">").s(ctx.get(["loggedUser"], false),ctx,{"else":body_1,"block":body_2},{}).w("</div>").p("partials/footer",ctx,ctx,{}).w("<script src=\"/scripts/dustjs/dust-core.min.js\" charset=\"utf-8\"></script><script src=\"/socket.io/socket.io.js\"></script><script src=\"/scripts/socket.js\" charset=\"utf-8\"></script><script src=\"/scripts/ace/ace.js\" charset=\"utf-8\"></script><script src=\"/scripts/ace/ext-language_tools.js\" charset=\"utf-8\"></script><script src=\"/scripts/views.js\" charset=\"utf-8\"></script><script src=\"/scripts/fetch.js\" charset=\"utf-8\"></script>").x(ctx.get(["user"], false),ctx,{"block":body_3},{}).w("<script src=\"/scripts/navbar.js\" charset=\"utf-8\"></script><script src=\"/scripts/rooms.js\" charset=\"utf-8\"></script><script src=\"/scripts/main.js\" charset=\"utf-8\"></script></body></html>");}body_0.__dustBody=!0;function body_1(chk,ctx){return chk.p("partials/about",ctx,ctx,{});}body_1.__dustBody=!0;function body_2(chk,ctx){return chk.p("partials/rooms",ctx,ctx,{});}body_2.__dustBody=!0;function body_3(chk,ctx){return chk.w("<script type=\"text/javascript\">const user = ").f(ctx.get(["user"], false),ctx,"h",["s"]).w(";</script>");}body_3.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("pen",body_0);function body_0(chk,ctx){return chk.w("<!DOCTYPE html><html><head><title>").f(ctx.get(["title"], false),ctx,"h").w("</title><link rel='stylesheet' href='/stylesheets/style.css' /></head><body onload=\"init()\">").p("partials/menu",ctx,ctx,{}).w("<div id=\"content\"><div id=\"room-info\"><span class='info'><span>Name: <span id=\"room-name\" class=\"info\"></span></span><span id=\"raise-hand\">Ask for help</span><span>Participants: <span id=\"participants\" class=\"info\"></span></span><span id=\"share-public\" data-html=\"true\" data-css=\"true\" data-js=\"true\">Share <button id='share-toggler'>▼</button><div id=\"share-options\"><div class=\"option-container\"><span>ALL</span><label class=\"switch\" for=\"all\"><input type=\"checkbox\" name=\"all\" checked><span class=\"slider\"></span></label></div><div class=\"option-container\"><span>HTML</span><label class=\"switch\" for=\"html\"><input type=\"checkbox\" name=\"html\" checked><span class=\"slider\"></span></label></div><div class=\"option-container\"><span>CSS</span><label class=\"switch\" for=\"css\"><input type=\"checkbox\" name=\"css\" checked><span class=\"slider\"></span></label></div><div class=\"option-container\"><span>JS</span><label class=\"switch\" for=\"js\"><input type=\"checkbox\" name=\"js\" checked><span class=\"slider\"></span></label></div></div></span><span id='storage-options'><button id='export'>Export</button><button id='import'>Import</button></span></span><span class='layouts'>Layout:<button id=\"leftLayout\">⇠</button><button class='active' id=\"centerLayout\">⇡</button><button id=\"rightLayout\">⇢</button></span></div><div class=\"tabs-container\"><ul id=\"tabs\" class=\"container\"><li id='newTab' class=\"switchTab\"><img src=\"/images/plus.png\"></li></ul></div><div id=\"pens\" class=\"container centerLayout\"><div class=\"controls\"><div class=\"pen\"><div class='header'><h1> HTML </h1><span class='pen-layout'><button></button><button class='active'></button><button></button></span></div><div id=\"htmlPen\" class=\"codePane\"></div></div><div class=\"pen\"><div class='header'><h1> CSS </h1><span class='pen-layout'><button></button><button class='active'></button><button></button></span></div><div id=\"cssPen\" class=\"codePane\"></div></div><div class=\"pen\"><div class='header'><h1> JS </h1><span class='pen-layout'><button></button><button class='active'></button><button></button></span></div><div id=\"jsPen\" class=\"codePane\"></div></div></div><div class=\"preview\"><iframe id=\"iFrame\" src=\"/preview.html\"></iframe></div></div></div><div id=\"room-settings\" class='hidden'>").p("partials/creator",ctx,ctx,{}).w("</div>").p("partials/confirmModal",ctx,ctx,{}).p("partials/previewModal",ctx,ctx,{}).p("partials/storageModal",ctx,ctx,{}).p("partials/footer",ctx,ctx,{}).w("<script src=\"/socket.io/socket.io.js\"></script><script src=\"/scripts/ace/ace.js\" charset=\"utf-8\"></script><script src=\"/scripts/ace/ext-language_tools.js\" charset=\"utf-8\"></script><script src=\"/scripts/dustjs/dust-core.min.js\" charset=\"utf-8\"></script><script src=\"/scripts/views.js\" charset=\"utf-8\"></script><script src=\"/scripts/fetch.js\" charset=\"utf-8\"></script><script src=\"/scripts/diffjs/diff.js\"></script><script src=\"/scripts/parser.js\" charset=\"utf-8\"></script>").x(ctx.get(["room"], false),ctx,{"block":body_1},{}).w("<script src=\"/scripts/app.js\" charset=\"utf-8\"></script><script src=\"/scripts/navbar.js\" charset=\"utf-8\"></script><script src=\"/scripts/pen.js\" charset=\"utf-8\"></script></body></html>");}body_0.__dustBody=!0;function body_1(chk,ctx){return chk.w("<script type=\"text/javascript\">const room = ").f(ctx.get(["room"], false),ctx,"h",["s"]).w(";const user = ").f(ctx.get(["user"], false),ctx,"h",["s"]).w(";// localStorage.room = JSON.stringify(r); // eliminate ?// localStorage.user = JSON.stringify(u); // eliminate ?</script>");}body_1.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/about",body_0);function body_0(chk,ctx){return chk.w("<div class = \"about\"><div id=\"home\" class=\"container\"><div class=\"header\"><div class=\"title\"><img src=\"/images/logo.png\" alt=\"DevAsq++ Logo\"><p class=\"subtitle\"> Do together. Learn together. </p></div></div></div><div class=\"containerbody\"><div class=\"thisproject\"><h1> This Project </h1><p>This project has been developed during the Fall/Winter semester 2018 for the course of Software Atelier 3 teached by Cesare Pautasso. This is the final product of 4 weeks of work in which we have created this platform in the way you see at the moment. The main structure of DevAsq++ is built with Dust and the style has been added with Sass, all the other features are made with Javascript.</p></div><div class=\"howitworks\"><h3> How it works </h3><p>This platform is aimed to help students coding during the hands on performed in the lectures of Web Atelier, here you can:<ul style=\"list-style-type:none\"><li><h4>Create a room / Join an already existing room</h4><p>The idea is that the professor creates a room with a name and with a password, if needed. Students when entering will join the room created by the professor and they will be able to see what the professor writes.</p></li><li><h4>Start coding </h4><p>You will find 3 pens in which you can write HTML, CSS and JS code and a live preview of what you are doing will be displayed. You will also see the tab the professor decides to make public and there will be also the possibility to ask for help.</p></li><li><h4>Creator mode / Student mode</h4><p>The creator of the room will be able to manage the room, see how many partecipants are there and respond to who asked for help, while the students will have the possibility to ask something to the professor or TA and they will receive a quick help.</p></li></ul></p><h3> Who we are </h3></div></div><div class=\"iconbox\"><div id=\"burro\"><img src=\"images/burro.jpg\" /><p class=\"name\">Cristian</p><p class=\"surname\"> Buratti </p><p class=\"role\"> Back-end developer</p></div><div id=\"lino\"><img src=\"images/diego.png\"/><p class=\"name\">Diego </p><p class=\"surname\"> Carlino</p><p class=\"role\"> Back-end developer</p></div><div id=\"sara\"><img src=\"images/sara.jpg\" /><p class=\"name\">Sara</p><p class=\"surname\"> Mangialavori</p><p class=\"role\"> Front-end developer</p></div><div id=\"roma\"><img src=\"images/sandro.jpg\"/><p class=\"name\">Alessandro</p><p class=\"surname\"> Romanelli </p><p class=\"role\"> Team leader</p></div><div id=\"ale\"><img src=\"images/sandra.jpg\"/><p class=\"name\">Alessandra</p><p class=\"surname\"> Vicini </p><p class=\"role\"> Front-end developer</p></div></div></div>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/creator",body_0);function body_0(chk,ctx){return chk.w("<div class=\"toggler\"><img src=\"/images/chevron.png\" alt=\"\"><span></span><img src=\"/images/chevron.png\" alt=\"\"></div><h1>Room Participants</h1><hr><div id=\"users\">").s(ctx.get(["users"], false),ctx,{"block":body_1},{}).w("</div>");}body_0.__dustBody=!0;function body_1(chk,ctx){return chk.p("partials/user",ctx,ctx,{});}body_1.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/confirmModal",body_0);function body_0(chk,ctx){return chk.w("<div id=\"confirm-modal\" class=\"modal hidden\"><div class=\"container\"><p>Are you really sure you want to do this?</p><div class=\"choice-buttons\"><button class=\"cancel\" type=\"button\" name=\"button\">Cancel</button><button class=\"confirm\" type=\"button\" name=\"button\">Confirm</button></div></div></div>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/footer",body_0);function body_0(chk,ctx){return chk.w("<footer class=\"index_footer\"><span id=\"version\"> &copy 2018 </span><span id=\"team-info\"><p id=\"team\">Dream Team</p><p id=\"team-members\"> Cristian Buratti, Diego Carlino, Sara Mangialavori, Alessandro Romanelli, Alessandra Vicini</p></span><span> <img id=\"usi_logo\" src=\"/images/usi.png\" alt=\"usi_logo\"> </span></footer>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/loggedUser",body_0);function body_0(chk,ctx){return chk.s(ctx.get(["loggedUser"], false),ctx,{"else":body_1,"block":body_2},{});}body_0.__dustBody=!0;function body_1(chk,ctx){return chk.w("<a id='login' href=\"/login\">Login</a>");}body_1.__dustBody=!0;function body_2(chk,ctx){return chk.w("<p> Hello, <span class='user-name'>").f(ctx.get(["username"], false),ctx,"h").w("</span>!</p><a id='logout' href=\"/logout\"> Logout </a>");}body_2.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/loginForm",body_0);function body_0(chk,ctx){return chk.w("<form id=\"loginForm\" class='profile-form'><fieldset><input id=\"login-name\" type=\"text\" name=\"username\" placeholder=\"Username\"></fieldset><fieldset><input id=\"login-password\" type=\"password\" name=\"password\" placeholder=\"Password\"></fieldset><fieldset class='submit'><input id='localLogin' type=\"submit\" value=\"Login\"><p id='login-error' class='submit-error'></p><hr><input id='githubLogin' type=\"submit\" value=\"Login with GitHub\"></fieldset></form><p>You don't have an account yet?<br><a id=\"signup\" href=\"/signup\">Sign up</a> now!</p>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/menu",body_0);function body_0(chk,ctx){return chk.w("<nav class=\"menu\"><a class=\"logo\" href=\"/\"><img src=\"/images/logo.png\" alt=\"DevAsq++ Logo\"></a><div class=\"profile\">").p("partials/loggedUser",ctx,ctx,{}).w("</div><div id=\"login-signup-modal\"class=\"login hidden\">").p("partials/loginForm",ctx,ctx,{}).w("</div></nav>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/room",body_0);function body_0(chk,ctx){return chk.w("<tr id=\"room_").f(ctx.get(["name"], false),ctx,"h").w("\" data-name=\"").f(ctx.get(["name"], false),ctx,"h").w("\"><td>").f(ctx.get(["name"], false),ctx,"h").w("</td><td>").f(ctx.get(["users"], false),ctx,"h").w("</td><td><input type=\"password\" class=\"passworded\" placeholder=\"Optional\"></td><td><a href=\"\">Join</a></td></tr>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/previewModal",body_0);function body_0(chk,ctx){return chk.w("<div id='preview-modal' class=\"modal hidden\"><div class=\"container\"><div class=\"close-modal\"></div><iframe id='preview-iframe'></iframe><div id='preview-loaders' class=\"\"><button id='modal-share' type=\"button\" name=\"button\">Share pen</button><button id='modal-load' type=\"button\" name=\"button\">Load pen</button></div></div></div>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/rooms",body_0);function body_0(chk,ctx){return chk.w("<div id=\"home\" class=\"container\"><div class=\"header\"><div class=\"title\"><img src=\"/images/logo.png\" alt=\"DevAsq++ Logo\"><p class=\"subtitle\"> Do together. Learn together. </p></div></div><div class=\"manage-rooms\"><div class=\"form-container\"><h1>New Room</h1><div id='createRoom' class='form'><fieldset><input type=\"text\" name=\"roomName\" placeholder=\"Room Name\"></fieldset><fieldset><input type=\"password\" name=\"password\" placeholder=\"Password (Optional)\"></fieldset><fieldset class=\"submit\"><input id='createRoomButton' type=\"submit\" value=\"Create\"></fieldset></div></div><div class=\"separator\"></div><div class=\"form-container\"><h1>Join Room</h1><div id='joinRoom' class='form'><fieldset><input type=\"text\" name=\"roomName\" placeholder=\"Room Name\"></fieldset><fieldset><input type=\"password\" name=\"password\" placeholder=\"Password (Optional)\"></fieldset><fieldset class=\"submit\"><input id='joinRoomButton' type=\"submit\" value=\"Join\"></fieldset></div></div></div>").p("partials/roomExplorer",ctx,ctx,{}).w("</div>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/signupForm",body_0);function body_0(chk,ctx){return chk.w("<form id=\"signupForm\" class='profile-form'><fieldset><input id='signup-name' type=\"text\" name=\"username\" placeholder=\"Username\"></fieldset><fieldset><input id='signup-password' type=\"password\" name=\"password\" placeholder=\"Password\"></fieldset><fieldset><input id='signup-password-confirm' type=\"password\" name=\"confirmPassword\" placeholder=\"Confirm Password\"></fieldset><fieldset class='submit'><input id='signup-submit' type=\"submit\" value=\"Signup\" disabled></fieldset></form><p>Back to <a id=\"loginButton\" href=\"/login\">Login</a></p>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/roomExplorer",body_0);function body_0(chk,ctx){return chk.w("<div id='room-browser'><h1 id=\"room-browser-title\" class=\"hidden\"> Room Browser</h1><table id=\"roomTable\" class=\"hidden\"><tr><th> Name <span id=\"name-sort\" class=\"sort-by active\">▼</span></th><th> <img src=\"/images/user.png\" width=\"15\" height=\"15\" alt=\"\"><span id=\"pop-sort\" class=\"sort-by\">▼</span></th><th> Password </th><th>  </th></tr>").s(ctx.get(["activeRooms"], false),ctx,{"block":body_1},{}).w("</table></div>");}body_0.__dustBody=!0;function body_1(chk,ctx){return chk.w("<tr data-name=\"").f(ctx.get(["name"], false),ctx,"h").w("\">").p("partials/room",ctx,ctx,{}).p("partials/room",ctx,ctx,{}).w("</tr>");}body_1.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/storageExport",body_0);function body_0(chk,ctx){return chk.w("<p>Where do you want to save your pen?</p><button>Github</button><button>Server DB</button>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/storageImport",body_0);function body_0(chk,ctx){return chk.x(ctx.get(["options"], false),ctx,{"else":body_1,"block":body_2},{});}body_0.__dustBody=!0;function body_1(chk,ctx){return chk.w("No options available for import");}body_1.__dustBody=!0;function body_2(chk,ctx){return chk.w("Choose one from the following options:<div id=\"import-options\"><div class=\"locals\">").s(ctx.get(["locals"], false),ctx,{"block":body_3},{}).w("</div><div class=\"githubs\">").s(ctx.get(["githubs"], false),ctx,{"block":body_4},{}).w("</div></div>");}body_2.__dustBody=!0;function body_3(chk,ctx){return chk.w("<div class=\"local option\">").f(ctx.get(["title"], false),ctx,"h").w("</div>");}body_3.__dustBody=!0;function body_4(chk,ctx){return chk.w("<div class=\"github option\">").f(ctx.get(["title"], false),ctx,"h").w("</div>");}body_4.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/storageModal",body_0);function body_0(chk,ctx){return chk.w("<div id=\"storage-modal\" class=\"modal hidden\"><div class=\"container\"><div class=\"close-modal\"></div><div class=\"content\"></div></div></div>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/tab",body_0);function body_0(chk,ctx){return chk.w("<li id=\"").f(ctx.getPath(false, ["pen","id"]),ctx,"h").w("\" class=\"switchTab\"><span>").f(ctx.getPath(false, ["pen","title"]),ctx,"h").w("</span><button class=\"closeButton\"></button></li>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/user",body_0);function body_0(chk,ctx){return chk.w("<div id='").f(ctx.getPath(false, ["user","_id"]),ctx,"h").w("' class=\"user\"><div class=\"user-remove\"><div class=\"remove-choice\"><button class=\"kick\" type=\"button\" name=\"button\">Kick</button><button class=\"ban\" type=\"button\" name=\"button\">Ban</button></div></div><div class=\"user-promote\"><button class=\"promote\">Promote</button></div><img class='user-icon' src=\"/images/user.png\"><p class='user-name'>").f(ctx.getPath(false, ["user","username"]),ctx,"h").w("</p><div class='current-pen'><span>Pen:</span><div class=\"custom-select\"><select><option> Public </option>").s(ctx.get(["pens"], false),ctx,{"block":body_1},{}).w("</select></div><img id=\"preview-icon\" src=\"/images/preview.png\"></div><div class=\"difference\"><p> Match </p><div class=\"difference-percentage\"><div class=\"difference-progress\"></div></div></div><div class=\"pen-actions\"><button id=\"share-pen\" class=\"pen-loader\" type=\"button\" name=\"button\">Share</button><button id=\"load-pen\" class=\"pen-loader\" type=\"button\" name=\"button\">Load</button></div><div class=\"signal\"></div></div>");}body_0.__dustBody=!0;function body_1(chk,ctx){return chk.w("<option id=\"").f(ctx.get(["id"], false),ctx,"h").w("\"> ").f(ctx.get(["title"], false),ctx,"h").w(" </option>");}body_1.__dustBody=!0;return body_0}(dust));
