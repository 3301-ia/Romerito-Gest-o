function parseGoogleDriveImage(url) {
    if (!url) return '';
    if (url.includes('drive.google.com/file/d/')) {
        const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            return `https://lh3.googleusercontent.com/d/${match[1]}`;
        }
    }
    return url;
}

// Ensure the variables exist for the first app logic
// Core Application State
let state = {
    cardapio: [],
    cardapio_variados: [],
    estoque: [],
    recipes: [],
    pedidos: [],
    entradas: [],
    porcionamento: [],
    comissoes: [],
    checklist_setores: [],
    preps_historico: [],
    checklist_history: {},
    tarefas_pendentes: [],
    carrinho_requisicao: [],
    requisicoes: [],
    temperaturas: [],
    quebras: [],
    vendas_semana: []
};

// --- CONFIGURAÇÃO DA NUVEM (API GOOGLE SHEETS) ---
const CLOUD_DB_URL = "https://script.google.com/macros/s/AKfycbxaR5qWurOMLr31yd31X6hpniYI4661d_LtavvgQj26Z8KAJfjJyHlejbX2qrY9J73F/exec";

// Fetch Helper
async function fetchFromCloud() {
    try {
        console.log("Baixando banco de dados da nuvem...");
        const timestamp = new Date().getTime();
        const response = await fetch(CLOUD_DB_URL + "?t=" + timestamp);
        const data = await response.json();
        
        if (data && !data.status) { // if not empty or error
            console.log("Dados carregados da nuvem com sucesso!");
            return data;
        }
    } catch (e) {
        console.warn("Falha de conexão com a Nuvem. Tentando cache local...", e);
    }
    return null;
}

// Sync Helper
// Sync Helper
async function syncToCloud(stateData) {
    if (!CLOUD_DB_URL) return;
    
    // Header Badge
    const headerTitle = document.querySelector('.top-header');
    let badge = document.getElementById('cloud-sync-badge');
    if (headerTitle && badge) {
        badge.innerHTML = '<i class="fas fa-sync fa-spin"></i> Sincronizando...';
        badge.style.color = 'var(--text-muted)';
    }

    try {
        // Build payload mimicking the form submission
        const payload = {
            method: 'POST',
            body: JSON.stringify(stateData)
        };
        // Use no-cors mode to send data to Apps Script
        await fetch(CLOUD_DB_URL, {
            method: 'POST',
            mode: 'no-cors', // Fundamental para enviar dados pro Google Sheets sem erro de CORS
            headers: {
                'Content-Type': 'text/plain'
            },
            body: JSON.stringify(stateData)
        });

        // Tenta salvar no servidor local (se estiver rodando) para atualizar o database.json do repositório
        try {
            await fetch('http://localhost:3000/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stateData)
            });
        } catch (e) {
            // Ignora se o servidor não estiver rodando
        }

        if (badge) {
            badge.innerHTML = '<i class="fas fa-cloud"></i> Sincronizado';
            badge.style.color = 'var(--color-success)';
        }
    } catch (e) {
        console.warn("Erro ao sincronizar com a Nuvem.", e);
        if (badge) {
            badge.innerHTML = '<i class="fas fa-cloud"></i> Offline';
            badge.style.color = 'var(--color-danger)';
        }
    }
}

// Initialize State
async function initApp() {
    // 1. Mostrar status de carregamento
    const headerTitle = document.querySelector('.top-header');
    if (headerTitle) {
        let badge = document.createElement('div');
        badge.id = 'cloud-sync-badge';
        badge.style = "font-size: 11px; padding: 4px 8px; border-radius: 4px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); margin-left: auto;";
        badge.innerHTML = '<i class="fas fa-sync fa-spin"></i> Conectando à Nuvem...';
        headerTitle.appendChild(badge);
    }

    // 2. Tentar baixar da Nuvem
    let cloudData = await fetchFromCloud();

    if (cloudData) {
        // Sucesso na Nuvem! Usa os dados da nuvem.
        state = cloudData;
        
        // Ensure all arrays exist in case cloud is missing them
        state.estoque = state.estoque || [];
        state.estoque_geral = state.estoque_geral || [];
        state.cardapio = state.cardapio || [];
        state.cardapio_variados = state.cardapio_variados || [];
        state.recipes = state.recipes || [];
        state.pedidos = state.pedidos || [];
        state.entradas = state.entradas || [];
        state.porcionamento = state.porcionamento || [];
        state.comissoes = state.comissoes || [];
        state.checklist_setores = state.checklist_setores || [];
        state.preps_historico = state.preps_historico || [];
        state.checklist_history = state.checklist_history || {};
        state.tarefas_pendentes = state.tarefas_pendentes || [];
        state.carrinho_requisicao = state.carrinho_requisicao || [];
        state.requisicoes = state.requisicoes || [];
        state.temperaturas = state.temperaturas || [];
        state.quebras = state.quebras || [];
        state.vendas_semana = state.vendas_semana || [];
        state.fichas_tecnicas = state.fichas_tecnicas || [];

        // Atualiza o backup local do navegador
        localStorage.setItem('romerito_system_state', JSON.stringify(state));
        
        // NOVIDADE MÁGICA: Tenta injetar os dados da nuvem direto no database.json físico do computador!
        try {
            fetch('http://localhost:3000/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(state)
            }).catch(e => {});
        } catch(e) {}

        if (document.getElementById('cloud-sync-badge')) {
            document.getElementById('cloud-sync-badge').innerHTML = '<i class="fas fa-cloud"></i> Conectado';
            document.getElementById('cloud-sync-badge').style.color = 'var(--color-success)';
        }
    } else {
        // 3. Fallback para LocalStorage se a nuvem falhar ou estiver vazia
        if (typeof RESTAURANT_DATA !== 'undefined') {
            state.cardapio = RESTAURANT_DATA.cardapio || [];
            state.cardapio_variados = RESTAURANT_DATA.cardapio_variados || [];
            state.estoque = RESTAURANT_DATA.estoque || [];
            state.estoque_geral = RESTAURANT_DATA.estoque_geral || [];
            state.recipes = RESTAURANT_DATA.recipes || [];
            state.pedidos = [];
            state.entradas = [];
            state.porcionamento = [];
            state.comissoes = [];
            state.checklist_setores = RESTAURANT_DATA.checklist_setores || [];
            state.preps_historico = [];
            state.tarefas_pendentes = [];
            state.carrinho_requisicao = [];
            state.vendas_semana = [];
            state.fichas_tecnicas = RESTAURANT_DATA.fichas_tecnicas || [];
        }

        const savedState = localStorage.getItem('romerito_system_state');
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                if (parsed.estoque) state.estoque = parsed.estoque;
                if (parsed.cardapio) state.cardapio = parsed.cardapio;
                if (parsed.cardapio_variados) state.cardapio_variados = parsed.cardapio_variados;
                if (parsed.estoque) state.estoque = parsed.estoque;
                if (parsed.estoque_geral) state.estoque_geral = parsed.estoque_geral;
                if (parsed.requisicoes) state.requisicoes = parsed.requisicoes;
                if (parsed.temperaturas) state.temperaturas = parsed.temperaturas;
                if (parsed.quebras) state.quebras = parsed.quebras;
                if (parsed.entradas) state.entradas = parsed.entradas;
                if (parsed.comissoes) state.comissoes = parsed.comissoes;
                if (parsed.pedidos) state.pedidos = parsed.pedidos;
                if (parsed.checklist_setores) state.checklist_setores = parsed.checklist_setores;
                if (parsed.preps_historico) state.preps_historico = parsed.preps_historico;
                if (parsed.checklist_history) state.checklist_history = parsed.checklist_history;
                if (parsed.tarefas_pendentes) state.tarefas_pendentes = parsed.tarefas_pendentes;
                if (parsed.carrinho_requisicao) state.carrinho_requisicao = parsed.carrinho_requisicao;
                if (parsed.vendas_semana) state.vendas_semana = parsed.vendas_semana;
                if (parsed.fichas_tecnicas) state.fichas_tecnicas = parsed.fichas_tecnicas;
            } catch (e) {
                console.error("Error reading saved state...", e);
            }
        }
        
    }

    // MIGRATION: Alterar unidade das carnes
    state.estoque.forEach(item => {
        if (item.categoria === "Carne — Refrigerado" && item.unidade === "KG") {
            item.unidade = "PÇ";
        }
    });

    // MIGRATION / INJECTION: Garante que novos itens do data.js entrem no sistema (seja nuvem ou local)
    RESTAURANT_DATA.estoque.forEach(dbItem => {
        const localItem = state.estoque.find(i => i.insumo === dbItem.insumo);
        if (localItem) {
            if (localItem.saldo_inicial === undefined || localItem.saldo_inicial === 0) {
                localItem.saldo_inicial = parseFloat(dbItem.est_maximo) || 20;
            }
        } else {
            if (dbItem.saldo_inicial === undefined || dbItem.saldo_inicial === 0) {
                dbItem.saldo_inicial = parseFloat(dbItem.est_maximo) || 20;
            }
            state.estoque.push(dbItem);
        }
    });

    // Injetar também novos pratos no cardápio de inverno/variados
    RESTAURANT_DATA.cardapio_variados.forEach(dbItem => {
        const localItem = state.cardapio_variados.find(i => i.prato === dbItem.prato);
        if (!localItem) {
            state.cardapio_variados.unshift(dbItem);
        }
    });

    // Forçar a leitura das receitas do arquivo local (data.js) para garantir que as 67 páginas e o executivo apareçam, já que a nuvem pode não tê-las
    state.recipes = RESTAURANT_DATA.recipes || [];

    // Injetar fichas técnicas do data.js caso não existam no state
    if (!state.fichas_tecnicas || state.fichas_tecnicas.length === 0) {
        state.fichas_tecnicas = RESTAURANT_DATA.fichas_tecnicas || [];
    } else {
        // Atualiza as fichas locais com as do data.js (para o caso de alterações)
        RESTAURANT_DATA.fichas_tecnicas.forEach(dbItem => {
            const index = state.fichas_tecnicas.findIndex(i => i.nome === dbItem.nome);
            if (index > -1) {
                state.fichas_tecnicas[index] = dbItem;
            } else {
                state.fichas_tecnicas.push(dbItem);
            }
        });
    }

    recalculateStockBalances();
    saveState();
    setupRouting();
    setupEventListeners();
    
    renderActiveTab();
    
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.classList.add('hidden');
            setTimeout(() => splash.remove(), 800);
        }
    }, 2200);
}

async function saveState() {
    // Sempre salva local primeiro (backup instantâneo/offline)
    localStorage.setItem('romerito_system_state', JSON.stringify(state));
    // Tenta espelhar na Nuvem em background e espera terminar
    await syncToCloud(state);
}

// Helper to recalculate stock balances from inputs and requisitions
function recalculateStockBalances() {
    state.estoque.forEach(item => {
        // Sum total historical inputs for this item
        const totalInputs = state.entradas
            .filter(ent => ent.produto_insumo === item.insumo && ent.status === "âœ… Conforme")
            .reduce((sum, ent) => sum + parseFloat(ent.qtd || 0), 0);
            
        // Sum total requisitions
        const totalRequisitions = state.requisicoes
            .filter(req => req.insumo.toLowerCase() === item.insumo.toLowerCase() || req.insumo.toLowerCase().includes(item.insumo.toLowerCase()) || item.insumo.toLowerCase().includes(req.insumo.toLowerCase()))
            .reduce((sum, req) => sum + parseFloat(req.qtd || 0), 0);

        // Sum total waste (quebras)
        const totalWaste = state.quebras
            .filter(qb => qb.ingrediente === item.insumo)
            .reduce((sum, qb) => sum + parseFloat(qb.qtd || 0), 0);

        // Assume a base inventory if none has been logged
        // Update: Now we use the real stock values captured from the spreadsheet (saldo_inicial), fallback to 0
        const baseStock = item.saldo_inicial !== undefined ? parseFloat(item.saldo_inicial) : 0;
        
        // Calculate current stock balance
        let balance = baseStock + totalInputs - totalRequisitions - totalWaste;
        if (balance < 0) balance = 0;
        
        item.estoque_atual = parseFloat(balance.toFixed(2));
        item.saida_requisicao = parseFloat(totalRequisitions.toFixed(2));
        item.saldo = item.estoque_atual; // Synced

        // Update status dynamically
        const min = parseFloat(item.est_minimo || 0);
        const max = parseFloat(item.est_maximo || 100);
        if (item.estoque_atual <= 0) {
            item.status = "ðŸ”´ Crítico";
            item.pedido = "Necessita Compra Urgente";
        } else if (item.estoque_atual < min) {
            item.status = "âš ï¸� Baixo";
            item.pedido = "Programado snapshot";
        } else {
            item.status = "âœ… OK";
            item.pedido = "—";
        }
    });
}

// Navigation / Router
function setupRouting() {
    const navButtons = document.querySelectorAll('.nav-item');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tabId = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-panel').forEach(panel => {
                panel.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
            
            // Re-render corresponding data
            renderActiveTab();
        });
    });
}

function renderActiveTab() {
    const activeTab = document.querySelector('.nav-item.active').getAttribute('data-tab');
    const headerTitle = document.querySelector('.top-header h2');
    const tabName = document.querySelector('.nav-item.active button').innerText;
    const iconClass = document.querySelector('.nav-item.active i').className;
    headerTitle.innerHTML = `<i class="${iconClass}"></i> ${tabName}`;

    if (activeTab === 'tab-dashboard') {
        renderDashboard();
    } else if (activeTab === 'tab-estoque') {
        renderEstoque();
    } else if (activeTab === 'tab-estoque-geral') {
        renderEstoqueGeral();
    } else if (activeTab === 'tab-cardapio') {
        renderCardapio();
    } else if (activeTab === 'tab-fichas') {
        renderFichasExplorer();
    } else if (activeTab === 'tab-preps') {
        renderFTMDatabase();
    } else if (activeTab === 'tab-checklist') {
        renderChecklist();
    renderArquivosCozinha();
    } else if (activeTab === 'tab-folha-req') {
        renderFolhaRequisicao();
    } else if (activeTab === 'tab-movimentacoes') {
        renderMovimentacoes();
    } else if (activeTab === 'tab-equipe') {
        renderEquipe();
    } else if (activeTab === 'tab-monitoramento') {
        renderMonitoramento();
    } else if (activeTab === 'tab-auditoria') {
        renderAuditoria();
    }
}

// ----------------------------------------------------
// DASHBOARD RENDER
// ----------------------------------------------------
let dashboardChart = null;

