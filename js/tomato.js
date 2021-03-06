/*******************************
 *   Simple pomodoro timer app *
 *   by Tomasz Straszewski     *
 ******************************/

'use strict';

//global object
var TOMATO = {};

/*************************************************************
/* some app scope variables, constants and utility functions *
**************************************************************/
TOMATO.REFRESH_RATE = 200;                   //refresh rate for rendering (interval function timeout)
TOMATO.DEFAULT_BREAK_LENGTH = 300000;        //in milisec
TOMATO.DEFAULT_SESSION_LENGTH = 1800000;     //in milisec  
TOMATO.DEFAULT_STEP_VALUE = 60000;          //in milisec
TOMATO.MAX_TIME = 3600000;                   //in milisec
TOMATO.TITLE_WORK = 'session';                     //name for work session
TOMATO.TITLE_BREAK = 'break';                      //name for break session
TOMATO.currentSession = TOMATO.TITLE_WORK;         // keep track if counting-down work or break time
TOMATO.utility = {};                         //container for utility functions (shared functions)


TOMATO.utility._padStart = function(len,strToPad,str){
    var i,
        strPadded;

    strPadded = strToPad.split('');
    if(strPadded.length === 1){
        for(i = 1; i < len; i++){
            strPadded.unshift(str);
        }
    }
    strPadded = strPadded.join('');
    return strPadded;
}
// converts miliseconds to - minutes, seconds, milisecond
TOMATO.utility._formatTime = function(milisec){
    const MILISEC_IN_SEC = 1000,
              SEC_IN_MIN = 60;

    var tempMin,
        tempSec,
        tempMilisec,
        strMin,
        strSec,
        strMilisec;

    tempMin = Math.floor(milisec / MILISEC_IN_SEC / SEC_IN_MIN);
    tempSec = Math.floor(milisec / MILISEC_IN_SEC % SEC_IN_MIN);
    tempMilisec = (milisec % MILISEC_IN_SEC);

    strMin = tempMin.toString(10);
    strSec = tempSec.toString(10);
    strMilisec = tempMilisec.toString(10);

    //padStart is ECMA scritp 2017 - beaware of compatibility 
    //strMin = strMin.padStart(2,'0');
    //strSec = strSec.padStart(2,'0');
    //strMilisec = strMilisec.padStart(3,'0');

    //my own padStart function used here for compatibility
    strMin = TOMATO.utility._padStart(2,strMin,'0');
    strSec = TOMATO.utility._padStart(2,strSec,'0');
    strMilisec = TOMATO.utility._padStart(3,strMilisec,'0');
    return {
        minutes : strMin,
        seconds : strSec,
        milisec : strMilisec
    }
}

TOMATO.utility._convertToSec = function(milisec){
    const MILISEC_IN_SEC = 1000;
    var seconds;

    seconds = milisec / MILISEC_IN_SEC;
    return seconds;
}


/****************************************
/* object responsible for tracking time *
/* (count-down timer)                   *
*****************************************/
TOMATO.timer = (function() {

    var _sessionLength = TOMATO.DEFAULT_SESSION_LENGTH,  //stores length of the session 
        _startTime     = -1,                      //stores start time of the session (-1 means session paused)
        _currentTime   = 0,                       //stores remaining (updated) time 
        _title = TOMATO.TITLE_WORK,
        //returns elapsed time from start till now
        _deltaT = function deltaT(){   
            if(_startTime === -1){
                return 0;
            }
            return (Date.now() - _startTime);
        },
        //return current count-down time (in miliseconds)
        _getTime = function getTime(){
            _currentTime = _sessionLength - _deltaT();
            return _currentTime;
        };


    //start count-down
    function start(){
        if(_startTime === -1){
            _startTime = Date.now();
        }
    }

    //pause clock and store time left (updated session length)
    function pause(){
        _sessionLength = _sessionLength - _deltaT();
        _startTime = -1;
    }

    function setSessionLength(milisec){
        _sessionLength = milisec;
    }

    //get time in milisec
    function getMilisecTime(){
        return _getTime();
    }
    //get formated time - returns object 
    function getFormatedTime(){
        var tempTime;

        tempTime = _getTime();
        return TOMATO.utility._formatTime(tempTime);
    } 

    function reset(sessionLen){
        _title = TOMATO.TITLE_WORK;
        pause()
        setSessionLength(sessionLen);
    }

    function getTitle(){
        return _title;
    }

    function setTitle(title){
        _title = title;
    }

    return {
        start : start,
        pause : pause,
        reset : reset,
        getFormatedTime : getFormatedTime,
        setSessionLength : setSessionLength,
        getMilisecTime : getMilisecTime,
        getTitle : getTitle,
        setTitle : setTitle
    }
})();

/***********************************
 * object responsible for updating *   
 * analog (visible circle) timer   *
 * ********************************/
