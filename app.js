let historico = [];

function trocarTela(id){
document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
document.getElementById(id).classList.add("active");
}

function addVeiculo(tipo){
const div=document.createElement("div");
div.innerHTML="<input placeholder="Nome"> <input type="number" placeholder="Diária"> <input type="number" placeholder="Dias">";
document.getElementById(tipo==="c"?"veicC":"veicS").appendChild(div);
}

function calcular(){

const auxTotal=Number(auxDinheiro.value)+Number(auxCombustivel.value);

const c=rota("c");
const s=rota("s");

const brutoTotal=c.bruto+s.bruto;

const percC=c.bruto/brutoTotal;
const percS=s.bruto/brutoTotal;

const auxC=auxTotalpercC;
const auxS=auxTotalpercS;

const liquidoC=c.bruto-auxC-c.pass;
const liquidoS=s.bruto-auxS-s.pass;

const valorC=liquidoC/c.alunos;
const valorS=liquidoS/s.alunos;

resultado.innerHTML="<h2>Resultado</h2> Curvelo: R$ ${valorC.toFixed(2)}<br> Sete Lagoas: R$ ${valorS.toFixed(2)}";

historico.push({c,s,brutoTotal,auxTotal,valorC,valorS});
atualizarDashboard();
}

function rota(p){
const int=Number(document.getElementById(p+"Int").value);
const dq=Number(document.getElementById(p+"DescQtd").value);
const dp=Number(document.getElementById(p+"DescPerc").value)/100;
const pass=Number(document.getElementById(p+"Pass").value);

let bruto=0;

document.querySelectorAll("#veic${p==="c"?"C":"S"} div")
.forEach(d=>{
const i=d.querySelectorAll("input");
bruto+=Number(i[1].value)*Number(i[2].value);
});

const alunos=int+(dq*(1-dp));

return {bruto,pass,alunos};
}

function atualizarDashboard(){
let total=0, alunos=0;

historico.forEach(r=>{
total+=r.brutoTotal;
alunos+=r.c.alunos+r.s.alunos;
});

total.innerText="R$ "+total.toFixed(2);
alunos.innerText=alunos;

new Chart(graficoPizza,{
type:"pie",
data:{
labels:["Curvelo","Sete"],
datasets:[{data:[
historico.at(-1)?.c.bruto||0,
historico.at(-1)?.s.bruto||0
]}]
}
});
}

function gerarPDF(){
const { jsPDF } = window.jspdf;
const doc = new jsPDF();

const r=historico.at(-1);

doc.text("Relatório de Rateio",10,10);

doc.autoTable({
head:[["Item","Valor"]],
body:[
["Bruto Curvelo",r.c.bruto],
["Bruto Sete",r.s.bruto],
["Total",r.brutoTotal],
["Auxílio Total",r.auxTotal],
["Aluno Curvelo",r.valorC],
["Aluno Sete",r.valorS]
]
});

doc.save("relatorio.pdf");
}
