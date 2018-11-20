var http = require('http');

//number of client requests pending
var count = 0;

//total number of client requests received
var n_req = 0;

//total number of server responses sent
var n_res = 0;

//return a timestamp and some information about the request
function log(request) {
	var date = new Date();

	var hour = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var milliseconds = date.getMilliseconds();

	return '[' +
               ((hour < 10) ? '0' + hour: hour) +
               ':' +
               ((minutes < 10) ? '0' + minutes: minutes) +
               ':' +
               ((seconds < 10) ? '0' + seconds: seconds) +
               '.' +
               ('00' + milliseconds).slice(-3) +
               '] ' +
               request.method + " " + request.url + " " + request.connection.remoteAddress;
               ;
}

function renderHTML(req,msg) {
	return `<html><head><title>${count} ${req} ${n_req} ${n_res}</title></head><body>${count} ${req} ${n_req} ${n_res}<br>${msg}</body></html>`
}

function renderHTMLrefresh(req,msg) {
	return `<html><head><title>${count} ${req} ${n_req} ${n_res}</title><meta http-equiv='refresh' content='1'/></head><body>${count} ${req} ${n_req} ${n_res}<br>${msg}</body></html>`
}

//busy loop to wait a number of ms.
//never use in production as it will block the whole server
function wait(ms) {
	const then = Date.now();
	while (true) {
		let now = Date.now();
		if (now - then > ms)
			return;
	}
}

function onrequest(request, response) {
  count++; //client has arrived
  n_req++; //new request
  var req = n_req; //this request

  console.log(count + " " + req + " " + n_req + " " + n_res + " -> " + log(request)); //log request received
  //setTimeout(()=>{
  //process.nextTick(()=>{

  		wait(500);

  		response.writeHead(200);
   		response.write(renderHTML(req,log(request)));
  		response.end();

  		n_res++; //new response

  		var err = "";
 		if (n_req != req) {
  			err = " !Concurrent client detected!";
  		}

		console.log(count + " " + req + " " + n_req + " " + n_res + " <- " + log(request) + err); //log response sent

  		count--; //client has left
  	//});   //process.nextTick()
	//},500); //setTimeout
}

var server = http.createServer(onrequest).listen(8000);
console.log("Listening on http://127.0.0.1:8000/");
