/* jshint asi:true, unused:true, undef:true, devel:true, browser:true */
/* global Point, Path, Circle, swal */

var color = 'black'

function makeStand() {
    var path = new Path();
    path.strokeColor = color;
    path.add(new Point(75, 100));
    path.add(new Point(125, 100));
    path.closed = true;

    var p1 = new Path();
    p1.strokeColor = color;
    p1.add(new Point(100, 25));
    p1.add(new Point(100, 100));
    p1.closed = true;

    var p2 = new Path();
    p2.strokeColor = color;
    p2.add(new Point(100, 25));
    p2.add(new Point(75, 25));
    p2.closed = true;

    var noose = new Path()
    noose.strokeColor = color
    noose.add(new Point(75, 25))
    noose.add(new Point(75, 30))
    noose.closd = true

}


function StickFigure() {}

function Hangman(stand) {

    StickFigure.call(this)

    this.strokeColor = 'red'

    this.stand = stand

    /**
     * Parts of the hangman's body
     * @type {Array}
     */
    this.parts = []

    this.actions = [
        this.makeHead,
        this.makeTorso,
        this.makeLeftArm,
        this.makeRightArm,
        this.makeleftLeg,
        this.makeRightLeg
    ]

}

Hangman.prototype = Object.create(StickFigure.prototype)

Hangman.prototype.makeHead = function() {
    console.info('drawing head')
    var head = new Path.Circle({
        center: new Point(75, 35),
        radius: 5,
        strokeColor: this.strokeColor
    })

    this.parts.push(head)
}

Hangman.prototype.makeTorso = function() {
    console.info('drawing torso')
    var torso = new Path()
    torso.strokeColor = this.strokeColor
    torso.add(new Point(75, 40))
    torso.add(new Point(75, 60))
    torso.closed = true

    this.parts.push(torso)
};

Hangman.prototype.makeLeftArm = function() {
    console.info('drawing left arm')
    var arm = new Path()
    arm.strokeColor = this.strokeColor
    arm.add(new Point(75, 50))
    arm.add(new Point(70, 45))
    arm.closed = true

    this.parts.push(arm)
}

Hangman.prototype.makeRightArm = function() {
    console.info('drawing right arm')
    var arm = new Path()
    arm.strokeColor = this.strokeColor
    arm.add(new Point(75, 50))
    arm.add(new Point(80, 45))
    arm.closed = true

    this.parts.push(arm)
}

Hangman.prototype.makeleftLeg = function() {
    console.info('drawing left leg')
    var leg = new Path()
    leg.strokeColor = this.strokeColor
    leg.add(new Point(75, 60))
    leg.add(new Point(70, 65))
    leg.closed = true

    this.parts.push(leg)
}

Hangman.prototype.makeRightLeg = function() {
    console.info('drawing left leg')
    var leg = new Path()
    leg.strokeColor = this.strokeColor
    leg.add(new Point(75, 60))
    leg.add(new Point(80, 65))
    leg.closed = true

    this.parts.push(leg)
}

/**
 * (Eventually) renders a body part
 * @return {Boolean} whether any body parts remain
 */
Hangman.prototype.makeNext = function() {
    var act = this.actions.shift()
    if (!act) {
        console.warn('attempted to draw hangman section that does not exist')
        return
    }

    act.call(this)
    // window.requestAnimationFrame()
    return this.actions.length
};

Hangman.prototype.cleanup = function() {
    this.parts.forEach(function(item){
        item.remove()
    })
};

StickFigure.make = function() {
    return new StickFigure()
}

StickFigure.makeHangman = function() {
    var hm = new Hangman()
    return hm
}


/**
 * Retrieves word list and passes the list converted to an array to the
 * callback provided
 * @param  {Function} fn
 * @return {void}
 */
function getWorldList(fn) {
    var url = 'words.txt';
    var xhr = new XMLHttpRequest();

    xhr.open('GET', url, true);

    xhr.onload = function(e) {
        if (this.status != 200) return;
        fn(this.responseText.split('\n'));
    };

    xhr.send();
}



/**
 * Renders the number of input elements required for [[word]]
 * @param {String} word selected hangman word
 * @param {Function} cont call when you want to reset the game and start over
 * with a new word
 */
