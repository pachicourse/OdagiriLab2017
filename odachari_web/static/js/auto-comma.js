var ime_flag = false;
var AutoComma = new function () {
    var init = function () {
        var inputs = document.getElementsByTagName("input");
        for (var i = 0; i < inputs.length; i++) {
            (function (input) {
                if (!input.classList.contains("auto-comma")) return;
                console.log(input);
                input.addEventListener("keyup", function (e) {
                    addComma(input);
                });
                input.addEventListener("focusout", function () {
                    addComma(input);
                });
                input.addEventListener("focusin", function () {
                    addComma(input);
                });
                input.addEventListener("keydown", KeyCheck);

                function KeyCheck(event) {
                    console.log(event.keyCode);
                    if (!(event.which == "229" || event.which == "0")) {
                        ime_flag = false;
                        var KeyID = event.keyCode;
                        var c = input.selectionStart - 1;
                        switch (KeyID) {
                            case 8:
                                if (input.value[c] === ",") {
                                    var va = input.value.split("");
                                    va.splice(c - 1, 1);
                                    input.value = va.join("");
                                    input.setSelectionRange(c, c);
                                }
                                break;
                            case 46:
                                var va = input.value.split("");
                                va.splice(c, 1);
                                input.value = va.join("");
                                break;
                            default:
                                break;
                        }
                    }
                    else {
                        ime_flag = true;
                        if(event.keyCode == 13){
                            ime_flag = false;
                        }
                    }
                }
            })(inputs[i]);
        }
    }
    var updateAll = function (input) {
        if (!ime_flag) {
            var inputs = document.getElementsByTagName("input");
            for (var i = 0; i < inputs.length; i++) {
                if (!inputs[i].classList.contains("auto-comma")) return;
                addComma(inputs[i]);
            }
        }
    }
    this.updateAll = updateAll;
    this.init = init;

    function addComma(input) {
        if (!ime_flag) {
            var pc = input.value.split(",").length;
            var c = input.selectionStart;
            var l = input.selectionEnd;
            input.value = input.value.replace(/[^0-9]/g, '').replace(/(\d)(?=(\d\d\d)+$)/g, '$1,');
            var nc = input.value.split(",").length;
            c += nc - pc;
            l += nc - pc
            input.setSelectionRange(c, l);
        }
    }
    window.addEventListener("load", function () {
        init();
        updateAll();
    })
};
