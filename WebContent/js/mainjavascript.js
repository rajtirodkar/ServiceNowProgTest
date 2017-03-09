/**
 * 
 */
var globalUsers;
var enddates;
var enddate;
var startdates;
var startdate;
var daywiseFree;
var globalUsersCompleteTotalHoursArr = [];
var globalUsersTotalHoursArr = [];

function populateUsers() {
    getUserName(function(response) {
        globalUsers = response;
    });
}

/*
 * Reads the first JSON file and retrieve all the Users' names and fills the form with the data
 */
function getUserName(callback) {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 || xmlhttp.status == 200) {
            // retrieve result as a JavaScript object
            var jsondata = JSON.parse(xmlhttp.responseText);

            users = jsondata.result;
            callback(users);

            var output = '<form>';
            output += '<select id="user_select" onchange="userSelect()" >';
            output += '<option value="  0  ">  Select </option>';
            for (var i = 1; i < users.length; i++) {
                output += '<option value="' + i + '">' + users[i].name +
                    '</option>';
            }
            output += '</select>';
            output += '</form>';
            //load the form in the HTML div tag with id="user_name"            
            document.getElementById("user_name").innerHTML = output;
        }
    }
    xmlhttp.open("GET", "users.json", true);
    xmlhttp.send();
}

/*
 * Will be called onchange of user in the form
 * passes the selected user to getUserInfo() 
 */
function userSelect() {
    //Unhide the Task buttons in the HTML page when a user is selected
    document.getElementById("button-section").className = "notHidden";

    var selectBox = document.getElementById("user_select");
    var userIndex = selectBox.options[selectBox.selectedIndex].value;
    if (userIndex != 0) {
        getUserInfo(userIndex,
            selectBox.options[selectBox.selectedIndex].innerHTML);
        //unhide the calender for the selected user
        show("calendar");
    } else
        show("");
}

/*
 * takes the UserIndex and the Value of the user selected in the form
 * finds its sys_id and passes it getUserSchedule()
 */
function getUserInfo(i, username) {
    for (var i = 0; i < globalUsers.length; i++) {
        if (globalUsers[i].name == username) {
            getUserSchedule(globalUsers[i].sys_id);
            break;
        }
    }
}
/*
 * Takes the user's sys_id as input
 * Reads the second JSON file which contains all the event data
 * Calculates tasks 3, 4, 5  
 */
function getUserSchedule(userId) {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var jsondata = JSON.parse(xmlhttp.responseText); // retrieve result as an JavaScript object
            var userSchedule = jsondata.result;
            var calendarObjArr = [];
            var busy = 0;
            //calculate total hours for Task Work 
            var taskWorkHoursTable = calculateVariousHours(globalUsers,
                userSchedule, "name", "Task work");
            document.getElementById("task4").innerHTML = taskWorkHoursTable;
            //calculate total hours for meeting
            var meetingHoursTable = calculateVariousHours(globalUsers,
                userSchedule, "type", "meeting");
            document.getElementById("task5").innerHTML = meetingHoursTable;

            for (var i = 0; i < userSchedule.length; i++) {
                if (userSchedule[i].user.value == userId) {
                    //below lines of code converts the time format in the JSON format to a JavaScript readable format
                    var temp = userSchedule[i].start_date_time;
                    startdates = datetimes(temp);
                    enddates = datetimes(userSchedule[i].end_date_time);
                    startdate = new Date(startdates);
                    enddate = new Date(enddates);
                    busy += enddate.getHours() - startdate.getHours();
                    var descript = '"' + userSchedule[i].name + '" ' +
                        startdates + ' - ' + enddates;
                    //object for Calendar
                    var calendarObject = {
                        'title': 'task',
                        'description': descript,
                        datetime: new Date(startdates)
                    };
                    //push the oject in the events array of Calendar
                    calendarObjArr.push(calendarObject);
                }
            }
            //third-party jQuery Calendar named eCalendar
            $('#calendar').eCalendar({
                events: calendarObjArr
            });

            output = "<b>The Busiest User/Users : </b>";
            var output1 = "<b>The Least Busy User/Users : </b>";
            var temporary = globalUsersCompleteTotalHoursArr.length - 1;
            /*
             * Finds the busiest and least busy users for task 2
             */
            for (var j = 0; j < globalUsersCompleteTotalHoursArr.length; j++) {
                if (j < globalUsersCompleteTotalHoursArr.length - 1 &&
                    globalUsersCompleteTotalHoursArr[j].busy == globalUsersCompleteTotalHoursArr[j + 1].busy) {
                    if (j != 0)
                        j = j + 1;
                    output += " " + globalUsersCompleteTotalHoursArr[j].uname +
                        "," +
                        globalUsersCompleteTotalHoursArr[j + 1].uname +
                        " ";
                    if (j != 0)
                        j = j - 1;

                } else if (j == 0) {
                    output += " " + globalUsersCompleteTotalHoursArr[j].uname;
                }

                if (1 < globalUsersCompleteTotalHoursArr.length - j &&
                    globalUsersCompleteTotalHoursArr[globalUsersCompleteTotalHoursArr.length - 1].busy == globalUsersCompleteTotalHoursArr[globalUsersCompleteTotalHoursArr.length - 2].busy) {
                    if (j != globalUsersCompleteTotalHoursArr.length)
                        temporary = temporary - 1;
                    output1 += " " +
                        globalUsersCompleteTotalHoursArr[temporary - j].uname +
                        "," +
                        globalUsersCompleteTotalHoursArr[temporary - j -
                            1].uname + ",";
                    if (j != globalUsersCompleteTotalHoursArr.length)
                        temporary = temporary + 1;

                } else if (j == 0) {
                    output1 += " " +
                        globalUsersCompleteTotalHoursArr[temporary - j].uname;
                }

            }
            output += " <br> " + output1;
            document.getElementById("task2").innerHTML = output;
            //Array of all days to print the grid for task 3
            var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
                'Thursday', 'Friday', 'Saturday'
            ];
            var output3 = "<table align='center'><tr><td><h3>Name</h3></td><td><h3>Monday</h3></td><td><h3>Tuesday</h3><td><h3>Wednesday</h3></td><td><h3>Thursday</h3></td><td><h3>Friday</h3></td></tr>";
            /*
             * Prints the table for task 3 which assigns a recurring task of 1hr to all available users for each day
             */
            for (var loop = 0; loop < daywiseFree.length; loop++) {
                output3 += "<tr><td>" + globalUsers[loop].name + "</td>";
                for (var j = 0; j < daywiseFree.length; j++) {
                    if (daywiseFree[loop][j] == null)
                        output3 += "<td> Assigned </td>";
                    else
                        output3 += "<td> Busy </td>";
                }
                output3 += "</tr>";
            }
            output3 += "</table>";
            document.getElementById("task3").innerHTML = output3;

        }
    }

    xmlhttp.open("GET", "resource_event.json", true);
    xmlhttp.send();
}
/*
 * Calculates the vaiours hours for each user depending on type of task eg. if it's Meeting or Task Work or Total Work
 * depending on the inputs
 */