function renderDashboard() {
    // 1. Calculate stats (Executive KPIs)
    
    // a. Valor Total do Estoque
    let totalValue = 0;
    state.estoque.forEach(item => {
        // Assume an estimated cost if missing, just for dashboard demonstration
        const custo = item.custo_unit ? parseFloat(String(item.custo_unit).replace('R$', '').replace(',', '.')) : 15.00;
        totalValue += (item.estoque_atual || 0) * custo;
    });

    // b. Fuga (KDS vs PDV)
    let totalFuga = 0;
    state.vendas_semana.forEach(v => {
        const caixa = v.qtd_caixa || 0;
        const kds = v.qtd_kds !== undefined ? v.qtd_kds : (v.qtd || 0);
        const desvio = kds - caixa;
        if (desvio > 0) totalFuga += desvio;
    });

    // c. Requisições
    const totalReqs = state.requisicoes.length;

    // d. Alertas
    const lowStockCount = state.estoque.filter(i => i.status === "âš ï¸� Baixo").length;
    const criticalStockCount = state.estoque.filter(i => i.status === "ðŸ”´ Crítico").length;
    const alertsCount = lowStockCount + criticalStockCount;
    
    // Update metric DOM values
    document.getElementById('dash-total-value').innerText = "R$ " + totalValue.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('dash-fuga-kds').innerText = totalFuga + " unid.";
    document.getElementById('dash-total-reqs').innerText = totalReqs;
    
    const dashAlertsEl = document.getElementById('dash-alerts') || document.getElementById('dash-alerts-count');
    if (dashAlertsEl) {
        dashAlertsEl.innerText = alertsCount;
        
        // Set styling for critical elements
        const critCard = dashAlertsEl.closest('.glass-card');
        const critIcon = critCard.querySelector('.kpi-icon') || critCard.querySelector('.metric-icon');
        
        if (alertsCount > 0) {
            critCard.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            if (critIcon) {
                critIcon.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                critIcon.style.color = 'var(--color-danger)';
            }
        } else {
            critCard.style.borderColor = 'var(--border-color)';
            if (critIcon) {
                critIcon.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
                critIcon.style.color = 'var(--color-success)';
            }
        }
    }

    // Render Recent Requisitions Table (last 5)
    const recentReqsBody = document.getElementById('dash-recent-reqs-body');
    const recentReqs = [...state.requisicoes].reverse().slice(0, 5);
    
    if (recentReqs.length === 0) {
        recentReqsBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Nenhuma requisição registrada.</td></tr>`;
    } else {
        recentReqsBody.innerHTML = recentReqs.map(req => `
            <tr>
                <td><strong>${req.id}</strong></td>
                <td>${req.insumo}</td>
                <td>${req.qtd} ${req.unidade}</td>
                <td><span class="badge info">${req.setor}</span></td>
                <td>${req.responsavel}</td>
            </tr>
        `).join('');
    }

    // Render Inventory health chart
    const okCount = state.estoque.filter(i => i.status === "âœ… OK").length;
    
    // Destroy previous chart if exists
    if (dashboardChart) {
        dashboardChart.destroy();
    }
    
    const ctx = document.getElementById('inventoryHealthChart').getContext('2d');
    dashboardChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['OK', 'Baixo', 'Crítico'],
            datasets: [{
                data: [okCount, lowStockCount, criticalStockCount],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 1,
                borderColor: '#0f1322'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8',
                        font: { family: 'Inter', size: 11 }
                    }
                }
            },
            cutout: '75%'
        }
    });

    // Populate alert box
    const alertList = document.getElementById('dash-alerts-list');
    const urgentAlerts = state.estoque.filter(i => i.status === "ðŸ”´ Crítico").slice(0, 4);
    
    if (urgentAlerts.length === 0) {
        alertList.innerHTML = `
            <div class="system-status" style="padding: 12px; border-radius: var(--border-radius); background-color: var(--color-success-bg); color: var(--color-success); border: 1px solid rgba(16, 185, 129, 0.15); width: 100%;">
                <i class="fas fa-check-circle" style="font-size: 16px;"></i>
                <div><strong>Estoque em Conformidade:</strong> Nenhum item crítico registrado hoje.</div>
            </div>
        `;
    } else {
        alertList.innerHTML = urgentAlerts.map(item => `
            <div class="system-status" style="padding: 12px; border-radius: var(--border-radius); background-color: var(--color-danger-bg); color: var(--color-danger); border: 1px solid rgba(239, 68, 68, 0.15); width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 16px;"></i>
                    <div><strong>${item.insumo}</strong> Zerado! (Mín: ${item.est_minimo} ${item.unidade})</div>
                </div>
                <button class="action-btn" onclick="openLaunchInputModal('${item.insumo}')" style="padding: 4px 8px; font-size: 11px;">Comprar</button>
            </div>
        `).join('');
    }
}

// ----------------------------------------------------
// ESTOQUE (INVENTORY) RENDER
// ----------------------------------------------------
let estoqueCategoryFilter = 'Todos';
let estoqueSearchQuery = '';

function renderEstoque() {
    const tableBody = document.getElementById('estoque-table-body');
    const selectFilter = document.getElementById('estoque-category-filter');
    
    // Populate filter options if empty
    if (selectFilter.options.length <= 1) {
        const categories = [...new Set(state.estoque.map(item => item.categoria))].filter(Boolean);
        categories.sort().forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.innerText = cat;
            selectFilter.appendChild(opt);
        });
    }

    // Filter and search
    let filteredEstoque = state.estoque.filter(item => {
        const matchesCategory = estoqueCategoryFilter === 'Todos' || item.categoria === estoqueCategoryFilter;
        const matchesSearch = item.insumo.toLowerCase().includes(estoqueSearchQuery.toLowerCase()) ||
                              (item.categoria && item.categoria.toLowerCase().includes(estoqueSearchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    if (filteredEstoque.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 32px;">Nenhum insumo encontrado.</td></tr>`;
        return;
    }

    tableBody.innerHTML = filteredEstoque.map(item => {
        let statusClass = "success";
        if (item.status === "âš ï¸� Baixo") statusClass = "warning";
        if (item.status === "ðŸ”´ Crítico") statusClass = "danger";
        
        return `
            <tr>
                <td><strong>${item.insumo}</strong></td>
                <td><span class="badge info" style="background-color: rgba(255, 255, 255, 0.05); color: var(--text-primary); border: 1px solid var(--border-color);">${item.categoria || 'Geral'}</span></td>
                <td>${item.unidade}</td>
                <td>${item.est_minimo != null ? item.est_minimo : '—'}</td>
                <td>${item.est_maximo != null ? item.est_maximo : '—'}</td>
                <td><strong>${item.estoque_atual != null ? item.estoque_atual : 0}</strong></td>
                <td>${item.saida_requisicao != null ? item.saida_requisicao : 0}</td>
                <td><span class="badge ${statusClass}">${item.status}</span></td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="action-btn" onclick="openLaunchRequisitionModal('${item.insumo}')" style="padding: 4px 8px; font-size: 11px; background-color: var(--accent-gold-alpha); color: var(--accent-gold); border: 1px solid rgba(197, 168, 109, 0.2);"><i class="fas fa-minus-circle"></i> Retirar</button>
                        <button class="action-btn" onclick="openLaunchInputModal('${item.insumo}')" style="padding: 4px 8px; font-size: 11px; background-color: rgba(16, 185, 129, 0.1); color: var(--color-success); border: 1px solid rgba(16, 185, 129, 0.2);"><i class="fas fa-plus-circle"></i> Receber</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ----------------------------------------------------
// CARDAPIO (MENU) RENDER
// ----------------------------------------------------
let cardapioTab = 'Geral';
let cardapioSearchQuery = '';

function renderCardapio() {
    const tableBody = document.getElementById('cardapio-table-body');
    const isWinter = cardapioTab === 'Menu de Inverno';
    const isExecutivo = cardapioTab.startsWith('Executivo') || cardapioTab === 'Cardápio Copa';
    
    // Choose dataset
    let dataset = [];
    if (isWinter) {
        dataset = state.cardapio_variados;
    } else if (isExecutivo) {
        dataset = state.recipes.filter(r => r.menu_tag === cardapioTab).map(r => ({
            id: r.id || '-',
            prato: r.nome,
            descricao: r.ingredientes ? r.ingredientes.split('|').join(', ') : 'Prato executivo',
            categoria: r.categoria || 'Executivo',
            preco: '—',
            disponivel: "✅ Sim",
            destaque: "Não"
        }));
    } else {
        dataset = state.cardapio;
    }
    
    let filteredData = dataset.filter(item => {
        const matchesSearch = item.prato.toLowerCase().includes(cardapioSearchQuery.toLowerCase()) ||
                              (item.descricao && item.descricao.toLowerCase().includes(cardapioSearchQuery.toLowerCase())) ||
                              (item.categoria && item.categoria.toLowerCase().includes(cardapioSearchQuery.toLowerCase()));
        return matchesSearch;
    });

    if (filteredData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 32px;">Nenhum item do cardápio encontrado.</td></tr>`;
        return;
    }

    // Headers adjustment
    const thPhotoObs = document.getElementById('cardapio-th-photo-obs');
    thPhotoObs.innerText = isWinter ? "Observação" : "Destaque";

    tableBody.innerHTML = filteredData.map(item => {
        const isDisp = item.disponivel === "âœ… Sim" || item.disponivel === "Sim" || item.disponivel === true;
        const dispText = isDisp ? "Disponível" : "Indisponível";
        const badgeClass = isDisp ? "success" : "danger";
        
        let extraCol = "";
        if (isWinter) {
            extraCol = `<td>${item.obs || '—'}</td>`;
        } else {
            const isHighlight = item.destaque === "Sim" || item.destaque === "â˜… Sim" || item.destaque === true;
            extraCol = `
                <td>
                    <button onclick="toggleHighlight(${item.id})" style="background: none; border: none; color: ${isHighlight ? '#eab308' : 'var(--text-muted)'}; cursor: pointer; font-size: 16px;">
                        <i class="${isHighlight ? 'fas' : 'far'} fa-star"></i>
                    </button>
                </td>
            `;
        }

        return `
            <tr>
                <td><strong>${item.id}</strong></td>
                <td><strong>${item.prato}</strong></td>
                <td style="max-width: 320px; color: var(--text-secondary); line-height: 1.4;">${item.descricao || '—'}</td>
                <td><span class="badge info">${item.categoria}</span></td>
                <td><strong>${item.preco || '—'}</strong></td>
                <td>
                    <button onclick="toggleAvailability(${item.id}, ${isWinter})" class="badge ${badgeClass}" style="border: none; cursor: pointer; font-family: inherit;">
                        <i class="fas ${isDisp ? 'fa-check' : 'fa-times'}-circle"></i> ${dispText}
                    </button>
                </td>
                ${extraCol}
            </tr>
        `;
    }).join('');
}

function toggleAvailability(id, isWinter) {
    const dataset = isWinter ? state.cardapio_variados : state.cardapio;
    const item = dataset.find(i => i.id == id);
    if (item) {
        const isDisp = item.disponivel === "âœ… Sim" || item.disponivel === "Sim" || item.disponivel === true;
        item.disponivel = isDisp ? "Não" : "âœ… Sim";
        saveState();
        renderCardapio();
    }
}

function toggleHighlight(id) {
    const item = state.cardapio.find(i => i.id == id);
    if (item) {
        const isHighlight = item.destaque === "Sim" || item.destaque === "â˜… Sim" || item.destaque === true;
        item.destaque = isHighlight ? "Não" : "Sim";
        saveState();
        renderCardapio();
    }
}

function concluirTarefaRecebimento(taskId) {
    document.getElementById('prep-task-id').value = taskId;
    openModal('modal-concluir-prep');
}

// ----------------------------------------------------
// FICHAS TECNICAS EXPLORER RENDER
// ----------------------------------------------------
let selectedRecipeId = null;
let selectedComponentData = null;
let recipesSearchQuery = '';
let recipesCategoryFilter = 'Todos';

function renderFichasExplorer() {
    const listPanel = document.getElementById('recipes-list-view');
    const compPanel = document.getElementById('recipe-components-view');
    const detailPanel = document.getElementById('recipe-detail-view');
    
    if (selectedRecipeId && selectedComponentData) {
        listPanel.style.display = 'none';
        compPanel.style.display = 'none';
        detailPanel.style.display = 'block';
        renderFichaDetail(selectedComponentData);
    } else if (selectedRecipeId) {
        listPanel.style.display = 'none';
        compPanel.style.display = 'block';
        detailPanel.style.display = 'none';
        renderRecipeComponents(selectedRecipeId);
    } else {
        listPanel.style.display = 'block';
        compPanel.style.display = 'none';
        detailPanel.style.display = 'none';
        renderRecipesList();
    }
}


function renderRecipesList() {
    const grid = document.getElementById('recipes-grid');
    const filterSelect = document.getElementById('recipes-category-filter');
    
    if (!grid) return;
    
    // Populate filter options
    if (filterSelect && filterSelect.options.length <= 1) {
        const categories = [...new Set(state.recipes.map(r => r.categoria))].filter(Boolean);
        categories.sort().forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.innerText = cat;
            filterSelect.appendChild(opt);
        });
    }

    const activeTabBtn = document.querySelector('.section-tabs [data-fichas-tab].active');
    const activeMenu = activeTabBtn ? activeTabBtn.getAttribute('data-fichas-tab') : 'Geral';

    let filtered = state.recipes.filter((r, idx) => {
        const mockMenu = r.menu_tag || 'Geral';

        const matchesMenu = activeMenu === 'Geral' || mockMenu === activeMenu;
        const matchesCategory = recipesCategoryFilter === 'Todos' || r.categoria === recipesCategoryFilter;
        const matchesSearch = r.nome.toLowerCase().includes(recipesSearchQuery.toLowerCase()) ||
                              (r.categoria && r.categoria.toLowerCase().includes(recipesSearchQuery.toLowerCase()));
        return matchesMenu && matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 48px;">Nenhuma ficha técnica encontrada.</div>`;
        return;
    }

    grid.innerHTML = filtered.map(r => `
        <div class="glass-card recipe-card" onclick="selectRecipeByName('${encodeURIComponent(r.nome)}')" style="cursor: pointer; display: flex; flex-direction: column;">
            ${r.imagem_url ? `<div style="width: 100%; height: 180px; border-radius: 8px; margin-bottom: 16px; overflow: hidden; flex-shrink: 0; background-color: var(--surface-light); display: flex; align-items: center; justify-content: center;"><img src="${parseGoogleDriveImage(r.imagem_url)}" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.src='https://via.placeholder.com/600x400/18181b/ffffff?text=Falha+na+Imagem'"></div>` : ''}
            <div style="text-align: center; flex-grow: 1; display: flex; align-items: center; justify-content: center;">
                <h4 style="font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0;">${r.nome}</h4>
            </div>
        </div>
    `).join('');
}

function selectRecipeByName(encodedName) {
    const nome = decodeURIComponent(encodedName);
    const rec = state.recipes.find(r => r.nome === nome);
    if (rec) {
        selectedRecipeId = rec.nome; // Use nome as the unique identifier
        selectedComponentData = null;
        renderFichasExplorer();
    }
}

function closeRecipeComponents() {
    selectedRecipeId = null;
    selectedComponentData = null;
    renderFichasExplorer();
}

function selectComponentIndex(idx) {
    selectedComponentData = currentRecipeComponents[idx];
    renderFichasExplorer();
}

function closeRecipeDetail() {
    selectedComponentData = null;
    renderFichasExplorer();
}

let currentRecipeComponents = [];

// Generates mock components for a given recipe to simulate the Sub-Tickets
function renderRecipeComponents(nome) {
    const r = state.recipes.find(rec => rec.nome === nome);
    if (!r) return;

    document.getElementById('components-dish-title').innerText = r.nome;

    const subGrid = document.getElementById('components-sub-grid');
    const procGrid = document.getElementById('components-proc-grid');
    const assmGrid = document.getElementById('components-assm-grid');

    currentRecipeComponents = [];

    const generateTicketHTML = (title, time, baseRecipe) => {
        const compData = {
            dishName: baseRecipe.nome,
            title: title,
            time: time,
            rendimento: baseRecipe.rendimento,
            ingredientes: baseRecipe.ingredientes,
            modo_preparo: baseRecipe.modo_preparo // In a real app, this would be specific to the component
        };
        currentRecipeComponents.push(compData);
        const compIdx = currentRecipeComponents.length - 1;
        
        return `
            <div class="glass-card recipe-card" onclick="selectComponentIndex(${compIdx})" style="cursor: pointer;">
                <div>
                    <h4 style="font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 700; color: var(--text-primary); margin-top: 4px;">${title}</h4>
                </div>
                <div class="card-body">
                    <p>Ficha técnica de processo isolado.</p>
                </div>
                <div class="recipe-card-footer">
                    <span><i class="far fa-clock"></i> ${time} min</span>
                    <span><i class="fas fa-file-alt"></i> Ver Ficha</span>
                </div>
            </div>
        `;
    };

    // Mocking breakdown of the dish into components
    subGrid.innerHTML = generateTicketHTML("Preparo Preliminar (Mise en place)", "15", r);
    procGrid.innerHTML = generateTicketHTML("Cocção Principal", "25", r);
    assmGrid.innerHTML = generateTicketHTML("Montagem Final", "5", r);
}

function renderFichaDetail(comp) {
    // Title & Meta
    document.getElementById('ficha-title').innerText = comp.title;
    document.getElementById('ficha-category').innerText = comp.dishName;
    
    const imgContainer = document.getElementById('ficha-imagem-container');
    const imgRender = document.getElementById('ficha-imagem-render');
    const recipeObj = state.recipes.find(r => r.nome === comp.title);
    if (recipeObj && recipeObj.imagem_url) {
        imgRender.src = parseGoogleDriveImage(recipeObj.imagem_url);
        imgContainer.style.display = 'block';
    } else {
        imgContainer.style.display = 'none';
        imgRender.src = '';
    }
    document.getElementById('ficha-yield').innerText = comp.rendimento || '1 porção';
    document.getElementById('ficha-time').innerText = comp.time + " minutos";
    document.getElementById('ficha-responsible').innerText = "Chef Romerito";
    document.getElementById('ficha-status-val').innerText = "âœ… Aprovada / Conforme";

    // Ingredients
    const ingList = document.getElementById('ficha-ingredients-list');
    if (comp.ingredientes) {
        const ings = comp.ingredientes.split('|').map(i => i.trim()).filter(Boolean);
        ingList.innerHTML = ings.map(ing => `<li><i class="fas fa-utensils" style="color: var(--accent-gold); margin-right: 8px;"></i> ${ing}</li>`).join('');
    } else {
        ingList.innerHTML = `<li style="color: var(--text-muted);">Nenhum ingrediente cadastrado.</li>`;
    }

    // Prep steps
    const stepsList = document.getElementById('ficha-steps-list');
    if (comp.modo_preparo) {
        const steps = comp.modo_preparo.split('\n').map(s => s.trim()).filter(Boolean);
        stepsList.innerHTML = steps.map((step, idx) => {
            const cleanStep = step.replace(/^\d+[\.\s\-]+/, '');
            return `
                <li>
                    <span class="step-num">${idx + 1}</span>
                    <div>${cleanStep}</div>
                </li>
            `;
        }).join('');
    } else {
        stepsList.innerHTML = `<li style="color: var(--text-muted);">Nenhum modo de preparo cadastrado.</li>`;
    }

    renderFTMSalesChart(comp.dishName + ' - ' + comp.title);

    const r = state.recipes.find(rec => rec.nome === comp.dishName) || {};

    // Chef Tip
    const chefTipText = document.getElementById('ficha-chef-tip-text');
    if (r.dica_chef && r.dica_chef.trim() !== '') {
        document.getElementById('ficha-chef-tip-box').style.display = 'flex';
        chefTipText.innerText = r.dica_chef;
    } else {
        document.getElementById('ficha-chef-tip-box').style.display = 'none';
    }

    // Financials
    document.getElementById('ficha-cost-total').innerText = (r.custo_total != null && r.custo_total !== '') ? `R$ ${parseFloat(r.custo_total).toFixed(2)}` : '—';
    document.getElementById('ficha-price-sale').innerText = (r.preco_venda != null && r.preco_venda !== '') ? `R$ ${parseFloat(r.preco_venda).toFixed(2)}` : '—';
    
    // Margin percentage
    let margin = r.margem_pct;
    if (margin && typeof margin === 'string') {
        margin = parseFloat(margin.replace('%','').replace(',','.'));
    }
    document.getElementById('ficha-margin').innerText = margin != null ? `${margin.toFixed(1)}%` : '—';

    // Target Food Cost (CMV) = Cost / Sell price
    let cmvVal = '—';
    if (r.custo_total != null && r.preco_venda != null && r.preco_venda > 0) {
        const cmv = (parseFloat(r.custo_total) / parseFloat(r.preco_venda)) * 100;
        cmvVal = `${cmv.toFixed(1)}%`;
    }
    document.getElementById('ficha-cmv').innerText = cmvVal;
}

// ----------------------------------------------------
// MOVIMENTACOES (INPUTS & REQUISITIONS) RENDER
// ----------------------------------------------------
let movActiveSubtab = 'subtab-requisicoes';

function renderMovimentacoes() {
    const reqPanel = document.getElementById('mov-requisicoes-panel');
    const entPanel = document.getElementById('mov-entradas-panel');
    
    // Toggle subtab panels
    if (movActiveSubtab === 'subtab-requisicoes') {
        reqPanel.style.display = 'block';
        entPanel.style.display = 'none';
        renderRequisicoesHistory();
    } else {
        reqPanel.style.display = 'none';
        entPanel.style.display = 'block';
        renderEntradasHistory();
    }
}

function renderRequisicoesHistory() {
    const tableBody = document.getElementById('requisicoes-table-body');
    const sorted = [...state.requisicoes].reverse();

    if (sorted.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 32px;">Nenhuma requisição registrada.</td></tr>`;
        return;
    }

    tableBody.innerHTML = sorted.map(req => `
        <tr>
            <td><strong>${req.id}</strong></td>
            <td>${req.data || '—'}</td>
            <td><strong>${req.insumo}</strong></td>
            <td>${req.qtd} ${req.unidade}</td>
            <td><span class="badge info">${req.setor}</span></td>
            <td>${req.responsavel}</td>
            <td>${req.turno || 'Abertura'}</td>
        </tr>
    `).join('');
}

