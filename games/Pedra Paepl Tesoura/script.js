const gameContainer = document.querySelector(".container"),
  userResult = document.querySelector(".user_result img"),
  cpuResult = document.querySelector(".cpu_result img"),
  result = document.querySelector(".result"),
  optionImages = document.querySelectorAll(".option_image");
  
// Passar pelas imagens de opção
optionImages.forEach((image, index) => {
  image.addEventListener("click", (e) => {
    image.classList.add("active");
    userResult.src = cpuResult.src = "images/rock.png";
    result.textContent = "Aguarde...";

    // Passar cada imagem de opção dnv
    optionImages.forEach((image2, index2) => {
      // Se o index atual não corresponder ao index clicado
      // tirar o active quando clicar em outra opc
      index !== index2 && image2.classList.remove("active");
    });
    gameContainer.classList.add("start");
    // Definir um tempo limite p demorar p aparecer o resultado
    let time = setTimeout(() => {
      gameContainer.classList.remove("start");
      let imageSrc = e.target.querySelector("img").src;
      // aparecer img q o user click
      userResult.src = imageSrc;

      // Gerar numero aletario entre 0 e 2
      let randomNumber = Math.floor(Math.random() * 3);
      // Criar um array p imagem da cpu 
      let cpuImages = ["images/rock.png", "images/paper.png", "images/scissors.png"];
      // pegar a imagem da cpu pleo array aletorio
      cpuResult.src = cpuImages[randomNumber];

      let cpuValue = ["R", "P", "S"][randomNumber];
      let userValue = ["R", "P", "S"][index];
      //criando a probabilidade de jogadas
      let outcomes = {
        RR: "Draw",
        RP: "Cpu",
        RS: "User",
        PP: "Draw",
        PR: "User",
        PS: "Cpu",
        SS: "Draw",
        SR: "Cpu",
        SP: "User",
      };
      //saida dependendo da cpu e user
      let outComeValue = outcomes[userValue + cpuValue];
      // resultado
      result.textContent = userValue === cpuValue ? "Empate!" : `${outComeValue} Ganhou!`;
    }, 2500);
  });
});
