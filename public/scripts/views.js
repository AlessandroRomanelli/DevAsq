(function(dust){dust.register("index",body_0);function body_0(chk,ctx){return chk.w("<!DOCTYPE html><html><head><title>").f(ctx.get(["title"], false),ctx,"h").w("</title><link rel='stylesheet' href='/stylesheets/style.css' /></head><body class=\"off\" onload=\"init()\">").p("partials/menu",ctx,ctx,{}).w("<div id=\"home\" class=\"container\"><div class=\"header\"><div class=\"title\"><img src=\"/images/logo.png\" alt=\"DevAsq++ Logo\"><p class=\"subtitle\"> Do together. Learn together. </p></div></div><script src=\"/scripts/fetch.js\" charset=\"utf-8\"></script><div class=\"manage-rooms\">").p("partials/rooms",ctx,ctx,{}).w("</div></div><script src=\"/scripts/ace/ace.js\" charset=\"utf-8\"></script><script src=\"/scripts/ace/ext-language_tools.js\" charset=\"utf-8\"></script><script src=\"/scripts/dustjs/dust-core.min.js\" charset=\"utf-8\"></script><script src=\"/scripts/views.js\" charset=\"utf-8\"></script><script src=\"/scripts/rooms.js\" charset=\"utf-8\"></script><script src=\"/scripts/navbar.js\" charset=\"utf-8\"></script><script src=\"/scripts/main.js\" charset=\"utf-8\"></script></body></html>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/loggedUser",body_0);function body_0(chk,ctx){return chk.s(ctx.get(["loggedUser"], false),ctx,{"else":body_1,"block":body_2},{});}body_0.__dustBody=!0;function body_1(chk,ctx){return chk.w("<a id='login' href=\"/login\">Login</a>");}body_1.__dustBody=!0;function body_2(chk,ctx){return chk.w("<p> Hello, <span class='user-name'>").f(ctx.get(["username"], false),ctx,"h").w("</span>!</p><a id='logout' href=\"/logout\"> Logout </a>");}body_2.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("error",body_0);function body_0(chk,ctx){return chk.w("<!DOCTYPE html><html><head><title>").f(ctx.get(["title"], false),ctx,"h").w("</title><link rel='stylesheet' href='/stylesheets/style.css' /></head><body>").p("partials/menu",ctx,ctx,{}).w("<h1>").f(ctx.get(["message"], false),ctx,"h").w("</h1><h2>").f(ctx.getPath(false, ["error","status"]),ctx,"h").w("</h2><pre>").f(ctx.getPath(false, ["error","stack"]),ctx,"h").w("</pre></body></html>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/loginForm",body_0);function body_0(chk,ctx){return chk.w("<form id=\"loginForm\" class='profile-form'><fieldset><input id=\"login-name\" type=\"text\" name=\"username\" placeholder=\"Username\"></fieldset><fieldset><input id=\"login-password\" type=\"password\" name=\"password\" placeholder=\"Password\"></fieldset><fieldset class='submit'><input id='localLogin' type=\"submit\" value=\"Login\" disabled><p id='login-error' class='submit-error'></p><hr><input id='githubLogin' type=\"submit\" value=\"Login with GitHub\"></fieldset></form><p>You don't have an account yet?<br><a id=\"signup\" href=\"/signup\">Sign up</a> now!</p>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/menu",body_0);function body_0(chk,ctx){return chk.w("<nav class=\"menu\"><!-- content of the menu (like \"raise your hand button\" and login) --><a class=\"logo\" href=\"/\"><img src=\"/images/logo.png\" alt=\"DevAsq++ Logo\"></a><div class=\"profile\">").p("partials/loggedUser",ctx,ctx,{}).w("</div><div id=\"login-signup-modal\"class=\"login hidden\">").p("partials/loginForm",ctx,ctx,{}).w("</div></nav>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("pen",body_0);function body_0(chk,ctx){return chk.w("<!DOCTYPE html><html><head><title>").f(ctx.get(["title"], false),ctx,"h").w("</title><link rel='stylesheet' href='/stylesheets/style.css' /></head><body onload=\"init()\">").p("partials/menu",ctx,ctx,{}).w("<div id=\"room-info\"><span>Name: <span id=\"room-name\" class=\"info\"></span></span><span id=\"raise-hand\" class=\"info\">Ask for help</span><span>Participants: <span id=\"participants\" class=\"info\"></span></span></div><ul id=\"tabs\" class=\"container\"><li class=\"switchTab\">+</li></ul><div id=\"pens\" class=\"container\"><div class=\"controls\"><div class=\"pen\"><h1>HTML</h1><div id=\"htmlPen\" class=\"codePane\"></div></div><div class=\"pen\"><h1>CSS</h1><div id=\"cssPen\" class=\"codePane\"></div></div><div class=\"pen\"><h1>JS</h1><div id=\"jsPen\" class=\"codePane\"></div></div></div><div class=\"preview\"><iframe id=\"iFrame\" src=\"/preview.html\"></iframe></div></div><div id=\"room-settings\" class='hidden'>").p("partials/creator",ctx,ctx,{}).w("</div><script src=\"/scripts/ace/ace.js\" charset=\"utf-8\"></script><script src=\"/scripts/ace/ext-language_tools.js\" charset=\"utf-8\"></script><script src=\"/socket.io/socket.io.js\"></script><script src=\"/scripts/dustjs/dust-core.min.js\" charset=\"utf-8\"></script><script src=\"/scripts/views.js\" charset=\"utf-8\"></script><script src=\"/scripts/fetch.js\" charset=\"utf-8\"></script><script src=\"/scripts/parser.js\" charset=\"utf-8\"></script>").x(ctx.get(["room"], false),ctx,{"block":body_1},{}).w("<script src=\"/scripts/app.js\" charset=\"utf-8\"></script><script src=\"/scripts/navbar.js\" charset=\"utf-8\"></script><script src=\"/scripts/pen.js\" charset=\"utf-8\"></script></body></html>");}body_0.__dustBody=!0;function body_1(chk,ctx){return chk.w("<script type=\"text/javascript\">const room = ").f(ctx.get(["room"], false),ctx,"h",["s"]).w(";const user = ").f(ctx.get(["user"], false),ctx,"h",["s"]).w(";// localStorage.room = JSON.stringify(r); // eliminate ?// localStorage.user = JSON.stringify(u); // eliminate ?</script>");}body_1.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/rooms",body_0);function body_0(chk,ctx){return chk.w("<div class=\"form-container\"><h1>New Room</h1><form id='createRoom' method=\"POST\" autocomplete=\"off\"><fieldset><input type=\"text\" name=\"roomName\" placeholder=\"Room Name\" autocomplete=\"false\"></fieldset><fieldset><input type=\"password\" name=\"password\" placeholder=\"Password (Optional)\" autocomplete=\"false\"></fieldset><fieldset class=\"submit\"><input type=\"submit\" value=\"Create\"></fieldset><input autocomplete=\"false\" name=\"hidden\" type=\"text\" style=\"display:none;\"></form></div><div class=\"separator\"></div><div class=\"form-container\"><h1>Join Room</h1><form id='joinRoom' method=\"POST\" autocomplete=\"off\"><fieldset><input type=\"text\" name=\"roomName\" placeholder=\"Room Name\" autocomplete=\"false\"></fieldset><fieldset><input type=\"password\" name=\"password\" placeholder=\"Password (Optional)\" autocomplete=\"false\"></fieldset><fieldset class=\"submit\"><input type=\"submit\" value=\"Join\"></fieldset><input autocomplete=\"false\" name=\"hidden\" type=\"text\" style=\"display:none;\"></form></div>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/signupForm",body_0);function body_0(chk,ctx){return chk.w("<form id=\"signupForm\" class='profile-form'><fieldset><input id='signup-name' type=\"text\" name=\"username\" placeholder=\"Username\"></fieldset><fieldset><input id='signup-password' type=\"password\" name=\"password\" placeholder=\"Password\"></fieldset><fieldset><input id='signup-password-confirm' type=\"password\" name=\"confirmPassword\" placeholder=\"Confirm Password\"></fieldset><fieldset class='submit'><input id='signup-submit' type=\"submit\" value=\"Signup\" disabled></fieldset></form><p>Back to <a id=\"loginButton\" href=\"/login\">Login</a></p>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/creator",body_0);function body_0(chk,ctx){return chk.w("<div class=\"toggler\"><img src=\"/images/chevron.png\" alt=\"\"><span></span><img src=\"/images/chevron.png\" alt=\"\"></div><h1>Room Participants</h1><hr><div id=\"users\">").s(ctx.get(["users"], false),ctx,{"block":body_1},{}).w("</div>");}body_0.__dustBody=!0;function body_1(chk,ctx){return chk.p("partials/user",ctx,ctx,{});}body_1.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/tab",body_0);function body_0(chk,ctx){return chk.w("<li id=\"").f(ctx.getPath(false, ["pen","id"]),ctx,"h").w("\" class=\"switchTab\"><span>").f(ctx.getPath(false, ["pen","title"]),ctx,"h").w("</span><button class=\"closeButton\">x</button></li>");}body_0.__dustBody=!0;return body_0}(dust));
(function(dust){dust.register("partials\/user",body_0);function body_0(chk,ctx){return chk.w("<div id='").f(ctx.getPath(false, ["user","_id"]),ctx,"h").w("' class=\"user\"><img class='user-icon' src=\"/images/user.png\"><p class='user-name'>").f(ctx.getPath(false, ["user","username"]),ctx,"h").w("</p><div>Active Pen: <span class='user-current-pen'>").f(ctx.getPath(false, ["currentPen","title"]),ctx,"h").w("</span></div><button class=\"pen-loader\" type=\"button\" name=\"button\">Load Pen</button><div class=\"signal\"></div></div>");}body_0.__dustBody=!0;return body_0}(dust));