TOMATO.analogTimer = (function(){
    var _animLength = TOMATO.DEFAULT_SESSION_LENGTH;

    function reset(milisec){
        var analog,
            timeSec;

        setLength(milisec);

        analog = $('.analog');
        timeSec = TOMATO.utility._convertToSec(milisec);
        console.log(timeSec);
        console.log(_animLength);

        //reset css animation
        analog.css('animation','none');
        setTimeout(function(){
            analog.css('animation','countdown '+timeSec+'s linear infinite forwards');
            analog.css('animation-play-state', 'paused');
        },10);
        

    }

    function start(){
        $('.analog').css('animation-play-state', 'none');
        setTimeout(function(){
        $('.analog').css('animation-play-state', 'running');
        },10);
    }

    function pause(){
        $('.analog').css('animation-play-state', 'paused');
    }
    
    function setLength(time){
        _animLength = time;
    }

    return {
        reset : reset,
        start : start,
        pause : pause,
        setLength : setLength
    }
})();
/*************************************
 *  Session constructor              *
 *  stores session length            * 
 *  can increase and decrease Length *
 * ***********************************/
TOMATO.Session = function(sessionLength){
    var _sessionLength = sessionLength;
    
    this.increase = function(){
        _sessionLength = _sessionLength + TOMATO.DEFAULT_STEP_VALUE;
        if(_sessionLength >= TOMATO.MAX_TIME){
            _sessionLength = TOMATO.MAX_TIME;
        }
    }

    this.decrease = function(){
        _sessionLength = _sessionLength - TOMATO.DEFAULT_STEP_VALUE;
        if(_sessionLength < TOMATO.DEFAULT_STEP_VALUE ){ 
            _sessionLength = TOMATO.DEFAULT_STEP_VALUE;
        }
    }

    this.getSessionLength = function(){
        return _sessionLength;
    }

    this.getFormatedTime = function(){
        return TOMATO.utility._formatTime(_sessionLength);
    }
};

/************************************
 * objects responsible for tracking *
 * break and work session time      *
 ************************************/
TOMATO.break = new TOMATO.Session(TOMATO.DEFAULT_BREAK_LENGTH);
TOMATO.work  = new TOMATO.Session(TOMATO.DEFAULT_SESSION_LENGTH);

/*****************************
 *  render function          *
 *  responsible for updating *
 *  everything on screen     *
 ****************************/
TOMATO.render = function(){
    var countDown,
        workTime,
        breakTime;
    
    countDown = TOMATO.timer.getFormatedTime();
    $('#display-timer').val(countDown.minutes+':'+countDown.seconds);
    //$('#display-milisec').val(countDown.milisec);

    breakTime = TOMATO.break.getFormatedTime();
    $('#display-break').val(breakTime.minutes);

    workTime = TOMATO.work.getFormatedTime();
    $('#display-work').val(workTime.minutes);

    $('#session-title').html(TOMATO.timer.getTitle());

}

/*****************************
 *  TOMATO APP logic here    *
 ****************************/
TOMATO.handler = function(){
    var countdown,
        SessionLen,
        title,
        alarm;

    //swap between work or break 
    countdown = TOMATO.timer.getMilisecTime();
    if(countdown <= 0){
        if( TOMATO.currentSession === TOMATO.TITLE_WORK ){
            SessionLen = TOMATO.break.getSessionLength();
            title = TOMATO.TITLE_BREAK;
        }else if( TOMATO.currentSession === TOMATO.TITLE_BREAK ){
            SessionLen = TOMATO.work.getSessionLength();
            title = TOMATO.TITLE_WORK;
        }
        TOMATO.currentSession = title;
        TOMATO.timer.pause();
        TOMATO.timer.setSessionLength(SessionLen);
        TOMATO.timer.start();
        TOMATO.timer.setTitle(title);
        TOMATO.analogTimer.reset(SessionLen);
        TOMATO.analogTimer.start();

        alarm = new Audio('Bike Horn.wav');
        alarm.play();
    }
    
    //update screen;
    TOMATO.render();
}
    
/*************************************
 * handler function for click events *
 ************************************/
TOMATO.handleEvents = function(elem){
    var elementId,
        workSessionLen; 
    
    //little helper function to keep code DRY 
    function resetTimer(){
        workSessionLen = TOMATO.work.getSessionLength();
        TOMATO.timer.reset(workSessionLen);
        TOMATO.analogTimer.reset(workSessionLen);
    }

    // react to click event 
    // choose action depending on button id
    elementId = $(elem).attr('id');
    
    switch(elementId){
        case 'timer-start':
            TOMATO.timer.start();
            TOMATO.analogTimer.start();
            break;
        case 'timer-pause':
            TOMATO.timer.pause();
            TOMATO.analogTimer.pause();
            break;
        case 'break-dec':
            TOMATO.break.decrease();
            break;
        case 'break-inc':
            TOMATO.break.increase();
            break;
        case 'work-dec':
            TOMATO.work.decrease();
            resetTimer();    
            break;
        case 'work-inc':
            TOMATO.work.increase();
            resetTimer();
            break;
        default:
            //nothing to do here; 
            break;
    }
}

/*********************************  
*   here starts application      *
*   (using jQuery)               *
*********************************/
$(function(){

    //initialize analog clock
    TOMATO.analogTimer.reset(TOMATO.DEFAULT_SESSION_LENGTH);

    // handler function is responsible for app logic, updates and render
    // everything that happens internally without user interaction
    window.setInterval( TOMATO.handler, TOMATO.REFRESH_RATE );

    //react to button clicks
    $('.btn').on('click', function(){
        TOMATO.handleEvents(this);
    });

});