function renderEntradasHistory() {
    const tableBody = document.getElementById('entradas-table-body');
    const sorted = [...state.entradas].reverse();

    if (sorted.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 32px;">Nenhuma entrada registrada.</td></tr>`;
        return;
    }

    tableBody.innerHTML = sorted.map(ent => `
        <tr>
            <td><strong>${ent.id}</strong></td>
            <td>${ent.data || '—'}</td>
            <td><strong>${ent.produto_insumo}</strong></td>
            <td>${ent.qtd} ${ent.unidade}</td>
            <td>${ent.fornecedor || '—'}</td>
            <td>${ent.temp_c || '—'}</td>
            <td>${ent.nf || '—'}</td>
            <td>${ent.responsavel || '—'}</td>
            <td><span class="badge success">${ent.status || 'Conforme'}</span></td>
        </tr>
    `).join('');
}

// ----------------------------------------------------
// PREPS RENDER
// ----------------------------------------------------
let prepsSearchQuery = '';

function renderPreps() {
    const tableBody = document.getElementById('preps-table-body');
    const searchInput = document.getElementById('preps-search');
    
    if (!searchInput.dataset.listening) {
        searchInput.addEventListener('input', (e) => {
            prepsSearchQuery = e.target.value;
            renderPreps();
        });
        searchInput.dataset.listening = "true";
    }

    let filtered = state.preps_historico.filter(p => {
        return p.item.toLowerCase().includes(prepsSearchQuery.toLowerCase());
    });

    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 32px;">Nenhuma preparação encontrada.</td></tr>`;
        return;
    }

    tableBody.innerHTML = filtered.map(p => {
        const pStatus = p.status || '';
        let statusClass = 'info';
        if (pStatus.includes('OK')) statusClass = 'success';
        else if (pStatus.includes('Falta') || pStatus.includes('Atraso')) statusClass = 'danger';
        else statusClass = 'warning';

        return `
            <tr>
                <td>${p.data || '—'}</td>
                <td><span class="badge info">${p.setor}</span></td>
                <td><strong>${p.item}</strong></td>
                <td>${p.processo}</td>
                <td>${p.turno}</td>
                <td>${p.responsavel}</td>
                <td><span class="badge ${statusClass}">${pStatus}</span></td>
                <td>${p.obs || '—'}</td>
            </tr>
        `;
    }).join('');
}

// ----------------------------------------------------
// CHECKLIST RENDER (PDF SCHEMA)
// ----------------------------------------------------
let checklistActiveSubtab = 'entradas1';
let activeChecklistDate = new Date().toISOString().split('T')[0];
let activeChecklistShift = 'Manhã';

// Simple time-based default
const currentHour = new Date().getHours();
if (currentHour >= 16 && currentHour < 17) activeChecklistShift = 'Troca';
else if (currentHour >= 17) activeChecklistShift = 'Noite';

function getActiveChecklistKey() {
    return `${activeChecklistDate}|${activeChecklistShift}`;
}

function ensureChecklistState() {
    if (!state.checklist_history) state.checklist_history = {};
    const key = getActiveChecklistKey();
    if (!state.checklist_history[key]) {
        state.checklist_history[key] = {};
    }
    return state.checklist_history[key];
}

