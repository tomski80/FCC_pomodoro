'use strict'

//using jQuery
$(
    () => {
        const TIME_INTERVAL = 1,
              MAX_TIME = 60,
              MIN_TIME = 0;

        let breakTime = {minutes : 5, seconds: 0},
            workTime = {minutes : 25, seconds: 0},
            countDown = { minutes : 25, seconds: 0},
            session = true,

            displayBreak = $('#display-break'),
            displayWork = $('#display-work'),
            displayTimer = $('#display-timer'),
            sessionTitle = $('#session-title');

        const decreaseTime = function(time){
            time.minutes -= TIME_INTERVAL;
            if(time.minutes <= MIN_TIME) time.minutes = MIN_TIME;
            return time;
        };

        const increaseTime = function(time){
            time.minutes += TIME_INTERVAL;
            if(time.minutes >= MAX_TIME) time.minutes = MAX_TIME;
            return time;
        };

        const updateDisplay = function(display, time, showSeconds = false){
            let minutes = time.minutes,
                seconds = time.seconds;

            if(seconds === 60) seconds = 0;
            seconds = seconds.toString();
            minutes = minutes.toString();
            
            if(seconds.length === 1) seconds = seconds.padStart(2,'0');
            if(minutes.length === 1) minutes = minutes.padStart(2,'0');
            
            showSeconds ? $(display).val(minutes+':'+seconds) : $(display).val(minutes);
        };

        const timeOut = function(){
            console.log('time out');
            //toggle session/break
            session ? session = false : session = true;
        };

        const updateCountDown = function(){
            countDown.seconds--;
            if(countDown.seconds < 0){ 
                countDown.minutes--;
                countDown.seconds = 59;
            }
            
            if(countDown.minutes < 0){
                //time out!
                if(session){
                  countDown.minutes = breakTime.minutes; 
                  sessionTitle.html('Break');
                }else{
                  countDown.minutes = workTime.minutes;
                  sessionTitle.html('Session');
                }
                countDown.seconds = 1;
                timeOut();
            }
            let showSeconds = true;
            updateDisplay(displayTimer,countDown,showSeconds);
        };

        const changeTimes = function(display,timer,increase = false){
            if(!countDownStart){
                increase ? timer= increaseTime(timer) : timer = decreaseTime(timer);
                session = true;
                sessionTitle.html('Session');
                countDown.minutes = workTime.minutes;
                countDown.seconds = 0;
                let animTime = countDown.minutes*60 + countDown.seconds;
                console.log(animTime);
                $('.analog').css('animation','none');
                setTimeout(function(){
                $('.analog').css('animation','countdown '+animTime+'s linear infinite forwards');
                $('.analog').css('animation-play-state','paused');},10);

                updateDisplay(display,timer);
                updateDisplay(displayTimer,countDown,true);
            }
        };

        let countDownInterval = null,
            countDownStart = false;

        // initialize displays
        updateDisplay(displayBreak,breakTime);
        updateDisplay(displayWork,workTime);
        updateDisplay(displayTimer,countDown,true);
        let animTime = countDown.minutes*60 + countDown.seconds;
        $('.analog').css('animation','countdown '+animTime+'s linear infinite forwards');
        $('.analog').css('animation-play-state','initial');
        $('.analog').css('animation-play-state','paused');
        
        $('#break-inc').on('click', () => {
            const increase = true;
            changeTimes(displayBreak,breakTime,increase);
        });

        $('#break-dec').on('click', () => {
            changeTimes(displayBreak,breakTime);
        });

        $('#work-inc').on('click', () => {
            const increase = true;
            changeTimes(displayWork,workTime,increase);
        });

        $('#work-dec').on('click', () => {
            changeTimes(displayWork,workTime);
        });

        $('#timer-start').on('click', () => {
            if(!countDownStart){
            $('.analog').css('animation-play-state','running');
            countDownInterval = window.setInterval( updateCountDown,1000);
            }
            countDownStart = true;
        });

        $('#timer-stop').on('click', () => {
            countDownStart = false;
            $('.analog').css('animation-play-state','paused');
            window.clearInterval(countDownInterval);
        });

    }
);

