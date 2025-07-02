// Dados dos aparelhos (potência em Watts)
const aparelhos = {
    lampadas: { potencia: 10, nome: 'Lâmpadas LED' },
    chuveiro: { potencia: 5500, nome: 'Chuveiro Elétrico' },
    geladeira: { potencia: 150, nome: 'Geladeira' },
    tv: { potencia: 100, nome: 'TV' },
    computador: { potencia: 300, nome: 'Computador' },
    ar: { potencia: 1500, nome: 'Ar-condicionado' },
    ventilador: { potencia: 65, nome: 'Ventilador' },
    maquina: { potencia: 500, nome: 'Máquina de Lavar' }
};

// Dados das usinas
const usinas = {
    hidreletrica: {
        nome: 'UHE Volta Grande',
        potencia: 380, // MW
        areaAlagada: 76, // km²
        camposFutebol: 7600 // equivalência em campos de futebol
    },
    termeletrica: {
        nome: 'Termelétrica a Carvão',
        potencia: 857, // MW
        emissaoCO2PorMWh: 1000 // kg CO2 por MWh
    },
    biomassa: {
        nome: 'UTE Uberaba 2',
        potencia: 35 // MW
    }
};

// População de Uberaba
const populacaoUberaba = 352000;

// Variáveis globais para armazenar resultados
let consumoDiario = 0;
let consumoMensal = 0;
let consumoTotalCidade = 0;

// Função para calcular consumo individual
function calcularConsumo() {
    let consumoTotal = 0;
    
    Object.keys(aparelhos).forEach(aparelho => {
        const qtd = parseInt(document.getElementById(`${aparelho}-qtd`).value) || 0;
        const horas = parseFloat(document.getElementById(`${aparelho}-horas`).value) || 0;
        const potencia = aparelhos[aparelho].potencia;
        
        // Consumo em kWh por dia = (Potência em W × Horas × Quantidade) / 1000
        const consumoAparelho = (potencia * horas * qtd) / 1000;
        consumoTotal += consumoAparelho;
    });
    
    consumoDiario = consumoTotal;
    consumoMensal = consumoTotal * 30;
    
    // Atualizar display
    document.getElementById('consumo-diario').textContent = consumoDiario.toFixed(2);
    document.getElementById('consumo-mensal').textContent = consumoMensal.toFixed(2);
}

// Função para calcular projeção para a cidade
function calcularProjecaoCidade() {
    consumoTotalCidade = consumoMensal * populacaoUberaba;
    const consumoTotalGWh = consumoTotalCidade / 1000000; // Converter para GWh
    
    // Atualizar displays do passo 2
    document.getElementById('consumo-individual-display').textContent = consumoMensal.toFixed(2);
    document.getElementById('consumo-total-cidade').textContent = consumoTotalCidade.toLocaleString('pt-BR');
    document.getElementById('consumo-total-gwh').textContent = consumoTotalGWh.toFixed(2);
    
    // Criar gráfico
    criarGraficoConsumo();
}

// Função para calcular necessidade de usinas
function calcularNecessidadeUsinas() {
    // Converter consumo mensal para MW médio
    // 1 kWh/mês = 1000 Wh / (30 dias × 24 horas) = 1.39 W médio
    const potenciaMediaNecessaria = (consumoTotalCidade * 1000) / (30 * 24); // W
    const potenciaMediaMW = potenciaMediaNecessaria / 1000000; // MW
    
    // Calcular número de usinas necessárias
    const usinasHidreletricas = Math.ceil(potenciaMediaMW / usinas.hidreletrica.potencia);
    const usinasTermeletricas = Math.ceil(potenciaMediaMW / usinas.termeletrica.potencia);
    const usinasBiomassa = Math.ceil(potenciaMediaMW / usinas.biomassa.potencia);
    
    // Calcular impactos
    const areaAlagadaTotal = usinasHidreletricas * usinas.hidreletrica.areaAlagada;
    const camposFutebolTotal = usinasHidreletricas * usinas.hidreletrica.camposFutebol;
    
    // Calcular emissões de CO2 (termelétricas)
    const consumoAnualMWh = (consumoTotalCidade * 12) / 1000; // MWh por ano
    const emissaoAnualCO2 = consumoAnualMWh * usinas.termeletrica.emissaoCO2PorMWh; // kg CO2
    const carrosEquivalentes = Math.round(emissaoAnualCO2 / 4600); // 4.6 toneladas CO2 por carro/ano
    
    // Atualizar displays do passo 3
    document.getElementById('usinas-hidreletricas').textContent = usinasHidreletricas;
    document.getElementById('usinas-termeletricas').textContent = usinasTermeletricas;
    document.getElementById('usinas-biomassa').textContent = usinasBiomassa;
    document.getElementById('campos-futebol').textContent = camposFutebolTotal.toLocaleString('pt-BR');
    document.getElementById('carros-equivalentes').textContent = Math.round(carrosEquivalentes / 1000);
    
    // Atualizar resumo do passo 4
    document.getElementById('resumo-consumo').textContent = consumoMensal.toFixed(2);
    document.getElementById('resumo-cidade').textContent = (consumoTotalCidade / 1000000).toFixed(2);
    document.getElementById('resumo-usinas').textContent = usinasHidreletricas;
}

