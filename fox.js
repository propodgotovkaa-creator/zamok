'use strict';
// Keep the original illustrated Lyova already present in every scene.
window.installForestFoxes=function(){};
window.resetForestFox=function(id,left){const fox=document.getElementById(id);fox.classList.remove('walk','happy');fox.style.left=left+'%';fox.style.bottom='3%';};
