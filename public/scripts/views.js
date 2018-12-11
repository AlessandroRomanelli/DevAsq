(function(dust){dust.register("error",body_0);function body_0(chk,ctx){return chk.w("<!DOCTYPE html><html><head><title>").f(ctx.get(["title"], false),ctx,"h").w("</title><link rel='stylesheet' href='/stylesheets/style.css' /></head><body>").p("partials/menu",ctx,ctx,{}).w("<h1>").f(ctx.get(["message"], false),ctx,"h").w("</h1><h2>").f(ctx.getPath(false, ["error","status"]),ctx,"h").w("</h2><pre>").f(ctx.getPath(false, ["error","stack"]),ctx,"h").w("</pre></body></html>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("index",body_0);function body_0(chk,ctx){return chk.w("<!DOCTYPE html><html><head><title>").f(ctx.get(["title"], false),ctx,"h").w("</title><link rel='stylesheet' href='/stylesheets/style.css' /></head><body class=\"off\" onload=\"init()\">").p("partials/menu",ctx,ctx,{}).w("<div id=\"home\" class=\"container\"><div class=\"header\"><div class=\"title\"><img src=\"/images/logo.png\" alt=\"DevAsq++ Logo\"><p class=\"subtitle\"> Do together. Learn together. </p></div></div><script src=\"/scripts/fetch.js\" charset=\"utf-8\"></script><div class=\"manage-rooms\">").p("partials/rooms",ctx,ctx,{}).w("</div>").p("partials/roomExplorer",ctx,ctx,{}).w("</div><footer class=\"index_footer\"><p>2018 &copy; All rights reserved to DevAsq++</p></footer><script src=\"/scripts/dustjs/dust-core.min.js\" charset=\"utf-8\"></script><script src=\"/socket.io/socket.io.js\"></script><script src=\"/scripts/socket.js\" charset=\"utf-8\"></script><script src=\"/scripts/ace/ace.js\" charset=\"utf-8\"></script><script src=\"/scripts/ace/ext-language_tools.js\" charset=\"utf-8\"></script><script src=\"/scripts/views.js\" charset=\"utf-8\"></script><script src=\"/scripts/navbar.js\" charset=\"utf-8\"></script><script src=\"/scripts/rooms.js\" charset=\"utf-8\"></script><script src=\"/scripts/main.js\" charset=\"utf-8\"></script></body></html>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("pen",body_0);function body_0(chk,ctx){return chk.w("<!DOCTYPE html><html><head><title>").f(ctx.get(["title"], false),ctx,"h").w("</title><link rel='stylesheet' href='/stylesheets/style.css' /></head><body onload=\"init()\">").p("partials/menu",ctx,ctx,{}).w("<div id=\"room-info\"><span>Name: <span id=\"room-name\" class=\"info\"></span></span><span id=\"raise-hand\" class=\"info\">Ask for help</span><span>Participants: <span id=\"participants\" class=\"info\"></span></span><span id=\"share-public\" data-encoded-options=\"7\">Share <button id='share-toggler'>▼</button><div id=\"share-options\"><div class=\"option-container\"><span>ALL</span><label class=\"switch\" for=\"all\"><input type=\"checkbox\" name=\"all\" checked><span class=\"slider\"></span></label></div><div class=\"option-container\"><span>HTML</span><label class=\"switch\" for=\"html\"><input type=\"checkbox\" name=\"html\" checked><span class=\"slider\"></span></label></div><div class=\"option-container\"><span>CSS</span><label class=\"switch\" for=\"css\"><input type=\"checkbox\" name=\"css\" checked><span class=\"slider\"></span></label></div><div class=\"option-container\"><span>JS</span><label class=\"switch\" for=\"js\"><input type=\"checkbox\" name=\"js\" checked><span class=\"slider\"></span></label></div></div></span></div><ul id=\"tabs\" class=\"container\"><li id='newTab' class=\"switchTab\"><img src=\"/images/plus.png\"></li></ul><div id=\"pens\" class=\"container\"><div class=\"controls\"><div class=\"pen\"><h1>HTML</h1><div id=\"htmlPen\" class=\"codePane\"></div></div><div class=\"pen\"><h1>CSS</h1><div id=\"cssPen\" class=\"codePane\"></div></div><div class=\"pen\"><h1>JS</h1><div id=\"jsPen\" class=\"codePane\"></div></div></div><div class=\"preview\"><iframe id=\"iFrame\" src=\"/preview.html\"></iframe></div></div><div id=\"room-settings\" class='hidden'>").p("partials/creator",ctx,ctx,{}).w("</div><div id=\"confirm-modal\" class=\"modal hidden\"><div class=\"container\"><p>Are you really sure you want to do this?</p><div class=\"choice-buttons\"><button class=\"cancel\" type=\"button\" name=\"button\">Cancel</button><button class=\"confirm\" type=\"button\" name=\"button\">Confirm</button></div></div></div><div id='preview-modal' class=\"modal hidden\"><div class=\"container\"><div id=\"close-modal\"></div><iframe id='preview-iframe'></iframe><div id='preview-loaders' class=\"\"><button id='modal-share' type=\"button\" name=\"button\">Share pen</button><button id='modal-load' type=\"button\" name=\"button\">Load pen</button></div></div></div><script src=\"/socket.io/socket.io.js\"></script><script src=\"/scripts/ace/ace.js\" charset=\"utf-8\"></script><script src=\"/scripts/ace/ext-language_tools.js\" charset=\"utf-8\"></script><script src=\"/scripts/dustjs/dust-core.min.js\" charset=\"utf-8\"></script><script src=\"/scripts/views.js\" charset=\"utf-8\"></script><script src=\"/scripts/fetch.js\" charset=\"utf-8\"></script><script src=\"/scripts/parser.js\" charset=\"utf-8\"></script>").x(ctx.get(["room"], false),ctx,{"block":body_1},{}).w("<script src=\"/scripts/app.js\" charset=\"utf-8\"></script><script src=\"/scripts/navbar.js\" charset=\"utf-8\"></script><script src=\"/scripts/pen.js\" charset=\"utf-8\"></script></body></html>");}body_0.__dustBody=!0;function body_1(chk,ctx){return chk.w("<script type=\"text/javascript\">const room = ").f(ctx.get(["room"], false),ctx,"h",["s"]).w(";const user = ").f(ctx.get(["user"], false),ctx,"h",["s"]).w(";// localStorage.room = JSON.stringify(r); // eliminate ?// localStorage.user = JSON.stringify(u); // eliminate ?</script>");}body_1.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/loggedUser",body_0);function body_0(chk,ctx){return chk.s(ctx.get(["loggedUser"], false),ctx,{"else":body_1,"block":body_2},{});}body_0.__dustBody=!0;function body_1(chk,ctx){return chk.w("<a id='login' href=\"/login\">Login</a>");}body_1.__dustBody=!0;function body_2(chk,ctx){return chk.w("<p> Hello, <span class='user-name'>").f(ctx.get(["username"], false),ctx,"h").w("</span>!</p><a id='logout' href=\"/logout\"> Logout </a>");}body_2.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/creator",body_0);function body_0(chk,ctx){return chk.w("<div class=\"toggler\"><img src=\"/images/chevron.png\" alt=\"\"><span></span><img src=\"/images/chevron.png\" alt=\"\"></div><h1>Room Participants</h1><hr><div id=\"users\">").s(ctx.get(["users"], false),ctx,{"block":body_1},{}).w("</div>");}body_0.__dustBody=!0;function body_1(chk,ctx){return chk.p("partials/user",ctx,ctx,{});}body_1.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/loginForm",body_0);function body_0(chk,ctx){return chk.w("<form id=\"loginForm\" class='profile-form'><fieldset><input id=\"login-name\" type=\"text\" name=\"username\" placeholder=\"Username\"></fieldset><fieldset><input id=\"login-password\" type=\"password\" name=\"password\" placeholder=\"Password\"></fieldset><fieldset class='submit'><input id='localLogin' type=\"submit\" value=\"Login\"><p id='login-error' class='submit-error'></p><hr><input id='githubLogin' type=\"submit\" value=\"Login with GitHub\"></fieldset></form><p>You don't have an account yet?<br><a id=\"signup\" href=\"/signup\">Sign up</a> now!</p>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/menu",body_0);function body_0(chk,ctx){return chk.w("<nav class=\"menu\"><!-- content of the menu (like \"raise your hand button\" and login) --><a class=\"logo\" href=\"/\"><img src=\"/images/logo.png\" alt=\"DevAsq++ Logo\"></a><div class=\"profile\">").p("partials/loggedUser",ctx,ctx,{}).w("</div><div id=\"login-signup-modal\"class=\"login hidden\">").p("partials/loginForm",ctx,ctx,{}).w("</div></nav>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/room",body_0);function body_0(chk,ctx){return chk.w("<tr id=\"room_").f(ctx.get(["name"], false),ctx,"h").w("\" data-name=\"").f(ctx.get(["name"], false),ctx,"h").w("\"><td>").f(ctx.get(["name"], false),ctx,"h").w("</td><td>").f(ctx.get(["users"], false),ctx,"h").w("</td><td><input type=\"password\" class=\"passworded\" placeholder=\"Optional\"></td><td><a href=\"\">Join</a></td></tr>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/roomExplorer",body_0);function body_0(chk,ctx){return chk.w("<div id='room-browser'><h1 id=\"room-browser-title\" class=\"hidden\"> Room Browser</h1><table id=\"roomTable\" class=\"hidden\"><tr><th> Name <span id=\"name-sort\" class=\"sort-by active\">▼</span></th><th> <img src=\"/images/user.png\" width=\"15\" height=\"15\" alt=\"\"><span id=\"pop-sort\" class=\"sort-by\">▼</span></th><th> Password </th><th>  </th></tr></table></div>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/signupForm",body_0);function body_0(chk,ctx){return chk.w("<form id=\"signupForm\" class='profile-form'><fieldset><input id='signup-name' type=\"text\" name=\"username\" placeholder=\"Username\"></fieldset><fieldset><input id='signup-password' type=\"password\" name=\"password\" placeholder=\"Password\"></fieldset><fieldset><input id='signup-password-confirm' type=\"password\" name=\"confirmPassword\" placeholder=\"Confirm Password\"></fieldset><fieldset class='submit'><input id='signup-submit' type=\"submit\" value=\"Signup\" disabled></fieldset></form><p>Back to <a id=\"loginButton\" href=\"/login\">Login</a></p>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/rooms",body_0);function body_0(chk,ctx){return chk.w("<div class=\"form-container\"><h1>New Room</h1><div id='createRoom' class='form'><fieldset><input type=\"text\" name=\"roomName\" placeholder=\"Room Name\"></fieldset><fieldset><input type=\"password\" name=\"password\" placeholder=\"Password (Optional)\"></fieldset><fieldset class=\"submit\"><input id='createRoomButton' type=\"submit\" value=\"Create\"></fieldset></div></div><div class=\"separator\"></div><div class=\"form-container\"><h1>Join Room</h1><div id='joinRoom' class='form'><fieldset><input type=\"text\" name=\"roomName\" placeholder=\"Room Name\"></fieldset><fieldset><input type=\"password\" name=\"password\" placeholder=\"Password (Optional)\"></fieldset><fieldset class=\"submit\"><input id='joinRoomButton' type=\"submit\" value=\"Join\"></fieldset></div></div>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/tab",body_0);function body_0(chk,ctx){return chk.w("<li id=\"").f(ctx.getPath(false, ["pen","id"]),ctx,"h").w("\" class=\"switchTab\"><span>").f(ctx.getPath(false, ["pen","title"]),ctx,"h").w("</span><button class=\"closeButton\"></button></li>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/user",body_0);function body_0(chk,ctx){return chk.w("<div id='").f(ctx.getPath(false, ["user","_id"]),ctx,"h").w("' class=\"user\"><div class=\"user-remove open\"><div class=\"remove-choice\"><button class=\"kick\" type=\"button\" name=\"button\">Kick</button><button class=\"ban\" type=\"button\" name=\"button\">Ban</button></div></div><img class='user-icon' src=\"/images/user.png\"><p class='user-name'>").f(ctx.getPath(false, ["user","username"]),ctx,"h").w("</p><div class='current-pen'><span>Pen:</span><span class='user-current-pen'>").f(ctx.getPath(false, ["currentPen","title"]),ctx,"h").w("</span><img id=\"preview-icon\" src=\"/images/preview.png\"></div><div class=\"pen-actions\"><button id=\"share-pen\" class=\"pen-loader\" type=\"button\" name=\"button\">Share</button><button id=\"load-pen\" class=\"pen-loader\" type=\"button\" name=\"button\">Load</button></div><div class=\"signal\"></div></div>");}body_0.__dustBody=!0;return body_0}(dust));