// Função para criar gráfico de consumo
function criarGraficoConsumo() {
    const canvas = document.getElementById('grafico-consumo');
    const ctx = canvas.getContext('2d');
    
    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Configurações do gráfico
    const padding = 60;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    // Dados para o gráfico
    const dados = [
        { label: 'Você', valor: consumoMensal, cor: '#3498db' },
        { label: 'Sua Rua (100 casas)', valor: consumoMensal * 100, cor: '#f39c12' },
        { label: 'Seu Bairro (10.000 casas)', valor: consumoMensal * 10000, cor: '#e74c3c' },
        { label: 'Uberaba (352.000 hab.)', valor: consumoTotalCidade, cor: '#9b59b6' }
    ];
    
    const valorMaximo = Math.max(...dados.map(d => d.valor));
    const barWidth = chartWidth / dados.length * 0.8;
    const barSpacing = chartWidth / dados.length * 0.2;
    
    // Desenhar barras
    dados.forEach((item, index) => {
        const barHeight = (item.valor / valorMaximo) * chartHeight;
        const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
        const y = padding + chartHeight - barHeight;
        
        // Barra
        ctx.fillStyle = item.cor;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Label
        ctx.fillStyle = '#333';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, x + barWidth / 2, canvas.height - padding + 20);
        
        // Valor
        ctx.fillStyle = '#666';
        ctx.font = '10px Inter';
        const valorFormatado = item.valor > 1000000 ? 
            (item.valor / 1000000).toFixed(1) + 'M' : 
            item.valor.toLocaleString('pt-BR');
        ctx.fillText(valorFormatado + ' kWh', x + barWidth / 2, y - 10);
    });
    
    // Título do gráfico
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 16px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Projeção do Consumo de Energia', canvas.width / 2, 30);
}

// Funções de navegação
function irParaPasso2() {
    calcularConsumo();
    calcularProjecaoCidade();
    mostrarPasso(2);
}

function irParaPasso3() {
    calcularNecessidadeUsinas();
    mostrarPasso(3);
}

function irParaPasso4() {
    mostrarPasso(4);
}

function mostrarPasso(numero) {
    // Esconder todos os passos
    document.querySelectorAll('.passo').forEach(passo => {
        passo.classList.remove('ativo');
    });
    
    // Mostrar passo específico
    document.getElementById(`passo${numero}`).classList.add('ativo');
    
    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function recomecarSimulacao() {
    // Resetar valores
    Object.keys(aparelhos).forEach(aparelho => {
        document.getElementById(`${aparelho}-qtd`).value = getValorPadrao(aparelho, 'qtd');
        document.getElementById(`${aparelho}-horas`).value = getValorPadrao(aparelho, 'horas');
    });
    
    // Voltar para o primeiro passo
    mostrarPasso(1);
    calcularConsumo();
}

function getValorPadrao(aparelho, tipo) {
    const padroes = {
        lampadas: { qtd: 10, horas: 6 },
        chuveiro: { qtd: 1, horas: 1 },
        geladeira: { qtd: 1, horas: 24 },
        tv: { qtd: 2, horas: 6 },
        computador: { qtd: 1, horas: 8 },
        ar: { qtd: 1, horas: 8 },
        ventilador: { qtd: 3, horas: 10 },
        maquina: { qtd: 1, horas: 1 }
    };
    
    return padroes[aparelho][tipo];
}

function compartilharResultados() {
    const texto = `🔌 Simulador de Energia - Uberaba

Meu consumo mensal: ${consumoMensal.toFixed(2)} kWh
Se toda Uberaba consumisse igual: ${(consumoTotalCidade / 1000000).toFixed(2)} GWh/mês
Usinas hidrelétricas necessárias: ${document.getElementById('resumo-usinas').textContent}

💡 A energia mais limpa é aquela que não usamos!
Vamos economizar energia e proteger nosso planeta! 🌍

#EnergiaLimpa #Uberaba #Sustentabilidade`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Simulador de Energia - Uberaba',
            text: texto
        });
    } else {
        // Fallback para copiar para clipboard
        navigator.clipboard.writeText(texto).then(() => {
            alert('Resultados copiados para a área de transferência!');
        });
    }
}

// Event listeners para atualização em tempo real
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar listeners para todos os inputs
    Object.keys(aparelhos).forEach(aparelho => {
        const qtdInput = document.getElementById(`${aparelho}-qtd`);
        const horasInput = document.getElementById(`${aparelho}-horas`);
        
        if (qtdInput) qtdInput.addEventListener('input', calcularConsumo);
        if (horasInput) horasInput.addEventListener('input', calcularConsumo);
    });
    
    // Calcular consumo inicial
    calcularConsumo();
});

// Função para animar números
function animarNumero(elemento, valorFinal, duracao = 1000) {
    const valorInicial = 0;
    const incremento = valorFinal / (duracao / 16);
    let valorAtual = valorInicial;
    
    const timer = setInterval(() => {
        valorAtual += incremento;
        if (valorAtual >= valorFinal) {
            valorAtual = valorFinal;
            clearInterval(timer);
        }
        elemento.textContent = valorAtual.toFixed(2);
    }, 16);
}

// Função para detectar quando um elemento entra na viewport
function observarElementos() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    document.querySelectorAll('.aparelho-card, .projecao-card, .opcao-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Inicializar observador quando a página carregar
document.addEventListener('DOMContentLoaded', observarElementos);

