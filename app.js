// ============================================
// SISTEMA DE TRANSPORTE PRO - VERSÃO PREMIUM
// ============================================

// Variáveis Globais
let graficoComparativo = null;
let graficoDistribuicao = null;
let historicoRateios = [];
let veiculosCadastrados = [];

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados salvos
    carregarHistorico();
    carregarVeiculos();
    
    // Inicializar data atual
    atualizarDataAtual();
    
    // Inicializar datepicker
    if (document.querySelector('.datepicker')) {
        flatpickr('.datepicker', {
            locale: 'pt',
            dateFormat: 'd/m/Y',
            defaultDate: 'today'
        });
    }
    
    // Inicializar dashboards
    atualizarDashboard();
    
    // Inicializar tabela de recentes
    atualizarTabelaRecente();
    
    // Inicializar listeners
    inicializarListeners();
    
    // Gerar veículos iniciais
    gerarVeiculos(0, 1);
    gerarVeiculos(1, 1);
    
    // Atualizar contadores de alunos
    atualizarContadoresAlunos();
});

function inicializarListeners() {
    // Theme toggle
    document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);
    
    // Menu toggle (mobile)
    document.querySelector('.menu-toggle').addEventListener('click', toggleSidebar);
    
    // Navegação
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            mudarPagina(page);
        });
    });
    
    // Inputs de alunos
    document.querySelectorAll('.aluno-input').forEach(input => {
        input.addEventListener('input', atualizarContadoresAlunos);
    });
    
    // Chart period
    document.getElementById('chartPeriod')?.addEventListener('change', function() {
        atualizarGraficos();
    });
}

// ============================================
// FUNÇÕES DE TEMA E INTERFACE
// ============================================

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const icon = document.querySelector('.theme-toggle i');
    if (document.body.classList.contains('dark-theme')) {
        icon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    } else {
        icon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    }
}

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}

function mudarPagina(pagina) {
    // Atualizar active na navegação
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === pagina) {
            item.classList.add('active');
        }
    });
    
    // Atualizar página visível
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`${pagina}-page`).classList.add('active');
    
    // Atualizar título
    const titles = {
        'dashboard': 'Dashboard',
        'rateio': 'Rateio',
        'historico': 'Histórico',
        'veiculos': 'Veículos',
        'relatorios': 'Relatórios',
        'configuracoes': 'Configurações'
    };
    document.getElementById('page-title').textContent = titles[pagina];
    
    // Atualizar conteúdo específico da página
    if (pagina === 'dashboard') {
        atualizarDashboard();
    } else if (pagina === 'historico') {
        atualizarTabelaHistorico();
    } else if (pagina === 'veiculos') {
        atualizarGridVeiculos();
    }
}

