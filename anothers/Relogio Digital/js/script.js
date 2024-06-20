const horas = document.getElementById('horas');
const minutos = document.getElementById('minutos');
const segundos = document.getElementById('segundos');


const relogio = setInterval(function time(){
    //pegar a data 
    let dateToday = new Date();
    let hr = dateToday.getHours();
    let min = dateToday.getMinutes();
    let s = dateToday.getSeconds();
    //adicionar o 0 quando os digitos forem menores q 0
    if(hr < 10) hr = '0' + hr;
    if(min < 10) min = '0' + min;
    if(s < 10) s = '0' + s;

    //altera o 'texto'
    horas.textContent = hr;
    minutos.textContent = min;
    segundos.textContent = s;

})