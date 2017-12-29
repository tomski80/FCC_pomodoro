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
TOMATO.REFRESH_RATE = 100;                   //refresh rate for rendering (interval function timeout)
TOMATO.DEFAULT_BREAK_LENGTH = 300000;        //in milisec
TOMATO.DEFAULT_SESSION_LENGTH = 1800000;     //in milisec  
TOMATO.DEFAULT_STEP_VALUE = 60000;          //in milisec
TOMATO.MAX_TIME = 3600000;                   //in milisec
TOMATO.TITLE_WORK = 'session';                     //name for work session
TOMATO.TITLE_BREAK = 'break';                      //name for break session
TOMATO.currentSession = TOMATO.TITLE_WORK;         // keep track if counting-down work or break time
TOMATO.utility = {};                         //container for utility functions (shared functions)


TOMATO.utility._convertToMinSec = function(milisec){
    const MILISEC_IN_SEC = 1000,
              SEC_IN_MIN = 60;

    var tempMin, tempSec;

    tempMin = Math.floor(milisec / MILISEC_IN_SEC / SEC_IN_MIN);
    tempSec = Math.floor(milisec / MILISEC_IN_SEC % SEC_IN_MIN);
    return {
        minutes : tempMin,
        seconds : tempSec
    }
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

    //stop clock and store time left (updated session length)
    function stop(){
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
    function getMinSecTime(){
        var tempTime;

        tempTime = _getTime();
        console.log(tempTime);
        return TOMATO.utility._convertToMinSec(tempTime);
    } 

    function reset(sessionLen){
        _title = TOMATO.TITLE_WORK;
        stop()
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
        stop : stop,
        reset : reset,
        getMinSecTime : getMinSecTime,
        setSessionLength : setSessionLength,
        getMilisecTime : getMilisecTime,
        getTitle : getTitle,
        setTitle : setTitle
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

    this.getMinSecTime = function(){
        return TOMATO.utility._convertToMinSec(_sessionLength);
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
    
    countDown = TOMATO.timer.getMinSecTime();
    $('#display-timer').val(countDown.minutes+':'+countDown.seconds);

    breakTime = TOMATO.break.getMinSecTime();
    $('#display-break').val(breakTime.minutes+':'+breakTime.seconds);

    workTime = TOMATO.work.getMinSecTime();
    $('#display-work').val(workTime.minutes+':'+workTime.seconds);

    $('#session-title').html(TOMATO.timer.getTitle());

}

/*****************************
 *  TOMATO APP logic here    *
 ****************************/
TOMATO.handler = function(){
    var tempTime,
        SessionLen,
        title;

    //swap between work or break 
    tempTime = TOMATO.timer.getMilisecTime();
    if(tempTime <= 0){
        if( TOMATO.currentSession === TOMATO.TITLE_WORK ){
            SessionLen = TOMATO.break.getSessionLength();
            title = TOMATO.TITLE_BREAK;
        }else if( TOMATO.currentSession === TOMATO.TITLE_BREAK ){
            SessionLen = TOMATO.work.getSessionLength();
            title = TOMATO.TITLE_WORK;
        }
        TOMATO.currentSession = title;
        TOMATO.timer.stop();
        TOMATO.timer.setSessionLength(SessionLen);
        TOMATO.timer.start();
        TOMATO.timer.setTitle(title);
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
    
    elementId = $(elem).attr('id');

    //little helper function to keep code DRY 
    function resetTimer(){
        workSessionLen = TOMATO.work.getSessionLength();
        TOMATO.timer.reset(workSessionLen);
    }

    // react to click event 
    // choose action depending on button id
    switch(elementId){
        case 'timer-start':
            TOMATO.timer.start();
            break;
        case 'timer-stop':
            TOMATO.timer.stop();
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

    //react to button clicks
    $('.btn').on('click', function(){
        TOMATO.handleEvents(this);
    });

    // handler function is responsible for app logic, updates and render
    // everything that happens internally without user interaction
    window.setInterval( TOMATO.handler, TOMATO.REFRESH_RATE );
});