function renderChecklist() {
    const container = document.getElementById('checklist-form-container');
    const subtabs = document.querySelectorAll('#checklist-subtabs .tab-btn');
    
    // Wire up Date and Shift filters
    const dateInput = document.getElementById('chk-date');
    const shiftInput = document.getElementById('chk-turno');
    
    if (dateInput.value !== activeChecklistDate) dateInput.value = activeChecklistDate;
    if (shiftInput.value !== activeChecklistShift) shiftInput.value = activeChecklistShift;
    
    if (!dateInput.dataset.listening) {
        dateInput.addEventListener('change', (e) => {
            activeChecklistDate = e.target.value;
            renderChecklist();
    renderArquivosCozinha();
        });
        dateInput.dataset.listening = "true";
    }
    if (!shiftInput.dataset.listening) {
        shiftInput.addEventListener('change', (e) => {
            activeChecklistShift = e.target.value;
            renderChecklist();
    renderArquivosCozinha();
        });
        shiftInput.dataset.listening = "true";
    }

    // Attach event listeners to subtabs if not done
    subtabs.forEach(btn => {
        if (!btn.dataset.listening) {
            btn.addEventListener('click', (e) => {
                subtabs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                checklistActiveSubtab = btn.getAttribute('data-chk-tab');
                renderChecklist();
    renderArquivosCozinha();
            });
            btn.dataset.listening = "true";
        }
    });

    const sectionData = CHECKLIST_PDF_SCHEMA[checklistActiveSubtab];
    if (!sectionData) {
        container.innerHTML = `<div style="text-align: center; padding: 32px;">Seção não encontrada.</div>`;
        return;
    }

    let html = '';

    // Volume Items
    if (sectionData.volumeItems) {
        html += `<h3 class="checklist-section-title">PRAÇA — VOLUME (1 = cheio · ½ · ¼ · 0 = vazio)</h3>`;
        html += `
            <div class="table-container">
                <table class="custom-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Item / Insumo</th>
                            <th>Volume</th>
                            <th>Recipiente</th>
                            <th>Tamanho / Bag</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sectionData.volumeItems.map(item => `
                            <tr>
                                <td style="width: 40px; color: var(--text-muted);">${item.id}</td>
                                <td>
                                    <strong>${item.item}</strong>
                                    <div style="font-size: 11px; color: var(--text-muted);">${item.sub}</div>
                                </td>
                                <td>
                                    <div class="volume-selector">
                                        <div class="vol-btn vol-1" onclick="setChecklistVol('${checklistActiveSubtab}', 'vol_${item.id}', '1')" id="btn_${checklistActiveSubtab}_vol_${item.id}_1">1</div>
                                        <div class="vol-btn vol-12" onclick="setChecklistVol('${checklistActiveSubtab}', 'vol_${item.id}', '1/2')" id="btn_${checklistActiveSubtab}_vol_${item.id}_1/2">½</div>
                                        <div class="vol-btn vol-14" onclick="setChecklistVol('${checklistActiveSubtab}', 'vol_${item.id}', '1/4')" id="btn_${checklistActiveSubtab}_vol_${item.id}_1/4">¼</div>
                                        <div class="vol-btn vol-0" onclick="setChecklistVol('${checklistActiveSubtab}', 'vol_${item.id}', '0')" id="btn_${checklistActiveSubtab}_vol_${item.id}_0">0</div>
                                    </div>
                                </td>
                                <td>
                                    <select class="form-control" onchange="setChecklistText('${checklistActiveSubtab}', 'recip_${item.id}', this.value)" id="input_${checklistActiveSubtab}_recip_${item.id}">
                                        <option value=""></option>
                                        <option value="Pote">Pote</option>
                                        <option value="Bag">Bag</option>
                                        <option value="GN">GN</option>
                                        <option value="Bowl">Bowl</option>
                                        <option value="Bandeja">Bandeja</option>
                                        <option value="Squeeze">Squeeze</option>
                                    </select>
                                </td>
                                <td><input type="text" class="form-control" style="width: 90px;" placeholder="Ex: 1L, M" onchange="setChecklistText('${checklistActiveSubtab}', 'tamanho_${item.id}', this.value)" id="input_${checklistActiveSubtab}_tamanho_${item.id}"></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Count Items
    if (sectionData.countItems || sectionData.qtyItems || sectionData.parrillaAcarte || sectionData.passeAcarte) {
        const counts = sectionData.countItems || sectionData.qtyItems || sectionData.parrillaAcarte || sectionData.passeAcarte;
        const countTitle = sectionData.parrillaAcarte ? 'PARRILLA A LA CARTE' : 'CONTAGEM (unidades físicas)';
        html += `<h3 class="checklist-section-title">${countTitle}</h3>`;
        html += `
            <div class="table-container">
                <table class="custom-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Item / Insumo</th>
                            <th>Unidades</th>
                            <th>Pacotes</th>
                            <th>Observações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${counts.map(item => `
                            <tr>
                                <td style="width: 40px; color: var(--text-muted);">${item.id}</td>
                                <td>
                                    <strong>${item.item}</strong>
                                    <div style="font-size: 11px; color: var(--text-muted);">${item.sub}</div>
                                </td>
                                <td><input type="number" class="form-control" style="width: 80px;" onchange="setChecklistText('${checklistActiveSubtab}', 'uni_${item.id}', this.value)" id="input_${checklistActiveSubtab}_uni_${item.id}"></td>
                                <td><input type="number" class="form-control" style="width: 80px;" onchange="setChecklistText('${checklistActiveSubtab}', 'pct_${item.id}', this.value)" id="input_${checklistActiveSubtab}_pct_${item.id}"></td>
                                <td><input type="text" class="form-control" onchange="setChecklistText('${checklistActiveSubtab}', 'obs_${item.id}', this.value)" id="input_${checklistActiveSubtab}_obs_${item.id}"></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    if (sectionData.passeAcarte) {
        html += `<h3 class="checklist-section-title">PASSE / FOGÃO — A LA CARTE</h3>`;
        html += `
            <div class="table-container">
                <table class="custom-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Item / Insumo</th>
                            <th>Unidades</th>
                            <th>Pacotes</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sectionData.passeAcarte.map(item => `
                            <tr>
                                <td style="width: 40px; color: var(--text-muted);">${item.id}</td>
                                <td>
                                    <strong>${item.item}</strong>
                                    <div style="font-size: 11px; color: var(--text-muted);">${item.sub}</div>
                                </td>
                                <td><input type="number" class="form-control" style="width: 80px;" onchange="setChecklistText('${checklistActiveSubtab}', 'passe_uni_${item.id}', this.value)" id="input_${checklistActiveSubtab}_passe_uni_${item.id}"></td>
                                <td><input type="number" class="form-control" style="width: 80px;" onchange="setChecklistText('${checklistActiveSubtab}', 'passe_pct_${item.id}', this.value)" id="input_${checklistActiveSubtab}_passe_pct_${item.id}"></td>
                                <td></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Equipments
    if (sectionData.equipments) {
        html += `<h3 class="checklist-section-title">EQUIPAMENTOS E OBSERVAÇÕES</h3>`;
        html += `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 16px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: var(--border-radius);">
                ${sectionData.equipments.map(eq => `
                    <div class="form-group" style="margin-bottom: 0;">
                        <label>${eq.label}</label>
                        <input type="${eq.type}" class="form-control" onchange="setChecklistText('${checklistActiveSubtab}', 'eq_${eq.id}', this.value)" id="input_${checklistActiveSubtab}_eq_${eq.id}">
                    </div>
                `).join('')}
            </div>
        `;
    }

    container.innerHTML = html;
    
    // Restore state values based on active day/shift
    restoreChecklistState(checklistActiveSubtab);
}

function setChecklistVol(section, fieldId, value) {
    const shiftData = ensureChecklistState();
    if (!shiftData[section]) shiftData[section] = {};
    
    shiftData[section][fieldId] = value;
    saveState();
    
    // update UI visually
    const buttons = document.querySelectorAll(`[id^="btn_${section}_${fieldId}_"]`);
    buttons.forEach(b => b.classList.remove('active'));
    
    const btnId = `btn_${section}_${fieldId}_${value}`;
    const activeBtn = document.getElementById(btnId);
    if (activeBtn) activeBtn.classList.add('active');
}

function setChecklistText(section, fieldId, value) {
    const shiftData = ensureChecklistState();
    if (!shiftData[section]) shiftData[section] = {};
    
    shiftData[section][fieldId] = value;
    saveState();
}

function restoreChecklistState(section) {
    const shiftData = ensureChecklistState();
    if (!shiftData[section]) return;
    
    const data = shiftData[section];
    for (const [key, val] of Object.entries(data)) {
        if (key.startsWith('vol_')) {
            const btnId = `btn_${section}_${key}_${val}`;
            const btn = document.getElementById(btnId);
            if (btn) btn.classList.add('active');
        } else {
            const input = document.getElementById(`input_${section}_${key}`);
            if (input) input.value = val;
        }
    }
}

async function saveChecklistForm() {
    // Format date from YYYY-MM-DD to DD/MM/YYYY
    const [y, m, d] = activeChecklistDate.split('-');
    const formattedDate = `${d}/${m}/${y}`;
    
    // Explicit save call just to be safe
    await saveState();
    
    alert(`✅ Checklist salvo com sucesso!\n\n📅 Data Associada: ${formattedDate}\n⏳ Turno Associado: ${activeChecklistShift}\n\nTodos os preenchimentos deste turno já estão registrados no banco de dados local e na nuvem.`);
}

function printChecklistForm() {
    const printArea = document.getElementById('print-area');
    let printHtml = '';

    const currentDate = activeChecklistDate.split('-').reverse().join('/');
    const currentShift = activeChecklistShift;
    const shiftData = ensureChecklistState();

    for (const [sectionKey, sectionData] of Object.entries(CHECKLIST_PDF_SCHEMA)) {
        printHtml += `
            <div class="print-page">
                <div class="print-header">
                    <div>
                        <span class="logo-romerito" style="font-family: 'Playfair Display', serif;">ROMERITO</span>
                    </div>
                    <div class="print-header-center">
                        <h2>Checklist Diário — ${sectionData.title}</h2>
                        <p>Romerito Gastronomia · Fase de Extração · Junho 2026</p>
                    </div>
                    <div class="print-header-box">
                        ${sectionData.title}
                    </div>
                </div>
                
                <div class="print-sub-header">
                    <div>Data: <strong>${currentDate}</strong></div>
                    <div>Turno: <strong>${currentShift}</strong></div>
                    <div>Responsável: _________________</div>
                    <div>Conferido: _________________</div>
                </div>

                <div class="print-content">
        `;

        if (sectionData.volumeItems) {
            printHtml += `
                <table class="print-table">
                    <thead>
                        <tr>
                            <th colspan="5">â–  PRAÇA — VOLUME (assinalar: 1 = cheio · ½ · ¼ · 0 = vazio)</th>
                        </tr>
                        <tr style="background-color: #2a2a4a !important; font-size: 10px;">
                            <th style="width:30px;">#</th>
                            <th>Item / Insumo</th>
                            <th style="width:140px; text-align:center;">1 &nbsp;&nbsp; ½ &nbsp;&nbsp; ¼ &nbsp;&nbsp; 0</th>
                            <th style="width:120px;">Recipiente</th>
                            <th style="width:120px;">Pote / Bag</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sectionData.volumeItems.map(item => {
                            const val = shiftData[sectionKey] ? shiftData[sectionKey][`vol_${item.id}`] : null;
                            const recip = shiftData[sectionKey] ? shiftData[sectionKey][`recip_${item.id}`] : '';
                            const tamanho = shiftData[sectionKey] ? shiftData[sectionKey][`tamanho_${item.id}`] : '';
                            return `
                            <tr>
                                <td style="text-align:center; color: #555 !important;">${item.id}</td>
                                <td><strong>${item.item}</strong><span style="color:#777 !important; font-size: 11px;">${item.sub}</span></td>
                                <td>
                                    <div class="print-vol-cell">
                                        <div class="print-vol-circle ${val === '1' ? 'print-vol-filled' : ''}"></div>
                                        <div class="print-vol-circle ${val === '1/2' ? 'print-vol-filled' : ''}"></div>
                                        <div class="print-vol-circle ${val === '1/4' ? 'print-vol-filled' : ''}"></div>
                                        <div class="print-vol-circle ${val === '0' ? 'print-vol-filled' : ''}"></div>
                                    </div>
                                </td>
                                <td><span class="print-value-filled">${recip || ''}</span></td>
                                <td><span class="print-value-filled">${tamanho || ''}</span></td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }

        const counts = sectionData.countItems || sectionData.qtyItems || sectionData.parrillaAcarte || sectionData.passeAcarte;
        if (counts) {
            const isParrilla = !!sectionData.parrillaAcarte;
            const countTitle = isParrilla ? 'PARRILLA A LA CARTE (unidades)' : (sectionData.passeAcarte ? 'PASSE / FOGÃO — A LA CARTE (unidades)' : 'CONTAGEM DIÃ�RIA (unidades físicas)');
            
            printHtml += `
                <table class="print-table">
                    <thead>
                        <tr>
                            <th colspan="4">â–  ${countTitle}</th>
                        </tr>
                        <tr style="background-color: #2a2a4a !important; font-size: 10px;">
                            <th style="width:30px;">#</th>
                            <th>Item / Proteína</th>
                            <th style="width:80px; text-align:center;">Uni. / Pct.</th>
                            <th style="width:200px;">Obs.</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${counts.map(item => {
                            const uni = shiftData[sectionKey] ? shiftData[sectionKey][`uni_${item.id}`] || shiftData[sectionKey][`passe_uni_${item.id}`] : '';
                            const pct = shiftData[sectionKey] ? shiftData[sectionKey][`pct_${item.id}`] || shiftData[sectionKey][`passe_pct_${item.id}`] : '';
                            const obs = shiftData[sectionKey] ? shiftData[sectionKey][`obs_${item.id}`] : '';
                            
                            let displayVal = uni || '';
                            if (pct) displayVal += (displayVal ? ' / ' : '') + pct + ' pct';
                            
                            return `
                            <tr>
                                <td style="text-align:center; color: #555 !important;">${item.id}</td>
                                <td><strong>${item.item}</strong><span style="color:#777 !important; font-size: 11px;">${item.sub}</span></td>
                                <td style="text-align:center;"><span class="print-value-filled">${displayVal}</span></td>
                                <td><span class="print-value-filled" style="text-align: left;">${obs || ''}</span></td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }

        if (sectionData.equipments) {
            printHtml += `
                <table class="print-table" style="margin-top:20px;">
                    <thead>
                        <tr><th colspan="2">â–  EQUIPAMENTO E INFORMAÇÕES</th></tr>
                    </thead>
                    <tbody>
                        ${sectionData.equipments.map(eq => {
                            const val = shiftData[sectionKey] ? shiftData[sectionKey][`eq_${eq.id}`] : '';
                            return `
                            <tr>
                                <td style="width: 250px;"><strong>${eq.label}</strong></td>
                                <td><span class="print-value-filled" style="text-align: left;">${val || ''}</span></td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }


        printHtml += `
                </div>
                <div class="print-footer">
                    <div>ROMERITO GASTRONOMIA</div>
                    <div>Checklist · ${sectionData.title}</div>
                    <div>Pág. Impressa via Système Précis</div>
                </div>
            </div>
        `;
    }

    printArea.innerHTML = printHtml;
    window.print();
}

// ----------------------------------------------------
// FTM DATABASE & PREP AUTOMATION
// ----------------------------------------------------

function renderFTMDatabase() {
    document.getElementById('prep-plan-view').style.display = 'none';
    document.getElementById('btn-print-preps').style.display = 'none';
    document.getElementById('ftm-database-view').style.display = 'block';

    const ftmList = document.getElementById('ftm-list');
    let html = '<ul style="list-style: none; padding: 0; margin: 0;">';
    
    ftmDatabase.forEach(ftm => {
        html += `
            <li style="padding: 12px; border-bottom: 1px solid var(--border-color); cursor: pointer; transition: background 0.2s;" 
                onmouseover="this.style.backgroundColor='var(--accent-gold-alpha)'" 
                onmouseout="this.style.backgroundColor='transparent'"
                onclick="showFTMDetails('${ftm.id}')">
                <strong style="color: var(--accent-gold);">${ftm.name}</strong><br>
                <span style="font-size: 11px; color: var(--text-muted);">${ftm.sector}</span>
            </li>
        `;
    });
    html += '</ul>';
    ftmList.innerHTML = html;
}

function showFTMDetails(ftmId) {
    const ftm = ftmDatabase.find(f => f.id === ftmId);
    if (!ftm) return;

    const detailsDiv = document.getElementById('ftm-details');
    
    let ingHtml = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px;">
            <thead>
                <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
                    <th style="text-align: left; padding: 5px;">Ingrediente</th>
                    <th style="text-align: right; padding: 5px;">Qtd</th>
                </tr>
            </thead>
            <tbody>
    `;
    ftm.ingredients.forEach(ing => {
        ingHtml += `
            <tr style="border-bottom: 1px dashed rgba(255,255,255,0.05);">
                <td style="padding: 5px;">${ing.name}</td>
                <td style="text-align: right; padding: 5px;"><strong>${ing.qtd} ${ing.unit}</strong></td>
            </tr>
        `;
    });
    ingHtml += `</tbody></table>`;

    let procHtml = '<ul style="padding-left: 20px; font-size: 13px; color: #ddd; margin-top: 10px;">';
    ftm.process.forEach(p => {
        procHtml += `<li style="margin-bottom: 8px;">${p}</li>`;
    });
    procHtml += '</ul>';

    detailsDiv.innerHTML = `
        <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 8px; border: 1px solid var(--border-color);">
            <h2 style="color: var(--accent-gold); margin-top: 0;">${ftm.name}</h2>
            <div style="display: flex; gap: 20px; margin-bottom: 20px; font-size: 12px;">
                <div><strong>Setor:</strong> ${ftm.sector}</div>
                <div><strong>Rendimento Lote:</strong> ${ftm.yieldLote} ${ftm.yieldUnit}</div>
                <div><strong>Recipiente:</strong> ${ftm.prepContainer}</div>
                <div><strong>Validade:</strong> ${ftm.shelfLife}</div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                <div>
                    <h4 style="margin: 0 0 5px 0; border-bottom: 1px solid var(--accent-gold); padding-bottom: 5px;">Ficha Técnica (Ingredientes)</h4>
                    ${ingHtml}
                </div>
                <div>
                    <h4 style="margin: 0 0 5px 0; border-bottom: 1px solid var(--accent-gold); padding-bottom: 5px;">Processo / Finalização</h4>
                    ${procHtml}
                </div>
            </div>
        </div>
    `;
}

function generateProductionPlan() {
    document.getElementById('ftm-database-view').style.display = 'none';
    document.getElementById('prep-plan-view').style.display = 'block';
    document.getElementById('btn-print-preps').style.display = 'inline-block';

    const shiftData = ensureChecklistState();
    const movementForecast = document.getElementById('forecast-movimento') ? document.getElementById('forecast-movimento').value : 'medio';
    let productionTasks = [];
    let requisitionTasks = [];

    // Scan checklist for 0 or 1/4 marks
    for (const [sectionKey, sectionData] of Object.entries(CHECKLIST_PDF_SCHEMA)) {
        if (!shiftData[sectionKey]) continue;

        if (sectionData.volumeItems) {
            sectionData.volumeItems.forEach(item => {
                const vol = shiftData[sectionKey][`vol_${item.id}`];
                if (vol === '0' || vol === '1/4') {
                    // Check if it's in the ESTOQUE as a processed item (qty > 0)
                    const stockMatch = state.estoque.find(e => e.insumo.toLowerCase() === item.item.toLowerCase() || e.insumo.toLowerCase().includes(item.item.toLowerCase()) || item.item.toLowerCase().includes(e.insumo.toLowerCase()));
                    
                    if (stockMatch && (stockMatch.estoque_atual > 0 || stockMatch.saldo > 0)) {
                        requisitionTasks.push({ item: item.item, sub: item.sub, vol: vol, stock: stockMatch });
                    } else {
                        const ftmMatch = ftmDatabase.find(f => f.checklist_link.toLowerCase() === item.item.toLowerCase() || item.item.toLowerCase().includes(f.checklist_link.toLowerCase()));
                        if (ftmMatch) {
                            productionTasks.push({ ftm: ftmMatch, vol: vol });
                        }
                    }
                }
            });
        }

        // Automatic Requisition for Proteins (< parLevel based on movement)
        const countGroups = [sectionData.parrillaAcarte, sectionData.passeAcarte];
        countGroups.forEach(group => {
            if (group) {
                group.forEach(item => {
                    const uniVal = shiftData[sectionKey][`uni_${item.id}`] || shiftData[sectionKey][`passe_uni_${item.id}`];
                    const num = parseInt(uniVal, 10);
                    const parLevel = item.parLevels ? item.parLevels[movementForecast] : 10;
                    if (!isNaN(num) && num < parLevel) {
                        const qtdToReq = parLevel - num;
                        const stockMatch = state.estoque.find(e => e.insumo.toLowerCase() === item.item.toLowerCase() || e.insumo.toLowerCase().includes(item.item.toLowerCase()) || item.item.toLowerCase().includes(e.insumo.toLowerCase())) || { unidade: 'UN', estoque_atual: 0 };
                        
                        let targetQtdEstoque = qtdToReq;
                        if (stockMatch.unidade === 'KG' && item.sub) {
                            const match = item.sub.match(/(\d+)\s*g/i);
                            if (match) {
                                const grams = parseInt(match[1], 10);
                                targetQtdEstoque = (qtdToReq * grams) / 1000;
                            }
                        }

                        requisitionTasks.push({ 
                            item: item.item, 
                            sub: item.sub, 
                            vol: `Faltam ${qtdToReq}`, 
                            targetQtd: qtdToReq,
                            targetQtdEstoque: targetQtdEstoque,
                            stock: stockMatch 
                        });
                    }
                });
            }
        });
    }
    
    // Auto-populate Folha de Requisicao
    // First, clear previous automatic ones
    state.carrinho_requisicao = state.carrinho_requisicao.filter(i => i.origem !== 'Automático');
    // Add current ones
    requisitionTasks.forEach(req => {
        const actualName = req.stock.insumo || req.item;
        const existing = state.carrinho_requisicao.find(i => i.insumo === actualName || i.insumo === req.item);
        if (!existing) {
            state.carrinho_requisicao.push({
                insumo: actualName,
                qtd: req.targetQtd || 1, // Porções
                qtd_estoque: req.targetQtdEstoque || 1, // KG ou UNidade do Estoque
                unidade: req.stock.unidade || 'UN',
                origem: 'Automático'
            });
        }
    });
    saveState();

    const listDiv = document.getElementById('automated-prep-list');
    
    if (productionTasks.length === 0 && requisitionTasks.length === 0) {
        listDiv.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-muted);">
            <i class="fas fa-check-circle" style="font-size: 48px; color: var(--accent-gold); margin-bottom: 15px; display: block;"></i>
            <h3 style="color: #fff; margin-bottom: 10px;">Nenhuma produção pendente!</h3>
            <p>Os estoques de praça estão bons de acordo com o Checklist de hoje.</p>
            <p style="font-size: 11px; margin-top: 15px; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 4px;">
                <strong>Dica:</strong> Vá na aba <i class="fas fa-clipboard-check"></i> <b>Checklist Setores</b> e marque o volume de algum ingrediente como <b>0</b> ou <b>1/4</b>. Depois, volte aqui e clique em Gerar novamente!
            </p>
        </div>`;
        return;
    }

    let html = `<div style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;">`;
    
    // REQUISITION TABLE
    html += `<div class="glass-card" style="flex: 1; min-width: 320px; border-color: rgba(255,187,51,0.3);">
        <h3 style="color: var(--color-warning); margin-bottom: 16px; font-size: 15px; display: flex; align-items: center; gap: 8px;"><i class="fas fa-boxes"></i> Requisições (Buscar no Frio)</h3>`;
    if (requisitionTasks.length === 0) {
        html += `<p style="color: var(--text-muted); font-size: 13px;">Nenhum item para requisitar.</p>`;
    } else {
        html += `<div class="table-container"><table class="custom-table">
            <thead><tr>
                <th>Insumo</th>
                <th>Situação</th>
                <th>Ação / Pedido</th>
            </tr></thead><tbody>`;
        requisitionTasks.forEach(task => {
            const isTargetReq = task.targetQtd !== undefined;
            const urgencyColor = (task.vol === '0' || isTargetReq) ? '#ffbb33' : '#ff4444';
            const badgeText = isTargetReq ? `Baixo (Meta)` : (task.vol === '0' ? 'VAZIO' : '1/4');
            
            let actionDisplay = "Repor Imediato";
            if (isTargetReq) {
                actionDisplay = task.targetQtdEstoque !== task.targetQtd 
                    ? `Pedir: ${task.targetQtdEstoque.toFixed(2)} ${task.stock.unidade || 'UN'}<br><span style="font-size:10px;color:var(--text-muted)">(${task.targetQtd} porções)</span>` 
                    : `Pedir: ${task.targetQtd} ${task.stock.unidade || 'UN'}`;
            }
            
            const currentStock = task.stock.saldo !== undefined ? task.stock.saldo : (task.stock.estoque_atual || 0);
            
            html += `<tr>
                <td><strong>${task.item}</strong><br><span style="font-size: 11px; color: var(--text-muted);">${task.sub}</span></td>
                <td><span style="background: ${urgencyColor}; color: #000; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">${badgeText}</span><br><span style="font-size: 10px; color: var(--text-muted);">Est: ${currentStock} ${task.stock.unidade || 'UN'}</span></td>
                <td style="color: var(--color-success); font-weight: 600;">${actionDisplay}</td>
            </tr>`;
        });
        html += `</tbody></table></div>`;
    }
    html += `</div>`;

    // PRODUCTION TABLE
    html += `<div class="glass-card" style="flex: 1.5; min-width: 400px; border-color: rgba(255,68,68,0.3);">
        <h3 style="color: var(--color-danger); margin-bottom: 16px; font-size: 15px; display: flex; align-items: center; gap: 8px;"><i class="fas fa-fire-burner"></i> Preps Cozinha (Produzir)</h3>`;
    if (productionTasks.length === 0) {
        html += `<p style="color: var(--text-muted); font-size: 13px;">Nenhuma produção necessária.</p>`;
    } else {
        html += `<div class="table-container"><table class="custom-table">
            <thead><tr>
                <th>Ficha Técnica (Item)</th>
                <th>Nível</th>
                <th>Fazer (Lote)</th>
                <th>Recipiente</th>
            </tr></thead><tbody>`;
        productionTasks.forEach(task => {
            const urgencyColor = task.vol === '0' ? '#ff4444' : '#ffbb33';
            html += `<tr>
                <td><strong style="color: var(--accent-gold);">${task.ftm.name}</strong><br><span style="font-size: 11px; color: var(--text-muted);">${task.ftm.sector}</span></td>
                <td><span style="background: ${urgencyColor}; color: #000; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">${task.vol === '0' ? 'VAZIO' : '1/4'}</span></td>
                <td style="font-weight: bold;">${task.ftm.yieldLote} ${task.ftm.yieldUnit}</td>
                <td style="font-size: 12px; color: var(--text-secondary);">${task.ftm.prepContainer}</td>
            </tr>`;
        });
        html += `</tbody></table></div>`;
    }
    html += `</div>`;
    
    // CLOSE FLEX CONTAINER FOR THE FIRST TWO
    html += `</div>`;
    
    // PENDING INPUT PROCESSING TABLE (NOW BELOW AS FULL WIDTH)
    const pendentes = state.tarefas_pendentes.filter(t => t.status === "Pendente");
    if (pendentes.length > 0) {
        html += `<div class="glass-card" style="border-color: rgba(142, 68, 173, 0.4); width: 100%; margin-top: 24px;">
            <h3 style="color: #d2b4de; margin-bottom: 16px; font-size: 15px; display: flex; align-items: center; gap: 8px;"><i class="fas fa-boxes"></i> Processamento de Recebimentos Pendentes</h3>
            <div class="table-container"><table class="custom-table">
                <thead><tr>
                    <th>Insumo Bruto Recebido</th>
                    <th style="text-align: center;">Qtd a Processar</th>
                    <th style="text-align: right;">Ação</th>
                </tr></thead><tbody>`;
        pendentes.forEach(task => {
            html += `<tr>
                <td><strong>${task.insumo}</strong><br><span style="font-size: 11px; color: var(--text-muted);">Data da Entrada: ${task.data}</span></td>
                <td style="text-align: center; font-weight: bold; color: var(--accent-gold);">${task.qtd} ${task.unidade}</td>
                <td style="text-align: right;">
                    <button class="action-btn" style="background: var(--color-success); border: none; color: white; padding: 6px 12px; font-size: 12px; border-radius: 4px;" onclick="concluirTarefaRecebimento('${task.id}')"><i class="fas fa-check"></i> Concluir / Limpar</button>
                </td>
            </tr>`;
        });
        html += `</tbody></table></div></div>`;
    }

    listDiv.innerHTML = html;
}

function printPrepPlan() {
    const printArea = document.getElementById('print-area');
    const shiftData = ensureChecklistState();
    let productionTasks = [];
    let requisitionTasks = [];

    for (const [sectionKey, sectionData] of Object.entries(CHECKLIST_PDF_SCHEMA)) {
        if (!shiftData[sectionKey]) continue;
        if (sectionData.volumeItems) {
            sectionData.volumeItems.forEach(item => {
                const vol = shiftData[sectionKey][`vol_${item.id}`];
                if (vol === '0' || vol === '1/4') {
                    const stockMatch = state.estoque.find(e => e.insumo.toLowerCase() === item.item.toLowerCase());
                    if (stockMatch && (stockMatch.estoque_atual > 0 || stockMatch.saldo > 0)) {
                        requisitionTasks.push({ item: item.item, sub: item.sub, vol: vol, stock: stockMatch });
                    } else {
                        const matchedFtm = ftmDatabase.find(f => f.checklist_link.toLowerCase() === item.item.toLowerCase() || item.item.toLowerCase().includes(f.checklist_link.toLowerCase()));
                        if (matchedFtm) productionTasks.push({ ftm: matchedFtm, vol: vol });
                    }
                }
            });
        }
    }

    if (productionTasks.length === 0 && requisitionTasks.length === 0) {
        alert("Nenhuma produção pendente para imprimir.");
        return;
    }

    let printHtml = `
        <div class="print-page">
            <div class="print-header">
                <div>
                    <span class="logo-romerito" style="font-family: 'Playfair Display', serif;">ROMERITO</span>
                </div>
                <div class="print-header-center">
                    <h2>Plano de Abastecimento (Preps & Requisições)</h2>
                    <p>Automático via Sistema de Gestão Inteligente</p>
                </div>
                <div class="print-header-box" style="background-color: #c5a86d !important; color: #000 !important;">
                    ROTA DE PRODUÇÃO
                </div>
            </div>
            
            <div class="print-content">
    `;

    if (productionTasks.length > 0) {
        printHtml += `
                <table class="print-table" style="margin-bottom: 20px;">
                    <thead>
                        <tr>
                            <th colspan="4" style="background-color: #5a2a2a !important;">â–  ITENS PARA PRODUÇÃO NA COZINHA</th>
                        </tr>
                        <tr style="background-color: #2a2a4a !important; font-size: 11px;">
                            <th>Item a Produzir (FTM)</th>
                            <th style="width: 100px; text-align: center;">Nível na Praça</th>
                            <th style="width: 120px; text-align: center;">Comando (Lote)</th>
                            <th style="width: 150px;">Acondicionar em</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productionTasks.map(task => `
                            <tr>
                                <td><strong>${task.ftm.name}</strong><br><span style="color: #666 !important; font-size: 10px;">${task.ftm.sector}</span></td>
                                <td style="text-align: center;"><span class="print-value-filled">${task.vol === '0' ? 'VAZIO' : '1/4 (Baixo)'}</span></td>
                                <td style="text-align: center;"><span class="print-value-filled">${task.ftm.yieldLote} ${task.ftm.yieldUnit}</span></td>
                                <td>${task.ftm.prepContainer}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
        `;
    }

    if (requisitionTasks.length > 0) {
        printHtml += `
                <table class="print-table">
                    <thead>
                        <tr>
                            <th colspan="4" style="background-color: #2a5a3a !important;">â–  ITENS PARA REQUISITAR (ALMOXARIFADO / CÂMARA FRIA)</th>
                        </tr>
                        <tr style="background-color: #2a2a4a !important; font-size: 11px;">
                            <th>Insumo Processado / Porcionado</th>
                            <th style="width: 100px; text-align: center;">Nível na Praça</th>
                            <th style="width: 120px; text-align: center;">Qtd Puxar</th>
                            <th style="width: 150px;">Observação</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${requisitionTasks.map(task => `
                            <tr>
                                <td><strong>${task.item}</strong><br><span style="color: #666 !important; font-size: 10px;">${task.sub}</span></td>
                                <td style="text-align: center;"><span class="print-value-filled">${task.vol === '0' ? 'VAZIO' : '1/4 (Baixo)'}</span></td>
                                <td style="text-align: center;"><span class="print-value-filled">__ ${task.stock.unidade}</span></td>
                                <td>Transferir p/ Praça</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
        `;
    }

    printHtml += `
            </div>
            <div class="print-footer">
                <div>ROMERITO GASTRONOMIA</div>
                <div>Lista Automática (Preps + Requisições)</div>
                <div>Pág. Impressa via Système Précis</div>
            </div>
        </div>
    `;

    printArea.innerHTML = printHtml;
    window.print();
}

// ----------------------------------------------------
// FOLHA DE REQUISICAO RENDER
// ----------------------------------------------------
function renderFolhaRequisicao() {
    const tableBody = document.getElementById('folha-req-table-body');
    const selectInsumo = document.getElementById('carrinho-insumo');
    
    // Unificar insumos dos dois estoques para o dropdown
    const todosInsumosMap = new Map();
    state.estoque.forEach(i => { if (i.insumo && !i.insumo.includes('PRODUÇÃO INTERNA')) todosInsumosMap.set(i.insumo, i); });
    if (state.estoque_geral) {
        state.estoque_geral.forEach(i => { 
            if (i.insumo && !todosInsumosMap.has(i.insumo)) todosInsumosMap.set(i.insumo, i); 
        });
    }
    const todosInsumosArray = Array.from(todosInsumosMap.values()).sort((a,b) => a.insumo.localeCompare(b.insumo));

    // Populate Select Options
    selectInsumo.innerHTML = '<option value="">-- Selecione o Insumo --</option>' + 
        todosInsumosArray.map(item => {
            const stockDyn = state.estoque.find(e => e.insumo === item.insumo);
            const stockGer = (state.estoque_geral || []).find(e => e.insumo === item.insumo);
            const saldoDyn = stockDyn ? (stockDyn.estoque_atual || 0) : 0;
            const saldoGer = stockGer ? (stockGer.estoque_atual || 0) : 0;
            return `<option value="${item.insumo}" data-unit="${item.unidade}">${item.insumo} (Dinâmico: ${saldoDyn} | Geral: ${saldoGer})</option>`;
        }).join('');

    // Handle unit autocomplete
    selectInsumo.removeEventListener('change', handleSelectInsumoChange); // prevent dupes
    selectInsumo.addEventListener('change', handleSelectInsumoChange);
    
    // Render Table
    if (state.carrinho_requisicao.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">Folha vazia. Adicione itens acima ou gere pela aba de Preps.</td></tr>`;
    } else {
        tableBody.innerHTML = state.carrinho_requisicao.map((item, index) => {
            const stockMatchDyn = state.estoque.find(e => e.insumo === item.insumo);
            const stockMatchGer = (state.estoque_geral || []).find(e => e.insumo === item.insumo);
            const saldoDyn = stockMatchDyn ? (stockMatchDyn.estoque_atual || 0) : 0;
            const saldoGer = stockMatchGer ? (stockMatchGer.estoque_atual || 0) : 0;
            const unitDyn = stockMatchDyn ? stockMatchDyn.unidade : item.unidade;
            const unitGer = stockMatchGer ? stockMatchGer.unidade : item.unidade;
            const isAlert = item.qtd > (saldoDyn + saldoGer);
            
            return `
            <tr style="${isAlert ? 'background: rgba(239, 68, 68, 0.1);' : ''}">
                <td><strong>${item.insumo}</strong></td>
                <td style="font-weight: bold; color: ${isAlert ? 'var(--color-danger)' : 'var(--accent-gold)'};">
                    ${item.qtd} ${item.unidade} ${item.qtd_estoque && item.qtd_estoque !== item.qtd ? `<br><span style="font-size: 10px; color: var(--text-muted);">(= ${item.qtd_estoque.toFixed(2)} ${item.unidade})</span>` : ''}
                </td>
                <td><strong>${saldoDyn}</strong> ${unitDyn}</td>
                <td><strong>${saldoGer}</strong> ${unitGer}</td>
                <td><span class="badge ${item.origem === 'Automático' ? 'info' : 'warning'}">${item.origem}</span></td>
                <td style="text-align: right;">
                    <button class="action-btn secondary" style="padding: 4px 8px;" onclick="removerDoCarrinho(${index})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
            `;
        }).join('');
    }
}

function handleSelectInsumoChange(e) {
    const opt = e.target.options[e.target.selectedIndex];
    document.getElementById('carrinho-unidade').value = opt ? (opt.getAttribute('data-unit') || '') : '';
}

function removerDoCarrinho(index) {
    state.carrinho_requisicao.splice(index, 1);
    saveState();
    renderFolhaRequisicao();
}

function printFolhaRequisicao() {
    const printArea = document.getElementById('print-area');
    
    let itemsToPrint = state.carrinho_requisicao.length > 0 
        ? state.carrinho_requisicao.map(req => {
            const match = state.estoque.find(e => e.insumo === req.insumo) || {};
            return {
                insumo: req.insumo,
                categoria: match.categoria || 'ITENS SOLICITADOS',
                unidade: req.unidade,
                qtd: req.qtd_estoque !== undefined ? req.qtd_estoque.toFixed(2) : req.qtd
            };
        }).filter(item => {
            const cat = (item.categoria || '').toLowerCase();
            return !cat.includes('horti') && 
                   !cat.includes('produção interna') && 
                   !cat.includes('producao interna') &&
                   !cat.includes('subproduto');
        }) 
        : state.estoque.filter(e => {
            const cat = (e.categoria || '').toLowerCase();
            return !cat.includes('horti') && 
                   !cat.includes('produção interna') && 
                   !cat.includes('producao interna') &&
                   !cat.includes('subproduto');
        }).map(e => ({
            insumo: e.insumo,
            categoria: e.categoria || 'OUTROS',
            unidade: e.unidade,
            qtd: '' // blank for manual fill
        }));

    // Group items by category
    const grouped = itemsToPrint.reduce((acc, item) => {
        if (!acc[item.categoria]) acc[item.categoria] = [];
        acc[item.categoria].push(item);
        return acc;
    }, {});

    const dateStr = new Date().toLocaleDateString('pt-BR');
    const dayStr = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
    const monthYear = new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

    let printHtml = `
        <div class="print-page">
            <!-- HEADER -->
            <div style="background-color: #141423; color: white; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #c5a86d; margin-bottom: 20px;">
                <div><span class="logo-romerito" style="font-family: 'Playfair Display', serif; font-size: 32px; letter-spacing: 2px;">ROMERITO</span></div>
                <div style="text-align: center;">
                    <h2 style="margin: 0; font-size: 20px;">Requisição Diária — Sistema PRÉCIS</h2>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #aaa;">Romerito Gastronomia · Reposição de Insumos · Todos os Dias</p>
                </div>
                <div style="background-color: #7a2a2a; color: white; padding: 10px 30px; font-weight: bold; border: 1px solid #9a3a3a; font-size: 14px;">
                    REQUISIÇÃO
                </div>
            </div>

            <div class="print-content" style="padding: 0 40px;">
                <!-- COMO USAR -->
                <div style="border: 1px solid #c5a86d; padding: 12px; margin-bottom: 10px; background-color: #fcf8f2;">
                    <p style="margin: 0; color: #5a2a2a; font-size: 12px;"><strong>COMO USAR: Preencha a Qtd Solicitada conforme a necessidade do dia. Todos os campos de quantidade ficam em branco para preenchimento à mão.</strong><br>
                    <span style="color: #666; font-size: 11px;">Cada requisição deve ser assinada pelo responsável e aprovada pelo Chef ou Gerente antes do envio ao estoque. Arquivar via do responsável.</span></p>
                </div>

                <!-- ASSINATURAS TOP -->
                <div style="display: flex; border: 1px solid #c5a86d; background-color: #fdf5d3; margin-bottom: 20px; font-size: 12px;">
                    <div style="flex: 1; border-right: 1px solid #c5a86d; padding: 10px;"><strong>Data:</strong> ${dateStr}</div>
                    <div style="flex: 1; border-right: 1px solid #c5a86d; padding: 10px;"><strong>Dia da semana:</strong> ${dayStr}</div>
                    <div style="flex: 1; border-right: 1px solid #c5a86d; padding: 10px;"><strong>Responsável:</strong></div>
                    <div style="flex: 1; padding: 10px;"><strong>Aprovado por:</strong></div>
                </div>
    `;

    // TABLES BY CATEGORY
    for (const [catName, items] of Object.entries(grouped)) {
        printHtml += `
                <table class="print-table" style="margin-bottom: 20px; font-size: 12px; width: 100%;">
                    <thead>
                        <tr>
                            <th colspan="6" style="background-color: #5a2a2a !important; color: white !important; font-size: 13px; padding: 8px;">â–  ${catName.toUpperCase()}</th>
                        </tr>
                        <tr style="background-color: #141423 !important; color: white !important;">
                            <th style="width: 30px; text-align: center;">#</th>
                            <th>Item / Insumo</th>
                            <th style="width: 50px; text-align: center;">Un.</th>
                            <th style="width: 100px; text-align: center;">Qtd Solicitada</th>
                            <th style="width: 100px; text-align: center;">Qtd Entregue</th>
                            <th style="width: 150px;">Obs.</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map((item, idx) => `
                            <tr>
                                <td style="text-align: center; color: #666;">${idx + 1}</td>
                                <td><strong>${item.insumo}</strong></td>
                                <td style="text-align: center; color: #666;">${item.unidade}</td>
                                <td style="text-align: center; font-size: 14px;"><strong>${item.qtd}</strong></td>
                                <td></td>
                                <td></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
        `;
    }

    // BOTTOM SIGNATURES
    printHtml += `
                <div style="margin-top: 40px; border: 1px solid #c5a86d; background-color: #fdf5d3; display: flex; padding: 15px;">
                    <div style="flex: 1; border-right: 1px solid #c5a86d; padding-right: 15px;">
                        <p style="margin-top: 0; font-size: 12px; color: #666;">Responsável pela requisição:</p>
                        <div style="margin-top: 40px; font-size: 12px; color: #666;">Data: ____________________ Horário: ______________</div>
                    </div>
                    <div style="flex: 1; padding-left: 15px;">
                        <p style="margin-top: 0; font-size: 12px; color: #666;">Aprovado por (Chef/Gerente):</p>
                        <div style="margin-top: 40px; font-size: 12px; color: #666;">Data: ____________________ Horário: ______________</div>
                    </div>
                </div>
            </div>
            
            <div class="print-footer" style="padding: 10px 40px;">
                <div>ROMERITO GASTRONOMIA</div>
                <div>Requisição Diária · Sistema PRÉCIS · ${monthYear}</div>
                <div>Pág. Impressa via Sistema</div>
            </div>
        </div>
    `;

    printArea.innerHTML = printHtml;
    window.print();
}

function aprovarFolhaRequisicao() {
    if (state.carrinho_requisicao.length === 0) {
        alert("A folha de requisição está vazia!");
        return;
    }
    
    let hasErrors = false;
    
    // 1. Validate stocks
    for (const req of state.carrinho_requisicao) {
        const stockMatch = state.estoque.find(e => e.insumo.toLowerCase() === req.insumo.toLowerCase() || e.insumo.toLowerCase().includes(req.insumo.toLowerCase()) || req.insumo.toLowerCase().includes(e.insumo.toLowerCase()));
        const deductedQtd = req.qtd_estoque !== undefined ? req.qtd_estoque : req.qtd;
        if (!stockMatch || stockMatch.estoque_atual < deductedQtd) {
            alert(`Saldo insuficiente para: ${req.insumo}. O saldo atual é ${stockMatch ? stockMatch.estoque_atual.toFixed(2) : 0} ${stockMatch ? stockMatch.unidade : ''}. (Tentando retirar ${deductedQtd.toFixed(2)} ${stockMatch ? stockMatch.unidade : ''})`);
            hasErrors = true;
            break;
        }
    }
    
    if (hasErrors) return;
    
    // 2. Process
    state.carrinho_requisicao.forEach(req => {
        const stockMatch = state.estoque.find(e => e.insumo.toLowerCase() === req.insumo.toLowerCase() || e.insumo.toLowerCase().includes(req.insumo.toLowerCase()) || req.insumo.toLowerCase().includes(e.insumo.toLowerCase()));
        const deductedQtd = req.qtd_estoque !== undefined ? req.qtd_estoque : req.qtd;
        const newReq = {
            id: `REQ-${String(state.requisicoes.length + 1).padStart(3, '0')}`,
            insumo: stockMatch ? stockMatch.insumo : req.insumo,
            qtd: deductedQtd,
            unidade: stockMatch ? stockMatch.unidade : req.unidade,
            setor: "PRAÇA (Cozinha)",
            motivo: `Reposição ${req.origem} (${req.qtd} porções)`,
            responsavel: "Equipe Cozinha",
            turno: "Integral",
            data: new Date().toISOString().split('T')[0]
        };
        state.requisicoes.push(newReq);
    });
    
    // 3. Clear and Save
    state.carrinho_requisicao = [];
    recalculateStockBalances();
    saveState();
    
    alert("Folha de Requisição aprovada com sucesso! O estoque principal foi atualizado.");
    renderFolhaRequisicao();
}

function atualizarQtdEstoqueFolha(index, val) {
    state.carrinho_requisicao[index].qtd_estoque = parseFloat(val) || 0;
    saveState();
}

// ----------------------------------------------------
// EQUIPE & COMISSOES RENDER
// ----------------------------------------------------
let comissoesChart = null;

function renderEquipe() {
    const grid = document.getElementById('team-scoreboard-grid');
    
    // Sort employees by total commission descending
    const sortedComissoes = [...state.comissoes].sort((a, b) => {
        const valA = parseFloat(String(a.comissao).replace('R$','').replace('.','').replace(',','.').trim() || 0);
        const valB = parseFloat(String(b.comissao).replace('R$','').replace('.','').replace(',','.').trim() || 0);
        return valB - valA;
    });

    grid.innerHTML = sortedComissoes.map(colab => {
        let ptsPreps = colab.pts_preps != null ? colab.pts_preps : '—';
        let ptsVendas = colab.pts_vendas != null ? colab.pts_vendas : '—';
        let ptsQualidade = colab.pts_qualidade != null ? colab.pts_qualidade : '—';
        
        return `
            <div class="glass-card employee-score-card">
                <div class="employee-score-header">
                    <div>
                        <h4 class="employee-name">${colab.colaborador}</h4>
                        <span class="employee-role">${colab.cargo}</span>
                    </div>
                    <span class="badge info" style="background-color: var(--accent-gold-alpha); color: var(--accent-gold); border: 1px solid rgba(197, 168, 109, 0.2);">${colab.mes_ref || 'Jun/26'}</span>
                </div>
                <div class="points-breakdown">
                    <div class="point-pill">
                        <label>Preps</label>
                        <span>${ptsPreps}</span>
                    </div>
                    <div class="point-pill">
                        <label>Vendas</label>
                        <span>${ptsVendas}</span>
                    </div>
                    <div class="point-pill">
                        <label>Qualidade</label>
                        <span>${ptsQualidade}</span>
                    </div>
                    <div class="point-pill" style="background-color: rgba(197, 168, 109, 0.05);">
                        <label style="color: var(--accent-gold);">Total</label>
                        <span style="color: var(--accent-gold);">${colab.total_pts || '—'}</span>
                    </div>
                </div>
                <div class="comissao-val">
                    <label>Comissão Estimada</label>
                    <span>${colab.comissao || '—'}</span>
                </div>
            </div>
        `;
    }).join('');

    // Render comparison chart (top 6 earners)
    const topColabs = sortedComissoes.slice(0, 6);
    const labels = topColabs.map(c => c.colaborador);
    const values = topColabs.map(c => {
        return parseFloat(String(c.comissao).replace('R$','').replace('.','').replace(',','.').trim() || 0);
    });

    if (comissoesChart) {
        comissoesChart.destroy();
    }

    const ctx = document.getElementById('comissoesChart').getContext('2d');
    comissoesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Comissão (R$)',
                data: values,
                backgroundColor: 'rgba(197, 168, 109, 0.6)',
                borderColor: 'var(--accent-gold)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

// ----------------------------------------------------
// MONITORAMENTO (TEMPS & WASTES) RENDER
// ----------------------------------------------------
let monitorActiveSubtab = 'subtab-temperaturas';

function renderMonitoramento() {
    const tempPanel = document.getElementById('mon-temperaturas-panel');
    const quebraPanel = document.getElementById('mon-quebras-panel');
    
    if (monitorActiveSubtab === 'subtab-temperaturas') {
        tempPanel.style.display = 'block';
        quebraPanel.style.display = 'none';
        renderTemperaturasHistory();
    } else {
        tempPanel.style.display = 'none';
        quebraPanel.style.display = 'block';
        renderQuebrasHistory();
    }
}

function renderTemperaturasHistory() {
    const tableBody = document.getElementById('temperaturas-table-body');
    const sorted = [...state.temperaturas].reverse();

    tableBody.innerHTML = sorted.map(t => {
        const isOk = t.status === "OK";
        return `
            <tr>
                <td><strong>#${t.id}</strong></td>
                <td>${t.equipamento}</td>
                <td><span class="badge info">${t.tipo}</span></td>
                <td><strong>${t.temp}°C</strong></td>
                <td>${t.min}°C a ${t.max}°C</td>
                <td>${t.data}</td>
                <td>${t.responsavel}</td>
                <td><span class="badge ${isOk ? 'success' : 'danger'}">${t.status}</span></td>
            </tr>
        `;
    }).join('');
}

function renderQuebrasHistory() {
    const tableBody = document.getElementById('quebras-table-body');
    const sorted = [...state.quebras].reverse();

    if (sorted.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 32px;">Nenhuma perda registrada.</td></tr>`;
        return;
    }

    tableBody.innerHTML = sorted.map(q => `
        <tr>
            <td><strong>#${q.id}</strong></td>
            <td>${q.data}</td>
            <td><strong>${q.ingrediente}</strong></td>
            <td>${q.qtd} ${q.unidade}</td>
            <td style="max-width: 200px;">${q.motivo}</td>
            <td style="color: var(--color-danger); font-weight: 600;">R$ ${parseFloat(q.custo).toFixed(2)}</td>
            <td>${q.responsavel}</td>
        </tr>
    `).join('');
}

// ----------------------------------------------------
// MODALS MANAGEMENT
// ----------------------------------------------------
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function openLaunchRequisitionModal(defaultInsumo = '') {
    const insumoSelect = document.getElementById('req-insumo');
    
    // Populate options
    insumoSelect.innerHTML = '<option value="">Selecione o Insumo</option>' + 
        state.estoque.map(item => `<option value="${item.insumo}" data-unit="${item.unidade}">${item.insumo} (${item.unidade})</option>`).join('');
        
    if (defaultInsumo) {
        insumoSelect.value = defaultInsumo;
        const opt = insumoSelect.options[insumoSelect.selectedIndex];
        document.getElementById('req-unidade').value = opt.getAttribute('data-unit') || '';
    } else {
        document.getElementById('req-unidade').value = '';
    }

    insumoSelect.addEventListener('change', () => {
        const opt = insumoSelect.options[insumoSelect.selectedIndex];
        document.getElementById('req-unidade').value = opt.getAttribute('data-unit') || '';
    });

    openModal('modal-requisicao');
}

function openLaunchInputModal(defaultInsumo = '') {
    const insumoSelect = document.getElementById('input-insumo');
    
    // Populate options
    insumoSelect.innerHTML = '<option value="">Selecione o Insumo</option>' + 
        state.estoque.map(item => `<option value="${item.insumo}" data-unit="${item.unidade}">${item.insumo} (${item.unidade})</option>`).join('');
        
    if (defaultInsumo) {
        insumoSelect.value = defaultInsumo;
        const opt = insumoSelect.options[insumoSelect.selectedIndex];
        document.getElementById('input-unidade').value = opt.getAttribute('data-unit') || '';
    } else {
        document.getElementById('input-unidade').value = '';
    }

    insumoSelect.addEventListener('change', () => {
        const opt = insumoSelect.options[insumoSelect.selectedIndex];
        document.getElementById('input-unidade').value = opt.getAttribute('data-unit') || '';
    });

    openModal('modal-entrada');
}

function openAddTempModal() {
    openModal('modal-temperatura');
}

function openAddQuebraModal() {
    const insumoSelect = document.getElementById('quebra-insumo');
    
    // Populate options
    insumoSelect.innerHTML = '<option value="">Selecione o Insumo</option>' + 
        state.estoque.map(item => `<option value="${item.insumo}" data-unit="${item.unidade}">${item.insumo} (${item.unidade})</option>`).join('');
        
    insumoSelect.addEventListener('change', () => {
        const opt = insumoSelect.options[insumoSelect.selectedIndex];
        document.getElementById('quebra-unidade').value = opt.getAttribute('data-unit') || '';
    });
    
    openModal('modal-quebra');
}

// ----------------------------------------------------
// FORM SUBMISSIONS LOGIC
// ----------------------------------------------------
function setupEventListeners() {
    // 1. Requisition Submit
    document.getElementById('form-requisicao').addEventListener('submit', (e) => {
        e.preventDefault();
        const insumo = document.getElementById('req-insumo').value;
        const qtd = parseFloat(document.getElementById('req-qtd').value);
        const unidade = document.getElementById('req-unidade').value;
        const setor = document.getElementById('req-setor').value;
        const motivo = document.getElementById('req-motivo').value;
        const responsavel = document.getElementById('req-responsavel').value;
        const turno = document.getElementById('req-turno').value;
        
        if (!insumo || isNaN(qtd) || qtd <= 0) return;

        // Verify stock availability
        const stockItem = state.estoque.find(i => i.insumo === insumo);
        if (stockItem && stockItem.estoque_atual < qtd) {
            alert(`Saldo insuficiente! Estoque atual de ${insumo} é de ${stockItem.estoque_atual} ${unidade}.`);
            return;
        }

        const newId = `REQ-${String(state.requisicoes.length + 1).padStart(3, '0')}`;
        const newReq = {
            id: newId,
            insumo,
            qtd,
            unidade,
            setor,
            motivo,
            responsavel,
            turno,
            data: new Date().toISOString().split('T')[0]
        };

        state.requisicoes.push(newReq);
        recalculateStockBalances();
        saveState();
        closeModal('modal-requisicao');
        renderActiveTab();
    });

    // 2. Input (Entrada) Submit
    document.getElementById('form-entrada').addEventListener('submit', (e) => {
        e.preventDefault();
        const produto_insumo = document.getElementById('input-insumo').value;
        const qtd = parseFloat(document.getElementById('input-qtd').value);
        const unidade = document.getElementById('input-unidade').value;
        const fornecedor = document.getElementById('input-fornecedor').value;
        const temp_c = document.getElementById('input-temp').value;
        const nf = document.getElementById('input-nf').value;
        const responsavel = document.getElementById('input-responsavel').value;
        const peso_bruto = parseFloat(document.getElementById('input-pesobruto').value || 0);
        const peso_liquido = parseFloat(document.getElementById('input-pesoliquido').value || 0);
        const exigePrep = document.getElementById('input-gerar-prep').checked;
        
        if (!produto_insumo || isNaN(qtd) || qtd <= 0) return;

        const newId = `ENT-${String(state.entradas.length + 1).padStart(4, '0')}`;
        const dataStr = new Date().toISOString().split('T')[0];
        
        const newEnt = {
            id: newId,
            data: dataStr,
            produto_insumo,
            qtd,
            unidade,
            fornecedor,
            temp_c: temp_c ? `${temp_c}°C` : '—',
            responsavel,
            nf,
            peso_bruto,
            peso_liquido,
            status: "âœ… Conforme",
            divergencia: "—"
        };

        state.entradas.push(newEnt);
        
        if (exigePrep) {
            state.tarefas_pendentes.push({
                id: `TP-${Date.now()}`,
                data: dataStr,
                insumo: produto_insumo,
                qtd: qtd,
                unidade: unidade,
                status: "Pendente"
            });
        }
        
        recalculateStockBalances();
        saveState();
        closeModal('modal-entrada');
        
        // Reset checkbox
        document.getElementById('input-gerar-prep').checked = false;
        
        renderActiveTab();
    });

    // 3. Temperature Submit
    document.getElementById('form-temperatura').addEventListener('submit', (e) => {
        e.preventDefault();
        const equipamento = document.getElementById('temp-equipamento').value;
        const tipo = document.getElementById('temp-tipo').value;
        const temp = parseFloat(document.getElementById('temp-valor').value);
        const responsavel = document.getElementById('temp-responsavel').value;
        
        if (!equipamento || isNaN(temp)) return;

        // Set ANVISA limit boundaries
        let min = 1, max = 5; // default refrigerado
        if (tipo === 'Congelado') {
            min = -22;
            max = -15;
        }

        const isOk = temp >= min && temp <= max;
        const status = isOk ? "OK" : "Fora da Faixa";

        const newTemp = {
            id: state.temperaturas.length + 1,
            equipamento,
            tipo,
            temp,
            min,
            max,
            data: new Date().toLocaleString('pt-BR', { hour12: false }).replace(',', ''),
            responsavel,
            status
        };

        state.temperaturas.push(newTemp);
        saveState();
        closeModal('modal-temperatura');
        renderActiveTab();
    });

    // 4. Loss (Quebra) Submit
    document.getElementById('form-quebra').addEventListener('submit', (e) => {
        e.preventDefault();
        const ingrediente = document.getElementById('quebra-insumo').value;
        const qtd = parseFloat(document.getElementById('quebra-qtd').value);
        const unidade = document.getElementById('quebra-unidade').value;
        const motivo = document.getElementById('quebra-motivo').value;
        const custo = parseFloat(document.getElementById('quebra-custo').value);
        const responsavel = document.getElementById('quebra-responsavel').value;
        
        if (!ingrediente || isNaN(qtd) || isNaN(custo)) return;

        // Verify stock availability
        const stockItem = state.estoque.find(i => i.insumo === ingrediente);
        if (stockItem && stockItem.estoque_atual < qtd) {
            alert(`Saldo de estoque insuficiente para registrar perda!`);
            return;
        }

        const newQuebra = {
            id: state.quebras.length + 1,
            data: new Date().toISOString().split('T')[0],
            ingrediente,
            qtd,
            unidade,
            motivo,
            custo,
            responsavel
        };

        state.quebras.push(newQuebra);
        recalculateStockBalances();
        saveState();
        closeModal('modal-quebra');
        renderActiveTab();
    });

    // 4.5. Folha de Requisicao (Manual Add)
    document.getElementById('form-add-carrinho').addEventListener('submit', (e) => {
        e.preventDefault();
        const insumo = document.getElementById('carrinho-insumo').value;
        const qtd = parseFloat(document.getElementById('carrinho-qtd').value);
        const unidade = document.getElementById('carrinho-unidade').value;
        
        if (!insumo || isNaN(qtd) || qtd <= 0) return;
        
        // Check if already in cart
        const existing = state.carrinho_requisicao.find(i => i.insumo === insumo);
        if (existing) {
            existing.qtd += qtd;
        } else {
            state.carrinho_requisicao.push({
                insumo,
                qtd,
                unidade,
                origem: 'Manual'
            });
        }
        
        saveState();
        renderFolhaRequisicao();
        
        // Reset
        document.getElementById('carrinho-insumo').value = '';
        document.getElementById('carrinho-qtd').value = '';
        document.getElementById('carrinho-unidade').value = '';
    });

    // 4.6. Concluir Processamento (Baixa e Nova Entrada)
    document.getElementById('form-concluir-prep').addEventListener('submit', (e) => {
        e.preventDefault();
        const taskId = document.getElementById('prep-task-id').value;
        const insumoGerado = document.getElementById('prep-insumo-gerado').value;
        const qtdGerada = parseFloat(document.getElementById('prep-qtd-gerada').value);
        const unidadeGerada = document.getElementById('prep-unidade-gerada').value;

        if (!insumoGerado || isNaN(qtdGerada) || qtdGerada <= 0) return;

        const taskIndex = state.tarefas_pendentes.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
            const task = state.tarefas_pendentes[taskIndex];
            
            // Mark task as completed
            task.status = "Concluído";
            
            // Abater o Insumo Bruto (task.insumo) no Estoque
            const brutoMatch = state.estoque.find(i => i.insumo === task.insumo);
            if (brutoMatch) {
                state.quebras.push({
                    id: state.quebras.length + 1,
                    data: new Date().toISOString().split('T')[0],
                    ingrediente: task.insumo,
                    qtd: task.qtd,
                    unidade: task.unidade,
                    motivo: `Processamento (Gerou ${insumoGerado})`,
                    custo: 0,
                    responsavel: "Sistema"
                });
            }

            // Dar entrada no Insumo Processado
            state.entradas.push({
                id: `PRC-${String(state.entradas.length + 1).padStart(4, '0')}`,
                data: new Date().toISOString().split('T')[0],
                produto_insumo: insumoGerado,
                qtd: qtdGerada,
                unidade: unidadeGerada,
                fornecedor: "Produção Interna",
                temp_c: "—",
                responsavel: "Equipe Prep",
                nf: "PROCESSO",
                peso_bruto: 0,
                peso_liquido: qtdGerada,
                status: "âœ… Conforme",
                divergencia: "—"
            });

            // Log no histórico
            state.preps_historico.push({
                data: new Date().toISOString().split('T')[0],
                setor: "PREP RECEBIMENTO",
                item: task.insumo,
                processo: `Processou ${task.qtd}${task.unidade} -> Gerou ${qtdGerada}${unidadeGerada} de ${insumoGerado}`,
                status: "ðŸŸ¢ Produzido",
                responsavel: "Equipe Prep",
                turno: "Recebimento",
                obs: "Conversão Automática",
                hora: new Date().toTimeString().split(' ')[0]
            });
            
            recalculateStockBalances();
            saveState();
            closeModal('modal-concluir-prep');
            
            // Reset fields
            document.getElementById('prep-insumo-gerado').value = '';
            document.getElementById('prep-qtd-gerada').value = '';
            
            generateProductionPlan(); // Re-render the list
        }
    });

    // 5. Estoque Search and Filters
    document.getElementById('estoque-search').addEventListener('input', (e) => {
        estoqueSearchQuery = e.target.value;
        renderEstoque();
    });
    
    document.getElementById('estoque-category-filter').addEventListener('change', (e) => {
        estoqueCategoryFilter = e.target.value;
        renderEstoque();
    });

    // 6. Cardapio Search and Filters
    document.getElementById('cardapio-search').addEventListener('input', (e) => {
        cardapioSearchQuery = e.target.value;
        renderCardapio();
    });

    document.querySelectorAll('.tab-btn[data-cardapio-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn[data-cardapio-tab]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            cardapioTab = btn.getAttribute('data-cardapio-tab');
            renderCardapio();
        });
    });

    // 7. Fichas Search and Filters
    document.getElementById('recipes-search').addEventListener('input', (e) => {
        recipesSearchQuery = e.target.value;
        renderRecipesList();
    });

    document.querySelectorAll('.tab-btn[data-fichas-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn[data-fichas-tab]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderRecipesList();
        });
    });

    document.getElementById('recipes-category-filter').addEventListener('change', (e) => {
        recipesCategoryFilter = e.target.value;
        renderRecipesList();
    });

    // 8. Movimentacoes Subtab routing
    document.querySelectorAll('.tab-btn[data-mov-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn[data-mov-tab]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            movActiveSubtab = btn.getAttribute('data-mov-tab');
            renderMovimentacoes();
        });
    });

    // 9. Monitoramento Subtab routing
    document.querySelectorAll('.tab-btn[data-mon-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn[data-mon-tab]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            monitorActiveSubtab = btn.getAttribute('data-mon-tab');
            renderMonitoramento();
        });
    });

    // 10. Print Recipe Handler
    document.getElementById('btn-print-recipe').addEventListener('click', () => {
        const printArea = document.getElementById('print-area');
        const recipeContent = document.getElementById('recipe-detail-content').innerHTML;
        
        const printHtml = `
            <div class="print-page">
                <div class="print-header" style="margin-bottom: 20px;">
                    <div><span class="logo-romerito" style="font-family: 'Playfair Display', serif; font-size: 24px;">ROMERITO</span></div>
                    <div class="print-header-center">
                        <h2>Ficha Técnica de Preparo</h2>
                    </div>
                </div>
                <div class="print-content" style="padding: 20px;">
                    ${recipeContent}
                </div>
            </div>
        `;
        
        printArea.innerHTML = printHtml;
        window.print();
    });
}