function mostrarToast(mensagem, tipo = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const icon = toast.querySelector('i');
    
    toastMessage.textContent = mensagem;
    
    if (tipo === 'success') {
        icon.className = 'fas fa-check-circle';
        toast.style.background = 'linear-gradient(135deg, #06d6a0 0%, #05b588 100%)';
    } else if (tipo === 'error') {
        icon.className = 'fas fa-exclamation-circle';
        toast.style.background = 'linear-gradient(135deg, #ef476f 0%, #d43f63 100%)';
    } else if (tipo === 'warning') {
        icon.className = 'fas fa-exclamation-triangle';
        toast.style.background = 'linear-gradient(135deg, #ffd166 0%, #ffb347 100%)';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function atualizarDataAtual() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('pt-BR', options);
    document.getElementById('currentDate').textContent = today;
}

// ============================================
// FUNÇÕES DE VEÍCULOS
// ============================================

function gerarVeiculos(rota, qtd) {
    let container = document.getElementById("veiculos" + rota);
    container.innerHTML = "";
    
    for (let i = 0; i < qtd; i++) {
        let veiculoDiv = document.createElement('div');
        veiculoDiv.className = 'veiculo-card';
        veiculoDiv.style.animation = 'fadeIn 0.3s ease';
        veiculoDiv.style.animationDelay = `${i * 0.1}s`;
        
        // Verificar se existe veículo cadastrado para sugerir nome
        const veiculoSugerido = veiculosCadastrados.find(v => v.rotaPadrao == rota);
        const nomeSugerido = veiculoSugerido ? veiculoSugerido.nome : `Veículo ${i + 1}`;
        
        veiculoDiv.innerHTML = `
            <h4><i class="fas fa-bus"></i> ${nomeSugerido}</h4>
            <div class="input-group">
                <label><i class="fas fa-tag"></i> Nome:</label>
                <input type="text" value="${nomeSugerido}" placeholder="Ex: Ônibus A">
            </div>
            <div class="input-group">
                <label><i class="fas fa-dollar-sign"></i> Diária (R$):</label>
                <input type="number" step="0.01" min="0" value="150">
            </div>
            <div class="input-group">
                <label><i class="fas fa-calendar-alt"></i> Nº Diárias:</label>
                <input type="number" min="0" value="1">
            </div>
        `;
        
        container.appendChild(veiculoDiv);
    }
    
    // Atualizar contador de veículos
    document.getElementById(`totalVeiculos${rota}`).textContent = qtd;
}

function calcularTotalRota(rota) {
    let container = document.getElementById("veiculos" + rota);
    let veiculos = container.querySelectorAll(".veiculo-card");
    let total = 0;
    
    veiculos.forEach(veiculo => {
        let inputs = veiculo.querySelectorAll("input");
        if (inputs.length >= 3) {
            let diaria = parseFloat(inputs[1].value) || 0;
            let qtd = parseFloat(inputs[2].value) || 0;
            total += diaria * qtd;
        }
    });
    
    return total;
}

// ============================================
// FUNÇÕES DE CÁLCULO
// ============================================

function calcular() {
    // Cálculos principais
    let bruto0 = calcularTotalRota(0);
    let bruto1 = calcularTotalRota(1);
    let brutoGeral = bruto0 + bruto1;

    let auxTotal = parseFloat(document.getElementById("auxilioTotal").value) || 0;

    let passagens0 = parseFloat(document.getElementById("passagens0").value) || 0;
    let passagens1 = parseFloat(document.getElementById("passagens1").value) || 0;

    // Rateio do auxílio
    let aux0 = brutoGeral > 0 ? (bruto0 / brutoGeral) * auxTotal : 0;
    let aux1 = brutoGeral > 0 ? (bruto1 / brutoGeral) * auxTotal : 0;

    let rateio0 = bruto0 - aux0 - passagens0;
    let rateio1 = bruto1 - aux1 - passagens1;

    let integral0 = parseInt(document.getElementById("integral0").value) || 0;
    let desc0 = parseInt(document.getElementById("desc0").value) || 0;

    let integral1 = parseInt(document.getElementById("integral1").value) || 0;
    let desc1 = parseInt(document.getElementById("desc1").value) || 0;

    let peso0 = integral0 + (desc0 * 0.5);
    let peso1 = integral1 + (desc1 * 0.5);

    let valorInt0 = peso0 > 0 ? rateio0 / peso0 : 0;
    let valorDesc0 = valorInt0 / 2;

    let valorInt1 = peso1 > 0 ? rateio1 / peso1 : 0;
    let valorDesc1 = valorInt1 / 2;

    // Atualizar tabela de resultado
    let tbody = document.querySelector("#tabelaResultado tbody");
    tbody.innerHTML = `
        <tr>
            <td><i class="fas fa-map-pin" style="color: #4361ee;"></i> 7 Lagoas</td>
            <td>R$ ${bruto0.toFixed(2)}</td>
            <td>R$ ${aux0.toFixed(2)}</td>
            <td>R$ ${passagens0.toFixed(2)}</td>
            <td class="destaque">R$ ${rateio0.toFixed(2)}</td>
            <td>R$ ${valorInt0.toFixed(2)}</td>
            <td>R$ ${valorDesc0.toFixed(2)}</td>
        </tr>
        <tr>
            <td><i class="fas fa-map-pin" style="color: #06d6a0;"></i> Curvelo</td>
            <td>R$ ${bruto1.toFixed(2)}</td>
            <td>R$ ${aux1.toFixed(2)}</td>
            <td>R$ ${passagens1.toFixed(2)}</td>
            <td class="destaque">R$ ${rateio1.toFixed(2)}</td>
            <td>R$ ${valorInt1.toFixed(2)}</td>
            <td>R$ ${valorDesc1.toFixed(2)}</td>
        </tr>
    `;

    // Mostrar preview do resultado
    document.getElementById('resultadoPreview').style.display = 'block';

    return {
        rotas: [
            { nome: '7 Lagoas', bruto: bruto0, auxilio: aux0, passagens: passagens0, rateio: rateio0, integral: valorInt0, meia: valorDesc0 },
            { nome: 'Curvelo', bruto: bruto1, auxilio: aux1, passagens: passagens1, rateio: rateio1, integral: valorInt1, meia: valorDesc1 }
        ],
        totalGeral: brutoGeral,
        auxTotal: auxTotal
    };
}

function calcularComHistorico() {
    const resultado = calcular();
    
    // Obter descrição
    let descricao = document.getElementById('rateioDescricao').value;
    if (!descricao) {
        descricao = `Rateio - ${new Date().toLocaleDateString('pt-BR')}`;
    }
    
    // Obter data
    let dataInput = document.getElementById('rateioData').value;
    let data = dataInput ? dataInput : new Date().toLocaleDateString('pt-BR');
    
    // Criar registro de histórico
    const registro = {
        id: Date.now(),
        data: data,
        descricao: descricao,
        auxTotal: resultado.auxTotal,
        totalGeral: resultado.totalGeral,
        rotas: resultado.rotas,
        timestamp: new Date().toISOString()
    };
    
    // Adicionar ao histórico
    historicoRateios.unshift(registro);
    
    // Limitar histórico a 100 itens
    if (historicoRateios.length > 100) {
        historicoRateios = historicoRateios.slice(0, 100);
    }
    
    // Salvar no localStorage
    salvarHistorico();
    
    // Atualizar interfaces
    atualizarTabelaRecente();
    atualizarDashboard();
    
    mostrarToast('Rateio salvo no histórico com sucesso!');
}

// ============================================
// FUNÇÕES DE HISTÓRICO
// ============================================

function salvarHistorico() {
    localStorage.setItem('historicoRateios', JSON.stringify(historicoRateios));
}

function carregarHistorico() {
    const historicoSalvo = localStorage.getItem('historicoRateios');
    if (historicoSalvo) {
        historicoRateios = JSON.parse(historicoSalvo);
    } else {
        // Dados de exemplo para demonstração
        historicoRateios = gerarDadosExemplo();
    }
}

function gerarDadosExemplo() {
    const dados = [];
    const hoje = new Date();
    
    for (let i = 0; i < 30; i++) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        
        const bruto0 = Math.random() * 5000 + 3000;
        const bruto1 = Math.random() * 4000 + 2000;
        const auxTotal = 4000;
        const passagens0 = Math.random() * 500;
        const passagens1 = Math.random() * 500;
        
        dados.push({
            id: Date.now() - i * 86400000,
            data: data.toLocaleDateString('pt-BR'),
            descricao: `Rateio ${data.toLocaleDateString('pt-BR')}`,
            auxTotal: auxTotal,
            totalGeral: bruto0 + bruto1,
            rotas: [
                { nome: '7 Lagoas', bruto: bruto0, auxilio: (bruto0/(bruto0+bruto1))*auxTotal, passagens: passagens0, rateio: bruto0 - (bruto0/(bruto0+bruto1))*auxTotal - passagens0 },
                { nome: 'Curvelo', bruto: bruto1, auxilio: (bruto1/(bruto0+bruto1))*auxTotal, passagens: passagens1, rateio: bruto1 - (bruto1/(bruto0+bruto1))*auxTotal - passagens1 }
            ]
        });
    }
    
    return dados;
}

