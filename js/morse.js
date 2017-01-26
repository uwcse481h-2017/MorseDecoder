(function() {
    "use strict";

    var startTiming = null;
    var endTiming = null;
    var pressing = null;
    var running = null;
    var trainingWord = null;
    var morseSignals = [];

    var morseDictionary = {
        A: ["dot", "elementSpace", "dash", "charSpace"],
        B: ["dash", "elementSpace", "dot", "elementSpace", "dot", "elementSpace", "dot", "charSpace"],
        C: ["dash", "elementSpace", "dot", "elementSpace", "dash", "elementSpace", "dot", "charSpace"],
        D: ["dash", "elementSpace", "dot", "elementSpace", "dot", "charSpace"],
        E: ["dot" , "charSpace"],
        F: ["dot", "elementSpace", "dot", "elementSpace", "dash", "elementSpace", "dot", "charSpace"],
        G: ["dash", "elementSpace", "dash", "elementSpace", "dot", "charSpace"],
        H: ["dot", "elementSpace", "dot", "elementSpace", "dot", "elementSpace", "dot", "charSpace"],
        I: ["dot", "elementSpace", "dot", "charSpace"],
        J: ["dot", "elementSpace", "dash", "elementSpace", "dash", "elementSpace", "dash", "charSpace"],
        K: ["dash", "elementSpace", "dot", "elementSpace", "dash", "charSpace"],
        L: ["dot", "elementSpace", "dash", "elementSpace", "dot", "elementSpace", "dot", "charSpace"],
        M: ["dash", "elementSpace", "dash", "charSpace"],
        N: ["dash", "elementSpace", "dot", "charSpace"],
        O: ["dash", "elementSpace", "dash", "elementSpace", "dash", "charSpace"],
        P: ["dot", "elementSpace", "dash", "elementSpace", "dash", "elementSpace", "dot", "charSpace"],
        Q: ["dash", "elementSpace", "dash", "elementSpace", "dot", "elementSpace", "dash", "charSpace"],
        R: ["dot", "elementSpace", "dash", "elementSpace", "dot", "charSpace"],
        S: ["dot", "elementSpace", "dot", "elementSpace", "dot", "charSpace"],
        T: ["dash" , "charSpace"],
        U: ["dot", "elementSpace", "dot", "elementSpace", "dash", "charSpace"],
        V: ["dot", "elementSpace", "dot", "elementSpace", "dot", "elementSpace", "dash", "charSpace"],
        W: ["dot", "elementSpace", "dash", "elementSpace", "dash", "charSpace"],
        X: ["dash", "elementSpace", "dot", "elementSpace", "dot", "elementSpace", "dash", "charSpace"],
        Y: ["dash", "elementSpace", "dot", "elementSpace", "dash", "elementSpace", "dash", "charSpace"],
        Z: ["dash", "elementSpace", "dash", "elementSpace", "dot", "elementSpace", "dot", "charSpace"]
    };

    window.onload = function() {
        document.getElementById("train").onclick = train;
        document.getElementById("test").onclick = test;
        document.getElementById("confirmWord").onclick = confirmWord;
        document.getElementById("copy").onclick = copy;
        document.getElementById("clear").onclick = clear;

        document.getElementById("codeInput").addEventListener("mousedown", mouseDown);
        document.getElementById("codeInput").addEventListener("mouseup", mouseUp);
        document.addEventListener("keydown", spacebarDecode);
    };

    var spacebarDecode = function(event) {
        console.log(event.keyCode);
        if (event.keyCode == 32) { 

            if (document.getElementById('test').getAttribute('disabled') == false) {
                train();
            } else {
                test();
            }     
        }
    };

    var copy = function(e) {
        var t = e.target,
            c = t.dataset.copytarget,
            input = (c ? document.querySelector(c) : null),
            range = document.createRange(),
            selection = window.getSelection();
        range.selectNodeContents(input);
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('copy');
        selection.removeAllRanges();
    };

    var confirmWord = function() {
        trainingWord = document.getElementById("trainingWord").value;

        if (trainingWord.length < 5) {
            alert("Enter a longer word");
        } else {
            trainingWord = trainingWord.toUpperCase();

            document.getElementById("trainingWord").disabled = true;
            document.getElementById("trainingWord").style.borderColor = "#6FD656";
            document.getElementById("trainingWord").style.borderWidth = "2px 2px 2px 2px";

            document.getElementById("morseInput").style.display = "inline-block";
        }
    };

    var mouseDown = function() {
        if (!pressing) {
            pressing = true;

            document.getElementById('audio').play();
            startTiming = new Date();
            if (endTiming) {

                var elapsed = Math.abs(startTiming - endTiming);
                var morseNode = {elapsedTime: elapsed, state: "off", category: false};

                var li = document.createElement("LI");
                var textNode = document.createTextNode("Up for: " + elapsed + " ms");
                li.appendChild(textNode);

                morseSignals.push(morseNode);
                endTiming = null;
            }
        }
    };

    var mouseUp = function() {
        pressing = null;
        document.getElementById('audio').pause();
        document.getElementById('audio').currentTime = 0;
        endTiming = new Date();
        var elapsed = Math.abs(endTiming-startTiming);
        var morseNode = {elapsedTime: elapsed, state: "on", category: false};

        var li = document.createElement("LI");
        var textNode = document.createTextNode("Down for: " + elapsed + " ms");
        li.appendChild(textNode);

        drawLiveStream(elapsed);

        morseSignals.push(morseNode);
        startTiming = null;
    };

    var updatedEndPoint = 0;
    //draws the dots/dashes of each letter entered

    var drawLiveStream = function(timeElapsed) {
        var strokeLength = parseInt(timeElapsed) / 10;
    

        var lsCanvas = document.getElementById("liveStreamCanvas");
        var ls = lsCanvas.getContext("2d");

        ls.beginPath();
        ls.moveTo(updatedEndPoint, 30);
        ls.lineWidth = 3;

        //x, y
        ls.lineTo(updatedEndPoint + strokeLength, 30);
        updatedEndPoint += strokeLength + 10;

        ls.stroke();
    };

    var clear = function() {
        var lsCanvas = document.getElementById("liveStreamCanvas");
        var ls = lsCanvas.getContext("2d");

        ls.clearRect(0, 0, lsCanvas.width, lsCanvas.height);
        document.getElementById('letter').innerHTML = "";
        lsCanvas.width = 1000;
        updatedEndPoint = 0;
    };

    var test = function() {
        endTiming = null;

        running.test();

        morseSignals = [];

        updatedEndPoint += 50;
    };


    var train = function() {
        clear();
        var trainingMorseCode = [];
        endTiming = null;

        for (var i = 0; i < trainingWord.length; i++) {
            var character = trainingWord.charAt(i);
            trainingMorseCode = trainingMorseCode.concat(morseDictionary[character]);
        }

        trainingMorseCode.pop(); //remove extra charSpace

        if (morseSignals.length == 0) {
            alert("Press the button to enter morse signals");
        } else {
            if (morseSignals.length > 1) {
                if (morseSignals.length < trainingMorseCode.length) {
                    alert("The morse code you entered was shorter than the expected length given the word you typed. Please try again!");
                } else if (morseSignals.length > trainingMorseCode.length) {
                    alert("The morse code you entered was longer than the expected length given the word you typed. Please try again!");
                } else {
                    for (var j in morseSignals) {
                        morseSignals[j].category = trainingMorseCode[j];
                    }
                    running = new run("train");

                    document.getElementById("train").style.display = "none";
                    document.getElementById('training').style.display = "none";
                    document.getElementById("test").disabled = false;
                    document.getElementById("test").style.display = "inline-block";
                    document.getElementById("letterDiv").style.display = "inline-block";
                }
            } else {
                alert("Your training word must have multiple morse signals. I recommend the word: hello" );
            }
        }

        morseSignals = [];
    };


    // Node
    var Node = function(signal) {
        for (var property in signal) {
            if (signal.hasOwnProperty(property)) {
                this[property] = signal[property];
            }
        }

    };

    // Node list
    var NodeList = function(k) {
        this.nodes = [];
        this.k = k;
    };

    /*replace var with this?*/
    NodeList.prototype.draw = function() {
        this.range();
        var elapsedRange = this.timeRange.max - this.timeRange.min;

        var c = document.getElementById("myCanvas");
        var ctx = c.getContext("2d");
        ctx.clearRect(0,0, c.width, c.height);

        ctx.beginPath();
        ctx.moveTo(0, 60);
        ctx.lineTo(1000, 60);
        ctx.lineWidth = 0.5;
        ctx.stroke();

        ctx.fillStyle = 'black';
        ctx.font='12px Lato';

        ctx.fillText(this.timeRange.min + "ms",0,115);
        ctx.font='12px Arial';
        ctx.fillText(this.timeRange.max + "ms",960,115);
        var categorizing = false;

        for (var i in this.nodes) {

            var normalX = (this.nodes[i].elapsedTime - this.timeRange.min)/elapsedRange;

            var xPos = normalX * c.width;
            var yPos = 95;

            
            switch (this.nodes[i].category)
            {
                case 'elementSpace':
                    ctx.fillStyle = '#ff9457';
                    break;
                case 'charSpace':
                    ctx.fillStyle = '#6ad26d';
                    break;
                case 'dot':
                    ctx.fillStyle = '#25b6b4';
                    break;

                case 'dash':
                    ctx.fillStyle = '#a96bcc';
                    break;

                default:
                    ctx.fillStyle = 'black';
            }

            switch (this.nodes[i].state)
            {
                case 'on':
                    yPos = 30;
                    break;
                default:
                    yPos = 90;
            }
            if (!this.nodes[i].category) {
                if (!categorizing) {
                    console.log("category");
                    categorizing = true;
                    ctx.font = "11px Georgia";
                    ctx.fillText("Classifying Unknown Signals..", 0, 10);
                }
                if (this.nodes[i].state == 'on') {
                    yPos = 20;
                } else {

                    yPos = 80;

                }
            }
            ctx.beginPath();
            ctx.arc(xPos, yPos, 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
        }
    };

    /*
    Post: getUnknown identifies morse nodes that
    are not classified to a category.
    */
    NodeList.prototype.getUnknown = function() {
        this.unknownNode = [];

        for(var i in this.nodes) {
            if (this.nodes.hasOwnProperty(i) && !this.nodes[i].category) {
                this.unknownNode.push(this.nodes[i]);
            }
        }
    };

    /*
    Post:
    Calls getUnknown to obtain unclassified nodes.
    Calls determineClosest on each unclassified node
    to obtain list of closest nodes, regardless of 'state' value.
    Then, determines which nodes are most similar based on elapsedTime difference AND state.
    */
    NodeList.prototype.classify = function() {
        this.getUnknown();

        this.numUnlabeled = this.unknownNode.length;

        if (this.numUnlabeled > 0) {
            for(var i in this.unknownNode) {
                this.currentUnknown = this.unknownNode[i];

                this.determineClosest(this.currentUnknown); //this.closest is created

                this.searchIndex = this.k;
                this.possibleNodes = [];

                // compare closest neighbors, regardless of state
                for(var j = 0; j < this.searchIndex; j++) {
                    // specify state
                    if(this.currentUnknown.state == this.closest[j].node.state) {
                        this.possibleNodes.push(this.closest[j].node);
                    } else {
                        this.searchIndex++;
                    }
                }
                this.labelCategory();
            }
            this.constructWord();
        }

        
    };

    NodeList.prototype.constructWord = function() {
        this.signalArray = [];
        this.nowKnownSignals = this.nodes.slice((this.numUnlabeled*-1));

        var numCS = 1;
        for (var i in this.nowKnownSignals) {
            this.signalArray = this.signalArray.concat(this.nowKnownSignals[i].category);
            if (this.nowKnownSignals[i].category == 'charSpace') {
                numCS++;

                for (var j in morseDictionary) {
                    if (morseDictionary[j].length == this.signalArray.length) {
                        this.match = true;
                        for (var k in morseDictionary[j]) {
                            if (this.signalArray[k] != morseDictionary[j][k]) {
                                this.match = false;
                            }
                        }

                        if (this.match) {
                            document.getElementById("letter").innerHTML += j;
                            this.signalArray = [];
                        }
                    }
                }
            }
        }

        this.signalArray.push("charSpace");

        for (var l in morseDictionary) {
            if (morseDictionary[l].length == this.signalArray.length) {
                this.match = true;
                for (var m in morseDictionary[l]) {
                    if (this.signalArray[m] != morseDictionary[l][m]) {
                        this.match = false;
                    }
                }
                if (this.match) {
                    document.getElementById("letter").innerHTML += l;
                    this.signalArray = [];
                }
            }
        }

        this.signalArray = [];
        this.nowKnownSignals = [];
    };

    NodeList.prototype.labelCategory = function() {
        var findMajority = {};
        for (var i in this.possibleNodes) {
            var keyVal = this.possibleNodes[i].category;

            if(findMajority.hasOwnProperty(keyVal)) {
                findMajority[keyVal] = findMajority[keyVal] + 1;
            } else {
                findMajority[keyVal] = 1;
            }
        }

        for (var j in findMajority) {
            if (findMajority[j] >= 2) {
                this.currentUnknown.category = j;
            }
        }
    };

    NodeList.prototype.determineClosest = function(unknown) {
        this.queryElapsedTime = unknown.elapsedTime;
        this.closest = [];

        for (var j in this.nodes) {
            if(this.nodes[j].category) { /*category is defined*/
                this.difference = Math.abs(this.nodes[j].elapsedTime - this.queryElapsedTime);
                this.closest.push({ node: this.nodes[j], difference: this.difference});
            }
        }

        this.closest.sort(function (x,y) {
            return x.difference - y.difference;
        });
    };


    NodeList.prototype.add = function(node) {
        this.nodes.push(node);
    };

    // Lists all elements within node list
    NodeList.prototype.toString = function() {
        for (var i in this.nodes) {
            console.log("elapsed time: " + this.nodes[i].elapsedTime);
            console.log("state: " + this.nodes[i].state);
            console.log("type: " + this.nodes[i].category);
            console.log();
        }
    };

    NodeList.prototype.range = function() {
        this.timeRange = {min: null, max: null};

        if(this.nodes[0].elapsedTime > this.nodes[1].elapsedTime) {
            this.timeRange.min = this.nodes[1].elapsedTime;
            this.timeRange.max = this.nodes[0].elapsedTime;

        } else {
            this.timeRange.min = this.nodes[0].elapsedTime;
            this.timeRange.max = this.nodes[1].elapsedTime;
        }

        for (var i = 2; i < this.nodes.length; i++) {
            if(this.nodes[i].elapsedTime > this.timeRange.max) {
                this.timeRange.max = this.nodes[i].elapsedTime;
            }
            if (this.nodes[i].elapsedTime < this.timeRange.min) {
                this.timeRange.min = this.nodes[i].elapsedTime;
            }
        }
    };
    
    var run = function(mode) {
        if (mode == "train") {
            var nodes = new NodeList(3);
        }

        for (var i in morseSignals) {
            nodes.add(new Node(morseSignals[i]));
        }

        nodes.draw();

        this.test = function() {
            for (var j in morseSignals) {
                nodes.add(new Node(morseSignals[j]));
            }

            nodes.draw();
            nodes.classify();
            document.getElementById("letter").innerHTML += " ";
            setTimeout(function() {nodes.draw();}, 3000);
        }
    };
}());