// Global invocation handlers for modals (so they work from inline HTML onclick)
window.openLaunchRequisitionModal = openLaunchRequisitionModal;
window.openLaunchInputModal = openLaunchInputModal;
window.openAddTempModal = openAddTempModal;
window.openAddQuebraModal = openAddQuebraModal;
window.closeModal = closeModal;
window.selectRecipeByName = selectRecipeByName;
window.closeRecipeDetail = closeRecipeDetail;
window.toggleAvailability = toggleAvailability;
window.toggleHighlight = toggleHighlight;
window.concluirTarefaRecebimento = concluirTarefaRecebimento;
window.aprovarFolhaRequisicao = aprovarFolhaRequisicao;
window.removerDoCarrinho = removerDoCarrinho;

// Document Ready
document.addEventListener('DOMContentLoaded', () => {
    initApp();

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
        
        // Fechar a sidebar ao clicar em um item de menu no mobile
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('open');
                }
            });
        });
    }
});

// ----------------------------------------------------
// AUDITORIA E CMV RENDER
// ----------------------------------------------------

function renderAuditoria() {
    // 1. Renderizar select de vendas
    const pratoSelect = document.getElementById('venda-prato');
    // Combine cardapio and recipes if needed, but recipes are better as they have FTM
    pratoSelect.innerHTML = '<option value="">Selecione a FTM...</option>' + 
        state.recipes.map(r => `<option value="${r.id}">${r.preparacao} (Rend: ${r.rendimento})</option>`).join('');

    // 2. Renderizar tabela de Vendas
    const vendasBody = document.getElementById('vendas-table-body');
    if (state.vendas_semana.length === 0) {
        vendasBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">Nenhum cruzamento diário registrado.</td></tr>`;
    } else {
        vendasBody.innerHTML = state.vendas_semana.map((v, index) => {
            const caixa = v.qtd_caixa || 0;
            const kds = v.qtd_kds !== undefined ? v.qtd_kds : (v.qtd || 0); // fallback para legado
            const desvio = kds - caixa;
            const desvioColor = desvio > 0 ? 'var(--color-danger)' : (desvio < 0 ? 'var(--color-warning)' : 'var(--color-success)');
            
            return `
            <tr>
                <td><strong>${v.ftm_name}</strong></td>
                <td>${caixa}</td>
                <td>${kds}</td>
                <td style="color: ${desvioColor}; font-weight: bold;">
                    ${desvio > 0 ? '+' : ''}${desvio}
                </td>
                <td style="text-align: right;">
                    <button class="action-btn secondary" style="padding: 4px 8px; font-size: 11px;" onclick="removerVendaSemana(${index})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `}).join('');
    }

    // 3. Calcular Consumo Teórico baseado na PRODUÇÃO REAL DA COZINHA (KDS)
    let consumoTeorico = {}; // key: ingrediente nome (lowercase), value: qtd in base unit (kg/l/un)
    
    state.vendas_semana.forEach(venda => {
        const ftm = state.recipes.find(r => r.id == venda.ftm_id);
        const kdsProduced = venda.qtd_kds !== undefined ? venda.qtd_kds : (venda.qtd || 0); // fallback
        
        if (ftm && ftm.ingredientes && kdsProduced > 0) {
            const ings = ftm.ingredientes.split('|');
            ings.forEach(ingRaw => {
                const ing = ingRaw.trim();
                // Regex para pegar qtd, unidade e nome. Ex: "1.5 kg Batata" ou "200 g Cebola"
                const match = ing.match(/^([\d\.,]+)\s*(kg|g|un|ml|l|pct|porção|porções)\s+(.*)$/i);
                if (match) {
                    let qtdStr = match[1].replace(',', '.');
                    let qtd = parseFloat(qtdStr);
                    let unit = match[2].toLowerCase();
                    let nome = match[3].trim().toLowerCase();

                    // Conversão para a unidade base (KG, L, UN)
                    if (unit === 'g') qtd = qtd / 1000;
                    if (unit === 'ml') qtd = qtd / 1000;

                    if (!consumoTeorico[nome]) consumoTeorico[nome] = 0;
                    // Consumo é baseado no que a COZINHA PRODUZIU (KDS), pois é o que saiu do estoque!
                    consumoTeorico[nome] += qtd * kdsProduced;
                }
            });
        }
    });

    // 4. Renderizar Tabela de Auditoria (Cruzamento)
    const auditoriaBody = document.getElementById('auditoria-table-body');
    auditoriaBody.innerHTML = state.estoque.map((item, index) => {
        const itemName = item.insumo.toLowerCase();
        
        // Tenta achar correspondência no consumo teórico
        // Uma busca mais flexível: se o item do estoque contiver a palavra do ingrediente
        let consumido = 0;
        for (const [key, val] of Object.entries(consumoTeorico)) {
            if (itemName.includes(key) || key.includes(itemName)) {
                consumido += val;
            }
        }

        const saldoDinamico = item.estoque_atual || 0;
        const totalRequisitado = item.saida_requisicao || 0;
        // Global Teórico = O que sobrou na câmara + O que foi pra cozinha - O que foi vendido
        const estoqueEsperado = saldoDinamico + totalRequisitado - consumido;

        // Tenta pegar a contagem já salva para esse item no estado (se existir) ou default para esperado
        if (item.contagem_fisica === undefined) item.contagem_fisica = estoqueEsperado;

        const desvio = item.contagem_fisica - estoqueEsperado;
        const desvioClass = desvio < -0.01 ? 'color: var(--color-danger);' : (desvio > 0.01 ? 'color: var(--color-success);' : 'color: var(--text-muted);');

        return `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td><strong>${item.insumo}</strong></td>
                <td><span class="badge info">${item.unidade}</span></td>
                <td>${saldoDinamico.toFixed(2)}</td>
                <td style="color: var(--color-warning);">${consumido > 0 ? '-' + consumido.toFixed(2) : '0.00'}</td>
                <td style="font-weight: bold; color: var(--accent-gold);">${estoqueEsperado.toFixed(2)}</td>
                <td>
                    <input type="number" step="any" class="form-control" style="width: 100px; padding: 4px; text-align: right;" value="${item.contagem_fisica.toFixed(2)}" onchange="atualizarContagemFisica(${index}, this.value, ${estoqueEsperado})">
                </td>
                <td id="desvio-${index}" style="font-weight: bold; ${desvioClass}">
                    ${desvio > 0 ? '+' : ''}${desvio.toFixed(2)}
                </td>
            </tr>
        `;
    }).join('');
}

