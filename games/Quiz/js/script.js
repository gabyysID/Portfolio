const start_btn = document.querySelector(".start_btn button");
const info_box = document.querySelector(".info_box");
const exit_btn = info_box.querySelector(".buttons .quit");
const continue_btn = info_box.querySelector(".buttons .restart");
const quiz_box = document.querySelector(".quiz_box");
const result_box = document.querySelector(".result_box");
const option_list = document.querySelector(".option_list");
const time_line = document.querySelector("header .time_line");
const timeText = document.querySelector(".timer .time_left_txt");
const timeCount = document.querySelector(".timer .timer_sec");

// qnd o bottao de iniciar for click
start_btn.onclick = ()=>{
    info_box.classList.add("activeInfo"); //mostrar a box de info
}

// if exitQuiz button clicked
exit_btn.onclick = ()=>{
    info_box.classList.remove("activeInfo"); //esconder/tirar a box das info
}

// se o botao de continuar for clicado
continue_btn.onclick = ()=>{
    info_box.classList.remove("activeInfo"); //esconder a box de info
    quiz_box.classList.add("activeQuiz"); //motrar quiz box
    showQuetions(0); //chamando a função q mostra as questoes
    queCounter(1); //passando paramentro
    startTimer(15); //chamando a função do tempo
    startTimerLine(0); //chamando a função da linha de tempo q corre
}

let timeValue =  15;
let que_count = 0;
let que_numb = 1;
let userScore = 0;
let counter;
let counterLine;
let widthValue = 0;

const restart_quiz = result_box.querySelector(".buttons .restart");
const quit_quiz = result_box.querySelector(".buttons .quit");

// se o botao de reiniciar o quiz for click
restart_quiz.onclick = ()=>{
    quiz_box.classList.add("activeQuiz"); //mostrar box quiz
    result_box.classList.remove("activeResult"); //esconder a box dos resultados
    timeValue = 15; 
    que_count = 0;
    que_numb = 1;
    userScore = 0;
    widthValue = 0;
    showQuetions(que_count); //chamando a função q mostra as questoes
    queCounter(que_numb); //passando que_numb vvalidar o  queCounter
    clearInterval(counter); //zerar contador
    clearInterval(counterLine); //zerar linha de tempo
    startTimer(timeValue); //chamando a função do tempo
    startTimerLine(widthValue); //chamando a função da linha de tempo q corre
    timeText.textContent = "Time Left"; //alterando o texto para acabou o tempo
    next_btn.classList.remove("show"); //esconder o btn de prox
}

// se botao de fechar o quiz for click
quit_quiz.onclick = ()=>{
    window.location.reload(); //recarergar tela
}

const next_btn = document.querySelector("footer .next_btn");
const bottom_ques_counter = document.querySelector("footer .total_que");

// se o botao de prox questao for click
next_btn.onclick = ()=>{
    if(que_count < questions.length - 1){ //se a contagem de perguntas for menor que o comprimento total da pergunta
        que_count++; //incrementar o valor que_count 
        que_numb++; //incrementar o valor que_numb 
        showQuetions(que_count); //chamando a função q mostra as questoes
        queCounter(que_numb); //passando o valor que_numb para queCounter
        clearInterval(counter); //zerar counter
        clearInterval(counterLine); //zerar counterLine
        startTimer(timeValue); //chamando a função do tempo
        startTimerLine(widthValue); //chamando a função da linha de tempo q corre
        timeText.textContent = "Time Left"; //alterando o texto para acabou o tempo
        next_btn.classList.remove("show"); //esconder o btn de prox
    }else{
        clearInterval(counter); //zerar counter
        clearInterval(counterLine); //zerar counterLine
        showResult(); //chamando a função q mostra os result
    }
}

