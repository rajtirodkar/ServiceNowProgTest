	/**
	 * 
	 */
	var globalUsers;
	
	function populateUsers() {
		getUserName(function(response) {
			globalUsers = response;
			console.log(response);
			// alert(globalUsers);
		});
	}
	
	function getUserName(callback) {
	
		var xmlhttp;
		if (window.XMLHttpRequest) {
			xmlhttp = new XMLHttpRequest();
		} else {
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		// var tp;
		xmlhttp.onreadystatechange = function() {
			// alert("xmlhttp.readyState"+xmlhttp.readyState);
			if (xmlhttp.readyState == 4 || xmlhttp.status == 200) {
				// alert("dsa"+xmlhttp.responseText);
				var jsondata = JSON.parse(xmlhttp.responseText); // retrieve
																	// result as an
																	// JavaScript
																	// object
	
				users = jsondata.result;
				callback(users);
	
				var output = '<form>';
				output += '<select id="user_select" onchange="userSelect()" >';
				output += '<option value="  0  ">  Select </option>';
				for (var i = 1; i < users.length; i++) {
					output += '<option value="' + i + '">' + users[i].name
							+ '</option>';
				}
				output += '</select>';
				output += '</form>';
				document.getElementById("user_name").innerHTML = output;
				// var abc = '"' + users[0].name + '"';
				// tp = output;
				// alert(abc);
	
			}
		}
		// alert(tp);
		xmlhttp.open("GET", "users.json", true);
		xmlhttp.send();
		// alert(users);
	}
	
	function userSelect() {
		// alert("In User Select" + globalUsers);
		// alert(globalUsers);
		document.getElementById("button-section").className = "notHidden";
		
		var selectBox = document.getElementById("user_select");
		var userIndex = selectBox.options[selectBox.selectedIndex].value;
		// alert(selectBox.options[selectBox.selectedIndex].innerHTML+"userIndex");
		if (userIndex != 0) {
			getUserInfo(userIndex,
					selectBox.options[selectBox.selectedIndex].innerHTML);
			show("calendar");
		} else
			show("");
	
	}
	var schedule, result1;
	function getUserInfo(i, username) {
		for (var i = 0; i < globalUsers.length; i++) {
			if (globalUsers[i].name == username) {
	
				// alert('inside');
				getUserSchedule(globalUsers[i].sys_id);
				break;
			}
	
		}
	}
	var enddates;
	var enddate;
	var startdates;
	var startdate;
	var daywiseFree;
	function getTotalHours(start_date_time, end_date_time) {
		startdates = datetimes(start_date_time);
		enddates = datetimes(end_date_time);
		startdate = new Date(startdates);
		enddate = new Date(enddates);
		// alert(startdate+" "+enddate+" ");
		return enddate.getHours() - startdate.getHours();
	}
	var sample2 = [];
	
	function testingCommon(globalUsers, users, name, type) {
		sample = [];
		sample2 = [];
		daywiseFree = [ [], [], [], [], [] ];
	
		for (var int = 0; int < globalUsers.length; int++) {
	
			var totalHours = 0;
			var completeTotalHours = 0;
			for (var j = 0; j < users.length; j++) {
				if (users[j].user.value == globalUsers[int].sys_id
						&& (users[j].name == type || users[j].type == type)) {
					totalHours += getTotalHours(users[j].start_date_time,
							users[j].end_date_time);
				}
				if (users[j].user.value == globalUsers[int].sys_id) {
	
					completeTotalHours += getTotalHours(users[j].start_date_time,
							users[j].end_date_time);
					if (enddate.getHours() <= 12)
						daywiseFree[int][startdate.getDay() - 1] = completeTotalHours;
				}
				// alert(globalUsers[int].name+" completeTotalHours
				// "+completeTotalHours);
				//
	
			}
			// alert(globalUsers[int].name+" "+completeTotalHours);
			var u = {
				"uname" : globalUsers[int].name,
				"busy" : totalHours
			};
			sample.push(u);
			var v = {
				"uname" : globalUsers[int].name,
				"busy" : completeTotalHours
			};
			sample2.push(v);
	
		}
		// alert(JSON.stringify(sample2));
		sample.sort(function(x, y) {
			return y.busy - x.busy;
		});
		sample2.sort(function(x, y) {
			return y.busy - x.busy;
		});
		// alert("alert(JSON.stringify(sample2));"+JSON.stringify(sample2));
		var output2 = "<table  align='center'><tr><td>Name</td><td>Total Busy Hours</td><td>Total Free Hours</td></tr>";
		var output = "<table align='center'><tr><td>Name</td><td>" + type + "</td></tr>";
		for (var loop = 0; loop < sample.length; loop++) {
			output += "<tr><td>" + sample[loop].uname + "</td><td>"
					+ sample[loop].busy + "</td></tr>";
			output2 += "<tr><td>" + sample2[loop].uname + "</td><td>"
					+ sample2[loop].busy + "</td><td>" + (40 - sample2[loop].busy)
					+ "</td></tr>";
		}
		output2 += "</table>";
		document.getElementById("label1").innerHTML = output2;
		return output += "</table>";
	
	}
	
	var sample = [];
	//var dave = 0;
	function getUserSchedule(userId) {
	
		var xmlhttp;
		if (window.XMLHttpRequest) {
			xmlhttp = new XMLHttpRequest();
		} else {
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		// var tp;
		xmlhttp.onreadystatechange = function() {
			// alert("xmlhttp.readyState"+xmlhttp.readyState);
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				// alert("dsa"+xmlhttp.responseText);
				var jsondata = JSON.parse(xmlhttp.responseText); // retrieve
																	// result as an
																	// JavaScript
																	// object
				// alert(userId);
				var userSchedule = jsondata.result;
				var obj = [];
				var busy = 0;
	
				var test123 = testingCommon(globalUsers, userSchedule, "name", "Task work");
				document.getElementById("label4").innerHTML = test123;
				var test124 = testingCommon(globalUsers, userSchedule, "type", "meeting");
				document.getElementById("label5").innerHTML = test124;
				for (var i = 0; i < userSchedule.length; i++) {
	
					if (userSchedule[i].user.value == userId) {
						// alert(userSchedule[i].start_date_time);
	
						var temp = userSchedule[i].start_date_time;
						// alert(temp);
						var startdates = datetimes(temp);
						var enddates = datetimes(userSchedule[i].end_date_time);
						var startdate = new Date(startdates);
						var enddate = new Date(enddates);
						busy += enddate.getHours() - startdate.getHours();
						// alert(startdate + " "+ enddate+" "+ busy);
						// alert(startdates+" "+date+" "+date.getHours());
						// alert(startdates);
						var abc = '"' + userSchedule[i].name + '" ' + startdates + ' - '
								+ enddates;
						tmp = {
							'title' : 'task',
							'description' : abc,
							datetime : new Date(startdates)
						};
	
						obj.push(tmp);
	
					}
				}
				$('#calendar').eCalendar({
					events : obj
				});
				output = "<b>The Busiest User/Users : </b>";
				var output1 = "<b>The Least Busy User/Users : </b>";
				// alert("alert(JSON.stringify(sample2));"+JSON.stringify(sample2)+
				// " "+sample2.length+" "+sample2[0].busy);
				var tempo = sample2.length - 1;
				for (var j = 0; j < sample2.length; j++) {
					if (j < sample2.length - 1
							&& sample2[j].busy == sample2[j + 1].busy) {
						if (j != 0)
							j = j + 1;
						output += " " + sample2[j].uname + ","
								+ sample2[j + 1].uname + " ";
						if (j != 0)
							j = j - 1;
	
					} else if (j == 0) {
						output += " " + sample2[j].uname;
					}
	
					if (1 < sample2.length - j
							&& sample2[sample2.length - 1].busy == sample2[sample2.length - 2].busy) {
						if (j != sample2.length)
							tempo = tempo - 1;
						output1 += " " + sample2[tempo - j].uname + ","
								+ sample2[tempo - j - 1].uname + ",";
						if (j != sample2.length)
							tempo = tempo + 1;
	
					} else if (j == 0) {
						// alert("else");
						output1 += " " + sample2[tempo - j].uname;
					}
	
				}
				// alert(output);
				output += " <br> " +  output1 ;
				document.getElementById("label2").innerHTML = output;
				// document.getElementById("label3").innerHTML = output1;
				var days = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday',
						'Thursday', 'Friday', 'Saturday' ];
				var output3 = "<table align='center'><tr><td><h3>Name</h3></td><td><h3>Monday</h3></td><td><h3>Tuesday</h3><td><h3>Wednesday</h3></td><td><h3>Thursday</h3></td><td><h3>Friday</h3></td></tr>";
				for (var loop = 0; loop < daywiseFree.length; loop++) {
					// alert(globalUsers[loop].name);
					output3 += "<tr><td>" + globalUsers[loop].name + "</td>";
					for (var j = 0; j < daywiseFree.length; j++) {
						if (daywiseFree[loop][j] == null)
							// alert(globalUsers[loop].name +"free" +days[j+1]);
							output3 += "<td> Assigned </td>";
						else
							output3 += "<td> Busy </td>";
						// output+=<tr><td>" + daywiseFree[loop][j]. +"</td><td>"
					}
					output3 += "</tr>";
				}
				output3 += "</table>";
				document.getElementById("label3").innerHTML = output3;
	
			}
		}
	
		window.show = function(elementId) {
			var elements = document.getElementsByTagName("div");
			for (var i = 0; i < elements.length; i++)
				if (elements[i].className != "notHidden")
					elements[i].className = "hidden";
	
			document.getElementById(elementId).className = "";
		}
		
		xmlhttp.open("GET", "resource_event.json", true);
		xmlhttp.send();
	}
	function datetimes(now) {
		// var now = "20170309T120000";
		var dateTime = now.split("T");
		var date = dateTime[0];
		var time = dateTime[1];
		var y = date.substr(0, 4);
		var m = date.substr(4, 2);
		var d = date.substr(6, 2);
		var h = time.substr(0, 2);
		var min = time.substr(4, 4);
		var s = time.substr(4, 6);
	
		var dateTime = y + "-" + m + "-" + d + " " + h + ":" + min + ":" + s;
		// document.write(dateTime);
		var mydate = Date.parse(dateTime);
		var result = mydate.toString('dddd MMM yyyy h:mm:ss');
		// document.write(mydate);
		// alert(now+" "+mydate);
		return mydate;
	}