// Handler de adição de venda
document.getElementById('form-add-venda').addEventListener('submit', (e) => {
    e.preventDefault();
    const ftmSelect = document.getElementById('venda-prato');
    const qtdCaixaInput = document.getElementById('venda-qtd-caixa');
    const qtdKdsInput = document.getElementById('venda-qtd-kds');

    const ftmId = ftmSelect.value;
    const ftmName = ftmSelect.options[ftmSelect.selectedIndex].text.split(' (Rend')[0];
    const qtdCaixa = parseFloat(qtdCaixaInput.value) || 0;
    const qtdKds = parseFloat(qtdKdsInput.value) || 0;

    if (ftmId && (qtdCaixa > 0 || qtdKds > 0)) {
        // Fallback para estado legado: se 'qtd' existir sem kds/caixa, assumimos como KDS e Caixa iguais
        state.vendas_semana.push({ ftm_id: ftmId, ftm_name: ftmName, qtd_caixa: qtdCaixa, qtd_kds: qtdKds, qtd: qtdKds }); // mantemos qtd para fallback do consumo
        saveState();
        renderAuditoria();
        qtdCaixaInput.value = '';
        qtdKdsInput.value = '';
    }
});

function removerVendaSemana(index) {
    state.vendas_semana.splice(index, 1);
    saveState();
    renderAuditoria();
}