//obtendo perguntas e opções do array
function showQuetions(index){
    const que_text = document.querySelector(".que_text");

    //criando span e div
    let que_tag = '<span>'+ questions[index].numb + ". " + questions[index].question +'</span>';
    let option_tag = '<div class="option"><span>'+ questions[index].options[0] +'</span></div>'
    + '<div class="option"><span>'+ questions[index].options[1] +'</span></div>'
    que_text.innerHTML = que_tag; 
    option_list.innerHTML = option_tag; 
    
    const option = option_list.querySelectorAll(".option");

    for(i=0; i < option.length; i++){
        option[i].setAttribute("onclick", "optionSelected(this)");
    }
}
// criando div p os icons
let tickIconTag = '<div class="icon tick"><i class="fas fa-check"></i></div>';
let crossIconTag = '<div class="icon cross"><i class="fas fa-times"></i></div>';

//quando opcao for selecionada
function optionSelected(answer){
    clearInterval(counter); 
    clearInterval(counterLine); 
    let userAns = answer.textContent; //getting user selected option
    let correcAns = questions[que_count].answer; //pegando a respot certa pelo array
    const allOptions = option_list.children.length; //pegando todas as opções
    
    if(userAns == correcAns){ 
        userScore += 1; 
        answer.classList.add("correto"); 
        answer.insertAdjacentHTML("beforeend", tickIconTag); 
        console.log("Resposta Correta!");
        console.log("Seus acertos = " + userScore);
    }else{
        answer.classList.add("incorreto"); 
        answer.insertAdjacentHTML("beforeend", crossIconTag);
        console.log("Resposta Incorreta!");

        for(i=0; i < allOptions; i++){
            if(option_list.children[i].textContent == correcAns){  
                option_list.children[i].setAttribute("class", "option correct"); 
                option_list.children[i].insertAdjacentHTML("beforeend", tickIconTag); 
                console.log("Auto selected correct answer.");
            }
        }
    }
    for(i=0; i < allOptions; i++){
        option_list.children[i].classList.add("disabled"); 
    }
    next_btn.classList.add("show");
}

function showResult(){
    info_box.classList.remove("activeInfo"); 
    quiz_box.classList.remove("activeQuiz"); 
    result_box.classList.add("activeResult"); 
    const scoreText = result_box.querySelector(".score_text");
    if (userScore > 3){ 
        let scoreTag = '<span>Parabéns🎉!, Você acertou <p>'+ userScore +'</p> de <p>'+ questions.length +'</p></span>';
        scoreText.innerHTML = scoreTag;  
    }
    else if(userScore > 1){ 
        let scoreTag = '<span>Boa! 😎, Você acertou <p>'+ userScore +'</p> de <p>'+ questions.length +'</p></span>';
        scoreText.innerHTML = scoreTag;
    }
    else{ 
        let scoreTag = '<span>Poxa... 😐, Você acertou somente <p>'+ userScore +'</p> de <p>'+ questions.length +'</p></span>';
        scoreText.innerHTML = scoreTag;
    }
}

function startTimer(time){
    counter = setInterval(timer, 1000);
    function timer(){
        timeCount.textContent = time; 
        time--; 
        if(time < 9){ 
            let addZero = timeCount.textContent; 
            timeCount.textContent = "0" + addZero; 
        }
        if(time < 0){ 
            clearInterval(counter); 
            timeText.textContent = "Acabou o Tempo"; 
            const allOptions = option_list.children.length; 
            let correcAns = questions[que_count].answer; 
            for(i=0; i < allOptions; i++){
                if(option_list.children[i].textContent == correcAns){ 
                    option_list.children[i].setAttribute("class", "option correct"); 
                    option_list.children[i].insertAdjacentHTML("beforeend", tickIconTag); 
                    console.log("Time Off: Auto selected correct answer.");
                }
            }
            for(i=0; i < allOptions; i++){
                option_list.children[i].classList.add("disabled"); 
            }
            next_btn.classList.add("show"); 
        }
    }
}

function startTimerLine(time){
    counterLine = setInterval(timer, 29);
    function timer(){
        time += 1; 
        time_line.style.width = time + "px";
        if(time > 549){ 
            clearInterval(counterLine); 
        }
    }
}

function queCounter(index) {
    let totalQueCounTag = '<span><p>' + index + '</p> of <p>' + questions.length + '</p> Questions</span>';
    bottom_ques_counter.innerHTML = totalQueCounTag;
}