function atualizarTabelaRecente() {
    const tbody = document.getElementById('recentTableBody');
    if (!tbody) return;
    
    const recentes = historicoRateios.slice(0, 5);
    
    tbody.innerHTML = recentes.map(item => {
        let rows = '';
        item.rotas.forEach(rota => {
            rows += `
                <tr>
                    <td>${item.data}</td>
                    <td>${rota.nome}</td>
                    <td>R$ ${rota.rateio.toFixed(2)}</td>
                    <td><span class="badge-status success">Concluído</span></td>
                </tr>
            `;
        });
        return rows;
    }).join('');
}

function atualizarTabelaHistorico() {
    const tbody = document.getElementById('historicoTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = historicoRateios.map(item => {
        let rows = '';
        item.rotas.forEach((rota, index) => {
            rows += `
                <tr>
                    ${index === 0 ? `<td rowspan="${item.rotas.length}">${item.data}</td>` : ''}
                    ${index === 0 ? `<td rowspan="${item.rotas.length}">${item.descricao}</td>` : ''}
                    <td>${rota.nome}</td>
                    <td>R$ ${rota.bruto.toFixed(2)}</td>
                    <td>R$ ${rota.auxilio.toFixed(2)}</td>
                    <td>R$ ${rota.passagens.toFixed(2)}</td>
                    <td>R$ ${rota.rateio.toFixed(2)}</td>
                    <td>
                        <button class="btn-icon" onclick="visualizarRateio(${item.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" onclick="excluirRateio(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        return rows;
    }).join('');
}

function visualizarRateio(id) {
    const rateio = historicoRateios.find(r => r.id === id);
    if (!rateio) return;
    
    // Preencher formulário com dados do histórico
    document.getElementById('auxilioTotal').value = rateio.auxTotal;
    
    // Preencher rotas
    rateio.rotas.forEach((rota, index) => {
        if (rota.nome.includes('7 Lagoas')) {
            document.getElementById('integral0').value = 12; // Ideal seria salvar também
            document.getElementById('desc0').value = 2;
            document.getElementById('passagens0').value = rota.passagens;
        } else {
            document.getElementById('integral1').value = 12;
            document.getElementById('desc1').value = 2;
            document.getElementById('passagens1').value = rota.passagens;
        }
    });
    
    // Mudar para página de rateio
    mudarPagina('rateio');
    
    // Calcular
    calcular();
    
    mostrarToast('Rateio carregado com sucesso!');
}

function excluirRateio(id) {
    if (confirm('Tem certeza que deseja excluir este rateio?')) {
        historicoRateios = historicoRateios.filter(r => r.id !== id);
        salvarHistorico();
        atualizarTabelaHistorico();
        atualizarDashboard();
        mostrarToast('Rateio excluído com sucesso!');
    }
}

function filtrarHistorico() {
    const busca = document.getElementById('historicoBusca').value.toLowerCase();
    const periodo = document.getElementById('historicoPeriodo').value;
    
    let filtrados = [...historicoRateios];
    
    // Filtrar por busca
    if (busca) {
        filtrados = filtrados.filter(item => 
            item.descricao.toLowerCase().includes(busca) ||
            item.rotas.some(r => r.nome.toLowerCase().includes(busca))
        );
    }
    
    // Filtrar por período
    if (periodo !== 'all') {
        const hoje = new Date();
        filtrados = filtrados.filter(item => {
            const [dia, mes, ano] = item.data.split('/');
            const dataItem = new Date(ano, mes - 1, dia);
            
            if (periodo === 'today') {
                return dataItem.toDateString() === hoje.toDateString();
            } else if (periodo === 'week') {
                const umaSemana = new Date(hoje);
                umaSemana.setDate(hoje.getDate() - 7);
                return dataItem >= umaSemana;
            } else if (periodo === 'month') {
                return dataItem.getMonth() === hoje.getMonth() && 
                       dataItem.getFullYear() === hoje.getFullYear();
            }
        });
    }
    
    // Atualizar tabela com filtrados
    const tbody = document.getElementById('historicoTableBody');
    tbody.innerHTML = filtrados.map(item => {
        let rows = '';
        item.rotas.forEach((rota, index) => {
            rows += `
                <tr>
                    ${index === 0 ? `<td rowspan="${item.rotas.length}">${item.data}</td>` : ''}
                    ${index === 0 ? `<td rowspan="${item.rotas.length}">${item.descricao}</td>` : ''}
                    <td>${rota.nome}</td>
                    <td>R$ ${rota.bruto.toFixed(2)}</td>
                    <td>R$ ${rota.auxilio.toFixed(2)}</td>
                    <td>R$ ${rota.passagens.toFixed(2)}</td>
                    <td>R$ ${rota.rateio.toFixed(2)}</td>
                    <td>
                        <button class="btn-icon" onclick="visualizarRateio(${item.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" onclick="excluirRateio(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        return rows;
    }).join('');
}

function limparHistorico() {
    if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
        historicoRateios = [];
        salvarHistorico();
        atualizarTabelaHistorico();
        atualizarDashboard();
        mostrarToast('Histórico limpo com sucesso!');
    }
}