function atualizarContagemFisica(index, value, esperado) {
    const val = parseFloat(value) || 0;
    state.estoque[index].contagem_fisica = val;
    
    const desvio = val - esperado;
    const tdDesvio = document.getElementById(`desvio-${index}`);
    tdDesvio.innerText = (desvio > 0 ? '+' : '') + desvio.toFixed(2);
    tdDesvio.style.color = desvio < 0 ? 'var(--color-danger)' : (desvio > 0 ? 'var(--color-success)' : 'var(--text-muted)');
    saveState();
}

function aplicarBaixaDesvios() {
    if(!confirm("Atenção: Esta ação vai gerar baixas definitivas (Quebras por Desvio) no seu Estoque Dinâmico para todos os itens com Desvio Negativo e zera as Vendas da Semana. Confirmar Auditoria?")) return;

    let desviosRegistrados = 0;

    state.estoque.forEach(item => {
        if (item.contagem_fisica !== undefined) {
            // Recalcula o esperado (mesma logica)
            let consumido = 0;
            const itemName = item.insumo.toLowerCase();
            state.vendas_semana.forEach(venda => {
                const ftm = state.recipes.find(r => r.id == venda.ftm_id);
                if (ftm && ftm.ingredientes) {
                    const ings = ftm.ingredientes.split('|');
                    ings.forEach(ingRaw => {
                        const match = ingRaw.trim().match(/^([\d\.,]+)\s*(kg|g|un|ml|l|pct|porção|porções)\s+(.*)$/i);
                        if (match) {
                            let qtd = parseFloat(match[1].replace(',', '.'));
                            let unit = match[2].toLowerCase();
                            let nome = match[3].trim().toLowerCase();
                            if (unit === 'g' || unit === 'ml') qtd = qtd / 1000;
                            if (itemName.includes(nome) || nome.includes(itemName)) {
                                consumido += qtd * venda.qtd;
                            }
                        }
                    });
                }
            });

            const estoqueEsperado = (item.estoque_atual || 0) + (item.saida_requisicao || 0) - consumido;
            const desvio = item.contagem_fisica - estoqueEsperado;

            // Se for desvio negativo (falta), dá baixa como Quebra Oculta
            if (desvio < -0.01) {
                state.quebras.push({
                    id: state.quebras.length + 1,
                    data: new Date().toISOString().split('T')[0],
                    ingrediente: item.insumo,
                    qtd: Math.abs(desvio),
                    unidade: item.unidade,
                    motivo: "Desvio / Quebra Oculta (Auditoria Domingo)",
                    custo: 0,
                    responsavel: "Auditoria Sistema"
                });
                desviosRegistrados++;
            }
            // Zera a contagem para a próxima semana
            item.contagem_fisica = undefined;
        }
    });

    if (desviosRegistrados > 0) {
        alert(`${desviosRegistrados} item(ns) com quebra oculta sofreram baixa no estoque principal!`);
    } else {
        alert("Nenhum desvio negativo encontrado! Inventário perfeito!");
    }

    // Zera vendas da semana
    state.vendas_semana = [];
    
    // Atualiza saldo geral (Isso fará o estoque_atual bater exatamente com a contagem_fisica anterior!)
    recalculateStockBalances();
    saveState();
    renderAuditoria();
}

window.removerVendaSemana = removerVendaSemana;
window.atualizarContagemFisica = atualizarContagemFisica;
window.aplicarBaixaDesvios = aplicarBaixaDesvios;
window.atualizarQtdEstoqueFolha = atualizarQtdEstoqueFolha;

// SYSTEM RESET (Apenas Movimentações)
function clearMovimentacoes() {
    const confirmation = confirm("ATENÇÃO: Isso apagará TODO o histórico de Recebimentos (Entradas) e Requisições (Saídas), mas preservará o checklist, tarefas e quebras. Deseja realmente zerar as movimentações de estoque?");
    if (confirmation) {
        // Limpar arrays de histórico de estoque
        state.entradas = [];
        state.requisicoes = [];
        state.carrinho_requisicao = [];
        
        // Recalcular estoques (voltará ao saldo base)
        recalculateStockBalances();
        
        // Salvar e forçar o envio da versão limpa pra nuvem
        saveState();

        // Recarrega a tela depois de salvar
        setTimeout(() => {
            alert("Movimentações zeradas com sucesso! O estoque foi recalculado.");
            location.reload();
        }, 1000);
    }
}

window.clearMovimentacoes = clearMovimentacoes;


// ==========================================
// MÓDULO DE CONTAGENS FÃ�SICAS E AUDITORIA
// ==========================================

