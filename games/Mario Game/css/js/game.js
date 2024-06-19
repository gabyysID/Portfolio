const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');
const spanPlayer = document.querySelector('.player');
const timer = document.querySelector('.timer');

const jump = ()=>{
  mario.classList.add('jump');

  setTimeout(() =>{
    mario.classList.remove('jump');
  },500);
}
/*setinterval cria animações e att automaticas*/
const loop = setInterval(() =>{
  const pipePosition = pipe.offsetLeft;
  const marioPosition = +window.getComputedStyle(mario).bottom.replace('px','');

  console.log(marioPosition);
  
  if(pipePosition <=120 && pipePosition >0 && marioPosition <80){
    
    pipe.style.animation = 'none';
    pipe.style.left = `${pipePosition}px`;

    mario.style.animation = 'none';
    mario.style.bottom = `${marioPosition}px`;

    mario.src = '../images/game-over.png';
    mario.style.width='70px';
    mario.style.marginLeft ='50px';
    document.getElementById('congratulations').style.display = 'block';
    document.getElementById('congratulations2').style.display = 'block';
    clearInterval(this.loop);
  }
}, 10)
const startTimer= ()=>{
  this.loop = setInterval(()=>{
    const currentTime = +timer.innerHTML;
    timer.innerHTML = currentTime+1;

  },1000)
}
window.onload = ()=>{
  spanPlayer.innerHTML = localStorage.getItem('player');
  startTimer();
  document.addEventListener('keydown', jump);
}
