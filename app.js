/* jshint asi:true, unused:true, undef:true, devel:true, browser:true */
/* global Point, Path, swal */

var path = new Path();
path.strokeColor = 'black';
path.add(new Point(75, 100));
path.add(new Point(125, 100));
path.closed = true;

var p1 = new Path();
p1.strokeColor = 'black';
p1.add(new Point(100, 25));
p1.add(new Point(100, 100));
p1.closed = true;

var p2 = new Path();
p2.strokeColor = 'black';
p2.add(new Point(100, 25));
p2.add(new Point(75, 25));
p2.closed = true;


function StickFigure() {

}



function Hangman() {
    StickFigure.call(this)
}

Hangman.prototype = new StickFigure()

Hangman.prototype.makehead = function() {
    // body...
}

Hangman.prototype.makeLeftArm = function() {
    // body...
}

Hangman.prototype.makeRightArm = function() {
    // body...
}

Hangman.prototype.makeleftLeg = function() {
    // body...
}

Hangman.prototype.makeRightLeg = function() {
    // body...
}

StickFigure.make = function() {
    return new StickFigure()
}

StickFigure.makeHangman = function() {
    return new Hangman()
}

/**
 * Encapsulates the state of hangman and exposes methods to manipulate its state
 * @type {Hangman}
 */
var hangman = StickFigure.makeHangman()

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
    var child, suggestion;

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
        suggestion.focus()
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
            console.log('here')
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

        // Resetting the suggested character
        if (count) {
            return resetSuggestion()
        }
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
        return setWord(reset(), cont)
    });
});