function calculateVariousHours(globalUsers, users, name, type) {
    globalUsersTotalHoursArr = [];
    globalUsersCompleteTotalHoursArr = [];
    //two-dimensional array for the calculations in task 3
    daywiseFree = [
        [],
        [],
        [],
        [],
        []
    ];
    for (var int = 0; int < globalUsers.length; int++) {
        var totalHours = 0;
        var completeTotalHours = 0;
        /*
         * Calculates total hours if type is meeting or name is Task Work or both
         */
        for (var j = 0; j < users.length; j++) {
            if (users[j].user.value == globalUsers[int].sys_id &&
                (users[j].name == type || users[j].type == type)) {
                totalHours += getTotalHours(users[j].start_date_time,
                    users[j].end_date_time);
            }
            if (users[j].user.value == globalUsers[int].sys_id) {

                completeTotalHours += getTotalHours(users[j].start_date_time,
                    users[j].end_date_time);
                //to check if the end time is before 12am as required for task 3
                if (enddate.getHours() <= 12)
                    daywiseFree[int][startdate.getDay() - 1] = completeTotalHours;
            }
        }
        //object contains names and corresponding hours for Meeting or Task Work
        var u = {
            "uname": globalUsers[int].name,
            "busy": totalHours
        };
        //push the object inside the array
        globalUsersTotalHoursArr.push(u);
        //object contains names and corresponding total hours inlcuding Meeting, Task Work and Project Work
        var v = {
            "uname": globalUsers[int].name,
            "busy": completeTotalHours
        };
        //push the object inside the array
        globalUsersCompleteTotalHoursArr.push(v);

    }
    //sort the arrays in descending order as required in Task 4 & Task 5
    globalUsersTotalHoursArr.sort(function(x, y) {
        return y.busy - x.busy;
    });
    globalUsersCompleteTotalHoursArr.sort(function(x, y) {
        return y.busy - x.busy;
    });
    //Create the Tables for displaying Task 4 & Task 5
    var output2 = "<table  align='center'><tr><td>Name</td><td>Total Busy Hours</td><td>Total Free Hours</td></tr>";
    var output = "<table align='center'><tr><td>Name</td><td>" + type +
        "</td></tr>";
    for (var loop = 0; loop < globalUsersTotalHoursArr.length; loop++) {
        output += "<tr><td>" + globalUsersTotalHoursArr[loop].uname +
            "</td><td>" + globalUsersTotalHoursArr[loop].busy +
            "</td></tr>";
        output2 += "<tr><td>" + globalUsersCompleteTotalHoursArr[loop].uname +
            "</td><td>" + globalUsersCompleteTotalHoursArr[loop].busy +
            "</td><td>" +
            (40 - globalUsersCompleteTotalHoursArr[loop].busy) +
            "</td></tr>";
    }
    output2 += "</table>";
    document.getElementById("task1").innerHTML = output2;
    return output += "</table>";
}
/*
 * Takes the start time and end time of a task as input
 * Converts it into Javascript readable time format
 * and returns the difference between end time and start time
 * i.e. the time taken for the task
 */
function getTotalHours(start_date_time, end_date_time) {
    startdates = datetimes(start_date_time);
    enddates = datetimes(end_date_time);
    startdate = new Date(startdates);
    enddate = new Date(enddates);
    return enddate.getHours() - startdate.getHours();
}
/*
 * toggle between hide/show div, buttons, etc on the output page 
 */
window.show = function(elementId) {
        var elements = document.getElementsByTagName("div");
        for (var i = 0; i < elements.length; i++)
            if (elements[i].className != "notHidden")
                elements[i].className = "hidden";

        document.getElementById(elementId).className = "";
    }
    /*
     * Takes input of start time and end time of a task in the time format specified in the JSON file
     * Extracts the year,month,date & hours,minutes,seconds for the task
     * and returns a readable time format using Datejs
     */
function datetimes(now) {
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
    var mydate = Date.parse(dateTime);
    var result = mydate.toString('dddd MMM yyyy h:mm:ss');
    return mydate;
}