function setWord(word, cont) {
    var child, suggestion, gameOver = false, 
        hm = StickFigure.makeHangman();

    console.log(word)

    var suggestionSelector = 'letter-suggestion'
    var input = '<input class="letter-suggestion" maxlength="1"/>';
    var span = '<span class="letter-slot" />';

    var cnt = document.querySelector('#letters-cnt');
    var lsc = document.querySelector('#letter-suggestion-cnt')
    var b = document.querySelector('#check-button')

    /**
     * An array for the previously found characters
     * @type {Array.<Char>}
     */
    var lastWord = [];

    function disableCheckButton() {
        b.disabled = 'disabled'
    }

    function onKeyup(e) {
        var l = (e.target.value || '').trim().toLowerCase()

        if (gameOver) {
            console.warn("doing nothing since the game has ended")
            return;
        }

        if (!l) {
            console.warn('disabling "check validity" button')
            disableCheckButton()
            return;
        }

        if (lastWord.indexOf(l) !== -1) {
            disableCheckButton()
            return;
        }

        if (e.keyCode === 13) {
            return checkValidity()
        }

        console.info('enabling "check validity" button')
        b.disabled = false
    }

    function resetSuggestion() {
        suggestion.value = ''
        disableCheckButton()
        suggestion.blur()
        suggestion.focus()
    }

    function triggerDefeat () {
        swal({
            title: 'It seems failure is an option',
            text: 'Would you like to play again?',
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            type: 'error',
            confirmButtonText: "Next hangman up!",
            cancelButtonText: "Offer clemency.",
            closeOnConfirm: true
        }, function(){
            hm.cleanup()
            cleanup()
        })
    }


    function onButtonClick() {
        checkValidity()
    }

    function triggerWin() {
        console.log('triggering win')
        swal({
            title: "Good Job, tyrant!",
            text: "Would you like to play again?",
            // timer: 6000,
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            type: 'success',
            confirmButtonText: "Next hangman up!",
            cancelButtonText: "Offer clemency.",
            closeOnConfirm: true
        }, function() {
            cleanup()
        })
    }

    function checkValidity() {
        var inp, char, count = 0;

        /**
         * [[suggestion]] will have been initialized by this point
         * @type {Char}
         */
        var l = (suggestion.value || '').trim().toLowerCase()

        for (var k = cnt.children.length - 1; k >= 0; k--) {
            inp = cnt.children[k]
            char = word[k]

            if (l === char) {
                // console.info('found char', char, 'applying it to idx', k)
                inp.innerText = char
                lastWord[k] = char
                count = 1
            }
        }

        // Yay!
        if (lastWord.slice().join('') === word) {
            resetSuggestion()
            return triggerWin()
        }

        // Resetting the suggested character because the user supplied a
        // character in the current word
        if (count) {
            return resetSuggestion()
        }

        // No letter matched, so add another body part
        var next = hm.makeNext()
        if (!next) {
            return triggerDefeat()
        }
        resetSuggestion()
    }


    for (var i = word.length - 1; i >= 0; i--) {
        lastWord[i] = null;
        cnt.insertAdjacentHTML('afterbegin', span);
    }

    for (var j = cnt.children.length - 1; j >= 0; j--) {
        child = cnt.children[j];
    }

    lsc.insertAdjacentHTML('afterbegin', input)
    suggestion = lsc.getElementsByClassName(suggestionSelector)[0]
    suggestion.addEventListener('keyup', onKeyup)
    b.addEventListener('click', onButtonClick)

    function cleanup() {
        b.removeEventListener('click', onButtonClick)
        suggestion.removeEventListener('keyup', onKeyup)
        suggestion.parentElement.removeChild(suggestion)
        while (cnt.firstChild) {
            cnt.removeChild(cnt.firstChild)
        }
        cont()
    }

}


function main() {
    makeStand()
    getWorldList(function(words) {
        var minWordLength = 5;
        var ls = words.filter(function(w) {
            return w.length > minWordLength;
        }).map(function(w) {
            return w.toLowerCase()
        });

        var len = ls.length;
        var maxIdx = len - 1;

        function reset() {
            var randomWordIdx = Math.ceil(Math.random() * maxIdx);
            var rando = ls[randomWordIdx]
            return rando
        }

        setWord(reset(), function cont() {
            setWord(reset(), cont)
        });
    });
}

main()