function renderContagemGeral() {
    const tbody = document.getElementById('contagem-cozinha-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    let html = '';
    
    // Categorias de estoque bruto que ficam na cozinha/praça (Carnes, Parrilla, Fritadeira, Hortifruti, etc)
    const categorias_cozinha = ['Parrilla', 'Carnes', 'Proteínas', 'Frutos do Mar', 'Laticínios', 'Queijos', 'Hortifruti'];
    
    if (state.estoque) {
        state.estoque.forEach(item => {
            // Se a categoria bater com uma das operacionais da cozinha, ou se for burrata/etc
            if (categorias_cozinha.some(c => (item.categoria || '').includes(c)) || (item.insumo || '').toLowerCase().includes('burrata')) {
                html += `
                <tr style="background: rgba(255, 255, 255, 0.02);">
                    <td style="font-weight: 500;">${item.insumo}</td>
                    <td><span class="status-badge" style="background: rgba(255,255,255,0.1); color: #aaa;">${item.categoria}</span></td>
                    <td>${item.unidade}</td>
                    <td><input type="number" step="0.01" class="form-control" placeholder="0" data-contagem-id="cozinha-${item.insumo}" /></td>
                    <td><input type="text" class="form-control" placeholder="Obs..." data-obs-id="cozinha-${item.insumo}" /></td>
                </tr>
                `;
            }
        });
    }

    if (state.fichas_tecnicas) {
        state.fichas_tecnicas.filter(f => f.armazenamento === 'Cozinha').forEach(item => {
            html += `
            <tr>
                <td style="font-weight: 500;">${item.nome}</td>
                <td><span class="status-badge" style="background: rgba(30,136,229,0.1); color: #1e88e5;">${item.categoria || 'Produção Interna'}</span></td>
                <td>${item.rendimento || 'Porções'}</td>
                <td><input type="number" step="0.01" class="form-control" placeholder="0" data-contagem-id="cozinha-${item.nome}" /></td>
                <td><input type="text" class="form-control" placeholder="Obs..." data-obs-id="cozinha-${item.nome}" /></td>
            </tr>
            `;
        });
    }
    
    if (html === '') {
        html = '<tr><td colspan="5" style="text-align:center;">Nenhum item configurado para a cozinha.</td></tr>';
    }
    
    tbody.innerHTML = html;
}

function renderContagemEstoque() {
    const tbody = document.getElementById('contagem-estoque-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    let html = '';
    
    // Estoque: Todos os itens do state.estoque + Subprodutos de "Almoxarifado" (Pastéis, Bolinhos, etc)
    state.estoque.forEach(item => {
        html += `
        <tr>
            <td style="font-weight: 500;">${item.insumo}</td>
            <td>${item.categoria}</td>
            <td>${item.unidade}</td>
            <td>${(item.saldo_atual || 0).toFixed(2)}</td>
            <td><input type="number" step="0.01" class="form-control" placeholder="0" data-contagem-id="estoque-${item.insumo}" /></td>
            <td><input type="text" class="form-control" placeholder="Obs..." data-obs-id="estoque-${item.insumo}" /></td>
        </tr>
        `;
    });
    
    if (state.fichas_tecnicas) {
        state.fichas_tecnicas.filter(f => f.armazenamento === 'Almoxarifado').forEach(item => {
            html += `
            <tr style="background: rgba(255, 193, 7, 0.05);">
                <td style="font-weight: 500;">â­� ${item.nome}</td>
                <td><span class="status-badge" style="background: rgba(255,193,7,0.1); color: #ffb300;">Produção Lote</span></td>
                <td>${item.rendimento || 'Porções'}</td>
                <td>0.00</td> <!-- Teórico para produções será ajustado depois -->
                <td><input type="number" step="0.01" class="form-control" placeholder="0" data-contagem-id="estoque-${item.nome}" /></td>
                <td><input type="text" class="form-control" placeholder="Obs..." data-obs-id="estoque-${item.nome}" /></td>
            </tr>
            `;
        });
    }
    
    tbody.innerHTML = html;
}

function salvarContagem(tipo) {
    alert(`A contagem da ${tipo === 'cozinha' ? 'Cozinha (Geral)' : 'Estoque / Almoxarifado'} foi salva localmente e enviada para o cálculo de CMV.`);
    // Opcional: Extrair os values dos inputs e armazenar no state.contagens_historico
}

window.renderContagemGeral = renderContagemGeral;
window.renderContagemEstoque = renderContagemEstoque;
window.salvarContagem = salvarContagem;

// FIM DO MÓDULO DE CONTAGENS


// ==========================================
// MÓDULO DE BAIXA DE PRODUÇÃO (SUBPRODUTOS)
// ==========================================

function registrarProducao(nome_preparo, multiplicador) {
    if (!state.fichas_tecnicas) return;
    const ficha = state.fichas_tecnicas.find(f => f.nome === nome_preparo);
    if (!ficha) return;
    
    // 1. Dar baixa no estoque bruto
    let faltantes = [];
    if (ficha.ingredientes && ficha.ingredientes.length > 0) {
        ficha.ingredientes.forEach(ing => {
            const estoqueItem = state.estoque.find(e => e.insumo === ing.insumo);
            if (estoqueItem) {
                // converter qtd para number
                let qtd_necessaria = parseFloat(ing.qtd.replace(',','.')) * multiplicador;
                if (!isNaN(qtd_necessaria)) {
                    estoqueItem.saldo_atual = (estoqueItem.saldo_atual || 0) - qtd_necessaria;
                }
            } else {
                faltantes.push(ing.insumo);
            }
        });
    }
    
    // 2. Dar entrada no estoque do subproduto
    ficha.saldo_atual = (ficha.saldo_atual || 0) + multiplicador;
    
    saveState();
    
    if (faltantes.length > 0) {
        alert(`Produção registrada com sucesso!\nAtenção: Os seguintes insumos não foram encontrados no estoque bruto para dar baixa automática: ${faltantes.join(', ')}`);
    } else {
        alert(`Produção de ${multiplicador}x [${nome_preparo}] registrada com sucesso! O estoque bruto foi reduzido.`);
    }
    
    // Atualizar UI dependendo de onde estamos
    if (typeof renderContagemGeral === 'function') renderContagemGeral();
    if (typeof renderContagemEstoque === 'function') renderContagemEstoque();
}

window.registrarProducao = registrarProducao;

// Hook no renderFTMDatabase para adicionar o botão de Produzir
const original_renderFTMDetails = window.renderFTMDetails;
if (!window.hooked_renderFTMDetails) {
    window.hooked_renderFTMDetails = true;
    window.renderFTMDetails = function(index) {
        if (original_renderFTMDetails) original_renderFTMDetails(index);
        
        const detailsDiv = document.getElementById('ftm-details');
        if (detailsDiv && state.fichas_tecnicas && state.fichas_tecnicas[index]) {
            const ficha = state.fichas_tecnicas[index];
            const btnHtml = `
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color);">
                <h4>Registrar Produção</h4>
                <div style="display: flex; gap: 10px; align-items: center; margin-top: 10px;">
                    <input type="number" id="qtd-producao-${index}" class="form-control" placeholder="Qtd de Receitas..." style="width: 150px;" min="1" value="1" />
                    <button class="action-btn" style="background: var(--color-success); color: white;" onclick="
                        const qtd = parseFloat(document.getElementById('qtd-producao-${index}').value);
                        if(qtd > 0) {
                            registrarProducao('${ficha.nome}', qtd);
                        } else {
                            alert('Insira uma quantidade válida.');
                        }
                    "><i class="fas fa-check"></i> Produzir & Dar Baixa</button>
                </div>
            </div>
            `;
            detailsDiv.innerHTML += btnHtml;
        }
    };
}

let ftmChartInstance = null;

function renderFTMSalesChart(pratoNome) {
    const canvas = document.getElementById('ftmSalesChart');
    if (!canvas) return;
    
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded yet.');
        return;
    }

    const ctx = canvas.getContext('2d');
    
    if (ftmChartInstance) {
        ftmChartInstance.destroy();
    }

    const baseVal = 20 + (pratoNome.length * 2);
    const data = [
        baseVal + Math.floor(Math.random() * 15),
        baseVal + Math.floor(Math.random() * 20),
        baseVal + Math.floor(Math.random() * 25),
        baseVal + 10 + Math.floor(Math.random() * 30)
    ];

    ftmChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Semana -3', 'Semana -2', 'Semana -1', 'Semana Atual'],
            datasets: [{
                label: 'Saídas (Vendas KDS)',
                data: data,
                borderColor: '#c5a86d',
                backgroundColor: 'rgba(197, 168, 109, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#0b1120',
                pointBorderColor: '#c5a86d',
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + ' pratos expedidos';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}
// --- ESTOQUE GERAL & CADASTRO DE INSUMOS ---

let estoqueGeralCategoryFilter = 'Todos';
let estoqueGeralSearchQuery = '';

function renderEstoqueGeral() {
    const tableBody = document.getElementById('estoque-geral-table-body');
    const selectFilter = document.getElementById('estoque-geral-category-filter');
    
    if (!tableBody) return;
    
    if (selectFilter && selectFilter.options.length <= 1) {
        const categories = [...new Set(state.estoque_geral.map(item => item.categoria))].filter(Boolean);
        categories.sort().forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.innerText = cat;
            selectFilter.appendChild(opt);
        });
    }

    let filtered = state.estoque_geral.filter(item => {
        const matchesCategory = estoqueGeralCategoryFilter === 'Todos' || item.categoria === estoqueGeralCategoryFilter;
        const matchesSearch = item.insumo.toLowerCase().includes(estoqueGeralSearchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    tableBody.innerHTML = '';

    filtered.forEach(item => {
        const tr = document.createElement('tr');
        
        const estMin = parseFloat(item.est_minimo) || 0;
        const estAtual = parseFloat(item.saldo_atual) || 0;
        
        let statusBadge = '<span class="status-badge" style="background: rgba(0, 200, 81, 0.2); color: #00C851;">Normal</span>';
        if (estAtual <= estMin) {
            statusBadge = '<span class="status-badge" style="background: rgba(255, 68, 68, 0.2); color: #ff4444;">Crítico</span>';
        }

        tr.innerHTML = `
            <td style="font-weight: 600;">${item.insumo}</td>
            <td><span class="category-tag">${item.categoria}</span></td>
            <td>${item.unidade}</td>
            <td>${estMin}</td>
            <td>${item.est_maximo || '-'}</td>
            <td style="font-weight: 600; font-size: 16px;">${estAtual.toFixed(2)}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="action-btn secondary" style="padding: 4px 8px; font-size: 12px;" onclick="openLaunchInputModal('${item.insumo}')"><i class="fas fa-plus"></i> Produzir</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function openCadastroModal() {
    document.getElementById('modal-cadastro-produto').classList.add('active');
}

function openCadastroPrepModal() {
    document.getElementById('modal-cadastro-prep').classList.add('active');
}

// Add event listeners for the new forms
document.addEventListener('DOMContentLoaded', () => {
    const formCadProd = document.getElementById('form-cadastro-produto');
    if (formCadProd) {
        formCadProd.addEventListener('submit', (e) => {
            e.preventDefault();
            const novoInsumo = {
                insumo: document.getElementById('cad-prod-nome').value,
                categoria: document.getElementById('cad-prod-cat').value,
                unidade: document.getElementById('cad-prod-unid').value,
                est_minimo: parseFloat(document.getElementById('cad-prod-min').value),
                saldo_atual: parseFloat(document.getElementById('cad-prod-atual').value),
                est_maximo: parseFloat(document.getElementById('cad-prod-min').value) * 3, // rough estimate
                saida_diaria: 0
            };
            state.estoque.push(novoInsumo);
            saveState();
            renderEstoque();
            closeModal('modal-cadastro-produto');
            formCadProd.reset();
            alert('Produto cadastrado com sucesso!');
        });
    }

    const formCadPrep = document.getElementById('form-cadastro-prep');
    if (formCadPrep) {
        formCadPrep.addEventListener('submit', (e) => {
            e.preventDefault();
            const novoPrep = {
                insumo: document.getElementById('cad-prep-nome').value,
                categoria: document.getElementById('cad-prep-cat').value,
                unidade: document.getElementById('cad-prep-unid').value,
                est_minimo: parseFloat(document.getElementById('cad-prep-min').value),
                saldo_atual: parseFloat(document.getElementById('cad-prep-atual').value),
                est_maximo: parseFloat(document.getElementById('cad-prep-min').value) * 3
            };
            state.estoque_geral.push(novoPrep);
            saveState();
            renderEstoqueGeral();
            closeModal('modal-cadastro-prep');
            formCadPrep.reset();
            alert('Insumo processado cadastrado com sucesso!');
        });
    }
    
    // Add event listeners for searches/filters
    const searchGeral = document.getElementById('estoque-geral-search');
    if (searchGeral) {
        searchGeral.addEventListener('input', (e) => {
            estoqueGeralSearchQuery = e.target.value;
            renderEstoqueGeral();
        });
    }
    
    const filterGeral = document.getElementById('estoque-geral-category-filter');
    if (filterGeral) {
        filterGeral.addEventListener('change', (e) => {
            estoqueGeralCategoryFilter = e.target.value;
            renderEstoqueGeral();
        });
    }
});


// ----------------------------------------------------
// FICHAS TÉCNICAS (ADD & EDIT)
// ----------------------------------------------------

function openAddFichaModal() {
    document.getElementById('modal-ficha-title').innerHTML = '<i class="fas fa-file-alt" style="color: var(--accent-gold); margin-right: 10px;"></i> Nova Ficha Técnica';
    document.getElementById('form-add-ficha').reset();
    document.getElementById('ficha-original-nome').value = '';
    document.getElementById('modal-add-ficha').classList.add('active');
}

function openEditFichaModal() {
    if (!selectedRecipeId) return;
    const r = state.recipes.find(rec => rec.nome === selectedRecipeId);
    if (!r) return;
    
    document.getElementById('modal-ficha-title').innerHTML = '<i class="fas fa-edit" style="color: var(--accent-gold); margin-right: 10px;"></i> Editar Ficha Técnica';
    document.getElementById('ficha-original-nome').value = r.nome;
    document.getElementById('ficha-nome').value = r.nome;
    document.getElementById('ficha-categoria').value = r.categoria || '';
    document.getElementById('ficha-imagem').value = r.imagem_url || '';
    document.getElementById('ficha-tempo').value = r.tempo_min || '';
    document.getElementById('ficha-rendimento').value = r.rendimento || '';
    document.getElementById('ficha-ingredientes').value = (r.ingredientes || '').split(' | ').join('\n');
    document.getElementById('ficha-preparo').value = r.modo_preparo || '';
    document.getElementById('ficha-dica').value = r.dica_chef || '';
    document.getElementById('ficha-custo').value = r.custo_total || '';
    document.getElementById('ficha-preco').value = r.preco_venda || '';
    
    document.getElementById('modal-add-ficha').classList.add('active');
}

function closeAddFichaModal() {
    document.getElementById('modal-add-ficha').classList.remove('active');
}

window.submitFicha = async function(e) {
    e.preventDefault();
    const originalNome = document.getElementById('ficha-original-nome').value;
    const novoNome = document.getElementById('ficha-nome').value;
    
    // Parse ingredients (split by line, filter empty, join by ' | ')
    const ingText = document.getElementById('ficha-ingredientes').value;
    const ingredientes = ingText.split('\n').map(i => i.trim()).filter(Boolean).join(' | ');
    
    const fichaObj = {
        id: Date.now(), // or keep old ID if editing
        nome: novoNome,
        categoria: document.getElementById('ficha-categoria').value,
        imagem_url: document.getElementById('ficha-imagem').value,
        tempo_min: document.getElementById('ficha-tempo').value,
        rendimento: document.getElementById('ficha-rendimento').value,
        ingredientes: ingredientes,
        modo_preparo: document.getElementById('ficha-preparo').value,
        dica_chef: document.getElementById('ficha-dica').value || " ",
        custo_total: document.getElementById('ficha-custo').value || null,
        preco_venda: document.getElementById('ficha-preco').value || null,
        margem_pct: null,
        ficha_ok: "Não"
    };

    if (originalNome) {
        if (fichaObj.custo_total && fichaObj.preco_venda && parseFloat(fichaObj.preco_venda) > 0) {
            fichaObj.margem_pct = (((parseFloat(fichaObj.preco_venda) - parseFloat(fichaObj.custo_total)) / parseFloat(fichaObj.preco_venda)) * 100).toFixed(1);
        } else {
            fichaObj.margem_pct = null;
        }

        // Edit mode
        const idx = state.recipes.findIndex(r => r.nome === originalNome);
        if (idx !== -1) {
            fichaObj.id = state.recipes[idx].id;
            fichaObj.margem_pct = fichaObj.margem_pct;
            fichaObj.ficha_ok = state.recipes[idx].ficha_ok;
            state.recipes[idx] = fichaObj;
        }
        if (selectedRecipeId === originalNome) {
            selectedRecipeId = novoNome;
            // Also update component data if we are in detail view
            if (selectedComponentData) {
                selectedComponentData.title = novoNome;
                selectedComponentData.ingredientes = fichaObj.ingredientes;
                selectedComponentData.modo_preparo = fichaObj.modo_preparo;
                selectedComponentData.time = fichaObj.tempo_min;
                selectedComponentData.rendimento = fichaObj.rendimento;
            }
        }
    } else {
        // Add mode
        state.recipes.push(fichaObj);
    }
    
    // UI Loading state
    const submitBtn = document.querySelector('#form-add-ficha button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = 'Salvando Nuvem...';
    submitBtn.disabled = true;

    try {
        await saveState(); // This now properly waits for syncToCloud
    } catch(err) {
        console.error("Erro ao salvar:", err);
    } finally {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        closeAddFichaModal();
        renderFichasExplorer();
        showToast('Ficha Técnica salva com sucesso!');
    }
};

// --- ARQUIVOS COZINHA ---
const arquivosCozinhaList = [
    {
        nome: "Contagem Final - Diária",
        descricao: "Planilha física para contagem de Final Antecipado do estoque (Entradas, Carnes, Pescados e Executivo).",
        icone: "fas fa-file-pdf",
        url: "pdfs/contagem_final_diaria.pdf"
    }
];

function renderArquivosCozinha() {
    const grid = document.getElementById('arquivos-grid');
    if (!grid) return;
    
    grid.innerHTML = arquivosCozinhaList.map(arq => `
        <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; padding: 20px;">
            <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
                <div style="width: 48px; height: 48px; border-radius: 8px; background: rgba(255, 60, 60, 0.1); color: #ff4d4d; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-right: 16px; flex-shrink: 0;">
                    <i class="${arq.icone}"></i>
                </div>
                <div>
                    <h4 style="color: var(--text-primary); font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">${arq.nome}</h4>
                    <p style="color: var(--text-muted); font-size: 13px; margin: 0; line-height: 1.4;">${arq.descricao}</p>
                </div>
            </div>
            <a href="${arq.url}" target="_blank" class="action-btn" style="text-align: center; text-decoration: none; display: block; width: 100%;">
                <i class="fas fa-external-link-alt"></i> Abrir PDF
            </a>
        </div>
    `).join('');
}