function exportarHistoricoCSV() {
    let csv = 'Data,Descrição,Rota,Total Bruto,Auxílio,Passagens,Total Rateado\n';
    
    historicoRateios.forEach(item => {
        item.rotas.forEach(rota => {
            csv += `${item.data},${item.descricao},${rota.nome},${rota.bruto.toFixed(2)},${rota.auxilio.toFixed(2)},${rota.passagens.toFixed(2)},${rota.rateio.toFixed(2)}\n`;
        });
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico_rateios_${new Date().toLocaleDateString()}.csv`;
    a.click();
    
    mostrarToast('CSV exportado com sucesso!');
}

// ============================================
// FUNÇÕES DE DASHBOARD
// ============================================

function atualizarDashboard() {
    atualizarStats();
    atualizarGraficos();
}

function atualizarStats() {
    if (historicoRateios.length === 0) return;
    
    // Total rateado no mês
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    
    let totalRateadoMes = 0;
    let totalVeiculos = 0;
    let totalAlunos = 0;
    
    historicoRateios.forEach(item => {
        const [dia, mes, ano] = item.data.split('/');
        if (parseInt(mes) - 1 === mesAtual && parseInt(ano) === anoAtual) {
            item.rotas.forEach(rota => {
                totalRateadoMes += rota.rateio;
            });
        }
        
        // Estimar veículos e alunos (baseado no último rateio)
        if (item === historicoRateios[0]) {
            item.rotas.forEach(rota => {
                if (rota.nome.includes('7 Lagoas')) {
                    totalVeiculos += 1; // Simplificado
                    totalAlunos += 14; // 12 integrais + 2 meias
                } else {
                    totalVeiculos += 1;
                    totalAlunos += 14;
                }
            });
        }
    });
    
    // Ticket médio
    const ticketMedio = totalAlunos > 0 ? totalRateadoMes / totalAlunos : 0;
    
    document.getElementById('totalRateadoMes').textContent = `R$ ${totalRateadoMes.toFixed(2)}`;
    document.getElementById('totalVeiculos').textContent = totalVeiculos;
    document.getElementById('totalAlunos').textContent = totalAlunos;
    document.getElementById('ticketMedio').textContent = `R$ ${ticketMedio.toFixed(2)}`;
}

function atualizarGraficos() {
    const periodo = document.getElementById('chartPeriod')?.value || 30;
    
    // Preparar dados para o gráfico comparativo
    const ultimosRateios = historicoRateios.slice(0, parseInt(periodo));
    
    const dados7Lagoas = [];
    const dadosCurvelo = [];
    const labels = [];
    
    ultimosRateios.reverse().forEach(item => {
        labels.push(item.data);
        const rota0 = item.rotas.find(r => r.nome.includes('7 Lagoas'));
        const rota1 = item.rotas.find(r => r.nome.includes('Curvelo'));
        dados7Lagoas.push(rota0 ? rota0.rateio : 0);
        dadosCurvelo.push(rota1 ? rota1.rateio : 0);
    });
    
    // Gráfico Comparativo
    const optionsComparativo = {
        series: [
            {
                name: '7 Lagoas',
                data: dados7Lagoas
            },
            {
                name: 'Curvelo',
                data: dadosCurvelo
            }
        ],
        chart: {
            type: 'area',
            height: 350,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            }
        },
        colors: ['#4361ee', '#06d6a0'],
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.3
            }
        },
        xaxis: {
            categories: labels,
            labels: {
                rotate: -45,
                rotateAlways: true,
                style: {
                    fontSize: '10px'
                }
            }
        },
        yaxis: {
            title: {
                text: 'Valor (R$)'
            },
            labels: {
                formatter: function(value) {
                    return 'R$ ' + value.toFixed(2);
                }
            }
        },
        tooltip: {
            y: {
                formatter: function(value) {
                    return 'R$ ' + value.toFixed(2);
                }
            }
        },
        legend: {
            position: 'top'
        }
    };
    
    if (graficoComparativo) {
        graficoComparativo.destroy();
    }
    
    graficoComparativo = new ApexCharts(document.querySelector("#comparativoChart"), optionsComparativo);
    graficoComparativo.render();
    
    // Gráfico de Distribuição
    if (historicoRateios.length > 0) {
        const ultimo = historicoRateios[0];
        const totalGeral = ultimo.totalGeral;
        const totalAuxilio = ultimo.auxTotal;
        const totalPassagens = ultimo.rotas.reduce((acc, r) => acc + r.passagens, 0);
        const totalRateado = ultimo.rotas.reduce((acc, r) => acc + r.rateio, 0);
        
        const optionsDistribuicao = {
            series: [totalGeral, totalAuxilio, totalPassagens, totalRateado],
            chart: {
                type: 'donut',
                height: 350
            },
            labels: ['Total Bruto', 'Auxílio', 'Passagens', 'Total Rateado'],
            colors: ['#4361ee', '#06d6a0', '#ffd166', '#ef476f'],
            plotOptions: {
                pie: {
                    donut: {
                        size: '70%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total',
                                formatter: function(w) {
                                    return 'R$ ' + totalGeral.toFixed(2);
                                }
                            }
                        }
                    }
                }
            },
            dataLabels: {
                enabled: true,
                formatter: function(val) {
                    return val.toFixed(1) + '%';
                }
            },
            legend: {
                position: 'bottom'
            },
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        width: 300
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }]
        };
        
        if (graficoDistribuicao) {
            graficoDistribuicao.destroy();
        }
        
        graficoDistribuicao = new ApexCharts(document.querySelector("#distribuicaoChart"), optionsDistribuicao);
        graficoDistribuicao.render();
    }
}

// ============================================
// FUNÇÕES DE VEÍCULOS (CADASTRO)
// ============================================

function carregarVeiculos() {
    const veiculosSalvos = localStorage.getItem('veiculosCadastrados');
    if (veiculosSalvos) {
        veiculosCadastrados = JSON.parse(veiculosSalvos);
    } else {
        // Dados de exemplo
        veiculosCadastrados = [
            { id: 1, nome: 'Ônibus A', placa: 'ABC-1234', capacidade: 45, rotaPadrao: 0 },
            { id: 2, nome: 'Ônibus B', placa: 'DEF-5678', capacidade: 45, rotaPadrao: 0 },
            { id: 3, nome: 'Van Escolar', placa: 'GHI-9012', capacidade: 20, rotaPadrao: 1 }
        ];
    }
}

function salvarVeiculos() {
    localStorage.setItem('veiculosCadastrados', JSON.stringify(veiculosCadastrados));
}

function atualizarGridVeiculos() {
    const grid = document.getElementById('veiculosGrid');
    if (!grid) return;
    
    grid.innerHTML = veiculosCadastrados.map(veiculo => `
        <div class="veiculo-card-detalhado">
            <div class="veiculo-header">
                <i class="fas fa-bus"></i>
                <h4>${veiculo.nome}</h4>
                <span class="veiculo-status ativo">Ativo</span>
            </div>
            <div class="veiculo-body">
                <p><i class="fas fa-id-card"></i> Placa: ${veiculo.placa}</p>
                <p><i class="fas fa-users"></i> Capacidade: ${veiculo.capacidade} alunos</p>
                <p><i class="fas fa-route"></i> Rota: ${veiculo.rotaPadrao == 0 ? '7 Lagoas' : 'Curvelo'}</p>
            </div>
            <div class="veiculo-footer">
                <button class="btn-icon" onclick="editarVeiculo(${veiculo.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="excluirVeiculo(${veiculo.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function abrirModalVeiculo() {
    document.getElementById('veiculoModal').style.display = 'flex';
    document.getElementById('veiculoNome').value = '';
    document.getElementById('veiculoPlaca').value = '';
    document.getElementById('veiculoCapacidade').value = '';
    document.getElementById('veiculoRota').value = '0';
}

function fecharModalVeiculo() {
    document.getElementById('veiculoModal').style.display = 'none';
}

function salvarVeiculo() {
    const nome = document.getElementById('veiculoNome').value;
    const placa = document.getElementById('veiculoPlaca').value;
    const capacidade = document.getElementById('veiculoCapacidade').value;
    const rota = document.getElementById('veiculoRota').value;
    
    if (!nome || !placa || !capacidade) {
        mostrarToast('Preencha todos os campos!', 'warning');
        return;
    }
    
    const novoVeiculo = {
        id: Date.now(),
        nome: nome,
        placa: placa,
        capacidade: parseInt(capacidade),
        rotaPadrao: parseInt(rota)
    };
    
    veiculosCadastrados.push(novoVeiculo);
    salvarVeiculos();
    atualizarGridVeiculos();
    fecharModalVeiculo();
    
    mostrarToast('Veículo cadastrado com sucesso!');
}

function editarVeiculo(id) {
    const veiculo = veiculosCadastrados.find(v => v.id === id);
    if (!veiculo) return;
    
    document.getElementById('veiculoNome').value = veiculo.nome;
    document.getElementById('veiculoPlaca').value = veiculo.placa;
    document.getElementById('veiculoCapacidade').value = veiculo.capacidade;
    document.getElementById('veiculoRota').value = veiculo.rotaPadrao;
    
    abrirModalVeiculo();
    
    // Remover veículo antigo
    veiculosCadastrados = veiculosCadastrados.filter(v => v.id !== id);
}

function excluirVeiculo(id) {
    if (confirm('Tem certeza que deseja excluir este veículo?')) {
        veiculosCadastrados = veiculosCadastrados.filter(v => v.id !== id);
        salvarVeiculos();
        atualizarGridVeiculos();
        mostrarToast('Veículo excluído com sucesso!');
    }
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function atualizarContadoresAlunos() {
    const integral0 = parseInt(document.getElementById('integral0').value) || 0;
    const desc0 = parseInt(document.getElementById('desc0').value) || 0;
    const integral1 = parseInt(document.getElementById('integral1').value) || 0;
    const desc1 = parseInt(document.getElementById('desc1').value) || 0;
    
    document.getElementById('totalAlunos0').textContent = integral0 + desc0;
    document.getElementById('totalAlunos1').textContent = integral1 + desc1;
}

function salvarRascunho() {
    const rascunho = {
        auxTotal: document.getElementById('auxilioTotal').value,
        integral0: document.getElementById('integral0').value,
        desc0: document.getElementById('desc0').value,
        passagens0: document.getElementById('passagens0').value,
        integral1: document.getElementById('integral1').value,
        desc1: document.getElementById('desc1').value,
        passagens1: document.getElementById('passagens1').value,
        descricao: document.getElementById('rateioDescricao').value,
        data: document.getElementById('rateioData').value
    };
    
    localStorage.setItem('rascunhoRateio', JSON.stringify(rascunho));
    mostrarToast('Rascunho salvo com sucesso!');
}

function carregarRascunho() {
    const rascunho = localStorage.getItem('rascunhoRateio');
    if (!rascunho) {
        mostrarToast('Nenhum rascunho encontrado!', 'warning');
        return;
    }
    
    const dados = JSON.parse(rascunho);
    
    document.getElementById('auxilioTotal').value = dados.auxTotal || 4000;
    document.getElementById('integral0').value = dados.integral0 || 12;
    document.getElementById('desc0').value = dados.desc0 || 2;
    document.getElementById('passagens0').value = dados.passagens0 || 0;
    document.getElementById('integral1').value = dados.integral1 || 12;
    document.getElementById('desc1').value = dados.desc1 || 2;
    document.getElementById('passagens1').value = dados.passagens1 || 0;
    document.getElementById('rateioDescricao').value = dados.descricao || '';
    document.getElementById('rateioData').value = dados.data || '';
    
    mostrarToast('Rascunho carregado com sucesso!');
}

function exportarJSON() {
    const dados = {
        data: new Date().toISOString(),
        configuracoes: {
            auxTotal: document.getElementById('auxilioTotal').value,
            integral0: document.getElementById('integral0').value,
            desc0: document.getElementById('desc0').value,
            passagens0: document.getElementById('passagens0').value,
            integral1: document.getElementById('integral1').value,
            desc1: document.getElementById('desc1').value,
            passagens1: document.getElementById('passagens1').value,
            descricao: document.getElementById('rateioDescricao').value
        },
        veiculos: veiculosCadastrados
    };
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transporte_dados_${new Date().toLocaleDateString()}.json`;
    a.click();
    
    mostrarToast('Dados exportados com sucesso!');
}

// ============================================
// FUNÇÕES DE RELATÓRIOS
// ============================================

async function gerarRelatorioMensal() {
    const { jsPDF } = window.jspdf;
    let doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    // Cabeçalho
    doc.setFillColor(67, 97, 238);
    doc.rect(0, 0, 297, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório Mensal de Transporte', 20, 13);

    // Data
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    doc.text(`Gerado em: ${dataAtual}`, 250, 13);

    // Filtrar dados do mês atual
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    
    const rateiosMes = historicoRateios.filter(item => {
        const [dia, mes, ano] = item.data.split('/');
        return parseInt(mes) - 1 === mesAtual && parseInt(ano) === anoAtual;
    });

    // Resumo
    doc.setTextColor(43, 45, 66);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo do Mês', 20, 35);

    let totalBruto = 0;
    let totalAuxilio = 0;
    let totalPassagens = 0;
    let totalRateado = 0;

    rateiosMes.forEach(item => {
        totalBruto += item.totalGeral;
        totalAuxilio += item.auxTotal;
        item.rotas.forEach(rota => {
            totalPassagens += rota.passagens;
            totalRateado += rota.rateio;
        });
    });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de rateios: ${rateiosMes.length}`, 20, 45);
    doc.text(`Total bruto: R$ ${totalBruto.toFixed(2)}`, 20, 52);
    doc.text(`Total auxílio: R$ ${totalAuxilio.toFixed(2)}`, 20, 59);
    doc.text(`Total passagens: R$ ${totalPassagens.toFixed(2)}`, 20, 66);
    doc.text(`Total rateado: R$ ${totalRateado.toFixed(2)}`, 20, 73);

    // Tabela de rateios
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalhamento dos Rateios', 20, 90);

    const cabecalhos = ['Data', 'Descrição', 'Rota', 'Total Bruto', 'Auxílio', 'Passagens', 'Rateado'];
    const dados = [];

    rateiosMes.forEach(item => {
        item.rotas.forEach(rota => {
            dados.push([
                item.data,
                item.descricao,
                rota.nome,
                `R$ ${rota.bruto.toFixed(2)}`,
                `R$ ${rota.auxilio.toFixed(2)}`,
                `R$ ${rota.passagens.toFixed(2)}`,
                `R$ ${rota.rateio.toFixed(2)}`
            ]);
        });
    });

    doc.autoTable({
        head: [cabecalhos],
        body: dados,
        startY: 95,
        theme: 'grid',
        styles: {
            fontSize: 9,
            cellPadding: 3,
            font: 'helvetica'
        },
        headStyles: {
            fillColor: [67, 97, 238],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        }
    });

    doc.save('relatorio_mensal_transporte.pdf');
    mostrarToast('Relatório mensal gerado com sucesso!');
}

function gerarRelatorioRotas() {
    mostrarToast('Gerando relatório por rotas...');
    // Implementação similar ao mensal
    gerarRelatorioMensal();
}

function gerarRelatorioFinanceiro() {
    mostrarToast('Gerando relatório financeiro...');
    // Implementação similar ao mensal
    gerarRelatorioMensal();
}

function gerarRelatorioVeiculos() {
    mostrarToast('Gerando relatório de veículos...');
    // Implementação específica para veículos
}

// ============================================
// INICIALIZAÇÃO DOS GRÁFICOS NA PÁGINA DE RATEIO
// ============================================

// Chamar calcular inicial para mostrar preview
setTimeout(() => {
    if (document.getElementById('tabelaResultado')) {
        calcular();
    }
}, 500);
